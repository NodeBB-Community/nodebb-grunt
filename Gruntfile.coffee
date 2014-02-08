module.exports = (grunt) ->

  paths = # have to end with /
    nodebb: './'
    custom:
      base: 'custom_modules/'
      plugins: 'plugins/'
      themes: 'themes/'
      coffee: 'coffee/'
    tmp: '.tmp/'

  # Module-names must not begin with '.'

  plugins = {

  }

  themes = {

  }

  uglifyDist = true

  ###
    DO NOT CHANGE ANYTHING BELOW THIS LINE!
  ###

  modules = {}

  for p of plugins
    continue if plugins[p][0] == '.'
    modules[p] =
      src: "#{paths.custom.base}#{paths.custom.plugins}#{p}"
      tmp: "#{paths.tmp}plugin-#{p}"
      dest: "#{paths.nodebb}node_modules/nodebb-plugin-#{plugins[p]}"
      plugin: true
  for t of themes
    continue if themes[t][0] == '.'
    modules[t] =
      src: "#{paths.custom.base}#{paths.custom.themes}#{t}"
      tmp: "#{paths.tmp}theme-#{t}"
      dest: "#{paths.nodebb}node_modules/nodebb-theme-#{themes[t]}"
      plugin: false

  moduleNames = Object.getOwnPropertyNames modules
  devAllWatch = []
  for m in moduleNames
    devAllWatch = devAllWatch.concat ["clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "clean:.#{m}", "copy:toModules_#{m}"]
  initObj =
    clean:
      all: [paths.tmp]
    copy: {}
    coffee: {}
    uglify: {}
    watch:
      all:
        files: "#{paths.custom.base}**/*"
        tasks: devAllWatch
    dev:
      options:
        all: moduleNames
        tasks: devAllWatch
    dist:
      options:
        all: moduleNames
        uglify: uglifyDist

  for m of modules
    mod = modules[m]
    # clean
    initObj.clean["#{m}"] = [mod.tmp]
    initObj.clean[".#{m}"] = [mod.dest, "#{mod.tmp}/#{paths.custom.coffee}"]
    # copy
    initObj.copy["toTmp_#{m}"] =
      cwd: "#{mod.src}/"
      src: "**"
      dest: "#{mod.tmp}/"
      expand: true
      dot: true
      filter: (p) -> !(/(^|\/)\.git/.test p)
    initObj.copy["toModules_#{m}"] =
      cwd: "#{mod.tmp}/"
      src: ["**"]
      dest: "#{mod.dest}/"
      expand: true
      dot: true
    initObj.copy["index_#{m}"] = # copy /coffee/index.js to /index.js if /coffee/ contains more than just index.js
      src: ["#{mod.tmp}/#{paths.custom.coffee}index.js"]
      dest: "#{mod.tmp}/index.js"
      filter: (p) -> dir = require('fs').readdirSync(p.substr(0,p.length-9)); console.log dir; dir.length > 1
    # coffee
    initObj.coffee[m] =
      options:
        join: true
        bare: false
    initObj.coffee[m].files = [{}]
    initObj.coffee[m].files[0]["#{mod.tmp}/#{paths.custom.coffee}index.js"] = ["#{mod.tmp}/#{paths.custom.coffee}**/*.coffee"]
    # uglify
    initObj.uglify[m] =
      options:
        mangle: false
    initObj.uglify[m].files = [{}]
    initObj.uglify[m].files[0]["#{mod.tmp}/index.js"] = "#{mod.tmp}/index.js"
    # watch
    initObj.watch[m] =
      tasks: ["clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "clean:.#{m}", "copy:toModules_#{m}"]
    initObj.watch[m].files = ["#{mod.src}/**/*"]

  grunt.initConfig initObj
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'dev', 'build and watch module(s).', (m) ->
    o = this.options()
    if m?
      grunt.exec
      grunt.task.run "clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "clean:.#{m}", "copy:toModules_#{m}", "watch:#{m}"
    else
      grunt.task.run o.tasks.concat ["watch:all"]

  grunt.registerTask 'dist', 'build (and uglify) module(s).', (m) ->
    o = this.options()
    if !m?
      grunt.task.run "dist:#{m}" for m in o.all
      return;
    dist = ["clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}"]
    dist.push "uglify:#{m}" if o.uglify
    dist = dist.concat ["clean:.#{m}", "copy:toModules_#{m}"]
    grunt.task.run dist

  grunt.registerTask "default", ["dev"]