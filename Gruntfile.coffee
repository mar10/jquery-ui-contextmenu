#jshint node: true, camelcase: false 
"use strict"
module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    connect:
      demo:
        options:
          hostname: "*" # make accessible from everywhere
          port: 8080
          base: "./"
          keepalive: true
      dev: # pass on, so subsequent tastks (like watch) can start
          options:
              port: 8080
              base: "./"
              keepalive: false
      sauce:
        options:
          hostname: "localhost"
          port: 9999
          base: ""
          keepalive: false

    exec:
      tabfix:
        # Cleanup whitespace according to http://contribute.jquery.org/style-guide/js/
        # (requires https://github.com/mar10/tabfix)
        cmd: "tabfix -t -r -m *.js,*.css,*.html,*json,*.yaml -i node_modules ."

      upload:
        # FTP upload the demo files (requires https://github.com/mar10/pyftpsync)
        cmd: "pyftpsync --progress upload . ftp://www.wwwendt.de/tech/demo/jquery-contextmenu --delete-unmatched --omit dist,node_modules,.*,_* -x"

    jshint:
      files: ["jquery.ui-contextmenu.js", "test/tests.js"]
      options:
        jshintrc: ".jshintrc"

    qunit:
      all: ["test/index.html"]

    "saucelabs-qunit":
      all:
        options:
          urls: ["http://localhost:9999/test/index.html"]
          
          # username: process.env.SAUCE_USERNAME,
          # key: process.env.SAUCE_ACCESS_KEY,
          tunnelTimeout: 5
          build: process.env.TRAVIS_JOB_ID
          concurrency: 3
          browsers: [
            { browserName: "chrome", platform: "Windows 7" }
            { browserName: "firefox", platform: "Windows 7" }
            { browserName: "firefox", platform: "Windows XP" }
            { browserName: "firefox", platform: "Linux" }
            { browserName: "internet explorer", version: "6", platform: "Windows XP" }
            { browserName: "internet explorer", version: "7", platform: "Windows XP" }
            { browserName: "internet explorer", version: "8", platform: "Windows XP" }
            { browserName: "internet explorer", version: "9", platform: "Windows 7" }
            { browserName: "internet explorer", version: "10", platform: "Windows 8" }
            { browserName: "internet explorer", version: "11", platform: "Windows 8.1" }
            { browserName: "safari", platform: "OS X 10.8" }
          ]
          testname: "jquery.ui-contextmenu qunit tests"

    uglify:
      options:
        banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %> | " + "<%= pkg.homepage ? ' ' + pkg.homepage + ' | ' : '' %>" + " Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n"
        report: "gzip"

      build:
        src: "jquery.ui-contextmenu.js"
        dest: "jquery.ui-contextmenu.min.js"

    watch:
      jshint:
        options:
          atBegin: true
        files: ["jquery.ui-contextmenu.js"]
        tasks: ["jshint"]
  
  # Load "grunt*" dependencies
  for key of grunt.file.readJSON("package.json").devDependencies
    grunt.loadNpmTasks key  if key isnt "grunt" and key.indexOf("grunt") is 0
    
  grunt.registerTask "server", ["connect:demo"]
  grunt.registerTask "dev", ["connect:dev", "watch:jshint"]
  grunt.registerTask "test", ["jshint", "qunit"]
  grunt.registerTask "sauce", ["connect:sauce", "saucelabs-qunit"]
  if parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0
      # saucelab keys do not work on forks
      # http://support.saucelabs.com/entries/25614798
      grunt.registerTask "travis", ["test"]
  else
      grunt.registerTask "travis", ["test", "sauce"]
  grunt.registerTask "default", ["test"]
  
  # "sauce",
  grunt.registerTask "build", ["exec:tabfix", "test", "uglify"]
  grunt.registerTask "upload", ["build", "exec:upload"]
  grunt.registerTask "server", ["connect:demo"]
