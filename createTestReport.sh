
node_modules/mocha/bin/mocha --recursive --reporter mocha-html-reporter $@  | cat test/head.html - test/tail.html  > public/test.html
wait ${!}
echo html_written
 
