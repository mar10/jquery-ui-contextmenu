 // jQUnit defines:
 // asyncTest,deepEqual,equal,expect,module,notDeepEqual,notEqual,notStrictEqual,
 // ok,QUnit,raises,start,stop,strictEqual,test

 /*globals asyncTest,equal,expect,module,ok,QUnit,start,test */

/**
 * Tools inspired by https://github.com/jquery/jquery-ui/blob/master/tests/unit/menu/
 */
function TestHelpers() {

	var lastItem = "",
		log = [],
		$ = jQuery,
		match = $.ui.menu.version.match(/^(\d)\.(\d+)/),
		uiVersion = {
			major: parseInt(match[1], 10),
			minor: parseInt(match[2], 10)
		},
		uiVersionBefore11 = ( uiVersion.major < 2 && uiVersion.minor < 11 ),
		findEntry = function( menu, indexOrCommand ) {
			if ( typeof indexOrCommand === "number" ) {
				return menu.children( ":eq(" + indexOrCommand + ")" );
			}
			return menu.find("li[data-command=" + indexOrCommand + "]");
		};

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
		entryEvent: function( menu, item, type ) {
			lastItem = item;
			if ( uiVersionBefore11 ) {
				findEntry(menu, item).find( "a:first" ).trigger( type );
			} else {
				findEntry(menu, item).trigger( type );
			}
		},
		click: function( menu, item ) {
			lastItem = item;
			if ( uiVersionBefore11 ) {
				findEntry(menu, item).find( "a:first" ).trigger( "click" );
			} else {
				findEntry(menu, item).trigger( "click" );
			}
		},
		entry: findEntry,
		entryTitle: function( menu, item ) {
			// return the plain text (without sub-elements)
			if ( uiVersionBefore11 ) {
				return findEntry(menu, item).find( "a:first" ).contents().filter(function() {
					return this.nodeType === 3;
				})[0].nodeValue;
			} else {
			return findEntry(menu, item).contents().filter(function() {
					return this.nodeType === 3;
				})[0].nodeValue;
			}
		}
	};
}

// ****************************************************************************

