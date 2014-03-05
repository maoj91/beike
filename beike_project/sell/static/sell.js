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
				$('#upload_status').html('Upload progress: ' + percent + '%' + message);
				$('#upload_status').show();
				isUploading = false;
			},
			onFinishS3Put: function(url) {
				imageNum = imageNum + 1;
				var current_name = $('#image_name'+imageNum).val(url);	
				//$('#upload_status').html('Upload completed. Uploaded to: '+ url);
				$('#upload_status').hide();
				selectImage(imageNum);
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

//3 months from now by default 
function setOpenUntil(){
	var date = new Date();
	var day = date.getDate();
	var currentMonth = date.getMonth() + 1;
	var month = date.getMonth() + 4;
	var year = date.getFullYear();
	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;
	var currentDate = year + "-" + currentMonth + "-" + day;
	var defaultDate = year + "-" + month + "-" + day;
	$('#open_until_date').attr("value",defaultDate);
	$('#open_until_date').attr("min",currentDate);
}

function initiatePage(){
	selectCondition(1);
	setOpenUntil();
}

function validateForm(){
	var msg = '';
	var isValid = false;
	var title = $('[name="title"]').val();
	var price = $('[name="price"]').val();
	var phone = $('[name="phone"]').val();
	var open_until_date = $('[name="open_until_date"]').val();
	var content = $('[name="content"]').val();
	var image1 = $('[name="image_name1"]').val();
	var image2 = $('[name="image_name2"]').val();
	var image3 = $('[name="image_name3"]').val();
	if(!title){
		msg = '输入项不能为空';
	} else if(!price){
		msg = '输入项不能为空';
	} else if(!phone){
		msg = '输入项不能为空';
	} else if(!open_until_date){
		msg = '输入项不能为空';
	} else if(!content){
		msg = '输入项不能为空';
	} else if(!isValidInteger(price)){
		msg = '请检查您输入的价格';
	} else if(image1=="" && image2=="" && image3==""){
		msg = '请至少上传一张图片';
	} else {
		isValid = true;
	}
	//TODO:need to validate phone number, price
	$('#validate_msg').html(msg);	
	return isValid;
}

function isValidInteger(str){
	return (!isNaN(str)) && (str.indexOf(".")==-1); 
}
