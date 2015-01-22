// Section 1 - Define Global Variables

var stock_data = [];
var indicator_name = [];
var output_data = [];
var worker = new Worker('/localjs/indicator_worker.js');

worker.addEventListener('message', function(e) {
	if (e.data.stock_data !== false) stock_data = e.data.stock_data;
	if (e.data.output_data !== false) output_data = e.data.output_data;
	if (e.data.msg !== false) $("#console").text(e.data.msg);
	chart.series[0].setData(stock_data);
	chart.series[1].setData(output_data);
}, false);

// Section 2 - Initialization

// Generate Code Mirror
var CodeMirror_Code = CodeMirror.fromTextArea($("#indicator_new-code").get(0), {
	lineNumbers: true,
	mode: "javascript"
});
CodeMirror_Code.setSize(500,240);

var CodeMirror_Plotcode = CodeMirror.fromTextArea($("#indicator_new-plotcode").get(0), {
	lineNumbers: true,
	mode: "javascript"
});
CodeMirror_Plotcode.setSize(500,50);

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
		text: 'Stock Price'
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
		data: output_data,
		yAxis: 1

	}]
};

var chart = new Highcharts.StockChart(option);

// Section 3 - Interactive Response
$("#indicator_new-load").click(function() {
	var link = document.createElement("a");
	var selected = $("#indicator_new-library").val();
	var id = $('#indicators').find('option').filter(function() { return $.trim( $(this).val() ) === selected; }).attr('id');
	link.setAttribute("href", "/indicator/new/"+id);
	link.click();
});

// Plot indicator
$("#indicator_new-run").click(function() {
	// Read in the plot code
	var plot_code = CodeMirror_Plotcode.getValue();
	// Check if the plot code is entered
	if (plot_code == "") {
		$("#console").text("Console: Please input the execution code first.");
	} else {
		worker.postMessage({
			"cmd": "plot",
			"data": stock_data,
			"indicator": CodeMirror_Code.getValue(),
			"plot": CodeMirror_Plotcode.getValue()
		});
	};
});

// Remove indicator
$("#indicator_new-remove").click(function() {
	worker.postMessage({
		"cmd": "remove"
	});
});

// Download
$("#indicator_new-download").click(function() {
	var data = HighChart2Quandl(stock_data);
	if(output_data.length>0) {
		var header = "data:text/csv;charset=utf-8,Date,Open,High,Low,Close,Indicator\r\n";
		for(t=0;t<data.length;t++) {
			data[t]["Output"] = output_data[t][1];
		}
		var content = header+ConvertToCSV(data);
	} else {
		var header = "data:text/csv;charset=utf-8,Date,Open,High,Low,Close\r\n";
		var content = header+ConvertToCSV(data);
	}
	var encodedUri = encodeURI(content);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "indicator - "+moment().format("lll")+".csv");

	link.click(); // This will download the data file named "my_data.csv".
});

// Select Simulate
$('#indicator_new-simulate_price').click(function () {
    $("#indicator_new-simulate_div").show();
    $("#indicator_new-real_div").hide();
});

// Select Real
$('#indicator_new-real_price').click(function () {
    $("#indicator_new-real_div").show();
    $("#indicator_new-simulate_div").hide();
});

// Refresh Stock
$("#indicator_new-refresh").click(function() {
	worker.postMessage({
		"cmd": "generate",
		"tick": $("#stock_tick").val(),
		"mu": $("#stock_mu").val()/100,
		"sigma": $("#stock_sigma").val()/100
	});
});

// Prevent Dropdown menu disappear
$('#indicator_new-confg_dropdown').click(function(event){
    event.stopPropagation();
});

// Import data from quandl
$("#indicator_new-import").click(function() {
	var stockid = $("#indicator_new-stockid").val();
	worker.postMessage({
		"cmd": "import",
		"stockid": stockid
	});
});

// Click Save Indicator
$('#indicator_new-save').click(function(event){
	// Check if graph is plotted
	if (output_data.length === 0) {
		$("#console").text("Console: Please execute the code first before saving.");
	} else {
		$('#indicator_new-Modal').modal('show');
	}
});

// Save Indicator
$('#indicator_new-form').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {
 		indicator_name: $("#indicator_new-name").val(),
		indicator_code: CodeMirror_Code.getValue(),
		indicator_plotcode: CodeMirror_Plotcode.getValue(),
		indicator_description: $("#indicator_new-description").val(),
		author: $("#indicator_new-author").val(),
		_csrf: $("#_csrf").val()
 	};

 	$.ajax({
 		url: $('#indicator_new-form').attr("action"),
 		type: 'POST', 
 		contentType: 'application/json', 
 		dataType: 'html',
 		data: JSON.stringify(submitjson),
 		cache: false,
 		success: function(data){
			window.location.replace("/indicator/show");
 		},
 		error: function(jqXHR, textStatus, err){
			if (!$("#indicator_new-errmsg").length) {
				$("#indicator_new-errdiv").append('<ul class="alert alert-success" id="indicator_new-errmsg"><a href="#" class="close" data-dismiss="alert">&times;</a><li>'+jqXHR.responseText+'</li></ul>');
			}				
 		} 
 	});
	 
});

