var mongo = require('../../lib/mongo');

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
		
		
		mongo.db.collection('exchange').find({active: true}).toArray(function(err, exchanges) {
			exchanges.forEach(function(exchange) {
				tplData.exchanges[exchange.name] = {
					exchange: exchange,
					markets: {}
				};
			});
			mongo.db.collection('market').find({active: true}).toArray(function(err, markets) {
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
		mongo.db.collection('candles_'+req.query.interval+'_'+req.query.exchange+'_'+req.query.market).find().toArray(function(err, candles) {
            res.send({
                candles: candles
            });
		});
	});
}

module.exports = CandleChartsController;
