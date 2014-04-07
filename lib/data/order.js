var mongoosedb = require('../mongoosedb');
var mongoose = require('mongoose');
var mongooseConn = new mongoosedb().getConnection('market');

var OrderSchema = mongoose.Schema({
    type: String,
    exchange: String,
    market: String,
    date: Date,
    orders: Array
}, {collection: 'order'});

OrderSchema.index({type:1,exchange:1,market:1,date :1},{unique:true});
OrderSchema.index({date:1});

module.exports = mongooseConn.model('Order', OrderSchema);