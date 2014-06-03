var Fiber = require('fibers'),
    mongo = require('./lib/mongo'),
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
    var processList = [];
    var running = true;
    var numProcesses = 0;
    mongo.setup(function() {
        mongo.db.collection('exchange').find({active: true}).toArray(function(err, exchanges) {
            if (err) return console.error(err);
            exchanges.forEach(function(exchange) {
                mongo.db.collection('market').find({exchange: exchange.name, active: true}).toArray(function(err, markets) {
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
