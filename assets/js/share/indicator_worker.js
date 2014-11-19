// Section 1 - Define functions
importScripts("/js/moment.js");
importScripts("/js/share/share.js")

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
			result.push([input.data[t][0],eval(input.plot)]);
		}
		self.postMessage({"stock_data": input.data, "indicator_data": result});
		break;
	}
}, false);
