// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const UserProfileSchema = new Schema({
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

// Make sure UserProfile collection is populated.

module.exports = UserProfile;