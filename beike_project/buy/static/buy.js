function initiatePage(){
	setOpenUntil();
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

function validateBuyForm(){

	var titleExist = false;
	var priceValid = false;

	var title = $('[name="title"]').val();
	var min_price = $('[name="min_price"]').val();
	var max_price = $('[name="max_price"]').val();
	var phone = $('[name="phone"]').val();
	var content = $('[name="content"]').val();
	if(!title){
		$('#title_required').html('输入项不能为空');
	} else {
		titleExist = true;
	}
	if(!min_price){
		$('#price_required').html('输入项不能为空');
	} else if(!max_price){
		$('#price_required').html('输入项不能为空');
	} else if(!isValidInteger(min_price) || !isValidInteger(max_price)){
		$('#price_required').html('请检查您输入的价格');
	} else if(parseInt(min_price) >= parseInt(max_price)){
		$('#price_required').html('最低价应小于最高价');
	} else {
		priceValid = true;
	}
	
	return titleExist && priceValid;
}

function isValidInteger(str){
	return (!isNaN(str)) && (str.indexOf(".")==-1); 
}


function phoneContactChange(){
	var isChecked = $('#phone-contact').prop( "checked" );
	if(isChecked){
		$('#mobile_number_div').show();
	} else {
		$('#mobile_number_div').hide();
	}
}


function qqContactChange(){
	var isChecked = $('#qq-contact').prop( "checked" );
	if(isChecked){
		$('#qq_number_div').show();
	} else {
		$('#qq_number_div').hide();
	}
}


