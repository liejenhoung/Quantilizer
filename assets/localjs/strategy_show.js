// Edit Strategy
function EditStrategy(id) {
	$('#strategy_show-name').val($('#strategy_show-edit_name_' + id).val()); 
	$('#strategy_show-description').val($('#strategy_show-edit_description_' + id).val()); 
	$('#strategy_show-id').val(id); 
	$('#strategy_show-Modal').modal('show');	
}

// Save Strategy
$('#strategy_show-form').submit(function(event){
	event.preventDefault();
	
 	// Define post json
 	var submitjson = {
 		strategy_id: $("#strategy_show-id").val(),
		strategy_name: $("#strategy_show-name").val(),
		strategy_description: $("#strategy_show-description").val(),
		_csrf: $("#_csrf").val()
 	};

 	// Get some values from elements on the page:
 	url = $('#strategy_show-form').attr("action");

 	$.ajax({
 		url: url,
 		type: 'POST', 
 		contentType: 'application/json', 
 		dataType: 'html',
 		data: JSON.stringify(submitjson),
 		cache: false,
 		success: function(data){
			window.location.replace("/strategy/show");
 		},
 		error: function(jqXHR, textStatus, err){
			if (!$("#strategy_show-errmsg").length) {
				$("#strategy_show-errdiv").append('<ul class="alert alert-success" id="strategy_show-errmsg"><a href="#" class="close" data-dismiss="alert">&times;</a><li>'+jqXHR.responseText+'</li></ul>');
			}				
 		} 
 	});	 
});