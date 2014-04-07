var express = require('express'),
	mongooseDB = require('../lib/mongoosedb'),
	frontController = require('./front_controller');
	
var mongooseConnectionManager = new mongooseDB();

mongooseConnectionManager.setup(function() {
	var app = express();
	
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.cookieSession({
		secret: 'lolthisisthepanelfortheentireuniverseroflcopter'
	}));
	
	app.use(require('stylus').middleware({
		src: __dirname + '/views',
		dest: __dirname+ '/public',
		compress: true
	}));
	
	app.use(express.static(__dirname+'/public'))
	
	app.set('view engine', 'jade');
	app.set('views', __dirname+'/views');
	
	app.locals.title = 'TNOG AI Panel';
	
	app.engine('jade', require('jade').__express);
	
	app.use(app.router);
	
	frontController(app);
	
	var server = app.listen(3000, function() {
		console.log('Server is now listening on port %d', server.address().port);
	});
});
