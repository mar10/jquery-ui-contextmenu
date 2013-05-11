/*******************************************************************************
 * jquery.ui-contextmenu.js plugin.
 *
 * jQuery plugin that provides a context menu (based on the jQueryUI menu widget).
 *
 * @see https://github.com/mar10/jquery-ui-contextmenu
 *
 * Copyright (c) 2013, Martin Wendt (http://wwWendt.de). Licensed MIT.
 */

(function ($) {
//	function getMenuFromEvent(event){
//		var menu = $(event.target).closest(":ui-menu"),
//		$menu = $(menu);
//		return $menu.data("ui-menu") || $menu.data("menu");
//	}
	var NS = ".contextmenu";

	$.widget("ui.contextmenu", {
		version: "0.3.0",
		options: {
			delegate: "[data-menu]",  // selector
			ignoreParentSelect: true, // Don't trigger 'select' for sub-menu parents
			menu: null,         // selector or jQuery or a function returning such
			taphold: true,      // open menu on taphold events (requires external plugins)
			// Events:
			beforeOpen: $.noop, // menu about to open; return `false` to prevent opening
			blur: $.noop,       // menu option lost focus
			close: $.noop,      // menu was closed
			create: $.noop,     // menu was initialized
			focus: $.noop,      // menu option got focus
			init: $.noop,       // ui-contextmenu was initialized
			open: $.noop,       // menu was opened
			select: $.noop      // menu option was selected; return `false` to prevent closing
		},
		_create: function () {
			var opts = this.options,
				eventNames = "contextmenu" + NS;
			if(opts.taphold){
				eventNames += " taphold" + NS;
			}
			if($.isArray(opts.menu)){
				this.orgMenu = opts.menu;
				opts.menu = $.ui.contextmenu.createMenuMarkup(opts.menu);
			}

			this.element.delegate(this.options.delegate, eventNames, $.proxy(this._openMenu, this));
			// emulate a 'taphold' event
			this._trigger("init");
		},
		/**
		 *
		 */
		_destroy: function(key, value){
			if(this.orgMenu){
				this.options.menu.remove();
				this.options.menu = this.orgMenu;
			}
		},
		/**
		 * Handle $().contextmenu("option", ...) calls.
		 */
		_setOption: function(key, value){
			$.Widget.prototype._setOption.apply(this, arguments);
		},
		/** Return ui-menu root element as jQuery object. */
		_getMenu: function(){
			// this.options.menu may be a string, jQuery or a function returning that.
			var $menu = this.options.menu;
			if( $.isFunction($menu) ){
				$menu = $menu();
			}
			return (typeof $menu === "string") ? $($menu) : $menu;
		},
		/** Return ui-menu widget instance (works on pre and post jQueryUI 1.9). */
		_getMenuWidget: function(){
			var $menu = this._getMenu();
			return $menu.data("ui-menu") || $menu.data("menu");
		},
		/** Open dropdown. */
		_openMenu: function(event){
			var self = this,
				$menu = this._getMenu(),
				openEvent = event,
				// if called by 'open' method, 'relatedTarget' is the requested target object
				parentTarget = openEvent.target ? openEvent.target : openEvent;
			// Prevent browser from opening the system context menu
			event.preventDefault();
			// Also pass the target that the menu was triggered on as 'relatedTarget'.
			// This is required because our _trigger() calls will create events
			// that refer to the contextmenu's context (which is the target *container*)
			event.relatedTarget = openEvent.target;

			if( this._trigger("beforeOpen", event) === false ){
				return false;
			}
			// Create - but hide - context-menu
			$menu
				.hide()
				.addClass("ui-contextmenu")
				// Create a menu instance that delegates events to our widget
				.menu({
					blur: $.proxy(this.options.blur, this),
					create: $.proxy(this.options.create, this),
					focus: $.proxy(this.options.focus, this),
					select: function(event, ui){
						// Also pass the target that the menu was triggered on:
						event.relatedTarget = openEvent.target;
						// ignore clicks, if they only open a sub-menu
						var isParent = (ui.item.has(">a[aria-haspopup='true']").length > 0);
						if( !isParent || !self.options.ignoreParentSelect){
							if( self._trigger.call(self, "select", event, ui) !== false ){
								self._closeMenu.call(self);
							}
							event.preventDefault();
						}
					}
				});
			// Register global event handlers that close the dropdown-menu
			$(document).bind("keydown" + NS, function(event){
				if( event.which === $.ui.keyCode.ESCAPE ){
					self._closeMenu();
				}
			}).bind("mousedown" + NS + " touchstart" + NS, function(event){
				// Close menu when clicked outside menu
				if( !$(event.target).closest(".ui-menu-item").length ){
					self._closeMenu();
				}
			});
			$menu
				.show() // required to fix positioning error (issue #3)
				.css({
					position: "absolute",
					left: 0,
					top: 0
				}).position({
					my: "left top",
					at: "left bottom",
					of: parentTarget,
					collision: "fit"
				}).hide()
				.slideDown("fast", function(){
					self._trigger.call(self, "open", event);
				});
		},
		/** Close dropdown. */
		_closeMenu: function(){
			var self = this,
				$menu = this._getMenu();
			if(this.tapTimer){
				clearTimeout(this.tapTimer);
				this.tapTimer = null;
			}
			$menu.fadeOut(function() {
				self._trigger("close");
			});
		},
		/**
		 * Open context menu on a specific target (must match options.delegate)
		 */
		open: function(target){
			// Fake a contextmenu event
			var e = jQuery.Event("contextmenu", {target: target.get(0)});
			return this.element.trigger(e);
		},
		/**
		 * Close context menu.
		 */
		close: function(){
			return this._closeMenu.call(this);
		}
	});


$.extend($.ui.contextmenu, {
	/** Convert a nested array of command objects into a <ul> structure. */
	createMenuMarkup: function(options, $parentUl){
		var i, menu, $ul, $li, $a;
		if( $parentUl == null ){
			$parentUl = $("<ul class='ui-helper-hidden'>").appendTo("body");
		}
		for(i = 0; i < options.length; i++){
			menu = options[i];
			$li = $("<li>").appendTo($parentUl);

			if(menu.title.match(/^---/)){
				$li.text(menu.title);
			}else{
				$a = $("<a>", {
					text: "" + menu.title,
					href: "#" + (menu.cmd || "")
				}).appendTo($li);
				if(menu.uiIcon){
					$a.append($("<span class='ui-icon'>").addClass(menu.uiIcon));
				}
				if(menu.disabled){
					$a.addClass("ui-state-disabled");
				}
			}
			if( $.isArray(menu.children) ){
				$ul = $("<ul>").appendTo($li);
				$.ui.contextmenu.createMenuMarkup(menu.children, $ul);
			}
		}
		return $parentUl;
	}
});

} (jQuery));
