var BTCELib = require('../connector/btce');

function BTCE(exchange) {
    return {
        btce: null,
        exchange: null,
        init: function() {
            var self = this;
            self.exchange = exchange;
            self.btce = new BTCELib(exchange.api_key, exchange.api_secret);
        },
        trades: function(market, callback) {
            var self = this;
            self.btce.trades({pair: market}, function(err, data) {
                var trades = [];
                if(err) {
                    console.log(err);
                } else {
                    data.forEach(function(tradeData) {
                        var tradeDoc = {
                            type: tradeData.trade_type == 'bid' ? 'buy' : 'sell',
                            exchange: self.exchange.name,
                            market: market,
                            date: new Date(tradeData.date*1000),
                            price: tradeData.price,
                            amount: tradeData.amount,
                            uniqueid: tradeData.tid

                        };
                        trades.push(tradeDoc);
                    });
                }
                callback(trades);
            });
        },
        orders: function(market, callback) {
            var self = this;
            var date = (new Date()).getTime();
            date = date - (date % 10000);
            self.btce.depth({pair: market}, function(err, data) {
                var orders = [];
                if(err) {
                    console.log(err);
                } else {
                    var orderDoc = {
                            type: 'buy',
                            exchange: self.exchange.name,
                            market: market,
                            date: new Date(date),
                            orders: data.bids
                    };
                    orders.push(orderDoc);
                    orderDoc.type = 'sell';
                    orderDoc.orders = data.asks;
                    orders.push(orderDoc);
                }
                callback(orders);
            });
        }
    };
}

module.exports = BTCE;
