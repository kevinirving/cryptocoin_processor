var mongoosedb = require('../mongoosedb');
var mongoose = require('mongoose');
var mongooseConn = new mongoosedb().getConnection('system');

var MarketSchema = mongoose.Schema({
    name: String,
    active: Boolean,
    exchange: String,
    gatherInterval: Number
}, {collection: 'market'});

module.exports = mongooseConn.model('Market', MarketSchema);