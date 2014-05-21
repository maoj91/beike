function phoneContactChange(){
	var isChecked = $('#phone-checked').prop( "checked" );
	if(isChecked){
		$('#phone_number_div').show();
	} else {
		$('#phone_number_div').hide();
	}
}


function emailContactChange(){
	var isChecked = $('#email-checked').prop( "checked" );
	if(isChecked){
		$('#email_div').show();
	} else {
		$('#email_div').hide();
	}
}

function qqContactChange(){
	var isChecked = $('#qq-checked').prop( "checked" );
	if(isChecked){
		$('#qq_number_div').show();
	} else {
		$('#qq_number_div').hide();
	}
}

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
};