jQuery(document).ready(function() {

/*******************************************************************************
 * QUnit setup
 */

QUnit.config.requireExpects = true;

var th = new TestHelpers(),
	log = th.log,
	logOutput = th.logOutput,
	click = th.click,
	entryEvent = th.entryEvent,
	entryTitle = th.entryTitle,
	entry = th.entry,
	lifecycle = {
		setup: function() {
			th.clearLog();
			// Always create a fresh copy of the menu <UL> definition
			$("#sampleMenuTemplate").clone().attr("id", "sampleMenu").appendTo("body");
		},
		teardown: function() {
			$(":moogle-contextmenu").contextmenu("destroy");
			$("#sampleMenu").remove();
		}
	},
	SAMPLE_MENU = [
		{ title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors" },
		{ title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy" },
		{ title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true },
		{ title: "----" },
		{ title: "More", children: [
			{ title: "Sub Item 1", cmd: "sub1" },
			{ title: "Sub Item 2", cmd: "sub2" }
			] }
		],
	$ = jQuery,
	sauceLabsLog = [];

// SauceLabs integration
QUnit.testStart(function(testDetails) {
	QUnit.log(function(details) {
		if (!details.result) {
			details.name = testDetails.name;
			sauceLabsLog.push(details);
		}
	});
});

QUnit.done(function(testResults) {
	var tests = [],
		i, len, details;
	for (i = 0, len = sauceLabsLog.length; i < len; i++) {
		details = sauceLabsLog[i];
		tests.push({
			name: details.name,
			result: details.result,
			expected: details.expected,
			actual: details.actual,
			source: details.source
		});
	}
	testResults.tests = tests;

	/*jshint camelcase:false*/ // jscs: disable
	window.global_test_results = testResults; // used by saucelabs
	/*jshint camelcase:true*/ // jscs: enable
});

//---------------------------------------------------------------------------

module("prototype", lifecycle);

test("globals", function() {
	expect(2);
	ok( !!$.moogle.contextmenu, "exists in ui namnespace");
	ok( !!$.moogle.contextmenu.version, "has version number");
});

// ---------------------------------------------------------------------------

module("create", lifecycle);

function _createTest(menu) {
	var $ctx;

	expect(5);

	log( "constructor");
	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		preventSelect: true,
		create: function() {
			log("create");
		},
		createMenu: function() {
			log("createMenu");
		}
	});
	log( "afterConstructor");
	$ctx = $(":moogle-contextmenu");
	equal( $ctx.length, 1, "widget created");
	// equal( $("#sampleMenu").hasClass( "ui-contextmenu" ), true,
	// 	"Class set to menu definition");
	equal( $("head style.moogle-contextmenu-style").length, 1, "global stylesheet created");

	$ctx.contextmenu("destroy");

	equal( $(":moogle-contextmenu").length, 0, "widget destroyed");
  //   equal( $("#sampleMenu").hasClass("ui-contextmenu"), false,
		// "Class removed from menu definition");
	equal( $("head style.moogle-contextmenu-style").length, 0, "global stylesheet removed");

	equal(logOutput(), "constructor,createMenu,create,afterConstructor",
		  "Event sequence OK." );
}

test("create from UL", function() {
	_createTest("ul#sampleMenu");
});

test("create from array", function() {
	_createTest(SAMPLE_MENU);
});

//---------------------------------------------------------------------------

module("open", lifecycle);

function _openTest(menu) {
	var $ctx, $popup;

	expect(19);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		beforeOpen: function(event, ui) {
			log("beforeOpen");

			equal( event.type, "contextmenubeforeopen",
				   "beforeOpen: Got contextmenubeforeopen event" );
			equal( ui.target.text(), "AAA",
				  "beforeOpen: ui.target is set" );
			ok( $popup.is(":hidden"),
				"beforeOpen: Menu is hidden" );
			ok( !entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is enabled" );
			ok( entry($popup, 2).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 2 is disabled" );

			ok($ctx.contextmenu("isOpen"), "isOpen() false in beforeOpen event");

			$("#container").contextmenu("enableEntry", "cut", false);
			$("#container").contextmenu("showEntry", "copy", false);
		},
		open: function(event) {
			log("open");

			ok( $popup.is(":visible"),
				"open: Menu is visible" );
			ok( $popup.hasClass("ui-contextmenu"),
				"Class removed from menu definition");
			ok( entry($popup, 2).hasClass("ui-state-disabled"),
				"open: Entry is disabled" );

			ok( $ctx.contextmenu("isOpen"),
				"isOpen() true in open event");

			ok( entry($popup, 0).is(":visible"),
				"beforeOpen: Entry 0 is visible" );
			ok( entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is disabled: enableEntry(false) worked" );

			ok( entry($popup, 1).is(":hidden"),
				"beforeOpen: Entry 1 is hidden: showEntry(false) worked" );
			ok( !entry($popup, 1).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 1 is enabled" );

			equal(logOutput(), "open(),beforeOpen,after open(),open",
				  "Event sequence OK.");
			start();
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	ok($popup, "getMenu() works");
	ok(!$ctx.contextmenu("isOpen"), "menu initially closed");

	equal( $ctx.length, 1, "widget created");
	ok($popup.is(":hidden"), "Menu is hidden");
	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");
}

asyncTest("UL menu", function() {
	_openTest("ul#sampleMenu");
});

asyncTest("Array menu", function() {
	_openTest(SAMPLE_MENU);
});

//---------------------------------------------------------------------------

module("click event sequence", lifecycle);

function _clickTest(menu) {
	var $ctx, $popup;

	expect(3);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
//        show: false,
//        hide: false,
		beforeOpen: function(event, ui) {
			log("beforeOpen(" + ui.target.text() + ")");
		},
		create: function(event, ui) {
			log("create");
		},
		createMenu: function(event, ui) {
			log("createMenu");
		},
		/*TODO: Seems that focus gets called twice in Safary, but nod PhantomJS */
//        focus: function(event, ui) {
//            var t = ui.item ? $(ui.item).find("a:first").attr("href") : ui.item;
//            log("focus(" + t + ")");
////            equal( ui.cmd, "cut", "focus: ui.cmd is set" );
////            ok( !ui.target || ui.target.text() === "AAA", "focus: ui.target is set" );
//        },
//        /* blur seems always to have ui.item === null. Also called twice in Safari? */
//		blur: function(event, ui) {
//		    var t = ui.item ? $(ui.item).find("a:first").attr("href") : ui.item;
//			log("blur(" + t + ")");
////            equal( ui.cmd, "cut", "blur: ui.cmd is set" );
////            equal( ui.target && ui.target.text(), "AAA", "blur: ui.target is set" );
//		},
		select: function(event, ui) {
//			window.console.log("select");
			var t = ui.item ? $(ui.item).attr("data-command") : ui.item;
			log("select(" + t + ")");
			equal( ui.cmd, "cut", "select: ui.cmd is set" );
			equal( ui.target.text(), "AAA", "select: ui.target is set" );
		},
		open: function(event) {
			log("open");
			setTimeout(function() {
				entryEvent($popup, 0, "mouseenter");
				click($popup, 0);
			}, 10);
		},
		close: function(event) {
			log("close");
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");

	setTimeout(function() {
		// TODO: why is focus() called twice?
		equal(logOutput(),
			  "createMenu,create,open(),beforeOpen(AAA),after open(),open,select(cut),close",
			  "Event sequence OK.");
		start();
	}, 1000);
}

asyncTest("Array menu", function() {
	_clickTest(SAMPLE_MENU);
});

asyncTest("UL menu", function() {
	_clickTest("ul#sampleMenu");
});

// ****************************************************************************

module("'action' option", lifecycle);

asyncTest("Array menu", function() {
	var $ctx, $popup,
		menu  = [
		   { title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors",
			data: { foo: "bar" }, addClass: "custom-class-1",
			action: function(event, ui) {
				log("cut action");
				equal( ui.cmd, "cut", "action: ui.cmd is set" );
				equal( ui.target.text(), "AAA", "action: ui.target is set" );
				equal( ui.item.data().foo, "bar", "action: ui.item.data() is set" );
				ok( ui.item.hasClass("custom-class-1"), "action: addClass property works" );
			}
		   },
		   { title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy" },
		   { title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true }
		   ];

	expect(9);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		open: function(event) {
			log("open");
			setTimeout(function() {
				click($popup, 0);
			}, 10);
		},
		select: function(event, ui) {
			var t = ui.item ? $(ui.item).attr("data-command") : ui.item;
			log("select(" + t + ")");
			equal( ui.cmd, "cut", "select: ui.cmd is set" );
			equal( ui.target.text(), "AAA", "select: ui.target is set" );
			equal( ui.item.data().foo, "bar", "ui.item.data() is set" );
			ok( ui.item.hasClass("custom-class-1"), "addClass property works" );
		},
		close: function(event) {
			log("close");
		}
	});

   $ctx = $(":moogle-contextmenu");
   $popup = $ctx.contextmenu("getMenu");

   log("open()");
   $ctx.contextmenu("open", $("span.hasmenu:first"));
   log("after open()");

   setTimeout(function() {
	   equal(logOutput(), "open(),after open(),open,select(cut),cut action,close",
		   "Event sequence OK.");
	   start();
   }, 500);
});

// ****************************************************************************

module("'beforeOpen' event", lifecycle);

asyncTest("modify on open", function() {
	var $ctx, $popup,
		menu  = [
		   { title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors" },
		   { title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy" },
		   { title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true }
		   ];

	expect(9);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		beforeOpen: function(event, ui) {
			log("beforeOpen");
			$ctx
				.contextmenu("setEntry", "cut", "Cut - changed")
				.contextmenu("setEntry", "copy", { title: "Copy - changed", cmd: "copy2" })
				.contextmenu("setEntry", "paste", {
					title: "Paste - changed", cmd: "paste",
					children: [
						{ title: "Sub 1", cmd: "sub_1" },
						{ title: "Sub 2", cmd: "sub_2", disabled: true }
						]
					} );
		},
		open: function(event) {
			log("open");
			equal(entryTitle($popup, "cut"), "Cut - changed",
				"setEntry(string)");
			equal(entry($popup, "copy").length, 0,
				"setEntry(object) change command id");
			equal(entryTitle($popup, "copy2"), "Copy - changed",
				"setEntry(object) set title");
			equal(entryTitle($popup, "paste"), "Paste - changed",
				"setEntry(object) set nested title");
			equal(entryTitle($popup, "sub_1"), "Sub 1",
				"setEntry(object) created nested entry");
			ok(entry($popup, "sub_2").hasClass("ui-state-disabled"),
				"setEntry(object) created nested disabled entry");

			setTimeout(function() {
				click($popup, "cut");
			}, 10);
		},
		select: function(event, ui) {
			var t = ui.item ? $(ui.item).attr("data-command") : ui.item;
			log("select(" + t + ")");
			equal( ui.cmd, "cut", "select: ui.cmd is set" );
			equal( ui.target.text(), "AAA", "select: ui.target is set" );
		},
		close: function(event) {
			log("close");
		}
	});

   $ctx = $(":moogle-contextmenu");
   $popup = $ctx.contextmenu("getMenu");

   log("open()");
   $ctx.contextmenu("open", $("span.hasmenu:first"));
   log("after open()");

   setTimeout(function() {
	   equal(logOutput(), "open(),beforeOpen,after open(),open,select(cut),close",
		   "Event sequence OK.");
	   start();
   }, 500);

});

});
