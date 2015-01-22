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
	case "plot":
		var plot_output = [];
		var data = HighChart2Quandl(input.data);
		eval(input.indicator);
		for(t=0;t<data.length;t++){
			try {
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
	};
}, false);
