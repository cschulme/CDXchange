// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

// --- MODEL ---
const OfferSchema = new mongoose.Schema({
    _id: Number,
    _userId: {
        required: true,
        type: Number
    },
    userRated: {
        status: Boolean,
        _feedbackId: Number
    },
    _ownedItemId: {
        required: true,
        type: String
    },
    _wantedItemId: String,
    _otherUserId: Number,
    otherUserRated: {
        status: Boolean,
        _feedbackId: Number  
    },
    status: {
        required: true,
        type: String,
        enum: ['Available', 'Pending', 'Swapped']
    }
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

// Use mongoose-auto-increment to automatically set _id numbers.
OfferSchema.plugin(autoIncrement.plugin, 'Offer');

const Offer = db.model('Offer', OfferSchema);

// --- MODULE EXPORTS ---

module.exports.Offers = Offer;

/**
 * getOfferById(id) - Gets an offer by the passed id.
 * @param {Number} id - The id of the offer.
 * @returns {Promise<any>}
 */
module.exports.getOfferById = function(id) {
    return new Promise((resolve, reject) => {
        Offer.findOne({ _id: id })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

 /**
  * getOffersByUserId(userId) - Returns all offers made by a specific user, as found by their _userId.
  * @param {Number} userId - The id representing the user we're filtering by.
  * @returns {Promise<any>}
  */
module.exports.getOffersByUserId = function(userId) {
    return new Promise((resolve, reject) => {
        Offer.find({ _userId: userId })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * getOffersInvolvingUser(userId) - Returns all offers where the specified user is the _otherUserId.
 * @param {Number} userId - The _id of the user we're filtering by.
 * @returns {Promise<any>}
 */
module.exports.getOffersInvolvingUser = function(userId) {
    return new Promise((resolve, reject) => {
        Offer.find({ _otherUserId: userId })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * getOffersFromOtherUsers(userId) - Returns all offers made by other users to a specified user, as 
 *      found by their user id.
 * @param {Number} userId - The id representing the user we're filtering by.
 * @returns {Promise<any>}
 */
module.exports.getOffersFromOtherUsers = function(userId) {
    return new Promise((resolve, reject) => {
        Offer.find({ _userId: { $ne: userId }})
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * getOfferByUserIdAndOwnedItem(userId, item) - Finds the
 */
module.exports.getOfferByUserIdAndOwnedItem = function(userId, item) {
    return new Promise((resolve, reject) => {
        Offer.findOne({ _userId: userId, _ownedItemId: item })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * getAvailableOffersForItem(userId, itemId) - Returns all available offers for a given album.
 * @param {Number} userId - The active user's _userId, for filtering.
 * @param {String} itemId - The item in question.
 * @returns {Promise<any>}
 */
module.exports.getAvailableOffersForItem = function(userId, itemId) {
    return new Promise((resolve, reject) => {
        Offer.find({ _userId: { $ne: userId }, _ownedItemId: itemId, status: 'Available' })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * addOffer(ownedItemId, wantedItemId, status) - Creates a new offer document.
 * @param {Number} userId - A code attaching the offer to the user making the offer.
 * @param {String} ownedItemId - A code pointing to the item that the user owns.
 * @param {String} wantedItemId - A code pointing to the item taht the user
 *      wants in exchange for their item.
 * @param {Number} otherUserId - The id of the other user who's matched the offer, if they exist.
 * @param {String} status - Available/Pending/Swapped
 * @returns {Promise<any>}
 */
module.exports.addOffer = function(userId, ownedItemId, wantedItemId, otherUserId, status) {
    return new Promise((resolve, reject) => {
        let newOffer = new Offer({
            _userId: userId,
            userRated: {
                status: false,
                _feedbackId: undefined
            },
            _ownedItemId: ownedItemId,
            _wantedItemId: wantedItemId,
            _otherUserId: otherUserId,
            otherUserRated: {
                status: false,
                _feedbackId: undefined
            },
            status: status
        });
    
        newOffer.save()
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })   
}

/**
 * updateStatus(id, newStatus) - Updates the status of an offer, returning the new offer document.
 * @param {Number} id - Id of the offer being updated.
 * @param {String} newStatus - The new status of the offer.
 * @returns {Promise<any>}
 */
module.exports.updateStatus = function(id, newStatus) {
    return new Promise((resolve, reject) => {
        Offer.findOneAndUpdate({ _id: id }, { status: newStatus }, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * matchFound(id, otherUserId) - When another user matches the offer, this function updates the 
 *      offer to reflect that and then returns the new offer document.
 * @param {Number} id - The id of the offer.
 * @param {Number} otherUserId - The other user's id.
 * @returns {Promise<any>}
 */
module.exports.matchFound = function(id, otherUserId) {
    return new Promise((resolve, reject) => {
        Offer.findOneAndUpdate({ _id: id }, { _otherUserId: otherUserId, status: 'Pending' }, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * matchRescinded(id) - Resets a match to available and clears the matched user's id.
 * @param {Number} id - The id of the offer.
 * @returns {Promise<any>}
 */
module.exports.matchRescinded = function(id) {
    return new Promise((resolve, reject) => {
        Offer.findOneAndUpdate({ _id: id}, { _otherUserId: undefined, status: 'Available' }, { new: true })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * deleteOffer(id) - Deletes an offer attached to a passed _id.
 *      Returns the deleted offer.
 * @param {Number} id - The id of the offer.
 * @returns {Promise<any>}
 */
module.exports.deleteOffer = function(id) {
    return new Promise((resolve, reject) => {
        Offer.findOneAndDelete({ _id: id })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    })
}

/**
 * getNumberOfOffersInvolvingAUser(userId) - Returns a count of all the offers
 *      where the passed user is either the _userId or the _otherUserId.
 * @param {Number} userId - The id of the user.
 * @returns {Promise<any>}
 */
module.exports.getNumberOfOffersInvolvingAUser = function(userId) {
    return new Promise((resolve, reject) => {
        Offer.countDocuments({ $or: [{ _userId: userId }, { _otherUserId: userId }] })
            .then(doc => resolve(doc))
            .catch(err => reject(err))
    });
}

/**
 * feedbackGiven(offerId, userId, feedbackId) - Attaches a OfferFeedback document to 
 *      an offer after figuring out if the passed user is involved with the offer and
 *      on which end the user belongs to.
 * @param {Number} offerId - The id of the offer.
 * @param {Number} userId - The id of the user.
 * @param {Number} feedbackId - The id of the feedback document.
 * @return {Promise<any>}
 */
module.exports.feedbackGiven = function(offerId, userId, feedbackId) {
    return new Promise((resolve, reject) => {
        Offer.findOne({ _id: offerId })
            .then(offer => {
                if(userId == offer._userId) {
                    let update = {
                        userRated: {
                            status: true,
                            _feedbackId: feedbackId
                        }
                    };

                    Offer.findOneAndUpdate({ _id: offerId }, update, { new: true })
                        .then(offer => resolve(offer));
                } else if(userId == offer._otherUserId) {
                    let update = {
                        otherUserRated: {
                            status: true,
                            _feedbackId: feedbackId
                        }
                    };

                    Offer.findOneAndUpdate({ _id: offerId }, update, { new: true })
                        .then(offer => resolve(offer));
                } else {
                    return reject("User isn't involved in offer.");
                }
            })
            .catch(err => reject(err))
    });
}

/**
 * removeReview(offerId, userId) - Removes a review from an offer given an offerId and a userId.
 * @param {Number} offerId - The _id attribute of the offer.
 * @param {Number} userId - The _id attribute of the user.
 * @returns {Promise<any>}
 */
module.exports.removeReview = function(offerId, userId) {
    return new Promise((resolve, reject) => {
        Offer.findOne({ _id: offerId })
            .then(offer => {
                if(userId == offer._userId) {
                    let update = {
                        userRated: {
                            status: false,
                            _feedbackId: undefined
                        }
                    };

                    Offer.findOneAndUpdate({ _id: offerId }, update, { new: true })
                        .then(offer => resolve(offer))
                } else if(userId == offer._otherUserId) {
                    let update = {
                        otherUserRated: {
                            status: false,
                            _feedbackId: undefined
                        }
                    };

                    Offer.findOneAndUpdate({ _id: offerId }, update, { new: true })
                        .then(offer => resolve(offer));
                } else {
                    return reject("User isn't involved in offer.");
                }
            })
            .catch(err => reject(err))
    });
}