/**
 * toTitleCase(inString) - Converts the string to a title case form.
 * @param {String} inString - The string to be converted.
 * @returns {String} The converted string in title case.
 */
module.exports.toTitleCase = function(inString) {
    var result = inString.replace(inString, (inString) => {
        return inString.charAt(0).toUpperCase() + inString.substr(1).toLowerCase();
    });

    return result;
}

/**
 * validateCategory(inCategory) - Validates that a passed category is on the approved list.
 * @param {String} inCategory - The category to be validated.
 * @returns {Boolean} True if it's a valid category, false otherwise.
 */
module.exports.validateCategory = function(inCategory) {
    switch(inCategory) {
        case 'Pop':
        case 'Alternative':
        case 'Rock':
        case 'Rap':
        case 'Metal':
        case 'Country':
            return true;
            break;
        default:
            return false;
    }
}