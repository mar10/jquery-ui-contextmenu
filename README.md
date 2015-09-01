# jquery.ui-contextmenu [![GitHub version](https://badge.fury.io/gh/mar10%2Fjquery-ui-contextmenu.svg)](https://github.com/mar10/jquery-ui-contextmenu/releases/latest) [![Build Status](https://travis-ci.org/mar10/jquery-ui-contextmenu.png?branch=master)](https://travis-ci.org/mar10/jquery-ui-contextmenu) [![Selenium Test Status](https://saucelabs.com/buildstatus/sauce-contextmenu)](https://saucelabs.com/u/sauce-contextmenu)

A jQuery plugin that provides a context menu (based on the standard [jQueryUI menu] widget).

  * Define menus from `<ul>` element or definition list (i.e. 
    `[{title: "Paste", cmd: "paste"}, ...]`).
  * Themable using [jQuery ThemeRoller](http://jqueryui.com/themeroller/).
  * Supports delegation (i.e. can be bound to elements that don't exist at the
    time the context menu is initialized).
  * Optional support for touch devices.


## Status

The latest release is available at [npm Registry](https://www.npmjs.org/package/ui-contextmenu):
```shell
$ npm install ui-contextmenu
```

[![GitHub version](https://badge.fury.io/gh/mar10%2Fjquery-ui-contextmenu.svg)](https://github.com/mar10/jquery-ui-contextmenu/releases/latest)
See also the [Change Log](https://github.com/mar10/jquery-ui-contextmenu/blob/master/CHANGELOG.md).


## Demo

[Live demo page](http://wwwendt.de/tech/demo/jquery-contextmenu/demo/):<br>
[ ![sample](demo/teaser.png?raw=true) ](http://wwwendt.de/tech/demo/jquery-contextmenu/demo/ "Live demo")


## Tutorial

First, include dependencies:

* jQuery 1.7+ (1.10 or later recommended)
* jQuery UI 1.9+ (at least core, widget, menu), 1.11+ recommended
* One of the ThemeRoller CSS themes or a custom one
* jquery.ui-contextmenu.js (also available as CDN on 
  [jsdelivr](http://www.jsdelivr.com/#!jquery.ui-contextmenu)
  or [cdnjs](https://cdnjs.com/libraries/jquery.ui-contextmenu))

```html
<head>
    <link href="//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css" 
        type="text/css" rel="stylesheet" />
    <script src="//code.jquery.com/jquery-1.11.1.min.js" type="text/javascript"></script>
    <script src="//code.jquery.com/ui/1.11.2/jquery-ui.min.js" type="text/javascript"></script>
    <script src="assets/jquery.ui-contextmenu.min.js"></script>
```

Assume we have some HTML elements that we want to attach a popup menu to:

```html
<div id="container">
    <div class="hasmenu">AAA</div>
    <div class="hasmenu">BBB</div>
    <div class="hasmenu">CCC</div>
</div>
```

Now we can enable a context menu like so:

```js
$("#container").contextmenu({
	delegate: ".hasmenu",
	menu: [
		{title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy"},
		{title: "----"},
		{title: "More", children: [
			{title: "Sub 1", cmd: "sub1"},
			{title: "Sub 2", cmd: "sub1"}
			]}
		],
	select: function(event, ui) {
		alert("select " + ui.cmd + " on " + ui.target.text());
	}
});
```

The `delegate` option defines a CSS selector, which is evaluated for all
elements inside the context element (`#container` in our example).<br>
In order to attach menus to *all* matching elements on the page that have 
`class="hasmenu"`, we may use `document` as context:
```js
$(document).contextmenu({
    delegate: ".hasmenu",
    ...
});
```
**Note:** only one contextmenu widget instance can be bound to one element.
See the *Howto* below for a solution to this problem.

The `menu` options may contain a (nested) array of entry defiitions.
Following a list of available properties:
<dl>
<dt>action</dt>
<dd>
    Type: <code>Function</code>, default: n.a.<br>
    Optional callback that will be executed when the entry is selected.
</dd>
<dt>addClass</dt>
<dd>
    Type: <code>String</code>, default: <code>""</code><br>
    Additional class name(s) to be added to the entries &lt;li> element.
    Separate multiple class names with a space.<br>
    Custom CSS may be applied like <code>.ui-menu .my-class { color: red; }</code>.
</dd>
<dt>cmd</dt>
<dd>
    Type: <code>String</code>, default: <code>""</code><br>
    Optional identifier associated with the menu entry.
    It can later be accessed in the <i>select</i> event as <code>ui.cmd</code>.
</dd>
<dt>data</dt>
<dd>
    Type: <code>Object</code>, default: <code>{}</code><br>
    Optional hash of additional properties that will be added to the entry's 
    <i>data</i> attribute.<br>
    It can later be accessed in the <i>select</i> event as <code>ui.item.data()</code>.
</dd>
<dt>disabled</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>false</code><br>
    Pass <i>true</i> to disable the entry.
</dd>
<dt>title</dt>
<dd>
    Type: <code>String</code>, default: <code>""</code><br>
    The displayed name of the menu entry. Use dashes (<code>"---"</code>) to 
    define a separator.
</dd>
<dt>uiIcon</dt>
<dd>
    Type: <code>String</code>, default: ""<br>
    If defined, an icon is added to the menu entry. For example passing 
    <code>"ui-icon-copy"</code> will generate this element: 
    <code>&lt;span class='ui-icon ui-icon-copy' /></code>.<br>
    See also <<a href="http://api.jqueryui.com/theming/icons/">Icon Overview</a>.
</dd>
</dl>

Instead of handling all menu commands in the `select` event, it is also possible
to attach callbacks directly to menu entries:
```js
$(document).contextmenu({
    delegate: ".hasmenu",
    menu: [
        {title: "Copy", uiIcon: "ui-icon-copy", action: function(event, ui){
                alert("Copy " + ui.target.text());
             }
         },
        ...
});
```

### Initialize menu from an existing `<ul>` element

In this case `menu` must point to the markup:

```js
$(document).contextmenu({
    delegate: ".hasmenu",
    menu: "#options",
    select: function(event, ui) {
    	...
    }
});
```
We also have to provide some HTML markup that defines the context menu structure, 
see [jQueryUI menu] for details:

```html
<ul id="options" class="ui-helper-hidden">
    <li data-command="copy"><span class="ui-icon ui-icon-copy"></span>Copy</li>
    <li data-command="paste" class="ui-state-disabled">Paste</li>
    <li>----</li>
    <li>More
        <ul>
            <li data-command="sub1">Sub 1</li>
            <li data-command="sub2">Sub 2</li>
        </ul>
    </li>
</ul>
```

**Note:** until and including jQuery UI 1.10 the use of anchors (`<a>`) in menu 
items was required:
```html
<ul id="options" class="ui-helper-hidden">
    <li data-command="copy"><a href="#"><span class="ui-icon ui-icon-copy"></span>Copy</a>
    ...
</ul>
```


### Modify the menu depending on the context

Often we need to modify the menu before it is displayed, in order to reflect the 
current context.
This can be done in the `beforeOpen` event:

```js
$(document).contextmenu({
    delegate: ".hasmenu",
    menu: [
        {title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors"},
        {title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy"},
        {title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true },
        ...
        ],
    beforeOpen: function(event, ui) {
        var $menu = ui.menu,
            $target = ui.target,
            extraData = ui.extraData; // optionally passed when menu was opened by call to open()

        // Optionally return false, to prevent opening the menu
//      return false;

        // En/disable single entries
        $(document).contextmenu("enableEntry", "paste", false);
        // Show/hide single entries
        $(document).contextmenu("showEntry", "cut", false);
        // Redefine the title of single entries
        $(document).contextmenu("setEntry", "copy", "Copy '" + $target.text() + "'")
        // Redefine all attributes of single entries
        $(document).contextmenu("setEntry", "cut", {title: "Cuty", uiIcon: "ui-icon-heart", disabled: true});
        // Redefine the whole menu
        $(document).contextmenu("replaceMenu", [{title: "aaa"}, {title: "bbb"}, ...]);
        // Redefine the whole menu from another HTML definition
        $(document).contextmenu("replaceMenu", "#options2");
    },
    ...
});
```


## API documentation
### Options

<dl>
<dt>addClass</dt>
<dd>
    Type: <code>String</code>, 
    default: <code>"ui-contextmenu"</code><br>
    This class is added to the outer ul element.
</dd>
<dt>autoFocus</dt>
<dd>
    Type: <code>Boolean</code>, 
    default: <code>false</code><br>
    Set keyboard focus to first menu entry on open.
</dd>
<dt>autoTrigger</dt>
<dd>
    Type: <code>Boolean</code>, 
    default: <code>true</code><br>
    Set `false` to prevent opening on a browser's `contextmenu` event, which is
    normally triggered by a  mouse rightclick.<br>
    The menu can still be opened by calling the `open()` method.
</dd>
<dt>delegate</dt>
<dd>
    Type: <code>String</code><br>
    A selector to filter the elements that trigger the context menu.    
</dd>
<dt>hide</dt>
<dd>
    Type: <code> Boolean | Number | String | Object</code>, 
    default: <code>{ effect: "fadeOut", duration: "fast" }</code><br>
    Effect applied when hiding the popup.<br>
    See <a href="http://api.jqueryui.com/jQuery.widget/#option-show">sample</a> 
    for possible option values.
</dd>
<dt>ignoreParentSelect</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>true</code><br>
    If <code>true</code>, a click on a menu item that contains a sub-menu, will 
    <em>not</em> trigger the <code>select</code> event.
</dd>
<dt>menu</dt>
<dd>
    Type: <code>Object[] | String | jQuery</code><br>
    jQuery object or selector of HTML markup that 
    defines the context menu structure (see 
    <a href="http://jqueryui.com/menu/">jQueryUI menu</a> for details).

    If an array of objects is passed, it will be used to generate
    such markup on the fly.
</dd>
<dt>position</dt>
<dd>
    Type: <code>Object | Function</code>,<br>
    default: <code>{my: "left top", at: "center", of: event, collision: "fit"}</code><br>
    Define position where popup opens. A simple <a href="http://api.jqueryui.com/position/">position</a> may be passed.<br>
    Also a function may be specified, to recalculate position every time:<br>
    <pre>
    $("#container").contextmenu({
        position: function(event, ui){
            return {my: "left top", at: "left bottom", of: ui.target};
        }, ...</pre>
</dd>
<dt>preventContextMenuForPopup</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>false</code><br>
    Prevent that a right click inside an open popup menu will open the browser's 
    system context menu.
</dd>
<dt>preventSelect</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>false</code><br>
    Prevent accidental text selection of potential menu targets on doubleclick 
    or drag.
</dd>
<dt>show</dt>
<dd>
    Type: <code> Boolean | Number | String | Object</code>, 
    default: <code>{ effect: "slideDown", duration: "fast"}</code><br>
    Effect applied when showing the popup.<br>
    See <a href="http://api.jqueryui.com/jQuery.widget/#option-show">sample</a> 
    for possible option values.
</dd>
<dt>taphold</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>false</code><br>
    Open menu on <a href="http://api.jquerymobile.com/taphold/">taphold events</a>, 
    which is especially useful for touch devices (but may require external 
    plugins to generate <code>taphold</code> events).
</dd>
<dt>tooltip</dt>
<dd>
    Type: <code>String</code>, optional<br>
    Add a <code>title</code> attribute to the menu markup, which will be displayed
    as tooltip by most browser (or external plugins).
</dd>
<dt>uiMenuOptions</dt>
<dd>
    Type: <code>Object</code>, default: <code>{}</code><br>
    Custom options passed to UI Menu, when the widget is created.<br>
    Especially useful to tweak the <a href="http://api.jqueryui.com/menu/#option-position">position of submenus</a>.
</dd>
</dl>


### Methods

<dl>
<dt>close()</dt>
<dd>
    Close context menu if open.<br>
    Call like <code>$(...).contextmenu("close");</code>.
</dd>
<dt>enableEntry(cmd, flag)</dt>
<dd>
    Enable or disable the entry. `flag` defaults to `true`<br>
    Call like <code>$(...).contextmenu("enableEntry", "paste", false);</code>.
</dd>
<dt>getMenu()</dt>
<dd>
    Return the jQuery object for the menu's <code>UL</code> element.
</dd>
<dt>isOpen()</dt>
<dd>
    Return true if popup is visible.
</dd>
<dt>open(target[, extraData])</dt>
<dd>
    Open context menu on a specific target (target (as a jQuery object) must match the options.delegate filter).<br>
    Call like <code>$(...).contextmenu("open", $(target)[, extraData]);</code>.
    Optional `extraData` will be available in event handlers as <code>ui.extraData</code>.
</dd>
<dt>replaceMenu(menu)</dt>
<dd>
    Replace the whole menu definition.<br>
    Call like <code>$(...).contextmenu("replaceMenu", "#menu2");</code>.
    or <code>$(...).contextmenu("replaceMenu", [{title: "aaa"}, {title: "bbb"}, ...]);</code>.
</dd>
<dt>setEntry(cmd, data)</dt>
<dd>
    Redefine menu entry (title or all of it).<br>
    `data` may be a title string or a menu definition object.<br>
    Call like <code>$(...).contextmenu("setEntry", "paste", "Paste link");</code>.
</dd>
<dt>showEntry(cmd, flag)</dt>
<dd>
    Show or hide the entry. `flag` defaults to `true`<br>
    Call like <code>$(...).contextmenu("showEntry", "paste", false);</code>.
</dd>
</dl>


### Events

jquery-contextmenu exposes events from [jQueryUI menu]: `blur`, `create`, `focus`, `select`.
However, since the `event.target` parameter contains the menu item, we additionally pass the element 
that was right-clicked in `ui.target`.

Events may be handled by passing a handler callback option:
```js
$("#container").contextmenu({
    [...]
    select: function(event, ui) {
        alert("select " + ui.cmd + " on " + ui.target.text());
    }
});
```

Alternatively a handler may be bound, so this is equivalent:
```js
$("#container").bind("contextmenuselect", function(event, ui) {
    alert("select " + ui.cmd + " on " + ui.target.text());
});
```

<dl>
<dt>beforeOpen(event, ui)</dt>
<dd>
    Triggered just before the popup menu is opened.<br>
    Return <code>false</code> to prevent opening.<br>
    This is also a good place to modify the menu (i.e. hiding, disabling, or
    renaming entries, or replace the menu altogether).
</dd>
<dt>blur(event, ui)</dt>
<dd>
    Triggered when the menu loses focus (original jQuery UI Menu event).
</dd>
<dt>close(event)</dt>
<dd>
    Triggered when the menu is closed.
</dd>
<dt>create(event, ui)</dt>
<dd>
    Triggered when the contextmenu widget is created.
</dd>
<dt>createMenu(event, ui)</dt>
<dd>
    Triggered when the popup menu is created (original jQuery UI Menu `create` event).
</dd>
<dt>focus(event, ui)</dt>
<dd>
    Triggered when a menu gains focus or when any menu item is activated (original jQuery UI Menu event).
</dd>
<dt>open(event)</dt>
<dd>
    Triggered when the menu is opened.
</dd>
<dt>select(event, ui)</dt>
<dd>
    Triggered when a menu item is selected.<br>
    <code>ui.cmd</code> contains the command id.
    Return <code>false</code> to prevent closing the menu.
</dd>
</dl>


# Tips and Tricks
### [Howto] Add right-aligned shortcut hints

Simply add a tag of your choice to the title (for example `<kbd>`)
```js
$(document).contextmenu({
    delegate: ".hasmenu",
    menu: [
        {title: "Edit title<kbd>[F2]</kbd>", cmd: "rename"}, 
        {title: "Copy <kbd>[Ctrl+C]</kbd>", cmd: "copy"}, ...
        ],
```
and make it right aligned via CSS:
```css
.ui-menu kbd {
    float: right;
}
```

### [Howto] Enable keyboard control

In order open a context menu with the keyboard, make sure the target elements
are tabbable, for example by adding a `tabindex="0"` attribute.
Also make sure the `autoFocus: true` option is set.
This will allow to Use <kbd>Tab</kbd> and the Windows <kbd>Menu</kbd> keys.


### [Howto] Modify the menu using an asynchronous request

```js
$(document).contextmenu({
    ...
    beforeOpen: function(event, ui) {
        // Immediate menu changes
        $(document).contextmenu("setEntry", "test", "(loading...)");
        // Menu opens, then we submit a request and wait for the resonse
        $.ajax({
            ...
        }).done(function(data) {
            // Modify the menu from the ajax response. The menu will be updated
            // while open
            $(document).contextmenu("setEntry", "test", {
                title: "New entry", cmd: "test", 
                children: [ ... ]
                });
        });
    },
```

Alternatively we can delay the opening until the response arrives:
```js
$(document).contextmenu({
    ...
    beforeOpen: function(event, ui) {
        var dfd = new $.Deferred();

        $.ajax({
            ...
        }).done(function(data) {
            // Modify the menu from the ajax response. The menu will be opened
            // afterwards
            $(document).contextmenu("setEntry", "test", {
                title: "New entry", cmd: "test", 
                children: [ ... ]
                });
            dfd.resolve(); // Notify about finished response
        });

        // Return a promise to delay opening until an async response becomes
        // available
        ui.result = dfd.promise();
    },
```


### [Howto] Bind different contextmenus to the same DOM element

This is especially useful if we want to bind contextmenus for different selectors
to the `document` element, in order to make them global:

```js
$(document).contextmenu({
    delegate: ".hasmenu",
    menu: ...,
    select: function(event, ui) {
        alert("select contextmenu 1" + ui.cmd + " on " + ui.target.text());
    }
});
```

Another call to `$(document).contextmenu({...})` would destroy the previous
instance, because the [jQuery Widget Factory](https://learn.jquery.com/jquery-ui/widget-factory/)
only allows one instance per element.

The soulution is to create new widget with another name but identical functionality:

```js
// 1. Create and register another widget that inherits directly from 
//    jquery-ui-contextmenu:
$.widget("moogle.contextmenu2", $.moogle.contextmenu, {});
// 2. Now we can bind this new widget to the same DOM element without
//    destroying a previous widget.
$(document).contextmenu2({
    delegate: ".hasmenu2",
    menu: ...,
    select: function(event, ui) {
        alert("select contextmenu2" + ui.cmd + " on " + ui.target.text());
    }
});
```


# Credits

Thanks to all [contributors](https://github.com/mar10/jquery-ui-contextmenu/contributors).


# Browser Status Matrix

[![Selenium Test Status](https://saucelabs.com/browser-matrix/sauce-contextmenu.svg)](https://saucelabs.com/u/sauce-contextmenu)


[jQueryUI menu]: http://jqueryui.com/menu/
