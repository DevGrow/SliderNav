# AlphaNav
## Overview
**AlphaNav** is a simple jQuery plugin that adds a vertical alphabet slider to an alphabetized list. It's functionality is based on the iOS Contacts app was prior to iOS7, and is intended to be used with longer lists, like contacts, countries, etc.

### Basic Usage
Make sure that you are loading jQuery and alphaNav.js (or alphaNav.min.js), at some point before calling alphaNav. You should also include the default CSS, or copy the structural CSS into an existing CSS file. A simple example of this:
    
    <script type="text/javascript" src="jquery-2.0.3.min.js"></script>
    <script type="text/javascript" src="alphaNav.min.js"></script>
    <link rel="stylesheet" href="alphaNav.css" />

All you have to do is call alphaNav on the jQuery object holding the content to scroll, like so:

	// Convert #list-content to a scrolling list using the default settings (see below)
	$("#list-content").alphaNav();

If you want to undo everything that alphaNav did, simply call:

	// the selector passed in doesn't matter anymore, so you could call on body, etc.
	$('#list-content').alphaNav.destroy();
	
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
	    container: null,
	    debug: false,
	    growEffect: false,
	    height: false,
	    letters: [
	        "A", "B", "C", ..., "X", "Y", "Z"
	    ],
	    onScrollComplete: function () {},
	    overlay: true,
	    scrollDuration: 500,
	    wrapperAttributes: {
	        id: 'alphanav-wrapper'
	    }
	}
 * `arrows`: (__CURRENTLY BROKEN__) Include the up/down arrows to scroll the window up/down by the current page height
 * `container`: The selector to insert everything into. If blank, a wrapper div will be created with the ID from `wrapperAttributes`
 * `debug`: Include the debug overlay
 * `growEffect`: Grow the text as you drag your finger/mouse over it
 * `height`: The height of the alphanav wrapper + slider (default: height of window)
 * `letters`: The letters to build the slider with
 * `onScrollComplete`: A callback funciton that will fire after scrolling is complete
 * `overlay`: When scrolling, show the current letter in an overlay
 * `scrollDuration`: Scroll duration (in ms)
 * `wrapperAttributes`: Any additional attributes to add to the wrapper div
 * `wrapperAttributes.id`: The ID of the wrapper div

#### Real-world Examples
 * :'(
 * If you integrate this plugin into your webapp and would like to be included in this list, let me know and I will add a link to your project.

## # TODO # 
 1. Calculate height + margin for slider letters via JS.
 1. Fix arrows functionality
 1. Sticky letter headers
 1. Switch from name to a data attribute?
 1. Clean this doc up some more
 1. Make animation optional (i.e. pass 0 to scrollDuration to skip jQuery animate code)
 1. Make animation smoother (calls to .stop() behave weird sometimes)
 1. Update $.alphaNav.delete(); to use wrapperAttributes.id. It currently only looks for #alphanav-wrapper
 1. Any recommendations/suggestions?
 
#### Metadata
**Plugin Name:** AlphaNav

**Author:** triq6

**Dependencies:** jQuery

**Forked from:** [SliderNav](https://github.com/DevGrow/SliderNav) (Original author: [Monjurul Dolon](http://mdolon.com/))