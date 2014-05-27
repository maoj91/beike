function phoneContactChange() {
    var isChecked = $('#phone-checked').prop("checked");
    if (isChecked) {
        $('#phone_number_div').css('display', 'block');
    } else {
        $('#phone_number_div').css('display', 'none');
    }
}


function emailContactChange() {
    var isChecked = $('#email-checked').prop("checked");
    if (isChecked) {
        $('#email_div').css('display', 'block');
    } else {
        $('#email_div').css('display', 'none');
    }
}

function qqContactChange() {
    var isChecked = $('#qq-checked').prop("checked");
    if (isChecked) {
        $('#qq_number_div').css('display', 'block');
    } else {
        $('#qq_number_div').css('display', 'none');
    }
}

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
};