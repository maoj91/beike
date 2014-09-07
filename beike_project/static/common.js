var emailChecked;

var isEmailChecked = false;
var isPhoneChecked = false;
var isSmsChecked = false;

function clickPhoneContact() {
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
}

function clickEmailContact() {
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
}

function clickSmsContact() {
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
}

function getCurrentPositionDeferred(options) {
    var deferred = $.Deferred();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
    return deferred.promise();
}

$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");

// from buy post detail
function toggleFollowStatus(){
    var is_followed = $("#is_followed").val(); 
    var follow_img = '';   
    var popup_msg = '';
    if( is_followed == "False"){
        is_followed = "True";
        follow_img = '/static/images/detail/followed.png';
        popup_msg = '<p>关注本帖!</p>';
    } else {
        is_followed = "False";
        popup_msg = '<p>取消关注！</p>';
        follow_img = '/static/images/detail/not_followed.png';
    }
    $("#is_followed").val(is_followed);
    $("#follow").attr("src", follow_img);
    $('#follow-popup').html(popup_msg);
    $('#follow-popup').popup("open");
    setTimeout(function() {
      $('#follow-popup').popup("close");
    }, 1000);
    $.ajax({
        type: "get",
        url: "/sell/follow_post",
        dataType: "json",
        data: {
            wx_id: wx_id,
            post_id: post_id,
            is_followed: is_followed
        }
    }).then(function(data) {

    });
}


function showFollowStatus(){
    var is_followed = $("#is_followed").val();
    if( is_followed == "False"){
        $("#follow").attr("src", '/static/images/detail/not_followed.png');
    } else {
        $("#follow").attr("src", '/static/images/detail/followed.png');
    }
}

/*
function showPosition(lat, lon) {
    var latlonStr = lat+","+lon;
    var width = 800; //(window.innerWidth > 0) ? window.innerWidth : screen.width;
    var height = 200;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlonStr+"&zoom=14&size="+width+"x"+height+"&sensor=true&markers=color:green%7C"+latlonStr;
    $("#map").attr("src",img_url);
    return img_url;
}*/


function showShareMsg(){
    $("#share_msg").show();
}

function hideShareMsg(){
    $("#share_msg").hide();
}


// from sell post detail
var IMG_WIDTH = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var currentImg=0;
var maxImages=$("#imgs").children().length;//{{image_num}};
var speed=500;

var imgs;

var swipeOptions=
{
    triggerOnTouchEnd : true,   
    swipeStatus : swipeStatus,
    allowPageScroll:"vertical",
    threshold:75            
}

$(function()
{               
    imgs = $("#imgs");
    imgs.swipe( swipeOptions );
});


/**
* Catch each phase of the swipe.
* move : we drag the div.
* cancel : we animate back to where we were
* end : we animate to the next image
*/          
function swipeStatus(event, phase, direction, distance)
{
    //If we are moving before swipe, and we are going Lor R in X mode, or U or D in Y mode then drag.
    if( phase=="move" && (direction=="left" || direction=="right") )
    {
        var duration=0;

        if (direction == "left")
            scrollImages((IMG_WIDTH * currentImg) + distance, duration);

        else if (direction == "right")
            scrollImages((IMG_WIDTH * currentImg) - distance, duration);

    }

    else if ( phase == "cancel")
    {
        scrollImages(IMG_WIDTH * currentImg, speed);
    }

    else if ( phase =="end" )
    {
        if (direction == "right")
            previousImage()
        else if (direction == "left")           
            nextImage()
    }
}

function selectImage(i){
    var diff = i - currentImg;
    if(i>currentImg && i<=maxImages-1){
        for(var j=0;j<diff;j++){
            nextImage();
        }
    } else if(i>=0 && i<currentImg){
        for(var j=0;j<-diff;j++){
            previousImage();
        }
    }
}

function selectThumbnail(i){
    if(i>=0 && i<=maxImages-1){
        for(var j=0;j<=maxImages-1;j++){
            $("#thumbnail_span"+j).addClass("thumbnail_not_selected");
        }
        $("#thumbnail_span"+i).removeClass("thumbnail_not_selected");
        $("#thumbnail_span"+i).addClass("thumbnail_selected");
    }
}

function previousImage()
{
    currentImg = Math.max(currentImg-1, 0);
    scrollImages( IMG_WIDTH * currentImg, speed);
    selectThumbnail(currentImg);
}

function nextImage()
{
    currentImg = Math.min(currentImg+1, maxImages-1);
    scrollImages( IMG_WIDTH * currentImg, speed);
    selectThumbnail(currentImg);
}

/**
* Manuallt update the position of the imgs on drag
*/
function scrollImages(distance, duration)
{
    imgs.css("-webkit-transition-duration", (duration/1000).toFixed(1) + "s");

    //inverse the number we set in the css
    var value = (distance<0 ? "" : "-") + Math.abs(distance).toString();

    imgs.css("-webkit-transform", "translate3d("+value +"px,0px,0px)");
}


/*
function showPosition() {
    var latlonStr = {{lat}}+","+{{lon}};
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var height = 200;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlonStr+"&zoom=14&size="+width+"x"+height+"&sensor=false";
    $("#map").attr("src",img_url);
}*/

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
        $("div.ui-page").attr("style","height:100%;");
    }
    else if (url.substring(0,7) === "/detail") {
        var wx_id = $("#wx_id").val();
        var post_id = $("#post_id").val();

        $("#follow-post").on('slidestop', function(event) {
            var follow_option = $("#follow-post").val();
            return $.ajax({
                type: "get",
                url: "/buy/follow_post",//url: "/sell/follow_post",
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    follow_option: follow_option
                }
            }).then(function(data) {});
        });

        $("#open-close-post").on('slidestop', function(event) {
            var operation = $("#open-close-post").val();
            return $.ajax({
                type: "get",
                url: "/buy/open_close_post",//url: "/sell/open_close_post",
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    operation: operation
                }
            }).then(function(data) {});
        });
        
        showFollowStatus();
    }
});

