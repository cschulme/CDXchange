// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const ItemModule = require('./item');
const UserModule = require('./user');

// --- MODEL ---
const UserProfileSchema = new mongoose.Schema({
    _id: String,
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

module.exports = UserProfile;