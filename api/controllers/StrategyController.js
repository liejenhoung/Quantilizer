/**
 * StrategyController
 *
 * @description :: Server-side logic for managing Strategies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Quandl = require("quandl");
var _ = require("underscore");

module.exports = {
	'new': function(req, res, next) {
		//Get an array of all indicators in the library
		Indicator.find(function foundIndicators (err, indicators) {
			if (err) return next(err);
			//pass the array down to the /views/index.ejs page
			res.view({
				indicators: indicators
			});
		});
	}
};

