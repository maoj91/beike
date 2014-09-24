/****************************************
 *     Buy/Sell new form javascript     *
 ****************************************/
var formLoader = (function($, undefined) {
    var page, $page,
        $latitude, $longitude,
        $zipcode, $cityName,
        $locState1, $locState2,
        $condition,
        isEmailChecked = false,
        isPhoneChecked = false,
        isSmsChecked = false;
    
    var init = function(initPage, $initPage) {
        console.log('form init');
        locUtil.getLocation();
        
        page = initPage;
        if ($initPage) 
            $page = $initPage;
        else
            $page = $('#'+page+'-form');
        
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');
        $locState1 = $page.find('.form-loc-state1').show();
        $locState2 = $page.find('.form-loc-state2').hide();
        $condition = $page.find('#condition-slider');

        chooseCondition($condition.val());

        // hide footer when user entering
/*
        $('input:not([readonly], .gallery-uploader-input), textarea').focusin(function() { 
            $('.footer').toggleClass('bottom');
            $('.ui-content').css('margin-bottom', '0px');
        });
        $('input:not([readonly], .gallery-uploader-input), textarea').focusout(function() {
            $('.footer').toggleClass('bottom');
            $('.ui-content').css('margin-bottom', '50px');
        });*/
        
        isEmailChecked = false;
        isPhoneChecked = false;
        isSmsChecked = false;
        
        var validateOptions = {
            ignore: '',
            focusCleanup: true,
            rules: {
                phone_number: 'digitonly',
                zipcode: 'digitonly'
            },
            errorPlacement: function(error, element) {
                element.attr('placeholder', error.html());
                element.addClass('hasError');
                if (element[0].id === 'zipcode') {
                    $locState1.hide();
                    $locState2.show();
                }
            }
        };
        // add more validations here
        if (page === 'buy') {
            $page.find('form').validate(validateOptions);
        } else if (page === 'sell') {
            $page.find('form').validate($.extend({
                submitHandler: function(form) {
                    if ($(form).valid() && $('#image_url0').valid())
                        form.submit();
                    return false; // prevent normal form posting
                }
            }, validateOptions));
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
    },
    changeLocation = function() {
        $locState1.hide();
        $locState2.show();
    },
    refreshLocation = function() {
        locUtil.refreshLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $locState1.show();
        $locState2.hide();
    },
    getLocationByZipcode = function() {
        locUtil.getLocByZip($zipcode.val(), function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $locState1.show();
        $locState2.hide();
    },
    clickPhoneContact = function() {
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
    },
    clickEmailContact = function() {
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
    },
    clickSmsContact = function() {
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
    },
    chooseCondition = function(conditionNum) {
        if (conditionNum >= 0 && conditionNum < 4) {
            for (i = 0; i < 4; i++) {
                if (i == conditionNum) {
                    $page.find('#condition-' + i).hide();
                    $page.find('#condition-' + i + '-clicked').show();
                    $page.find("#condition-slider").val(conditionNum)
                } else {
                    $page.find('#condition-' + i).show();
                    $page.find('#condition-' + i + '-clicked').hide();
                }
            }
        }
    };
    
    return {
        init: init,
        changeLocation: changeLocation,
        refreshLocation: refreshLocation,
        getLocationByZipcode: getLocationByZipcode,
        clickPhoneContact: clickPhoneContact,
        clickEmailContact: clickEmailContact,
        clickSmsContact: clickSmsContact,
        chooseCondition: chooseCondition
    };
}(jQuery));

