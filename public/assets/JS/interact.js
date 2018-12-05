$(document).ready(function() {
    $('.collapse').click(function() {
        $('body').removeClass("nav-expanded").addClass("nav-collapsed");
        $('.general-nav').addClass("general-nav__collapsed");
        $('.collapse').addClass("display__none");
        $('.expand').removeClass("display__none");
    });
    
    $('.expand').click(function() {
        $('.general-nav').removeClass("general-nav__collapsed");
        $('.expand').addClass("display__none");
        $('.collapse').removeClass("display__none");
        $('body').removeClass("nav-collapsed").addClass("nav-expanded");
    });

    $('.search__expand').click(function() {
        $('.search__expand').addClass("display__none");
        $('.search__bar--submit').removeClass("display__none");
        $('.search__bar').removeClass("display__none").addClass("search__bar--expanded");
    });

    $('.modal__sign-in--trigger').click(function() {
        $('.modal__sign-in').addClass("modal--show");
    });

    $('.modal__select--trigger').click(function() {
        $('.modal__select').addClass("modal--show");
    });

    $('.modal__rate--trigger').click(function() {
        $('.modal__rate').addClass("modal--show");
    });

    $('.modal--close').click(function() {
        $('.modal').removeClass("modal--show");
    });

    $('.modal').mousedown(function(e) {
        var clicked = $(e.target);

        if (clicked.is('.modal--content') || clicked.parents().is('.modal--content')) {
            return;
       } else {
         $('.modal').removeClass("modal--show");
       }
    });

    $('.form__radio-button').click(function() {
        if($('.ownedItemRadio').is(':checked') && ($('.wantedItemRadio').is(':checked'))) {
            $("#form--submit").prop('disabled', false)
                .removeClass('button__bubble--inactive')
                .addClass('button__bubble');
        }        
    });

    $('.star-rating input:radio').attr('checked', false);

    $('.star-rating input').click(function() {
        $('.star-rating span').removeClass('star-rating--checked');
        $(this).parent().addClass('star-rating--checked');
        $('#rate-item--submit').prop('disabled', false)
            .removeClass('button__bubble--inactive')
            .addClass('button__bubble');
    });
});

// --- Non-jQuery Functions ---

function deleteUserReviewPrompt(reviewId) {
    if(confirm("Are you sure you want to delete this review?")) {
        window.location = '/rateOffer?action=delete&theReview=' + reviewId;
    }
}

function editUserReview(offerId, username, userId, comment, oldRating) {
    $('.modal__select--header h2').html("Edit Your Review Of " + username)
    $('#userId').attr('value', userId);
    $('#offerId').attr('value', offerId);
    $('#oldRating').attr('value', oldRating);
    $('#rate-text-area').attr('placeholder', "Any comments on " + username + "?")
    if(comment != undefined && comment != '') {
        $('#rate-text-area').html(comment);
    }
    $('.modal__rate').addClass("modal--show");
}

function deleteItemReviewPrompt(reviewId) {
    if(confirm("Are you sure you want to delete this review?")) {
        window.location = '/rateItem?action=delete&theReview=' + reviewId;
    }
}

function editItemReview(comment, oldRating, itemName) {
    $('.modal__select--header h2').html("Edit Your Review Of " + itemName);
    $('#rate-item-form').attr('action', '/editItemFeedback');
    $('#oldRating').attr('value', oldRating);
    if(comment != undefined && comment != '') {
        $('#rate-text-area').html(comment);
    }
    $('.modal__rate').addClass("modal--show");
}

function rateUser(offerId, username, otherUserId) {
    $('.modal__select--header h2').html("Rate " + username);
    $('#userId').attr('value', otherUserId);
    $('#offerId').attr('value', offerId);
    $('#rateTextArea').attr('placeholder', "Any comments on " + username + "?")
    $('.modal__rate').addClass("modal--show");
}