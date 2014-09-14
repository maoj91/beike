/****************************************
 *     Buy/Sell new form javascript     *
 ****************************************/
function chooseCondition(conditionNum) {
    if (conditionNum >= 0 && conditionNum < 4) {
        for (i = 0; i < 4; i++) {
            if (i == conditionNum) {
                $('#condition-' + i).hide();
                $('#condition-' + i + '-clicked').show();
                $("#condition-slider").val(conditionNum)
            } else {
                $('#condition-' + i).show();
                $('#condition-' + i + '-clicked').hide();
            }
        }
    }
}

var formLoader = (function($, undefined) {
    var loader = {},
        page, $page, 
        $latitude, $longitude,
        $zipcode, $cityName,
        isEmailChecked = false,
        isPhoneChecked = false,
        isSmsChecked = false;
    
    loader.init = function(initPage, $initPage) {
        console.log('form init');
        page = initPage;
        if ($initPage) 
            $page = $initPage;
        else
            $page = $('#'+page+'-form');
a=$page;
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');
        
        $('input:not([readonly], .image-uploader-input), textarea').focusin(function() { $('.footer').css('position', 'relative'); });
        $('input:not([readonly], .image-uploader-input), textarea').focusout(function() { $('.footer').css('position', 'fixed'); });
        
        isEmailChecked = false;
        isPhoneChecked = false;
        isSmsChecked = false;
        
        // add more validations here
        if (page === 'buy') {
            $page.find('form').validate({
                rules: {
                    phone_number: "digitonly",
                    zipcode: "digitonly"
                }
            });
        } else if (page === 'sell') {
            $page.find('form').validate({
            rules: {
                    phone_number: "digitonly",
                    zipcode: "digitonly"
                },
                submitHandler: function(form) {
                    if ($(form).valid() && $('#image_url0').valid())
                        form.submit();
                    return false; // prevent normal form posting
                }

            });
        }
        
        if (navigator.geolocation) {
            getCurrentPositionDeferred({
                enableHighAccuracy: true
            }).done(function(position) {
                getLocationByLatLon(position.coords)
            }).fail(function() {
                console.error("getCurrentPosition call failed")
            }).always(function() {
                //do nothing
            });
        } else {
            console.error("Geolocation is disabled.")
        }
        
        var $description = $page.find('#description'),
            $counter = $page.find('#lengthCounter');
        $counter.html($description.val().length + '/300');
        $description.bind('input propertychange', function() {
            $counter.html($description.val().length + '/300');
        });
    };
    
    var getLocationByLatLon = function(coords) {
        var latitude = coords.latitude;
        var longitude = coords.longitude;
        $latitude.val(latitude);
        $longitude.val(longitude);
        $.ajax({
            type: "get",
            url: "/user/get_info/get_zipcode_by_latlong",
            dataType: "json",
            data: {
                latitude: latitude,
                longitude: longitude
            }
        }).then(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city);
            console.log(data);
            return data;
        });
    };

    // Use user input zipcode to get the city and latlon
    loader.getLocationByZipcode = function() {
        var zipcode = $page.find('#zipcode').val();
        $.ajax({
            type: "get",
            url: "/user/get_info/get_latlong_by_zipcode",
            dataType: "json",
            data: { zipcode: zipcode }
        }).then(function(data) {
            $cityName.val(data.city);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            console.log(data);
            return data;
        });
    };
    
    loader.clickPhoneContact = function() {
        if (isPhoneChecked) {
            $page.find('#phone-icon').show();
            $page.find('#phone-icon-clicked').hide();
            isPhoneChecked = false;
            $page.find('#phone-checked').val('off');
            if(isSmsChecked){
                $page.find('#phone_number_div').css('display', 'block');
            } else{
                $page.find('#phone_number_div').css('display', 'none');
            } 
        } else {
            $page.find('#phone-icon').hide();
            $page.find('#phone-icon-clicked').show();
            $page.find('#phone_number_div').css('display', 'block');
            isPhoneChecked = true;
            $page.find('#phone-checked').val('on');
        }
    };

    loader.clickEmailContact = function() {
        if (isEmailChecked) {
            $page.find('#email-icon').show();
            $page.find('#email-icon-clicked').hide();
            $page.find('#email_div').css('display', 'none');
            isEmailChecked = false;
            $page.find('#email-checked').val('off');
        } else {
            $page.find('#email-icon').hide();
            $page.find('#email-icon-clicked').show();
            $page.find('#email_div').css('display', 'block');
            isEmailChecked = true;
            $page.find('#email-checked').val('on');
        }
    };

    loader.clickSmsContact = function() {
        if (isSmsChecked) {
            $page.find('#sms-icon').show();
            $page.find('#sms-icon-clicked').hide();
            if(isPhoneChecked){
                $page.find('#phone_number_div').css('display', 'block');
            } else{
                $page.find('#phone_number_div').css('display', 'none');
            } 
            isSmsChecked = false;
            $('#sms-checked').val('off');
        } else {
            $page.find('#sms-icon').hide();
            $page.find('#sms-icon-clicked').show();
            $page.find('#phone_number_div').css('display', 'block');
            isSmsChecked = true;
            $page.find('#sms-checked').val('on');
        }
    };
    
    return loader;
}(jQuery));

$(document).delegate('#buy-form', 'pagebeforeshow', function(event) {
    formLoader.init('buy');
});

$(document).delegate('#sell-form', 'pagebeforeshow', function(event) {
    formLoader.init('sell');
    gallerySwiper.init($('#sell-form-gallery'));
});
