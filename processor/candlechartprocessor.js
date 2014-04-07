var Trade = require('../lib/data/trade'),
    Status = require('./status');

function CandleChartProcessor(exchange, market, interval) {
    this.exchange = exchange;
    this.market = market;
    this.interval = interval;
}

CandleChartProcessor.prototype.process = function(finished_callback) {
    var self = this;
    var exchange = self.exchange;
    var market = self.market;
    
    Status.findOne({name: 'candles_'+interval+'_'+exchange.name+'_'+market.name}, function(err, status) {
        var endDate = new Date();
        var query = {date: {"$lte": endDate}};
        var outParams = {replace: 'candles'};
        if(status) {
            query.date["$gt"] = status.lastProcessDate;
            outParams = {reduce: 'candles'};
        }
        
        Trade.mapReduce({
            query: query,
            map: function() {
                var candleStart = this.date.getTime();
                candleStart -= (candleStart % (interval * 1000));
                emit(candleStart, {
                    start: new Date(candleStart),
                    end: new Date(candleStart+(interval * 1000)),
                    high: this.price,
                    low: this.price,
                    close: this.price,
                    open: this.price,
                    avg_open: null,
                    avg_close: this.price,
                    closeDate: this.date,
                    openDate: this.date,
                    tradeCount: 1
                });
            },
            reduce: function(k, candles) {
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
                    outCandle.avg_close = (outCandle.high + outCandle.low + outCandle.open + outCandle.close) / 4;
                    outCandle.tradeCount += candle.tradeCount;
                }
                
                return outCandle;
            },
            scope: {
                interval: interval
            },
            out: outParams
        }, function(err, model, stats) {
            if(err) console.log(err);
            else {
                console.log('Saved candle chart for interval '+interval+' (%d ms) '+endDate, stats.processtime);
                Status.update({name: 'candles_'+interval+'_'+exchange.name+'_'+market.name},
                    {lastProcessDate: endDate}, {upsert: true}, function(err, affected) {
                    finished_callback();
                });
            }
        });
    });
};

module.exports = CandleChartProcessor;
