[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![Dependency Status](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework.svg)](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework)
[![optionalDependencies Status](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework/optional-status.svg)](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework#info=optionalDependencies)
![Version 1.0.0-alpha.1](https://img.shields.io/badge/version-1.0.0--alpha.1-lightgrey.svg)

# NodeBB Grunt - Rework

**This project is in alpha phase, see below for TODO tasks**

This Grunt-Setup simplifies the creation and development workflow on [NodeBB](https://nodebb.org/) plugins, themes and widgets (further called *modules*).

## Features

 + Interactive NodeBB setup for new plugins, themes and widgets.
 + Non-tracked configuration files (config/\*\*/\*.local.json).
 + Allows simple meta-replacements while compilation to keep consistency of data like `version`, `name`, etc.
 + Native support for CoffeeScript- and TypeScript-projects with in-place compilation.
 + Default setups for applying code-style and structural conventions chosen by NodeBB module developers.
 + Easy to extend grunt-task structure that allows you to add custom compilers if needed.

## Tasks

Grunt tasks may be run from command-line like `grunt task-name:argument`.

The most interesting tasks you need to know ( *my-module* may either be the name or an alias of any existing module):

|Task definition|Meaning|
|---|---|
|`config`|Initial setup of configuration (e.g. default value for `author` and GitHub username, etc.)|
|`init` (default task)|Setup a new module.|
|`dev:my-module`|Run development-compilation of *my-module* and start blocking file-watchers.|
|`dev_stop:my-module`|Run development-compilation of *my-module* (without file-watchers).|
|`dev_skip:my-module`|Run file-watchers for *my-module* (without preceding development-compilation).|
|`build:my-module`|**TODO** Run distribution compilation of *my-module*|
|`publish:my-module`|**TODO** Publish *my-module* to npm/git (as specified for *my-module*).|
|`deploy:my-module`|**TODO** Run distribution compilation of *my-module* and publish (alias for `build` and `publish`).|
|`clean`|Clean temporary data.|

## TODO

### until release

 + Publish task(s), featuring detection if commit is needed and uses `git commit -e`
 + Basic plugin-, theme- and widgets-setups with and without TypeScript- or CoffeeScript-usage
 
### Nice to have

 + Use https://www.npmjs.com/package/ignore (fork, add https://github.com/grob/fnmatch rules - skip {x..y} for simplicity) for detection of files to copy into tmp- and dest-directories
 + A smart clean-task that accepts module-id as parameter
 + Allow different setups for same type (additional setup-selection within init-task)
 + Save last npm published version to throw an early error within publish task
 + Some tasks for adding git-providers and other config-modifications
