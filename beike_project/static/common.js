var emailChecked;

var isEmailChecked = false;
var isPhoneChecked = false;
var isSmsChecked = false;

function clickPhoneContact() {
    if (isPhoneChecked) {
        $('#phone-icon').show();
        $('#phone-icon-clicked').hide();
        isPhoneChecked = false;
        if(isSmsChecked){
            $('#phone_number_div').css('display', 'inline');
        } else{
            $('#phone_number_div').css('display', 'none');
        } 
    } else {
        $('#phone-icon').hide();
        $('#phone-icon-clicked').show();
        $('#phone_number_div').css('display', 'inline');
        isPhoneChecked = true;
    }
}

function clickEmailContact() {
    if (isEmailChecked) {
        $('#email-icon').show();
        $('#email-icon-clicked').hide();
        $('#email_div').css('display', 'none');
        isEmailChecked = false;
    } else {
        $('#email-icon').hide();
        $('#email-icon-clicked').show();
        $('#email_div').css('display', 'inline');
        isEmailChecked = true;
    }
}

function clickSmsContact() {
    if (isSmsChecked) {
        $('#sms-icon').show();
        $('#sms-icon-clicked').hide();
        if(isPhoneChecked){
            $('#phone_number_div').css('display', 'inline');
        } else{
            $('#phone_number_div').css('display', 'none');
        } 
        isSmsChecked = false;
    } else {
        $('#sms-icon').hide();
        $('#sms-icon-clicked').show();
        $('#phone_number_div').css('display', 'inline');
        isSmsChecked = true;
    }
}

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
};

$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");
