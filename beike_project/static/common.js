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


$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");

/****************************************
 * Buy/Sell post upload form javascript *
 ****************************************/

var imageCount = 0;
var imageMaxNum = 3;
var currentImageIndex = 0;

//whether it is in the process of uploading
var isUploading = false;

var imagesInfo = new Array(3);
var imagesHtml = new Array(3);

/*
 * Check if it is allowed to upload more images
 */
function moreImagesAllowed() {
    if (imageCount >= imageMaxNum) {
        alert("已经达到上限");
    }
    return imageCount < imageMaxNum;
}

/*
 * Add an image info and update the preview and form
 */
function addImage(imageInfo) {
    if (imageCount < imageMaxNum) {
        var index = imageCount;
        imageCount++;
        imagesInfo[index] = imageInfo;
        maxWidth = '450px';
        maxHeight = '250px';
        if (imageInfo['width'] > imageInfo['height']) {
            maxHeight = 'auto';
        } else {
            maxWidth = 'auto';
        }

        imgElement = $('<img></img>');
        imgElement.attr("src", imageInfo['url']);
        imgElement.css("max-width", maxWidth);
        imgElement.css("max-height", maxHeight);
        imagesHtml[index] = imgElement;

        //add image to the thumbnail
        imgThumbnail = $('<img src="' + imageInfo['url'] + '" width="100%" height="100%"/>');
        $('#preview' + index).append(imgThumbnail);
        $('#preview' + index).show();
        //add image to the form
        $('#image_url' + index).val(imageInfo['url']);
        $('#image_width' + index).val(imageInfo['width']);
        $('#image_height' + index).val(imageInfo['height']);
        $('#image_orientation' + index).val(imageInfo['orientation']);
        displayImage(index);
    }
}

/*
 * Remove an image info and update the preview and form
 */
function removeImage(index) {
    if (index < imageCount) {
        imageCount--;
        for (var i = index; i < imageMaxNum; i++) {
            if (i < imageCount) {
                imagesInfo[i] = imagesInfo[i + 1];
                imagesHtml[i] = imagesHtml[i + 1];
                //replace image in the thumbnail
                imgThumbnail = $('<img src="' + imagesInfo[i]['url'] + '" width="100%" height="100%"/>')
                $('#preview' + i).empty();
                $('#preview' + i).append(imgThumbnail);
                //add image to the form
                $('#image_url' + i).val(imagesInfo[i]['url']);
                $('#image_width' + i).val(imagesInfo[i]['width']);
                $('#image_height' + i).val(imagesInfo[i]['height']);
            } else {
                imagesInfo[i] = null;
                imagesHtml[i] = null;
                //remove image in the thumbnail
                $('#preview' + i).empty();
                //remove image to the form
                $('#image_url' + i).val('');
                $('#image_width' + i).val('');
                $('#image_height' + i).val('');
            }
        }
    }
}

/*
 * Delete the image
 */
function deleteImage(index) {
    if (!isUploading) {
        var toDelete = confirm("要删除该照片吗?");
        if (toDelete == true) {
            removeImage(index);
            displayImage(0);
        }
    }
}


/*
 * Display the image
 */
function displayImage(index) {
    if (imageCount == 0) {
        $('#current_image').empty();
        $('#imgselector0').empty();
    }
    if (index < imageCount) {
        var imageInfo = imagesInfo[index];
        //replace the image
        $('#current_image').empty();
        $('#current_image').append(imagesHtml[index]);
        //move the image thumbnail
        $('#imgselector0').empty();
        $('#imgselector1').empty();
        $('#imgselector2').empty();
        var imgDeleteIcon = $('<img src="/static/images/sell_post/thumbnail_selected.png" width="100%" onclick="deleteImage(' + index + ');">');
        $('#imgselector' + index).append(imgDeleteIcon);
        currentImageIndex = index;
    }
}

