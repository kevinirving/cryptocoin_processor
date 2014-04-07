var CandleChartProcessor = require('./candlechartprocessor');

function MarketProcessor(exchange, market) {
    return {
        run: function() {
            var self = this;
            console.log('Starting data preprocessor for '+exchange.name+' '+market.name);
            
        }
    };
}

module.exports = MarketProcessor;
