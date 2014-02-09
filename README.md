# NodeBB Grunt Development - 0.2-2

## Features

Allows you to separate your development module-states from the actual NodeBB Forum while keeping the development-process
simple and comfortable.

Also allows you to use coffee-script instead of plain javascript :smile:

## Installation

 + run `wget https://raw.github.com/frissdiegurke/nodebb-grunt-development/master/Gruntfile.coffee`
   to download the *Gruntfile.coffee* from this project. Move it into
   your NodeBB-Forums directory or any directory containing the Forum
   as sub-directory (clone of this repository would overwrite the nice
   README.md file of NodeBB).
 + run `wget https://raw.github.com/frissdiegurke/nodebb-grunt-development/master/grunt-development.json`
   to download the default-configuration for this project. Move it into
   the same firectory as your *Gruntfile.coffee*. Remove the sample
   module-entries from within *grunt-development.json*.
 + run `npm install grunt grunt-coffee grunt-contrib-clean grunt-contrib-copy grunt-contrib-coffee`
   `grunt-contrib-uglify grunt-contrib-watch`
   from within your NodeBB-directory
 + setup your module-directory, eg. by creating custom_modules/
   directory containing themes/ and plugins/. You may change the
   pathnames within *grunt-development.json* ;)

### Configuration

The configuration (containing an entry per module) can be found within
the *grunt-development.json*-file.

The structure should be self-explaining ;)

**Some notes:**

 + Paths have to end with `/`
 + Module-names must not begin with `.`
 + Files to uglify are relative to the modules root-directory
 + `"liveReload": false` will disable live-reload

**Sample meanings:**

There are 2 plugins:

 + The plugin within the directory *custom_modules/plugins/emoji/* gets
   mapped to a NodeBB-plugin called **nodebb-plugin-emoji-extended**
 + The plugin within the directory *custom_modules/plugins/livereload/*
   gets mapped to a NodeBB-plugin called **nodebb-plugin-livereload**

There is one theme:

 + The theme within the directory *custom_modules/themes/dark_rectangles/*
   gets mapped to a NodeBB-plugin called **nodebb-theme-dark-rectangles**

The sample uglify-entries mean that no uglification gets used within the
`grunt dev`-tasks and within the `grunt dist`-tasks any *.js*-file that
is **not** within any *node_modules*-(sub-)directory gets uglified (compressed).

### Update

**Note:** Minor releases like `0.2-1` to `0.2-2` don't need any update of the
*grunt-development.json*-file.

Overwrite your *Gruntfile.coffee* with the up-to-date one.
Now look up the file-format of the up-to-date *grunt-development.json* and
manually update your *grunt-development.json*-file to match the needed
structure.

## Usage

### New Theme

 + Create a new directory within the *custom_modules/themes* directory
 + Add a new entry within your *grunt-development.json* to `modules.themes`
   like `"DIRNAME": "THEME-NAME"` where `DIRNAME` is the name of the folder
   within *custom_modules/themes/* and `THEME-NAME` is the name of the theme
   as you wish to publish it (without `nodebb-theme-` prefix)

### New Plugin

 + Create a new directory within the *custom_modules/plugins* directory
 + Add a new entry within your *grunt-development.json* to `modules.plugins`
   like `"DIRNAME": "PLUGIN-NAME"` where `DIRNAME` is the name of the folder
   within *custom_modules/plugins/* and `PLUGIN-NAME` is the name of the
   plugin as you wish to publish it (without `nodebb-plugin-` prefix)

### Using coffee-script

 + Create a new directory named *coffee* within your module-directory
 + Now you may create any *.coffee*-files within this directory and/or
   sub-directories. These files will get concentrated (in alphabetically
   order) into one *index.js*-file within the modules root-directory.
 + Every *.coffee*-file not within the *coffee*-directory will be compiled
   separately to a *.js*-file of same name.

### Grunt-Tasks

 + `grunt dev` - builds your modules and listens for activity that triggers
   rebuilds
 + `grunt dist` - builds your modules and uglifies them if configured
   (within *Gruntfile.coffee*)
 + `grunt clean` - removes the *.tmp*-directory

For each of the tasks you may add `:MODULENAME` to just use one module (`dev` does only work for all modules or a single
module).

## Typical Workflow

 + `grunt dev`
 + work on modules, refresh browser, work on modules, [...]
 + kill grunt
 + `grunt dist` (not needed if index.js shouldn't get uglified)
 + `npm publish node_modules/nodebb-MODULE`

## Changelog

### Version 0.2

 + improved configuration
 + added build-in compilation of any *.coffee*-files within modules to equivalent *.js*-files
 + moved configuration to json-file
