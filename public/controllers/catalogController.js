// --- MODULES ---
var express = require('express');
var app = module.exports = express();
var db = require('../db');
var itemModel = require('../models/item');
var utilityFunctions = require('../utilityFunctions');

// --- ROUTES ---
app.get('/categories', function (req, res) {
    res.render('categories', { title: "CDXchange | Categories" });
});

app.get('/categories/:category', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) == true) {
        var items = item.getItemsByCategory(category);

        if(req.session.currentProfile.userItems != undefined) {
            var myItems = req.session.currentProfile.userItems;
        } else {
            var myItems = undefined;
        }

        res.render('category', { title: "CDXchange | " + category, category: category, items: items, myItems: myItems });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

app.get('/categories/:category/:item', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);

    if(utilityFunctions.validateCategory(category) == true && item.getItem(req.params.item) != false) {
        var items = item.getItem(req.params.item);
        res.render('item', { title: "CDXchange | " + items[0].itemName, items: items});
    } else if (utilityFunctions.validateCategory(category) == true && item.getItem(req.params.item) == false) {
        var items = item.getItemsByCategory(category);
        res.render('category', { title: "CDXchange | " + category, category: category, items: items });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});

app.get('/categories/:category/:item/swap', function (req, res) {
    var category = utilityFunctions.toTitleCase(req.params.category);
    
    if(utilityFunctions.validateCategory(category) == true && item.getItem(req.params.item) != false) {
        var items = item.getItem(req.params.item);
        if(req.session.currentProfile != undefined) {
            var myItems = req.session.currentProfile.userItems;
        } else {
            var myItems = undefined;
        }
        res.render('swap', { title: "CDXchange | Swap " + items[0].itemName, category: category, items: items, myItems: myItems });
    } else {
        res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
    }
});