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

var locUtil = (function() {
    var location = null,
        locData = {
            latitude: null, longitude: null, 
            city: null, state: null, zipcode: null
        },
        defaultCallback = function(data) { console.log(data); },
    getCurrentLocationDeferred = function(options) {
        var deferred = $.Deferred();
        navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
        return deferred.promise();
    },
    getLocByZip = function(zipcode, callback) {
        $.ajax({
            type: "get",
            url: "/user/get_info/get_latlong_by_zipcode",
            dataType: "json",
            data: { zipcode: zipcode }
        }).then(function(data) {
            locData.zipcode = zipcode;
            locData.city = data.city;
            locData.state = convert_state(data.state,'abbrev');
            locData.latitude = data.latitude;
            locData.longitude = data.longitude;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        }).fail(function() {
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        });
    },
    getLocByLatLon = function(LatLon, callback) {
        locData.latitude = LatLon.latitude;
        locData.longitude = LatLon.longitude;
        $.ajax({
            type: "get",
            url: "/user/get_info/get_zipcode_by_latlong",
            dataType: "json",
            data: {
                latitude: LatLon.latitude,
                longitude: LatLon.longitude
            }
        }).then(function(data) {
            locData.city = data.city;
            locData.state = convert_state(data.state,'abbrev');
            locData.zipcode = data.zipcode;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        });
    },
    refreshLocation = function(callback) {
        if (navigator.geolocation) {
            getCurrentLocationDeferred({
                enableHighAccuracy: true
            }).done(function (loc) {
                location = loc;
                getLocByLatLon(loc.coords, callback);
            }).fail(function() {
                console.error("getLocation call failed");
            }).always(function() {
                //do nothing
            });
        } else {
            console.error("Geolocation is disabled.");
        }
        //return locData;
    },
    getLocation = function(callback) {
        if (!location)
            refreshLocation(callback);
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
}());


$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");


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

// gallery.js
var gallerySwiper = (function($, undefined) {
    var MAX_N_IMG = 5,
        currentImg, nImg, img_w,
        speed = 500,
        $gallery, $thumbnails,
        $uploader, canUpload,
        $progressbar,
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
            var imageInfo = {
                url: data.result.image_url,
                width: data.result.width,
                height: data.result.height,
                orientation: data.result.orientation
            };
            addImage(imageInfo);
            //console.log(JSON.stringify(imagesInfo[nImg]));
        },
        progressall: function(e, data) {
            var pct = parseInt(data.loaded / data.total * 100, 10);
            $('.gallery-uploader-input').attr('disabled','true');
            $progressbar.css('width', pct+"%");
        },
        fail: function() { alert("照片上传出错，请重试一次"); },
        always: function() {
            $('.gallery-uploader-input').removeAttr('disabled');
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
            $uploader.fileupload(uploadOptions);a=$initGallery;
        }
        $gallery.swipe(swpieOptions);
        selectImage(0);
        ifShowThumbnails();
    },
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
    };
    
    function ifShowThumbnails() {
        if ((nImg == 0) || (nImg == 1 && !canUpload))
            $('.gallery-wrapper').addClass('gallery-no-thumbnails');
        else
            $('.gallery-wrapper').removeClass('gallery-no-thumbnails');

        if (nImg == 0)
            $('.gallery-delete').hide();
        else if (canUpload)
            $('.gallery-delete').show();
    }
    function addImage(imageInfo) {
        if (nImg < MAX_N_IMG) {
            var index = nImg,
                url = imageInfo.url,
                $thumbnail = $('<div class="gallery-thumbnail-box" onclick="gallerySwiper.select('+nImg+');">'+
                    '<img class="gallery-thumbnail" src="'+url+'" />'+
                    '<div class="gallery-thumbnail-bar"></div>'+
                    '</div>'),
                $img = $('<div class="gallery-image-box"><img class="gallery-image" src="'+url+'" /></div>');
            nImg++;
            $gallery.append($img);
            $thumbnails.append($thumbnail);
            
            $('#image_url' + index).val(imageInfo['url']);
            $('#image_width' + index).val(imageInfo['width']);
            $('#image_height' + index).val(imageInfo['height']);
            //$('#image_orientation' + index).val(imageInfo['orientation']);
            
            selectImage(index);
            ifShowThumbnails();
        }
    }

    function swipeStatus(event, phase, direction, distance) {
        img_w = $gallery.width()/5;
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
    }
    function previousImage () {
        currentImg = Math.max(currentImg-1, 0);
        scrollImages( $gallery.width()/5 * currentImg, speed);
    }
    function nextImage() {
        currentImg = Math.min(currentImg+1, nImg-1);
        scrollImages( $gallery.width()/5 * currentImg, speed);
    }
    function scrollImages(distance, duration) {
        $gallery.css('-webkit-transition-duration', (duration/1000).toFixed(1) + 's');

        //inverse the number we set in the css
        var value = (distance<0 ? '' : '-') + Math.abs(distance).toString();

        $gallery.css('-webkit-transform', 'translate3d('+value +'px,0px,0px)');
    }
    
    return {init: init, select: selectImage, deleteImage: deleteImage};
}(jQuery));

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

