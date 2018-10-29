// --- MODULES ---
const db = require('../db');

// --- MODEL ---
const UserSchema = new Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    // State, province, region, etc.
    area: String,
    postalCode: String,
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