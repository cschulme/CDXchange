// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const ItemModel = require('./Item');

// --- MODEL ---
const ItemFeedbackSchema = new mongoose.Schema({
    _id: Number,
    _userId: {
        required: true,
        type: Number
    },
    _itemId: {
        required: true,
        type: String
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
ItemFeedbackSchema.plugin(autoIncrement.plugin, 'ItemFeedback');

const ItemFeedback = db.model('ItemFeedback', ItemFeedbackSchema);

// --- MODULE EXPORTS ---

module.exports.ItemFeedback = ItemFeedback;

/**
 * getFeedbackForItem(itemId) - Returns all the feedback for an item.
 * @param {String} itemId - The id for the item in question.
 * @returns {Promise<any>}
 */
module.exports.getFeedbackForItem = function(itemId) {
    return new Promise((resolve, reject) => {
        ItemFeedback.find({ _itemId: itemId }).sort({ postedOn: -1 }).exec()
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    });
}


/**
 * addFeedback(userId, itemId, starRating, comment) - Creates a new ItemFeedback document.
 * @param {Number} userId - The id of the user creating the feedback.
 * @param {String} itemId - The id of the item the feedback is about.
 * @param {Number} starRating - The rating for the item, 1-5.
 * @param {String} comment - A comment attached to the feedback.
 * @returns {Promise<any>}
 */
module.exports.addFeedback = function(userId, itemId, starRating, comment) {
    return new Promise((resolve, reject) => {
        ItemModel.getItem(itemId)
            .then(item => {
                let parsedStarRating = parseInt(starRating);
                let newNumberOfVotes = item.rating.numberOfVotes + 1;
                let newActualValue = (((item.rating.actualValue * item.rating.numberOfVotes) + parsedStarRating) / newNumberOfVotes);
                let newValue = Math.round(newActualValue);

                let result = {
                    rating: {
                        value: newValue,
                        actualValue: newActualValue,
                        numberOfVotes: newNumberOfVotes
                    }
                }

                return result;
            })
            .then(update => {
                return ItemModel.updateItem(itemId, update)
            })
            .then(() => {
                let newFeedback = new ItemFeedback({
                    _userId: userId,
                    _itemId: itemId,
                    starRating: starRating,
                    comment: comment,
                    postedOn: Date.now()
                })

                newFeedback.save()
                    .then(doc => resolve(doc))
                    .catch(err => reject(err))
            })
            .catch(err => reject(err))
    });
}

/**
 * getFeedbackByUser(userId, limit) - Gets the most recent feedback from a user, up to the passed limit.
 * @param {Number} userId - The id for the user the feedback should be from.
 * @param {Number} limit - The limit of the number of feedback documents to get.
 * @returns {Promise<any>}
 */
module.exports.getFeedbackByUser = function(userId, limit) {
    return new Promise((resolve, reject) => {
        ItemFeedback.find({ _userId: userId })
            .sort({ postedOn: -1})
            .limit(limit)
            .exec()
            .then(docs => resolve(docs))
            .catch(err => reject(err))
    });
}

/**
 * deleteReview(reviewId, userId) - If a review with the id is from the passed user, 
 *      deletes it and returns the deleted review.  This also updates the item to reflect
 *      this change.
 * @param {Number} reviewId - The id for the review.
 * @param {Number} userId - The id of the user who may have made the review.
 * @returns {Promise<any>}
 */
module.exports.deleteReview = function(reviewId, userId) {
    return new Promise((resolve, reject) => {
        let results = new Array();

        ItemFeedback.findOne({ _id: reviewId, _userId: userId })
            .then(feedback => {
                results.push(feedback);

                return ItemModel.getItem(feedback._itemId)
                    .then(item => {
                        results.push(item);
                        return results;
                    });
            })
            .then(results => {
                let oldValue = results[1].rating.actualValue;
                let oldNumberOfVotes = results[1].rating.numberOfVotes;
                let reviewValue = results[0].starRating;

                let newNumberOfVotes = oldNumberOfVotes - 1;
                let newActualValue = ((oldValue * oldNumberOfVotes) - reviewValue) / newNumberOfVotes;
                let newValue = Math.round(newActualValue);
                
                results.push(newNumberOfVotes);
                results.push(newActualValue);
                results.push(newValue);

                return results;
            })
            .then(results => {
                let update = {
                    rating: {
                        value: results[4],
                        actualValue: results[3],
                        numberOfVotes: results[2]
                    }
                }

                return ItemModel.updateItem(results[1]._id, update)
                    .then(() => {
                        return results;
                    })
            })
            .then(results => {
                ItemFeedback.findOneAndDelete({ _id: results[0]._id })
                    .then(doc => resolve(doc));
            })
            .catch(err => reject(err))
    });
}

/**
 * getNumberOfReviewsByUser(userId) - Returns the number of item reviews a user has made.
 * @param {Number} userId - The id of the user to search for.
 * @returns {Promise<any>}
 */
module.exports.getNumberOfReviewsByUser = function(userId) {
    return new Promise((resolve, reject) => {
        ItemFeedback.countDocuments({ _userId: userId })
            .then(count => resolve(count))
            .catch(err => reject(err))
    });
}

module.exports.editFeedback = function(itemId, userId, rating, comment, oldRating) {
    return new Promise((resolve, reject) => {
        let update = {
            starRating: rating,
            comment: comment
        };

        let results = new Array();

        ItemFeedback.findOne({ _itemId: itemId, _userId: userId })
            .then(review => {
                results.push(review)
                return results;
            })
            .then(results => {
                return ItemModel.getItem(itemId)
                    .then(item => {
                        results.push(item);
                        return results;
                    })
            })
            .then(results => {
                let oldActualValue = results[1].rating.actualValue;

                let numberOfVotes = results[1].rating.numberOfVotes;
                let newActualValue = (((oldActualValue * numberOfVotes) - oldRating) + parseInt(rating)) / numberOfVotes;
                let newValue = Math.round(newActualValue);

                let itemUpdate = {
                    rating: {
                        value: newValue,
                        actualValue: newActualValue,
                        numberOfVotes: numberOfVotes
                    }
                };

                results.push(itemUpdate);
                return results;
            })
            .then(results => {
                return ItemModel.updateItem(itemId, results[2])
                    .then(() => {
                        return results;
                    })
            })
            .then(results => {
                ItemFeedback.findOneAndUpdate({ _id: results[0]._id }, update, { new: true })
                    .then(review => resolve(review))
            })
            .catch(err => reject(err))
    });
}