/****************************************
 *    Buy/Sell posts list javascript    *
 ****************************************/
var postLoader = (function($, undefined) {
    var page, $page, // buy or sell
        $document = $(document),
        $window = $(window),
        $list1, $list2, $loadmore,
        postPageNum, numPerPage, hasMorePost, slotPos = 0,
        currentPosition,
        loadingPost = false,
        category = null,
        keyword = null,
    init = function(initPage) {
        page = initPage;console.log(page+" init");
        $page = $('#'+page+'-list');
        
        $list1 = $page.children('.post-list1');
        $list2 = $page.children('.post-list2');
        $loadmore = $page.find('.post-load-more').show();
        numPerPage = $page.find('.num-per-page').val();
        clearPosts();
        
        hasMorePost = true;
        locUtil.getLocation(function(data) {
            currentPosition = data;
            getAndDisplayPosts();
        });
        
        $(document).on('scrollstop', function() { 
            if ($window.scrollTop() >= $document.height() - $window.height() - 200)
                getAndDisplayPosts();
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
                '<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '" data-transition="slide">' +
                //'<a class="post-item" onmousedown="postLoader.loadPage('+posts[i]['post_id']+');" onmouseup="postLoader.changePage('+posts[i]['post_id']+');">' +
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
    },
    loadPage = function(id) {
        /*setTimeout(function() {$('body').pagecontainer('load', '/detail/'+page+'/'+id).on('pagecontainerload', function() {
            console.log('loaded');aaloaded=true;$('body').off('pagecontainerload');});
        }, 300);*/
    },
    changePage = function(id) {
//console.log('change');
        //if (aaloaded) {
            //$('body').off('pagecontainerload'); aaloaded = false; console.log('why');
            $('body').pagecontainer('change', '/detail/'+page+'/'+id);//$('body').off('pagecontainerload');
        /*}
        else
            $('body').on('pagecontainerload', function(event, ui) {
                console.log('loaded2');
                $('body').off('pagecontainerload'); aaloaded = false;
                $('body').pagecontainer('change', ui.content, {transition: 'slide'});$('body').off('pagecontainerload');
            });*/
        
    },
    refreshPosts = function() {
        $('#popupBasic-popup').removeClass('ui-popup-active');
        $('#popupBasic-popup').addClass('ui-popup-hidden');
        $('#popupBasic-popup').addClass('ui-popup-truncate');
        
        category = $('input[name="category"]:checked').val();
        keyword = $('#sellPostKeyword').val();
        locUtil.getLocByZip($('#zipcode').val(), function(data) {
            currentPosition = data;
            clearPosts();
            getAndDisplayPosts();
        });
    };
    
    return { 
        init: init,
        refreshPosts: refreshPosts,
        loadPage: loadPage,
        changePage: changePage
    };
}(jQuery));

$(document).delegate('#nearby-buypost', 'pagebeforeshow', function() {
    if ($('.ui-page-active').attr('id') !== 'buy-detail')
    {
        $(document).off('scrollstop');
        postLoader.init('buy');
        //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();WeixinApi.showOptionMenu();});
    }
$('#zipcode').keypress(function (e) { if (e.which == 13) toggleExtra(); });
$('#sellPostKeyword').keypress(function (e) { if (e.which == 13) {hideCategory();$(this).blur();} });
});

$(document).delegate('#nearby-sellpost', 'pagebeforeshow', function() {
    if ($('.ui-page-active').attr('id') !== 'sell-detail')
    {
        $(document).off('scrollstop');
        postLoader.init('sell'); //console.log('refresh');
        //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();WeixinApi.showOptionMenu();});
    }
$('#zipcode').keypress(function (e) { if (e.which == 13) {toggleExtra();$(this).blur();} });
$('#sellPostKeyword').keypress(function (e) { if (e.which == 13) {hideCategory();$(this).blur();} });
$('.ui-checkbox').on('click', function() { $('#sellPostKeyword').focus(); });
//$('.search-icon.location-go').on('click', function() { toggleExtra(); });
});


function toggleExtra() {
    $('.search-bar').toggleClass('search-extra');
    if ( $('.search-bar').hasClass('search-extra') )
        setTimeout(function() {$('#zipcode').focus();}, 600);
    else
        postLoader.refreshPosts();
}
function showCategory() {
    $('.search-category-box').addClass('search-category-on');
}
function hideCategory() {
    $('.search-category-box').removeClass('search-category-on');
    postLoader.refreshPosts();
}


/****************************************
 *   Buy/Sell post detail javascript    *
 ****************************************/
var detailLoader = (function($, undefined) {
    var page, $page,
        wx_id, post_id,

    init = function(initPage) {
        page = initPage;
        $page = $('#'+page+'-detail');
        wx_id = $page.find('#wx_id').val();
        post_id = $page.find('#post_id').val();

        var $price = $page.find('.detail-price');
        $price.html(formatPrice($price.html()));
        
        $page.find('#follow-post').on('slidestop', function(event) {
            var follow_option = $(this).val();
            return $.ajax({
                type: "get",
                url: '/'+page+'/follow_post',
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    follow_option: follow_option
                }
            }).then(function(data) {});
        });

        $page.find('#open-close-post').on('slidestop', function(event) {
            var operation = $(this).val();
            return $.ajax({
                type: "get",
                url: '/'+page+'/open_close_post',
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    operation: operation
                }
            }).then(function(data) {});
        });
        
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
        $page.find('#follow-popup').html(popup_msg);
        $page.find('#follow-popup').popup('open');
        setTimeout(function() {
            $page.find('#follow-popup').popup('close');
        }, 1000);
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
    };

    showPostStatus = function() {
        var is_open = $page.find('#is_open').val();
        if( is_open == 'False'){
            $page.find('#open .ui-btn-text').text('标记为待售');
        } else {
            $page.find('#open .ui-btn-text').text('标记为已售');
        }
    };

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

$(document).delegate('#sell-detail', 'pagebeforeshow', function(event) {
//$("body").on('pagecontainerbeforetransition', function() {
    detailLoader.init('sell');
    gallerySwiper.init($('#sell-detail .gallery'));
});

$(document).delegate('#buy-detail', 'pagebeforeshow', function(event) {
    detailLoader.init('buy');
});

$(document).delegate('#sell-edit', 'pagebeforeshow', function(event) {
    formLoader.init('sell', $('#sell-edit'));
    gallerySwiper.init($('#sell-edit .gallery'));
});

$(document).delegate('#buy-edit', 'pagebeforeshow', function(event) {
    formLoader.init('buy', $('#buy-edit'));
});

/******************************************
**    User info/edit                
******************************************/
var userLoader = (function($, undefined) {
    var loader = {},
        page, $page;

    loader.init = function(initPage) {
        page = initPage;
        $page = $('#user-update-page');     
        $page.find('#description').bind('input propertychange', function() {
            var contentLength = $(this).val().length;
            $page.find('#lengthCounter').html(contentLength + '/3000');
        });

        //init lengthCounter
        var contentLength = $('#description').val().length;
        var lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);

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
                $('.progressbar').hide();
                isUploading = false;
                $('#image-uploader').attr("disabled", false);
                $('#post_image').attr("disabled", false);
            }
        });
    };

    return loader;
}(jQuery));

