(function ($) {
    /**
     * A wrapper for document.elementFromPoint
     * (some browsers use relative positioning, others use absolute)
     * Based on this article: http://goo.gl/gYan0r
     * @param x - the relative x coordinate
     * @param y - the relative y coordinate
     * @returns {HTMLElement} the element at the given coordinates
     */
    function elementFromPoint(x, y) {
        'use strict';
        var sl,
            check = false,
            isRelative = true;
        if (!document.elementFromPoint) {
            return null;
        }

        if (!check) {
            sl = $(document).scrollTop();
            if (sl > 0) {
                isRelative = (document.elementFromPoint(0, sl + $(window).height() - 1) === null);
            } else {
                sl = $(document).scrollLeft();
                if (sl > 0) {
                    isRelative = (document.elementFromPoint(sl + $(window).width() - 1, 0) === null);
                }
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
     * A simple jQuery function to get the current element based on the passed in event
     * @param evt - the event to pull the element out of
     * @returns {$|null} current event target as a jQuery object, or null if not a supported event
     */
    function getTarget(evt) {
        'use strict';
        var el;
        switch (evt.type) {
        case 'mousemove':
        case 'touchstart':
        case 'touchend':
        case 'click':
            el = evt.target;
            break;
        case 'touchmove':
            el = elementFromPoint(evt.originalEvent.touches[0].pageX, evt.originalEvent.touches[0].pageY);
            break;
        default:
            el = null;
            break;
        }
        if (el !== null) {
            el = $(el);
        }
        return el;
    }



    /**
     *  AlphaNav - A jQuery navigation plugin for navigating an alphabetical list (ex: contacts, countries, etc)
     *  Copyright 2014 triq6, https://github.com/triq6
     *  Released under the MIT, BSD, and GPL Licenses.
     */
    $.fn.alphaNav = function (options) {
        'use strict';
        var opts      = $.extend(true, {}, $.fn.alphaNav.defaults, options),
            $list     = $(this),
            container = $(this).parent(),
            height    = $(window).height(),
            $wrapper,
            $overlay,
            $debugDiv,
            $slider,
            $ul,
            $letters;
        if (opts.debug) {
            console.debug('constructing alphaNav! Options: ', opts);
        }
        // add the alphanav-list class to the list content
        $list.addClass('alphanav-list');
        // Create wrapper div, prepend to parent container, then shove the list content into it
        $wrapper = $('<div />').attr(opts.wrapperAttributes).prependTo(container).prepend($list);
        // Append #alphanav-slider to wrapper
        $slider = $('<div id="alphanav-slider" class="alphanav-component"><ul></ul></div>').appendTo($wrapper);
        $slider.addClass(opts.listSide);
        // Trim the letters array if trimList is enabled
        if (opts.trimList) {
            if (opts.debug) {
                console.groupCollapsed('trimList info');
            }
            for (var i in opts.letters) {
                var headerClass = 'li.' + opts.headerClassPrefix + opts.letters[i],
                    $header     = $list.find(headerClass);
                if (opts.debug) {
                    console.debug('headerClass: "' + headerClass + '", $header: ', $header);
                }
                if ($header.length === 0) {
                    if (opts.trimReplacement === null) {
                        delete opts.letters[i];
                    } else {
                        opts.letters[i] = opts.trimReplacement;
                    }
                }
            }
            if (opts.debug) {
                console.groupEnd();
            }
        }
        // Shove all the letters into #alphanav-slider ul
        $ul = $slider.find('ul');
        for (var x in opts.letters) {
            $ul.append("<li class='letter'>" + opts.letters[x] + "</li>");
        }
        // Pull the slider chars into the $letters object
        $letters = $ul.find('li');
        // Append #alphanav-target-overlay to wrapper (if needed)
        if (opts.overlay) {
            $overlay = $('<div id="alphanav-target-overlay" class="alphanav-component"></div>').appendTo($wrapper);
        }
        // Append #alphanav-debug (if needed)
        if (opts.debug) {
            console.debug("Debug mode enabled! Appending #alphanav-debug");
            $debugDiv = $('<div id="alphanav-debug" class="alphanav-component">Scroll Offset: ' +
                '<span id="debug-scroll-offset">0</span>. Target: <span id="debug-current-target">NONE</span></div>').appendTo($wrapper);
        }
        // Override height if passed in via options, then set $list to that height
        if (opts.height) {
            height = parseInt(opts.height, 10) + 'px';
            if (opts.debug) {
                console.debug("Height being set to: " + height);
            }
        }
        $list.css('height', height);
        // Set #alphanav-slider 'top' & 'height' properties to match the list content
        $slider.css({
            top: $list.offset().top,
            height: height
        });
        // Add .current to the first item in the list
        $list.find('li:first').addClass('current');
        // Bind the user actions (mouseover, touchmove, etc)
        $letters.on('click touchstart touchmove mousemove', function (evt) {
            evt.preventDefault();
            // return true if the touch event leaves the parent
            if (evt.target.offsetParent.id !== 'alphanav-slider') {
                if (opts.debug) {
                    console.debug('click/touch is not inside alphanav-slider div. returning false');
                }
                return false;
            }
            var $el = getTarget(evt),
                t   = $el.html(),
                $target,
                tOffset;
            // abort if t is not 1 char long, or if it is a trimmed char
            if (t.length > 1 || (opts.trimList && t === opts.trimReplacement)) {
                return;
            }
            $target = $('li.' + opts.headerClassPrefix + t, $list);
            // abort if $el or $target doesn't exist
            if ($el === undefined || $target === undefined || $target.length === 0) {
                return false;
            }
            // Get the top offset
            tOffset = $target.offset().top;// - parseInt($target.outerHeight(), 10);
            // Remove current class from all headers, then add it to current header
            $list.find('li').removeClass('current');
            $target.addClass('current');
            // If overlay enabled, set the content and fade it in
            if (opts.overlay) {
                $overlay.html(t).stop().fadeIn('fast');
            }
            // If growEffect enabled, grow the current touch target
            if (opts.growEffect) {
                $slider.css('width', '40px');
                $letters.removeClass('current');
                $el.addClass('current');
            }
            // Update the debug div (if enabled)
            if (opts.debug) {
                $('#debug-scroll-offset').html(tOffset);
                $('#debug-current-target').html(t);
            }
            // Perform the scrolling
            $list.stop().animate({
                scrollTop: '+=' + tOffset + 'px'
            }, opts.scrollDuration);
            // Call the onScrollComplete callback function (default: empty fn)
            opts.onScrollComplete.call(this);
        });

        // Bind the end/leave/out actions (if needed)
        if (opts.overlay || opts.growEffect) {
            $letters.on('touchend touchleave mouseout', function (evt) {
                evt.preventDefault();
                // Hide overlay (if enabled)
                if (opts.overlay) {
                    $overlay.stop().fadeOut('slow');
                }
                // Reset font size (if growEffect enabled)
                if (opts.growEffect) {
                    $slider.css('width', '25px');
                    $letters.removeClass('current');
                }
            });
        }
        // If arrows are enabled, prepend/append them and bind the click listeners
        if (opts.arrows) {
            if (opts.debug) {
                console.debug('up/down arrows enabled! Adding HTML + binding click events');
            }
            var $upBtn   = $('<div id="alphanav-btn-slide-up" class="alphanav-component alphanav-arrow"></div>').prependTo($wrapper),
                $downBtn = $('<div id="alphanav-btn-slide-down" class="alphanav-component alphanav-arrow"></div>').appendTo($wrapper);
            // Bind click to "Up" button
            $upBtn.off('click').on('click', function (evt) {
                evt.preventDefault();
                $list.animate({
                    scrollTop: "-=" + height + "px"
                }, opts.scrollDuration);
                // Call the onScrollComplete callback function (default: empty fn)
                opts.onScrollComplete.call(this);
            });
            // Bind click to "Down" button
            $downBtn.off('click').on('click', function (evt) {
                evt.preventDefault();
                $list.animate({
                    scrollTop: "+=" + height + "px"
                }, opts.scrollDuration);
                // Call the onScrollComplete callback function (default: empty fn)
                opts.onScrollComplete.call(this);
            });
        }

        // Resize now + bind to window resizing
        if (opts.autoHeight) {
            $.fn.alphaNav.resize();
            $(window).on('resize', $.fn.alphaNav.resize());
        }
        // For chaining
        return this;
    };

    /**
     * Remove alphanav wrapper + components
     */
    $.fn.alphaNav.destroy = function () {
        'use strict';
        var $wrapper   = $('#alphanav-slider').parent(),
            $container = $wrapper.parent(),
            $list      = $wrapper.find('.alphanav-list');
        $container.prepend($list);
        $wrapper.remove();
        return true;
    };

    /**
     * Resize the alphabet slider
     */
    $.fn.alphaNav.resize  = function () {
        'use strict';
        var $slider       = $('#alphanav-slider'),
            $letters      = $slider.find('.letter'),
            wrapperHeight = $slider.parent().outerHeight(),
            windowHeight  = $(window).height(),
            totalLettersHeight = 0,
            heightDiff,
            finalMargin;
        // If wrapper height > window height, reset wrapper height to equal window height (no point in a scroller that doesn't fit on one page)
        if (wrapperHeight > windowHeight) {
            wrapperHeight = windowHeight;
        }
        // Loop through letters to get their actual height
        $letters.each(function () {
            totalLettersHeight += $(this).outerHeight();
        });
        // Let's make sure that wrapperHeight > totalLettersHeight. If it is, make the letters smaller
        if (wrapperHeight < totalLettersHeight) {
            // Loop over letters, making them 1px shorter every time, until their height < wrapperHeight
            do {
                var currLetterHeight = parseInt($letters.css('height'), 10),
                    newLetterHeight = currLetterHeight - 1;
                $letters.css('height', newLetterHeight + 'px');
                // Reset totalLettersHeight to 0, then recalculate
                totalLettersHeight = 0;
                $letters.each(totalLettersHeight += $(this).outerHeight());
            } while (wrapperHeight < totalLettersHeight);
        }
        // final margin = (leftover space / # of letters)
        heightDiff  = wrapperHeight - totalLettersHeight;
        finalMargin = Math.floor(heightDiff / $letters.length);
        // Set to 0 if negative, then apply
        if (finalMargin < 0) {
            finalMargin = 0;
        }
        $letters.css('margin', finalMargin + 'px 0');
    };

    /**
     * Default options for alphaNav
     */
    $.fn.alphaNav.defaults = {
        arrows: false, // Include the up/down arrows
        autoHeight: true, // Adjust alphabet list height automatically
        container: null, // The selector to insert everything into
        debug: false, // Include debug div
        growEffect: false, // Grow the text as you drag your finger/mouse over it
        headerClassPrefix: 'alphanav-header-', // Prefix for letter headers, followed by the letter, i.e. .alphanav-header-A
        height: false, // The height of the alphanav wrapper + slider
        letters: [ // The letters to build the slider with
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ],
        listSide: 'right', // Which side the letter list should stick to
        onScrollComplete: function () {}, // The callback function that will fire after scrolling is complete
        overlay: true, // Show the current letter in an overlay
        scrollDuration: 500, // Scroll duration in ms
        trimList: false, // Trim the list of letters and replace with {trimReplacement}
        trimReplacement: '&#8226;', // What to replace empty letters with; pass null to skip li element entirely
        wrapperAttributes: { // Any additional attributes to add to the wrapper div
            id: 'alphanav-wrapper'
        }
    };
}( jQuery));