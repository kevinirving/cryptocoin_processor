function MarketProcessor(exchange, market) {
    return {
	    intervals: [180,300,600,900,1800,3600],
	    processorList: ['candlechart'],
	    processClasses: {
		    candlechart: require('./candlechartprocessor')
	    },
	    runQueue: [],
	    mongoThreads: 3,
	    currentlyRunning: 0,
	  	processors: {},
	  	isRunning: false,
        run: function() {
            var self = this;
            console.log('Starting data preprocessor for '+exchange.name+' '+market.name);
            self.intervals.forEach(function(interval) {
	            self.processors[interval] = {};
	            self.processorList.forEach(function(process) {
		            self.processors[interval][process] = new self.processClasses[process](exchange, market, interval);
	            });
            });
            self.process();
        },
        finish: function(processor, interval) {
	        var self = this;
	        self.currentlyRunning--;
	        
	        if(self.runQueue.length == 0) {
	        	self.isRunning = false;
        	}
        	
            if(self.isRunning == false) {
	            self.process();
        	} else if(self.currentlyRunning < self.mongoThreads) {
	        	self.processQueue();
        	}
	        	
        },
        processQueue: function() {
	        var self = this;
	        if(self.runQueue.length > 0 && self.currentlyRunning < self.mongoThreads) {		        
		        self.currentlyRunning++;
		        var runner = self.runQueue.shift();
	            runner.processor.process(function() {
		            self.finish(runner.name, runner.interval);
	            });
	        	if(self.currentlyRunning < self.mongoThreads) {	
		        	self.processQueue();
	        	}
        	}
        },
        process: function() {
	        var self = this;
	        self.isRunning = true;
            self.intervals.forEach(function(interval) {
	            self.runQueue.push({
		            name: 'candlechart',
		            runner: interval,
		            processor: self.processors[interval].candlechart
	            });
            });
            self.processQueue();
        }
    };
}

module.exports = MarketProcessor;
