function add_more(position,user_id){
	var i = $("[id^=div_image]").length; 
	if( i < 3 && i==position){
		var lastDiv = $("#div_image"+i.toString());
		lastDiv.after("<div id='div_image"+(i+1).toString()+"'></div>");
		var newDiv = $('#div_image'+(i+1).toString());
		var inputId = 'image'+(i+1).toString();
		var hiddenId = 'image_name'+(i+1).toString();
		var progressId = 'progress'+(i+1).toString();
		var statusId = 'status'+(i+1).toString();
		var previewId = 'preview'+(i+1).toString();
		newDiv.append("<input type='file' id='"+inputId+"' onchange=image_s3_upload(this.id,'"+user_id+"')>");
		newDiv.append("<input type='hidden' id='"+hiddenId+"' val=''>");
		newDiv.append("<p id='"+progressId+"'>");
		newDiv.append("<p id='"+statusId+"'>");
		newDiv.append("<p id='"+previewId+"'>");
	}
}

			

function get_image_name_prefix(i,user_id){
	var currentTime = Date.now();	
	var prefix = user_id+"/"+currentTime+"_"+i;
	return prefix;
}

function update_image_names(){
	var max = $("[id^=div_image]").length; 
	console.log(max.toString()+" max");
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
	var i = file_dom_id[file_dom_id.length-1];
	var image_name_prefix = get_image_name_prefix(i,user_id);
	var s3upload = new S3Upload({
		file_dom_selector: file_dom_id,
		s3_sign_put_url: '/s3/sign/',
		s3_object_name_prefix: image_name_prefix,
		onProgress: function(percent, message) {
			$('#status'+i).html('Upload progress: ' + percent + '%' + message);
		},
		onFinishS3Put: function(url) {
			var current_name = $('#image_name'+i).val(url);	
			update_image_names();
			$('#status'+i).html('Upload completed. Uploaded to: '+ url);
			$("#preview"+i).html('<img src="'+url+'" style="width:300px;" />');
		},
		onError: function(status) {
			$('#status'+i).html('Upload error: ' + status);
		}
	    });
	add_more(i, user_id);
}


$(document).delegate("#sellpost-edit", "pageinit", function() {

	$('#content').bind('input propertychange', function() {
        var contentLength = $('#content').val().length;
        var lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);
    });
});

function initLengthCounter(){
	var contentLength = $('#content').val().length;
   	var lengthCount = contentLength + "/" + 3000;
    $('#lengthCounter').text(lengthCount);
}


$(document).ready(function(){ 
	initLengthCounter();
});



