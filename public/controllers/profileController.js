// --- MODULES ---
var express = require('express');
var app = module.exports = express();
var ItemModel = require('../models/item');
var UserModel = require('../models/user');
var UserProfileModel = require('../models/userProfile');

// --- MIDDLEWARE ---
app.use(function(req, res, next) {
    if(req.session.theUser) {
        res.locals.theUser = { name: fullName, user: true };
    } else {
        res.locals.theUser = { user: false };
    }

    next();
});

// --- ROUTES ---
// Sign in.
app.get('/signin', function(req, res) {
    if(!req.session.theUser) {
        UserModel.findOne( {} ).then(function(doc) {
            req.session.theUser = doc;
        });
        UserProfileModel.find( { _userId: req.session.theUser._id } ).then(function(doc) {
            req.session.currentProfile = doc;
        });
    }
    res.redirect('/myitems');
});

// Sign out.
app.get('/signout', function(req, res) {
    if(req.session.theUser) {
        req.session.theUser = undefined;
        req.session.currentProfile = undefined;
    }
    res.redirect('/');
})

app.get('/myitems', function(req, res) {
    if(req.session.currentProfile && req.query.action && req.query.theItem && validateItem(req.query.theItem)) {
        switch(req.query.action.toLowerCase()) {
            case 'update':

                break;
            case 'delete':
                req.session.currentProfile
                break;
            default:
        }
    }

    if(req.session.currentProfile) {
        var items = req.session.currentProfile.userItems;
    } else {
        var items = undefined;
    }

    res.render('myItems', { title: "CDXchange | My CDs", items: items });
});

// --- FUNCTIONS ---
// Validates that the item exists in the database.
function validateItem(item) {
    ItemModel.countDocuments({}, function(err, count) {
        if(count != 0) {
            return true;
        } else {
            return false;
        }
    })
}