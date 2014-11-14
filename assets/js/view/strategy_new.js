// Define global variables
var data = {};
var imported_indicator = [];

// Parse innerhtml and decode
function parsehtml(id) {
	return document.getElementById(id).innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// Convert indicator array to string
function indicatorstr() {
	var str = "Console: Imported indicators";
	$.each(imported_indicator, function(i, item){
		str += " /" + (i+1) + ": " + imported_indicator[i].name;
	});
	return str;
}

// Import data from quandl
$("#stocknum").change(function() {
	var auth_token = 'Xzhf33Joce67yvF5Mevc'
	var url = 'https://www.quandl.com/api/v1/datasets/GOOG/' + $("#stocknum").val() + '.json?auth_token=' + auth_token;
	$.getJSON(url, function(quandl){
		// The entered code is correct
		$("#dayfrom").val(quandl.data[quandl.data.length - 1][0]);
		$("#dayfrom").attr({"max": quandl.data[0][0], "min": quandl.data[quandl.data.length - 1][0]});
		$("#dayto").val(quandl.data[0][0]);
		$("#dayto").attr({"max": quandl.data[0][0], "min": quandl.data[quandl.data.length - 1][0]});
				
		data = quandl.data.reverse();
		
		// Convert the array to JSON object
		for (t=0;t<data.length;t++){
			// data[k][t] stands for the kth stock at time t
			for(k=0;k<data[t].length;k++) {
				data[t][quandl.column_names[k]] = data[t][k];
			}
		}
		
		$("#console_stock").text("Console: Successfully imported stock " + quandl.code + " - " + quandl.name);
						
	}).fail(function(){
		// The entered code is incorrect
		$("#console_stock").text("Console: Fail to retrieve data.");
	});
});

// Temporarily not usable
// $("#dayfrom").blur(function() {
// 	$("#dayto").attr({"max": data[data.length - 1].Date, "min": $("dayfrom").val()});
// });

// Temporarily not usable
// $("#dayto").blur(function() {
// 	$("#dayfrom").attr({"max": $("dayto").val(), "min": data[0].Date});
// });

// Change strategy code display
$("#strategy_select").change(function() {
	if(this.value === "") { 
		$("#strategy_display").val(""); 
	} else {
		$("#strategy_display").val(parsehtml("strategy-info-description_" + this.value));
	}
});

// Import strategies
$("#strategy_import").click(function(){
	var strategy_name = $("#strategy_select").val();
	$("#code").val(parsehtml("strategy-info-code_" + strategy_name));
	imported_indicator = JSON.parse(parsehtml("strategy-info-indicators_" + strategy_name));
	
	$("#console_indicator").text(indicatorstr);
	$("#console_simple").text("Console: Imported Strategy: " + strategy_name);
});

// Change indicator code display
$("#indicator_select").change(function() {
	if(this.value === "") { 
		$("#indicator_display").val(""); 
	} else {
		$("#indicator_display").val(parsehtml("indicator-info-code_" + this.value));
	}
});

// Import indicators
$("#import").click(function(){
	var indicator_name = $("#indicator_select").val();
	var imported = false;
	
	// Make sure indicator already exists
	if (imported_indicator.length > 0) {
		for(i=0;i<imported_indicator.length;i++) {
			if (imported_indicator[i].name === indicator_name || indicator_name === "") {
				// Already imported
				imported = true;
			}
		}
	}
	if (!imported) {
		imported_indicator[imported_indicator.length] = {};
		imported_indicator[imported_indicator.length - 1]["name"] = $("#indicator_select").val();
		imported_indicator[imported_indicator.length - 1]["code"] = $("#indicator_display").val();

		$("#console_indicator").text(indicatorstr);
	}
});

// Run Strategy
$("#run").click(function(){
	// Set result object
	var result = [];

	// Compile indicators
	for (k=1;k<=imported_indicator.length;k++) {
		eval(imported_indicator[k-1].code);
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

	for (t=0;t<data.length;t++) {
		try {
			
			// Calculate the user code
			eval($("#code").val());
			
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
				$("#console_advance").text("Console: Final Capital is " + result[data.length-1].total);
				$("#console_simple").text("Console: Final Capital is " + result[data.length-1].total);
			}
			
			// Run finished, save imported indicators
			$("#imported_indicator").val(JSON.stringify(imported_indicator));
			$("#submit").show();
			$("#report").show();
			
		} catch (e) {
			// Return error
			$("#console_advance").text("Console: Run time error # " + e.message);
			$("#console_simple").text("Console: Run time error # " + e.message);
			break;
		}
	}
});


// Save Strategy
$('#strategy_form').submit(function(event){
	// Stop form from submitting normally
	event.preventDefault();
	
	// Define post json
	var submitjson = {};

	submitjson["strategyname"] = prompt("Please enter the strategy name", "My strategy");
	submitjson["description"] = prompt("Please enter the strategy description", "Description");
	
	// Get some values from elements on the page:
	submitjson["arthor"] = $("#arthor").val();
	submitjson["code"] = $("#code").val();
	submitjson["indicators"] = $("#imported_indicator").val();
	submitjson["_csrf"] = $("#_csrf").val();
	url = $('#strategy_form').attr("action");
	  
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
