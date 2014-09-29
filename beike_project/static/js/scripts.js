// common.js
var a;

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
}

function formatDistance(dis) {
    if (dis > 1000) {
        dis = (dis / 1000).toFixed(2) + "k";
    }
    return dis;
}

function formatPrice(price) {
    var i = parseFloat(price),
        s = i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (s.indexOf('.') < 0) { s += '.00'; }
    if (s.indexOf('.') == (s.length - 2)) { s += '0'; }
    return s;
}

	
function convert_state(name, to) {
    var name = name.toUpperCase();
    var states = new Array(
        {'name':'Alabama', 'abbrev':'AL'},          {'name':'Alaska', 'abbrev':'AK'},
        {'name':'Arizona', 'abbrev':'AZ'},          {'name':'Arkansas', 'abbrev':'AR'},         {'name':'California', 'abbrev':'CA'},
        {'name':'Colorado', 'abbrev':'CO'},         {'name':'Connecticut', 'abbrev':'CT'},      {'name':'Delaware', 'abbrev':'DE'},
        {'name':'Florida', 'abbrev':'FL'},          {'name':'Georgia', 'abbrev':'GA'},          {'name':'Hawaii', 'abbrev':'HI'},
        {'name':'Idaho', 'abbrev':'ID'},            {'name':'Illinois', 'abbrev':'IL'},         {'name':'Indiana', 'abbrev':'IN'},
        {'name':'Iowa', 'abbrev':'IA'},             {'name':'Kansas', 'abbrev':'KS'},           {'name':'Kentucky', 'abbrev':'KY'},
        {'name':'Louisiana', 'abbrev':'LA'},        {'name':'Maine', 'abbrev':'ME'},            {'name':'Maryland', 'abbrev':'MD'},
        {'name':'Massachusetts', 'abbrev':'MA'},    {'name':'Michigan', 'abbrev':'MI'},         {'name':'Minnesota', 'abbrev':'MN'},
        {'name':'Mississippi', 'abbrev':'MS'},      {'name':'Missouri', 'abbrev':'MO'},         {'name':'Montana', 'abbrev':'MT'},
        {'name':'Nebraska', 'abbrev':'NE'},         {'name':'Nevada', 'abbrev':'NV'},           {'name':'New Hampshire', 'abbrev':'NH'},
        {'name':'New Jersey', 'abbrev':'NJ'},       {'name':'New Mexico', 'abbrev':'NM'},       {'name':'New York', 'abbrev':'NY'},
        {'name':'North Carolina', 'abbrev':'NC'},   {'name':'North Dakota', 'abbrev':'ND'},     {'name':'Ohio', 'abbrev':'OH'},
        {'name':'Oklahoma', 'abbrev':'OK'},         {'name':'Oregon', 'abbrev':'OR'},           {'name':'Pennsylvania', 'abbrev':'PA'},
        {'name':'Rhode Island', 'abbrev':'RI'},     {'name':'South Carolina', 'abbrev':'SC'},   {'name':'South Dakota', 'abbrev':'SD'},
        {'name':'Tennessee', 'abbrev':'TN'},        {'name':'Texas', 'abbrev':'TX'},            {'name':'Utah', 'abbrev':'UT'},
        {'name':'Vermont', 'abbrev':'VT'},          {'name':'Virginia', 'abbrev':'VA'},         {'name':'Washington', 'abbrev':'WA'},
        {'name':'West Virginia', 'abbrev':'WV'},    {'name':'Wisconsin', 'abbrev':'WI'},        {'name':'Wyoming', 'abbrev':'WY'}
    );
    var returnthis = false;
    $.each(states, function(index, value){
        if (to == 'name') {
            if (value.abbrev == name){
                returnthis = value.name;
                return false;
            }
        } else if (to == 'abbrev') {
            if (value.name.toUpperCase() == name){
                returnthis = value.abbrev;
                return false;
            }
        }
    });
    return returnthis;
}

$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");

