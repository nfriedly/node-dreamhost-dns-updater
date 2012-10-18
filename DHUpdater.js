var _ = require('underscore');
var request = require('request');

function DHUpdater(opts) {
	var self = this;
	var opts = _.defaults(opts, {
		apiKey: '', // from https://panel.dreamhost.com/?tree=home.api
		domain: '',
		ipService: 'http://whatmyip.herokuapp.com'
		dhApiDomain: 'https://api.dreamhost.com/'
	});

	if(!opts.apiKey || !opts.domain) {
		throw 'Plese specify the Dreamhost API key and your domain name to update';
	}

	this.getMyIp = function(cb) {
		return request(options.ipService, cb).;
	}

	this.getDomainIp = function(cb) {
		request.get(opts.dhApiDomain + '?key=' + opts.apiKey + '&cmd=dns-list_records&format=json', function(err, res) {
			if (err) {
				cb(err);
				return;
			}
			console.log(res);
		});
	}

	var myIp, domainIp, wasErr = false;

	function reset() {
		myIp = domainIp = null;
		wasErr = false;
	}

		
		function afterEach(err) {
			if (err) {
				wasErr = true;
			}
			if (wasErr) {
				cb(err);
				return;
			}
			if (!myIp || !domainIp) { 
				// still waiting on one or the other
				return;
			}
			if (myIp == domainIp) {
				cb(null, {status: DHUpdater.NO_CHANGE, ip: domainIp});
			} else {
				self.setIp(ip, cb);
			}
		};
	this.update = function(cb) {
		reset()

		self.getMyIp(function(err, ip) {
			myIp = ip;
			afterEach(err);
		}

		self.getDomainIp(function(
	}

	this.setIp = function(ip, cb) { 
		request.post(opts.dhApiDomain, {
			key: opts.apiKey,
			cmd: dns-add_record,
			 
	}

};

DHUpdater.NO_CHANGE = 'IPs match, no change was applied';
DHUpdater.SUCCESS = 'IP updated successfully';

module.exports = DHUpdater;
module.exports.DHUpdater = DHUpdater;
