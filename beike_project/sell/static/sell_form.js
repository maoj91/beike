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
        var imgDeleteIcon = $('<img src="/static/images/sell_post/thumbnail_selected.png" width="100%" onclick="deleteImage(' + index + ');">');
        $('#imgselector' + index).append(imgDeleteIcon);
        currentImageIndex = index;
    }
}

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
            phone_number: "digitonly",
            zipcode: "digitonly"
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
        navigator.geolocation.getCurrentPosition(getLocationByLatlonForSellForm);
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
