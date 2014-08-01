var imageCount = 0;
var imageMaxNum = 3;
var currentImageIndex = 0;

//whether it is in the process of uploading
var isUploading = false;

var imagesInfo = new Array(3);

function getImageDimensionInfo(file_dom_id) {
    var imageInfo = {};
    //get and set orientation info
    var fileId = "#" + file_dom_id;
    var file = $(fileId)[0].files[0];
    var fr = new FileReader;
    fr.onloadend = function() {
        var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
        if (typeof exif.PixelXDimension != 'undefined' && typeof exif.PixelYDimension != 'undefined') {
            imageInfo['width'] = exif.PixelXDimension;
            imageInfo['height'] = exif.PixelYDimension;
        } else {
            imageInfo['width'] = 1;
            imageInfo['height'] = 1;
        }

        if (typeof exif.Orientation != 'undefined') {
            imageInfo['orientation'] = exif.Orientation;
        } else {
            imageInfo['orientation'] = 1;
        }

    };
    fr.readAsBinaryString(file);
    return imageInfo;
}

function moreImagesAllowed() {
    if (imageCount >= imageMaxNum) {
        alert("已经达到上限");
    }
    return imageCount < imageMaxNum;
}

function getImageNamePrefix(user_id) {
    var currentTime = Date.now();
    var prefix = user_id + "/" + currentTime;
    return prefix;
}

function image_s3_upload(file_dom_id, user_id) {
    if (!isUploading && imageCount < imageMaxNum) {
        //retrieve the image information. e.g. width, height, orientation
        var imageInfo = getImageDimensionInfo(file_dom_id);
        //retrieve the image prefix for S3 upload
        var imageNamePrefix = getImageNamePrefix(user_id);
        console.log('Image name prefix: ' + imageNamePrefix);

        //upload it to s3
        var s3upload = new S3Upload({
            file_dom_selector: file_dom_id,
            s3_sign_put_url: '/s3/sign/',
            s3_object_name_prefix: imageNamePrefix,
            onProgress: function(percent, message) {
                $('#upload_status').html('Completed ' + percent + '%');
                $('#upload_status').show();
                isUploading = true;
            },
            onFinishS3Put: function(url) {
                //set the url in the image info
                imageInfo['url'] = url;
                addImage(imageInfo);
                console.log(JSON.stringify(imagesInfo[currentImageIndex]))
                displayImage(imageCount - 1);
                $('#upload_status').hide();
                isUploading = false;
            },
            onError: function(status) {
                $('#upload_status').html('Upload error: ' + status);
                $('#upload_status').show();
                isUploading = false;
            }
        });
    }
}

/*
 * Add an image info and update the preview and form
 */

function addImage(imageInfo) {
    if (imageCount < imageMaxNum) {
        var index = imageCount;
        imageCount++;
        imagesInfo[index] = imageInfo;
        //add image to the thumbnail
        $('#preview' + index).attr('src', imageInfo['url']);
        $('#preview' + index).show();
        //add image to the form
        $('#image_url' + index).val(imageInfo['url']);
        $('#image_width' + index).val(imageInfo['width']);
        $('#image_height' + index).val(imageInfo['height']);
        $('#image_orientation' + index).val(imageInfo['orientation']);
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
                //add image to the thumbnail
                $('#preview' + i).attr('src', imagesInfo[i]['url']);
                //add image to the form
                $('#image_url' + i).val(imagesInfo[i]['url']);
                $('#image_width' + i).val(imagesInfo[i]['width']);
                $('#image_height' + i).val(imagesInfo[i]['height']);
            } else {
                imagesInfo[i] = null;
                //remove image in the thumbnail
                $('#preview' + i).removeAttr('src');
                $('#preview' + i).css("border", "none");
                $('#preview' + i).hide()
                //remove image to the form
                $('#image_url' + i).val('');
                $('#image_width' + i).val('');
                $('#image_height' + i).val('');
            }
        }
    }
}

/*
 * This function is to display the image
 */

