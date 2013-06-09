/*jshint node: true */

"use strict";

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
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
		qunit: {
			all: ["test/index.html"]
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
		uglify: {
			options: {
				banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
				"<%= grunt.template.today('yyyy-mm-dd') %> | " +
				"<%= pkg.homepage ? ' ' + pkg.homepage + ' | ' : '' %>" +
				" Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
				" Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n"
			},
			build: {
				src: "jquery.ui-contextmenu.js",
//                dest: "build/jquery.ui-contextmenu-<%= pkg.version %>.min.js"
				dest: "jquery.ui-contextmenu.min.js"
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
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-exec");

	grunt.registerTask("server", ["connect:demo"]);
	grunt.registerTask("test", ["jshint",
								"qunit"]);
	grunt.registerTask("travis", ["test"]);
	grunt.registerTask("default", ["test"]);
	grunt.registerTask("build", ["exec:tabfix",
								 "test",
								 "uglify"]);
	grunt.registerTask("upload", ["build",
								  "exec:upload"]);
	grunt.registerTask("server", ["connect:demo"]);
};
