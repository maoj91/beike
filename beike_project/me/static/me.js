//whether it is in the process of uploading
var isUploading = false;
var currentCondition = 1;

function getImageDimensionInfo(file_dom_id){
	    var imgInfo = {};
		//get and set orientation info
		var fileId = "#"+file_dom_id;
		var file = $(fileId)[0].files[0];
		var fr   = new FileReader;
		fr.onloadend = function() {
			var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
			if(typeof exif.PixelXDimension != 'undefined'){
				imgInfo['width'] =  exif.PixelXDimension;
			} else {
				imgInfo['width'] = 1;
			}

			if(typeof exif.PixelXDimension != 'undefined'){
				imgInfo['height'] =  exif.PixelYDimension;
			} else {
				imgInfo['height'] = 1;
			}		
		};
		fr.readAsBinaryString(file);
		return imgInfo
}

function get_image_name_prefix(user_id){
	var currentTime = Date.now();	
	var prefix = user_id+"/"+currentTime;
	return prefix;
}

function image_s3_upload(file_dom_id,user_id){
	if (!isUploading){
		//retrieve the image information. e.g. width, height
		var imgInfo = getImageDimensionInfo(file_dom_id);
		//retrieve the image prefix for S3 upload
		var image_name_prefix = get_image_name_prefix(user_id);
		//upload it to s3
		var s3upload = new S3Upload({
			file_dom_selector: file_dom_id,
			s3_sign_put_url: '/s3/sign/',
			s3_object_name_prefix: image_name_prefix,
			onProgress: function(percent, message) {
				$('#upload_status').html('Uploaded ' + percent + '%');
				$('#upload_status').show();
				isUploading = true;
			},
			onFinishS3Put: function(url) {
				//set the url in the hidden input
				$('#image_url').val(url);
				$('#image_width').val(imgInfo['width']);
				$('#image_height').val(imgInfo['height']);
				$('#upload_status').hide();
				//populate the image information in HTML for form submit
				selectImage(imgInfo);
				isUploading = false;
			},
			onError: function(status) {
				$('#upload_status').html('Upload error: ' + status);
				$('#upload_status').show();
				isUploading = false;
			}
		});
	}
}

function selectImage(imgInfo){
			var url = $('#image_url').val();
			$('#current_image').attr('src',url);
			var imgOrientation = 1;
			if(imgInfo['width'] > 0 && imgInfo['height'] > 0){
				imgOrientation = imgInfo['width'].toFixed(2)/imgInfo['height'].toFixed(2);
			}
			if(imgOrientation >= 1){
				$('#current_image').removeClass('landscape_image');
				$('#current_image').removeClass('potrait_image');
				$('#current_image').addClass('potrait_image');
			} else{
				$('#current_image').removeClass('landscape_image');
				$('#current_image').removeClass('potrait_image');
				$('#current_image').addClass('landscape_image');
			}
		
}

function initiatePage(){
	$("#current_image").click(function(e){
		e.preventDefault();
		$("input[type=file]").trigger("click");
	});
}

function displayUserImage(image_info_string) {
	var image_info_list = jQuery.parseJSON(image_info_string);
    if (image_info_list.length > 0) {
        //only display the first image
		image_info = image_info_list[0];
	} else {
		image_info = undefined;
	}
	var isHorizontal = true;
	if (image_info['height'] > image_info['width']) {
		isHorizontal = false;
	}
	$('#current_image').attr("src",image_info['image_url']);
};


