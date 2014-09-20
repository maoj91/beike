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
        $('.form-loc-state1').show();
        $('.form-loc-state2').hide();
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');

        chooseCondition($("#condition-slider").val());

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
                    $('.ui-page-active').find('.form-loc-state1').hide();
                    $('.ui-page-active').find('.form-loc-state2').show();
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
    };
    
    loader.changeLocation = function() {
        $('.ui-page-active').find('.form-loc-state1').hide();
        $('.ui-page-active').find('.form-loc-state2').show();
    };
    
    loader.refreshLocation = function() {
        locUtil.refreshLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $('.ui-page-active').find('.form-loc-state1').show();
        $('.ui-page-active').find('.form-loc-state2').hide();
    };

    // Use user input zipcode to get the city and latlon
    loader.getLocationByZipcode = function() {
        locUtil.getLocByZip($zipcode.val(), function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
        });
        $('.ui-page-active').find('.form-loc-state1').show();
        $('.ui-page-active').find('.form-loc-state2').hide();
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
    //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();});
});

$(document).delegate('#buy-form', 'pageshow', function(event) {
/*
WeixinApi.ready(function(Api) {
var wxData = {
"appId": "", // 服务号可以填写appId
"imgUrl" : 'http://www.baidufe.com/fe/blog/static/img/weixin-qrcode-2.jpg',
"link" : 'http://www.baidufe.com',
"desc" : '大家好，我是Alien',
"title" : "大家好，我是赵先烈"
};

var wxCallbacks = {
ready : function() {
//alert("准备分享");
},
cancel : function(resp) {
//alert("分享被取消，msg=" + resp.err_msg);
},
fail : function(resp) {
//alert("分享失败，msg=" + resp.err_msg);
},
confirm : function(resp) {
//alert("分享成功，msg=" + resp.err_msg);
},
all : function(resp,shareTo) {
//alert("分享" + (shareTo ? "到" + shareTo : "") + "结束，msg=" + resp.err_msg);
}
};

Api.shareToFriend(wxData, wxCallbacks);
Api.shareToTimeline(wxData, wxCallbacks);
Api.shareToWeibo(wxData, wxCallbacks);
Api.generalShare(wxData,wxCallbacks);
WeixinApi.hideOptionMenu();
WeixinApi.showOptionMenu();
WeixinApi.hideToolbar();
WeixinApi.showToolbar();
});*/
});

$(document).delegate('#sell-form', 'pagebeforeshow', function(event) {
    formLoader.init('sell');
    //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();});
    gallerySwiper.init($('#sell-form-gallery'));
});
