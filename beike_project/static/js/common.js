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


$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");

$(document).on("pagebeforeshow", function() {
    var ua = navigator.userAgent.toLowerCase();
    if (!(ua.match(/MicroMessenger/i) == "micromessenger")) {
        $(".header").show();
    }
});

$(document).on("pagechange", function() {
    var url = window.location.pathname;
    if (url === "/") {
        $('div.ui-page').attr('style','height:100%;');
    }
});
