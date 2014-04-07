var mongoose = require('mongoose');

var MACDModelSchema = mongoose.Schema({
    market: String,
    exchange: String,
    interval: Number,
    signal: [Number],
    convergence: [Number]
}, {collection: 'macd_history'});

MACDModelSchema.index({market: 1, exchange: 1, interval: 1}, {unique: true});

module.exports = mongoose.model('MACDModel', MACDModelSchema);