function chooseCondition(conditionNum) {
    if (conditionNum >= 0 && conditionNum < 4) {
        for (i = 0; i < 4; i++) {
            if (i == conditionNum) {
                $('#condition-' + i + '-desc').hide();
                $('#condition-' + i + '-img').show();
                $("#condition-slider").val(conditionNum)
            } else {
                $('#condition-' + i + '-desc').show();
                $('#condition-' + i + '-img').hide();
            }
        }
    }
}

$(document).delegate("#sell-form", "pageinit", function() {
    
});

var formLoader = (function($, undefined) {
    var loader = {},
        page, $page, 
        $latitude, $longitude,
        $zipcode, $cityName,
        isEmailChecked = false,
        isPhoneChecked = false,
        isSmsChecked = false;
    
    loader.init = function(initPage) {
        page = initPage;
        $page = $('#'+page+'-form');
        $latitude = $page.find('#latitude');
        $longitude = $page.find('#longitude');
        $zipcode = $page.find('#zipcode');
        $cityName = $page.find('#city-name');
        
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
        
        $page.find('#content').bind('input propertychange', function() {
            var contentLength = $(this).val().length;
            $page.find('#lengthCounter').html(contentLength + '/300');
        });
        
        
        imageCount = 0;
        currentImageIndex = 0;
        isUploading = false;
        for (var i = 0; i < imageMaxNum; i++) {
            imagesInfo[i] = null;
        }
        var deviceWidth = $(window).width() * 0.90;
        $('#image-uploader').css('width', deviceWidth);
        
        $('#post_image').fileupload({
            url: "/s3/upload/",
            dataType: 'json',
            done: function(e, data) {
                var imageInfo = {};
                imageInfo['url'] = data.result.image_url;
                imageInfo['width'] = data.result.width;
                imageInfo['height'] = data.result.height;
                imageInfo['orientation'] = data.result.orientation;
                addImage(imageInfo);
                console.log(JSON.stringify(imagesInfo[currentImageIndex]));
            },
            progressall: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progressbar').show();
                jQMProgressBar('progressbar').setValue(progress);
                isUploading = true;
                $('#image-uploader').attr("disabled", true);
                $('#post_image').attr("disabled", true);
            },
            fail: function(e, data) {
                alert("照片上传出错，请重试一次");
            },
            always: function(e, data) {
                $('#progressbar').hide();
                isUploading = false;
                $('#image-uploader').attr("disabled", false);
                $('#post_image').attr("disabled", false);
            }
        });
        
        jQMProgressBar('progressbar')
            .isMini(false)
            .setMax(100)
            .setStartFrom(0)
            .showCounter(true)
            .build();
        $('#progressbar').hide();
        
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

    /*
     * Use user input zipcode to get the city and latlon
     */
    loader.getLocationByZipcode = function() {
        var zipcode = $('#'+page+'-form #zipcode').val();
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
    
    /*
function getLocationByLatlonForSellForm(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $("#sell_form_latitude").val(latitude);
    $("#sell_form_longitude").val(longitude);
    $.ajax({
        type: "get",
        url: "/user/get_info/get_zipcode_by_latlong",
        dataType: "json",
        data: {
            latitude: latitude,
            longitude: longitude
        }
    }).then(function(data) {
        console.log(data);
        $('#sell_form_zipcode').val(data['zipcode']);
        $('#sell_form_city_name').val(data['city']);
    });
}

function getLocationByZipcodeForSellForm() {
    var zipcode = $("#sell_form_zipcode").val();
    $.ajax({
        type: "get",
        url: "/user/get_info/get_latlong_by_zipcode",
        dataType: "json",
        data: {
            zipcode: zipcode
        }
    }).then(function(data) {
        console.log(data);
        $('#sell_form_city_name').val(data['city']);
        $('#sell_form_latitude').val(data['latitude']);
        $('#sell_form_longitude').val(data['longitude']);
    });
}*/

    
    loader.clickPhoneContact = function() {
        if (isPhoneChecked) {
            $('#phone-icon').show();
            $('#phone-icon-clicked').hide();
            isPhoneChecked = false;
            $('#phone-checked').val('off');
            if(isSmsChecked){
                $('#phone_number_div').css('display', 'block');
            } else{
                $('#phone_number_div').css('display', 'none');
            } 
        } else {
            $('#phone-icon').hide();
            $('#phone-icon-clicked').show();
            $('#phone_number_div').css('display', 'block');
            isPhoneChecked = true;
            $('#phone-checked').val('on');
        }
    };

    loader.clickEmailContact = function() {
        if (isEmailChecked) {
            $('#email-icon').show();
            $('#email-icon-clicked').hide();
            $('#email_div').css('display', 'none');
            isEmailChecked = false;
            $('#email-checked').val('off');
        } else {
            $('#email-icon').hide();
            $('#email-icon-clicked').show();
            $('#email_div').css('display', 'block');
            isEmailChecked = true;
            $('#email-checked').val('on');
        }
    };

    loader.clickSmsContact = function() {
        if (isSmsChecked) {
            $('#sms-icon').show();
            $('#sms-icon-clicked').hide();
            if(isPhoneChecked){
                $('#phone_number_div').css('display', 'block');
            } else{
                $('#phone_number_div').css('display', 'none');
            } 
            isSmsChecked = false;
            $('#sms-checked').val('off');
        } else {
            $('#sms-icon').hide();
            $('#sms-icon-clicked').show();
            $('#phone_number_div').css('display', 'block');
            isSmsChecked = true;
            $('#sms-checked').val('on');
        }
    };
    
    return loader;
}(jQuery));



$(document).delegate('#buy-form', 'pageinit', function(event) {
    formLoader.init('buy');
});

$(document).delegate('#sell-form', 'pageinit', function(event) {
    formLoader.init('sell');
});

/****************************************
 *    Buy/Sell posts list javascript    *
 ****************************************/
var buyPostLoader = (function($, undefined) {
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
        page = initPage;
        $page = $('#'+page+'-list');
        
        $list1 = $page.children('.post-list1');
        $list2 = $page.children('.post-list2');
        $loadmore = $page.find('.load-more');
        numPerPage = $page.find('.num-per-page').val();
        //clearPosts();
        
        getCurrentPositionDeferred({
            enableHighAccuracy: true
        }).done(function(position) {
            currentPosition = position;
            clearPosts();
            loadMorePosts();
        }).fail(function() {
            console.error("getCurrentPosition call failed");
        }).always(function() {
            //do nothing
        });
    },
    clearPosts = function() {
        slot_pos = 0;
        postPageNum = 1;
        hasMorePost = true;
        $list1.empty();
        $list2.empty();
    },
    loadMorePosts = function() {
        if (!loadingPost) {
            loadingPost = true;
            $loadmore.show(); //Starting loading animation

            //Get posts and add success callback using then
            getPosts().then(function() {
                //$loadmore.hide(); //Stop loading animation on success
            });
            loadingPost = false;
        }
    },
// TODO: This is very ugly now. This function will be called to many times and there should be a way to prevent this.
    getMorePosts = function() {
        if ($.mobile.activePage.attr('id') === 'nearby-'+page+'post') {//alert($window.height());
        if (hasMorePost && (typeof currentPosition !== 'undefined') && $window.scrollTop() >= $document.height()-$window.height()-200) {
            loadMorePosts();
        }}
    };

    var getPosts = function() {
        //Get posts via ajax
        return $.ajax({
            type: 'get',
            url: '/' + page + '/get_posts_by_page',
            dataType: 'json',
            data: {
                pageNum: postPageNum,
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
                category: category,
                keyword: keyword
            }
        }).then(function(posts) {
            displayPosts(posts);
        });
    };
    
    var displayPosts = function(posts) {
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
                price = formatPrice(posts[i]["price"]);+ 
                        '</div>'+
                        '<div class="post-distance">距离你 ' + distance + ' miles</div>'+
                    '</a></div>';
            } else if (page === 'buy') {
                item = '';
                price = formatPrice(posts[i]["max_price"]);
            }
            
            item = '<div class="post-item-div">' +
                '<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '">' +
                    '<div>' +
                        '<img class="post-icon" src="/static/images/general/' + page + '_logo.png" />' +
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
    };
    
    var refreshPosts = function() {
        $('#popupBasic-popup').removeClass('ui-popup-active');
        $('#popupBasic-popup').addClass('ui-popup-hidden');
        $('#popupBasic-popup').addClass('ui-popup-truncate');
        
        category = $('input[name="category"]:checked').val();
        keyword = $('#sellPostKeyword').val();
        
        clearPosts();
        getMorePosts();
    };
    
    return { 
        init: init, 
        clearPosts: clearPosts, 
        getMorePosts: getMorePosts, 
        refreshPosts: refreshPosts
    };
}(jQuery));

