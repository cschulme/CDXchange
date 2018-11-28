// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const { check, validationResult } = require('express-validator/check');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const ItemModel = require('../models/Item');
const UserModel = require('../models/User');
const OfferModel = require('../models/Offer');
const ItemFeedbackModel = require('../models/ItemFeedback');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// --- ROUTES ---

// Log in.
app.post('/signin', urlencodedParser, [
    check('username')
        .exists()
        .isLength({ min: 1 }).withMessage("Username must not be empty.")
        .trim()
        .escape(),
    check('password')
        .exists()
        .isLength({ min: 1 }).withMessage("Password must not be empty.")
        .trim()
        .escape()
], (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('422', { title: "CDXchange | 422: Unprocessable Entity", errors: errors.array() });
    }

    UserModel.getUserByUsername(req.body.username)
        .then(user => hashedPassword = sha256(req.body.password, user.password.salt))
        .then(hashedPassword => UserModel.login(req.body.username, hashedPassword.passwordHash))
        .then(user => req.session.theUser = user)
        .then(() => {
            if(req.body.cameFromError) {
                res.redirect('/');
            } else {
                res.redirect('back');
            }
        })
        .catch(() => {
            res.render('loginError', { title: "CDXchange | Login Error ", fromError: true });
        });
});

// Sign out.
app.get('/signout', (req, res) => {
    if(req.session.theUser) {
        req.session.theUser = undefined;
    }
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('register', { title: "CDXchange | My CDs", errors: undefined });
});

app.post('/register', urlencodedParser, [
    check('username')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Username: 'Username' was left blank.")
        .custom(value => {
            return UserModel.getUserByUsername(value)
                .then(user => {
                    if(user == null) {
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch(err => {
                    console.error(err);
                    return false;
                })
        }).withMessage("Username: That username is already taken.")
        .trim(),
    check('password')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Password: 'Password' was left blank.")
        .trim(),
    check('passwordConfirm')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Password: 'Retype Password' was left blank.")
        .custom((value, { req }) => value == req.body.password).withMessage("Password: The two password fields don't match.")
        .trim(),
    check('firstName')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("First Name: 'First Name' was left blank.")
        .isString()
        .trim(),
    check('lastName')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Last Name: 'Last Name' was left blank.")
        .isString()
        .trim(),
    check('email')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Email: 'Email' was left blank.")
        .isEmail().withMessage("Email: Your input does not appear to be an email.")
        .trim()
        .normalizeEmail(),
    check('address1')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Address: 'Address' was left blank.")
        .isString()
        .trim(),
    check('address2')
        .trim(),
    check('city')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("City: 'City' was left blank.")
        .isString()
        .trim(),
    check('area')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("State/Province: 'State/Province' was left blank.")
        .isString()
        .trim(),
    check('postalCode')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Postal Code: 'Postal Code' was left blank.")
        .isInt().withMessage("Postal Code: You did not pass a valid postal code.")
        .trim(),
    check('country')
        .custom(value => {
            if(value && value != '') {
                return true;
            } else {
                return false;
            }
        }).withMessage("Country: 'Country' was left blank.")
        .isString()
        .trim()
], (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return registrationError(req, res, errors);
    } else {
        let salt = generateSalt(16);
        let hash = sha256(req.body.password, salt);

        UserModel.addUser(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.address1,
            req.body.address2,
            req.body.city,
            req.body.area,
            req.body.postalCode,
            req.body.country,
            req.body.username,
            hash.passwordHash,
            salt,
            []
        )
            .then(user => {
                req.session.theUser = user;
                res.redirect('/myItems');
            })
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    }    
});

app.get('/profile', (req, res) => {
    if(req.query.user) {
        return viewProfile(req, res, req.query.user);
    } else {
        res.redirect('/404');
    }
});

app.get('/myitems', function(req, res) {
    if(req.session.theUser && req.query.action && req.query.theItem) {
        if(req.query.action == 'update') {
            return updateItem(req, res, req.query.theItem);
        } else if(req.query.action == 'delete') {
            return deleteItem(req, res, req.query.theItem);
        } else {
            res.redirect('/404');
        }
    } else if(req.session.theUser) {
        return viewMyItems(req, res);
    } else {
        res.render('myItems', { title: "CDXchange | My CDs", items: undefined, allItems: undefined });
    }
})

app.get('/myswaps', (req, res) => {
    if(req.session.theUser && req.query.action && req.query.theOffer) {
        if(req.query.action == 'offer') {
            return makeOfferToUser(req, res, req.query.theOffer);
        } else if(req.query.action == 'withdrawOwnOffer') {
            return withdrawOwnOffer(req, res, req.query.theOffer);
        } else if(req.query.action == 'withdrawOtherOffer') {
            return withdrawOtherOffer(req, res, req.query.theOffer);
        } else if(req.query.action == 'accept') {
            return acceptOffer(req, res, req.query.theOffer);
        } else if(req.query.action == 'reject') {
            return rejectOffer(req, res, req.query.theOffer);
        } else {
            res.redirect('/mySwaps');
        }
    } else if(req.session.theUser) {
        return viewMySwaps(req, res);
    } else {
        let mySwaps = undefined;
        res.render('mySwaps', { title: "CDXchange | My Swaps", mySwaps: mySwaps });
    }
});

app.get('/addItem', (req, res) => {
    if(req.session.theUser && req.query.item) {
        ItemModel.doesItemExist(req.query.item)
            .then(() => UserModel.addUserItemById(req.session.theUser._id, req.query.item))
            .then(user => req.session.theUser = user)
            .then(() => res.redirect('/myitems'))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            });
    } else {
        res.redirect('/404');
    }
});

