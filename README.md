# HomeBase
Boiler plate for nodejs, express, dnode, sql

-- Installation
add homebase to your prereqs in the package.json and install (using npm install)
then you can copy the files in node_modules/homebase/template/* to your base directory

-- Setup
All client files go in the client directory. After a file is changed, run ./build.sh to use browserfy to compile the client scripts into a single file (in public/javascripts/all.js) 
All server files go in the server directory.

you need to edit main.js in your baseDir to setup your remotes, routes, and statics.

All your view templates go in the view directory.

NOTE don't edit the template dir directly (unless you are fixing/improving a global problem), you will need to edit your baseDir site.

-- Running
./start.sh to start
./stop.sh to stop
or 
nodemon main.js (if you install nodemon and wish to restart after file changes)

