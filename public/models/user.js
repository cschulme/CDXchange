// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

// --- MODEL ---
const UserSchema = new mongoose.Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    email: String,
    address: {
        address1: String,
        address2: String,
        city: String,
        // State, province, region, etc.
        area: String,
        postalCode: Number,
        country: String
    },
    username: String,
    password: {
        hash: String,
        salt: String
    },
    userItems: Array
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

UserSchema.virtual('fullName').get(()  => {
    return this.firstName + ' ' + this.lastName;
});

// Use mongoose-auto-increment to automatically set _id numbers.
UserSchema.plugin(autoIncrement.plugin, 'User');

const User = db.model('User', UserSchema);

// --- MODULE EXPORTS ---

module.exports.Users = User;

/**
 * getUserById(id) - Gets the user by the _id value.
 * @param {Number} id - The _id value to search by.
 * @returns {Promise<any>}
 */
module.exports.getUserById = function(id) {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * getUserByName(first, last) - Gets the user by the user's real name.
 * @param {String} first - The user's first name.
 * @param {String} last - The user's last name.
 * @returns {Promise<any>}
 */
module.exports.getUserByName = function(first, last) {
    return new Promise((resolve, reject) => {
        User.findOne({ firstName: first, lastName: last })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * getUserByUsername(username) - Gets the user by the username value.
 * @param {String} username - The username to search by.
 * @returns {Promise<any>}
 */
module.exports.getUserByUsername = function(username) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * getUsersInSetOfIds(ids) - Get the users who have ids within a passed set.
 * @param {Array} ids - The ids to filter by.
 * @returns {Promise<any>}
 */
module.exports.getUsersInSetOfIds = function(ids) {
    return new Promise((resolve, reject) => {
        User.find({ _id: { $in: ids } })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * getUserItemsById(id) - Gets the userItems array by the user's _id value.
 * @param {Number} id - The user's _id.
 * @returns {Promise<any>}
 */
module.exports.getUserItemsById = function(id) {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id })
            .then(doc => resolve(doc.userItems))
            .catch(err => reject(err))
    })
}

/**
 * getUserItemsByName(first, last) - Gets the userItems array by the user's full name.
 * @param {String} first - The user's first name.
 * @param {String} last - The user's last name.
 * @returns {Promise<any>}
 */
module.exports.getUserItemsByName = function(first, last) {
    return new Promise((resolve, reject) => {
        User.findOne({ firstName: first, lastName: last })
            .then(doc => resolve(doc.userItems))
            .catch(err => reject(err))
    })
}

/**
 * getUserItemsByUsername(username) - Gets the userItems array by the user's username value.
 * @param {String} username - The user's username.
 * @returns {Promise<any>}
 */
module.exports.getUserItemsByUsername = function(username) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then(doc => resolve(doc.userItems))
            .catch(err => reject(err))
    })
}

/**
 * addUser(firstName, lastName, email, address1, address2, city, area, postalCode, country, username, hash, salt, userItems) -
 *      Creates a user document and adds it to the users collection.
 * @param {String} firstName - The user's first name.
 * @param {String} lastName - The user's last name.
 * @param {String} email - The user's email address.
 * @param {String} address1 - The user's main street address.
 * @param {String} address2 - A second address field to hold, for example, an apartment number.
 * @param {String} city - The user's city.
 * @param {String} area - The user's state, province, or region.
 * @param {Number} postalCode - The user's postal code.
 * @param {String} country - The user's country.
 * @param {String} username - The user's selected username.
 * @param {String} hash - The generated hash.
 * @param {String} salt - The generated salt.
 * @param {Array} userItems - An array of all the items the user has in their profile.
 * @returns {Promise<any>}
 */
module.exports.addUser = function(firstName, lastName, email, address1, address2, city, area, postalCode, country, username, hash, salt, userItems) {
    return new Promise((resolve, reject) => {
        let newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            address: {
                address1: address1,
                address2: address2,
                city: city,
                area: area,
                postalCode: postalCode,
                country: country,
            },
            username: username,
            password: {
                hash: hash,
                salt: salt
            },
            userItems: userItems
        });
    
        newUser.save()
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * updateUserById(id, update) - Finds a user by id, then updates them based off
 *      of the update object.  Returns the new user document.
 * @param {Number} id - The id to search by.
 * @param {Object} update - An object representing the update.
 */
module.exports.updateUserById = function(id, update) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ _id: id }, update, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * updateUserByName(first, last, update) - Finds a user by their real name, then updates them 
 *      based off of the update object.  Returns the new user document.
 * @param {String} first - The user's first name.
 * @param {String} last - The user's last name.
 * @param {Object} update - An object representing the update.
 */
module.exports.updateUserByName = function(first, last, update) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ firstName: first, lastName: last }, update, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * updateUserByUsername(username, update) - Finds a user by their username, then updates 
 *      them based off of the update object.  Returns the new user document.
 * @param {String} username - The username to search by.
 * @param {Object} update - An object representing the update.
 */
module.exports.updateUserByUsername = function(username, update) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ username: username }, update, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * addUserItemById(id, item) - Finds a user by their id, and adds an item to their userItems array.
 * @param {Number} id - The id of the user.
 * @param {String} itemId - The item object to add to the userItems array.
 * @returns {Promise<any>}
 */
