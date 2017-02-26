'use strict';

const fetch = require('isomorphic-fetch');
const URL = require('querystring');

class DHUpdater {
	constructor(opts) {
      this.opts = Object.assign({}, DHUpdater.defaults, opts);

      if (!opts.apiKey) {
        throw 'Plese specify the Dreamhost API key as the `apiKey: "YOUR_KEY"` option. Get it by creating' +
        ' a key with "All dns functions" at https://panel.dreamhost.com/?tree=home.api';
      }

      if (!opts.domain || opts.domain.indexOf("/") !== -1) {
        throw 'Please specify the domain in the format `domain: "example.com"`.';
      }
	}

	/**
	 * Finds your current public IP by making a HTTP GET to opts.ipService
	 *
	 * @return Promise<String>
	 */
	getMyIp(){
		return fetch(opts.ipService)
		  .then(res => {
		  	if (res.ok) {
		  		return res.text();
            } else {
		  		const err = new Error(`IP lookup failed: ${opts.ipService} ${res.status} ${res.statusText}`);
				err.response = res;
				throw err;
			}
		});
	}

  /**
   * helper to make requests to the Dreamhost API
   * @private
   * @param params
   * @return Promise<Object>
   */
  dhRequest(params) {
    params = Object.assign({
      key: opts.apiKey,
      format: 'json'
    }, params);

    let url = URL.parse(opts.dhApiDomain);
    url.query = Object.assign(url.query, params);

    return fetch(URL.format(url)
	  .then(res => {
        if (res.ok) {
          return res.text();
        } else {
          const err = new Error(`Dreamhost request failed: ${this.opts.dhApiDomain} ${res.status} ${res.statusText}`);
          err.response = res;
          throw err;
        }
      })
	  .then(body => {
	  	// todo: add the url to these requests
        if (!body.data) {
          throw new Error("Dreamhost response has no data");
        }

        if (body.result == "error") {
          throw new Error(`Dreamhost API reported an error: ${body.data}`);
        }

        return body.data;
      });
  }

	/**s
	 * Finds the IP of options.domain by querying the Dreamhost API and searching for an A record.
	 *
	 * Resolves to the current IP address or null if the record does not currently exist as an A record
	 *
	 * @param Promise<String|null>
	 */
	getDomainIp() {
		return this.dhRequest({
          cmd: 'dns-list_records'
        }).then(body => {
			const record = body.data.filter(function(row) {
				// cname values get returned so that we know to delete them before updating.
				return row.record === this.opts.domain && (row.type === "A"); //  || row.type === 'CNAME'
			});

			if (!record.length) {
				return null; // no current ip
			} else {
				return record[0].value;
			}
		});
	};

	deleteDomainRecord(ip) {
		return this.dhRequest({
          cmd: 'dns-remove_record',
		  record: this.opts.domain,
		  type: 'A',
		  value: ip
        });
	}

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
		  	this.getDomainIp()
		]).then(results => {
			const [myIp, domainIp] = results;
			if (myIp === domainIp) {
				return {status: DHUpdater.NO_CHANGE, ip: results.domainIp}
			} else {
				return this.deleteDomainRecord(domainIp)
				  .then(this.dnsAddRecord(myIp))
				  .then(() => {return {status: DHUpdater.SUCCESS, ip: results.myIp}})
			}
		});
	};

	/**
	 * Sets opts.domain to ip.
	 *
	 * @param ip: the new IP
	 * @return Promise
	 *
	 * The callback is called with either an Error or null.
	 */
	dnsAddRecord(ip) {
		return this.dhRequest({
          cmd: "dns-add_record",
          record: opts.domain,
          type: "A",
          value: ip,
          comment: "Updated by dreamhost-dns-updater at " + (new Date()).toString()
        });
	}

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
