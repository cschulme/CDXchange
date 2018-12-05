// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const { check, validationResult } = require('express-validator/check');
const bodyParser = require('body-parser');
const ItemModel = require('../models/Item');
const OfferModel = require('../models/Offer');
const UserModel = require('../models/User');
const ItemFeedbackModel = require('../models/ItemFeedback');
const utilityFunctions = require('../utilityFunctions');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// --- ROUTES ---
app.get('/categories', (req, res) => {
    res.render('categories', { title: "CDXchange | Categories" });
});

// Handles the view for a category.
app.get('/categories/:category', (req, res) => {
    // Format the passed category parameter.
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) && req.session.theUser) {
        // Filter the items displayed to not show items that are already owned by the user.
        ItemModel.getItemsNotOwnedByCategory(req.session.theUser.userItems, category)
            .then(itemsNotOwned => res.render('category', { title: "CDXchange | " + category, category: category, items: itemsNotOwned}))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else if(utilityFunctions.validateCategory(category)) {
        // Get all items in the category.
        ItemModel.getItemsByCategory(category)
            .then(items => res.render('category', { title: "CDXchange | " + category, category: category, items: items}))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else {
        let message = "You tried to reach an invalid category."
        res.status(404).render('404', { title: "CDXchange | 404: Page Not Found", message: message });
    }
});

// Handles the view for an item.
app.get('/categories/:category/:item', (req, res) => {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) && req.session.theUser) {
        return viewItemAsUser(req, res, req.params.item);
    } else if(utilityFunctions.validateCategory(category)) {
        return viewItemAsPublic(req, res, req.params.item);
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

// Creates an ItemFeedback document from the passed data and redirects to the item being rated.
app.post('/rateItem', urlencodedParser, [
    check('userId')
        .exists().withMessage('UserId must exist.')
        .isInt().withMessage('UserId must be an integer.'),
    check('itemId')
        .exists().withMessage('ItemId must exist.')
        .isString().withMessage('ItemId must be a string.'),
    check('rating')
        .exists()
        .isInt({ gt: 0, lt: 6 }).withMessage('Must be an integer from 1-5.')
], (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('422', { title: "CDXchange | 422: Unprocessable Entity", errors: errors.array() });
    }

    ItemFeedbackModel.addFeedback(req.body.userId, req.body.itemId, req.body.rating, req.body.comment)
        .then(() => {
            ItemModel.getItem(req.body.itemId)
                .then(item => {
                    path = '/categories/' + item.catalogCategory + '/' + item._id
                    res.redirect(path);
                })  
        })
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
});

// Handles the logic for deleting an item rating (and potential other options in the future).
app.get('/rateItem', (req, res) => {
    if(req.session.theUser && req.query.action == 'delete' && req.query.theReview) {
        return deleteReview(req, res, req.query.theReview);
    } else {
        res.redirect('/404');
    }
})

// Updates an ItemFeedback document with the passed data.
app.post('/editItemFeedback', urlencodedParser, [
    check('userId')
        .exists().withMessage('UserId must exist.')
        .isInt().withMessage('UserId must be an integer.'),
    check('itemId')
        .exists().withMessage('ItemId must exist.')
        .isString().withMessage('ItemId must be a string.'),
    check('rating')
        .exists().withMessage('Rating must exist.')
        .isInt({ gt: 0, lt: 6 }).withMessage('Must be an integer from 1-5.'),
    check('oldRating')
        .exists().withMessage('OldRating must exist.')
        .isInt({ gt: 0, lt: 6 }).withMessage('Must be an integer from 1-5.')
], (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('422', { title: "CDXchange | 422: Unprocessable Entity", errors: errors.array() });
    }

    ItemFeedbackModel.editFeedback(req.body.itemId, req.body.userId, req.body.rating, req.body.comment, req.body.oldRating)
        .then(review => {
            return ItemModel.getItem(review._itemId)
                .then(item => {
                    return item;
                })
        })
        .then(item => {
            res.redirect('/passBack?view=item&category=' + item.catalogCategory + '&item=' + item._id);
        })
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
});

