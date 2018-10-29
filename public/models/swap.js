// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const SwapSchema = new Schema({
    _id: String,
    _userId: Number,
    rating: Number,
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

module.exports = Swap;