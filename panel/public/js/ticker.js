$.widget('custom.ticker', {
	options: {
		el: {
			chartSelector: '.chartSelect',
			tickers: '#tickers_container',
		},
		refreshInterval: 1000
	},
	
	currentChart: {
		exchange: null,
		market: null
	},
	el: {},
	data: null,
	
	_create: function() {
		var self = this;
		$.each(self.options.el, function(idx, el) {
			self.el[idx] = $(el);
		});
		
		self.el.chartSelector.on('change', $.proxy(self.changeChart, self));
		var currChart = self.el.chartSelector.val().split(':');
		self.currentChart.exchange = currChart[0];
		self.currentChart.market = currChart[1];
		self.requestData();
	},
	
	requestData: function() {
		var self = this;
		$.getJSON('/tickers/data', self.currentChart, function(json) {
			self.data = json;
			self.buildTable();
			setTimeout($.proxy(self.requestData, self), self.options.refreshInterval);
		});
	},
	
	changeChart: function() {
		var self = this;
		var currChart = self.el.chartSelector.val().split(':');
		self.currentChart.exchange = currChart[0];
		self.currentChart.market = currChart[1];
		self.requestData();
	},
	
	buildTable: function() {
		var self = this;
		var table = $('<table></table>');
		$.each(self.data.tickers, function(idx, el) {
			table.append('<tr><td>'+el.indicator+'</td><td>'+el.value.toFixed(8)+'</td></tr>');
		});
		self.el.tickers.html(table);
	}
});
