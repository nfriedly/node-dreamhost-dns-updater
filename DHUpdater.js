var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require("util");

function DHUpdater(opts) {
	"use strict";

	var self = this;
	opts = _.defaults(opts || {}, {
		apiKey: '', // from https://panel.dreamhost.com/?tree=home.api
		domain: '',
		noComment: false,
		ipService: 'http://whatsmyip.nfriedly.com/text', // should return a single line of text with your public IP
		dhApiDomain: 'https://api.dreamhost.com/'
	});

	if (!opts.apiKey) {
		throw 'Plese specify the Dreamhost API key as the `apiKey: "YOUR_KEY"` option. Get it by creating' +
			' a key with "All dns functions" at https://panel.dreamhost.com/?tree=home.api';
	}
	
	if (!opts.domain || opts.domain.indexOf("/") !== -1) {
		throw 'Please specify the domain in the format `domain: "example.com"`.';
	}
	
	
	// done with setup, everything below here is to be called later on

	/**
	 * Finds your current public IP by making a HTTP GET to opts.ipService
	 *
	 * @param cb: function(err, ip);
	 */
	this.getMyIp = function(cb) {
		var req = request(opts.ipService, function(err, res, body) {
			if (err) {
				cb(err);
				return;
			}
			if (res.statusCode !== 200) {
				cb(new Error(util.format('Upexpected status %s from %s', res.statusCode, opts.ipService)));
				return;
			}
			cb(err, body);
		});
		return req;
	};
	
	/**
	 * Finds the IP of options.domain by querying the Dreamhost API and searching for an A record.
	 * If your domain is currently a CNAME, this won't work.
	 *
	 * @param cb: function(err, ip);
	 */	
	this.getDomainIp = function(cb) {
		var params = {
			cmd: 'dns-list_records'
		};
		dhRequest(params, function(err, body) {
			if (err) {
				cb(err);
				return;
			}

			var record = body.data.filter(function(row) {
				// cname values get returned so that we know to delete them before updating.
				return row.record === opts.domain && (row.type === "A");
			});
			
			if (!record.length) {
				cb(null, null); // no current ip
			} else {
				cb(null, record[0].value);
			}
		});
	};

	/**
	 * Gets updates your domain IP if it is different from your public IP
	 * If your domain is currently a CNAME, this won't work.
	 *
	 * @param cb: function(err, {status, ip});
	 *
	 * Either an error or a status object will be passed to the callback.
	 *
	 * The status passed to the callback is either DHUpdater.SUCCESS or DHUpdater.NO_CHANGE
	 */	
	this.update = function(cb) {
		async.parallel({myIp: self.getMyIp, domainIp: self.getDomainIp}, function(err, results) {
			if (err) {
				cb(err);
				return;
			}
			if (results.myIp === results.domainIp) {
				cb(null, {status: DHUpdater.NO_CHANGE, ip: results.domainIp});
			} else {
				self.setIp(results.myIp, results.domainIp, function(err) {
					if	(err) {
						cb(err);
						return;
					}
					cb(null, {status: DHUpdater.SUCCESS, ip: results.myIp});
				});
			}
		});
	};

	/**
	 * Sets opts.domain to ip. 
	 *
	 * @param ip: the new IP
	 * @param oldIp: The ip to delete before creating the record for the new IP. Set to null to disable.
	 * @param cb: function(err);
	 *
	 * The callback is called with either an Error or null.
	 */	
	this.setIp = function(ip, oldIp, cb) {
		var params = {
			cmd: "dns-add_record",
			record: opts.domain,
			type: "A",
			value: ip
		};
		if (oldIp) {
			params.cmd = "dns-remove_record";
			params.value = oldIp;
			dhRequest(params, function(err, res) {
				if (err) {
					cb(err);
					return;
				}
				self.setIp(ip, null, cb);
			});
		} else {
			params.comment = "Updated by node-dreamhost-dns-updater at " + (new Date()).toString();
			dhRequest(params, function(err, res) {
				if (err) {
					cb(err);
					return;
				}
				cb(null);
			});
		}
	};
	

	// helper function to make requests to the Dreamhost API
	function dhRequest(params, cb) {
		_.defaults(params, {
			key: opts.apiKey,
			format: 'json'
		});
	
		var req = request({uri: opts.dhApiDomain, qs: params}, function(err, res, body) {
			if (!err) {
				if (res.statusCode !== 200) {
					err = new Error(util.format("Upexpected status %s from %s", res.statusCode, req.uri));
				} else {
					try {
						body = JSON.parse(body);
					} catch (jsonEx) {
						err = new Error("Error parsing dreamhost response");
					}
				}
				
				if (!body.data) {
					err = new Error("Dreamhost response has no data");
				}
				
				if (body.result == "error") {
					err = new Error(util.format("Dreamhost API reported an error: %s", body.data));
				}
			}
			
			if (err) {
				err.uri = req.uri;
				err.params = params;
				err.body = body;
				//err.request = req;
				//err.response = res;
				cb(err);
				return;
			}
			
			cb(null, body);
		});
		
		return req;
	}

}

DHUpdater.NO_CHANGE = 'IP already up-to-date, no change was applied.';
DHUpdater.SUCCESS = 'IP updated successfully!';

module.exports = DHUpdater;
module.exports.DHUpdater = DHUpdater;
