module.exports = (grunt) ->

  # NodeBB Grunt Development  --  Version 0.2-1

  config = grunt.file.readJSON('grunt-development.json')

  modules = {}

  for p of config.modules.plugins
    continue if config.modules.plugins[p][0] == '.'
    modules[p] =
      src: "#{config.paths.custom.base}#{config.paths.custom.plugins}#{p}"
      tmp: "#{config.paths.tmp}plugin-#{p}"
      dest: "#{config.paths.nodebb}node_modules/nodebb-plugin-#{config.modules.plugins[p]}"
      plugin: true
  for t of config.modules.themes
    continue if config.modules.themes[t][0] == '.'
    modules[t] =
      src: "#{config.paths.custom.base}#{config.paths.custom.themes}#{t}"
      tmp: "#{config.paths.tmp}theme-#{t}"
      dest: "#{config.paths.nodebb}node_modules/nodebb-theme-#{config.modules.themes[t]}"
      plugin: false

  moduleNames = Object.getOwnPropertyNames modules
  initObj =
    clean:
      all: [config.paths.tmp]
    copy: {}
    coffee: {}
    uglify:
      options:
        mangle: false
    watch:
      all:
        files: "#{config.paths.custom.base}**/*"
      options:
        livereload: config.livereload
    dev:
      options:
        all: moduleNames
        uglify: config.uglify.dev || []
    dist:
      options:
        all: moduleNames
        uglify: config.uglify.dist || []

  devAllTasks = []

  for m of modules
    mod = modules[m]
    # clean
    initObj.clean["#{m}"] = [mod.tmp]
    initObj.clean[".#{m}"] = [mod.dest, "#{mod.tmp}/#{config.paths.custom.coffee}", "#{mod.tmp}/**/*.coffee"]
    # copy
    initObj.copy["toTmp_#{m}"] =
      expand: true
      cwd: "#{mod.src}/"
      src: "**"
      dest: "#{mod.tmp}/"
      dot: true
      filter: (p) -> !(/(^|\/)\.git/.test p)
    initObj.copy["toModules_#{m}"] =
      expand: true
      cwd: "#{mod.tmp}/"
      src: ["**"]
      dest: "#{mod.dest}/"
      dot: true
    initObj.copy["index_#{m}"] = # copy /coffee/index.js to /index.js if /coffee/ contains more than just index.js
      src: ["#{mod.tmp}/#{config.paths.custom.coffee}index.js"]
      dest: "#{mod.tmp}/index.js"
      filter: (p) -> dir = require('fs').readdirSync(p.substr(0,p.length-9)); console.log dir; dir.length > 1
    # coffee
    initObj.coffee["#{m}"] =
      options:
        join: true
        bare: !config.wrapping.index
    initObj.coffee["#{m}"].files = [{}]
    initObj.coffee["#{m}"].files[0]["#{mod.tmp}/#{config.paths.custom.coffee}index.js"] = ["#{mod.tmp}/#{config.paths.custom.coffee}**/*.coffee"]
    initObj.coffee[".#{m}"] =
      options:
        bare: !config.wrapping.other
      expand: true
      cwd: "#{mod.tmp}/"
      src: ["**/*.coffee"]
      dest: "#{mod.tmp}/"
      ext: ".js"
    # uglify
    initObj.uglify[m] =
      files: [
        expand: true
        cwd: "#{mod.tmp}/"
        src: config.uglify.dist
        dest: "#{mod.tmp}"
      ]
    initObj.uglify[".#{m}"] =
      files: [
        expand: true
        cwd: "#{mod.tmp}/"
        src: config.uglify.dev
        dest: "#{mod.tmp}"
      ]
    # watch
    watchTasks = ["clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}", "uglify:.#{m}", "copy:toModules_#{m}"]
    initObj.watch[m] =
      tasks: watchTasks
    initObj.watch[m].files = ["#{mod.src}/**/*"]

    devAllTasks = devAllTasks.concat watchTasks

  initObj.watch.all.tasks = initObj.dev.options.tasks = devAllTasks

  grunt.initConfig initObj
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'dev', 'build and watch module(s).', (m) ->
    o = this.options()
    if m?
      grunt.task.run "clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}", "uglify:.#{m}", "copy:toModules_#{m}", "watch:#{m}"
    else
      grunt.task.run o.tasks.concat ["watch:all"]

  grunt.registerTask 'dist', 'build (and uglify) module(s).', (m) ->
    o = this.options()
    if !m?
      grunt.task.run "dist:#{m}" for m in o.all
      return;
    grunt.task.run "clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}", "uglify:#{m}", "copy:toModules_#{m}"

  grunt.registerTask "default", ["dev"]