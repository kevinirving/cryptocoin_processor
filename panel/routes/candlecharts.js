var Exchange = require('../../lib/exchanges/exchange'),
	Market = require('../../lib/exchanges/market'),
	CandleChartModel = require('../../lib/data/candlechart'),
	DEMAModel = require('../../lib/data/dema');

function CandleChartsController(app) {
	app.get('/candlecharts', function(req, res) {
		var tplData = {
			page_title: 'CryptoCoin Candle Charts',
			default_exchange: 'btce',
			default_market: 'btc_usd',
			default_interval: 180,
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
				res.render('candlecharts_index', tplData, function(err, html) {
					res.send(html);
				});
			});
		});
	});
	
	app.get('/candlecharts/data', function(req, res) {
		CandleChartModel.find({
			exchange: req.query.exchange,
			market: req.query.market,
			interval: req.query.interval
		}, function(err, candles) {
			DEMAModel.findOne({
				exchange: req.query.exchange,
				market: req.query.market,
				interval: req.query.interval
			}, function(err, dema) {
				res.send({
					candles: candles,
					averages: dema
				});
			});
		});
	});
}

module.exports = CandleChartsController;