var sellPostLoader = Object.create(buyPostLoader);

$(document).delegate('#nearby-buypost', 'pageinit', function() {
    buyPostLoader.init('buy');
});

$(document).delegate('#nearby-sellpost', 'pageinit', function() {
    sellPostLoader.init('sell');
});

/****************************************
 *   Buy/Sell post detail javascript    *
 ****************************************/
var detailLoader = (function($, undefined) {
    var loader = {}, page, $page,
        wx_id, post_id;

    loader.init = function(initPage) {
        page = initPage;
        $page = $('#'+page+'-detail-page');
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
        
        loader.showFollowStatus();
    };

    loader.toggleFollowStatus = function() {
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
    };

    loader.showFollowStatus = function() {
        var is_followed = $page.find('#is_followed').val();
        if( is_followed == 'False'){
            $page.find('#follow').attr('src', '/static/images/detail/not_followed.png');
        } else {
            $page.find('#follow').attr('src', '/static/images/detail/followed.png');
        }
    };

    loader.showShareMsg = function() {
        $page.find('#share_msg').show();
    }

    loader.hideShareMsg = function() {
        $page.find('#share_msg').hide();
    }

    return loader;
}(jQuery));

var gallerySwiper = (function($, undefined) {
    var IMG_WIDTH,
        currentImg, nImg,
        speed = 500,
        $thumbnails,
    options = {
        triggerOnTouchEnd : true,   
        swipeStatus : swipeStatus,
        allowPageScroll: 'vertical',
        //threshold: 75
    }, 
    init = function($initGallery) {
        currentImg = 0;
        IMG_WIDTH = $initGallery.width();
        $gallery = $initGallery.children('.gallery-list');
        $thumbnails = $initGallery.children('.gallery-thumbnail-list');
        nImg = $thumbnails.children().length;
        $gallery.swipe(options);
        selectThumbnail(0);
    };
    function swipeStatus(event, phase, direction, distance) {
        //If we are moving before swipe, and we are going Lor R in X mode, or U or D in Y mode then drag.
        IMG_WIDTH = $gallery.width()/5;
        if( phase=='move' && (direction=='left' || direction=='right') )
        {
            var duration=0;
            if (direction == 'left') scrollImages((IMG_WIDTH * currentImg) + distance, duration);
            else if (direction == 'right') scrollImages((IMG_WIDTH * currentImg) - distance, duration);
        }
        else if ( phase == 'cancel') scrollImages(IMG_WIDTH * currentImg, speed);
        else if ( phase =='end' )
        {
            if (direction == 'right') previousImage();
            else if (direction == 'left') nextImage();
        }
    }
    function selectImage(i) {
        var diff = i - currentImg;
        if (i > currentImg && i < nImg) {
            for (var j=0; j<diff; j++) {
                nextImage();
            }
        } else if (i >= 0 && i < currentImg) {
            for (var j=0; j < -diff; j++) {
                previousImage();
            }
        }
    }
    function previousImage () {
        currentImg = Math.max(currentImg-1, 0);
        scrollImages( $gallery.width()/5 * currentImg, speed);
        selectThumbnail(currentImg);
    }
    function nextImage() {
        currentImg = Math.min(currentImg+1, nImg-1);
        scrollImages( $gallery.width()/5 * currentImg, speed);
        selectThumbnail(currentImg);
    }
    function scrollImages(distance, duration) {
        $gallery.css('-webkit-transition-duration', (duration/1000).toFixed(1) + 's');

        //inverse the number we set in the css
        var value = (distance<0 ? '' : '-') + Math.abs(distance).toString();

        $gallery.css('-webkit-transform', 'translate3d('+value +'px,0px,0px)');
    }
    function selectThumbnail(i) {
        if (i >= 0 && i <= nImg - 1)
            $($thumbnails.children().removeClass('selected')[i]).addClass('selected');
    }
    return {init: init, select: selectImage};
}(jQuery));

