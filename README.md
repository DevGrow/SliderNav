# AlphaNav
## Overview
**AlphaNav** is a simple jQuery plugin that adds a vertical alphabet slider to an alphabetized list. It's functionality is similar to the iOS Contacts app, and is intended to be used with longer lists, like contacts, countries, etc.

### Basic Usage
Make sure that you are loading jQuery and alphaNav.js (or alphaNav.min.js), at some point before calling alphaNav. You should also include the default CSS, or copy the structural CSS into an existing CSS file. A simple example of this:
    
    <script type="text/javascript" src="jquery-2.0.3.min.js"></script>
    <script type="text/javascript" src="alphaNav.min.js"></script>
    <link rel="stylesheet" href="alphaNav.css" />

All you have to do is call alphaNav on the jQuery object holding the content to scroll, like so:

	// Convert #list-content to a scrolling list using the default settings (see below)
	$("#list-content").alphaNav();

Actually, it's not *that* easy. You're also going to have to add a class to the list headers (or, if you don't have list headers, the first element of every new letter). The default header class prefix is `.alphanav-header-`, but you can change that if you need to. An example of the header class you have to add to your HTML for the letter A would be `.alphanav-header-A`

If you want to undo everything that alphaNav did, simply call:

	$.fn.alphaNav.destroy();
	
If you want to override any of the default settings, you can either pass them into the alphaNav method:

    $('#list-content').alphaNav({
        arrows: false,
        debug: true,
        growEffect: true,
        transitionDuration: 250,
        overlay: true
     });
 
Another option is to globally override the defaults; this would be the preferred method if you are using alphaNav in more than one location on your site:

    $.fn.alphaNav.defaults.debug = true;
    $.fn.alphaNav.defaults.overlay = false;
	// Any calls to alphaNav *after* these two lines will have debug = true and overlay = false.
	
## Settings & Defaults
    $.fn.alphaNav.defaults = {
        arrows: false,
        autoHeight: true,
        container: null,
        debug: false,
        growEffect: false,
        headerClassPrefix: 'alphanav-header-',
        height: false,
        letters: [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ],
        listSide: 'right',
        onScrollComplete: function () {},
        overlay: true,
        scrollDuration: 500,
        trimList: false,
        trimReplacement: '&#8226;',
        wrapperAttributes: {
            id: 'alphanav-wrapper'
        }
    };
 * `arrows`: Include the up/down arrows to scroll the window up/down by the current page height
 * `autoHeight`: Adjust alphabet list height automatically. Disable if you'd like to set list height + margins manually
 * `container`: The selector to insert everything into. If blank, a wrapper div will be created with the ID from `wrapperAttributes`
 * `debug`: Include the debug overlay + console debugging
 * `growEffect`: Grow the text as you drag your finger/mouse over it
 * `headerClassPrefix`: Prefix for letter headers, followed by the letter, i.e. .alphanav-header-A
 * `height`: The height of the alphanav wrapper + slider (default: height of window)
 * `letters`: The letters to build the slider with
 * `listSide`: Which side should the list stick to?
 * `onScrollComplete`: A callback funciton that will fire after scrolling is complete
 * `overlay`: When scrolling, show the current letter in an overlay
 * `scrollDuration`: Scroll duration (in ms)
 * `trimList`: Trim the list of scrolling letters by dropping any that don't have matching headers, and replace with `trimReplacement`
 * `trimReplacement`:  What to replace empty letters with; pass null to skip li element entirely
 * `wrapperAttributes`: Any additional HTML attributes to add to the wrapper div
 
#### Real-world Examples
 * [QuickTapCalling - Rates](https://quicktapcalling.com/rates)
 * If you integrate this plugin into your webapp and would like to be included in this list, let me know and I will add a link to your project.

## # TODO # 
 1. Sticky letter headers
 1. Make animation optional (i.e. pass 0 to scrollDuration to skip jQuery animate code)
 1. Make scrolling animation smoother (calls to .stop() behave weird sometimes)
 1. Update $.alphaNav.delete(); to use wrapperAttributes.id.
 1. Any recommendations/suggestions?
 
#### Metadata
**Plugin Name:** AlphaNav

**Author:** triq6

**Dependencies:** jQuery

**Forked from:** [SliderNav](https://github.com/DevGrow/SliderNav) (Original author: [Monjurul Dolon](http://mdolon.com/))