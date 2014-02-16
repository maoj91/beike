var imageNum = 0;
var isUploading = false;
var currentIndex = 0;
var currentCondition = 1;


function get_image_name_prefix(user_id){
	var currentTime = Date.now();	
	var prefix = user_id+"/"+currentTime;
	return prefix;
}


function image_s3_upload(file_dom_id,user_id){
	if (!isUploading && imageNum<3){
		var image_name_prefix = get_image_name_prefix(user_id);
		var s3upload = new S3Upload({
			file_dom_selector: file_dom_id,
			s3_sign_put_url: '/s3/sign/',
			s3_object_name_prefix: image_name_prefix,
			onProgress: function(percent, message) {
				$('#status').html('Upload progress: ' + percent + '%' + message);
				isUploading = false;
			},
			onFinishS3Put: function(url) {
				imageNum = imageNum + 1;
				var current_name = $('#image_name'+imageNum).val(url);	
				$('#status').html('Upload completed. Uploaded to: '+ url);
				selectImage(imageNum);
				isUploading = false;
			},
			onError: function(status) {
				$('#status').html('Upload error: ' + status);
				isUploading = false;
			}
		    });
	}
}

function selectImage(i){
	if(i<=imageNum){
		currentIndex = i;
		var url = $('#image_name'+currentIndex).val();
		$('#preview'+currentIndex).attr('src',url);
		//cleaer all border
		for(var j=1;j<=3;j++){
			$('#preview'+j).css("border","none");
		}
		$('#preview'+currentIndex).css("border","1px solid black");
		$('#current_image').attr('src',url);
	}
}

function deleteImage(){
	for(var j=currentIndex;j<imageNum;j++){
		var nextIndex = j+1;
		var url = $('#image_name'+nextIndex).val();
		$('#image_name'+j).val(url);
		$('#preview'+j).attr('src',url);
	}
	$('#image_name'+imageNum).val('');
	$('#preview'+imageNum).attr('src','');
	if(currentIndex==imageNum){
		selectImage(imageNum-1);
	}else{
		selectImage(currentIndex);
	}	
	imageNum--;
}

function selectCondition(i){
	//cleaer all border
	for(var j=1;j<=6;j++){
		$('#condition'+j).css("border","none");
	}
	$('#condition'+i).css("border","1px solid black");
	$('#my_condition').val(i);
}
