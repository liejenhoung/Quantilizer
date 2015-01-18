Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

Date.prototype.addBusDays = function(dd) {
	var wks = Math.floor(dd/5);
	var dys = dd.mod(5);
	var dy = this.getDay();
	if (dy === 6 && dys > -1) {
		if (dys === 0) {
			dys-=2; dy+=2;
		}
		dys++;
		dy -= 6;
	}
	if (dy === 0 && dys < 1) {
		if (dys === 0) {
			dys+=2;
			dy-=2;
		}
		dys--;
		dy += 6;
	}
	if (dy + dys > 5) dys += 2;
	if (dy + dys < 1) dys -= 2;
	this.setDate(this.getDate()+wks*7+dys);
}

function round(value, dp) {
    var multiplier = Math.pow(10, dp);
    return (Math.round(value * multiplier) / multiplier);
}

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
	return round(temp,2);
}

function HighChart2Quandl (highchart) {
	var result = [];
	for(t=0;t<highchart.length;t++){
		temp = {
			Date: moment(highchart[t][0]).format("YYYY-MM-DD"),
			Open: highchart[t][1],
			High: highchart[t][2],
			Low: highchart[t][3],
			Close: highchart[t][4]
		};
		result.push(temp);
	}
	return result;
}

function Quandl2HighChart (quandl) {
	var result = [];
	for(t=0;t<quandl.length;t++){
		curr_date = quandl[t].Date;
		utc_date = Date.UTC(moment(curr_date).format("YYYY"),moment(curr_date).format("MM"),moment(curr_date).format("DD"));
		
		stock_open = quandl[t].Open;
		stock_high = quandl[t].High;
		stock_low = quandl[t].Low;
		stock_close = quandl[t].Close;
		
		result.push([utc_date, stock_open, stock_high, stock_low, stock_close]);
	}
	return result;
}

function generate_hcstock(input_tick, input_mu, input_sigma) {
	// Define variables
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
	
	curr_date = new Date();
	curr_date.addBusDays(-input_tick);
	
	for(t=0;t<input_tick;t++){
		curr_date.addBusDays(1);
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

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}