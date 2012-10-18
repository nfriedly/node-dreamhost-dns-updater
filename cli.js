#!/usr/bin/env node

var DHUpdater = require('./DHUpdater');

var argv = require('optimist')
    .usage('Usage: $0 --api_key YOUR_DREAMHOST_API_KEY --domain example.com')
    .wrap(80)
    .option('api_key', {
        alias : 'k',
        desc : 'Dreamhost apiKey, needs "All dns functions". Get it at https://panel.dreamhost.com/?tree=home.api'
    })
    .option('domain', {
        alias : 'd',
        desc: 'The domain name you want pointing to this location. For best results, manually configure this as an A record first and then rely on this script to keep it up-to-date.'
    })
    .check(function (argv) {
        if (argv.help) throw '';

        if(!argv.api_key || !argv.domain) {
            throw 'Please specify an apiKey and a domain';
        }
    })
    .argv;


new DHUpdater({apiKey: argv.api_key, domain: argv.domain}).update(function(err, res) {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(res);
	process.exit(0);
});