function showContacts() { 
    if("{{phone_checked}}" == "on" || "{{sms_checked}}" == "on" ){
        $('#phone_number_div').css('display', 'inline');
    } else {
        $('#phone_number_div').css('display', 'none');
    }

    if ("{{phone_checked}}" == "on"){     
        $('#phone-icon').hide();
        $('#phone-icon-clicked').show();
    } else {
        $('#phone-icon').show();
        $('#phone-icon-clicked').hide();
    }

    if("{{sms_checked}}" == "on" ){
        $('#sms-icon').hide();
        $('#sms-icon-clicked').show();
    } else { 
        $('#sms-icon').show();
        $('#sms-icon-clicked').hide();
    }

    if ("{{email_checked}}"  == 'on' ){
        $('#email_div').css('display', 'inline');
        $('#email-icon').hide();
        $('#email-icon-clicked').show();
    } else { 
        $('#email_div').css('display', 'none');
        $('#email-icon').show();
        $('#email-icon-clicked').hide();
    }
}

$(document).on("pagebeforechange", function() {
    var ua = navigator.userAgent.toLowerCase();
    if (!(ua.match(/MicroMessenger/i) == "micromessenger")) {
        $(".header").show();
    }
});

$(document).on("pagechange", function() {
    var url = window.location.pathname;
    if (url === "/") {
        $('div.ui-page').attr('style','height:100%;');
    } else if (url.substring(0,11) === '/detail/buy') {
        detailLoader.init('buy');
    } else if (url.substring(0,12) === '/detail/sell') {
        detailLoader.init('sell');
        gallerySwiper.init($('.ui-page-active #sell-detail-gallery'));
    }
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
                $('#progressbar').show();
                jQMProgressBar('progressbar').setValue(progress);
                isUploading = true;
                $('#image-uploader').attr("disabled", true);
                $('#post_image').attr("disabled", true);
            },
            fail: function(e, data) {
                alert("照片上传出错，请重试一次");
            },
            always: function(e, data) {
                $('#progressbar').hide();
                isUploading = false;
                $('#image-uploader').attr("disabled", false);
                $('#post_image').attr("disabled", false);
            }
        });
    };

    return loader;
}(jQuery));

$(document).delegate("#user-update-page", "pageinit", function() {
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
                    url: "/user/get_info/get_city",
                    dataType: "json",
                    data: {
                        zipcode: zipcode,
                    }
                }).then(function(data) {
                    console.log(data);
                    $("#city").text(data.city_name);
                    $("#city_id").val(data.city_id);
                    $("#district").text(data.lv1_district_name);
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
                $("#city").text(data.city_name);
                $("#city_id").val(data.city_id);
                $("#district").text(data.lv1_district_name);
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
