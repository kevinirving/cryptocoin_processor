var routes = require('./routes');

function FrontController(app) {
	this.app = app;
	
	routes(app);
	
	//this.app.use(this.handleError);
}

FrontController.prototype.handleError = function(err, req, res, next) {
	console.error(err);
};



module.exports = FrontController;
