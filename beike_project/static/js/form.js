/****************************************
 *     Buy/Sell new form javascript     *
 ****************************************/
var formLocation = (function($, undefined) {
    var $page,
        $latitude, $longitude,
        $zipcode, $cityName,
        $locState1, $locState2,
        $cityId,
        loadingStr = '加载中...',
        noLocationStr = 'Oops, no locations!';
    var init = function($initPage) {
        locUtil.getLocation();
        
        $page = $initPage;
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');
        $cityId = $page.find('#city-id');
        $locState1 = $page.find('.form-loc-state1').show();
        $locState2 = $page.find('.form-loc-state2').hide();
        
        locUtil.getLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityId.val(data.city_id);
        });

        $zipcode.keypress(function (e) { 
            if (e.which == 13) {
                e.preventDefault();
                $(this).blur();
                getLocationByZipcode();
            }
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
        $zipcode.focus();
    },
    refreshLocation = function() {
        $cityName.attr('placeholder', loadingStr);
        locUtil.refreshLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityName.attr('placeholder', noLocationStr);
            $cityId.val(data.city_id);
        }, function() {
            $zipcode.val('');
            $cityName.val('');
            $latitude.val('');
            $longitude.val('');
            $cityName.attr('placeholder', noLocationStr);
            $cityId.val('');
        });
        $locState1.show();
        $locState2.hide();
    },
    getLocationByZipcode = function() {
        $cityName.attr('placeholder', loadingStr);
        locUtil.getLocByZip($zipcode.val(), function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityName.attr('placeholder', noLocationStr);
            $cityId.val(data.city_id);
        }, function() {
            $zipcode.val('');
            $cityName.val('');
            $latitude.val('');
            $longitude.val('');
            $cityName.attr('placeholder', noLocationStr);
            $cityId.val('');
        });
        $locState1.show();
        $locState2.hide();
    };
        
    return {
        init: init,
        changeLocation: changeLocation,
        refreshLocation: refreshLocation,
        getLocationByZipcode: getLocationByZipcode
    }
}(jQuery));

var formLoader = (function($, undefined) {
    var page, $page,
        $condition,
        isEmailChecked = false,
        isPhoneChecked = false,
        isSmsChecked = false;
    
    var init = function(initPage, $initPage) {
        console.log('form init');
        
        page = initPage;
        if ($initPage) 
            $page = $initPage;
        else
            $page = $('#'+page+'-form');
        
        formLocation.init($page);
        
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
        clickPhoneContact: clickPhoneContact,
        clickEmailContact: clickEmailContact,
        clickSmsContact: clickSmsContact,
        chooseCondition: chooseCondition
    };
}(jQuery));

/******************************************
**    User info/edit                
******************************************/
var userLoader = (function($, undefined) {
    var page, $page;
    var init = function(initPage) {
        console.log('user loader init');
        
        page = initPage;
        $page = $('#user-update-page');
        
        formLocation.init($page);

        
        var $uploader = $page.find('.gallery-uploader-input'),
            uploadOptions = {
            url: "/s3/upload/",
            dataType: 'json',
            done: function(e, data) {
                addImage(data.result);
                //console.log(JSON.stringify(imagesInfo[nImg]));
            },
            progressall: function(e, data) {
                //var pct = parseInt(data.loaded / data.total * 100, 10);
                //$uploader.attr('disabled','true');
                //$progressbar.css('width', pct+"%");
            },
            fail: function() { alert("照片上传出错，请重试一次"); },
            always: function() {
                $uploader.removeAttr('disabled');
                //$progressbar.css('width','0');
            }
        };
        $uploader.fileupload(uploadOptions);
        
        /*
        var isUploading = false;
        $('#post_image').fileupload({
            url: "/s3/upload/",
            dataType: 'json',
            done: function(e, data) {
                var imageInfo = {};
                imageInfo['url'] = data.result.image_url;
                imageInfo['width'] = data.result.width;
                imageInfo['height'] = data.result.height;
                imageInfo['orientation'] = data.result.orientation;
                $('#image_url').val(imageInfo['url']);
                $('#image_width').val(imageInfo['width']);
                $('#image_height').val(imageInfo['height']);
                $('#image_orientation').val(imageInfo['orientation']);
                $('#profile_image').attr('src',imageInfo['url']);
                console.log(JSON.stringify(imageInfo));
            },
            progressall: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('.progressbar').show();
                jQMProgressBar('progressbar').setValue(progress);
                isUploading = true;
                $('#image-uploader').attr("disabled", true);
                $('#post_image').attr("disabled", true);
            },
            fail: function(e, data) {
                alert("照片上传出错，请重试一次");
            },
            always: function(e, data) {
                //$('.progressbar').hide();
                isUploading = false;
                $('#image-uploader').attr("disabled", false);
                $('#post_image').attr("disabled", false);
            }
        });*/
    },
    addImage = function(imageInfo) {
        var url = imageInfo.image_url;
        $page.find('.user-image').attr('src', url);
        $page.find('#image_url').val(url);
        $page.find('#image_width').val(imageInfo.width);
        $page.find('#image_height').val(imageInfo.height);
        //$('#image_orientation').val(imageInfo['orientation']);
    };
    
    return { init: init };
}(jQuery));
