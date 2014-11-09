/** 
 * Allow a logged-in user to see his/her own or others profile
 * Allow admins to see everyone
 */

module.exports = function(req, res, next) {
	if (!req.session.User) {
		var noSigninError = [{name: 'noSignin', message: 'Please sign in.'}]
		req.session.flash = {
			err: noSigninError
		}
		res.redirect('/session/new');
		return;
	}
	
	next();
};