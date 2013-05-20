/*******************************************************************************
 * jquery.ui-contextmenu.js plugin.
 *
 * jQuery plugin that provides a context menu (based on the jQueryUI menu widget).
 *
 * @see https://github.com/mar10/jquery-ui-contextmenu
 *
 * Copyright (c) 2013, Martin Wendt (http://wwWendt.de). Licensed MIT.
 */

/*
 * TODO:
 * - change namespace to 'moogle'
 */
(function ($) {
	var supportSelectstart = "onselectstart" in document.createElement("div");

	/** Return command without leading '#' (default to ""). */
	function normCommand(cmd){
		return (cmd && cmd.match(/^#/)) ? cmd.substring(1) : (cmd || "");
	}


	$.widget("ui.contextmenu", {
		version: "0.4.0",
		options: {
			delegate: "[data-menu]",  // selector
			hide: { effect: "fadeOut", duration: "fast"},
			show: { effect: "slideDown", duration: "slow"},
			ignoreParentSelect: true, // Don't trigger 'select' for sub-menu parents
			menu: null,           // selector or jQuery or a function returning such
			preventSelect: false, // disable text selection of target
			taphold: false,       // open menu on taphold events (requires external plugins)
			// Events:
			beforeOpen: $.noop,   // menu about to open; return `false` to prevent opening
			blur: $.noop,         // menu option lost focus
			close: $.noop,        // menu was closed
			create: $.noop,       // menu was initialized
			focus: $.noop,        // menu option got focus
			init: $.noop,         // ui-contextmenu was initialized
			open: $.noop,         // menu was opened
			select: $.noop        // menu option was selected; return `false` to prevent closing
		},
		/** Construtcor */
		_create: function () {
			var eventNames, targetId,
				opts = this.options;

//			console.log(this.element)

			this.$headStyle = null;
			this.orgMenu = null;
			this.currentTarget = null;
			this.ns = "." + this.widgetName;

			if(opts.preventSelect){
				// Create a global style for all potential menu targets
				// If the contextmenu was bound to `document`, we apply the
				// selector relative to the <body> tag instead
				targetId = ($(this.element).is(document) ? $("body") : this.element).uniqueId().attr("id");
				this.$headStyle = $("<style class='ui-contextmenu-style'>")
					.prop("type", "text/css")
					.html("#" + targetId + " " + opts.delegate + " { " +
						"-webkit-user-select: none; " +
						"-khtml-user-select: none; " +
						"-moz-user-select: none; " +
						"-ms-user-select: none; " +
						"user-select: none; " +
						"}")
					.appendTo("head");
				// TODO: the selectstart is not supported by FF?
				if(supportSelectstart){
					this.element.delegate(opts.delegate, "selectstart" + this.ns, function(event){
						event.preventDefault();
					});
				}
			}
			// If a menu definition array was passed, create a hidden <ul>
			// and generate the structure now
			if($.isArray(opts.menu)){
				this.orgMenu = opts.menu;
				opts.menu = $.ui.contextmenu.createMenuMarkup(opts.menu);
			}
			// Create - but hide - the jQuery UI Menu
			this._getMenu()
				.hide()
				.addClass("ui-contextmenu")
				// Create a menu instance that delegates events to our widget
				.menu({
					blur: $.proxy(this.options.blur, this),
					create: $.proxy(this.options.create, this),
					focus: $.proxy(this.options.focus, this),
					select: $.proxy(function(event, ui){
						// Also pass the target that the menu was triggered on:
						event.relatedTarget = this.currentTarget;
						// ignore clicks, if they only open a sub-menu
						var isParent = (ui.item.has(">a[aria-haspopup='true']").length > 0);
						if( !isParent || !this.options.ignoreParentSelect){
							if( this._trigger.call(this, "select", event, ui) !== false ){
								this._closeMenu.call(this);
							}
							event.preventDefault();
						}
					}, this)
				});

			eventNames = "contextmenu" + this.ns;
			if(opts.taphold){
				eventNames += " taphold" + this.ns;
			}
			this.element.delegate(opts.delegate, eventNames, $.proxy(this._openMenu, this));

			this._trigger("init");
		},
		/** Destructor, called on $().contextmenu("destroy"). */
		_destroy: function(key, value){
			if(this.$headStyle){
				this.$headStyle.remove();
				this.$headStyle = null;
			}
			// Remove temporary <ul> if any
			if(this.orgMenu){
				this.options.menu.remove();
				this.options.menu = this.orgMenu;
				this.orgMenu = null;
			}
		},
		/** Open popup (called on 'contextmenu' event). */
		_openMenu: function(event){
			var self = this,
				$menu = this._getMenu(),
				openEvent = event,
				// if called by 'open' method, 'relatedTarget' is the requested target object
				parentTarget = openEvent.target ? openEvent.target : openEvent,
				ui = {menu: $menu};
			this.currentTarget = openEvent.target;
			// Prevent browser from opening the system context menu
			event.preventDefault();
			// Also pass the target that the menu was triggered on as 'relatedTarget'.
			// This is required because our _trigger() calls will create events
			// that refer to the contextmenu's context (which is the target *container*)
			event.relatedTarget = this.currentTarget;

			if( this._trigger("beforeOpen", event, ui) === false ){
				return false;
			}
			// Register global event handlers that close the dropdown-menu
			$(document).bind("keydown" + this.ns, function(event){
				if( event.which === $.ui.keyCode.ESCAPE ){
					self._closeMenu();
				}
			}).bind("mousedown" + this.ns + " touchstart" + this.ns, function(event){
				// Close menu when clicked outside menu
				if( !$(event.target).closest(".ui-menu-item").length ){
					self._closeMenu();
				}
			});
			// Finally display the popup
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
				}).hide();

			this._show($menu, this.options.show, function(){
				self._trigger.call(self, "open", event);
			});
		},
		/** Close popup. */
		_closeMenu: function(){
			var self = this,
				$menu = this._getMenu();

			this._hide($menu, this.options.hide, function() {
				self._trigger("close");
				this.currentTarget = null;
			});

			$(document)
				.unbind("mousedown" + this.ns)
				.unbind("touchstart" + this.ns)
				.unbind("keydown" + this.ns);
		},
		/** Handle $().contextmenu("option", key, value) calls. */
		_setOption: function(key, value){
			switch(key){
			case "menu":
				this.replaceMenu(value);
				break;
			}
			$.Widget.prototype._setOption.apply(this, arguments);
		},
		/** Return ui-menu root element as jQuery object. */
		_getMenu: function(){
			// this.options.menu may be a string, jQuery or a function returning that.
			var $menu = this.options.menu;
			return (typeof $menu === "string") ? $($menu) : $menu;
		},
		/** Open context menu on a specific target (must match options.delegate) */
		open: function(target){
			// Fake a 'contextmenu' event
			var e = jQuery.Event("contextmenu", {target: target.get(0)});
			return this.element.trigger(e);
		},
		/** Close context menu. */
		close: function(){
			return this._closeMenu.call(this);
		},
		/** Enable or disable the menu command. */
		enableEntry: function(cmd, flag){
			// TODO: should be $menu.find(...)!
			var $entry = this.element.find("a[href=#" + normCommand(cmd) + "]");
			$entry.toggleClass("ui-state-disabled", (flag === false));
		},
		/** Redefine the whole menu. */
		replaceMenu: function(data){
			var opts = this.options,
				$menu = this._getMenu();

			if($.isArray(data)){
				if(this.orgMenu){
					// re-use existing temporary <ul>
					$menu.empty();
					$.ui.contextmenu.createMenuMarkup(data, opts.menu);
					$menu.menu("refresh");
				}else{
					$.error("not implemented");
//                    this.orgMenu = opts.menu;
//                    opts.menu = $.ui.contextmenu.createMenuMarkup(data);
				}
			}else{
//                if(this.orgMenu){
//                    // re-use existing temporary <ul>
//                }else{
//                }
//                $menu.menu("option", "menu", opts.menu);
				$.error("not implemented");
			}
		},
		/** Redefine menu entry (title or all of it). */
		setEntry: function(cmd, titleOrData){
			var $parent,
				$entry = this.element.find("a[href=#" + normCommand(cmd) + "]");

			if(typeof titleOrData === "string"){
				// Replace <a> text without removing <span> child
				$entry
					.contents()
					.filter(function(){ return this.nodeType === 3; })
					.first()
					.replaceWith(titleOrData);
			}else{
				$parent = $entry.closest("li").empty();
				$.ui.contextmenu.createEntryMarkup(titleOrData, $parent);
			}
		},
		/** Show or hide the menu command. */
		showEntry: function(cmd, flag){
			var $entry = this.element.find("a[href=#" + normCommand(cmd) + "]");
			$entry.toggle(flag !== false);
		}
	});

/*
 * Global functions
 */
$.extend($.ui.contextmenu, {
	/** Convert a menu description into a into a <li> content. */
	createEntryMarkup: function(entry, $parentLi){
		var $a = null;

		if(entry.title.match(/^---/)){
			$parentLi.text(entry.title);
		}else{
			$a = $("<a>", {
				text: "" + entry.title,
				href: "#" + normCommand(entry.cmd)
			}).appendTo($parentLi);
			if(entry.uiIcon){
				$a.append($("<span class='ui-icon'>").addClass(entry.uiIcon));
			}
			if(entry.disabled){
				$parentLi.addClass("ui-state-disabled");
			}
		}
		return $a;
	},
	/** Convert a nested array of command objects into a <ul> structure. */
	createMenuMarkup: function(options, $parentUl){
		var i, menu, $ul, $li;
		if( $parentUl == null ){
			$parentUl = $("<ul class='ui-helper-hidden'>").appendTo("body");
		}
		for(i = 0; i < options.length; i++){
			menu = options[i];
			$li = $("<li>").appendTo($parentUl);

			$.ui.contextmenu.createEntryMarkup(menu, $li);

			if( $.isArray(menu.children) ){
				$ul = $("<ul>").appendTo($li);
				$.ui.contextmenu.createMenuMarkup(menu.children, $ul);
			}
		}
		return $parentUl;
	}
});

} (jQuery));
