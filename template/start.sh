#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $CURRENT_DIR
cd $DIR

./stop.sh > /dev/null
rm log/*

./node_modules/forever/bin/forever start -l $DIR/log/node.log -e $DIR/log/error.log main.js

# See https://github.com/nodejitsu/forever
