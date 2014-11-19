// Edit Indicator
function indicator_edit(id) {
	$('#indicator_name').val($('#indicator_edit_name_' + id).val()); 
	$('#indicator_description').val($('#indicator_edit_description_' + id).val()); 
	$('#indicator_id').val(id); 
	$('#indicator_edit_Modal').modal('show');	
}

// Save Indicator
$('#indicator_edit_submit').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {
 		indicator_id: $("#indicator_id").val(),
		indicator_name: $("#indicator_name").val(),
		indicator_description: $("#indicator_description").val(),
		_csrf: $("#_csrf").val()
 	};

 	// Get some values from elements on the page:
 	url = $('#indicator_edit_submit').attr("action");

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
			if (!$("#indicator_error_message").length) {
				$("#indicator_error_container").append('<ul class="alert alert-success" id="indicator_error_message"><a href="#" class="close" data-dismiss="alert">&times;</a><li>'+jqXHR.responseText+'</li></ul>');
			}				
 		} 
 	});	 
});