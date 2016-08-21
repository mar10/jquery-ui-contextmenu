 // jQUnit defines:
 // asyncTest,deepEqual,equal,expect,module,notDeepEqual,notEqual,notStrictEqual,
 // ok,QUnit,raises,start,stop,strictEqual,test

 /*globals QUnit */

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
		uiVersionBefore12 = ( uiVersion.major < 2 && uiVersion.minor < 12 ),
		findEntry = function( menu, indexOrCommand ) {
			if ( typeof indexOrCommand === "number" ) {
				return menu.children( ":eq(" + indexOrCommand + ")" );
			}
			return menu.find("li[data-command=" + indexOrCommand + "]");
		},
		findEntryInner = function( menu, indexOrCommand ) {
			if ( uiVersionBefore11 ) {
				// jQuery UI <= 1.10 used `<a>` tags
				return findEntry(menu, indexOrCommand).find( "a:first" );
			} else if ( uiVersionBefore12 ) {
				// jQuery UI == 1.11 prefered to avoid `<a>` tags
				return findEntry(menu, indexOrCommand);
			} else {
				// jQuery UI 1.12+ introduced `<div>` wrappers
				return findEntry(menu, indexOrCommand).find( ">div:first" );
				// return findEntry(menu, indexOrCommand).children( ".ui-menu-item-wrapper" );
			}
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
			findEntryInner(menu, item).trigger( type );
		},
		click: function( menu, item ) {
			lastItem = item;
			// console.log("click", menu, item, findEntryInner(menu, item));
			findEntryInner(menu, item).trigger( "click" );
		},
		entry: findEntry,
		entryTitle: function( menu, item ) {
			// return the plain text (without sub-elements)
			return findEntryInner(menu, item).contents().filter(function() {
					return this.nodeType === 3;
				})[0].nodeValue;
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
	$ = jQuery,
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

QUnit.module("prototype", lifecycle);

QUnit.test("globals", function(assert) {
	assert.expect(2);
	assert.ok( !!$.moogle.contextmenu, "exists in ui namnespace");
	assert.ok( !!$.moogle.contextmenu.version, "has version number");
});

// ---------------------------------------------------------------------------

QUnit.module("create", lifecycle);

function _createTest(menu, assert) {
	var $ctx;

	assert.expect(5);

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
	assert.equal( $ctx.length, 1, "widget created");
	// equal( $("#sampleMenu").hasClass( "ui-contextmenu" ), true,
	// 	"Class set to menu definition");
	assert.equal( $("head style.moogle-contextmenu-style").length, 1, "global stylesheet created");

	$ctx.contextmenu("destroy");

	assert.equal( $(":moogle-contextmenu").length, 0, "widget destroyed");
  //   equal( $("#sampleMenu").hasClass("ui-contextmenu"), false,
		// "Class removed from menu definition");
	assert.equal( $("head style.moogle-contextmenu-style").length, 0, "global stylesheet removed");

	assert.equal(logOutput(), "constructor,createMenu,create,afterConstructor",
		  "Event sequence OK." );
}

QUnit.test("create from UL", function(assert) {
	_createTest("ul#sampleMenu", assert);
});

QUnit.test("create from array", function(assert) {
	_createTest(SAMPLE_MENU, assert);
});

//---------------------------------------------------------------------------

QUnit.module("open", lifecycle);

function _openTest(menu, assert) {
	var $ctx, $popup,
		done = assert.async();

	assert.expect(19);

	$("#container").contextmenu({
		delegate: ".hasmenu",
		menu: menu,
		beforeOpen: function(event, ui) {
			log("beforeOpen");

			assert.equal( event.type, "contextmenubeforeopen",
				   "beforeOpen: Got contextmenubeforeopen event" );
			assert.equal( ui.target.text(), "AAA",
				  "beforeOpen: ui.target is set" );
			assert.ok( $popup.is(":hidden"),
				"beforeOpen: Menu is hidden" );
			assert.ok( !entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is enabled" );
			assert.ok( entry($popup, 2).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 2 is disabled" );

			assert.ok($ctx.contextmenu("isOpen"), "isOpen() false in beforeOpen event");

			$("#container").contextmenu("enableEntry", "cut", false);
			$("#container").contextmenu("showEntry", "copy", false);
		},
		open: function(event) {
			log("open");

			assert.ok( $popup.is(":visible"),
				"open: Menu is visible" );
			assert.ok( $popup.hasClass("ui-contextmenu"),
				"Class removed from menu definition");
			assert.ok( entry($popup, 2).hasClass("ui-state-disabled"),
				"open: Entry is disabled" );

			assert.ok( $ctx.contextmenu("isOpen"),
				"isOpen() true in open event");

			assert.ok( entry($popup, 0).is(":visible"),
				"beforeOpen: Entry 0 is visible" );
			assert.ok( entry($popup, 0).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 0 is disabled: enableEntry(false) worked" );

			assert.ok( entry($popup, 1).is(":hidden"),
				"beforeOpen: Entry 1 is hidden: showEntry(false) worked" );
			assert.ok( !entry($popup, 1).hasClass("ui-state-disabled"),
				"beforeOpen: Entry 1 is enabled" );

			assert.equal(logOutput(), "open(),beforeOpen,after open(),open",
				  "Event sequence OK.");
			done();
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	assert.ok($popup, "getMenu() works");
	assert.ok(!$ctx.contextmenu("isOpen"), "menu initially closed");

	assert.equal( $ctx.length, 1, "widget created");
	assert.ok($popup.is(":hidden"), "Menu is hidden");
	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");
}

QUnit.test("UL menu", function(assert) {
	_openTest("ul#sampleMenu", assert);
});

QUnit.test("Array menu", function(assert) {
	_openTest(SAMPLE_MENU, assert);
});

//---------------------------------------------------------------------------

QUnit.module("click event sequence", lifecycle);

function _clickTest(menu, assert) {
	var $ctx, $popup,
		done = assert.async();

	assert.expect(3);

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
		/*TODO: Seems that focus gets called twice in Safary, but not PhantomJS */
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
			assert.equal( ui.cmd, "cut", "select: ui.cmd is set" );
			assert.equal( ui.target.text(), "AAA", "select: ui.target is set" );
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
			assert.equal(logOutput(),
				  "createMenu,create,open(),beforeOpen(AAA),after open(),open,select(cut),close",
				  "Event sequence OK.");
			done();
		}
	});

	$ctx = $(":moogle-contextmenu");
	$popup = $ctx.contextmenu("getMenu");

	log("open()");
	$ctx.contextmenu("open", $("span.hasmenu:first"));
	log("after open()");

	// setTimeout(function() {
	// 	// TODO: why is focus() called twice?
	// 	assert.equal(logOutput(),
	// 		  "createMenu,create,open(),beforeOpen(AAA),after open(),open,select(cut),close",
	// 		  "Event sequence OK.");
	// 	done();
	// }, 500);
}

QUnit.test("Array menu", function(assert) {
	_clickTest(SAMPLE_MENU, assert);
});

QUnit.test("UL menu", function(assert) {
	_clickTest("ul#sampleMenu", assert);
});

// ****************************************************************************

QUnit.module("'action' option", lifecycle);

QUnit.test("Array menu", function(assert) {
	var $ctx, $popup,
		menu  = [
		   { title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors",
			data: { foo: "bar" }, addClass: "custom-class-1",
			action: function(event, ui) {
				log("cut action");
				assert.equal( ui.cmd, "cut", "action: ui.cmd is set" );
				assert.equal( ui.target.text(), "AAA", "action: ui.target is set" );
				assert.equal( ui.item.data().foo, "bar", "action: ui.item.data() is set" );
				assert.ok( ui.item.hasClass("custom-class-1"), "action: addClass property works" );
			}
		   },
		   { title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy" },
		   { title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true }
		   ],
		done = assert.async();

	assert.expect(9);

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
			assert.equal( ui.cmd, "cut", "select: ui.cmd is set" );
			assert.equal( ui.target.text(), "AAA", "select: ui.target is set" );
			assert.equal( ui.item.data().foo, "bar", "ui.item.data() is set" );
			assert.ok( ui.item.hasClass("custom-class-1"), "addClass property works" );
		},
		close: function(event) {
			log("close");
			assert.equal(logOutput(), "open(),after open(),open,select(cut),cut action,close",
				"Event sequence OK.");
			done();
		}
	});

   $ctx = $(":moogle-contextmenu");
   $popup = $ctx.contextmenu("getMenu");

   log("open()");
   $ctx.contextmenu("open", $("span.hasmenu:first"));
   log("after open()");

   // setTimeout(function() {
	  //  assert.equal(logOutput(), "open(),after open(),open,select(cut),cut action,close",
		 //   "Event sequence OK.");
	  //  done();
   // }, 500);
});

// ****************************************************************************

QUnit.module("'beforeOpen' event", lifecycle);

QUnit.test("modify on open", function(assert) {
	var $ctx, $popup,
		menu  = [
		   { title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors" },
		   { title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy" },
		   { title: "Paste", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true }
		   ],
		done = assert.async();

	assert.expect(9);

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
			assert.equal(entryTitle($popup, "cut"), "Cut - changed",
				"setEntry(string)");
			assert.equal(entry($popup, "copy").length, 0,
				"setEntry(object) change command id");
			assert.equal(entryTitle($popup, "copy2"), "Copy - changed",
				"setEntry(object) set title");
			assert.equal(entryTitle($popup, "paste"), "Paste - changed",
				"setEntry(object) set nested title");
			assert.equal(entryTitle($popup, "sub_1"), "Sub 1",
				"setEntry(object) created nested entry");
			assert.ok(entry($popup, "sub_2").hasClass("ui-state-disabled"),
				"setEntry(object) created nested disabled entry");

			setTimeout(function() {
				click($popup, "cut");
			}, 10);
		},
		select: function(event, ui) {
			var t = ui.item ? $(ui.item).attr("data-command") : ui.item;
			log("select(" + t + ")");
			assert.equal( ui.cmd, "cut", "select: ui.cmd is set" );
			assert.equal( ui.target.text(), "AAA", "select: ui.target is set" );
		},
		close: function(event) {
			log("close");
			assert.equal(logOutput(), "open(),beforeOpen,after open(),open,select(cut),close",
				"Event sequence OK.");
			done();
		}
	});

   $ctx = $(":moogle-contextmenu");
   $popup = $ctx.contextmenu("getMenu");

   log("open()");
   $ctx.contextmenu("open", $("span.hasmenu:first"));
   log("after open()");

   // setTimeout(function() {
	  //  assert.equal(logOutput(), "open(),beforeOpen,after open(),open,select(cut),close",
		 //   "Event sequence OK.");
	  //  done();
   // }, 1500);

});

});
