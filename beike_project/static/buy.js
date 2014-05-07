function initiatePage(){
	// $('#email-checked').prop( "checked", true).checkboxradio('refresh');
}

function validateBuyForm(){
	var titleExist = false;
	var priceValid = false;
	var phoneValid = true;
	var qqValid = true;

	var title = $('[name="title"]').val();
	var min_price = $('[name="min_price"]').val();
	var max_price = $('[name="max_price"]').val();
	
	var phone_checked = $("#phone-checked").prop( "checked" )
	var qq_checked = $("#qq-checked").prop( "checked" )
	var phone_number = $('[name="phone_number"]').val();	
	var qq_number = $('[name="qq_number"]').val();
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
		

	if(phone_checked){
		if(!phone_number){
			phoneValid = false;
			$('#phone_required').html('请提供电话号码');
		} else {
			$('#phone_required').html('');
		}
	}

	if(qq_checked){
		if(!qq_number){
			qqValid = false;
			$('#qq_required').html('请提供QQ号码，对方可添加您为微信好友');
		} else {
			$('#qq_required').html('');
		}		
	}
	return titleExist && priceValid && phoneValid && qqValid;
}

function isValidInteger(str){
	return (!isNaN(str)) && (str.indexOf(".")==-1); 
}







