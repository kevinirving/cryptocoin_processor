var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var Mongo = {
    db: null,
    setup: function(callback) {
        if(this.db !== null) {
            callback();
        } else {
            this.db = new Db('tradebot', new Server('localhost', 27017), {safe: false});
            this.db.open(function(err, db) {
                if(err) console.err(err);
                callback();
            })
        }
    }
};

module.exports = Mongo;
