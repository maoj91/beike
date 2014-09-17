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
        locUtil.getLocation();
        
        page = initPage;
        if ($initPage) 
            $page = $initPage;
        else
            $page = $('#'+page+'-form');
        $('.form-loc-1').show();
        $('.form-loc-2').hide();
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');
        
        // hide footer when user entering
        $('input:not([readonly], .gallery-uploader-input), textarea').focusin(function() { 
            $('.footer').toggleClass('bottom');
            $('.ui-content').css('margin-bottom', '0px');
        });
        $('input:not([readonly], .gallery-uploader-input), textarea').focusout(function() {
            $('.footer').toggleClass('bottom');
            $('.ui-content').css('margin-bottom', '50px');
        });
        
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
        
        locUtil.getLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });

        var $description = $page.find('#description'),
            $counter = $page.find('#lengthCounter');
        $counter.html($description.val().length + '/300');
        $description.bind('input propertychange', function() {
            $counter.html($description.val().length + '/300');
        });
    };
    
    loader.changeLocation = function() {
        $('.ui-page-active').find('.form-loc-1').hide();
        $('.ui-page-active').find('.form-loc-2').show();
    };
    
    loader.refreshLocation = function() {
        locUtil.refreshLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $('.ui-page-active').find('.form-loc-1').show();
        $('.ui-page-active').find('.form-loc-2').hide();
    };

    // Use user input zipcode to get the city and latlon
    loader.getLocationByZipcode = function() {
        locUtil.getLocByZip($zipcode.val(), function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $('.ui-page-active').find('.form-loc-1').show();
        $('.ui-page-active').find('.form-loc-2').hide();
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
