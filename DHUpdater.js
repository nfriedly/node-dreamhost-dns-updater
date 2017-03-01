'use strict';

const fetch = require('node-fetch');
const DreamHostDNS = require('dreamhost/dns');
const isIp = require('is-ip');

class DHUpdater {
	constructor(opts) {
      this.opts = Object.assign({}, DHUpdater.defaults, opts);

      if (!opts.apiKey) {
        throw 'Please specify the Dreamhost API key as the `apiKey: "YOUR_KEY"` option. Get it by creating' +
        ' a key with "All dns functions" at https://panel.dreamhost.com/?tree=home.api';
      }

      if (!opts.domain || opts.domain.indexOf("/") !== -1) {
        throw 'Please specify the domain in the format `domain: "example.com"`.';
      }

      this.dhDns = new DreamHostDNS({key: opts.apiKey});
	}

	/**
	 * Finds your current public IP by making a HTTP GET to opts.ipService
	 *
	 * @return Promise<String>
	 */
	getMyIp(){
		return fetch(this.opts.ipService)
		  .then(res => {
		  	if (res.ok) {
		  		return res.text()
				  .then(ip => {
				  	if (!isIp.v4(ip)) {
				  		throw new Error(`Not a valid ipv4 address: ${ip}`);
					}
					return ip;
				  });
            } else {
		  		return res.text()
				  .then(body => {
                    const err = new Error(`IP lookup failed: ${res.status} ${res.statusText}`);
                    err.url = this.opts.ipService;
                    err.raw = body;
                    throw err;
			  	});

			}
		});
	}

	/**s
	 * Finds the IP of options.domain by querying the Dreamhost API and searching for an A record.
	 *
	 * Resolves to the current IP address or null if the record does not currently exist as an A record
	 *
	 * @param Promise<Object|undefined>
	 */
	getDomainRecord() {
		return this.dhDns.listRecords({}).then(records => {
			return records.filter(row => {
				return row.record === this.opts.domain && (row.type === "A" || row.type === 'CNAME');
			})[0];
		});
	};
	/**
	 * Gets updates your domain IP if it is different from your public IP
	 * If your domain is currently a CNAME, this won't work.
	 *
	 * Either an error or a status object will be passed to the callback.
	 *
	 * The status passed to the callback is either DHUpdater.SUCCESS or DHUpdater.NO_CHANGE
	 */
	update() {
		return Promise.all([
			this.getMyIp(),
		  	this.getDomainRecord()
		]).then(results => {
			const [myIp, domainRecord] = results;
			if (domainRecord && myIp === domainRecord.value) {
				return {changed: false, status: DHUpdater.NO_CHANGE, ip: myIp}
			} else {
				return (
				  (domainRecord ? this.dhDns.removeRecord(domainRecord) : Promise.resolve())
					  .then(() => this.dhDns.addRecord({
						record: this.opts.domain,
						type: "A",
						value: myIp,
					  }))
					  .then(() => {return {changed: true, status: DHUpdater.SUCCESS, ip: myIp}})
					);
			}
		});
	};



}

DHUpdater.defaults = {
  apiKey: '', // from https://panel.dreamhost.com/?tree=home.api
  domain: '',
  ttl: 10,
  ipService: 'http://ip.nfriedly.com/text', // should return a single line of text with your public IP
  dhApiDomain: 'https://api.dreamhost.com/'
};


DHUpdater.NO_CHANGE = 'IP already up-to-date, no change was applied.';
DHUpdater.SUCCESS = 'IP updated successfully!';

module.exports = DHUpdater;
module.exports.DHUpdater = DHUpdater;
