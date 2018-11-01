// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const ItemModel = require('./item');

// --- MODEL ---
const UserProfileSchema = new mongoose.Schema({
    _id: Number,
    _userId: Number,
    userItems: Array
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

const UserProfile = db.model('UserProfile', UserProfileSchema);

function getRandomItems(callback) {
    let randomNumber = Math.floor(Math.random() * 19);

    ItemModel.find( {} )
        .skip(randomNumber)
        .limit(3)
        .then((doc) => {
            let itemHolder = new Array();

            doc.forEach((item) => {
                itemHolder.push(item);
            })

            callback(itemHolder);
        })
}

UserProfile.countDocuments({}, (err, count) => {
    if(count == 0) {
        getRandomItems((items) => {
            UserProfile.collection.insertOne({
                _id: 1,
                _userId: 1,
                userItems: items
            }, (err, result) => {
                if(err) {
                    console.error(err);
                } else {
                    console.log("Profile added to UserProfiles collection.");
                }
            });
        });
        getRandomItems((items) => {
            UserProfile.collection.insertOne({
                _id: 2,
                _userId: 2,
                userItems: items
            }, (err, result) => {
                if(err) {
                    console.error(err);
                } else {
                    console.log("Profile added to UserProfiles collection.");
                }
            });
        });
        getRandomItems((items) => {
            UserProfile.collection.insertOne({
                _id: 3,
                _userId: 3,
                userItems: items
            }, (err, result) => {
                if(err) {
                    console.error(err);
                } else {
                    console.log("Profile added to UserProfiles collection.");
                }
            });
        });
    }
});


// --- EXPORT ---
module.exports = UserProfile;
