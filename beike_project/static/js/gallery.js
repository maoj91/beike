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
