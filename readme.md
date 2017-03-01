DreamHost Dynamic DNS updater
=============================

This is a simple script to keep a domain or subdomain always pointing to your current IP, basically
turning [DreamHost](https://www.dreamhost.com/r.cgi?225072) into a dynamic DNS provider - similar
to no-ip.com or dyn.com.

It uses the [dreamhost](https://www.npmjs.com/package/dreamhost) package to connect to DreamHost's API
and http://ip.nfriedly.com/ to determine your IP address.

Usage
-----

First install it globally

    npm install --global node-dreamhost-dns-updater
    
Now get a DreamHost API key with "All dns functions" from https://panel.dreamhost.com/?tree=home.api  

Run it once to make sure it works:

    update-dreamhost-dns --api_key YOUR_DH_API_KEY --domain my-computer.example.com
    
Assuming that went well, set it in a cronjob and forget about it. Here's an example that 
runs the script every 5 minutes:

	# Minute   Hour   Day of Month       Month          Day of Week        Command    
	# (0-59)  (0-23)     (1-31)    (1-12 or Jan-Dec)  (0-6 or Sun-Sat)                
    	*/5      *         *              *               *                update-dreamhost-dns --api_key YOUR_DH_API_KEY --domain my-computer.example.com

On Windows, you can set up a Scheduled Task with the same command.

On Mac you can alternatively download the excellent [SleepWatcher](http://www.bernhard-baehr.de/) 
and make it run any time you computer wakes from sleep.

Note: it currently only works on IPv4 addresses. PRs are welcome to add IPv6 Support.

MIT License
-----------

Copyright (c) 2017 by Nathan Friedly - http://nfriedly.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
