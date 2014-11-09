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
		    arthor: req.session.User.name,
			name: req.param('indicatorname'),
		    code: req.param('indicatorcode'),
		    description: req.param('indicatordescription'),
		    onsale: false,
		    price: 0
		}

		Indicator.create(indicatorObj).exec(function(err, indicator){
		    if (err) return next(err);
			res.redirect('/strategy/new');
		});
	},
};

