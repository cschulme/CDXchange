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

    $('.modal__sign-in--close').click(function() {
        $('.modal__sign-in').removeClass("modal--show");
    });

    $('.modal').mousedown(function(e) {
        var clicked = $(e.target);

        if (clicked.is('.modal--content') || clicked.parents().is('.modal--content')) {
            return;
       } else {
         $('.modal').removeClass("modal--show");
       }
    });
});