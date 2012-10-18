Dreamhost DNS updater
=====================

This is a simple script to keep a given domain name always pointing to your curent IP. 
It uses [Dreamhost's API](http://wiki.dreamhost.com/API) and a copy of [node-heroku-ip-service](https://github.com/nfriedly/node-heroku-ip-service) hosted at 
http://whats-my-ip.herokuapp.com/

Usage
-----

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