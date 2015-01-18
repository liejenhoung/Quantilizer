// Section 1 - Define functions
importScripts("/js/moment.js");
importScripts("/js/share.js")

// Section 2 - Worker
self.addEventListener('message', function(e) {
	var input = e.data;
		
	switch(input.cmd) {
	case "generate":
		self.postMessage({"stock_data": generate_hcstock(input.tick,input.mu,input.sigma), "indicator_data": []});
		break;
	case "remove":
		self.postMessage({"stock_data": input.data, "indicator_data": []});
		break;
	case "plot":
		if (input.plot == "") {return; }
		var result = [];
		var data = HighChart2Quandl(input.data);
		eval(input.indicator);
		for(t=0;t<data.length;t++){
			var temp = eval(input.plot);
			if (!isNaN(temp)) { temp = round(temp,2); }
			result.push([input.data[t][0],temp]);
		}
		self.postMessage({"stock_data": input.data, "indicator_data": result});
		break;
	case "import":
		self.postMessage({"stock_data": Quandl2HighChart(input.stockdata), "indicator_data": []});
		break;
	}
}, false);