app.get('/mySwaps/createSwap', (req, res) => {
    if(req.session.theUser) {
        let results = new Array();

        ItemModel.getItems(req.session.theUser.userItems)
            .then(myItems => {
                results.push(myItems);
                return results;
            })
            .then(results => {
                return OfferModel.getOffersByUserId(req.session.theUser._id)
                    .then(offers => {
                        results.push(offers);
                        return results;
                    })
            })
            .then(results => {
                let swappableItems = new Array();

                results[0].forEach(item => {
                    let involvedInSwap = false;

                    results[1].forEach(offer => {
                        if(offer._ownedItemId == item._id && offer.status != 'Swapped') {
                            involvedInSwap = true;
                        }
                    });

                    if(involvedInSwap == false) {
                        swappableItems.push(item);
                    }
                })

                results.push(swappableItems);
                return results;
            })
            .then(results => {
                return ItemModel.getItemsNotInArray(req.session.theUser.userItems)
                    .then(items => {
                        results.push(items);
                        return results;
                    })
            })
            .then(results => {
                res.render('createSwap', { title: 'CDXchange | Create Swap', myItems: results[2], otherItems: results[3], userItems: results[0] });
            })
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            });
    } else {
        let message = "You must be logged in to view this page.";
        res.status(403).render('403', { title: "CDXchange | 403: Access Denied", message: message });
    }
});

app.post('/mySwaps/createSwap', urlencodedParser, [
    check('ownedItem').exists(),
    check('wantedItem').exists()
], (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).render('422', { title: "CDXchange | 422: Unprocessable Entity", errors: errors.array() });
        }

        OfferModel.addOffer(req.session.theUser._id, req.body.ownedItem, req.body.wantedItem, undefined, 'Available')
            .then(() => {
                res.redirect('/mySwaps');
            })
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            });
});

// --- FUNCTIONS ---
// Validates that the item exists in the database.

/**
 * updateItem(req, res, itemId) - Handles the update action of a user item.
 * @param {Request} req  - The request object.
 * @param {Response} res - The response object.
 * @param {String} itemId - The id of the item to update.
 */
