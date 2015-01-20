// Section 1 - Define Global Variables

var stock_data = [];
var indicator_name = [];
var indicator_data = [];
var worker = new Worker('/localjs/strategy_worker.js');

worker.addEventListener('message', function(e) {
	stock_data = e.data.stock_data;
	indicator_data = e.data.indicator_data;
	chart.series[0].setData(stock_data);
	chart.series[1].setData(indicator_data);
}, false);

// Section 2 - Initialization

// Generate Code Mirror
var CodeMirror_Code = CodeMirror.fromTextArea($("#strategy_new-code").get(0), {
	lineNumbers: true,
	mode: "javascript"
});
CodeMirror_Code.setSize(500,240);

var CodeMirror_Plotcode = CodeMirror.fromTextArea($("#strategy_new-plotcode").get(0), {
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
		data: indicator_data,
		yAxis: 1

	}]
};

var chart = new Highcharts.StockChart(option);

// Section 3 - Interactive Response
$("#strategy_new-load").click(function() {
	var link = document.createElement("a");
	var selected = $("#strategy_new-library").val();
	var id = $('#indicators').find('option').filter(function() { return $.trim( $(this).val() ) === selected; }).attr('id');
	link.setAttribute("href", "/strategy/new/"+id);
	link.click();
});

// Plot indicator
$("#strategy_new-plot").click(function() {
	worker.postMessage({"cmd": "plot", "data": stock_data, "indicator": CodeMirror_Code.getValue(), "plot": CodeMirror_Plotcode.getValue()});
});

// Remove indicator
$("#strategy_new-remove").click(function() {
	worker.postMessage({"cmd": "remove", "data": stock_data});
});

// Download
$("#strategy_new-download").click(function() {
	var data = HighChart2Quandl(stock_data);
	if(indicator_data.length>0) {
		var header = "data:text/csv;charset=utf-8,Date,Open,High,Low,Close,Indicator\r\n";
		for(t=0;t<data.length;t++) {
			data[t]["Indicator"] = indicator_data[t][1];
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
$('#strategy_new-simulate_price').click(function () {
    $("#strategy_new-simulate_div").show();
    $("#strategy_new-real_div").hide();
});

// Select Real
$('#strategy_new-real_price').click(function () {
    $("#strategy_new-real_div").show();
    $("#strategy_new-simulate_div").hide();
});

// Refresh Stock
$("#strategy_new-refresh").click(function() {
	worker.postMessage({"cmd": "generate", "tick": $("#stock_tick").val(), "mu": $("#stock_mu").val()/100, "sigma": $("#stock_sigma").val()/100});
});

// Prevent Dropdown menu disappear
$('#strategy_new-confg_dropdown').click(function(event){
    event.stopPropagation();
});

// Import data from quandl
$("#strategy_new-import").click(function() {
	var stockid = $("#strategy_new-stockid").val();
	var auth_token = 'Xzhf33Joce67yvF5Mevc'
	var url = 'https://www.quandl.com/api/v1/datasets/' + stockid + '.json?auth_token=' + auth_token;
	$.getJSON(url, function(quandl){
		data = quandl.data.reverse();
	
		// Convert the array to JSON object
		for (t=0;t<data.length;t++){
			// data[k][t] stands for the kth stock at time t
			for(k=0;k<data[t].length;k++) {
				data[t][quandl.column_names[k]] = data[t][k];
			}
		}
		
		$("#console").text("Console: Successfully imported stock " + quandl.code + " - " + quandl.name);
		worker.postMessage({"cmd": "import", "stockdata": data});		
		
	}).fail(function(){
		// The entered code is incorrect
		$("#console").text("Console: Fail to retrieve data.");
	});	
});

// Function to Read all imported indicators
function read_indicator(str) {
	var pattern = /import \"([a-zA-Z0-9 ]+)\";/;
	var ans = pattern.exec(str);
	if (ans==null) {
		// return the remaining string
		return str;
	} else {
		// add one more indicator name
		indicator_name.push(ans[1]);
		// recursive
		return read_indicator(str.replace(ans[0],""));
	}
}

// Perform Run
$('#strategy_new-run').click(function(event){
	// initialize indicator name
	indicator_name = [];
	// Get CodeMirror
	var str = CodeMirror_Code.getValue();
	// parse for all indicators and assign the remaining string after parsing
	var strategy_code = read_indicator(str);
	// Convert HighChart Data to QuandlData
	var data = HighChart2Quandl(stock_data);
	// Compile indicators
	for(i=0;i<indicator_name.length;i++) {
		var obj = document.getElementById(indicator_name[i]);
		if (obj !== null) {
			eval(obj.value);
		} 
	}

	// Define all variables first
	var initial_capital = 0.00;
	var cash = 0.00;
	
	var buy = false;
	var sell = false;
	
	var num_of_shares = 0.00;
	var shares = 0.00;
	
	var buy_amt = 0.00;
	var sell_amt = 0.00;
	
	var cost = 0.00;
	var total = 0.00
	
	var result = [];

	for (t=0;t<data.length;t++) {
		try {
			
			// Calculate the user code
			eval(strategy_code);
			
			// Initializer the result object
			result[t] = {};
			
			// Bring last period cash to this period
			if (t===0) {
				cash = initial_capital;
				shares = 0;
			}
			
			// Determine buy
			if (buy) {
				cash -= buy_amt * data[t].Close - cost;
				shares += buy_amt;
			}			

			// Determine sell
			if (sell) {
				cash += sell_amt * data[t].Close - cost;
				shares -= sell_amt;
			}
			
			// Total Capital
			total = cash + shares * data[t].Close;
			
			// Feed in result to result array
			result[t]["cash"] = cash;
			result[t]["buy"] = buy;
			result[t]["sell"] = sell;
			result[t]["shares"] = shares;
			result[t]["buy_amt"] = buy_amt;
			result[t]["sell_amt"] = sell_amt;
			result[t]["cost"] = cost;
			result[t]["total"] = total;
			
			if (t===data.length-1) {
				$("#console").text("Console: Final Capital is " + result[data.length-1].total);
				$('#strategy_new-run').hide();
				$('#strategy_new-create').show();
			}
			
		} catch (e) {
			// Return error
			$("#console").text("Console: Run time error # " + e.message);
			break;
		}
	}
});

// Click Save Indicator
$('#strategy_new-create').click(function(event){
	$('#strategy_new-Modal').modal('show');
});

// Save strategy
$('#strategy_new-form').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {
 		strategy_name: $("#strategy_new-name").val(),
		strategy_code: CodeMirror_Code.getValue(),
		strategy_plotcode: CodeMirror_Plotcode.getValue(),
		strategy_description: $("#strategy_new-description").val(),
		author: $("#strategy_new-author").val(),
		_csrf: $("#_csrf").val()
 	};

 	$.ajax({
 		url: $('#strategy_new-form').attr("action"),
 		type: 'POST', 
 		contentType: 'application/json', 
 		dataType: 'html',
 		data: JSON.stringify(submitjson),
 		cache: false,
 		success: function(data){
			window.location.replace("/strategy/show");
 		},
 		error: function(jqXHR, textStatus, err){
			if (!$("#strategy_new-errmsg").length) {
				$("#strategy_new-errdiv").append('<ul class="alert alert-success" id="strategy_new-errmsg"><a href="#" class="close" data-dismiss="alert">&times;</a><li>'+jqXHR.responseText+'</li></ul>');
			}				
 		} 
 	});
	 
});
