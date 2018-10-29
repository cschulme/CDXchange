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
    }
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

// Make sure DB is populated.
var CDs = [
    { _id: 'TaylorSwift-1989', itemName: '1989', artist: 'Taylor Swift', year: 2014, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: 'On 1989, Taylor Swift fully embraces her shift to synth pop, with stadium-ready anthems and harrowing ballads.', rating: 4 },
    { _id: 'TaylorSwift-Reputation', itemName: 'Reputation', artist: 'Taylor Swift', year: 2017, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: '', rating: 3 },
    { _id: 'TroyeSivan-Bloom', itemName: 'Bloom', artist: 'Troye Sivan', year: 2018, recordLabel: 'EMI Australia', catalogCategory: 'Pop', description: '', rating: 5 }
];

Item.countDocuments({}, function(err, count) {
    Item.find(function(err, result) {
        console.log(result);
    });

    if(count == 0) {
        console.log("Item count == 0.");
        Item.collection.insert(CDs, function(err, result) {
            if(err) {
                return console.error(err);
            } else {
                console.log("Item collection populated.");
            }
        });
    }
});

module.exports = Item;