(function($) {
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
            sl = document.body.scrollTop;
            if (sl > 0) {
                var height = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
                isRelative = (document.elementFromPoint(0, sl + height - 1) === null);
            } else {
                sl = document.body.scrollLeft;
                if (sl > 0) {
                    var width = "innerWidth" in window ? window.innerWidth : document.documentElement.offsetWidth;
                    isRelative = (document.elementFromPoint(sl + width - 1, 0) === null);
                }
            }
            check = (sl > 0);
        }

        if (!isRelative) {
            x += document.body.scrollLeft;
            y += document.body.scrollTop;
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
     * Get the total height of all elements in a set of given elements
     * @param elements - a node map of elements to get the total height of
     * @returns {int} the height of all elements as an integer in pixels
     */
    function getTotalHeight(elements) {
        var totalHeight = 0;
        Array.prototype.forEach.call(elements, function(el, i) {
            totalHeight += el.offsetHeight;
        });
        return totalHeight;
    }

    /**
     *  AlphaNav - A jQuery navigation plugin for navigating an alphabetical list (ex: contacts, countries, etc)
     *  Created by triq6, https://github.com/triq6
     *  Released under the MIT, BSD, and GPL Licenses.
     */
    $.fn.alphaNav = function(options) {
        'use strict';
        if (typeof options === "string") {
            switch (options) {
                case "destroy":
                    $('body').find('.alphanav-component').remove();
                    return;
                default:
                    alert("ERROR: Unknown option: " + options);
                    return;
            }
            return;
        }
        var opts = $.extend(true, {}, $.fn.alphaNav.config, options),
            $container = $(this),
            $overlay,
            $debugDiv,
            $slider,
            $letters,
            height,
            top,
            containerWidth = $container.outerWidth(),
            leftOffset = $container.offset().left;
        // Update config with the user's settings (so they can be accessed in destroy and resize)
        $.fn.alphaNav.config = opts;
        if (opts.debug) {
            console.log('constructing alphaNav! Final Config: ', opts);
            console.log("Container: ", $container);
        }
        // add the alphanav-list class to the list content
        $container.addClass('alphanav-list');
        // Create wrapper div, prepend to parent container, then shove the list content into it
        // Append #alphanav-slider to wrapper
        $slider = $('<ul id="' + opts.id + '" class="alphanav-slider alphanav-component"></ul>').appendTo(
            $container);

        if (opts.listSide.toLowerCase() === 'right') {
            var rightOffset = ($(window).width() - (leftOffset + containerWidth));
            if (opts.debug) {
                console.log("Setting right edge of slider to " + rightOffset);
            }
            $slider.css('right', rightOffset + 'px');
        } else if (opts.listSide.toLowerCase() === 'left') {
            if (opts.debug) {
                console.log("Setting left edge of slider to " + leftOffset);
            }
            $slider.css('left', leftOffset + 'px');
        }
        $slider.addClass(opts.listSide);
        // Trim the letters array if trimList is enabled
        if (opts.trimList) {
            if (opts.debug) {
                console.groupCollapsed('-- trimList --');
            }
            for (var i in opts.letters) {
                if (opts.letters[i] === opts.trimReplacement) {
                    continue;
                }
                var headerClass = 'li.' + opts.headerClassPrefix + opts.letters[i],
                    $header = $container.find(headerClass);
                if (opts.debug) {
                    console.log('headerClass: "' + headerClass + '", $header: ', $header);
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
        for (var x in opts.letters) {
            $slider.append("<li class='letter'>" + opts.letters[x] + "</li>");
        }
        // Pull the slider chars into the $letters object
        $letters = $slider.find('li');
        // Append #alphanav-target-overlay to wrapper (if needed)
        if (opts.overlay) {
            $overlay = $('<div id="alphanav-target-overlay" class="alphanav-component"></div>').insertAfter(
                $container);
            // Center the overlay in the container
            var containerOffset = $container.offset(),
                containerHeight = $container.outerHeight(),
                centerX = (containerOffset.left + containerWidth) / 2,
                centerY = (containerOffset.top + containerHeight) / 2,
                overlayTop = centerY - ($overlay.outerHeight() / 2),
                overlayLeft = centerX - ($overlay.outerWidth() / 2);
            $overlay.css({
                top: overlayTop + 'px',
                left: overlayLeft + 'px'
            });
        }
        // Append #alphanav-debug (if needed)
        if (opts.debug) {
            console.log("Debug mode enabled! Appending #alphanav-debug");
            $debugDiv = $('<div id="alphanav-debug" class="alphanav-component">Scroll Offset: ' +
                '<span id="debug-scroll-offset">0</span>. Target: <span id="debug-current-target">NONE</span></div>'
            ).insertAfter($container);
            console.log("Letters: ", $letters);
        }
        top = $container.offset().top;
        // Override height if passed in via options, then set $list to that height
        if (opts.height === false) {
            height = $container.outerHeight() + 'px';
            if (opts.debug) {
                console.log("No height passed in");
            }
        } else {
            height = parseInt(opts.height, 10) + 'px';
            if (opts.debug) {
                console.log("Height passed in as " + height);
            }
        }
        if (opts.debug) {
            console.log("Height being set to: " + height);
            console.log("top being set to: " + top);
        }
        // Set #alphanav-slider 'top' & 'height' properties to match the list content
        $slider.css({
            top: top,
            height: height
        });

        // Bind the user actions (mouseover, touchmove, etc)
        $letters.on('click touchstart touchmove mousemove', function(evt) {
            evt.preventDefault();
            // return true if the touch event leaves the parent
            if (evt.target.offsetParent.id !== 'alphanav-slider') {
                if (opts.debug) {
                    console.log('click/touch is not inside alphanav-slider div. returning false');
                }
                return false;
            }
            var $el = getTarget(evt),
                t, $target, tOffset;
            // Make sure el is actually set before pulling HTML
            if ($el === undefined || $el === null) {
                if (opts.debug) {
                    console.log('element is undefined...?');
                }
                return false;
            }
            t = $el.html();
            // abort if t is not 1 char, or if it is a trimmed char
            if (t.length !== 1 || (opts.trimList && t === opts.trimReplacement)) {
                if (opts.debug) {
                    console.log('trimmed or incorrectly parsed letter');
                }
                return false;
            }

            $target = $('li.' + opts.headerClassPrefix + t, $container);
            // abort if $target doesn't exist
            if ($target === undefined || $target.length === 0) {
                if (opts.debug) {
                    //console.log('No target! Returning');
                }
                return false;
            }
            if ($target.hasClass('alphanav-current')) {
                if (opts.debug) {
                    //console.log("Already at the current letter! Returning");
                }
                return false;
            }
            // Get the top offset
            tOffset = $target.offset().top; // - parseInt($target.outerHeight(), 10);
            // Remove .alphanav-current from all headers, then add it to current header
            $container.find('li').removeClass('alphanav-current');
            $target.addClass('alphanav-current');
            // If overlay enabled, set the content show it
            if (opts.overlay) {
                $overlay
                    .html(t)
                    .velocity("stop")
                    //.velocity("finish")
                    .velocity("fadeIn", {
                        queue: false,
                        duration: opts.animationDuration
                    });
            }
            // If growEffect enabled, grow the current touch target
            if (opts.growEffect) {
                $slider.css('width', '40px');
                $el.addClass('alphanav-current');
            }
            // Update the debug div (if enabled)
            if (opts.debug) {
                $('#debug-scroll-offset').html(tOffset);
                $('#debug-current-target').html(t);
            }
            $target
                .velocity("stop")
                .velocity("scroll", {
                    container: $container,
                    offset: (Math.floor($slider.offset().top) * -1) + 'px',
                    duration: opts.animationDuration,
                    // Call the onScrollComplete callback function (default: empty fn)
                    complete: function(elements) {
                        if (opts.debug) {
                            console.log("scroll complete! ", elements);
                        }
                        if (opts.onScrollComplete !== null) {
                            opts.onScrollComplete.call(elements);
                        }
                    }
                });

        });
        // Bind the end/leave/out actions (if needed)
        if (opts.overlay || opts.growEffect) {
            $letters.on('touchend touchleave mouseout', function(evt) {
                evt.preventDefault();
                // Hide overlay (if enabled)
                if (opts.overlay) {
                    $overlay
                        .velocity("stop")
                        .velocity("fadeOut", {
                            queue: false,
                            duration: opts.animationDuration
                        });
                }
                // Reset font size (if growEffect enabled)
                if (opts.growEffect) {
                    $slider.css('width', '25px');
                    $letters.removeClass('alphanav-current');
                }
            });
        }
        // If arrows are enabled, prepend/append them and bind the click listeners
        if (opts.arrows) {
            if (opts.debug) {
                console.log('up/down arrows enabled! Adding HTML + binding click events');
            }
            var $upBtn = $('<div id="alphanav-btn-slide-up" class="alphanav-component alphanav-arrow"></div>')
                .insertAfter($container),
                $downBtn = $(
                    '<div id="alphanav-btn-slide-down" class="alphanav-component alphanav-arrow"></div>')
                .insertAfter($container);
            // Bind click to "Up" button
            $upBtn.off('click').on('click', function(evt) {
                evt.preventDefault();
                $container.velocity("scroll", {
                    duration: opts.animationDuration,
                    offset: (height * -1)
                });
                // Call the onScrollComplete callback function (default: empty fn)
                opts.onScrollComplete.call(this);
            });
            // Bind click to "Down" button
            $downBtn.off('click').on('click', function(evt) {
                evt.preventDefault();
                $container.velocity("scroll", {
                    duration: opts.animationDuration,
                    offset: (height)
                });
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
     * Resize the alphabet slider
     */
    $.fn.alphaNav.resize = function() {
        'use strict';
        var $slider = $('#alphanav-slider'),
            $letters = $slider.find('.letter'),
            wrapperHeight = $slider.parent().outerHeight(),
            windowHeight = $(window).height(),
            totalLettersHeight = getTotalHeight($letters),
            heightDiff,
            finalMargin;
        // If wrapper height > window height, reset wrapper height to equal window height (no point in a scroller that doesn't fit on one page)
        if (wrapperHeight > windowHeight) {
            wrapperHeight = windowHeight;
        }
        // Let's make sure that wrapperHeight > totalLettersHeight. If it is, make the letters smaller
        if (wrapperHeight < totalLettersHeight) {
            // Loop over letters, making them 1px shorter every time, until their height < wrapperHeight
            do {
                var currLetterHeight = parseInt($letters.css('height'), 10),
                    newLetterHeight = currLetterHeight - 1;
                $letters.css('height', newLetterHeight + 'px');
                // Reset totalLettersHeight to 0, then recalculate
                totalLettersHeight = getTotalHeight($letters);
            } while (wrapperHeight < totalLettersHeight);
        }
        // final margin = (leftover space / # of letters)
        heightDiff = wrapperHeight - totalLettersHeight;
        finalMargin = Math.floor(heightDiff / $letters.length);
        // Set to 0 if negative, then apply
        if (finalMargin < 0) {
            finalMargin = 0;
        }
        $letters.css('margin', finalMargin + 'px 0');
    };

    /**
     * Default config for alphaNav
     */
    $.fn.alphaNav.config = {
        animationDuration: 500, // Duration of all animations (in ms)
        arrows: false, // Include the up/down arrows
        autoHeight: true,
        debug: false, // Include debug div
        growEffect: false, // Grow the text as you drag your finger/mouse over it
        headerClassPrefix: 'alphanav-header-', // Prefix for letter headers, followed by the letter, i.e. .alphanav-header-A
        height: false, // The height of the alphanav wrapper + slider
        id: 'alphanav-slider', // The ID of the AlphaNav slider
        letters: [ // The letters to build the slider with
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ],
        scrollOffset: 0, // Additional offset to use when scrolling to en element. i.e. "15" will add 15px to the scroll target location
        listSide: 'right', // Which side the letter list should stick to
        onScrollComplete: null, // The callback function that will fire after scrolling is complete
        overlay: true, // Show the current letter in an overlay
        trimList: false, // Trim the list of letters and replace with {trimReplacement}
        trimReplacement: '&#8226;', // What to replace empty letters with; pass null to skip li element entirely
    };
}(jQuery));
