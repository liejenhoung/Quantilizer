/**
 * StrategyController
 *
 * @description :: Server-side logic for managing Strategies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	'new': function(req, res, next) {
		Strategy.find({owner: req.session.User.name}, function(err, strategies) {
			if (err) return next(err);
			if (req.param('id')===undefined) {
				// Also Read-in Indicators
				Indicator.find({owner: req.session.User.name}, function(err2, indicators) {
					if (err2) return next(err2);
					return res.view({
						strategy: {name: "", code: "", plotcode: "", description: ""},
						strategies: strategies,
						indicators: indicators
					});
				});
			} else {
				Strategy.findOne(req.param('id'), function(err, strategy) {
					if (err) return next(err);
					if (!strategy) {
						// Also Read-in Indicators
						Indicator.find({owner: req.session.User.name}, function(err2, indicators) {
							if (err2) return next(err2);
							return res.view({
								strategy: {name: "", code: "", plotcode: "", description: ""},
								strategies: strategies,
								indicators: indicators
							});
						});
					} else {
						// Also Read-in Indicators
						Indicator.find({owner: req.session.User.name}, function(err2, indicators) {
							if (err2) return next(err2);
							return res.view({
								strategy: strategy,
								strategies: strategies,
								indicators: indicators
							});
						});
					}
				});	
			}
		});
	},
	
	show: function(req, res) {
		Strategy.find({owner: req.session.User.name}, function(err, strategies) {
			if (err) return next(err);
			res.view({
				strategies: strategies
			});
		});
	},
	
	sync: function(req, res) {
		Strategy.find({owner: "admin"}, function(err, strategies) {
			_.each(strategies, function(strategy) {
				Strategy.findOne({name_and_owner: strategy.name + "_" + req.session.User.name}, function(err2, found) {
					if (err2) return next(err2);
			
					if (found) {
						var strategyObj = {
							name: strategy.name,
						    code: strategy.code,
							plotcode: strategy.plotcode,
						    description: strategy.description,
							edited: strategy.edited
						}
						Strategy.update(found.id, strategyObj, function(err3, create) {
							if (err3) return next(err3);
						});
					} else {
						var strategyObj = {
							name: strategy.name,
						    code: strategy.code,
							plotcode: strategy.plotcode,
						    description: strategy.description,
							author: strategy.author,
							owner: req.session.User.name,
							name_and_owner: strategy.name + "_" + req.session.User.name,
							created: strategy.created,
							edited: moment().format("YYYY-MM-DD"),
							onsale: false,
							price: 0
						}
						Strategy.create(strategyObj, function(err3, create) {
							if (err3) return next(err3);
						});
					}
				});
			});
			return res.redirect('/strategy/show');
		});	
	},
	
	//process the info from edit view
	update: function(req, res, next) {
		
		var strategyObj = {
			name: req.param('strategy_name'),
		    description: req.param('strategy_description'),
			edited: moment().format("YYYY-MM-DD"),
		}
		
		Strategy.update(req.param('strategy_id'), strategyObj, function (err) {
			if (err) {
				return res.redirect('/strategy/show');
			}
			
			res.redirect('/strategy/show');
		});
	},
	
	create: function(req, res, next) {
		
		Strategy.findOne({name_and_owner: req.param('strategy_name') + "_" + req.param('author')}, function(err, found) {
			if (err) return next(err);
			
			if (found) {
				var strategyObj = {
					name: req.param('strategy_name'),
				    code: req.param('strategy_code'),
					plotcode: req.param('strategy_plotcode'),
				    description: req.param('strategy_description'),
					edited: moment().format("YYYY-MM-DD")
				}
				Strategy.update(found.id, strategyObj, function(err, strategy) {
					if (err) return next(err);
					res.redirect('/strategy/show');
				});
			} else {
				var strategyObj = {
					name: req.param('strategy_name'),
				    code: req.param('strategy_code'),
					plotcode: req.param('strategy_plotcode'),
				    description: req.param('strategy_description'),
					author: req.param('author'),
					owner: req.param('author'),
					name_and_owner: req.param('strategy_name') + "_" + req.param('author'),
					created: moment().format("YYYY-MM-DD"),
					edited: moment().format("YYYY-MM-DD"),
					onsale: false,
					price: 0
				}
				Strategy.create(strategyObj, function(err, strategy) {
					if (err) return next(err);
					res.redirect('/strategy/show');
				});
			}
		})
	},
	
	destroy: function(req, res, next) {
		Strategy.findOne(req.param('id'), function (err, strategy) {
			if (err) return next(err);
			if (!strategy) return next("Strategy doesn't exist.");
			Strategy.destroy(req.param('id'), function (err) {
				if (err) return next(err);
			});
			res.redirect('/strategy/show');
		});
	}
};

