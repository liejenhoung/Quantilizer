$(document).ready(function(){
	//Validate
	//http://bassistance.de/jquery-plugins/jquery-plugin-validation/
	//http://docs.jquery.com/Plugins/Validation/
	//http://docs.jquery.com/Plugins/Validation/validate#toptions
	
	$('#sign-up-form').validate({
		rules: {
			name: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			password: {
				minlength: 6,
			},
			confirmation: {
				minlength: 6,
				equalTo: "#password"
			}
		},
		success: function(element){
			element
			.text('OK!').addClass('valid')
		}
	});
	
	$('#indicator_submit').validate({
		rules: {
			name: {
				required: true
			},
			code: {
				required: true
			},
			description: {
				required: true
			}
		},
		success: function(element){
			element
			.text('OK!').addClass('valid')
		}
	});
});