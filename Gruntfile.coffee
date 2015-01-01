#jshint node: true, camelcase: false 
"use strict"
module.exports = (grunt) ->
  grunt.initConfig
    pkg: 
      grunt.file.readJSON("package.json")

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
        cmd: "tabfix -t -r -m *.js,*.css,*.html,*.yaml -i node_modules ."

      upload:
        # FTP upload the demo files (requires https://github.com/mar10/pyftpsync)
        cmd: "pyftpsync --progress upload . ftp://www.wwwendt.de/tech/demo/jquery-contextmenu --delete-unmatched --omit dist,node_modules,.*,_* -x"

    jscs:
      src: ["jquery.ui-contextmenu.js", "test/tests.js"]
      options:
        config: ".jscsrc"
        force: true

    jshint:
      files: ["jquery.ui-contextmenu.js", "test/tests.js"]
      options:
        jshintrc: ".jshintrc"

    qunit:
      all: ["test/index.html", "test/index-jquery-ui-1-10.html"]

    # replace: # grunt-text-replace
    #     production:
    #         src: ["build/**/*.js"]
    #         overwrite : true
    #         replacements: [ {
    #             from : /@DATE/g
    #             to : "<%= grunt.template.today('yyyy-mm-dd\"T\"HH:MM') %>"
    #         },{
    #             from : /buildType:\s*\"[a-zA-Z]+\"/g
    #             to : "buildType: \"production\""
    #         },{
    #             from : /debugLevel:\s*[0-9]/g
    #             to : "debugLevel: 1"
    #         } ]
    #     release:
    #         src: ["dist/**/*.js"]
    #         overwrite : true
    #         replacements: [ {
    #             from : /@VERSION/g
    #             to : "<%= pkg.version %>"
    #         } ]

    "saucelabs-qunit":
      ui_10:
        options:
          urls: [
            # "http://localhost:9999/test/index.html",
            "http://localhost:9999/test/index-jquery-ui-1-10.html"
          ]
          
          # username: process.env.SAUCE_USERNAME,
          # key: process.env.SAUCE_ACCESS_KEY,
          build: process.env.TRAVIS_JOB_ID
          throttled: 8
          browsers: [
            { browserName: "chrome", platform: "Windows 7" }
            { browserName: "firefox", platform: "Windows 7" }
            # { browserName: "firefox", platform: "Windows XP" }
            { browserName: "firefox", platform: "Linux" }
            { browserName: "internet explorer", version: "6", platform: "Windows XP" }
            { browserName: "internet explorer", version: "7", platform: "Windows XP" }
            { browserName: "internet explorer", version: "8", platform: "Windows 7" }
            { browserName: "internet explorer", version: "9", platform: "Windows 7" }
            { browserName: "internet explorer", version: "10", platform: "Windows 8" }
            { browserName: "internet explorer", version: "11", platform: "Windows 8.1" }
            { browserName: "safari", version: "6", platform: "OS X 10.8" }
            { browserName: "safari", version: "7", platform: "OS X 10.9" }
            { browserName: "safari", version: "8", platform: "OS X 10.10" }
          ]
          testname: "jquery.ui-contextmenu qunit tests (jQuery UI 10)"
      ui: # UI Menu 11+ dropped support for IE7
        options:
          urls: [
            "http://localhost:9999/test/index.html",
            # "http://localhost:9999/test/index-jquery-ui-1-10.html"
          ]
          
          # username: process.env.SAUCE_USERNAME,
          # key: process.env.SAUCE_ACCESS_KEY,
          build: process.env.TRAVIS_JOB_ID
          throttled: 8
          browsers: [
            { browserName: "chrome", platform: "Windows 7" }
            { browserName: "firefox", platform: "Windows 7" }
            { browserName: "firefox", platform: "Windows XP" }
            { browserName: "firefox", platform: "Linux" }
            # { browserName: "internet explorer", version: "6", platform: "Windows XP" }
            # { browserName: "internet explorer", version: "7", platform: "Windows XP" }
            { browserName: "internet explorer", version: "8", platform: "Windows 7" }
            { browserName: "internet explorer", version: "9", platform: "Windows 7" }
            { browserName: "internet explorer", version: "10", platform: "Windows 8" }
            { browserName: "internet explorer", version: "11", platform: "Windows 8.1" }
            { browserName: "safari", version: "6", platform: "OS X 10.8" }
            { browserName: "safari", version: "7", platform: "OS X 10.9" }
            { browserName: "safari", version: "8", platform: "OS X 10.10" }
          ]
          testname: "jquery.ui-contextmenu qunit tests (jQuery UI 11+)"

    uglify:
      options:
        banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %> | " + "<%= pkg.homepage ? ' ' + pkg.homepage + ' | ' : '' %>" + " Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n"
        report: "gzip"

      build:
        options:
          sourceMap: true
        src: "jquery.ui-contextmenu.js"
        dest: "jquery.ui-contextmenu.min.js"

    watch:
      dev:
        options:
          atBegin: true
        files: ["jquery.ui-contextmenu.js", "test/tests.js"]
        tasks: ["jshint", "jscs"]
      # jshint:
      #   options:
      #     atBegin: true
      #   files: ["jquery.ui-contextmenu.js"]
      #   tasks: ["jshint"]

    yabs:
      release:
        common: # defaults for all tools
          manifests: ['package.json', 'bower.json', 'ui-contextmenu.jquery.json']
        # The following tools are run in order:
        check: { branch: ['master'], canPush: true, clean: true, cmpVersion: 'gte' }
        run_test: { tasks: ['test'] }
        bump: {} # 'bump' also uses the increment mode `yabs:release:MODE`
        run_build: { tasks: ['build'] }
        commit: {}
        check_after_build: { clean: true } # Fails if new files found
        tag: {}
        push: { tags: true, useFollowTags: true }
        githubRelease:
          repo: 'mar10/jquery-ui-contextmenu'
          draft: false
        npmPublish: {}
        bump_develop: { inc: 'prepatch' }
        commit_develop: { message: 'Bump prerelease ({%= version %}) [ci skip]' }
        push_develop: {}


  # Load "grunt*" dependencies
  for key of grunt.file.readJSON("package.json").devDependencies
    grunt.loadNpmTasks key  if key isnt "grunt" and key.indexOf("grunt") is 0
    
  grunt.registerTask "server", ["connect:demo"]
  grunt.registerTask "dev", ["connect:dev", "watch:dev"]
  grunt.registerTask "test", ["jshint", "jscs", "qunit"]
  grunt.registerTask "sauce", ["connect:sauce", "saucelabs-qunit:ui", "saucelabs-qunit:ui_10"]
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
