var Exchange = {
    getLib: function(exchange) {
        var apiLib = require('./exchanges/impl/'+exchange.name);
        return new apiLib(exchange);
    }
};

module.exports = Exchange;
