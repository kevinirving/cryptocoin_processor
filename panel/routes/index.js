function IndexController(app) {
	app.get('/', function(req, res) {
		res.render('index', {
			page_title: 'Index'
		}, function(err, html) {
			res.send(html);
		});
	});
	
	require('./candlecharts')(app);
	require('./ticker')(app);
}

module.exports = IndexController;
