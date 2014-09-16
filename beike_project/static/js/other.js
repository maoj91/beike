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
