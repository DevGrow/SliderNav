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
     * A simple jQuery function to get the current element based on the passed in event
     * @param evt - the event to "parse" the element out of
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
            return $(el);
        }
        return el;
    }



    /**
     *  AlphaNav - A jQuery navigation plugin for navigating an alphabetical list (ex: contacts, countries, etc)
     *  Copyright 2013 Tariq Abusheikh, https://www.tariqabusheikh.com
     *  Released under the MIT, BSD, and GPL Licenses.
     */
    $.fn.alphaNav = function (options) {
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
        // add the alphanav-list class to the list content
        $list.addClass('alphanav-list');
        // Create wrapper div, prepend to parent container, then shove the list content into it
        $wrapper = $('<div />').attr(opts.wrapperAttributes).prependTo(container).prepend($list);
        // Append #alphanav-slider to wrapper
        $slider = $('<div id="alphanav-slider" class="alphanav-component"><ul></ul></div>').appendTo($wrapper);
        // Shove all the letters into #alphanav-slider ul
        $ul = $slider.find('ul');
        for (var i in opts.letters) {
            $ul.append("<li>" + opts.letters[i] + "</li>");
        }
        // Pull the slider chars into the $letters object
        $letters = $ul.find('li');
        // Append #alphanav-target-overlay to wrapper (if needed)
        if (opts.overlay) {
            $overlay = $('<div id="alphanav-target-overlay" class="alphanav-component"></div>').appendTo($wrapper);
        }
        // Append #alphanav-debug (if needed)
        if (opts.debug) {
            $debugDiv = $('<div id="alphanav-debug" class="alphanav-component">Scroll Offset: ' +
                '<span id="debug-scroll-offset">0</span>. Target: <span id="debug-current-target">NONE</span></div>').appendTo($wrapper);
        }
        // Override height if passed in via options, then set $list to that height
        if (opts.height) {
            height = parseInt(opts.height) + 'px';
        }
        $list.css('height', height);
        // Set #alphanav-slider 'top' & 'height' properties to match the list content
        $slider.css({
            top : $list.offset().top,
            height: height
        });
        // Add .current to the first item in the list
        $list.find('li:first').addClass('current');
        // Bind the user actions (mouseover, touchmove, etc)
        $letters.on('click touchstart touchmove mousemove', function (evt) {
            evt.preventDefault();
            // return true if the touch event leaves the parent
            if (evt.target.offsetParent.id !== 'alphanav-slider') {
                console.log('outside of my comfort zone');
                return false;
            }
            var $el = getTarget(evt),
                t   = $el.html(),
                $target = $('#' + t, $list),
                tOffset;
            // return if $target doesn't exist
            if ($target === undefined) {
                return;
            }
            // Get the top offset
            tOffset = $target.offset().top;
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
                    $overlay.stop().fadeOut('fast');
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
            var top = $slider.offset().top,
                $upBtn   = $('<div id="alphanav-btn-slide-up" class="alphanav-component"><span class="arrow up"></span></div>').prependTo($wrapper),
                $downBtn = $('<div id="alphanav-btn-slide-down" class="alphanav-component"><span class="arrow down"></span></div>').appendTo($wrapper);
            console.log('arrow height: ' + $upBtn.outerHeight());
            top = parseInt(top + $upBtn.outerHeight()) + 'px';
            $slider.css('top', top);
            $list.css('top', top);
            $upBtn.off('click').on('click', function (evt) {
                evt.preventDefault();
                $list.animate({
                    scrollTop: "+=" + height + "px"
                }, opts.scrollDuration);
                // Call the onScrollComplete callback function (default: empty fn)
                opts.onScrollComplete.call(this);
            });
            $downBtn.off('click').on('click', function (evt) {
                evt.preventDefault();
                $list.animate({
                    scrollTop: "-=" + height + "px"
                }, opts.scrollDuration);
                // Call the onScrollComplete callback function (default: empty fn)
                opts.onScrollComplete.call(this);
            });
        }
        // For chaining
        return this;
    };

    /**
     * Remove alphanav wrapper + components
     */
    $.fn.alphaNav.destroy = function () {
        var $wrapper   = $('#alphanav-wrapper'),
            $container = $wrapper.parent(),
            $list      = $('.alphanav-list');
        $container.prepend($list);
        $wrapper.remove();
        return true;
    }

    /**
     * Default options for alphaNav
     * Option definitions:
     *  arrows: true/false - Show/hide up/down buttons
     * @type {{
     *     arrows: boolean,
     *     debug: boolean,
     *     growEffect: boolean,
     *     height: boolean,
     *     letters: string[],
     *     onScrollComplete: function,
     *     overlay: boolean,
     *     scrollDuration: number,
     *     wrapperAttributes: {}
     * }}
     */
    $.fn.alphaNav.defaults = {
        arrows: false, // Include the up/down arrows (default: false)
        container: null, // The selector to insert everything into (default: parent of list content)
        debug: false, // Include debug div
        growEffect: false, // Grow the text as you drag your finger/mouse over it
        height: false, // The height of the alphanav wrapper + slider (default: height of window)
        letters: [ // The letters to build the slider with
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ],
        onScrollComplete: function () {}, // The callback funciton that will fire after scrolling is complete
        overlay: true, // Show the current letter in an overlay
        scrollDuration: 500, // Scroll duration in ms
        wrapperAttributes: { // Any additional attributes to add to the wrapper div
            id: 'alphanav-wrapper'
        }
    }
}( jQuery ));