module.exports.addUserItemById = function(id, itemId) {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id })
            .then(doc => {
                // Create a copy of the user's userItems array.
                let userItemsCopy = doc.userItems.slice();

                userItemsCopy.push(itemId);

                return userItemsCopy;
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { _id: id },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * addUserItemByName(first, last, item) - Finds a user by their real name, and adds an item to their userItems array.
 * @param {String} first - The user's first name.
 * @param {String} last - The user's last name.
 * @param {Object} item - The item object to add to the userItems array.
 * @returns {Promise<any>}
 */
module.exports.addUserItemByName = function(first, last, item) {
    return new Promise((resolve, reject) => {
        User.findOne({ firstName: first, lastName: last })
            .then(doc => {
                // Create a copy of the user's userItems array.
                let userItemsCopy = doc.userItems.slice();

                userItemsCopy.push(item);

                return(userItemsCopy)
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { firstName: first, lastName: last },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * addUserItemByUsername(username, item) - Finds a user by their username, and adds an item to their userItems array.
 * @param {String} username - The user's username.
 * @param {Object} item - The item object to add to the userItems array.
 * @returns {Promise<any>}
 */
module.exports.addUserItemByUsername = function(username, item) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then(doc => {
                // Create a copy of the user's userItems array.
                let userItemsCopy = doc.userItems.slice();

                userItemsCopy.push(item);

                return(userItemsCopy)
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { username: username },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * removeUserItemById(id, item) - Finds a user by their id, and removes an item from their userItems array,
 *      returning the new user.  If no item is found, the user is returned unchanged.
 * @param {Number} id - The id of the user.
 * @param {String} itemId - The id of the item to remove.
 * @returns {Promise<any>}
 */
module.exports.removeUserItemById = function(id, itemId) {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id })
            .then(doc => {
                let userItemsCopy = new Array();

                doc.userItems.forEach(userItem => {
                    if(userItem != itemId) {
                        userItemsCopy.push(userItem);
                    }
                })
                
                return userItemsCopy;
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { _id: id },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * removeUserItemByName(first, last, item) - Finds a user by their full name, and removes an item from 
 *      their userItems array, returning the new user.  If no item is found, the user is returned unchanged.
 * @param {String} first - The user's first name.
 * @param {String} last - The user's last name.
 * @param {Number} item - The item object to remove from the userItems array.
 * @returns {Promise<any>}
 */
module.exports.removeUserItemByName = function(first, last, item) {
    return new Promise((resolve, reject) => {
        User.findOne({ firstName: first, lastName: last })
            .then(doc => {
                // Find the index of the item to remove.
                let index = doc.userItems.indexOf(item);

                // Create a copy of the user's userItems array.
                if(index > -1) {
                    var userItemsCopy = doc.userItems.slice(index, 1);
                } else {
                    var userItemsCopy = doc.userItems.slice();
                }
                
                return(userItemsCopy)
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { firstName: first, lastName: last },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * removeUserItemByUsername(username, item) - Finds a user by their username, and removes an item from their userItems array,
 *      returning the new user.  If no item is found, the user is returned unchanged.
 * @param {String} username - The user's username.
 * @param {Object} item - The item object to remove from the userItems array.
 * @returns {Promise<any>}
 */
module.exports.removeUserItemByUsername = function(username, item) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then(doc => {
                // Find the index of the item to remove.
                let index = doc.userItems.indexOf(item);

                // Create a copy of the user's userItems array.
                if(index > -1) {
                    var userItemsCopy = doc.userItems.slice(index, 1);
                } else {
                    var userItemsCopy = doc.userItems.slice();
                }
                
                return(userItemsCopy)
            })
            .then(userItemsCopy => {
                return User.findOneAndUpdate(
                    { username: username },
                    { userItems: userItemsCopy },
                    { new: true }
                ).exec()
                    .then(user => resolve(user))
            })
            .catch(err => reject(err))
    })
}

/**
 * changePasswordById(id, newPassword) - Updates the user's password, returning
 *      the new user.
 * @param {Number} id - The user's _id.
 * @param {String} newPassword - The new password for the user.
 * @returns {Promise<any>}
 */
module.exports.changePasswordById = function(id, newPassword) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ _id: id }, { password: newPassword}, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * changePasswordByUsername(username, newPassword) - Updates the user's password,
 *      returning the new user.
 * @param {String} username - The user's username.
 * @param {String} newPassword - The new password for the user.
 * @returns {Promise<any>}
 */
module.exports.changePasswordByUsername = function(username, newPassword) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ username: username }, { password: newPassword}, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * login(username, password) - Returns the user profile if the correct password is passed.
 * @param {String} username - The passed username.
 * @param {String} hashedPassword - The hashed password.
 * @returns {Promise<any>}
 */
module.exports.login = function(username, hashedPassword) {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .then(user => {
                if(hashedPassword == user.password.hash) {
                    resolve(user);
                } else {
                    reject("Wrong password given.");
                }
            })
            .catch(err => reject(err))
    })
}