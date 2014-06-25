var emailChecked;

var isEmailChecked = false;
var isPhoneChecked = false;
var isQQChecked = false;

function clickPhoneContact() {
    if (isPhoneChecked) {
        $('#phone-icon').show();
        $('#phone-icon-clicked').hide();
        $('#phone_number_div').css('display', 'none');
        isPhoneChecked = false;
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

function clickQQContact() {
    if (isQQChecked) {
        $('#qq-icon').show();
        $('#qq-icon-clicked').hide();
        $('#qq_number_div').css('display', 'none');
        isQQChecked = false;
    } else {
        $('#qq-icon').hide();
        $('#qq-icon-clicked').show();
        $('#qq_number_div').css('display', 'inline');
        isQQChecked = true;
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
