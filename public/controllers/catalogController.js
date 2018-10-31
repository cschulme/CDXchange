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

    if(utilityFunctions.validateCategory(category) == true) {
        ItemModel.find( { catalogCategory: category } ).then(function(doc) {
            res.render('category', { title: "CDXchange | " + category, category: category, items: doc});
        });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

app.get('/categories/:category/:item', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) == true) {
        ItemModel.findById(req.params.item).then(function(doc) {
            res.render('item', { title: "CDXchange | " + doc.itemName, item: doc });
        });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

app.get('/categories/:category/:item/swap', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);
    
    if(utilityFunctions.validateCategory(category) == true && itemModel.getItem(req.params.item) != false) {
        var items = item.getItem(req.params.item);

        res.render('swap', { title: "CDXchange | Swap " + items[0].itemName, category: category, items: items, myItems: myItems });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});