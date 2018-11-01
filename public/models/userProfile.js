// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

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

// --- EXPORT ---
module.exports = UserProfile;
