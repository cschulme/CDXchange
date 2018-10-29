// --- MODULES ---
var express = require('express');
var app = module.exports = express();
var ItemModel = require('../models/item');
var UserModel = require('../models/user');
var UserProfileModel = require('../models/userProfile');

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
    if(req.session.currentProfile && req.query.action && req.query.theItem) {

    }

    if(req.session.currentProfile) {
        
    }
});