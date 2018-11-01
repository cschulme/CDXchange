// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const ItemModel = require('../models/item');
const utilityFunctions = require('../utilityFunctions');

// --- ROUTES ---
app.get('/categories', function (req, res) {
    res.render('categories', { title: "CDXchange | Categories" });
});

app.get('/categories/:category', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) == true && req.session.currentProfile) {
        findItemsNotOwned(req.session.currentProfile.userItems, category, (err, items) => {
            if(!err) {
                res.render('category', { title: "CDXchange | " + category, category: category, items: items})
            } else {
                res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
            }
        });
    } else if(utilityFunctions.validateCategory(category)) {
        ItemModel.find( { catalogCategory: category }, (err, items) => {
            res.render('category', { title: "CDXchange | " + category, category: category, items: items});
        });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

app.get('/categories/:category/:item', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) == true) {
        ItemModel.findById(req.params.item).then(function(item) {
            var owned = false;

            for(var i = 0; i < req.session.currentProfile.userItems.length; i++) {
                if(item._id == req.session.currentProfile.userItems[i]._id) {
                    owned = true;
                }
            }

            res.render('item', { title: "CDXchange | " + item.itemName, item: item, owned: owned });
        });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

// --- FUNCTIONS ---
function findItemsNotOwned(userItems, category, callback) {
    let userItemIds = new Array();

    for(let i = 0; i < userItems.length; i++) {
        userItemIds.push(userItems[i]._id);
    }

    ItemModel.find( { _id: { $nin: userItemIds }, catalogCategory: category }, (err, doc) => {
        if(doc) {
            callback(null, doc);
        } else {
            callback(true, null);
        }
    });
}