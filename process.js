var mongo = require('./lib/mongo');

mongo.setup(function() {
    mongo.db.collection('exchange').findOne({name:process.argv[2]}, function(err, exchange) {
        mongo.db.collection('market').findOne({name:process.argv[3]}, function(err, market) {
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