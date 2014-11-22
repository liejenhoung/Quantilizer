/**
 * IndicatorController
 *
 * @description :: Server-side logic for managing Indicators
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	'new': function(req, res, next) {
		Indicator.find({owner: req.session.User.name}, function(err, indicators) {
			if (err) return next(err);
			if (req.param('id') == undefined) {
				res.view({
					indicator: {name: "", code: "", plotcode: "", description: ""},
					indicators: indicators
				});
			} else {
				Indicator.findOne(req.param('id'), function(err, indicator) {
					if (err) return next(err);
					if (!indicator) {
						return res.view({
							indicator: {name: "", code: "", plotcode: "", description: ""},
							indicators: indicators
						});
					} else {
						return res.view({
						indicator: indicator,
						indicators: indicators
						});
					}
				});	
			}
		});
	},
	
	show: function(req, res) {
		Indicator.find({owner: req.session.User.name}, function(err, indicators) {
			if (err) return next(err);
			res.view({
				indicators: indicators
			});
		})
	},
	
	//process the info from edit view
	update: function(req, res, next) {
		
		var indicatorObj = {
			name: req.param('indicator_name'),
		    description: req.param('indicator_description'),
			edited: moment().format("YYYY-MM-DD"),
		}
		
		Indicator.update(req.param('indicator_id'), indicatorObj, function (err) {
			if (err) {
				return res.redirect('/indicator/show');
			}
			
			res.redirect('/indicator/show');
		});
	},
	
	create: function(req, res, next) {
		
		Indicator.findOne({name_and_owner: req.param('indicator_name') + "_" + req.param('author')}, function(err, found) {
			if (err) return next(err);
			
			if (found) {
				var indicatorObj = {
					name: req.param('indicator_name'),
				    code: req.param('indicator_code'),
					plotcode: req.param('indicator_plotcode'),
				    description: req.param('indicator_description'),
					edited: moment().format("YYYY-MM-DD")
				}
				Indicator.update(found.id, indicatorObj, function(err, indicator) {
					if (err) return next(err);
					res.redirect('/indicator/show');
				});
			} else {
				var indicatorObj = {
					name: req.param('indicator_name'),
				    code: req.param('indicator_code'),
					plotcode: req.param('indicator_plotcode'),
				    description: req.param('indicator_description'),
					author: req.param('author'),
					owner: req.param('author'),
					name_and_owner: req.param('indicator_name') + "_" + req.param('author'),
					created: moment().format("YYYY-MM-DD"),
					edited: moment().format("YYYY-MM-DD"),
					onsale: false,
					price: 0
				}
				Indicator.create(indicatorObj, function(err, indicator) {
					if (err) return next(err);
					res.redirect('/indicator/show');
				});
			}
		})
	},
	
	destroy: function(req, res, next) {
		Indicator.findOne(req.param('id'), function (err, indicator) {
			if (err) return next(err);
			if (!indicator) return next("Indicator doesn't exist.");
			Indicator.destroy(req.param('id'), function (err) {
				if (err) return next(err);
			});
			res.redirect('/indicator/show');
		});
	}
};

