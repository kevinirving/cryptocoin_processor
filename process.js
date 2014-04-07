var mongooseDB = require('./lib/mongoosedb');

var mongooseConnectionManager = new mongooseDB();
mongooseConnectionManager.setup('system', function() {
    var Exchange = require('./lib/exchanges/exchange');
    Exchange.findOne({name:process.argv[2]}, function(err, exchange) {
	    var Market = require('./lib/exchanges/market');
        Market.findOne({name:process.argv[3]}, function(err, market) {
			var mongooseMarketConnectionManager = new mongooseDB();
			mongooseMarketConnectionManager.setup('market', exchange.name+'_'+market.name, function() {
	            global.marketName = market.name;
	            if(process.argv[4] == 'processor') {
		            var MarketProcessor = require('./processor/market_processor');
	            	(new MarketProcessor(exchange, market)).run();
	        	} else {
		        	var MarketGatherer = require('./gatherer/market_gatherer');
	            	(new MarketGatherer(exchange, market)).run();
	        	}
        	});
        });
    });
});