function updateItem(req, res, itemId) {
    let owned = false;

    req.session.theUser.userItems.forEach(item => {
        if(item == itemId) {
            owned = true;
        }
    });

    if(owned == true) {
        OfferModel.getOfferByUserIdAndOwnedItem(req.session.theUser._id, itemId)
            .then(offer => {
                let results = new Array();
                results.push(offer);
                
                return ItemModel.getItem(itemId)
                    .then(item => {
                        results.push(item);
                        return results;
                    })
            })
            .then(results => {
                offer = results[0];
                item = results[1];

                if(offer == null || offer.status == 'Available' || offer.status == 'Swapped') {
                    var path = item.catalogCategory + '/' + item._id;
                    res.redirect('/categories/' + path);
                } else if(offer.status == 'Pending') {
                    res.redirect('/myswaps');
                }
            })
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else {
        res.redirect('/404');
    }
}

/**
 * deleteItem(req, res, itemId) - Handles the delete action of a user item.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {String} itemId- The id of the item to delete.
 */
function deleteItem(req, res, itemId) {
    UserModel.removeUserItemById(req.session.theUser._id, itemId)
        .then(user => req.session.theUser = user)
        .then(() => {
            return OfferModel.getOfferByUserIdAndOwnedItem(req.session.theUser._id, itemId)
        })
        .then(offer => {
            if(offer != null) {
                return OfferModel.deleteOffer(offer._id);
            } else {
                return;
            }
        })
        .then(() => res.redirect('/myitems'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * viewMyItems(req, res) - Function to handle viewing the user's dashboard.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
function viewMyItems(req, res) {
    let results = new Array();

    ItemModel.getItems(req.session.theUser.userItems)
        .then(items => {
            results.push(items);

            return ItemModel.getItemsNotInArray(req.session.theUser.userItems)
                .then(otherItems => {
                    results.push(otherItems);
                    return results;
                })
        })
        .then(results => {
            res.render('myItems', { title: "CDXchange | My CDs", items: results[0], allItems: results[1] })
        })
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * viewMySwaps(req, res) - Controls the mySwap views.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
function viewMySwaps(req, res) {
    let results = new Array();

    OfferModel.getOffersByUserId(req.session.theUser._id)
        // Push the user's owned offers to results.
        .then(offers => {
            results.push(offers);
            return results;
        })
        // Push the items associated with those offers to results.
        .then(results => {
            let itemIdHolder = new Array();

            results[0].forEach(offer => {
                itemIdHolder.push(offer._ownedItemId);
                itemIdHolder.push(offer._wantedItemId);
            })

            return ItemModel.getItems(itemIdHolder)
                .then(items => {
                    results.push(items);
                    return results;
                })
        })
        // Push the other offers to results.
        .then(results => {
            return OfferModel.getOffersFromOtherUsers(req.session.theUser._id)
                .then(offers => {
                    results.push(offers);
                    return results;
                })
        })
        // Push the items associated with those offers to results.
        .then(results => {
            let itemIdHolder = new Array();

            results[2].forEach(offer => {
                itemIdHolder.push(offer._ownedItemId);

                if(offer._wantedItemId != undefined) {
                    itemIdHolder.push(offer._wantedItemId);
                }
            })

            return ItemModel.getItems(itemIdHolder)
                .then(items => {
                    results.push(items);
                    return results;
                })
        })
        // Get the users for the user's owned offers.
        .then(results => {
            let userIdHolder = new Array();

            results[0].forEach(offer => {
                if(offer._otherUserId != undefined) {
                    userIdHolder.push(offer._otherUserId);
                }
            })

            return UserModel.getUsersInSetOfIds(userIdHolder)
                .then(users => {
                    results.push(users);
                    return results;
                })
        })
        // Get the users for the other users' owned offers.
        .then(results => {
            let userIdHolder = new Array();

            results[2].forEach(offer => {
                userIdHolder.push(offer._userId);

                if(offer._otherUserId != undefined) {
                    userIdHolder.push(offer._otherUserId);
                }
            })

            return UserModel.getUsersInSetOfIds(userIdHolder)
                .then(users => {
                    results.push(users);
                    results.push(req.session.theUser.userItems);
                    return results;
                })
        })
        .then(results => res.render('mySwaps', { title: "CDXchange | My Swaps", myOffers: results[0], myOffersItems: results[1], otherOffers: results[2], otherOffersItems: results[3], myUsers: results[4], otherUsers: results[5], myItems: results[6] }))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * makeOfferToUser(req, res, offerId) - Controls the action for the offer button on '/mySwaps'.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function makeOfferToUser(req, res, offerId) {
    OfferModel.matchFound(offerId, req.session.theUser._id)
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * withdrawOwnOffer(req, res, offerId) - Withdraws a user's owned offer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function withdrawOwnOffer(req, res, offerId) {
    OfferModel.deleteOffer(offerId)
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * withdrawOtherOffer(req, res, offerId) - Withdraw from another user's offer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function withdrawOtherOffer(req, res, offerId) {
    OfferModel.matchRescinded(offerId)
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * acceptOffer(req, res, offerId) - Handles accepting an offer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function acceptOffer(req, res, offerId) {
    OfferModel.getOfferById(offerId)
        .then(offer => {
            if(offer == null || offer.status != 'Pending' || offer._userId != req.session.theUser._id) {
                res.redirect('/404');
            } else {
                return offer;
            }
        })
        .then(offer => {
            return UserModel.addUserItemById(offer._otherUserId, offer._ownedItemId)
                .then(() => offer);
        })
        .then(offer => {
            return UserModel.removeUserItemById(offer._otherUserId, offer._wantedItemId)
                .then(() => offer);
        })
        .then(offer => {
            return UserModel.addUserItemById(req.session.theUser._id, offer._wantedItemId)
                .then(() => offer);
        })
        .then(offer => {
            return UserModel.removeUserItemById(req.session.theUser._id, offer._ownedItemId)
                .then(() => offer)
        })
        .then(offer => {
            return OfferModel.updateStatus(offer._id, 'Swapped')
        })
        .then(() => {
            return UserModel.getUserById(req.session.theUser._id)
                .then(user => req.session.theUser = user)
        })
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * rejectOffer(req, res, offerId) - Handles rejecting an offer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function rejectOffer(req, res, offerId) {
    OfferModel.matchRescinded(offerId)
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * viewProfile(req, res, userId) - Handles viewing a user's profile.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} userId - The userId from the parameter.
 */
function viewProfile(req, res, userId) {
    let results = new Array();

    UserModel.getUserById(userId)
        .then(user => {
            if(user != null) {
                let title = "CDXchange | " + user.username + "'s Profile";
                results.push(title);
                results.push(user);

                return results;
            } else {
                let message = "This user does not exist.";
                res.status(404).render('404', { title: 'CDXchange | 404: Page Not Found', message: message });
            }
        })
        .then(results => {
            return ItemFeedbackModel.getFeedbackByUser(userId, 3)
                .then(feedback => {
                    results.push(feedback);
                    return results;
                })
        })
        .then(results => {
            let itemIds = new Array();

            results[2].forEach(review => itemIds.push(review._itemId));

            return ItemModel.getItems(itemIds)
                .then(items => {
                    results.push(items);
                    return results;
                })
        })
        .then(results => {
            return ItemModel.getItems(results[1].userItems)
                .then(items => {
                    results.push(items);
                    return results;
                })
        })
        .then(results => {
            return ItemFeedbackModel.getNumberOfReviewsByUser(userId)
                .then(count => {
                    results.push(count);
                    return results;
                })
        })
        .then(results => {
            return OfferModel.getNumberOfOffersInvolvingAUser(userId)
                .then(count => {
                    results.push(count);
                    return results;
                })
        })
        .then(results => {
            res.render('profile', { title: results[0], user: results[1], recentFeedback: results[2], recentFeedbackItems: results[3], userItems: results[4], reviewCount: results[5], swapCount: results[6] });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/404');
        })
}

/**
 * registrationError(req, res, errors) - Handles registration errors.
 * @param {Request} req - The request object. 
 * @param {Response} res - The response object.
 * @param {Object} errors - The errors object.
 */
function registrationError(req, res, errors) {
    // Cast the errors into an array.
    let errorArray = errors.array();

    // Create a map of the user's input.
    let userInputMap = new Map();

    let userInput = Object.entries(req.body);

    for(let [field, value] of userInput) {
        if(field != 'password' && field != 'passwordConfirm') {
            userInputMap.set(field, value);
        }
    }

    // Create an array of fields that had errors.
    let errorParams = new Array();

    errorArray.forEach(error => {
        errorParams.push(error.param);
    })

    res.render('register', { title: "CDXchange | My CDs", errors: errorArray, errorParams: errorParams, userInput: userInputMap });
}

// --- PASSWORD FUNCTIONS ---
/**
 * generateSalt(length) - Generates a random string of the given length to be used as a salt.
 * @param {Number} length - The length of the random string to be generated.
 * @returns {String} 
 */
function generateSalt(length) {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * sha256(password, salt) - Hashes a password with a salt using sha256.
 *      Returns an object with the salt and the password hash.
 * @param {String} password - The password to be hashed.
 * @param {String} salt - The salt value to be used, refer to generateSalt.
 * @returns {Object}
 */
function sha256(password, salt) {
    let hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    let value = hash.digest('hex');

    return {
        salt: salt,
        passwordHash: value
    };
}