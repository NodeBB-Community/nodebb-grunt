module.exports = (grunt) ->

  # NodeBB Grunt Development  --  Version 0.4-1

  config = grunt.file.readJSON('grunt-development.json')

  modules = {}

  for p of config.modules.plugins
    continue if config.modules.plugins[p][0] == '.'
    modules[p] =
      src: "#{config.paths.custom.base}#{config.paths.custom.plugins}#{p}"
      tmp: "#{config.paths.tmp}plugin-#{p}"
      dest: "#{config.paths.dist}nodebb-plugin-#{config.modules.plugins[p]}"
      plugin: true
  for t of config.modules.themes
    continue if config.modules.themes[t][0] == '.'
    modules[t] =
      src: "#{config.paths.custom.base}#{config.paths.custom.themes}#{t}"
      tmp: "#{config.paths.tmp}theme-#{t}"
      dest: "#{config.paths.dist}nodebb-theme-#{config.modules.themes[t]}"
      plugin: false

  initObj =
    clean:
      all: [config.paths.tmp]
    copy: {}
    coffee: {}
    publish: {}
    git: {}
    uglify:
      options:
        mangle: false
    watch:
      all:
        files: "#{config.paths.custom.base}**/*"
      options:
        livereload: config.liveReload
    dev:
      options:
        uglify: config.uglify.dev || []
    dist:
      options:
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
      filter: (p) ->
        !(/(^|\/)\.git/.test p)
    initObj.copy["toModules_#{m}"] =
      expand: true
      cwd: "#{mod.tmp}/"
      src: ["**"]
      dest: "#{mod.dest}/"
      dot: true
    initObj.copy["index_#{m}"] = # copy /coffee/index.js to /index.js if /coffee/ contains more than just index.js
      src: ["#{mod.tmp}/#{config.paths.custom.coffee}index.js"]
      dest: "#{mod.tmp}/index.js"
      filter: (p) ->
        dir = require('fs').readdirSync p.substr 0, p.length - 9
        dir.length > 1
    # coffee
    initObj.coffee["#{m}"] =
      options:
        join: true
        bare: !config.wrapping.index
    initObj.coffee["#{m}"].files = [
      {}
    ]
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
    # npm publish
    initObj.publish[m] =
      cwd: "#{mod.dest}/"
    # git
    initObj.git[m] =
      cwd: "#{mod.src}/"
    # watch
    watchTasks = ["clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}",
                  "uglify:.#{m}", "copy:toModules_#{m}"]
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

  moduleNames = Object.getOwnPropertyNames modules
  childProcess = require 'child_process'
  exec = (done, cmd, cb, errCb) ->
    grunt.log.ok "executing: #{cmd}"
    grunt.log.ok "(within '#{process.cwd()}')"
    childProcess.exec cmd, {}, (err) ->
      if err?
        grunt.log.error err.message if !errCb? || false != errCb err
        grunt.log.error "Error-code: #{err.code}"
        return done false
      grunt.log.ok "done."
      cb()

  grunt.registerTask 'dev', 'build and watch module(s).', (m) ->
    o = this.options()
    if m?
      grunt.task.run "clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}", "uglify:.#{m}", "copy:toModules_#{m}", "watch:#{m}"
    else
      grunt.task.run o.tasks.concat ["watch:all"]

  grunt.registerTask 'dist', 'build (and uglify) module(s).', (m) ->
    if !m?
      grunt.task.run "dist:#{m}" for m in moduleNames
      return;
    grunt.task.run "clean:#{m}", "copy:toTmp_#{m}", "coffee:#{m}", "copy:index_#{m}", "coffee:.#{m}", "clean:.#{m}", "uglify:#{m}", "copy:toModules_#{m}"

  grunt.registerTask 'publ', 'build and publish module(s).', (m) ->
    gitArgs = ''
    gitArgs += ":#{val}" for val in arguments
    if not (m in moduleNames)
      grunt.task.run "dist:#{m}", "publish:#{m}", "git:#{m}#{gitArgs}" for m in moduleNames
      return;
    grunt.task.run "dist:#{m}", "publish:#{m}", "git#{gitArgs}"

  grunt.registerTask 'init', 'initialize a new plugin or theme.', ->
    replacements =
      "@{author}": config.author
      "@{gh}": config.github
    newConfig = grunt.file.readJSON 'grunt-development.json'
    if ['theme', 't'].indexOf(this.args[0].toLowerCase()) == -1
      id = this.args[1] || "my-new-plugin"
      from = config.paths.initials.plugin
      to = config.paths.custom.base + config.paths.custom.plugins + id
      replacements["@{name}"] = this.args[2] || "My New Plugin"
      replacements["@{desc}"] = this.args[3] || "Some useful description of what the plugin does."
      newConfig.modules.plugins[id] = id
    else
      id = this.args[1] || "my-new-theme"
      from = config.paths.initials.theme
      to = config.paths.custom.base + config.paths.custom.themes + id
      replacements["@{name}"] = this.args[2] || "My New Theme"
      replacements["@{desc}"] = this.args[3] || "Some useful description for the theme."
      newConfig.modules.themes[id] = id
    replacements["@{id}"] = id
    grunt.file.recurse from, (file, ignored, subdir, filename) ->
      pathSuffix = if subdir? then subdir + '/' + filename else filename
      content = grunt.file.read(file).toString()
      for key, val of replacements
        regex = new RegExp key, 'g'
        content = content.replace regex, val
        pathSuffix = pathSuffix.replace regex, val
      grunt.file.write to + '/' + pathSuffix, new Buffer content
    grunt.file.write 'grunt-development.json', new Buffer JSON.stringify newConfig, null, '  '

  grunt.registerMultiTask 'publish', 'Publish to module.', ->
    path = process.cwd()
    _done = this.async()
    done = ->
      process.chdir path
      _done arguments...
    process.chdir this.data.cwd
    exec done, 'npm publish', ->
      done()
    , (err) ->
      grunt.log.error e for e in err.message.split(/\n/)[0..3]
      grunt.log.error "..."
      false

  grunt.registerMultiTask 'git', 'Commit and push changes to git-repo.', ->
    message = this.args[0]?.replace /'/g, "\\'"
    doPush = this.args[1] != 'false' && (message || this.args[1])
    return if !message and !push
    path = process.cwd()
    process.chdir this.data.cwd
    _done = this.async()
    done = ->
      process.chdir path
      _done arguments...
    push = ->
      exec done, "git push", ->
        done()
    if !message
      push()
      return
    exec done, "#{config.beforeCommit || 'test 1'} && git commit -m '#{message}'", ->
      return done() if !doPush
      push()

  grunt.registerTask "default", ["dev"]