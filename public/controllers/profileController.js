// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const { check, validationResult } = require('express-validator/check');
const bodyParser = require('body-parser');
const ItemModel = require('../models/Item');
const UserModel = require('../models/User');
const OfferModel = require('../models/Offer');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

// --- ROUTES ---
// Sign in.
app.get('/signin*', (req, res) => {
    if(!req.session.theUser) {
        UserModel.getUserById(1)
            .then(user => req.session.theUser = user)
            .then(() => {
                OfferModel.getOffersByUserId(req.session.theUser._id)
                    .then(offers => {
                        req.session.currentOffers = offers;
                        res.redirect('/myitems')
                    });
            })
            .catch(err => {
                console.error(err);
                let message = "Sign in failed.";
                res.status(404).render('404', { title: "CDXchange | 404: Page Not Found", message: message });
            });
    } else {
        res.redirect('/myitems');
    }
});

// Log in.
app.post('/signin', urlencodedParser, [
    check('username')
        .exists()
        .isLength({ min: 1 }).withMessage("Username must not be empty."),
    check('password')
        .exists()
        .isLength({ min: 1 }).withMessage("Password must not be empty.")
], (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('422', { title: "CDXchange | 422: Unprocessable Entity", errors: errors.array() });
    }

    UserModel.login(req.body.username, req.body.password)
        .then(user => req.session.theUser = user)
        .then(() => {
            OfferModel.getOffersByUserId(req.session.theUser._id)
                .then(offers => {
                    req.session.currentOffers = offers;
                    res.redirect('/myitems')
                });
        })
        .catch(err => {
            console.error(err);
            let message = "Sign in failed.";
            res.status(404).render('404', { title: "CDXchange | 404: Page Not Found", message: message });
        })
});

// Sign out.
app.get('/signout', (req, res) => {
    if(req.session.theUser) {
        req.session.theUser = undefined;
        req.session.currentOffers = undefined;
    }
    res.redirect('/');
})

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
        console.log(req.session);
        res.render('myItems', { title: "CDXchange | My CDs", items: undefined, allItems: undefined });
    }
})

