var mongoosedb = require('../mongoosedb');
var mongoose = require('mongoose');
var mongooseConn = new mongoosedb().getConnection('market');

var TradeSchema = mongoose.Schema({
    type: String,
    exchange: String,
    market: String,
    date: Date,
    amount: Number,
    price: Number,
    uniqueid: String
}, {collection: 'trade'});

TradeSchema.index({type:1,exchange:1,market:1,date:1});
TradeSchema.index({date:1});
TradeSchema.index({uniqueid:1},{unique:true});

module.exports = mongooseConn.model('Trade', TradeSchema);