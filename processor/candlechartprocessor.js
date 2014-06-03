var mongo = require('../lib/mongo');

function CandleChartProcessor(exchange, market, interval) {
    this.exchange = exchange;
    this.market = market;
    this.interval = interval;
}

CandleChartProcessor.prototype.process = function(finished_callback) {
    var self = this;
    var exchange = self.exchange;
    var market = self.market;
    var interval = self.interval;
    
    console.log('Running candlechart mapreduce for '+exchange.name+':'+market.name+' interval:'+interval);
    
    mongo.db.collection('status').findOne({name: 'candles_'+interval+'_'+exchange.name+'_'+market.name}, function(err, status) {
        var endDate = new Date();
        var query = {date: {"$lte": endDate}};
        var outParams = {replace: 'candles_'+interval+'_'+exchange.name+'_'+market.name};
        if(status) {
            query.date["$gt"] = status.lastProcessDate;
            outParams = {reduce: 'candles_'+interval+'_'+exchange.name+'_'+market.name};
        }
        
        mongo.db.collection('trade').mapReduce(
            function() {
                var candleStart = this.date.getTime();
                candleStart -= (candleStart % (interval * 1000));
                emit(candleStart, {
                    start: new Date(candleStart),
                    end: new Date(candleStart+(interval * 1000)),
                    high: this.price,
                    low: this.price,
                    close: this.price,
                    open: this.price,
                    closeDate: this.date,
                    openDate: this.date,
                    tradeCount: 1
                });
            }, function(k, candles) {
                var outCandle = candles[0];
                for(var i=1; i<candles.length; i++) {
                    var candle = candles[i];
                    if(candle.high > outCandle.high) {
                        outCandle.high = candle.high;
                    }
                    if(candle.low < outCandle.low) {
                        outCandle.low = candle.low;
                    }
                    if(candle.closeDate.getTime() > outCandle.closeDate.getTime()) {
                        outCandle.close = candle.close;
                        outCandle.closeDate = candle.closeDate;
                    }
                    if(candle.openDate.getTime() < outCandle.openDate.getTime()) {
                        outCandle.open = candle.open;
                        outCandle.openDate = candle.openDate;
                    }
                    outCandle.tradeCount += candle.tradeCount;
                }
                
                return outCandle;
            }, {
                query: query,
                scope: {
                    interval: interval
                },
                out: outParams
            }, function(err, stats) {
            if(err) console.log(err);
            else {
                console.log('Saved candle chart for interval '+interval+' '+endDate);
                mongo.db.collection('status').update({name: 'candles_'+interval+'_'+exchange.name+'_'+market.name},
                    {"$set": {lastProcessDate: endDate}}, {upsert: true}, function() {
                    finished_callback();
                });
            }
        });
    });
};

module.exports = CandleChartProcessor;
