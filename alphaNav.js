var check = false,
    isRelative = true;

/**
* A wrapper for document.elementFromPoint
* (some browsers use relative positioning, others use absolute)
* Based on this article: http://goo.gl/gYan0r
* @param x - the relative x coordinate
* @param y - the relative y coordinate
* @returns {DOMElement} the element at the given coordinates
*/
$.elementFromPoint = function (x, y) {
    'use strict';
    var sl;
    if (!document.elementFromPoint) {
        return null;
    }

    if (!check) {
        if ((sl = $(document).scrollTop()) > 0) {
            isRelative = (document.elementFromPoint(0, sl + $(window).height() - 1) === null);
        } else if ((sl = $(document).scrollLeft()) > 0) {
            isRelative = (document.elementFromPoint(sl + $(window).width() - 1, 0) === null);
        }
        check = (sl > 0);
    }

    if (!isRelative) {
        x += $(document).scrollLeft();
        y += $(document).scrollTop();
    }
    return document.elementFromPoint(x, y);
}

/**
* A simple jQuery function to get the current element based on the current event
* @param evt - the event to "parse" the element out of
* @returns {$|null} current event target as a jQuery object, or null if not a supported event
*/
$.getTarget = function (evt) {
    var el;
    switch (evt.type) {
        case 'mousemove':
        case 'touchstart':
        case 'touchend':
        case 'click':
            el = evt.target;
            break;
        case 'touchmove':
            el = $.elementFromPoint(
                evt.originalEvent.touches[0].pageX,
                evt.originalEvent.touches[0].pageY
            );
            break;
        default:
            el = null;
            break;
    }
    if (el !== null) {
        return $(el);
    }
    return el;
}

/*
 *  AlphaNav - A jQuery navigation plugin for navigating an alphabetical list (ex: contacts, countries, etc)
 *  Copyright 2013 Tariq Abusheikh, https://www.tariqabusheikh.com
 *  Released under the MIT, BSD, and GPL Licenses.
 */
$.fn.alphaNav = function (options) {
    var defaults = {
            arrows: false,
            content: '.list-content',
            debug: false,
            growEffect: false,
            height: null,
            letters: [
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
            ],
            overlay: true
        },
        opts = $.extend(defaults, options),
        o = $.meta ? $.extend({}, opts, $$.data()) : opts,
        list = $(this),
        listContent = o.content;
    if (o.overlay) {
        $(list).append('<a id="current-target-overlay"></a>');
        var $overlay = $('#current-target-overlay');
    }
    $(list).addClass('list');
    $(listContent, list).find('li:first').addClass('selected');
    $(list).append('<div class="list-nav"><ul></ul></div>');
    for (var i in o.letters) {
        $('.list-nav ul', list).append("<li><a class='" + o.letters[i] + "' data-target='" + o.letters[i] + "'>" + o.letters[i] + "</a></li>");
    }
    var height  = $('.list-nav', list).height(),
        regSize = parseInt($('.list-nav a').css('font-size'), 10);
    if (o.height) {
        height = o.height;
    }
    $(listContent + ', list-nav', list).css('height', height);
    if (o.debug) {
        $(list).append('<div id="debug">Scroll Offset: <span id="scroll-offset">0</span>. Current Target: <span id="current-target">NONE</span></div>');
    }
    $('.list-nav a', list).on('click touchstart touchmove mousemove', function (evt) {
        evt.preventDefault();
        // return true if the touch event leaves the parent
        if (evt.target.offsetParent.className !== 'list-nav') {
            return false;
        }
        var $el     = $.getTarget(evt),
            target  = $el.data('target'),
            cOffset = $(listContent, list).offset().top,
            tOffset = $(listContent + ' #' + target, list).offset().top,
            height  = $('.list-nav', list).height();
        if (o.height) {
            height = o.height;
        }
        var pScroll = (tOffset - cOffset) - height / 8;
        $(listContent, list).find('li').removeClass('selected');

        $('#' + target).addClass('selected');
        // If overlay enabled, set the content and fade it in
        if (o.overlay) {
            $overlay.html(target).stop().fadeIn('fast');
        }
        // If growEffect enabled, grow the current touch target
        if (o.growEffect) {
            $('.list-nav', list).css('width', '40px');
            $('.list-nav a', list).css('font-size', regSize + 'px');
            var superSize = (regSize * 3) + 'px';
            $el.css('font-size', superSize);
        }
        $(listContent, list).stop().animate({
            scrollTop: '+=' + pScroll + 'px'
        });
        if (o.debug) {
            $('#scroll-offset', list).html(tOffset);
            $('#current-target', list).html(target);
        }
    });

    // Bind the end/leave/out actions (if needed)
    if (o.overlay || o.growEffect) {
        $('.list-nav a', list).on('touchend touchleave mouseout', function (evt) {
            evt.preventDefault();
            // Hide overlay (if enabled)
            if (o.overlay) {
                $overlay.stop().fadeOut('fast');
            }
            // Reset font size (if growEffect enabled)
            if (o.growEffect) {
                $('.list-nav', list).css('width', '25px');
                $('.list-nav a', list).css('font-size', regSize + 'px');
            }
        });
    }
    // If arrows are enabled, prepend/append them and bind the click listeners
    if (o.arrows) {
        $('.list-nav', list).css('top', '20px');
        $(list).prepend('<div class="slide-up end"><span class="arrow up"></span></div>');
        $(list).append('<div class="slide-down"><span class="arrow down"></span></div>');
        $('.slide-down', list).on('click', function () {
            $(listContent, list).animate({
                scrollTop: "+=" + height + "px"
            }, 500);
        });
        $('.slide-up', list).on('click', function () {
            $(listContent, list).animate({
                scrollTop: "-=" + height + "px"
            }, 500);
        });
    }
};