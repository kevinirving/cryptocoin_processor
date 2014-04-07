var mongoosedb = require('../mongoosedb'),
	mongoose = require('mongoose');

function CandleChartModelFactory() {
	CandleChartModelSchema = mongoose.Schema({
	    market: String,
	    exchange: String,
	    interval: Number,
        start: Date,
        end: Date,
        high: Number,
        low: Number,
        open: Number,
        close: Number,
        avg_open: Number,
        avg_close: Number
	}, {collection: 'candles'});
	
	CandleChartModelSchema.index({market: 1, exchange: 1, interval: 1});
	CandleChartModelSchema.index({start: 1, interval: 1}, {unique: true});
	CandleChartModelSchema.index({start: 1});
	CandleChartModelSchema.index({end: -1});
	this.schema = CandleChartModelSchema;
}

CandleChartModelFactory.prototype.getModel = function(exchange, market, haveModel) {
	if(mongoosedb.hasConnection(exchange.name+'_'+market.name)) {
		var connection = mongoosedb.getConnection(exchange.name+'_'+market.name);
		haveModel(connection.model('CandleChartModel', this.schema));
	} else {
		mongoosedb.setup(exchange.name+'_'+market.name, exchange.name+'_'+market.name, this.getModel.bind(this));
	}
};

module.exports = CandleChartModelFactory;
