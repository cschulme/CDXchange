var toTitleCase = function(inString) {
    var result = inString.replace(inString, function(inString) {
        return inString.charAt(0).toUpperCase() + inString.substr(1).toLowerCase();
    });

    return result;
}

var validateCategory = function(inCategory) {
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

module.exports = {
    toTitleCase: toTitleCase,
    validateCategory: validateCategory
};