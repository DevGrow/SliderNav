/*
 *  AlphabetSoup - A jQuery navigation plugin for navigating and alphabetical list (ex: contacts, countries, etc)
 *  Copyright 2013 Tariq Abusheikh, https://github.com/triq6
 *  Loosely based on the SliderNav plugin, developed by Monjurul Dolon, http://mdolon.com/
 *  For more information on SliderNav: http://devgrow.com/slidernav
 *  Released under the MIT, BSD, and GPL Licenses.
 */
$.fn.alphabetSoup = function (options) {
    var defaults = {
            arrows: false,
            content: '.list-content',
            debug: false,
            height: null,
            items: [
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
            ],
            overlay: false,
            growEffect: true
        },
        opts = $.extend(defaults, options),
        o = $.meta ? $.extend({}, opts, $$.data()) : opts,
        slider = $(this),
        sliderContent = o.content;
    if (o.overlay) {
        $(slider).append('<a id="current-target-overlay"></a>');
        var $overlay = $('#current-target-overlay');
    }
    console.log("Slider content selector: " + sliderContent);
    $(slider).addClass('slider');
    $(sliderContent, slider).find('li:first').addClass('selected');
    $(slider).append('<div class="slider-nav"><ul></ul></div>');
    for (var i in o.items) {
        $('.slider-nav ul', slider).append("<li><a data-target='" + o.items[i] + "'>" + o.items[i] + "</a></li>");
    }
    var height = $('.slider-nav', slider).height(),
        currSize = parseInt($('.slider-nav a').css('font-size'), 10);
    if (o.height) {
        height = o.height;
    }
    $(sliderContent + ', slider-nav', slider).css('height', height);
    if (o.debug) {
        $(slider).append('<div id="debug">Scroll Offset: <span>0</span></div>');
    }
    $('.slider-nav a', slider).on('mouseover', function (evt) {
        evt.preventDefault();
        var target = $(this).data('target'),
            cOffset = $(sliderContent, slider).offset().top,
            tOffset = $(sliderContent + ' #' + target, slider).offset().top,
            height = $('.slider-nav', slider).height();
        console.log("target", target);
        if (o.height) {
            height = o.height;
        }
        var pScroll = (tOffset - cOffset) - height / 8;
        $(sliderContent, slider).find('li').removeClass('selected');
        $('#' + target).addClass('selected');
        if (o.overlay) {
            $overlay.html(target).show();
        }
        if (o.growEffect) {
            var bigSize = (currSize * 2) + 'px';
            console.log('bigSize: ' + bigSize);
            $(this).stop().animate({
                    fontSize : bigSize
            }, 100);
        }
        $(sliderContent, slider).stop().animate({
            scrollTop: '+=' + pScroll + 'px'
        });
        if (o.debug) {
            $('#debug span', slider).html(tOffset);
        }
    }).on('mouseleave', function (evt) {
        evt.preventDefault();
        if (o.growEffect) {
            $(this).stop().animate({
                fontSize : currSize + 'px'
            });
        }
        if (o.overlay) {
            if ($overlay.is(':visible')) {
                $overlay.fadeOut();
            }
        }
    });
    $('.slider-nav', slider).on('mouseleave', function () {
        if (o.overlay) {
            $overlay.fadeOut();
        }
    });
    if (o.arrows) {
        $('.slider-nav', slider).css('top', '20px');
        $(slider).prepend('<div class="slide-up end"><span class="arrow up"></span></div>');
        $(slider).append('<div class="slide-down"><span class="arrow down"></span></div>');
        $('.slide-down', slider).on('click', function () {
            $(sliderContent, slider).animate({scrollTop: "+=" + height + "px"}, 500);
        });
        $('.slide-up', slider).on('click', function () {
            $(sliderContent, slider).animate({scrollTop: "-=" + height + "px"}, 500);
        });
    }
};