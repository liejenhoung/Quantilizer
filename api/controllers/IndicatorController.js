/**
 * IndicatorController
 *
 * @description :: Server-side logic for managing Indicators
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'new': function(req, res) {
		res.view();
	},
	
	create: function(req, res, next) {
		var indicatorObj = {
		    arthor: req.param('arthor'),
			name: req.param('indicator_name'),
		    code: req.param('indicator_code'),
		    description: req.param('indicator_description'),
		    onsale: false,
		    price: 0
		}

		Indicator.create(indicatorObj).exec(function(err, indicator){
		    if (err) return next(err);
			res.redirect('/indicator/new');
		});
	},
};

