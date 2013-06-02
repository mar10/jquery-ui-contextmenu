/*******************************************************************************
 * jquery.ui-contextmenu.js plugin.
 *
 * jQuery plugin that provides a context menu (based on the jQueryUI menu widget).
 *
 * @see https://github.com/mar10/jquery-ui-contextmenu
 *
 * Copyright (c) 2013, Martin Wendt (http://wwWendt.de). Licensed MIT.
 */
;(function($, window, document, undefined) {
	var supportSelectstart = "onselectstart" in document.createElement("div");

	/** Return command without leading '#' (default to ""). */
	function normCommand(cmd){
		return (cmd && cmd.match(/^#/)) ? cmd.substring(1) : (cmd || "");
	}


	$.widget("moogle.contextmenu", {
		version: "0.5.0",
		options: {
			delegate: "[data-menu]", // selector
			hide: { effect: "fadeOut", duration: "fast"},
			ignoreParentSelect: true, // Don't trigger 'select' for sub-menu parents
			menu: null,           // selector or jQuery pointing to <UL>, or a definition hash
			position: null,       // popup positon
			preventSelect: false, // disable text selection of target
			show: { effect: "slideDown", duration: "fast"},
			taphold: false,       // open menu on taphold events (requires external plugins)
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
		/** Construtcor */
		_create: function () {
			var eventNames, targetId,
				opts = this.options;

			this.$headStyle = null;
			this.$menu = null;
			this.menuIsTemp = false;
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
			this._createUiMenu(opts.menu);

			eventNames = "contextmenu" + this.ns;
			if(opts.taphold){
				eventNames += " taphold" + this.ns;
			}
			this.element.delegate(opts.delegate, eventNames, $.proxy(this._openMenu, this));

			this._trigger("init");
		},
		/** Destructor, called on $().contextmenu("destroy"). */
		_destroy: function(key, value){
			this._createUiMenu(null);
			if(this.$headStyle){
				this.$headStyle.remove();
				this.$headStyle = null;
			}
		},
		/** (Re)Create jQuery UI Menu. */
		_createUiMenu: function(menuDef){
			// Remove temporary <ul> if any
			if(this.menuIsTemp){
				this.$menu.remove(); // this will also destroy ui.menu
				this.menuIsTemp = false;
			} else if(this.$menu){
				this.$menu.menu("destroy").hide();
			}
			// If a menu definition array was passed, create a hidden <ul>
			// and generate the structure now
			if( ! menuDef ){
				this.$menu = null;
				return;
			} else if($.isArray(menuDef)){
				this.$menu = $.moogle.contextmenu.createMenuMarkup(menuDef);
				this.menuIsTemp = true;
			}else if ( typeof menuDef === "string" ){
				this.$menu = $(menuDef);
			}else{
				this.$menu = menuDef;
			}
			// Create - but hide - the jQuery UI Menu widget
			this.$menu
				.hide()
				.addClass("ui-contextmenu")
				// Create a menu instance that delegates events to our widget
				.menu({
					blur: $.proxy(this.options.blur, this),
					create: $.proxy(this.options.create, this),
					focus: $.proxy(this.options.focus, this),
					select: $.proxy(function(event, ui){
						var isParent = (ui.item.has(">a[aria-haspopup='true']").length > 0);
						ui.cmd = normCommand(ui.item.find(">a").attr("href"));
						ui.target = $(this.currentTarget);
						// ignore clicks, if they only open a sub-menu
						if( !isParent || !this.options.ignoreParentSelect){
							if( this._trigger.call(this, "select", event, ui) !== false ){
								this._closeMenu.call(this);
							}
							event.preventDefault();
						}
					}, this)
				});
		},
		/** Open popup (called on 'contextmenu' event). */
		_openMenu: function(event){
			var opts = this.options,
				posOption = opts.position,
				self = this,
				ui = {menu: this.$menu, target: $(event.target)};
			this.currentTarget = event.target;
			// Prevent browser from opening the system context menu
			event.preventDefault();

			if( this._trigger("beforeOpen", event, ui) === false ){
				return false;
			}
			ui.menu = this.$menu; // Might have changed in beforeOpen
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

			// required for custom positioning (issue #18 and #13).
			if ($.isFunction(posOption)) {
				posOption = posOption(event, ui);
			}
			posOption = $.extend({
				my: "left top",
				at: "left bottom",
				// if called by 'open' method, event does not have pageX/Y
				of: (event.pageX === undefined) ? event.target : event,
				collision: "fit"
			}, posOption);

			// Finally display the popup
			this.$menu
				.show() // required to fix positioning error
				.css({
					position: "absolute",
					left: 0,
					top: 0
				}).position(posOption)
				.hide(); // hide again, so we can apply nice effects

			this._show(this.$menu, this.options.show, function(){
				self._trigger.call(self, "open", event, ui);
			});
		},
		/** Close popup. */
		_closeMenu: function(){
			var self = this;

			this._hide(this.$menu, this.options.hide, function() {
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
		/** Return ui-menu entry (<A> or <LI> tag). */
		_getMenuEntry: function(cmd, wantLi){
			var $entry = this.$menu.find("li a[href=#" + normCommand(cmd) + "]");
			return wantLi ? $entry.closest("li") : $entry;
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
			this._getMenuEntry(cmd, true).toggleClass("ui-state-disabled", (flag === false));
		},
		/** Redefine the whole menu. */
		replaceMenu: function(data){
			this._createUiMenu(data);
		},
		/** Redefine menu entry (title or all of it). */
		setEntry: function(cmd, titleOrData){
			var $parent,
				$entry = this._getMenuEntry(cmd, false);

			if(typeof titleOrData === "string"){
				// Replace <a> text without removing <span> child
				$entry
					.contents()
					.filter(function(){ return this.nodeType === 3; })
					.first()
					.replaceWith(titleOrData);
			}else{
				$parent = $entry.closest("li").empty();
				$.moogle.contextmenu.createEntryMarkup(titleOrData, $parent);
			}
		},
		/** Show or hide the menu command. */
		showEntry: function(cmd, flag){
			this._getMenuEntry(cmd, true).toggle(flag !== false);
		}
	});

/*
 * Global functions
 */
$.extend($.moogle.contextmenu, {
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

			$.moogle.contextmenu.createEntryMarkup(menu, $li);

			if( $.isArray(menu.children) ){
				$ul = $("<ul>").appendTo($li);
				$.moogle.contextmenu.createMenuMarkup(menu.children, $ul);
			}
		}
		return $parentUl;
	}
});

}(jQuery, window, document));
