// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const OfferModel = require('./Offer');
const UserModel = require('./User');

// --- MODEL ---
const OfferFeedbackSchema = new mongoose.Schema({
    _id: Number,
    _userId: {
        required: true,
        type: Number
    },
    _otherUserId: {
        required: true,
        type: Number
    },
    _offerId: {
        required: true,
        type: Number
    },
    starRating: {
        required: true,
        type: Number,
        min: 1,
        max: 5
    },
    comment: String,
    postedOn: Date
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

// Use mongoose-auto-increment to automatically set _id numbers.
OfferFeedbackSchema.plugin(autoIncrement.plugin, 'OfferFeedback');

const OfferFeedback = db.model('OfferFeedback', OfferFeedbackSchema);

// --- MODULE EXPORTS ---

module.exports.OfferFeedback = OfferFeedback;

/**
 * getFeedbackByOffer(offerId) - Returns all feedback for an offer.
 * @param {Number} offerId - The _id attribute of the offer.
 * @returns {Promise<any>}
 */
module.exports.getFeedbackByOffer = function(offerId) {
    return new Promise((resolve, reject) => {
        OfferFeedback.find({ _offerId: offerId })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    });
}

/**
 * getFeedbackByUser(userId) - Returns all feedback for a user.
 * @param {Number} userId - The _id attribute of the user.
 * @returns {Promise<any>}
 */
module.exports.getFeedbackFromUser = function(userId) {
    return new Promise((resolve, reject) => {
        OfferFeedback.find({ _userId: userId })
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    });
}

/**
 * getFeedbackForUser - Returns up to the 3 most recent feedback given for the passed user.
 * @param {Number} userId - The _id attribute of the user.
 * @returns {Promise<any>}
 */
module.exports.getFeedbackForUser = function(userId) { 
    return new Promise((resolve, reject) => {
        OfferFeedback.find({ _otherUserId: userId })
            .sort({ postedOn: -1 })
            .limit(3)
            .exec()
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    })
}

/**
 * addFeedback(offerId, userId, otherUserId, starRating, comment) - Creates an offerFeedback document.
 * @param {Number} offerId - The _id attribute of the offer.
 * @param {Number} userId - The _id attribute of the user making the feedback.
 * @param {Number} otherUserId - The _id attribute of the user being reviewed.
 * @param {Number} starRating - The rating the user gave the other user.
 * @param {String} comment - Any comment the user made.
 * @returns {Promise<any>}
 */
module.exports.addFeedback = function(offerId, userId, otherUserId, starRating, comment) {
    return new Promise((resolve, reject) => {
        let newFeedback = new OfferFeedback({
            _userId: userId,
            _otherUserId: otherUserId,
            _offerId: offerId,
            starRating: starRating,
            comment: comment,
            postedOn: Date.now()
        })

        console.log("userId: " + userId + ", otherUserId: " + otherUserId);

        newFeedback.save()
            .then(feedback => OfferModel.feedbackGiven(offerId, userId, feedback._id))
            .then(() => {
                return UserModel.getUserById(otherUserId)
                    .then(user => {
                        return user;
                    })
            })
            .then(user => {
                let oldActualValue = user.rating.actualValue;
                let oldNumberOfVotes = user.rating.numberOfVotes;

                let newNumberOfVotes = oldNumberOfVotes + 1;
                let newActualValue = ((oldActualValue * oldNumberOfVotes) + parseInt(starRating)) / newNumberOfVotes;
                let newValue = Math.round(newActualValue);

                let update = {
                    rating: {
                        value: newValue,
                        actualValue: newActualValue,
                        numberOfVotes: newNumberOfVotes
                    }
                };

                return UserModel.updateUserById(otherUserId, update)
                    .then(user => resolve(user));
            })
            .catch(err => reject(err))
    });
}

module.exports.deleteReview = function(reviewId, userId) {
    return new Promise((resolve, reject) => {
        let results = new Array();

        OfferFeedback.findOne({ _id: reviewId, _userId: userId })
            .then(feedback => {
                results.push(feedback);

                return UserModel.getUserById(feedback._otherUserId)
                    .then(user => {
                        results.push(user);
                        return results;
                    })
            })
            .then(results => {
                let oldValue = results[1].rating.actualValue;
                let oldNumberOfVotes = results[1].rating.numberOfVotes;
                let reviewValue = results[0].starRating;

                let newNumberOfVotes = oldNumberOfVotes - 1;

                if(newNumberOfVotes != 0) {
                    var newActualValue = ((oldValue * oldNumberOfVotes) - reviewValue) / newNumberOfVotes;
                    var newValue = Math.round(newActualValue);
                } else {
                    var newActualValue = 0;
                    var newValue = 0;
                }
                
                let update = {
                    rating: {
                        value: newValue,
                        actualValue: newActualValue,
                        numberOfVotes: newNumberOfVotes
                    }
                };

                results.push(update);

                return results;
            })
            .then(results => {
                return UserModel.updateUserById(results[1]._id, results[2])
                    .then(() => {
                        return results;
                    })
            })
            .then(results => {
                return OfferModel.removeReview(results[0]._offerId, results[0]._userId)
                    .then(() => {
                        return results;
                    })
            })
            .then(results => {
                OfferFeedback.findOneAndDelete({ _id: results[0]._id })
                    .then(doc => resolve(doc));
            })
            .catch(err => reject(err))
    });
}

/**
 * editFeedback(offerId, userId, otherUserId, rating, comment, oldRating) - Handles updating an offer feedback document.
 * @param {Number} offerId - The _id attribute of the offer.
 * @param {Number} userId - The _id attribute of the user who made the offer.
 * @param {Number} otherUserId - The _id attribute of the user the feedback is for.
 * @param {Number} rating - The new rating.
 * @param {String} comment - The comment attached to the review.
 * @param {Number} oldRating - The old rating.
 * @returns {Promise<any>}
 */
module.exports.editFeedback = function(offerId, userId, otherUserId, rating, comment, oldRating) {
    return new Promise((resolve, reject) => {
        let update = {
            starRating: rating,
            comment: comment
        };

        let results = new Array();

        OfferFeedback.findOne({ _offerId: offerId, _userId: userId, _otherUserId: otherUserId })
            .then(review => {
                results.push(review);
                return results;
            })
            .then(results => {
                return UserModel.getUserById(otherUserId)
                    .then(user => {
                        results.push(user);
                        return results;
                    })
            })
            .then(results => {
                let oldActualValue = results[1].rating.actualValue;            

                let numberOfVotes = results[1].rating.numberOfVotes;
                let newActualValue = (((oldActualValue * numberOfVotes) - oldRating) + rating) / numberOfVotes;
                let newValue = Math.round(newActualValue);

                let userUpdate = {
                    rating: {
                        value: newValue,
                        actualValue: newActualValue,
                        numberOfVotes: numberOfVotes
                    }
                };

                results.push(userUpdate);
                return results;
            })
            .then(results => {
                return UserModel.updateUserById(results[1]._id, results[2])
                    .then(() => {
                        return results;
                    })
            })
            .then(results => {
                OfferFeedback.findOneAndUpdate({ _id: results[0]._id }, update, { new: true })
                    .then(review => resolve(review))
            })
            .catch(err => reject(err))
    });
}