#!/usr/bin/python
import json
import os

#v5

json_data=open('site.json')

props = json.load(json_data)
json_data.close()


with open('config.sh', 'w') as myFile:
	appName = os.path.basename(os.path.dirname(os.path.realpath(__file__)))
	print appName
	myFile.write('APPLICATION_NAME=%s' % appName)
