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

function validateForm(){
	var msg = '';
	var isValid = false;
	var title = $('[name="title"]').val();
	var min_price = $('[name="min_price"]').val();
	var max_price = $('[name="max_price"]').val();
	var phone = $('[name="phone"]').val();
	var open_until_date = $('[name="open_until_date"]').val();
	var content = $('[name="content"]').val();
	if(!title){
		msg = '输入项不能为空';
	} else if(!min_price){
		msg = '输入项不能为空';
	} else if(!max_price){
		msg = '输入项不能为空';
	} else if(!phone){
		msg = '输入项不能为空';
	} else if(!open_until_date){
		msg = '输入项不能为空';
	} else if(!content){
		msg = '输入项不能为空';
	} else if(!isValidInteger(min_price) || !isValidInteger(max_price)){
		msg = '请检查您输入的价格';
	} else if(parseInt(min_price) >= parseInt(max_price)){
		msg = '最低价应小于最高价';
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
