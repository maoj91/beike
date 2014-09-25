$(document).on("pagebeforeshow", function() {
    var ua = navigator.userAgent.toLowerCase();
    if (!(ua.match(/MicroMessenger/i) == "micromessenger")) {
        $(".header").show();
/*
        var lastScroll = 0;
        window.onscroll = function(event) {
            var t = $(this).scrollTop();
            if (t > lastScroll)
                $('.header').css('position','absolute');
            else
                $('.header').css('position','fixed');
        lastScroll = t;
        };*/
    }
});

$(document).on('pagebeforeshow', '#main', function() {
    locUtil.getLocation(function(data) { 
        $('.main-city-text').html(data.city); 
    }, function(data) { 
        $('.main-city-text').html('获取位置'); 
    });
});

$(document).on('pageshow', '#buy-form', function(event) {
/*
WeixinApi.ready(function(Api) {
var wxData = {
"appId": "", // 服务号可以填写appId
"imgUrl" : 'http://www.baidufe.com/fe/blog/static/img/weixin-qrcode-2.jpg',
"link" : 'http://www.baidufe.com',
"desc" : '大家好，我是Alien',
"title" : "大家好，我是赵先烈"
};

var wxCallbacks = {
ready : function() {
//alert("准备分享");
},
cancel : function(resp) {
//alert("分享被取消，msg=" + resp.err_msg);
},
fail : function(resp) {
//alert("分享失败，msg=" + resp.err_msg);
},
confirm : function(resp) {
//alert("分享成功，msg=" + resp.err_msg);
},
all : function(resp,shareTo) {
//alert("分享" + (shareTo ? "到" + shareTo : "") + "结束，msg=" + resp.err_msg);
}
};

Api.shareToFriend(wxData, wxCallbacks);
Api.shareToTimeline(wxData, wxCallbacks);
Api.shareToWeibo(wxData, wxCallbacks);
Api.generalShare(wxData,wxCallbacks);
WeixinApi.hideOptionMenu();
WeixinApi.showOptionMenu();
WeixinApi.hideToolbar();
WeixinApi.showToolbar();
});*/
});

$(document).on('pagebeforeshow', '#buy-form', function(event) {
    formLoader.init('buy');
    //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();});
});
$(document).on('pagebeforeshow', '#sell-form', function(event) {
    formLoader.init('sell');
    gallerySwiper.init($('#sell-form-gallery'));
});

$(document).on('pagebeforeshow', '#buy-edit', function(event) {
    formLoader.init('buy', $('#buy-edit'));
});
$(document).on('pagebeforeshow', '#sell-edit', function(event) {
    formLoader.init('sell', $('#sell-edit'));
    gallerySwiper.init($('#sell-edit-gallery'));
});

$(document).on('pageshow', '#sell-detail', function(event) {
//$("body").on('pagecontainerbeforetransition', function() {
    detailLoader.init('sell');
    gallerySwiper.init($('#sell-detail .gallery'));
});
$(document).on('pageshow', '#buy-detail', function(event) {
    detailLoader.init('buy');
});


$(document).on('pageinit', '#nearby-buypost', function() {
    //if ($('.ui-page-active').attr('id') !== 'buy-detail')
    {//alert();
        //$(document).off('scrollstop');
        buyPostLoader.init('buy');
    }
});
$(document).on('pageinit', '#nearby-sellpost', function() {
    //if ($('.ui-page-active').attr('id') !== 'sell-detail')
    {//alert();
        //$(document).off('scrollstop');
        sellPostLoader.init('sell');
    }
});