// location utility
var locUtil = (function($, undefined) {
    var hasLocation = false,
        locData = {
            latitude: null, longitude: null, 
            city: null, city_id: null, state: null, zipcode: null
        },
        defaultCallback = function(data) { console.log(data); },
    getCurrentLocationDeferred = function(options) {
        var deferred = $.Deferred();
        navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
        return deferred.promise();
    },
    getLocByZip = function(zipcode, callback, failCallback) {
        $.ajax({
            type: "get",
            url: "/user/get_info/get_location_by_zipcode",
            dataType: "json",
            data: { zipcode: zipcode }
        }).then(function(data) {
            hasLocation = true;
            locData.zipcode = zipcode;
            locData.city = data.city;
            locData.state = convert_state(data.state,'abbrev');
            locData.latitude = data.latitude;
            locData.longitude = data.longitude;
            locData.city_id = data.city_id
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        }).fail(function() {
            hasLocation = false;
            console.error("getLocation call failed");
            if (failCallback && failCallback.apply !== undefined)
                failCallback.apply(null);
        });
    },
    getLocByLatLon = function(latlon, callback) {
        locData.latitude = latlon.latitude;
        locData.longitude = latlon.longitude;
        $.ajax({
            type: "get",
            url: "/user/get_info/get_location_by_latlong",
            dataType: "json",
            data: {
                latitude: latlon.latitude,
                longitude: latlon.longitude
            }
        }).then(function(data) {
            hasLocation = true;
            locData.city = data.city;
            locData.city_id = data.city_id
            locData.state = convert_state(data.state,'abbrev');
            locData.zipcode = data.zipcode;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        }).fail(function() {
            hasLocation = false;
        });
    },
    refreshLocation = function(callback, failCallback) {
        if (navigator.geolocation) {
            getCurrentLocationDeferred({
                enableHighAccuracy: true
            }).done(function (loc) {
                hasLocation = true;
                getLocByLatLon(loc.coords, callback);
            }).fail(function() {
                hasLocation = false;
                console.error("getLocation call failed");
                if (failCallback && failCallback.apply !== undefined)
                    failCallback.apply(null);
            });
        } else {
            console.error("Geolocation is disabled.");
        }
        //return locData;
    },
    getLocation = function(callback, failCallback) {
        if (!hasLocation)
            refreshLocation(callback, failCallback);
        else if (callback && callback.apply !== undefined)
            callback.apply(null, [locData]);
        else
            defaultCallback.apply(null, [locData]);
    };
    
    return {
        refreshLocation: refreshLocation,
        //getLocByLatLon: getLocByLatLon,
        getLocByZip: getLocByZip,
        getLocation: getLocation
    };
}(jQuery));

