/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	'new': function(req, res) {
		res.view();
	},
	
	create: function(req, res, next) {
		
		var userObj = {
			name: req.param('name'),
			title: req.param('title'),
			email: req.param('email'),
			password: req.param('password'),
			confirmation: req.param('confirmation')
		}
		
		//Create a User with the params set from the sign-up form --> new.ejs
		User.create( userObj, function userCreated (err, user) {
			
			//If there's an error
			//if (err) return next(err);
			
			if (err) {
				console.log(err);
				req.session.flash = {
					err: err
				}
				
			
			//If error redirect back to sign-up page
				return res.redirect('/user/new');
			}
			
			//Log user in
			req.session.authenticated = true;
			req.session.User = user;
			
			//Change status to online
			user.online = true;
			user.save(function(err, user) {
				if (err) return next(err);
	
				//After successfully creating the user
				//Redirect to the show action
				//From ep1-6: res.json(user);
			
				res.redirect('/user/show/'+user.id);	
			});
		});
	},
	
	//render the profile view (e.g. /views/show.ejs)
	show: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser (err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({
				user: user
			});
		});
	},
	
	index: function(req, res, next) {
		
		//Get an array of all users in the User Collection (e.g. table)
		User.find(function foundUsers (err, users) {
			if (err) return next(err);
			//pass the array down to the /views/index.ejs page
			res.view({
				users: users
			});
		});
	},
	
	edit: function(req, res, next) {
		//Find the user from the id passed in via params
		User.findOne(req.param('id'), function foundUser (err, user) {
			if (err) return next(err);
			if (!user) return next("User doesn't exist.");
			res.view({
				user: user
			});
		});
	},
	
	//process the info from edit view
	update: function(req, res, next) {
		
		if (req.session.User.admin) {
			var userObj = {
				name: req.param('name'),
				title: req.param('title'),
				email: req.param('email'),
				admin: req.param('admin')
			}
		} else {
			var userObj = {
				name: req.param('name'),
				title: req.param('title'),
				email: req.param('email')
			}
		}
		
		User.update(req.param('id'), userObj, function userUpdated (err) {
			if (err) {
				return res.redirect('/user/edit/' + req.param('id'));
			}
			
			res.redirect('/user/show/' + req.param('id'));
		});
	},
	
	destroy: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser (err, user) {
			if (err) return next(err);
			if (!user) return next("User doesn't exist.");
			User.destroy(req.param('id'), function userDestroyed(err) {
				if (err) return next(err);
			});
			res.redirect('/user');
		});
	}
};

