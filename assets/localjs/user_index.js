$(document).ready(function() {
	
	var rawdata = JSON.parse($("#user_index-info").val());
	var dataSet = [];
	var csrf = $("#user_index-csrf").val();
			
	for(i=0;i<rawdata.length;i++) {
		dataSet.push([
			i+1,
			rawdata[i].name,
			rawdata[i].title,
			rawdata[i].email,
			rawdata[i].id,
			moment(rawdata[i].createdAt).format("YYYY-MM-DD"),
			'<a href="/user/show/'+rawdata[i].id+'"<span class="glyphicon glyphicon-search" aria-hidden="true"></span></a>',
			'<a href="/user/edit/'+rawdata[i].id+'"<span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>',
			'<form action="/user/destroy/'+rawdata[i].id+'" method="POST"><a href="javascript:void(0);" onclick="$(this).closest(\'form\').submit();"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a><input type="hidden" name="_csrf" value="'+csrf+'" /></form>'
		]);
	};
	
    $('#demo').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>' );
 
    $('#example').dataTable( {
        "data": dataSet,
        "columns": [
            { "title": "#" },
            { "title": "Name" },
            { "title": "Title" },
			{ "title": "Email" },
			{ "title": "Id" },
			{ "title": "Register" },
			{ "title": "" },
			{ "title": "" },
			{ "title": "" }
        ]
    });  
});