function displayImage(index) {
    if (imageCount == 0) {
        $('#current_image').css('background-image', '');
        $('#delete_icon').hide();
    }
    if (index < imageCount) {
        //remove each thumbnail's border
        for (var i = 0; i < imageMaxNum; i++) {
            $('#preview' + i).css("border", "none");
        }
        var imageInfo = imagesInfo[index];
        $('#preview' + index).css("border", "1px solid black");
        $('#current_image').css('background-image', 'url(' + imageInfo['url'] + ')');
        $('#current_image').css('background-position', 'center center');
        var imgOrientation = 1;
        if (imageInfo['width'] > 0 && imageInfo['height'] > 0) {
            imgOrientation = imageInfo['width'].toFixed(2) / imageInfo['height'].toFixed(2);
        }
        if (imgOrientation >= 1) {
            $('#current_image').removeClass('landscape_image');
            $('#current_image').removeClass('potrait_image');
            $('#current_image').addClass('potrait_image');
            var imageWidth = 290;
            var imageHeight = imageWidth * (imageInfo['height'].toFixed(2) / imageInfo['width'].toFixed(2));
            $('#current_image').css('background-size', imageWidth + 'px ' + imageHeight + 'px');
        } else {
            $('#current_image').removeClass('landscape_image');
            $('#current_image').removeClass('potrait_image');
            $('#current_image').addClass('landscape_image');
            var imageHeight = 290;
            var imageWidth = imageHeight * (imageInfo['width'].toFixed(2) / imageInfo['height'].toFixed(2));
            $('#current_image').css('background-size', imageWidth + 'px ' + imageHeight + 'px');
        }
        $('#delete_icon').show();
        currentImageIndex = index;
    }
}

function deleteCurrentImage() {
    removeImage(currentImageIndex);
    displayImage(0);
}

function selectCondition(i) {
    //cleaer all border
    for (var j = 1; j <= 6; j++) {
        $('#condition' + j).css("border", "none");
    }
    $('#condition' + i).css("border", "1px solid black");
    $('#my_condition').val(i);
}

//3 months from now by default 

function setOpenUntil() {
    var date = new Date();
    var day = date.getDate();
    var currentMonth = date.getMonth() + 1;
    var month = date.getMonth() + 4;
    var year = date.getFullYear();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var currentDate = year + "-" + currentMonth + "-" + day;
    var defaultDate = year + "-" + month + "-" + day;
    $('#open_until_date').attr("value", defaultDate);
    $('#open_until_date').attr("min", currentDate);
}

/* Sell posts dynamic loading */
var sellPostPageNum = 1;
var sellPostCurLatLon = {};
var hasMoreSellPost = true;
var slot_pos = 0;
var category = '';
var keyword = '';

var sellPostLoader = (function($, undefined) {
    var pub = {};
    pub.init = function() {
        //Refresh the posts when scrolling to the bottom
        $(window).live("hitBottom",
            function() {
                pub.getAndDisplayPosts();
            });
    };

    pub.getAndDisplayPosts = function(position, sellPostCategory, sellPostKeyword) {
        category = sellPostCategory;
        keyword = sellPostKeyword;
        //Starting loading animation
        $('#load-more').show();
        //Get posts and add success callback using then
        getPosts(position, sellPostCategory, sellPostKeyword).then(function() {
           //Stop loading animation on success
            // $('#load-more').hide();
        });
    };

    pub.clearPosts = function() {
        var listA = $("#post-list-a");
        listA.empty();
        var listB = $("#post-list-b");
        listB.empty();
    }

    function getPosts(position, sellPostCategory, sellPostKeyword) {
        //Get posts via ajax
        return $.ajax({
            type: "get",
            url: "/sell/get_posts_by_page",
            dataType: "json",
            data: {
                pageNum: sellPostPageNum,
                latitude: position['latitude'],
                longitude: position['longitude'],
                category: sellPostCategory,
                keyword: sellPostKeyword
            }
        }).then(function(data) {
            displayPosts(data);
        });
    }

    function displayPosts(posts) {
        var listA = $("#post-list-a");
        var listB = $("#post-list-b");
        var i = 0,
            len = posts.length;
        //process posts data
        for (i = 0; i < len; i++) {
            var image_info_list = jQuery.parseJSON(posts[i]["image_info"]);
            if (image_info_list.length > 0) {
                //only display the first image
                image_info = image_info_list[0];
            } else {
                image_info = undefined
                continue;
            }
            var isHorizontal = true
            if (image_info['height'] > image_info['width']) {
                isHorizontal = false;
            }

            var image_width = document.body.clientWidth * 0.4;
            var image_height = image_width * (image_info['height'] / image_info['width'])
            var displayCss = "horizontal-li";
            if (!isHorizontal) {
                displayCss = "vertical-li"
            }
            image_height = 'auto';
            var template = '<li class="' + displayCss + '"><div><a href="/detail/sell/' +
                posts[i]['post_id'] + '"><div><img src="' +
                image_info['image_url'] + '" width="' + image_width + '" height="' + image_height + '"/></div><div><img width="20" height="20" src="/static/images/nearby_sell_posts/sell_logo.png" />' +
                posts[i]["title"] + '</div><div>$' + posts[i]["price"] + '</div><div>距离你 ' + posts[i]["distance"] + ' miles</div></a></div></li>';

            if (slot_pos % 2 === 0) {
                listA.append(template);
            } else {
                listB.append(template);
            }
            slot_pos++;
        }
        listA.listview("refresh");
        listB.listview("refresh");
        if (len == 0) {
            hasMoreSellPost = false;
            $('#load-more').hide();
        } else {
            hasMoreSellPost = true;
            sellPostPageNum++;
        }

    }
    return pub;
}(jQuery));

