var imageCount = 0;
var imageMaxNum = 3;
var currentImageIndex = 0;

//whether it is in the process of uploading
var isUploading = false;

var imagesInfo = new Array(3);
var imagesHtml = new Array(3);
var numPerPage;

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

function handleImage(index) {
    if (isUploading == true) {
        return;
    }
    if(index == currentImageIndex) {
        var toDelete = confirm("要删除该照片吗?");
        if (toDelete == true) {
            removeImage(index);
            displayImage(0);
        }
    } else {
        displayImage(index);
    }
}

/*
 * Display the image
 */
function displayImage(index) {
    if (imageCount == 0) {
        $('#current_image').empty();
        $('#delete_icon').hide();
        $('#imgselector0').css("background-color", "rgb(172,172,172)");
        $('#imgselector1').css("background-color", "rgb(172,172,172)");
        $('#imgselector2').css("background-color", "rgb(172,172,172)");
    }
    if (index < imageCount) {
        var imageInfo = imagesInfo[index];
        $('#current_image').empty();
        $('#current_image').append(imagesHtml[index]);
        $('#imgselector0').css("background-color", "rgb(172,172,172)");
        $('#imgselector1').css("background-color", "rgb(172,172,172)");
        $('#imgselector2').css("background-color", "rgb(172,172,172)");
        $('#imgselector' + index).css("background-color", "#00CED1");
        $('#delete_icon').show();
        currentImageIndex = index;
    }
}

// function deleteCurrentImage() {
//     removeImage(currentImageIndex);
//     displayImage(0);
// }

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
    return pub;
}(jQuery));

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
    }).then(function(posts) {
        displayPosts(posts);
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

        image_width = document.body.clientWidth * 0.4;
        image_height = image_info['height'] / image_info['width'] * image_width;
        var distance = posts[i]["distance"];
        if (posts[i]["distance"] > 1000) {
            distance = (posts[i]["distance"]/1000).toFixed(2) + " K"
        }

        var postTemplate = $('<li class="sellpost-li"></li>');
        postTemplate.append($('<div style="font-size: 20px;"><img width="20" height="20" src="/static/images/nearby_sell_posts/sell_logo.png" /><span>&nbsp;&nbsp;&nbsp;&nbsp;' + posts[i]["title"] + '</span></div>'));
        postTemplate.append($('<div><a href="/detail/sell/' + posts[i]['post_id'] + '"><img src="' + image_info['image_url'] + '" width="' + image_width + '" height="' + image_height + '"/></a></div>'));
        postTemplate.append($('<div style="font-size: 16px;"><span style="color: #FF1493;">$&nbsp;</span>' + posts[i]["price"] + '</div>'));
        postTemplate.append($('<div style="font-size: 12px;">距离你 ' + distance + ' miles</div>'));

        if (slot_pos % 2 === 0) {
            listA.append(postTemplate);
        } else {
            listB.append(postTemplate);
        }
        slot_pos++;
    }
    listA.listview("refresh");
    listB.listview("refresh");
    if (len < numPerPage) {
        hasMoreSellPost = false;
        $('#load-more').hide();
    } else {
        hasMoreSellPost = true;
        sellPostPageNum++;
    }

}

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
    numPerPage = $('#num-per-page').val();
});

function getLatitudeLongtitude(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $("#latitude").val(latitude);
    $("#longitude").val(longitude);
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
        $('#zipcode').val(data['zipcode']);
        $('#city_name').val(data['city']);
    });
}

$(document).delegate("#sellpost-form", "pageinit", function() {
    imageCount = 0;
    currentImageIndex = 0;
    isUploading = false;
    for (var i = 0; i < imageMaxNum; i++) {
        imagesInfo[i] = null;
    }
    var deviceWidth = $(window).width() * 0.90;
    $('#image-uploader').css('width', deviceWidth);
    $('form').validate({
        rules: {
            phone_number: "digitonly"
        },
        submitHandler: function(form) {
            if ($(form).valid() && $('#image_url0').valid())
                form.submit();
            return false; // prevent normal form posting
        }

    });
    isEmailChecked = false;
    isPhoneChecked = false;
    isSmsChecked = false;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLatitudeLongtitude);
    }
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
            $('#progress-bar-div').show();
            $('#progress-bar').attr("aria-valuenow", progress);
            $('#progress-bar').css("width", progress+"%");
            $('#progress-bar').text(progress+"%");
            isUploading = true;
            $('#image-uploader').attr("disabled", true);
            $('#post_image').attr("disabled", true);
        },
        fail: function(e, data) {
            alert("照片上传出错，请重试一次");

        },
        always: function(e, data) {
            isUploading = false;
            $('#progress-bar-div').hide();
            $('#image-uploader').attr("disabled", false);
            $('#post_image').attr("disabled", false);
        }
    });
    $('#content').bind('input propertychange', function() {
        contentLength = $('#content').val().length;
        lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);
    });

});


function refreshSellPosts() {
    $('#popupBasic-popup').removeClass('ui-popup-active');
    $('#popupBasic-popup').addClass('ui-popup-hidden');
    $('#popupBasic-popup').addClass('ui-popup-truncate');
    slot_pos = 0;
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
