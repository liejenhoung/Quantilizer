/**
 * StrategyController
 *
 * @description :: Server-side logic for managing Strategies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require("underscore");

module.exports = {
	'new': function(req, res, next) {
		//Get an array of all indicators in the library
		Indicator.find(function foundIndicators (err, indicators) {
			if (err) return next(err);
			//pass the array down to the /views/index.ejs page
			Strategy.find(function foundStrategies (err2, strategies) {
				if (err2) return next(err2);
				//pass the array down to the /views/index.ejs page
				res.view({
					indicators: indicators,
					strategies: strategies
				});
			});
		});
	},
	
	save: function(req, res, next) {
		//Save the strategy
		var strategyObj = {
		    arthor: req.param('arthor'),
			name: req.param('strategyname'),
		    strategycode: req.param('code'),
			indicators: req.param('indicators'),
		    description: req.param('description'),
		    onsale: false,
		    price: 0
		}

		Strategy.create(strategyObj).exec(function(err, strategy){
		    if (err) return next(err);
			res.redirect('/strategy/new');
		});
	}
};