app.get('/myswaps', (req, res) => {
    if(req.session.theUser && req.query.action && req.query.theOffer) {
        if(req.query.action == 'offer') {
            return makeOfferToUser(req, res, req.query.theOffer);
        } else if(req.query.action == 'withdraw') {
            return withdrawOffer(req, res, req.query.theOffer);
        } else if(req.query.action == 'accept') {
            SwapModel.findByIdAndUpdate(req.query.theSwap, {
                status: 'Swapped'
            }).exec()
                .then((swap) => {
                    let results = [];
                    results.push(swap);

                    return UserProfileModel.findOne({ _userId: swap._userId }).exec()
                        .then((userProfile) => {
                            results.push(userProfile);
                            return results;
                        })
                })
                .then((results) => {
                    let itemsHolder = new Array();

                    results[1].userItems.forEach((item) => {
                        if(item._id != results[0].item._id) {
                            itemsHolder.push(item);
                        }
                    });

                    itemsHolder.push(results[0].swapItem);

                    return UserProfileModel.findByIdAndUpdate(results[1]._id, {
                        userItems: itemsHolder
                    }).exec()
                        .then(() => {
                            return results;
                        })
                })
                .then((results) => {
                    return UserProfileModel.findOne({ _userId: results[0]._swapUserId }).exec()
                        .then((userProfile) => {
                            results.push(userProfile);
                            return results;
                        })
                })
                .then((results) => {
                    let itemsHolder = new Array();

                    results[2].userItems.forEach((item) => {
                        if(item._id != results[0].swapItem._id) {
                            itemsHolder.push(item);
                        }
                    });

                    itemsHolder.push(results[0].item);

                    return UserProfileModel.findByIdAndUpdate(results[2]._id, {
                        userItems: itemsHolder
                    }).exec()
                        .then((userProfile) => {
                            return userProfile._id;
                        })
                })
                .then((id) => {
                    return UserProfileModel.findById(id).exec()
                        .then((userProfile) => {
                            req.session.currentProfile = userProfile;
                            res.redirect('/myswaps');
                        })
                })
                // Handle any errors.
                .then(undefined, (err) => {
                    console.error(err);
                    res.redirect('/404');
                }); 
        } else if(req.query.action == 'reject') {
            SwapModel.findOne({ _id: req.query.theSwap }).exec()
                .then((swap) => {
                    let results = [
                        swap._userId,
                        swap.item,
                        swap._swapUserId,
                        swap.swapItem
                    ];

                    return SwapModel.deleteOne({ _id: swap._id }).exec()
                        .then(() => {
                            return results;
                        })
                })
                .then((results) => {
                    var swapHolder = new SwapModel({
                        _id: results[0] + '-' + results[1]._id,
                        _userId: results[0],
                        item: results[1],
                        userRating: results[1].rating,
                        status: 'Available'
                    });

                    return swapHolder.save()
                        .then(() => {
                            return results;
                        })
                })
                .then((results) => {
                    var swapHolder = new SwapModel({
                        _id: results[2] + '-' + results[3]._id,
                        _userId: results[2],
                        item: results[3],
                        userRating: results[3].rating,
                        status: 'Available'
                    });

                    return swapHolder.save()
                        .then(() => {
                            return;
                        })
                })
                .then(() => {
                    return SwapModel.find({ _userId: req.session.theUser._id }).exec()
                        .then((swaps) => {
                            req.session.currentSwaps = swaps;
                            res.redirect('/myswaps');
                        })
                })
                // Handle any errors.
                .then(undefined, (err) => {
                    console.error(err);
                    res.redirect('/404');
                }); 
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
    if(req.session.theUser && req.session.currentProfile && req.query.item) {
        ItemModel.findOne({ _id: req.query.item }).exec()
            .then((item) => {
                var userItemsHolder = req.session.currentProfile.userItems;
                userItemsHolder.push(item);

                return UserProfileModel.findByIdAndUpdate(req.session.theUser._id, {
                    userItems: userItemsHolder
                }).exec()
                    .then(() => {
                        return item;
                    })
            })
            .then((item) => {
                var swapHolder = new SwapModel({
                    _id: req.session.theUser._id + '-' + item._id,
                    _userId: req.session.theUser._id,
                    item: item,
                    userRating: item.rating,
                    status: 'Available',
                    _swapUserId: undefined,
                    swapItem: undefined,
                    swapItemRating: undefined,
                    swapUserRating: undefined
                });

                return swapHolder.save()
                    .then(() => {
                        return;
                    })
            })
            .then(() => {
                return UserProfileModel.findOne({ _id: req.session.theUser._id }).exec()
                    .then((userprofile) => {
                        req.session.currentProfile = userprofile;
                        return;
                    })
            })
            .then(() => {
                return SwapModel.find({ _userId: req.session.theUser._id }).exec()
                    .then((swaps) => {
                        req.session.currentSwaps = swaps;
                        return;
                    })
            })
            .then(() => {
                res.redirect('/myitems');
            })
            // Handle any errors.
            .then(undefined, (err) => {
                console.error(err);
                res.redirect('/404');
            }); 
    } else {
        res.redirect('/404');
    }
});

app.post('/createSwap', urlencodedParser, (req, res) => {
    if(req.body.swap != undefined && req.body.swappedAlbum != undefined) {
        // swapId represents the other user's item SwapModel _id.
        var swapId = req.body.swap;
        // itemId represents the user's item's SwapModel _id.
        var itemId = req.body.swappedAlbum;

        SwapModel.findOne( { _id: swapId} ).exec()
            .then((swap) => {
                return SwapModel.deleteOne( { _id: swapId } ).exec()
                    .then(() => {
                        return swap;
                    });
            })
            .then((swap) => {
                return SwapModel.findByIdAndUpdate(itemId, {
                    status: 'Pending',
                    _swapUserId: swap._userId,
                    swapItem: swap.item,
                    swapItemRating: swap.item.rating,
                    swapUserRating: undefined
                }).exec()
                    .then(() => {
                        return;
                    });
            })
            .then(() => {
                getSwapsQuery(req.session.theUser._id, (error, doc) => {
                    if(!error) {
                        req.session.currentSwaps = doc;
                    }

                    res.redirect('/myswaps');
                })
            })
            // Handle any errors.
            .then(undefined, (err) => {
                console.error(err);
                res.redirect('/404');
            });  
    } else {
        res.redirect('/myswaps');
    }
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
            console.log(req.session.theUser);
            return OfferModel.getOfferByUserIdAndOwnedItem(req.session.theUser._id, itemId)
        })
        .then(offer => {
            if(offer != null) {
                OfferModel.deleteOffer(offer._id)
            }
        })
        .then(() => {
            return OfferModel.getOffersByUserId(req.session.theUser._id)
        })
        .then(offers => {
            req.session.currentOffers = offers;
            res.redirect('/myitems');
        })
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

            return ItemModel.getItemsNotOwned(req.session.theUser.userItems)
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

}

/**
 * withdrawOffer(req, res, offerId) - Withdraws a user's owned offer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} offerId - The id for the offer in question.
 */
function withdrawOffer(req, res, offerId) {
    OfferModel.deleteOffer(offerId)
        .then(() => res.redirect('/myswaps'))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}