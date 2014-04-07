var Fiber = require('fibers'),
    mongooseDB = require('./lib/mongoosedb'),
    child_process = require('child_process');
    
    
if(['processor', 'gatherer'].indexOf(process.argv[2]) == -1) {
	console.log('[ERROR]: Must specify gatherer or processor node.');
} 

var node = process.argv[2];
    
function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}
    
Fiber(function() {
    var mongooseConnectionManager = new mongooseDB();
    var processList = [];
    var running = true;
    var numProcesses = 0;
    mongooseConnectionManager.setup('system', function() {
    	var Exchange = require('./lib/exchanges/exchange');
        Exchange.find({active: true}, function(err, exchanges) {
            if (err) return console.error(err);
            exchanges.forEach(function(exchange) {
                exchange.getMarkets(function(err, markets) {
                    if (err) return console.error(err);
                    markets.forEach(function(market) {
                        console.log('Spawning '+node+' child process for '+exchange.name+' '+market.name);
                        var cprocess = child_process.fork(__dirname+'/process', [exchange.name, market.name, node]);
                        cprocess.on('close', function(code) {
                            numProcesses--;
                            console.log(node+' child process for '+exchange.name+' '+market.name+' quit.');
                        });
                        numProcesses++;
                        processList.push(cprocess);
                    });
                });
            });
        });
    });
    while(running) {
        if(numProcesses == 0 && !processList.length == 0) {
            process.exit();
        }
        sleep(1000);
    }
}).run();
