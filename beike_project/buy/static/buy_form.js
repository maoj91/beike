/*
 * Use HTML geolocation to get to latlon
 * Then use ajax call to get the zipcode and city
 */
function getLocationByLatLonForBuyForm(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $("#buy_form_latitude").val(latitude);
    $("#buy_form_longitude").val(longitude);
    $.ajax({
        type: "get",
        url: "/user/get_info/get_zipcode_by_latlong",
        dataType: "json",
        data: {
            latitude: latitude,
            longitude: longitude
        }
    }).then(function(data) {
        $('#buy_form_zipcode').val(data['zipcode']);
        $('#buy_form_city_name').val(data['city']);
        console.log(data);
    });
}

/*
 * Use user input zipcode to get the city and latlon
 */
function getLocationByZipcodeForBuyForm() {
    var zipcode = $("#buy_form_zipcode").val();
    $.ajax({
        type: "get",
        url: "/user/get_info/get_latlong_by_zipcode",
        dataType: "json",
        data: {
            zipcode: zipcode
        }
    }).then(function(data) {
        console.log(data);
        $('#buy_form_city_name').val(data['city']);
        $('#buy_form_latitude').val(data['latitude']);
        $('#buy_form_longitude').val(data['longitude']);
    });
}

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
};

$(document).delegate("#buy-form", "pageinit", function(event) {
    $('form').validate({
        rules: {
            phone_number: "digitonly",
            zipcode: "digitonly"
        }
    });
    isEmailChecked = false;
    isPhoneChecked = false;
    isSmsChecked = false;
    if (navigator.geolocation) {
        getCurrentPositionDeferred({
            enableHighAccuracy: true
        }).done(function(position) {
            getLocationByLatLonForBuyForm(position)
        }).fail(function() {
            console.log("getCurrentPosition call failed")
        }).always(function() {
            //do nothing
        });
    } else {
        alert("Geolocation is disabled.")
    }
    $('#content').bind('input propertychange', function() {
        contentLength = $('#content').val().length;
        lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);
    });
});
