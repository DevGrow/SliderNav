/*
 *  AlphabetNav - A jQuery navigation plugin for navigating and alphabetical list (ex: contacts, countries, etc)
 *  Copyright 2013 Tariq Abusheikh, https://github.com/triq6
 *  Originally based on the SliderNav plugin, developed by Monjurul Dolon, http://mdolon.com/
 *  For more information on SliderNav: http://devgrow.com/SliderNav
 *  Released under the MIT, BSD, and GPL Licenses.
 */
$.fn.alphabetNav = function (options) {
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
        list = $(this),
        listContent = o.content;
    if (o.overlay) {
        $(list).append('<a id="current-target-overlay"></a>');
        var $overlay = $('#current-target-overlay');
    }
    console.log("list content selector: " + listContent);
    $(list).addClass('list');
    $(listContent, list).find('li:first').addClass('selected');
    $(list).append('<div class="list-nav"><ul></ul></div>');
    for (var i in o.items) {
        $('.list-nav ul', list).append("<li><a data-target='" + o.items[i] + "'>" + o.items[i] + "</a></li>");
    }
    var height = $('.list-nav', list).height(),
        currSize = parseInt($('.list-nav a').css('font-size'), 10);
    if (o.height) {
        height = o.height;
    }
    $(listContent + ', list-nav', list).css('height', height);
    if (o.debug) {
        $(list).append('<div id="debug">Scroll Offset: <span>0</span></div>');
    }
    $('.list-nav a', list).on('mouseover', function (evt) {
        evt.preventDefault();
        var target = $(this).data('target'),
            cOffset = $(listContent, list).offset().top,
            tOffset = $(listContent + ' #' + target, list).offset().top,
            height = $('.list-nav', list).height();
        console.log("target", target);
        if (o.height) {
            height = o.height;
        }
        var pScroll = (tOffset - cOffset) - height / 8;
        $(listContent, list).find('li').removeClass('selected');
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
        $(listContent, list).stop().animate({
            scrollTop: '+=' + pScroll + 'px'
        });
        if (o.debug) {
            $('#debug span', list).html(tOffset);
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
    $('.list-nav', list).on('mouseleave', function () {
        if (o.overlay) {
            $overlay.fadeOut();
        }
    });
    if (o.arrows) {
        $('.list-nav', list).css('top', '20px');
        $(list).prepend('<div class="slide-up end"><span class="arrow up"></span></div>');
        $(list).append('<div class="slide-down"><span class="arrow down"></span></div>');
        $('.slide-down', list).on('click', function () {
            $(listContent, list).animate({scrollTop: "+=" + height + "px"}, 500);
        });
        $('.slide-up', list).on('click', function () {
            $(listContent, list).animate({scrollTop: "-=" + height + "px"}, 500);
        });
    }
};