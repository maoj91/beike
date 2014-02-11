function add_more(user_id){
	var i = $("[id^=div_image]").length; 
	if( i < 3){
		var lastDiv = $("#div_image"+i.toString());
		lastDiv.after("<div id='div_image"+(i+1).toString()+"'></div>");
		var newDiv = $('#div_image'+(i+1).toString());
		var hiddenId = 'image_name'+(i+1).toString();
		newDiv.append("<input type='hidden' id='"+hiddenId+"' val=''>");
	}
}

			

function get_image_name_prefix(i,user_id){
	var currentTime = Date.now();	
	var prefix = user_id+"/"+currentTime+"_"+i;
	return prefix;
}

function update_image_names(){
	var max = $("[id^=div_image]").length; 
	$('#image_names').val('');
	for(var i=1;i<=max;i++){
		var names = $('#image_names').val();
		var name = $('#image_name'+i.toString()).val();
		if(name != ''){
			if(names === ''){
				$('#image_names').val(name);
			}else{
				$('#image_names').val(names+";"+name);
			}
		}
	}
}

function image_s3_upload(file_dom_id,user_id){
	var i = $("[id^=div_image]").length; 
	var image_name_prefix = get_image_name_prefix(i,user_id);
	var s3upload = new S3Upload({
		file_dom_selector: file_dom_id,
		s3_sign_put_url: '/s3/sign/',
		s3_object_name_prefix: image_name_prefix,
		onProgress: function(percent, message) {
			$('#status').html('Upload progress: ' + percent + '%' + message);
		},
		onFinishS3Put: function(url) {
			var current_name = $('#image_name'+i).val(url);	
			update_image_names();
			$('#status').html('Upload completed. Uploaded to: '+ url);
			$("#preview").html('<img src="'+url+'" style="width:300px;" />');
			$('#current_image').attr('src',url);
		},
		onError: function(status) {
			$('#status').html('Upload error: ' + status);
		}
	    });
	add_more(user_id);
}



