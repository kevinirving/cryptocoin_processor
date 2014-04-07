var mongoose = require('mongoose');

var TickerModelSchema = mongoose.Schema({
    exchange: String,
    market: String,
    indicator: String,
    value: Number
}, {collection: 'ticker'});

TickerModelSchema.index({exchange: 1, market: 1, indicator: 1}, {unique: true});

module.exports = mongoose.model('TickerModel', TickerModelSchema);