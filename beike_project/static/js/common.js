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
