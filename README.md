[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![Dependency Status](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework.svg)](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework)
[![optionalDependencies Status](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework/optional-status.svg)](https://david-dm.org/frissdiegurke/nodebb-grunt-development/rework#info=optionalDependencies)
![Version 1.0.0-alpha.1](https://img.shields.io/badge/version-1.0.0--alpha.1-lightgrey.svg)

# NodeBB Grunt Development - Rework

**This project is in alpha phase**

This Grunt-Setup simplifies the creation and development workflow on [NodeBB](https://nodebb.org/) plugins, themes and widgets (further called *modules*).

## Not implemented yet

### To be done til release

 + Publish task(s), featuring detection if commit is needed and uses `git commit -e`
 + Custom compilation step worker (concat, copy, minify)
 + Basic plugin-, theme- and widgets-setups with and without TypeScript- or CoffeeScript-usage
 
### Nice to have

 + A smart clean-task that accepts module-id as parameter
 + Allow different setups for same type (additional setup-selection within init-task)
 + Some tasks for adding git-providers and other config-modifications

## Features

 + Interactive NodeBB setup for new plugins, themes and widgets.
 + Non-tracked configuration files (config/\*\*/\*.local.json).
 + Allows simple meta-replacements while compilation to keep consistency of data like `version`, `name`, etc.
 + Native support for CoffeeScript- and TypeScript-projects with in-place compilation.
 + Default setups for applying code-style and structural conventions chosen by NodeBB module developers.
 + Easy to extend grunt-task structure that allows you to add custom compilers if needed.

## Tasks

The most interesting tasks you need to know ( *my-module* may either be an existing module-name or an alias for any existing module):

 + `grunt config`: Initial setup of configuration (e.g. default value for `author` and GitHub username, etc.)
 + `grunt` or `grunt init`: Setup a new module.
 + `grunt dev:my-module`: Run development-compilation of *my-module* and start blocking file-watchers.
 + `grunt dev_stop:my-module`: Run development-compilation of *my-module* (without file-watchers).
 + `grunt dev_skip:my-module`: Run file-watchers for *my-module* (without preceding development-compilation).
 + `grunt deploy:my-module`: Run deployment-compilation of *my-module*.
 + `grunt publish:my-module:commit-message`: Run deployment-compilation of *my-module* and publish it to npm/git (as specified for module). If *commit-message* is specified a `git commit` will get executed within the module-directory.
 + `grunt clean`: Clean temporary data (you'll need to restart full compilation afterwards, **no** `dev_skip`).

## Workflow (not working yet)

My personal workflow should look like this once out of alpha:

 1. Create a new module if needed by `grunt`.
 2. Start `grunt` within NodeBB-root within separated terminal (since it's blocking).
 3. Start `grunt dev:my-module` or `grunt dev_skip:my-module` (the former if there have been any changes since last workflow within that module).
 4. Do my work on the module, for some changes NodeBB needs to get restarted (hook-changes, etc.).
 5. Once a new version is ready to get published:
   a) Interrupt the command of step 3.
   b) Run `grunt deploy:my-module`, restart NodeBB entirely and refresh within browser.
   c) If that worked without problems run `grunt publish:my-module:'v0.0.2: some message for the latest changes'`

## Structure

### Modules

Despite configuration the meta-data for internal usage of your module gets located at *modules/my-module.json*.

### Configuration

#### config/paths.json

    {
      "source": {
        "base": "modules/${type.path}/${id}" // The path to setup and expect your modules within. E.g. modules/plugins/my-plugin/
      },
      "deploy": "node_modules/nodebb-${type.name}-${id}", // This path should point into your NodeBBs node_modules/ directory
      "tmp": "modules/.tmp/${id}", // For internal use (temporary data)
      "clean": {
        "tmp": "modules/.tmp" // Remove this directory when clean gets run
      }
    }

#### config/licenses.json

    {
      "key": "value" // any license-names with their appropriate text to be added into LICENSE-file of modules
    }

#### config/types/\*\*/\*.json

TODO

#### config/compilation/\*\*/\*.json

Let's define an `{compilation object}` as following:

    [ Object | Array | String ]
      If Object: {"compiler": "someCompilerName", [data]} - the compiler-name needs to match any compiler within tasks/compiler/
      If String: resolve compilation-set by value as compilation-set-ID.
      If Array: recursive expand each item as {compilation object}.

So now a simple sample *config/compilation/\*\*/\*.json*:

    {
      "default": { // The keys generate the compilation-set-ID, if it gets referred from any config/types.json (compilation-attribute) it needs to contain dev- and dist-attributes
        "dev": {compilation object}, // compilation-set-ID: "default.dev"
        "dist": {compilation object}
      },
      "tools": { // If it doesn't get referred from any type-definition it doesn't need any specific attributes.
        "meta": {
          "default": {compilation object} // compilation-set-ID: "tools.meta.default"
        },
        "minify": {compilation object} // compilation-set-ID: "tools.minify"
      }
    }

#### config/meta.json

These are just some default values for the `grunt init` task.

    {
      "author": "Ole Reglitzki",
      "keywords": [
        "nodebb",
        "@{type.name}",
        "@{id}"
      ]
    }

#### config/publish.json

    {
      "git": {
        "providers": { // Those will be available for choice within project-init
          "GitHub": "https://github.com/frissdiegurke/@{name}.git"
        },
        "beforeCommit": "git add -u", // Gets executed before any git-commit
        "defaultProvider": "GitHub" // Refers any key of config/publish.json:git.providers
      }
    }

## Contribution

If you create a new type (and/or setup) that may be useful to others and you agree to the license-conditions, don't mind sending a Pull Request containing your changes.

## References

### Plugins

 + [NodeBB Docs: Writing Plugins for NodeBB](https://docs.nodebb.org/en/latest/plugins/create.html)
 + [NodeBB Wiki: Hooks](https://github.com/NodeBB/NodeBB/wiki/Hooks)

### Themes

 + [NodeBB Docs: Creating a new NodeBB Theme](https://docs.nodebb.org/en/latest/themes/create.html)

### Widgets

 + [NodeBB Docs: Writing Widgets for NodeBB](https://docs.nodebb.org/en/latest/widgets/create.html)
