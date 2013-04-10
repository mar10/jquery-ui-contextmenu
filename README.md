# jquery-contextmenu [![Build Status](https://travis-ci.org/mar10/jquery-contextmenu.png?branch=master)](https://travis-ci.org/mar10/jquery-contextmenu)

A jQuery plugin that provides a context menu (based on the standard [jQueryUI menu] widget).

  * themable
  * supports delegation (i.e. can be bound to elements that don't exist at the
    time the context menu is initialized)
  * exposes events from [jQueryUI menu]: `blur`, `create`, `focus`, `select`


## Status
Beta. Please report issues.


## Demo

[Live demo page](http://mar10.github.com/jquery-contextmenu/demo/sample-widget.html)


## Example

Say we have some HTML elements that we want to attach a popup menu to:

```html
<div id="container">
    <div class="hasmenu">AAA</div>
    <div class="hasmenu">BBB</div>
    <div class="hasmenu">CCC</div>
</div>
```


now we can enable a contextmenu like so:
 
```js
$("#container").contextmenu({
    delegate: ".hasmenu",
    menu: "#options",
    select: function(event, ui) {
        var menuId = ui.item.find(">a").attr("href"),
            target = event.relatedTarget;
        alert("select " + menuId + " on " + $(target).text());
    }
});
```

To apply the selector globally, pass `document` as context:

```js
$(document).contextmenu({
    delegate: ".hasmenu",
    [...]
});
```

Of course we also have to provide some HTML markup that defines the context menu 
structure (see [jQueryUI menu] for details):

```html
<ul id="options" class="ui-helper-hidden">
    <li><a href="#action1">Action 1</a>
    <li><a href="#action2">Action 2</a>
    <li class="ui-state-disabled"><a href="#action3">Action 3</a>
    <li>----
    <li><a>Extra</a>
        <ul>
            <li><a href="#action4">sub4</a>
            <li><a href="#action5">sub5</a>
        </ul>
</ul>
```


## API documentation
### Options
<dl>
<dt>delegate</dt>
<dd>
    Type: <code>String</code><br>
    A selector to filter the elements that trigger the context menu.    
</dd>
<dt>ignoreParentSelect</dt>
<dd>
    Type: <code>Boolean</code>, default: <code>true</code><br>
    If <code>true</code>, a click on a menu item that contains a sub-menu, will <em>not</em>
    trigger the <code>select</code> event.
</dd>
<dt>menu</dt>
<dd>
    Type: <code>String | jQuery | function</code><br>
    jQuery object or selector (or function returning such) of HTML markup that defines the context menu
    structure (see [jQueryUI menu] for details).
</dd>

</dl>


### Methods
<dl>
<dt>close()</dt>
<dd>
    Close context menu if open.<br>
    Call like <code>$(...).contextmenu("close");</code>.
</dd>
<dt>open(target)</dt>
<dd>
    Open context menu on a specific target (target must match the options.delegate filter).<br>
    Call like <code>$(...).contextmenu("open", target);</code>.
</dd>
</dl>


### Events
jquery-contextmenu exposes events from [jQueryUI menu]: `blur`, `create`, `focus`, `select`.
However, since the `event.target` parameter contains the menu item, we additionally pass the element 
that was right-clicked in `event.relatedTarget`.

Events may be handled by defining a handler option:
```js
$("#container").contextmenu({
    [...]
    select: function(event, ui) {
        var menuId = ui.item.find(">a").attr("href"),
            target = event.relatedTarget;
        alert("select " + menuId + " on " + $(target).text());
    }
});
```

Alternatively a handler may be bound, so this is equivalent:
```js
$("#container").bind("contextmenuselect", function(event, ui) {
    var menuId = ui.item.find(">a").attr("href"),
        target = event.relatedTarget;
    alert("select " + menuId + " on " + $(target).text());
}
```

<dl>
<dt>beforeOpen(event)</dt>
<dd>
    Triggered just before the popup menu is opened.<br>
    Return <code>false</code> to prevent opening.
</dd>
<dt>blur(event, ui)</dt>
<dd>
    Triggered when the menu loses focus.
</dd>
<dt>close(event)</dt>
<dd>
    Triggered when the menu is closed.
</dd>
<dt>create(event, ui)</dt>
<dd>
    Triggered when the menu is created.
</dd>
<dt>focus(event, ui)</dt>
<dd>
    Triggered when a menu gains focus or when any menu item is activated.
</dd>
<dt>init(event)</dt>
<dd>
    Triggered when the contextmenu widget is initialized.
</dd>
<dt>open(event)</dt>
<dd>
    Triggered when the menu is opened.
</dd>
<dt>select(event, ui)</dt>
<dd>
    Triggered when a menu item is selected.<br>
    Return <code>false</code> to prevent closing the menu.
</dd>
</dl>

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/mar10/jquery-contextmenu/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[jQueryUI menu]: http://jqueryui.com/menu/