$(document).delegate("#nearby-sellpost", "pageinit", function() {
    sellPostPageNum = 1;
    getCurrentPositionDeferred({
        enableHighAccuracy: true
    }).done(function(position) {
        sellPostLoader.init();
        sellPostLoader.clearPosts();
        // current_position = position;
        sellPostCurLatLon['latitude'] = position.coords.latitude;
        sellPostCurLatLon['longitude'] = position.coords.longitude;
        sellPostLoader.getAndDisplayPosts(sellPostCurLatLon, '', '');
    }).fail(function() {
        console.log("getCurrentPosition call failed")
    }).always(function() {
        //do nothing
    });
});

function getImageSize(imgSrc) {
    var imgItem = new Image();
    // p = $(imgItem).onload(function(){
    //     return {width: imgItem.width, height: imgItem.height};
    // });
    imgItem.onload = function() {
        console.log(this.width + " " + this.height);
    }
    imgItem.src = imgSrc;
}

function getLatitudeLongtitude(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $("#latitude").val(latitude);
    $("#longitude").val(longitude);
    $.ajax({
        type: "get",
        url: "/me/get_info/get_zipcode_by_latlong",
        dataType: "json",
        data: {
            latitude: latitude,
            longitude: longitude
        }
    }).then(function(data) {
        console.log(data);
    });
}

var deviceWidth;
$(document).delegate("#sellpost-form", "pageinit", function() {
    imageCount = 0;
    currentImageIndex = 0;
    isUploading = false;
    for (var i = 0; i < imageMaxNum; i++) {
        imagesInfo[i] = null;
    }
    deviceWidth = $(window).width() * 0.90;
    $('#image-uploader').css('width', deviceWidth);
    $('form').validate({
        rules: {
            phone_number: "digitonly"
        }
    });
    isEmailChecked = false;
    isPhoneChecked = false;
    isSmsChecked = false;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLatitudeLongtitude);
    }
});

function refreshSellPosts() {
    $('#popupBasic-popup').removeClass('ui-popup-active');
    $('#popupBasic-popup').addClass('ui-popup-hidden');
    $('#popupBasic-popup').addClass('ui-popup-truncate');
    var zipcode = $('#zipcode').val();
    var sellPostCategory = 0;
    sellPostCategory = $('input[name="category"]:checked').val();
    var sellPostKeyword = $('#sellPostKeyword').val();
    $.ajax({
        type: "get",
        url: "/user/get_info/get_latlong_by_zipcode",
        dataType: "json",
        data: {
            zipcode: zipcode
        }
    }).then(function(latlon) {
        // var latlon = jQuery.parseJSON(data);
        sellPostCurLatLon['latitude'] = latlon['latitude'];
        sellPostCurLatLon['longitude'] = latlon['longitude'];
        //clear the posts and reset pageNum
        sellPostLoader.clearPosts();
        sellPostPageNum = 1;
        hasMoreSellPost = false;
        sellPostLoader.getAndDisplayPosts(sellPostCurLatLon, sellPostCategory, sellPostKeyword);
    });
    
    return false;
}
/***************/
