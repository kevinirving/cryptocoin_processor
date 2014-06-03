var Exchange = require('../../lib/exchanges/exchange'),
	Market = require('../../lib/exchanges/market'),
	TickerModel = require('../../lib/data/ticker');

function TickerController(app) {
	app.get('/tickers', function(req, res) {
		var tplData = {
			page_title: 'CryptoCoin Tickers',
			default_exchange: 'btce',
			default_market: 'btc_usd',
			exchanges: {},
			pretty: true
		};
		

	});
	
	app.get('/tickers/data', function(req, res) {
	});
}

module.exports = TickerController;
