var isUploading = false;

$(document).delegate("#user-update-page", "pageinit", function() {

	$('#post_image').fileupload({
	        url: "/s3/upload/",
	        dataType: 'json',
	        done: function(e, data) {
	            var imageInfo = {};
	            imageInfo['url'] = data.result.image_url;
	            imageInfo['width'] = data.result.width;
	            imageInfo['height'] = data.result.height;
	            imageInfo['orientation'] = data.result.orientation;
	            updateImage(imageInfo);
	            console.log(JSON.stringify(imageInfo));
	        },
	        progressall: function(e, data) {
	            var progress = parseInt(data.loaded / data.total * 100, 10);
	            $('#progressbar').show();
	            jQMProgressBar('progressbar').setValue(progress);
	            isUploading = true;
	            $('#image-uploader').attr("disabled", true);
	            $('#post_image').attr("disabled", true);
	        },
	        fail: function(e, data) {
	            alert("照片上传出错，请重试一次");
	        },
	        always: function(e, data) {
	            $('#progressbar').hide();
	            isUploading = false;
	            $('#image-uploader').attr("disabled", false);
	            $('#post_image').attr("disabled", false);
	        }
	});


	function updateImage(imageInfo) {        
		$('#image_url').val(imageInfo['url']);
	    $('#image_width').val(imageInfo['width']);
	    $('#image_height').val(imageInfo['height']);
	    $('#image_orientation').val(imageInfo['orientation']);
	    $('#profile_image').attr('src',imageInfo['url']);
	}

	$('#description').bind('input propertychange', function() {
        var contentLength = $('#description').val().length;
        var lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);
    });
});

function initLengthCounter(){
	var contentLength = $('#description').val().length;
   	var lengthCount = contentLength + "/" + 3000;
    $('#lengthCounter').text(lengthCount);
}


$(document).ready(function(){ 
	initLengthCounter();
});