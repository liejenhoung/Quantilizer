function rnd_snd() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function daily_return(mu) {
	return (Math.pow(1+mu,1/260)-1);
}

function daily_sigma(sigma) {
	return sigma/Math.sqrt(260);
}

function blackscholes(price, mu, sigma) {
	temp = price * Math.exp((mu - Math.pow(sigma,2)/2) + sigma * rnd_snd());
	return Math.round(temp*100)/100;
}

function HighChart2Quandl (highchart) {
	var result = [];
	for(t=0;t<highchart.length;t++){
		temp = {};
		temp["Date"] = moment(highchart[t][0]).format("YYYY-MM-DD"); 
		temp["Open"] = highchart[t][1];
		temp["High"] = highchart[t][2];
		temp["Low"] = highchart[t][3];
		temp["Close"] = highchart[t][4];
		result.push(temp);
	}
	return result;
}

function generate_hcstock(input_tick, input_mu, input_sigma) {
	var curr_date = new Date(); //today
	curr_date.setDate(curr_date.getDate() - input_tick);
	
	var utc_Date = 0;
	
	var stock_open = 100.00;
	var stock_high = 100.00;
	var stock_low = 100.00;
	var stock_close = 100.00;
	
	var temp1 = 0;
	var temp2 = 0;
	
	var mu = daily_return(input_mu);
	var sigma = daily_sigma(input_sigma);
	
	var stock_array = [];
	
	for(t=0;t<input_tick;t++){
		curr_date.setDate(curr_date.getDate() + 1);
		utc_date = Date.UTC(curr_date.getFullYear(),curr_date.getMonth(),curr_date.getDate());

		stock_open = stock_close;
		temp1 = blackscholes(stock_open, mu, sigma);
		temp2 = blackscholes(stock_open, mu, sigma);
		stock_close = blackscholes(stock_open, mu, sigma);
		stock_high = Math.max(stock_open, temp1, temp2, stock_close);
		stock_low = Math.min(stock_open, temp1, temp2, stock_close);
		stock_array.push([utc_date, stock_open, stock_high, stock_low, stock_close]);
	}
	
	return stock_array;
}