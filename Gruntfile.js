/*jshint node: true, camelcase: false */

"use strict";

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		compare_size: {
			files: [
				"jquery.ui-contextmenu.min.js",
				"jquery.ui-contextmenu.js"
			],
			options: {
				compress: {
					gz: function (fileContents) {
							return require("gzip-js").zip(fileContents, {}).length;
					}
				}
			}
		},
		connect: {
			demo: {
				options: {
					hostname: "*",  // make accessible from everywhere
					port: 8080,
					base: "./",
					keepalive: true
				}
			},
			sauce: {
				options: {
					hostname: "localhost",
					port: 9999,
					base: "",
					keepalive: false
				}
			}
		},
		exec: {
			tabfix: {
				// Cleanup whitespace according to http://contribute.jquery.org/style-guide/js/
				// (requires https://github.com/mar10/tabfix)
//				cmd: "tabfix -t --line=UNIX -r -m *.js,*.css,*.html,*json,*.yaml -i node_modules ."
				cmd: "tabfix -t -r -m *.js,*.css,*.html,*json,*.yaml -i node_modules ."
			},
			upload: {
				// FTP upload the demo files (requires https://github.com/mar10/pyftpsync)
				cmd: "pyftpsync --progress upload . ftp://www.wwwendt.de/tech/demo/jquery-contextmenu --delete-unmatched --omit dist,node_modules,.*,_* -x"
			}
		},
		jshint: {
			files: [
				"Gruntfile.js",
				"jquery.ui-contextmenu.js",
				"test/tests.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		qunit: {
			all: ["test/index.html"]
		},
		"saucelabs-qunit": {
			all: {
				options: {
					urls: ["http://localhost:9999/test/index.html"],
					// username: process.env.SAUCE_USERNAME,
					// key: process.env.SAUCE_ACCESS_KEY,
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: [
						{ browserName: "safari", platform: "OS X 10.8"},
						{ browserName: "firefox", platform: "Windows 7"},
						{ browserName: "firefox", platform: "Windows XP"},
						{ browserName: "firefox", platform: "Linux"},
						{ browserName: "chrome", platform: "Windows 7"},
						{ browserName: "internet explorer", platform: "Windows 8", version: "10" },
						{ browserName: "internet explorer", platform: "Windows 7", version: "9" }
					],
					testname: "jquery.ui-contextmenu qunit tests"
				}
			}
		},
		uglify: {
			options: {
				banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
					"<%= grunt.template.today('yyyy-mm-dd') %> | " +
					"<%= pkg.homepage ? ' ' + pkg.homepage + ' | ' : '' %>" +
					" Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
					" Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n",
				report: "gzip"
			},
			build: {
				src: "jquery.ui-contextmenu.js",
//                dest: "build/jquery.ui-contextmenu-<%= pkg.version %>.min.js"
				dest: "jquery.ui-contextmenu.min.js"
			}
		}
	});

	// Loadi "grunt*" dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	grunt.registerTask("server", ["connect:demo"]);
	grunt.registerTask("test", ["jshint",
								"qunit"]);

	//
	// See
	// https://saucelabs.com/docs/javascript-unit-testing-tutorial
	//
	grunt.registerTask("saucelabs", ["connect:sauce",
									 "saucelabs-qunit"]);

	grunt.registerTask("travis", ["test"]);
	grunt.registerTask("default", ["test"]);
	grunt.registerTask("build", ["exec:tabfix",
								 "test",
								 "uglify",
								 "compare_size"
								 // "saucelabs"
								 ]);
	grunt.registerTask("upload", ["build",
								  "exec:upload"]);
	grunt.registerTask("server", ["connect:demo"]);
};
