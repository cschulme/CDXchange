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
    imageURL: String
})

const Item = db.model('Item', ItemSchema);

module.exports = {

    // Returns all items in the Item collection.
    getItems: function() {
        Item.find(function(err, result) {
            if (err) {
                return handdleError(err);
            } else {
                return result;
            }
        });
    },

    // Returns the item with the _id matching itemId.
    getItem: function(itemId) {
        Item.findById(itemID, function(err, result) {
            if (err) {
                return handleError(err);
            } else {
                return result;
            }
        });
    },

    // Returns all items of a given category.
    getItemsByCategory: function(category) {
        Item.find( { catalogCategory: category }, function(err, result) {
            if (err) {
                return handleError(err);
            } else {
                return result;
            }
        })
    }

}