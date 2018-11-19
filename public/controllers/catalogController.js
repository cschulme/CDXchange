// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const ItemModel = require('../models/Item');
const OfferModel = require('../models/Offer');
const UserModel = require('../models/User');
const utilityFunctions = require('../utilityFunctions');

// --- ROUTES ---
app.get('/categories', (req, res) => {
    res.render('categories', { title: "CDXchange | Categories" });
});

app.get('/categories/:category', (req, res) => {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) && req.session.currentProfile) {
        ItemModel.getItemsNotOwned(req.session.theUser.userItems)
            .then(itemsNotOwned => res.render('category', { title: "CDXchange | " + category, category: category, items: itemsNotOwned}))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else if(utilityFunctions.validateCategory(category)) {
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

app.get('/categories/:category/:item', (req, res) => {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) && req.session.currentProfile) {
        ItemModel.getItem(req.params.item)
            .then(item => {
                let results = new Array();
                results.push(item);
                return results
            })
            .then(results => {
                let owned = false;

                req.session.theUser.userItems.forEach(item => {
                    if(item == req.params.item) {
                        owned = true;
                    }
                })

                results.push(owned);
                return results;
            })
            .then(results => {
                return OfferModel.getAvailableOffersForItem(req.session.theUser._id, req.params.item)
                    .then(docs => {
                        results.push(docs)
                        return results;
                    })
            }) 
            .then(results => {
                let userIds = new Array();
                results[2].forEach(offer => userIds.push(offer));

                return UserModel.getUsersInSetOfIds(userIds)
                    .then(docs => {
                        results.push(docs);
                        return results;
                    })
            })
            .then(results => res.render('item', { title: "CDXchange | " + item.itemName, item: results[0], owned: results[1], swaps: results[2], swapUsers: results[3] }))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else if(utilityFunctions.validateCategory(category)) {
        ItemModel.getItem(req.params.item)
            .then(item => res.render('item', { title: "CDXchange | " + item.itemName, item: item, owned: false, swaps: undefined, swapUsers: undefined }))
            .catch(err => {
                console.error(err);
                res.redirect('/404');
            })
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});