// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const SwapSchema = new mongoose.Schema({
    _id: String,
    _userId: Number,
    item: Object,
    userRating: Number,
    status: String,
    _swapUserId: Number,
    swapItem: Object,
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