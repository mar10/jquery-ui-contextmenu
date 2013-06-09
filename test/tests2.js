 // jQUnit defines:
 // asyncTest,deepEqual,equal,expect,module,notDeepEqual,notEqual,notStrictEqual,ok,QUnit,raises,start,stop,strictEqual,test

 /*globals asyncTest,equal,expect,module,ok,QUnit,start,test */

/**
 * Tools inspired by https://github.com/jquery/jquery-ui/blob/master/tests/unit/menu/
 */
function TestHelpers() {

	var lastItem = "",
		log = [],
		$ = jQuery;

	return {
		log: function( message, clear ) {
			if ( clear ) {
				log.length = 0;
			}
			if ( message === undefined ) {
				message = lastItem;
			}
//	        window.console.log(message);
			log.push( $.trim( message ) );
		},
		logOutput: function() {
			return log.join( "," );
		},
		clearLog: function() {
			log.length = 0;
		},
		click: function( menu, item ) {
			lastItem = item;
			window.console.log("click: ", menu.children( ":eq(" + item + ")" ).find( "a:first" ).length);
			menu.children( ":eq(" + item + ")" ).find( "a:first" ).trigger( "click" );
		},
		entry: function( menu, item ) {
			return menu.children( ":eq(" + item + ")" );
		}
	};
}

// ****************************************************************************

jQuery(document).ready(function(){

/*******************************************************************************
 * QUnit setup
 */
QUnit.log(function(data) {
	if (window.console && window.console.log) {
//        window.console.log(data.result + " :: " + data.message);
	}
});
QUnit.config.requireExpects = true;

var th = new TestHelpers(),
	log = th.log,
	logOutput = th.logOutput,
	click = th.click,
	entry = th.entry,
	lifecycle = {
		setup: function () {
			th.clearLog();
			// Always create a fresh copy of the menu <UL> definition
			$("#sampleMenuTemplate").clone().attr("id", "sampleMenu").appendTo("body");
		},
		teardown: function () {
			$(":moogle-contextmenu").contextmenu("destroy");
			$("#sampleMenu").remove();
		}
	},
	SAMPLE_MENU = [
		{title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors"},
		{title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy"},
		{title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true },
		{title: "----"},
		{title: "More", children: [
			{title: "Sub Item 1", cmd: "sub1"},
			{title: "Sub Item 2", cmd: "sub2"}
			]}
		],
	$ = jQuery;




// ---------------------------------------------------------------------------

//---------------------------------------------------------------------------

module("open", lifecycle);

function _openTest(menu){
	var $ctx, $popup;

	window.console.log("TEST 1 --------------------------------------");

	expect(11);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		beforeOpen: function(event, ui){
			log("beforeOpen");

			equal( event.type, "contextmenubeforeopen",
				   "beforeOpen: Got contextmenubeforeopen event" );
			equal( ui.target.text(), "AAA",
				  "beforeOpen: ui.target is set" );
			ok( $popup.is(":hidden"), "beforeOpen: Menu is hidden" );
			ok( ! entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is enabled" );
			ok( entry($popup, 2).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 2 is disabled" );

			$("#container").contextmenu("enableEntry", "cut", false);

			ok( entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is disabled" );
		},
		open: function(event){
			log("open");

			ok( $popup.is(":visible"), "open: Menu is visible" );
			ok( entry($popup, 2).hasClass("ui-state-disabled"), "open: Entry is disabled" );
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	equal( $ctx.length, 1, "widget created");
	ok($popup.is(":hidden"), "Menu is hidden");
	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");
	setTimeout(function(){
		equal(logOutput(), "open(),beforeOpen,after open(),open",
		  "Event sequence OK.");
		window.console.log("TEST 1 END ----------------------------------");
		start();
	}, 500);
}


asyncTest("UL menu", function(){
	_openTest("ul#sampleMenu");
});


asyncTest("Array menu", function(){
	_openTest(SAMPLE_MENU);
});


//---------------------------------------------------------------------------

module("click event sequence", lifecycle);

function _clickTest(menu){
	var $ctx, $popup;

	window.console.log("TEST 2 --------------------------------------");

	expect(3);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		beforeOpen: function(event, ui){
			log("beforeOpen(" + ui.target.text() + ")");
		},
		create: function(event, ui){
			log("create");
		},
		createMenu: function(event, ui){
			log("createMenu");
		},
//        focus: function(event, ui){
//            log("focus");
//        },
//        blur: function(event, ui){
//            log("blur");
//        },
		select: function(event, ui){
			window.console.log("select");
			var t = ui.item ? $(ui.item).find("a:first").attr("href") : ui.item;
			log("select(" + t + ")");
			equal( ui.cmd, "cut", "select: ui.cmd is set" );
			equal( ui.target.text(), "AAA", "select: ui.target is set" );
		},
		open: function(event){
			log("open");
			setTimeout(function(){
				var ctm = $ctx.data("moogle-contextmenu"),
					mnu = ctm.$menu.data("ui-menu");
				click($popup, 0);
				console.log($popup, $ctx);
			}, 10);
		},
		close: function(event){
			log("close");
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");

	setTimeout(function(){
		// TODO: why is focus() called twice?
		equal(logOutput(), "createMenu,create,open(),beforeOpen(AAA),after open(),open,select(#cut),close",
				"Event sequence OK.");
		window.console.log("TEST 2 END ----------------------------------");
		start();
	}, 500);
}


asyncTest("Array menu", function(){
	_clickTest(SAMPLE_MENU);
});


asyncTest("UL menu", function(){
	_clickTest("ul#sampleMenu");
});


});