// --- FUNCTIONS ---

/**
 * deleteReview(req, res, reviewId) - Handles deleting an item review.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Number} reviewId - The id of the review to be deleted.
 */
function deleteReview(req, res, reviewId) {
    ItemFeedbackModel.deleteReview(reviewId, req.session.theUser._id)
        .then(() => {
            res.redirect('back');
        })
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * viewItemAsUser(req, res, itemId) - Handles the item view route when signed in.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {String} itemId - The id of the item.
 */
function viewItemAsUser(req, res, itemId) {
    let results = new Array();
    
    ItemModel.getItem(itemId)
        .then(item => {
            results.push(item);
            return results;
        })
        .then(results => {
            let owned = false;

            req.session.theUser.userItems.forEach(item => {
                if(item == itemId) {
                    owned = true;
                }
            })

            results.push(owned);
            return results;
        })
        .then(results => {
            return OfferModel.getAvailableOffersForItem(req.session.theUser._id, itemId)
                .then(docs => {
                    let relevantOffers = new Array();

                    docs.forEach(offer => {
                        var wantedItemIsOwned = false;

                        req.session.theUser.userItems.forEach(userItem => {
                            if(offer._wantedItemId == userItem) {
                                wantedItemIsOwned = true;
                            }
                        });

                        if(wantedItemIsOwned == false) {
                            offer.wantedItemIsOwned = false;
                            relevantOffers.push(offer);
                        } else {
                            offer.wantedItemIsOwned = true;
                            relevantOffers.push(offer);
                        }
                    });

                    results.push(relevantOffers);
                    return results;
                })
        }) 
        .then(results => {
            let userIds = new Array();
            results[2].forEach(offer => userIds.push(offer._userId));

            return UserModel.getUsersInSetOfIds(userIds)
                .then(docs => {
                    results.push(docs);
                    return results;
                })
        })
        .then(results => {
            return ItemFeedbackModel.getFeedbackForItem(itemId)
                .then(docs => {
                    results.push(docs)
                    return results;
                })
        })
        .then(results => {
            let userIds = new Array();
            results[4].forEach(feedback => userIds.push(feedback._userId));

            return UserModel.getUsersInSetOfIds(userIds)
                .then(docs => {
                    let reviewed = false;

                    docs.forEach(user => {
                        if(user._id == req.session.theUser._id) {
                            reviewed = true;
                        }
                    })

                    results.push(reviewed);
                    results.push(docs);
                    return results;
                })
        })
        .then(results => res.render('item', { title: "CDXchange | " + results[0].itemName, 
                                              item: results[0], 
                                              owned: results[1], 
                                              swaps: results[2], 
                                              swapUsers: results[3], 
                                              reviewed: results[5], 
                                              feedback: results[4], 
                                              feedbackUsers: results[6] }))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}

/**
 * viewItemAsPublic - Handles the item view route when not signed in.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {String} itemId - The id of the item.
 */
function viewItemAsPublic(req, res, itemId) {
    let results = new Array();

    ItemModel.getItem(itemId)
        .then(item => {
            results.push(item);

            return ItemFeedbackModel.getFeedbackForItem(itemId)
                .then(reviews => {
                    results.push(reviews);
                    return results;
                })
        })
        .then(results => {
            let userIds = new Array();
            results[1].forEach(feedback => userIds.push(feedback._userId));

            return UserModel.getUsersInSetOfIds(userIds)
                .then(users => {
                    results.push(users);
                    return results;
                })
        })
        .then(results => res.render('item', { title: "CDXchange | " + results[0].itemName, 
                                              item: results[0], 
                                              owned: false, 
                                              swaps: undefined, 
                                              swapUsers: undefined, 
                                              reviewed: false, 
                                              feedback: results[1], 
                                              eedbackUsers: results[2] }))
        .catch(err => {
            console.error(err);
            res.redirect('/404');
        })
}