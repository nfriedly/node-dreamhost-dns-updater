#!/usr/bin/env node

var DHUpdater = require('./DHUpdater');

var argv = require('optimist')
    .usage('Usage: $0 --api_key YOUR_DREAMHOST_API_KEY --domain example.com')
    .wrap(80)
    .option('api_key', {
        alias : 'k',
        desc : 'DreamHost API Key, needs "All dns functions". Get it at https://panel.dreamhost.com/?tree=home.api'
    })
    .option('domain', {
        alias : 'd',
        desc: 'The domain name you want pointing to this location.'
    })
    .check(function (argv) {
        if (argv.help) throw '';

        if(!argv.api_key || !argv.domain) {
            throw 'Please specify a --api_key and a --domain';
        }
    })
    .argv;


new DHUpdater({apiKey: argv.api_key, domain: argv.domain})
  .update()
  .then(function(res) {
	console.log(res);
	process.exit(0);
  }).catch(function(err) {
    console.error(err);
    process.exit(1);
  });

