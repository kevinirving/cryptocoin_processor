var mongoosedb = require('../lib/mongoosedb');
var mongoose = require('mongoose');
var mongooseConn = new mongoosedb().getConnection('system');

var StatusSchema = mongoose.Schema({
    name: String,
    lastProcessDate: Date
}, {collection: 'status'});

StatusSchema.index({name: 1}, {unique: true});

module.exports = mongooseConn.model('Status', StatusSchema);
