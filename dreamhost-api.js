'use strict';


class DreamHost {
  constructor(options) {
    if (!options.apiKey) {
      throw new Error('Plese specify the Dreamhost API key as the `apiKey: "YOUR_KEY"` option. Get one at https://panel.dreamhost.com/?tree=home.api');
    }

    this.apiKey = options.apiKey;
  }
}
