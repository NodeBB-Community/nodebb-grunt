#!/usr/bin/env bash

### Script information
# This script aliases some grunt tasks and common operations to be as short as possible.
# Dependencies: jq, git
# TODO allow customization of detached async (e.g. open separate terminal-emulator)

### Arguments
## Single parameter commands.
#  c | config
#    Starts the grunt config-task.
#  m | module | n | new | i | init
#    Starts the grunt init-task for new module setup.
#  s | stop
#    Stops any production instance of NodeBB (just calls `./nodebb stop` within NodeBB root).
#  r | restart
#    Restarts any production instance of NodeBB (just calls `./nodebb restart` within NodeBB root).
#  l | log
#    Shows logging of production instance of NodeBB (just calls `./nodebb log` within NodeBB root).
#  v | version
#    Outputs the version of nodebb-grunt as well as of NodeBB
#  g | git
#    Outputs the git status of nodebb-grunt as well as of NodeBB
## The first parameter is always the module-id to pass over to grunt.
#  The second parameter may be one of the following:
#    d | dev
#      Starts the grunt dev-task of the module and `grunt` within NodeBB root.
#    b | build
#      Starts the grunt build-task of the module and afterwards the NodeBB instance in production mode.
#    e | deploy
#      Starts the grunt deploy-task of the module.
#    p | publish
#      Starts the grunt publish-task of the module.
#    s | stop
#      Stops any production instance of NodeBB (just calls `./nodebb stop` within NodeBB root).
#    r | restart
#      Restarts any production instance of NodeBB (just calls `./nodebb restart` within NodeBB root).
#    l | log
#      Shows logging of production instance of NodeBB (just calls `./nodebb log` within NodeBB root).

CWD="$(cd "$(dirname "$0")" && pwd)"

URL_NBB_GRUNT="https://raw.githubusercontent.com/frissdiegurke/nodebb-grunt-development"
URL_NBB="https://raw.githubusercontent.com/NodeBB/NodeBB"

CONFIG="$CWD/config"
CONFIG_PATHS="$CONFIG/paths.json"
CONFIG_PATHS_LOCAL="$CONFIG/paths.local.json"

# read nodeBB.root from paths configuration files
NBB_ROOT="$CWD/NodeBB"
if [ -f "$CONFIG_PATHS" ]; then
  jq -r -e ".nodeBB.root" < "$CONFIG_PATHS" &>/dev/null
  if [ $? -eq 0 ]; then
    NBB_ROOT="$CWD/`jq -r -e ".nodeBB.root" < "$CONFIG_PATHS"`"
  fi
fi
if [ -f "$CONFIG_PATHS_LOCAL" ]; then
  jq -r -e ".nodeBB.root" < "$CONFIG_PATHS_LOCAL" &>/dev/null
  if [ $? -eq 0 ]; then
    NBB_ROOT="$CWD/`jq -r -e ".nodeBB.root" < "$CONFIG_PATHS_LOCAL"`"
  fi
fi

GRUNT_FILE="--gruntfile=$CWD/Gruntfile.js"
GRUNT_FILE_NBB="--gruntfile=$NBB_ROOT/Gruntfile.js"
NBB="$NBB_ROOT/nodebb"

print_version() {
  # get version out of package.json
  version="`jq -r ".version" < "$2/package.json"`"
  # get upstream version
  branch="`cd $2 && git branch -vv | sed -n -e "s/\*[^\[]*\[[^\/]*\///p" | sed -e "s/\].*$//" | sed -e "s/:.*$//"`"
  url="`echo "$3" | sed -e "s/BRANCH/$branch/"`"
  upstream_version="`curl "$url" 2>/dev/null | jq -r ".version" 2>/dev/null`"
  # create formatted string
  str="$1 $version"
  if [ "$upstream_version" = "$version" ]; then
    str="$str (up to date on branch $branch)"
  elif [ "$upstream_version" ]; then
    str="$str (outdated, upstream: $upstream_version)"
  else
    str="$str (failed to fetch upstream version)"
  fi
  # output
  echo "$str"
}

print_git() {
  # get git status and remove parenthesized lines
  status="`cd $2 && git status | sed "/^\s*(.*$/d"`"
  lines=`echo "$status" | wc -l`
  # crop status at first empty line
  status="`echo "$status" | sed -n "/^On branch/,/^$/p"`"
  # if cropped (status contained empty line), add [...] to the end.
  if [ ${lines} -ne `echo "$status" | wc -l` ]; then
    status="$status\n[...]"
  fi
  # formatted output
  echo -e "$1\n===============================================\n$status"
}

if [ $# -eq 1 ]; then
  # Commands without module parameter
  case "$1" in

    "c"|"config")
      grunt "$GRUNT_FILE" config
      exit $?
      ;;

    "m"|"module"|"n"|"new"|"i"|"init")
      grunt "$GRUNT_FILE" init
      exit $?
      ;;

    "s"|"stop")
      (cd "$NBB_ROOT" && "$NBB" stop)
      exit $?
      ;;

    "r"|"restart")
      (cd "$NBB_ROOT" && "$NBB" restart)
      exit $?
      ;;

    "l"|"log")
      (cd "$NBB_ROOT" && "$NBB" log)
      exit $?
      ;;

    "v"|"version")
      print_version "NodeBB-Grunt" "$CWD" "$URL_NBB_GRUNT/BRANCH/package.json"
      print_version "NodeBB" "$NBB_ROOT" "$URL_NBB/BRANCH/package.json"
      echo -e "---\nNote that 'up to date' in this regard only states that\nthe version string is the same.\nFor detailed git status use the 'git' option instead."
      ;;

    "g"|"git")
      print_git "NodeBB-Grunt" "$CWD"
      echo ""
      print_git "NodeBB" "$NBB_ROOT"
      ;;

    *)
      echo "Command not found."
      exit 1;
      ;;

  esac
elif [ $# -eq 2 ]; then
  # Commands with module parameter
  case "$2" in

    "d"|"dev")
      grunt "$GRUNT_FILE" dev:"$1" &
      grunt "$GRUNT_FILE_NBB"
      exit $?
      ;;

    "b"|"build")
      grunt "$GRUNT_FILE" build:"$1"
      code=$?
      if [ ${code} -eq 0 ]; then
        (cd "$NBB_ROOT" && "$NBB" start)
        code=$?
      fi
      exit ${code}
      ;;

    "e"|"deploy")
      grunt "$GRUNT_FILE" deploy:"$1"
      exit $?
      ;;

    "p"|"publish")
      grunt "$GRUNT_FILE" publish:"$1"
      exit $?
      ;;

    "s"|"stop")
      (cd "$NBB_ROOT" && "$NBB" stop)
      exit $?
      ;;

    "r"|"restart")
      (cd "$NBB_ROOT" && "$NBB" restart)
      exit $?
      ;;

    "l"|"log")
      (cd "$NBB_ROOT" && "$NBB" log)
      exit $?
      ;;

    *)
      echo "Command not found."
      exit 1;
      ;;

  esac
else
  echo -e "Invalid amount of arguments.\nExpected one or two."
  exit 1;
fi

exit 0
