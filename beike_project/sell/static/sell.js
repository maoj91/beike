/************************************/
/* Sell post upload form javascript */
/************************************/

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
        var imgDeleteIcon = $('<img src="/static/images/sell_post/thumbnail_selected.png" width="100%" onclick="deleteImage('
                          + index + ');">');
        $('#imgselector' + index).append(imgDeleteIcon);
        currentImageIndex = index;
    }
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
    $('#content').bind('input propertychange', function() {
        contentLength = $('#content').val().length;
        lengthCount = contentLength + "/" + 3000;
        $('#lengthCounter').text(lengthCount);
    });
    jQMProgressBar('progressbar')
        .isMini(false)
        .setMax(100)
        .setStartFrom(0)
        .showCounter(true)
        .build();
    $('#progressbar').hide();
});

/******************************/
/* Sell posts dynamic loading */
/******************************/

var numPerPage;
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
            distance = (posts[i]["distance"] / 1000).toFixed(2) + " K"
        }

        var postTemplate = $('<li class="sellpost-li"></li>');
        postTemplate.append($('<div style="font-size: 18px;"><img width="20" height="20" src="/static/images/nearby_sell_posts/sell_logo.png" /><span>&nbsp;&nbsp;' + posts[i]["title"] + '</span></div>'));
        postTemplate.append($('<div><a href="/detail/sell/' + posts[i]['post_id'] + '"><img src="' + image_info['image_url'] + '" width="' + image_width + '" height="' + image_height + '"/></a></div>'));
        postTemplate.append($('<div style="font-size: 16px;"><span style="color: #ff9999;">$&nbsp;</span>' + posts[i]["price"] + '</div>'));
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
    document.getElementById("zipcode").value='';
    document.getElementById("sellPostKeyword").value='';
    if(sellPostCategory != 0){
        $('input[name=category][value=]').prop("checked",true).checkboxradio( "refresh" );
        $('input[name=category][value=' + sellPostCategory + ']').prop("checked",false).checkboxradio( "refresh" );
    }
    return false;
}