$(document).delegate('#user-update-page', 'pageinit', function() {
    userLoader.init('user-update-page');
});


/******************************************
**    Address edit
******************************************/
var addressLoader = (function($, undefined) {
    var loader = {},
        page, $page, 
        $latitude, $longitude,
        $zipcode, $cityName;

    loader.init = function(initPage) {
        $page = $('#'+initPage); 
        if (navigator.geolocation) {
            getCurrentPositionDeferred({
                enableHighAccuracy: true
            }).done(function(position) {
                loader.getLocationByLatLon(position.coords)
            }).fail(function() {
                console.log("getCurrentPosition call failed")
            }).always(function() {
                //do nothing
            });
        } else {
            console.error("Geolocation is disabled.")
        }

        $(document).on("click", "#getzipcode", function() {
            var zipcode = $('#zipcode_input').val();
            if (zipcode) {
                $.ajax({
                    type: "get",
                    url: "/user/get_info/get_city_by_zipcode",
                    dataType: "json",
                    data: {
                        zipcode: zipcode,
                    }
                }).then(function(data) {
                    console.log(data);
                    $("#city").text(data.city);
                    $("#city_id").val(data.city_id);
                    $("#latitude").val(data.latitude);
                    $("#longitude").val(data.longitude);
                });
            }
        });

    };

     loader.getLocationByLatLon = function(coords) {
            var latitude = coords.latitude;
            var longitude = coords.longitude;
            $.ajax({
                type: "get",
                url: "/user/get_info/get_city_by_latlong",
                dataType: "json",
                data: {
                    latitude: latitude,
                    longitude: longitude
                }
            }).then(function(data) {
                $("#city").text(data.city);
                $("#city_id").val(data.city_id);
                $("#zipcode").val(data.zipcode);
                $("#latitude").val(latitude);
                $("#longitude").val(longitude);
            });
    }

    return loader;
}(jQuery));

$(document).delegate("#user-address-page", "pageinit", function() {
    addressLoader.init('user-address-page');
});


/******************************************
**    user getinfo 
******************************************/
var infoLoader = (function($, undefined) {
    var loader = {}, $page;

    loader.init = function(initPage) {
        $page = $('#'+initPage);

    };

    return loader;
}(jQuery));

function validateUserInfo() {
            $('#user_info_form').validate({
                rules: {
                    user_email: {
                        required: true,
                        email: true,
                        remote: {
                            url: "check_email",
                            type: "post",
                            async: false
                        }
                    }
                },
                messages: {
                    user_email: {
                        email: "该email格式不对",
                        remote: "该email已经被使用"
                    }
                }
            });
            $('#username_input').val($('#username').val());
            $('#email_input').val($('#user_email').val());
            return $('#user_info_form').valid();
}

$(document).delegate("#user_info", "pageinit", function() {
    infoLoader.init('user_info');
});

$(document).delegate("#user_location", "pageinit", function() {
    addressLoader.init('user_location');
});
