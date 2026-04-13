(function($) {
    "use strict"; // Start of use strict

    // Native smooth scrolling for in-page CTA navigation
    $(document).on('click', 'a.page-scroll', function(event) {
        var targetSelector = $(this).attr('href');

        if (!targetSelector || targetSelector.charAt(0) !== '#') {
            return;
        }

        var target = document.querySelector(targetSelector);

        if (!target) {
            return;
        }

        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 50;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });

        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    function syncNavToHash() {
        var hash = window.location.hash;

        if (!hash || hash.charAt(0) !== '#') {
            return;
        }

        var target = document.getElementById(hash.slice(1));

        if (!target) {
            return;
        }

        $('html, body').stop(true, true).scrollTop($(target).offset().top - 50);
        $('body').scrollspy('refresh');
        $('.navbar-fixed-top .nav li').removeClass('active');
        $('.navbar-fixed-top a[href="' + hash + '"]').parent('li').addClass('active');
    }

    $(window).on('load hashchange', function() {
        window.requestAnimationFrame(syncNavToHash);
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    if (window.ScrollReveal && document.querySelector('.sr-icons, .sr-button, .sr-contact')) {
        window.sr = ScrollReveal();
        sr.reveal('.sr-icons', {
            duration: 600,
            scale: 0.3,
            distance: '0px'
        }, 200);
        sr.reveal('.sr-button', {
            duration: 1000,
            delay: 200
        });
        sr.reveal('.sr-contact', {
            duration: 600,
            scale: 0.3,
            distance: '0px'
        }, 300);
    }

    if ($.fn.magnificPopup && document.querySelector('.popup-gallery')) {
        $('.popup-gallery').magnificPopup({
            delegate: 'a',
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
            },
            image: {
                tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
            }
        });
    }

})(jQuery); // End of use strict
