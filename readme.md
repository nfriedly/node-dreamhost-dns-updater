Dreamhost DNS updater
=====================

This is a simple script to keep a given domain name always pointing to your curent IP. 
It uses [Dreamhost's API](http://wiki.dreamhost.com/API) and a copy of 
[node-heroku-ip-service](https://github.com/nfriedly/node-whats-my-ip) hosted at 
http://whatsmyip.nfriedly.com/

Usage
-----

Warning: this is still a work in progress, I haven't even tried these instructions yet.

First install it

    npm install node-dreamhost-dns-updater
    
Now get a Dreamhost API key with "All dns functions" from https://panel.dreamhost.com/?tree=home.api  

Run it once to make sure it works:

    update-dreamhost-dns --api_key YOUR_DH_API_KEY --domain my-computer.example.com

Assuming that went well, set it in a cronjob and forget about it. Here's an example that 
runs the script every 5 minutes:

	# Minute   Hour   Day of Month       Month          Day of Week        Command    
	# (0-59)  (0-23)     (1-31)    (1-12 or Jan-Dec)  (0-6 or Sun-Sat)                
    	*/5      *         *              *               *                update-dreamhost-dns --api_key YOUR_DH_API_KEY --domain my-computer.example.com

On Windows, you can set up a Scheduled Task with the same command.

On Mac you can alternatively download the excelent [SleepWatcher](http://www.bernhard-baehr.de/) 
and make it run any time you computer wakes from sleep.

MIT License
-----------

Copyright (c) 2012 by Nathan Friedly - http://nfriedly.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
