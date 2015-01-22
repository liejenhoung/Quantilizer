// Section 1 - Define functions
importScripts("/js/moment.js");
importScripts("/js/share.js")

// Section 2 - Worker
self.addEventListener('message', function(e) {
	var input = e.data;
		
	switch(input.cmd) {
	case "generate":
		var output = {
			"stock_data": generate_hcstock(input.tick,input.mu,input.sigma),
			"output_data": [],
			"msg": false
		};
		self.postMessage(output);
		break;
	case "remove":
		var output = {
			"stock_data": false,
			"output_data": [],
			"msg": false
		};
		self.postMessage(output);
		break;
	case "import":
		var auth_token = 'Xzhf33Joce67yvF5Mevc';
		var url = 'https://www.quandl.com/api/v1/datasets/' + input.stockid + '.json?auth_token=' + auth_token;
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.send();		
		request.onreadystatechange = function() {
		    if (request.readyState == 4 && request.status == 200) {
				// Successfully get data
		        var quandl = JSON.parse(request.responseText);
		        var data = quandl.data.reverse();
				// Convert the array to JSON object
				for (t=0;t<data.length;t++){
					// data[k][t] stands for the kth stock at time t
					for(k=0;k<data[t].length;k++) {
						data[t][quandl.column_names[k]] = data[t][k];
					};
				};
				var output = {
					"stock_data": Quandl2HighChart(data),
					"output_data": [],
					"msg": "Console: Successfully imported stock " + quandl.code + " - " + quandl.name
				};
				self.postMessage(output);
		    } else if (request.readyState == 4 && request.status !== 200) {
				var output = {
					"stock_data": false,
					"output_data": false,
					"msg": "Console: Failed to Retrieve Data."
				};
				self.postMessage(output);
		    };
		};
		break;
	case "run":
		// Define all variables first
		var initial_capital = 0.00;
		var cash = 0.00;
		var buy = false;
		var sell = false;
		var shares = 0.00;
		var buy_amt = 0.00;
		var sell_amt = 0.00;
		var cost = 0.00;
		var total = 0.00
		var result = [];
		var plot_output = [];
		// Convert Data to Quandl format
		var data = HighChart2Quandl(input.data);
		// Eval indicators
		for (i=0;i<input.indicator.length;i++) {
			eval(input.indicator[i]);
		};
		// Main Loop
		for (t=0;t<data.length;t++) {
			try {
				// Calculate the user code
				eval(input.strategy);
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
				// Save the result into output variable
				var temp = eval(input.plot);
				if (!isNaN(temp)) { temp = round(temp,2); }
				plot_output.push([input.data[t][0],temp]);
				// Last Time Period
				if (t===data.length-1) {
					var output = {
						"stock_data": false,
						"output_data": plot_output,
						"msg": "Console: Final value for " + input.plot + " is " + temp
					};
					self.postMessage(output);
				};
			} catch (e) {
				// Return error
				var output = {
					"stock_data": false,
					"output_data": false,
					"msg": "Console: Run time error # " + e.message
				};
				self.postMessage(output);				
				break;
			};
		};
	};
}, false);