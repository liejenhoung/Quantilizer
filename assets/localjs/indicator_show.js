// Edit Indicator
function EditIndicator(id) {
	$('#indicator_show-name').val($('#indicator_show-edit_name_' + id).val()); 
	$('#indicator_show-description').val($('#indicator_show-edit_description_' + id).val()); 
	$('#indicator_show-id').val(id); 
	$('#indicator_show-Modal').modal('show');	
}

// Save Indicator
$('#indicator_show-form').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {
 		indicator_id: $("#indicator_show-id").val(),
		indicator_name: $("#indicator_show-name").val(),
		indicator_description: $("#indicator_show-description").val(),
		_csrf: $("#_csrf").val()
 	};

 	// Get some values from elements on the page:
 	url = $('#indicator_show-form').attr("action");

 	$.ajax({
 		url: url,
 		type: 'POST', 
 		contentType: 'application/json', 
 		dataType: 'html',
 		data: JSON.stringify(submitjson),
 		cache: false,
 		success: function(data){
			window.location.replace("/indicator/show");
 		},
 		error: function(jqXHR, textStatus, err){
			if (!$("#indicator_show-errmsg").length) {
				$("#indicator_show-errdiv").append('<ul class="alert alert-success" id="indicator_show-errmsg"><a href="#" class="close" data-dismiss="alert">&times;</a><li>'+jqXHR.responseText+'</li></ul>');
			}				
 		} 
 	});	 
});