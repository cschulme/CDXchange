// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const ItemSchema = new mongoose.Schema({
    // ItemCode.
    _id: String,
    itemName: String,
    artist: String,
    year: Number,
    recordLabel: String,
    catalogCategory: String,
    description: String,
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    tracks: Array
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

ItemSchema.virtual('imageURL').get(function() {
    return '/Images/AlbumCovers/' + this._id + '.jpg';
});

const Item = db.model('Item', ItemSchema);

module.exports = Item;