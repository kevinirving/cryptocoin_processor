var mongoose = require('mongoose');

function mongooseDB() {
    global.mongoConn=global.mongoConn||{};
    return {
        setup: function(name, db, callback) {
		    callback = (name == 'system') ? db : callback;
		    db = (name == 'system') ? 'tradebot' : db;
	    	console.log('Opening mongo connection to '+name+'('+db+')...');
	    	//global.mongoConn[name] = mongoose.createConnection('mongodb://mongo_s1_i1.tradebot.thenatureofgod.us/'+db);
            global.mongoConn[name] = mongoose.createConnection('mongodb://localhost/'+db);
            
		    if(name == 'market') {
			    global.mongoConn[db] = global.mongoConn[name];
		    }
		    
            global.mongoConn[name].on('error', console.error.bind(console, 'connection error '+name+'('+db+'): '));
            global.mongoConn[name].once('open', function() {
				console.log('mongo connection to '+name+'('+db+') open');
				callback();
		    });
        },
        getConnection: function(name) {
            return global.mongoConn[name];
        },
        hasConnection: function(name) {
	        return typeof global.mongoConn[name] != 'undefined';
        }
    };
}

module.exports = mongooseDB;
