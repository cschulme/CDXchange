// --- MODULES ---
const express = require('express');
const app = module.exports = express();
var bodyParser = require('body-parser');
const ItemModel = require('../models/item');
const UserModel = require('../models/user');
const UserProfileModel = require('../models/userProfile');
const SwapModel = require('../models/swap');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// --- ROUTES ---
// Sign in.
app.get('/signin', function(req, res) {
    if(!req.session.theUser) {
        getUserQuery((error, doc) => {
            if(!error) {
                req.session.theUser = doc;
            }

            getProfileQuery(req.session.theUser._id, (error, doc) => {
                if(!error) {
                    req.session.currentProfile = doc;
                }

                getSwapsQuery(req.session.theUser._id, (error, doc) => {
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
    if(req.session.currentProfile && req.query.action && req.query.theItem) {
        if(req.query.action == 'update') {
            getSwap(req.session.theUser._id, req.query.theItem, (err, swap) => {
                if(!err) {
                    if(swap.status == 'Available' || swap.status == 'Swapped') {
                        getItem(req.query.theItem, (err, item) => {
                            if(!err) {
                                res.redirect('/categories/' + item.catalogCategory + '/' + item._id);
                            } else {
                                res.redirect('/myItems');
                            }
                        });
                    }
                } else {
                    res.redirect('/myItems');
                }
            });
        } else if(req.query.action == 'delete') {
            deleteItemFromProfile(req.session.theUser._id, req.query.theItem, (err, profile) => {
                if(!err) {
                    req.session.currentProfile = profile;

                    updateSwaps(req.session.theUser._id, req.query.theItem, (err) => {
                        if(!err) {
                            getSwapsQuery(req.session.theUser._id, (err, doc) => {
                                if(!err) {
                                    req.session.currentSwaps = doc;
                                    res.redirect('/myitems');
                                } else {
                                    res.redirect('/myItems');
                                }
                            }) 
                            
                        } else {
                            res.redirect('/myItems');
                        }
                    });
                } else {
                    res.redirect('/myItems');
                }
            });
        }
    } else {
        if(req.session.currentProfile) {
            var items = req.session.currentProfile.userItems;

            var itemIds = new Array();

            items.forEach((item) => {
                itemIds.push(item._id);
            });

            ItemModel.find( { _id: { $nin: itemIds } } ).sort( { catalogCategory: 1 } )
                .then((allItems) => {
                    res.render('myItems', { title: "CDXchange | My CDs", items: items, allItems: allItems });
                }, (err) => {
                    res.redirect('/404');
                });
        } else {
            var items = undefined;

            res.render('myItems', { title: "CDXchange | My CDs", items: items, allItems: undefined });
        }
    }
});

app.get('/myswaps', (req, res) => {
    if(req.session.currentProfile && req.query.action && req.query.theSwap) {
        if(req.query.action == 'offer') {
            SwapModel.findOne( { _id: req.query.theSwap } )
                .then(
                    (swap) => {
                        var swappableItems = new Array();

                        for(var i = 0; i < req.session.currentSwaps.length; i++) {
                            if(req.session.currentSwaps[i].status == 'Available') {
                                swappableItems.push(req.session.currentSwaps[i]);
                            }
                        }
                        res.render('swap', { title: "CDXchange | Swap " + swap.item.itemName, swap: swap, swappableItems: swappableItems });
                    }, (err) => {
                        console.error(err);
                        res.redirect('/myitems');
                    }
                );
        } else if (req.query.action == 'withdraw') {
            SwapModel.findOne( { _id: req.query.theSwap } )
                // Save necessary info and delete the pending swap.
                .then((swap) => {
                    var results = new Array();
                    results.push(swap.item);
                    results.push(swap._swapUserId);
                    results.push(swap.swapItem);

                    return SwapModel.deleteOne( { _id: req.query.theSwap } ).exec()
                        .then(() => {
                            return results;
                        })
                })
                // Recreate other user's available swap.
                .then((results) => {
                    var swapHolder = new SwapModel({
                        _id: results[1] + '-' + results[2]._id,
                        _userId: results[1],
                        item: results[2],
                        userRating: results[2].rating,
                        status: 'Available',
                        _swapUserId: undefined,
                        swapItem: undefined,
                        swapItemRating: undefined,
                        swapUserRating: undefined
                    });

                    return swapHolder.save()
                        .then(() => {
                            return results;
                        })
                })
                // Recreate the active user's available swap.
                .then((results) => {
                    var swapHolder = new SwapModel({
                        _id: req.session.theUser._id + '-' + results[0]._id,
                        _userId: req.session.theUser._id,
                        item: results[0],
                        userRating: results[0].rating,
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
            res.redirect('/mySwaps');
        }
    } else if(req.session.currentProfile) {
        SwapModel.find( { _userId: { $ne: req.session.theUser._id } })
            .then(
                (otherSwaps) => {
                    var userIds = new Array();

                    otherSwaps.forEach((swap) => {
                        userIds.push(swap._userId);
                    });

                    UserModel.find( { _id: { $in: userIds } }, (err, swapUsers) => {
                        if(!err) {
                            let mySwaps = req.session.currentSwaps;
                            res.render('mySwaps', { title: "CDXchange | My Swaps", mySwaps: mySwaps, otherSwaps: otherSwaps, swapUsers: swapUsers });
                        } else {
                            console.error(err);
                            res.render('mySwaps', { title: "CDXchange | My Swaps", mySwaps: mySwaps});
                        }
                    });
                }, (err) => {
                    console.error(err);
                    let mySwaps = req.session.currentSwaps;
                    res.render('mySwaps', { title: "CDXchange | My Swaps", mySwaps: mySwaps});
                }
            );
    } else {
        let mySwaps = undefined;
        res.render('mySwaps', { title: "CDXchange | My Swaps", mySwaps: mySwaps });
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
    UserProfileModel.findOne( { _userId: id }, function(err, doc) {
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
    UserProfileModel.findOne( { _userId: id }, (err, doc) => {

        // If profile is found...
        if(doc) {
            var newUserItems = new Array();

            for(var i = 0; i < doc.userItems.length; i++) {
                if(doc.userItems[i]._id != item) {
                    newUserItems.push(doc.userItems[i]);
                }
            }

            // Update the profile.
            UserProfileModel.updateOne( { _userId: id }, { userItems: newUserItems }, (err, raw) => {
                        
                UserProfileModel.findOne( { _userId: id }, (err, doc) => {
                    if(doc) {
                        callback(null, doc);
                    } else {
                        callback(true, null);
                    }
                });

            });

        } else {
            console.error(err);
            callback(true, null);
        }
    });
}

function updateSwaps(id, item, callback) {
    SwapModel.find( { _userId: id }, (err, doc) => {
        if(doc) {
            var swapsToBeRemoved = new Array();

            for(var i = 0; i < doc.length; i++) {
                if(doc[i].item._id == item) {
                    swapsToBeRemoved.push(doc[i]._id);
                }
            }

            SwapModel.deleteMany( { _id: swapsToBeRemoved }, (err) => {
                if(err) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        } else {
            callback(true);
        }
    });
}

function getSwap(id, item, callback) {
    var swapId = id + '-' + item;

    SwapModel.findOne( { _id: swapId }, (err, doc) => {
        console.log(doc);
        if(doc) {
            callback(null, doc);
        } else {
            callback(true, null);
        }
    });
}

function getItem(item, callback) {
    ItemModel.findOne( { _id: item }, (err, doc) => {
        if(doc) {
            callback(null, doc);
        } else {
            callback(true, null);
        }
    });
}