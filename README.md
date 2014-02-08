# NodeBB Custom Modules

## Features

Allows you to separate your development module-states from the actual NodeBB Forum while keeping the development-process
simple and comfortable.

Also allows you to use coffee-script instead of plain javascript :smile:

## Installation

 + Download the *Gruntfile.coffee* from this project into your NodeBB-path
   or any directory containing the NodeBB Forum as sub-directory
   (clone of this repository would overwrite the README.md file of NodeBB)
 + run `npm install grunt grunt-coffee grunt-contrib-clean grunt-contrib-copy grunt-contrib-coffee grunt-contrib-uglify grunt-contrib-watch`
   from within your NodeBB-directory
 + setup your module-directory, e.g. by creating custom_modules/
   directory containing themes/ and plugins/. You may change the
   pathnames within *Gruntfile.coffee* ;)

## Usage

### New Theme

 + Create a new directory within the *custom_modules/themes* directory
 + Add a new line like `DIRNAME: 'THEME-NAME'` below the line
   `themes = {` within the *Gruntfile.coffee* where `DIRNAME` is the
   name of the folder within *custom_modules/themes/* and `THEME-NAME`
   is the name of the theme as you wish to publish it (without
   `nodebb-theme-` prefix)

### New Plugin

 + Create a new directory within the *custom_modules/plugins* directory
 + Add a new line like `DIRNAME: 'PLUGIN-NAME'` below the line
   `plugins = {` within the *Gruntfile.coffee* where `DIRNAME` is the
   name of the folder within *custom_modules/plugins/* and `PLUGIN-NAME`
   is the name of the plugin as you wish to publish it (without
   `nodebb-plugin-` prefix)

### Using coffee-script

 + Create a new directory named *coffee* within your module-directory
 + Now you may create any *.coffee*-files within this directory and/or
   sub-directories

Note that all coffee-files get concentrated (alphabetically order) into one *index.js* file within your modules
root-directory.

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
 + `grunt dist`
 + `npm publish node_modules/nodebb-MODULE`
