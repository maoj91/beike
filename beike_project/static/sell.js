// total number of images, max 3
var imageNum = 0;
//whether it is in the process of uploading
var isUploading = false;
//position of the current image 
var currentPosition = 0;
var currentCondition = 1;

function getImageDimensionInfo(file_dom_id) {
    var imgInfo = {}
    //get and set orientation info
    var fileId = "#" + file_dom_id
    var file = $(fileId)[0].files[0];
    var fr = new FileReader;
    fr.onloadend = function() {
        var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
        if (typeof exif.PixelXDimension != 'undefined') {
            imgInfo['width'] = exif.PixelXDimension;
        } else {
            imgInfo['width'] = 1
        }

        if (typeof exif.PixelXDimension != 'undefined') {
            imgInfo['height'] = exif.PixelYDimension;
        } else {
            imgInfo['height'] = 1
        }
    };
    fr.readAsBinaryString(file);
    return imgInfo
}

function get_image_name_prefix(user_id) {
    var currentTime = Date.now();
    var prefix = user_id + "/" + currentTime;
    return prefix;
}

function image_s3_upload(file_dom_id, user_id) {
    if (!isUploading && imageNum < 3) {
        //retrieve the image information. e.g. width, height
        var imgInfo = getImageDimensionInfo(file_dom_id);
        //retrieve the image prefix for S3 upload
        var image_name_prefix = get_image_name_prefix(user_id);
        //upload it to s3
        var s3upload = new S3Upload({
            file_dom_selector: file_dom_id,
            s3_sign_put_url: '/s3/sign/',
            s3_object_name_prefix: image_name_prefix,
            onProgress: function(percent, message) {
                $('#upload_status').html('Uploaded ' + percent + '%');
                $('#upload_status').show();
                isUploading = true;
            },
            onFinishS3Put: function(url) {
                imageNum = imageNum + 1;
                //set the url in the hidden input
                $('#image_url' + imageNum).val(url);
                $('#image_width' + imageNum).val(imgInfo['width']);
                $('#image_height' + imageNum).val(imgInfo['height']);
                $('#upload_status').hide();
                //populate the image information in HTML for form submit
                selectImage(imageNum, imgInfo);
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

function selectImage(i, imgInfo) {
    if (i <= imageNum) {
        currentPosition = i;
        //cleaer all border
        for (var j = 1; j <= 3; j++) {
            $('#preview' + j).css("border", "none");
        }
        if (i == 0) {
            $('#current_image').attr('src', '');
            $('#current_image').removeClass('landscape_image');
            $('#current_image').removeClass('potrait_image');
        } else {
            var url = $('#image_url' + currentPosition).val();
            $('#preview' + currentPosition).attr('src', url);
            $('#preview' + currentPosition).css("border", "1px solid black");
            $('#current_image').attr('src', url);
            var imgOrientation = 1;
            if (imgInfo['width'] > 0 && imgInfo['height'] > 0) {
                imgOrientation = imgInfo['width'].toFixed(2) / imgInfo['height'].toFixed(2);
            }
            if (imgOrientation >= 1) {
                $('#current_image').removeClass('landscape_image');
                $('#current_image').removeClass('potrait_image');
                $('#current_image').addClass('potrait_image');
            } else {
                $('#current_image').removeClass('landscape_image');
                $('#current_image').removeClass('potrait_image');
                $('#current_image').addClass('landscape_image');
            }
        }
    }
}

function deleteImage() {
    for (var j = currentPosition; j < imageNum; j++) {
        var nextIndex = j + 1;
        var url = $('#image_name' + nextIndex).val();
        $('#image_name' + j).val(url);
        $('#preview' + j).attr('src', url);

    }
    $('#image_name' + imageNum).val('');
    $('#preview' + imageNum).attr('src', '');
    if (currentPosition == imageNum) {
        selectImage(imageNum - 1);
    } else {
        selectImage(currentPosition);
    }
    imageNum--;
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

function initiatePage() {
    selectCondition(1);
    setOpenUntil();
    $("#choose_file").click(function(e) {
        e.preventDefault();
        $("input[type=file]").trigger("click");
    });
}

function validateForm() {
    var msg = '';
    var isValid = false;
    var title = $('[name="title"]').val();
    var price = $('[name="price"]').val();
    var content = $('[name="content"]').val();
    var image1 = $('[name="image1_url"]').val();
    var image2 = $('[name="image2_url"]').val();
    var image3 = $('[name="image3_url"]').val();

    if (!title) {
        msg = '输入项不能为空';
    } else if (!price) {
        msg = '输入项不能为空';
    } else if (!content) {
        msg = '输入项不能为空';
    } else if (!isValidInteger(price)) {
        msg = '请检查您输入的价格';
    } else if (image1 == "" && image2 == "" && image3 == "") {
        msg = '请至少上传一张图片';
    } else {
        isValid = true;
    }
    //TODO:need to validate phone number, price
    $('#validate_msg').html(msg);
    return isValid;
}

function isValidInteger(str) {
    return (!isNaN(str)) && (str.indexOf(".") == -1);
}

/* Sell posts dynamic loading */
var sellPostPageNum = 1;
var sellPostCurLatLon = {};
var hasMoreSellPost = true;
var slot_pos = 0;

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
            var image_width, image_height
            var max_width = document.body.clientWidth*0.4
            var max_height = 180
            if (isHorizontal) {
                if (image_info['width'] < max_width) {
                    image_width = image_info['width']
                    image_height = image_info['height']
                } else {
                    image_width = max_width
                    image_height = max_width * (image_info['height'] / image_info['width']);
                }
            } else {
                if (image_info['height'] < max_height) {
                    image_width = image_info['width']
                    image_height = image_info['height']
                } else {
                    image_height = max_height
                    image_width = max_height * (image_info['width'] / image_info['height']);

                }
            }
            var displayCss = "horizontal-li";
            if (!isHorizontal) {
                displayCss = "vertical-li"
            }
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

function refreshSellPosts() {
    var zipcode = $('#zipcode').val();
    var sellPostCategory = $('input[name="category"]:checked').val();
    var sellPostKeyword = $('#sellPostKeyword').val();
    $.ajax({
        type: "get",
        url: "/me/get_info/get_latlong_by_zipcode",
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
