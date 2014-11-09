/** 
 * Allow a logged-in user to edit and update his/her own profile
 * Allow admins to see everyone
 */

module.exports = function(req, res, next) {
	// If not signed in
	if (!req.session.User) {
		var noSigninError = [{name: 'noSignin', message: 'Please sign in.'}]
		req.session.flash = {
			err: noSigninError
		}
		res.redirect('/session/new');
		return;
	}
	
	// Signed in, check rights
	var sessionUserMatchesId = req.session.User.id === req.param('id');
	var isAdmin = req.session.User.admin;
	
	// The requested id does not match the user's id
	// and this is not an admin
	if (!(sessionUserMatchesId) && !isAdmin) {
		var noRightsError = [{name: 'noRights', message: 'You do not have right to access this page.'}]
		req.session.flash = {
			err: noRightsError
		}
		res.redirect('/session/new');
	}
	next();
};