// gallery.js
var gallerySwiper = (function($, undefined) {
    var MAX_N_IMG = 4,
        currentImg, nImg, img_w,
        speed = 500,
        $gallery, $thumbnails,
        $uploader, canUpload,
        $progressbar,
    deleteImage = function() {
        if (confirm("要删除该照片吗?") == true) {
            nImg--;
            for (var i = currentImg; i < nImg; i++) {
                $('#image_url' + i).val($('#image_url' + (i+1)).val());
                $('#image_width' + i).val($('#image_width' + (i+1)).val());
                $('#image_height' + i).val($('#image_height' + (i+1)).val());
                $($thumbnails.children(':not(.image-uploader)')[i+1]).attr('onclick','gallerySwiper.select('+i+');');
            }
            $('#image_url' + nImg).val('');
            $('#image_width' + nImg).val('');
            $('#image_height' + nImg).val('');
            
            $gallery[0].children[currentImg+1].remove();
            $thumbnails.children('.selected').remove();
            
            if (currentImg == nImg)
                selectImage(currentImg - 1);
            selectImage(currentImg);
            ifShowThumbnails();
        }
    },
    selectImage = function(i) {
        if (i >= 0 && i <= nImg - 1) {
            var diff = i - currentImg;
            if (i > currentImg && i < nImg) {
                for (var j = 0; j < diff; j++) nextImage();
            } else if (i >= 0 && i < currentImg) {
                for (var j = 0; j < -diff; j++) previousImage();
            }
            currentImg = i;
            $($thumbnails.children(':not(.gallery-uploader)').removeClass('selected')[i]).addClass('selected');
        }
    },
    ifShowThumbnails = function() {
        if ((nImg == 0) || (nImg == 1 && !canUpload))
            $('.gallery-wrapper').addClass('gallery-no-thumbnails');
        else
            $('.gallery-wrapper').removeClass('gallery-no-thumbnails');

        if (nImg == 0)
            $('.gallery-delete').hide();
        else if (canUpload)
            $('.gallery-delete').show();
    },
    addImage = function(imageInfo) {
        if (nImg < MAX_N_IMG) {
            var index = nImg,
                url = imageInfo.image_url,
                $thumbnail = $('<div class="gallery-thumbnail-box" onclick="gallerySwiper.select('+nImg+');">'+
                    '<img class="gallery-thumbnail" src="'+url+'" />'+
                    '<div class="gallery-thumbnail-bar"></div>'+
                    '</div>'),
                $img = $('<div class="gallery-image-box"><img class="gallery-image" src="'+url+'" /></div>');
            nImg++;
            $gallery.append($img);
            $thumbnails.append($thumbnail);
            
            $('#image_url' + index).val(url);
            $('#image_width' + index).val(imageInfo.width);
            $('#image_height' + index).val(imageInfo.height);
            //$('#image_orientation' + index).val(imageInfo['orientation']);
            
            selectImage(index);
            ifShowThumbnails();
        }
    },
    swipeStatus = function(event, phase, direction, distance) {
        img_w = $gallery.width()/MAX_N_IMG;
        if(phase=='move' && (direction=='left' || direction=='right'))
        {
            var duration=0;
            if (direction == 'left') scrollImages((img_w * currentImg) + distance, duration);
            else if (direction == 'right') scrollImages((img_w * currentImg) - distance, duration);
        }
        else if (phase == 'cancel') scrollImages(img_w * currentImg, speed);
        else if (phase == 'end')
        {
            if (direction == 'right') previousImage();
            else if (direction == 'left') nextImage();
            $($thumbnails.children(':not(.gallery-uploader)').removeClass('selected')[currentImg]).addClass('selected');
        }
    },
    previousImage = function() {
        currentImg = Math.max(currentImg-1, 0);
        scrollImages( $gallery.width()/MAX_N_IMG * currentImg, speed);
    },
    nextImage = function() {
        currentImg = Math.min(currentImg+1, nImg-1);
        scrollImages( $gallery.width()/MAX_N_IMG * currentImg, speed);
    },
    scrollImages = function(distance, duration) {
        $gallery.css('-webkit-transition-duration', (duration/1000).toFixed(1) + 's');

        //inverse the number we set in the css
        var value = (distance<0 ? '' : '-') + Math.abs(distance).toString();

        $gallery.css('-webkit-transform', 'translate3d('+value +'px,0px,0px)');
    },
    swpieOptions = {
        triggerOnTouchEnd : true,
        swipeStatus : swipeStatus,
        allowPageScroll: 'vertical',
        //threshold: 75
    },
    uploadOptions = {
        url: "/s3/upload/",
        dataType: 'json',
        done: function(e, data) {
            addImage(data.result);
            //console.log(JSON.stringify(imagesInfo[nImg]));
        },
        progressall: function(e, data) {
            var pct = parseInt(data.loaded / data.total * 100, 10);
            $uploader.attr('disabled','true');
            $progressbar.css('width', pct+"%");
        },
        fail: function() { alert("照片上传出错，请重试一次"); },
        always: function() {
            $uploader.removeAttr('disabled');
            $progressbar.css('width','0');
        }
    },
    init = function($initGallery) {
        console.log('gallery init');
        currentImg = 0;
        img_w = $initGallery.width();
        $gallery = $initGallery.children('.gallery-list');
        $thumbnails = $initGallery.children('.gallery-thumbnail-list');
        nImg = $thumbnails.children(':not(.gallery-uploader)').length;
        canUpload = false;
        if ($gallery.hasClass('gallery-canupload')) {
            canUpload = true;
            $uploader = $initGallery.find('.gallery-uploader-input');
            $progressbar = $initGallery.find('.gallery-progressbar');
            $uploader.fileupload(uploadOptions);
        }
        if (nImg>1 || canUpload)
            $gallery.swipe(swpieOptions);
        selectImage(0);
        ifShowThumbnails();
    };
    
    return {init: init, select: selectImage, deleteImage: deleteImage};
}(jQuery));

