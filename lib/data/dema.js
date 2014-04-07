var mongoose = require('mongoose');

var DEMAModelSchema = mongoose.Schema({
    market: String,
    exchange: String,
    interval: Number,
    diff: [Number],
    fast: [Number],
    slow: [Number]
}, {collection: 'dema_history'});

DEMAModelSchema.index({market: 1, exchange: 1, interval: 1}, {unique: true});

module.exports = mongoose.model('DEMAModel', DEMAModelSchema);
