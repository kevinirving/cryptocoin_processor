var mongoosedb = require('../mongoosedb');
var mongoose = require('mongoose');
var mongooseConn = new mongoosedb().getConnection('system');

var ExchangeSchema = mongoose.Schema({
    name: String,
    api_key: String,
    api_secret: String,
    username: String,
    appid: String,
    active: Boolean
}, {collection: 'exchange'});

ExchangeSchema.methods = {
    getMarkets: function(data) {
    	var Market = require('./market');
        Market.find({exchange: this.name, active: true}, function(err, markets) {
            data(err, markets);
        });
    },
    getLib: function() {
        if(!this._exchangeLib) {
            var ExchangeLib = require('./impl/'+this.name);
            this._exchangeLib = new ExchangeLib(this);
        }
        return this._exchangeLib;
    }
};

module.exports = mongooseConn.model('Exchange', ExchangeSchema);