/****************************************
 *     Buy/Sell new form javascript     *
 ****************************************/
var formLocation = (function($, undefined) {
    var $page,
        $latitude, $longitude,
        $zipcode, $cityName,
        $locState1, $locState2,
        $cityId, 
        $editButton, $submitButton, 
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
        $editButton = $page.find('#form-edit-loc');
        $submitButton = $page.find('#submit_btn');
        $locState1 = $page.find('.form-loc-state1').show();
        $locState2 = $page.find('.form-loc-state2').hide();
        
        locUtil.getLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityId.val(data.city_id);
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
        }, function() {
            $zipcode.val('');
            $cityName.val('');
            $latitude.val('');
            $longitude.val('');
            $cityId.val('');
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
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
    changeLocation = function(notFocus) {
        $locState1.hide();
        $locState2.show();
        if (!notFocus)
            $zipcode.focus();
    },
    refreshLocation = function() {
        $cityName.attr('placeholder', loadingStr);
        $editButton.attr('onclick', '');
        $submitButton.prop('disabled', true);
        locUtil.refreshLocation(function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityId.val(data.city_id);
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
        }, function() {
            $zipcode.val('');
            $cityName.val('');
            $latitude.val('');
            $longitude.val('');
            $cityId.val('');
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
        });
        $locState1.show();
        $locState2.hide();
    },
    getLocationByZipcode = function() {
        $cityName.attr('placeholder', loadingStr);
        $editButton.prop('onclick', '');
        $submitButton.prop('disabled', true);
        locUtil.getLocByZip($zipcode.val(), function(data) {
            $zipcode.val(data.zipcode);
            $cityName.val(data.city+', '+data.state);
            $latitude.val(data.latitude);
            $longitude.val(data.longitude);
            $cityId.val(data.city_id);
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
        }, function() {
            $zipcode.val('');
            $cityName.val('');
            $latitude.val('');
            $longitude.val('');
            $cityId.val('');
            $editButton.attr('onclick', 'formLocation.changeLocation();');
            $submitButton.prop('disabled', false);
            $cityName.attr('placeholder', noLocationStr);
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
            ignore: '#phone_number:hidden, #email:hidden',
            focusCleanup: true,
            rules: {
                price: 'digitonly',
                phone_number: 'digitonly',
                zipcode: 'digitonly'
            },
            errorPlacement: function(error, element) {
                element.attr('placeholder', error.html());
                element.addClass('hasError');
                var id = element[0].id;
                if (id === 'zipcode') {
                    formLocation.changeLocation(1);
                    element.val(parseInt(element.val()) || '');
                    element.attr('data-msg-required', error.html());
                } else if (id === 'price' || id === 'phone_number') {
                    element.val(parseInt(element.val()) || '');
                    element.attr('data-msg-required', error.html());
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


/****************************************
 *    Buy/Sell posts list javascript    *
 ****************************************/
var postLoaderConstructor = function() { return (function($, undefined) {
    var page, $page, // buy or sell
        $document = $(document),
        $window = $(window),
        $list1, $list2, $loadmore,
        $searchbar, $searchbox, $zip, $keyword,
        postPageNum, numPerPage, hasMorePost, slotPos = 0,
        currentPosition,
        loadingPost = false,
        category = null,
        keyword = null,
    toggleExtra = function() {
        $searchbar.toggleClass('search-extra');
        if ( $searchbar.hasClass('search-extra') )
            setTimeout(function() { $zip.focus(); }, 600);
        else {
            refreshPosts();
            $page.find(".post-ask-location").hide();
        }
    },
    showCategory = function() {
        $searchbox.addClass('search-category-on');
    },
    hideCategory = function(refresh) {
        $searchbox.removeClass('search-category-on');
        if (refresh) refreshPosts();
    },
    init = function(initPage) {
        console.log(initPage+" init");
        page = initPage;
        $page = $('#nearby-'+page+'post');

        $list1 = $page.find('.post-list1');
        $list2 = $page.find('.post-list2');
        $loadmore = $page.find('.post-load-more').show();
        $zip = $page.find('#zipcode');
        $keyword = $page.find('#searchKeyword');
        $searchbar = $page.find('.search-bar');
        $searchbox = $page.find('.search-category-box');
        numPerPage = $page.find('.num-per-page').val();
        clearPosts();
        
        hasMorePost = true;
        locUtil.getLocation(function(data) {
            $zip.val(data.zipcode);
            currentPosition = data;
            getAndDisplayPosts();
        }, function() {
            clearPosts();
            toggleExtra();
            $loadmore.hide();
            $page.find(".post-ask-location").show();
        });
        
        $(document).on('scrollstop', function() { //alert($window.scrollTop()+','+$document.height()+','+$window.height());
            if (($('.ui-page-active')[0].id === 'nearby-'+page+'post') && ($window.scrollTop() >= $document.height() - $window.height() - 200)) {
                getAndDisplayPosts();
            }
        });

        $zip.keypress(function (e) { 
            if (e.which == 13) { toggleExtra(); $(this).blur(); }
        });

        $keyword.keypress(function (e) { 
            if (e.which == 13) { hideCategory(1); $(this).blur(); } 
        });

        $page.find('.ui-radio').on('click', function() {
            $keyword.focus();
        });
    },
    clearPosts = function() {
        slot_pos = 0;
        postPageNum = 1;
        hasMorePost = true;
        $list1.empty();
        $list2.empty();
    },
    getAndDisplayPosts = function() {
        if (hasMorePost && (typeof currentPosition !== 'undefined')) {
            getPosts();
        }
    },
    getPosts = function() {
        //Get posts via ajax
        return $.ajax({
            type: 'get',
            url: '/' + page + '/get_posts_by_page',
            dataType: 'json',
            data: {
                pageNum: postPageNum,
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
                category: category,
                keyword: keyword
            }
        }).then(function(posts) {
            displayPosts(posts);
        });
    },
    displayPosts = function(posts) {
        var tempList1 = $(''),
            tempList2 = $(''),
            i = 0, len = posts.length;
        if (len < numPerPage) {
            hasMorePost = false;
            $loadmore.hide();
        } else {
            hasMorePost = true;
            postPageNum++;
        }
        //process posts data
        for (i = 0; i < len; i++) {
            var distance = formatDistance(posts[i]['distance']), price, image_info_list, item;
            
            if (page === 'sell') {
                image_info_list = jQuery.parseJSON(posts[i]['image_info']);
                if (image_info_list.length > 0) {
                    //only display the first image
                    image_info = image_info_list[0];
                } else {
                    image_info = undefined;
                    continue;
                }
                
                item = '<img class="post-image" src="' + image_info['image_url'] + '" />'; 
                price = formatPrice(posts[i]["price"]);
            } else if (page === 'buy') {
                item = '';
                price = formatPrice(posts[i]["max_price"]);
            }
            
            item = '<div class="post-item-box">' +
                //'<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '" data-transition="slide">' +
                '<a class="post-item" onmousedown="'+page+'PostLoader.loadPage('+posts[i]['post_id']+');" onmouseup="'+page+'PostLoader.changePage('+posts[i]['post_id']+');">' +
                    '<div>' +
                        '<img class="post-icon" src="/static/images/general/' + page + '_icon_40.png" />' +
                        '<span class="post-title">' + posts[i]["title"] + '</span>' +
                    '</div>' + item + 
                    '<div class="post-price">' +
                        '<span class="post-currency">$&nbsp;</span>' + price + 
                    '</div>' +
                    '<div class="post-distance">距离你 ' + distance + ' miles</div>' +
                '</a></div>';

            if (slotPos % 2 === 0) {
                tempList1.after($(item));
            } else {
                tempList2.after($(item));
            }
            slotPos++;
        }

        $list1.append(tempList1);
        $list2.append(tempList2);
        
        if ($list1.is(":empty") && $list2.is(":empty")) $page.find(".post-empty").show();
        else $page.find(".post-empty").hide();
    },
    loadPage = function(id) {
        /*setTimeout(function() {$('body').pagecontainer('load', '/detail/'+page+'/'+id).on('pagecontainerload', function() {
            console.log('loaded');aaloaded=true;$('body').off('pagecontainerload');});
        }, 300);*/
    },
    changePage = function(id) {
        hideCategory(0);
//console.log('change');
        //if (aaloaded) {
            //$('body').off('pagecontainerload'); aaloaded = false; console.log('why');
            $('body').pagecontainer('change', '/detail/'+page+'/'+id);
            //$('body').off('pagecontainerload');
        /*}
        else
            $('body').on('pagecontainerload', function(event, ui) {
                console.log('loaded2');
                $('body').off('pagecontainerload'); aaloaded = false;
                $('body').pagecontainer('change', ui.content, {transition: 'slide'});$('body').off('pagecontainerload');
            });*/
        
    },
    refreshPosts = function() {
        //$page.find('#popupBasic-popup').removeClass('ui-popup-active');
        //$page.find('#popupBasic-popup').addClass('ui-popup-hidden');
        //$page.find('#popupBasic-popup').addClass('ui-popup-truncate');
        category = $page.find('input[name="category"]:checked').val();
        keyword = $keyword.val();
        locUtil.getLocByZip($zip.val(), function(data) {
            currentPosition = data;
            clearPosts();
            getAndDisplayPosts();
        }, function() {
            clearPosts();
            toggleExtra();
            $loadmore.hide();
            $page.find(".post-ask-location").show();
        });
    };
    
    return { 
        init: init,
        refreshPosts: refreshPosts,
        loadPage: loadPage,
        changePage: changePage,
        toggleExtra: toggleExtra,
        showCategory: showCategory,
        hideCategory: hideCategory
    };
}(jQuery)); };

var buyPostLoader = postLoaderConstructor();
var sellPostLoader = postLoaderConstructor();


/****************************************
 *   Buy/Sell post detail javascript    *
 ****************************************/
var detailLoader = (function($, undefined) {
    var page, $page,
        wx_id, post_id,
    init = function(initPage, $initPage) {
        page = initPage;
        $page = $initPage;
        wx_id = $page.find('#wx_id').val();
        post_id = $page.find('#post_id').val();

        var $price = $page.find('.detail-price');
        $price.html(formatPrice($price.html()));
        
        showFollowStatus();
        showPostStatus();
    },
    toggleFollowStatus = function() {
        var is_followed = $page.find('#is_followed').val(); 
        var follow_img = '';   
        var popup_msg = '';
        if( is_followed == 'False'){
            is_followed = 'True';
            follow_img = '/static/images/detail/followed.png';
            popup_msg = '<p>关注本帖!</p>';
        } else {
            is_followed = 'False';
            popup_msg = '<p>取消关注！</p>';
            follow_img = '/static/images/detail/not_followed.png';
        }
        $page.find('#is_followed').val(is_followed);
        $page.find('#follow').attr('src', follow_img);
        /*$page.find('#follow-popup').html(popup_msg);
        $page.find('#follow-popup').popup('open');
        setTimeout(function() {
            $page.find('#follow-popup').popup('close');
        }, 1000);*/
        $.ajax({
            type: 'get',
            url: '/' + page + '/follow_post',
            dataType: 'json',
            data: {
                wx_id: wx_id,
                post_id: post_id,
                is_followed: is_followed
            }
        }).then(function(data) {
        });
    },
    showFollowStatus = function() {
        var is_followed = $page.find('#is_followed').val();
        if( is_followed == 'False'){
            $page.find('#follow').attr('src', '/static/images/detail/not_followed.png');
        } else {
            $page.find('#follow').attr('src', '/static/images/detail/followed.png');
        }
    },
    showShareMsg = function() {
        $page.find('#share_msg').show();
    },
    hideShareMsg = function() {
        $page.find('#share_msg').hide();
    },
    showPostStatus = function() {
        var is_open = $page.find('#is_open').val();
        if( is_open == 'False'){
            $page.find('#open .ui-btn-text').text('标记为待售');
        } else {
            $page.find('#open .ui-btn-text').text('标记为已售');
        }
    },
    togglePostStatus = function() {
        var is_open = $page.find('#is_open').val(); 
        
        var msg = '';
        if( is_open == 'False'){
            is_open = 'True';
            msg = "标记为已售";
        } else {
            is_open = 'False';
            msg = "标记为待售";
        }
        $page.find('#is_open').val(is_open);
        $page.find('#open .ui-btn-text').text(msg);

        $.ajax({
            type: 'get',
            url: '/' + page + '/toggle_post',
            dataType: 'json',
            data: {
                wx_id: wx_id,
                post_id: post_id,
                is_open: is_open
            }
        }).then(function(data) {

        });
    };

    return {
        init: init, 
        showFollowStatus: showFollowStatus,
        toggleFollowStatus: toggleFollowStatus,
        showShareMsg: showShareMsg,
        hideShareMsg: hideShareMsg, 
        showPostStatus: showPostStatus,
        togglePostStatus: togglePostStatus
    };
}(jQuery));

$(document).on("pagebeforeshow", function() {
    var ua = navigator.userAgent.toLowerCase();
    if (!(ua.match(/MicroMessenger/i) == "micromessenger")) {
        $(".header").show();
/*
        var lastScroll = 0;
        window.onscroll = function(event) {
            var t = $(this).scrollTop();
            if (t > lastScroll)
                $('.header').css('position','absolute');
            else
                $('.header').css('position','fixed');
        lastScroll = t;
        };*/
    }
});

$(document).on('pagebeforeshow', '#main', function() {
    locUtil.getLocation(function(data) { 
        $('.main-city-text').html(data.city); 
    }, function(data) { 
        $('.main-city-text').html('获取位置'); 
    });
});

$(document).on('pageshow', '#buy-form', function(event) {
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

$(document).on('pagebeforeshow', '#buy-form', function(event) {
    formLoader.init('buy');
});
$(document).on('pagebeforeshow', '#sell-form', function(event) {
    formLoader.init('sell');
    gallerySwiper.init($('#sell-form-gallery'));
});

$(document).on('pagebeforeshow', '#buy-edit', function(event) {
    formLoader.init('buy', $('#buy-edit'));
});
$(document).on('pagebeforeshow', '#sell-edit', function(event) {
    formLoader.init('sell', $('#sell-edit'));
    gallerySwiper.init($('#sell-edit-gallery'));
});

$(document).on('pagebeforeshow', '#sell-detail', function(event) {
//$("body").on('pagecontainerbeforetransition', function() {
    detailLoader.init('sell',$(this));
    gallerySwiper.init($(this).find('.gallery'));
});
$(document).on('pagebeforeshow', '#buy-detail', function(event) {
    detailLoader.init('buy',$(this));
});


$(document).on('pageinit', '#nearby-buypost', function() {
    //if ($('.ui-page-active').attr('id') !== 'buy-detail')
    {//alert();
        //$(document).off('scrollstop');
        buyPostLoader.init('buy');
    }
});
$(document).on('pageinit', '#nearby-sellpost', function() {
    //if ($('.ui-page-active').attr('id') !== 'sell-detail')
    {//alert();
        //$(document).off('scrollstop');
        sellPostLoader.init('sell');
    }
});

$(document).on('pagebeforeshow', '#user-update-page', function() {
    userLoader.init('user-update-page');
});

$(document).on('pagebeforeshow', function() {
    $('.refresh-title')[0].contentWindow.location.reload();
});