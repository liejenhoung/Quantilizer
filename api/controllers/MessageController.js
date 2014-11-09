/**
 * MessageController
 *
 * @description :: Server-side logic for managing Messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	send: function(req, res, next) {
		var msg = {
		    fromUser: req.param('fromUser'),
			fromUsername: req.param('fromUsername'),
		    toUser: req.param('toUser'),
		    title: req.param('title'),
		    body: req.param('body'),
		    haveReaded: false
		}

		Message.create(msg).exec(function(err, msg){
		    if (err) return next(err);
			res.redirect('/message/inbox/' + req.session.User.id);
		});
	},
	
	'new': function(req, res, next) {
		//Find the user from the id passed in via params
		User.findOne(req.param('id'), function foundUser (err, user) {
			if (err) return next(err);
			if (!user) return next("User doesn't exist.");
			res.view({
				user: user
			});
		});
	},
	
	inbox: function(req, res, next) {
		Message.find().where({ toUser: req.param('id') })
		.exec(function(err, messages) {
		    res.view({
		    	messages: messages
		    });
		});
	},
	
	show: function(req, res, next) {
		var msgObj = {
		    haveReaded: true
		}
		
		Message.findOne(req.param('id'), function foundMessage (err, message) {
			if (err) return next(err);
			if (!message) return next();
			
			// Update the message to read
			Message.update(req.param('id'), msgObj, function messageUpdated (err) {
				if (err) {
					return res.redirect('/message/inbox/' + req.session.User.id);
				}
			});
			
			res.view({
				message: message
			});
		});
	},
	
	destroy: function(req, res, next) {
		Message.findOne(req.param('id'), function foundUser (err, message) {
			if (err) return next(err);
			if (!message) return next("Message doesn't exist.");
			Message.destroy(req.param('id'), function messageDestroyed(err) {
				if (err) return next(err);
			});
			res.redirect('/message/inbox/' + req.session.User.id);
		});
	}
};

