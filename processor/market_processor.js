function MarketProcessor(exchange, market) {
    return {
	    intervals: [180,300,600,900,1800,3600],
	    processorList: ['candlechart'],
	    processClasses: {
		    candlechart: require('./candlechartprocessor')
	    },
	  	processors: {},
        runQueue: [],

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

        processItem: function() {
            var self = this;

            var item = self.runQueue.shift();
            item.process(function() {
                if(self.runQueue.length > 0) {
                    self.processItem();
                } else {
                    setInterval(self.process.bind(self), 10000);
                }
            });
        },

        process: function() {
	        var self = this;
            self.intervals.forEach(function(interval) {
                self.processorList.forEach(function(process) {
                    self.runQueue.push(self.processors[interval][process]);
                });
            });
            self.processItem();
        }
    };
}

module.exports = MarketProcessor;
