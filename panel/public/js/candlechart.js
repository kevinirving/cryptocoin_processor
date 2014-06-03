$.widget('custom.candlechart', {
	options: {
		el: {
			chartSelector: '.chartSelect',
			intervalSelector: '.intervalSelect',
			chart: '#chart',
		},
		width: 700,
		height: 400,
		margin: 50,
		class: 'chart',
		ticks: 10,
		refreshInterval: 5000,
	},
	currentChart: {
		exchange: null,
		market: null,
		interval: null
	},
	el: {},
	data: null,
	chartInit: false,
	
	_create: function() {
		var self = this;
		$.each(self.options.el, function(idx, el) {
			self.el[idx] = $(el);
		});
		
		self.el.chartSelector.on('change', $.proxy(self.changeChart, self));
		self.el.intervalSelector.on('change', $.proxy(self.changeInterval, self));
		var currChart = self.el.chartSelector.val().split(':');
		self.currentChart.exchange = currChart[0];
		self.currentChart.market = currChart[1];
		self.currentChart.interval = self.el.intervalSelector.val();
		self.initChart();
	},
	
	initChart: function() {
		var self = this,
			height = self.options.height,
			width = self.options.width,
			margin = self.options.margin;
		$.getJSON('/candlecharts/data', self.currentChart, function(json) {
			self.data = json.candles;
			self.movingAverages = {
				fast: [],
				slow: []
			};
			var fastWeight = 6;
			var slowWeight = 21;
			$.each(self.data, function(idx, el) {
				var candleData = el.value;
				if(candleData.open === null || candleData.close === null) {
					self.data[idx] = self.data[idx-1];
					el = self.data[idx];
				}
				if(idx == 0) {
					var avg_open = (candleData.open + candleData.close) / 2;
					self.movingAverages.fast[0] = avg_open;
					self.movingAverages.slow[0] = avg_open;
				} else {
					var avg = (candleData.open + candleData.close) / 2;
					var fastKFactor = 2 / (fastWeight + 1);
					var slowKFactor = 2 / (slowWeight + 1);
					
					self.movingAverages.fast[idx] = (avg * fastKFactor) + (self.movingAverages.fast[idx-1] * (1-fastKFactor));
					self.movingAverages.slow[idx] = (avg * slowKFactor) + (self.movingAverages.slow[idx-1] * (1-slowKFactor));
				}
			});
			
			if(!self.chartInit) {
				self.chartInit = true;
				$('#chart').html('');
				self.chart = d3.select('#chart')
				  .append('svg:svg')
				  .attr('class', self.options.class)
				  .attr('width', self.options.width)
				  .attr('height', self.options.height);

				var startDates = self.data.map(function(d) {return new Date(d.value.start).getTime();})
				var candles = self.data;
				var lastCandleDate = d3.max(startDates);
				var startDate = d3.min(startDates);
				self.y_scale = d3.scale.linear()
					.domain([d3.min(candles.map(function(x) {return x.value.low;})),
								d3.max(candles.map(function(x) {return x.value.high;}))])
					.range([height-margin, margin]);
				self.x_scale = d3.scale.linear()
					.domain([startDate, lastCandleDate])
					.range([margin, width-margin]);
					
			}
			
			self.drawChart();	
			//setTimeout($.proxy(self.initChart, self), self.options.refreshInterval);
		});
	},
	
	drawChart: function() {
		var self = this,
			height = self.options.height,
			width = self.options.width,
			margin = self.options.margin;
			
		if(self.data === null) {
			return;
		}
		
		var numCandles = self.data.length;
		var startDates = self.data.map(function(d) {return new Date(d.value.start).getTime();})
		var candles = self.data;
		var lastCandleDate = d3.max(startDates);
		var startDate = d3.min(startDates);
			
		self.chart.selectAll('rect.background')
			.data([1])
			.enter().append('svg:rect')
			.attr('class', 'background')
			.attr('x', 0)
			.attr('y', 0)
			.attr('height', height)
			.attr('width', width)
			.attr('fill', '#000');
		
		self.chart.selectAll('line.x')
			.data(self.x_scale.ticks(self.options.ticks))
			.enter().append('svg:line')
			.attr('class', 'x')
			.attr('x1', self.x_scale)
			.attr('x2', self.x_scale)
			.attr('y1', margin)
			.attr('y2', height-margin)
			.attr('stroke', '#EEE');
		
		self.chart.selectAll('line.y')
			.data(self.y_scale.ticks(self.options.ticks))
			.enter().append('svg:line')
			.attr('class', 'y')
			.attr('x1', margin)
			.attr('x2', width-margin)
			.attr('y1', self.y_scale)
			.attr('y2', self.y_scale)
			.attr('stroke', '#EEE');
		  
		var lastDay = null;
		self.chart.selectAll('text.xrule_time')
			.data(self.x_scale.ticks(self.options.ticks))
			.enter().append('svg:text')
			.attr('class', 'xrule_time')
			.attr('x', self.x_scale)
			.attr('y', height - margin)
			.attr('dy', 20)
			.attr('text-anchor', 'middle')
			.attr('fill', '#EEE')
			.html(function(d, i) { 
				var date = new Date(d);
				return date.getHours()+':'+date.getMinutes();
			});
		self.chart.selectAll('text.xrule_day')
			.data(self.x_scale.ticks(self.options.ticks))
			.enter().append('svg:text')
			.attr('class', 'xrule_day')
			.attr('x', self.x_scale)
			.attr('y', height - margin)
			.attr('dy', 35)
			.attr('text-anchor', 'middle')
			.attr('fill', '#EEE')
			.html(function(d, i) { 
				var date = new Date(d);
				var retDate = '';
				var dayOrder = parseFloat($.datepicker.formatDate('md', date));
				if(lastDay == null || dayOrder > lastDay) {
					retDate = $.datepicker.formatDate('m/d', date) + ' ' + retDate;
					lastDay = dayOrder;
				}
				return retDate;
			});
			
         self.chart.selectAll("text.yrule")
			.data(self.y_scale.ticks(self.options.ticks))
			.enter().append("svg:text")
			.attr("class", "yrule")
			.attr("x", 0)
			.attr("y", self.y_scale)
			.attr("dy", 4)
			.attr("dx", 0)		 
			.attr("text-anchor", "right")
			.attr('fill', '#EEE')
			.text(function(x) { return '$'+x; });
			
		var barWidth = (width - (margin*2)) / (numCandles + margin);
		self.chart.selectAll('rect.box')
			.data(candles)
			.enter().append('svg:rect')
			.attr('class', 'box')
			.attr('x', function(d,i){return self.x_scale(new Date(d.value.start).getTime()) - (barWidth)/2;})
			.attr('y', function(d){return self.y_scale(Math.max(d.value.open, d.value.close));})
			.attr('height', function(d){return self.y_scale(Math.min(d.value.open, d.value.close)) - self.y_scale(Math.max(d.value.open, d.value.close));})
			.attr('width', function(d){return barWidth;})
			.attr('fill', function(d){return d.value.open > d.value.close ? 'red' : 'green';});
			
		self.chart.selectAll('line.stem')
			.data(candles)
			.enter().append('svg:line')
			.attr('class', 'stem')
			.attr('x1', function(d, i) { return self.x_scale(new Date(d.value.start).getTime());})
			.attr('x2', function(d, i) { return self.x_scale(new Date(d.value.start).getTime());})
			.attr('y1', function(d) { return self.y_scale(d.value.high); })
			.attr('y2', function(d) { return self.y_scale(d.value.low); })
			.attr('stroke', function(d){return d.value.open > d.value.close ? 'red' : 'green';});
			
		self.chart.selectAll('line.top_cap')
			.data(candles)
			.enter().append('svg:line')
			.attr('class', 'top_cap')
			.attr('x1', function(d, i) { return self.x_scale(new Date(d.value.start).getTime())-(barWidth/2);})
			.attr('x2', function(d, i) { return self.x_scale(new Date(d.value.start).getTime())+(barWidth/2);})
			.attr('y1', function(d) { return self.y_scale(d.value.high); })
			.attr('y2', function(d) { return self.y_scale(d.value.high); })
			.attr('stroke', function(d){return d.value.open > d.value.close ? 'red' : 'green';});
			
		self.chart.selectAll('line.bottom_cap')
			.data(candles)
			.enter().append('svg:line')
			.attr('class', 'top_cap')
			.attr('x1', function(d, i) { return self.x_scale(new Date(d.value.start).getTime())-(barWidth/2);})
			.attr('x2', function(d, i) { return self.x_scale(new Date(d.value.start).getTime())+(barWidth/2);})
			.attr('y1', function(d) { return self.y_scale(d.value.low); })
			.attr('y2', function(d) { return self.y_scale(d.value.low); })
			.attr('stroke', function(d){return d.value.open > d.value.close ? 'red' : 'green';});
			
		self.drawEMA();
			
	},
	
	drawEMA: function() {
		var self = this;
		var candles = self.data;
		self.chart.selectAll('line.average_fast')
			.data(self.movingAverages.fast)
			.enter().append('svg:line')
			.attr('class', 'average_fast')
			.attr('x1', function(d, i) {
				if(i > 0) {
					var sDate = new Date(candles[i-1].value.start).getTime();
					return self.x_scale(sDate);	
				} else {
					return null;	
				}
			})
			.attr('x2', function(d, i) {
				if(i > 0) {
					var sDate = new Date(candles[i].value.start).getTime();
					return self.x_scale(sDate);	
				} else {
					return null;	
				}
			})
			.attr('y1', function(d, i) {
				if(i > 0) {
					return self.y_scale(self.movingAverages.fast[i-1]);
				} else {
					return null;
				}
			})
			.attr('y2', function(d, i) {
				if(i > 0) {
					return self.y_scale(d);
				} else {
					return null;
				}
			})
			.attr('stroke', 'yellow');
		self.chart.selectAll('line.average_slow')
			.data(self.movingAverages.slow)
			.enter().append('svg:line')
			.attr('class', 'average_slow')
			.attr('x1', function(d, i) {
				if(i > 0) {
					var sDate = new Date(candles[i-1].value.start).getTime();
					return self.x_scale(sDate);	
				} else {
					return null;	
				}
			})
			.attr('x2', function(d, i) {
				if(i > 0) {
					var sDate = new Date(candles[i].value.start).getTime();
					return self.x_scale(sDate);	
				} else {
					return null;	
				}
			})
			.attr('y1', function(d, i) {
				if(i > 0) {
					return self.y_scale(self.movingAverages.slow[i-1]);
				} else {
					return null;
				}
			})
			.attr('y2', function(d, i) {
				if(i > 0) {
					return self.y_scale(d);
				} else {
					return null;
				}
			})
			.attr('stroke', 'white');
	},
	
	changeChart: function() {
		var self = this;
		var currChart = self.el.chartSelector.val().split(':');
		self.currentChart.exchange = currChart[0];
		self.currentChart.market = currChart[1];
		self.chartInit = false;
		self.initChart();
	},
	
	changeInterval: function() {
		var self = this;
		var currChart = self.el.intervalSelector.val();
		self.currentChart.interval = currChart;
		self.chartInit = false;
		self.initChart();
	}
});
