// Stock ID selection
var data = {};
var globalimportednum = 0;
var globalimportedname = [];
var globalimportedcode = [];
var globalimportedstr = "";

$("#stocknum").change(function() {
	var auth_token = 'Xzhf33Joce67yvF5Mevc'
	var url = 'https://www.quandl.com/api/v1/datasets/GOOG/' + $("#stocknum").val() + '.json?auth_token=' + auth_token;
	$.getJSON(url,
	function(quandl){
		// The entered code is correct
		$("#console").text("Console: Successfully imported stock " + quandl.code + " - " + quandl.name);
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
						
	}).fail(function(){
		// The entered code is incorrect
		$("#console").text("Console: Fail to retrieve data.");
	});
});

// Temporarily not usable
$("#dayfrom").blur(function() {
	$("#dayto").attr({"max": data[data.length - 1].Date, "min": $("dayfrom").val()});
});

// Temporarily not usable
$("#dayto").blur(function() {
	$("#dayfrom").attr({"max": $("dayto").val(), "min": data[0].Date});
});

// Change indicator code display
$("#indicatorselect").change(function() {
	if($("#indicatorselect").val() === "") { $("#indicatordisplay").text(""); }
	$('[id^="indicator_"]').each(function(){
		if(this.id === "indicator_" + $("#indicatorselect").val()) {
			$("#indicatordisplay").text(document.getElementById(this.id).innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
		}
	});
});

// Import indicators
$("#import").click(function(){
	var imported = false;
	for(i=0;i<=globalimportednum;i++) {
		if (globalimportedname[i]===$("#indicatorselect").val() || $("#indicatorselect").val()==="") {
			// Already imported
			imported = true;
		}
	}
	if (!imported) {
		globalimportednum += 1;
		globalimportedname[globalimportednum] = $("#indicatorselect").val();
		globalimportedcode[globalimportednum] = $("#indicatordisplay").text();

		globalimportedstr += "/" + globalimportednum + ": " + $("#indicatorselect").val();
		$("#console2").text("Console: Imported indicators " + globalimportedstr)
	}
});

// Run Strategy
$("#run").click(function(){
	// Set result object
	var result = [];

	// Compile indicators
	for (k=1;k<=globalimportednum;k++) {
		eval(globalimportedcode[k]);
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
				$("#console3").text("Console: Final Capital is " + result[data.length-1].total);
			}
			
		} catch (e) {
			// Return error
			$("#console3").text("Console: Run time error # " + e.message);
			break;
		}
	}
});