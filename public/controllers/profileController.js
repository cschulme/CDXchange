// --- MODULES ---
const express = require('express');
const app = module.exports = express();
const ItemModel = require('../models/item');
const UserModel = require('../models/user');
const UserProfileModel = require('../models/userProfile');
const SwapModel = require('../models/swap');

// --- ROUTES ---
// Sign in.
app.get('/signin', function(req, res) {
    if(!req.session.theUser) {
        getUserQuery((error, doc) => {
            if(!error) {
                req.session.theUser = doc;
            }

            getProfileQuery(req.session.theUser.id, (error, doc) => {
                if(!error) {
                    req.session.currentProfile = doc;
                }

                getSwapsQuery(req.session.theUser.id, (error, doc) => {
                    if(!error) {
                        req.session.currentSwaps = doc;
                    }

                    res.redirect('/myitems');
                })
            });
        });
    } else {
        res.redirect('/myitems');
    }
});

// Sign out.
app.get('/signout', function(req, res) {
    if(req.session.theUser) {
        req.session.theUser = undefined;
        req.session.currentProfile = undefined;
        req.session.currentSwaps = undefined;
    }
    res.redirect('/');
})

app.get('/myitems', function(req, res) {
    if(req.session.currentProfile && req.query.action && req.query.theItem && validateItem(req.query.theItem)) {
        switch(req.query.action.toLowerCase()) {
            case 'update':

                break;
            case 'delete':
                deleteItemFromProfile(userId, item, (err) => {
                    if(!err) {
                        res.redirect('myitems');
                    }
                });
                break;
            default:
        }
    }

    if(req.session.currentProfile) {
        console.log("req.session.currentProfile == true!");
        var items = req.session.currentProfile.userItems;
    } else {
        console.log("req.session.currentPRofile == false!");
        var items = undefined;
    }

    res.render('myItems', { title: "CDXchange | My CDs", items: items });
});

app.get('/mySwaps', (req, res) => {
    if(req.session.currentProfile) {

    } else {

    }
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

function getUserQuery(callback) {
    UserModel.findOne( {}, function(err, doc) {
        if(doc) {
            callback(null, doc);
        } else {
            console.log("getUserQuery(): No user found.");
            callback(true, null);
        }
    });
}

function getProfileQuery(id, callback) {
    UserProfileModel.find( { _userId: id }, function(err, doc) {
        if(doc) {
            callback(null, doc);
        } else {
            console.log("getProfileQuery(): No profile found.");
            callback(true, null);
        }
    });
}

function getSwapsQuery(id, callback) {
    SwapModel.find( { _userId: id }, (err, doc) => {
        if(doc) {
            callback(null, doc);
        } else {
            console.log("getSwapsQuery(): No swaps founds.");
            callback(true, null);
        }
    });
}

function deleteItemFromProfile(id, item, callback) {
    UserProfileModel.find( { _userId: id }, (err, doc) => {
        let userItemsHolder = doc.userItems;

        let index = userItemsHolder.indexOf(item);

        if(index > -1) {
            userItemsHolder.splice(index, 1);
        }

        UserProfileModel.updateOne( { _userId: id }, { userItems: userItemsHolder }, (err, num) => {
            if(!err) {
                callback(null);
            } else {
                callback(true);
            }
        })
    });
}