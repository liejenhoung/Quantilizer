// Section 1 - Define Global Variables

var stock_data = [];
var indicator_data = [];
var worker = new Worker('/js/share/indicator_worker.js');

worker.addEventListener('message', function(e) {
	stock_data = e.data.stock_data;
	indicator_data = e.data.indicator_data;
	chart.series[0].setData(stock_data);
	chart.series[1].setData(indicator_data);
}, false);

// Section 2 - Initialization

// Generate Code Mirror
var indicator_code = CodeMirror.fromTextArea($("#indicator_code").get(0), {
	lineNumbers: true,
	mode: "javascript"
});
indicator_code.setSize(500,200);

var plot_code = CodeMirror.fromTextArea($("#plot_code").get(0), {
	lineNumbers: true,
	mode: "javascript"
});
plot_code.setSize(500,50);

// Generate Stock Data
stock_data = generate_hcstock($("#stock_tick").val(),$("#stock_mu").val()/100,$("#stock_sigma").val()/100);

// Create High Chart (Simulated Stock)
var option = {
	chart: {
		renderTo: 'container',
		alignTicks: true
	},

	rangeSelector: {
		selected: 1
	},

	title: {
		text: 'Simulated Stock Price'
	},

	yAxis: [{
		title: {
			text: 'Price'
		},
		lineWidth: 2,
	}, {
		title: {
			text: 'Indicator'
		},
		opposite: true,
		lineWidth: 2,
	}],
        
	navigator: {
		enabled: true
	},
        
	series: [{
		type: 'candlestick',
		name: 'Stock',
		data: stock_data,
		yAxis: 0

	}, {
		type: 'line',
		name: 'Indicator',
		data: indicator_data,
		yAxis: 1

	}]
};

var chart = new Highcharts.StockChart(option);

// Section 3 - Interactive Response

// Plot indicator
$("#indicator_plot").click(function() {
	worker.postMessage({"cmd": "plot", "data": stock_data, "indicator": indicator_code.getValue(), "plot": plot_code.getValue()});
});

// Remove indicator
$("#indicator_remove").click(function() {
	worker.postMessage({"cmd": "remove", "data": stock_data});
});

// Refresh Stock
$("#stock_refresh").click(function() {
	worker.postMessage({"cmd": "generate", "tick": $("#stock_tick").val(), "mu": $("#stock_mu").val()/100, "sigma": $("#stock_sigma").val()/100});
});

// Prevent Dropdown menu disappear
$('.dropdown-menu').click(function(event){
    event.stopPropagation();
});

// Click Save Indicator
$('#indicator_create').click(function(event){
	// Check if graph is plotted
	if (indicator_data.length === 0) {
		alert("Please plot the graph to validate your indicator first.");
	} else {
		$('#myModal').modal('show');
	}
});

// Save Indicator
$('#indicator_submit').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {};

 	// Get some values from elements on the page:
 	submitjson["indicator_name"] = $("#indicator_name").val();
 	submitjson["indicator_code"] = indicator_code.getValue();
	submitjson["indicator_description"] = $("#indicator_description").val();
 	submitjson["arthor"] = $("#arthor").val();
 	submitjson["_csrf"] = $("#_csrf").val();
 	url = $('#indicator_submit').attr("action");

 	$.ajax({
 		url: url,
 		type: 'POST', 
 		contentType: 'application/json', 
 		dataType: 'html',
 		data: JSON.stringify(submitjson),
 		cache: false,
 		success: function(data){
 			alert('Successfully saved strategy.');
 		},
 		error: function(jqXHR, textStatus, err){
 			alert('text status '+textStatus+', err '+err);
 		} 
 	});
	 
});

