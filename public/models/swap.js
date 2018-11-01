// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const UserProfileModel = require('./userProfile');

// --- MODEL ---
const SwapSchema = new mongoose.Schema({
    _id: String,
    _userId: Number,
    _itemId: String,
    userRating: Number,
    status: String,
    _swapUserId: Number,
    swapItem: String,
    swapItemRating: Number,
    swapUserRating: Number

}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

const Swap = db.model('Swap', SwapSchema);

function getUserItems(id, callback) {
    UserProfileModel.findOne( { _userId: id }, (err, doc) => {
        let userItemsHolder = new Array();

        doc.userItems.forEach((item) => {
            userItemsHolder.push(item);
        })

        callback(userItemsHolder);
    });
}

Swap.countDocuments({}, (err, count) => {
    if(count == 0) {
        getUserItems(1, (items) => {
            items.forEach((item) => {
                Swap.collection.insertOne({
                    _id: '1-' + item._id,
                    _userId: 1,
                    _itemId: item._id,
                    userRating: item.rating,
                    status: 'Available',
                    _swapUserId: undefined,
                    swapItem: undefined,
                    swapItemRating: undefined,
                    swapUserRating: undefined
                }, (err, result) => {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log("User Swap added.");
                    }
                })
            })
        });
        getUserItems(2, (items) => {
            items.forEach((item) => {
                Swap.collection.insertOne({
                    _id: '2-' + item._id,
                    _userId: 2,
                    _itemId: item._id,
                    userRating: item.rating,
                    status: 'Available',
                    _swapUserId: undefined,
                    swapItem: undefined,
                    swapItemRating: undefined,
                    swapUserRating: undefined
                }, (err, result) => {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log("User Swap added.");
                    }
                })
            })
        });
        getUserItems(3, (items) => {
            items.forEach((item) => {
                Swap.collection.insertOne({
                    _id: '3-' + item._id,
                    _userId: 3,
                    _itemId: item._id,
                    userRating: item.rating,
                    status: 'Available',
                    _swapUserId: undefined,
                    swapItem: undefined,
                    swapItemRating: undefined,
                    swapUserRating: undefined
                }, (err, result) => {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log("User Swap added.");
                    }
                })
            })
        });
    }
});

module.exports = Swap;