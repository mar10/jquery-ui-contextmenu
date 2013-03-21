# jquery-contextmenu

A jQuery plugin that provides a context menu (based on the standard [jQueryUI menu] widget).

  * themable
  * supports delegation (i.e. can be bound to elements that don't exist at the
    time the context menu is initialized)
  * exposes events from [jQueryUI menu]: `blur`, `create`, `focus`, `select`


## Status
Pre-alpha *not* ready for production

## Demo

See sample-widget.html


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
        delegate : ".hasmenu",
        menu : "#options",
        select : function(event, ui) {
            var menuId = ui.item.find(">a").attr("href");
            alert("select " + menuId);
        }
    });
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


[jQueryUI menu]: http://jqueryui.com/menu/
