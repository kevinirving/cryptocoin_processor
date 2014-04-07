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
		
		
		Exchange.find({active: true}, function(err, exchanges) {
			exchanges.forEach(function(exchange) {
				tplData.exchanges[exchange.name] = {
					exchange: exchange,
					markets: {}
				};
			});
			Market.find({active: true}, function(err, markets) {
				markets.forEach(function(market) {
					tplData.exchanges[market.exchange].markets[market.name] = market;
				});
				res.render('tickers_index', tplData, function(err, html) {
					res.send(html);
				});
			});
		});
	});
	
	app.get('/tickers/data', function(req, res) {
		TickerModel.find({
			exchange: req.query.exchange,
			market: req.query.market
		}, function(err, tickers) {
			res.send({
				tickers: tickers
			});
		});
	});
}

module.exports = TickerController;
