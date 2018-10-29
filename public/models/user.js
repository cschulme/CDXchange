// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const UserSchema = new mongoose.Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    // State, province, region, etc.
    area: String,
    postalCode: Number,
    country: String
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

UserSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
});

const User = db.model('User', UserSchema);

// Make sure User collection is populated.
var Users = [
    { _id: 1, firstName: 'Christian', lastName: 'Schulmeister', email: 'cschulme@uncc.edu', address1: '7429 Quail Wood Dr.', address2: 'Apt. F', city: 'Charlotte', area: 'NC', postalCode: 28226, country: 'USA' },
    { _id: 2, firstName: 'Chase', lastName: 'Farinelli', email: 'chasesoufi@gmail.com', address1: '8213 Autumn Applause Dr.', address2: '', city: 'Charlotte', area: 'NC', postalCode: 28277, country: 'USA' },
    { _id: 3, firstName: 'Katelyn', lastName: 'Schulmeister', email: 'keschulme@gmail.com', address1: '7429 Quail Wood Dr.', address2: 'Apt. F', city: 'Charlotte', area: 'NC', postalCode: 28226, country: 'USA' }
];

User.countDocuments({}, function(err, count) {
    if(count == 0) {
        User.collection.insert(Users, function(err, result) {
            if(err) {
                return console.error(err);
            } else {
                console.log("User collection populated.");
            }
        });
    }
});

module.exports = User;