var mongo = require('../lib/mongo'),
    exchangeLib = require('../lib/exchange');

function Gatherer(exchange, market) {
	var exchange = exchange;
	var market = market;
    return {
        exchange: exchange,
        market: market,
        run: function() {
            var self = this;
            var api = exchangeLib.getLib(exchange);
            api.init();
            var gather = function() {
                console.log('Getting trades...');
                api.trades(self.market.name, function(trades) {
                    console.log('Saving trades...');
                    trades.forEach(function(trade) {
                        mongo.db.collection('trade').insert(trade);
                    });
                });
                console.log('Getting orders...');
                api.orders(self.market.name, function(orders) {
                    console.log('Saving orders...');
                    orders.forEach(function(order) {
                        mongo.db.collection('order').insert(order);
                    });
                });
            };
            gather();
            setInterval(gather, market.gatherInterval);
        }
    };
}

module.exports = Gatherer;
