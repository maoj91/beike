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

var locUtil = (function() {
    var location = null,
        locData = {latitude: null, longitude: null, city: null, zipcode: null},
        defaultCallback = function(data) { console.log(data); },
    getCurrentLocationDeferred = function(options) {
        var deferred = $.Deferred();
        navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject, options);
        return deferred.promise();
    },
    getLocByZip = function(zipcode, callback) {
        locData.zipcode = zipcode;
        $.ajax({
            type: "get",
            url: "/user/get_info/get_latlong_by_zipcode",
            dataType: "json",
            data: { zipcode: zipcode }
        }).then(function(data) {
            locData.city = data.city;
            locData.latitude = data.latitude;
            locData.longitude = data.longitude;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        });
    },
    getLocByLatLon = function(LatLon, callback) {
        locData.latitude = LatLon.latitude;
        locData.longitude = LatLon.longitude;
        $.ajax({
            type: "get",
            url: "/user/get_info/get_zipcode_by_latlong",
            dataType: "json",
            data: {
                latitude: LatLon.latitude,
                longitude: LatLon.longitude
            }
        }).then(function(data) {
            locData.city = data.city;
            locData.zipcode = data.zipcode;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        });
    },
    refreshLocation = function(callback) {
        if (navigator.geolocation) {
            getCurrentLocationDeferred({
                enableHighAccuracy: true
            }).done(function (loc) {
                location = loc;
                getLocByLatLon(loc.coords, callback);
            }).fail(function() {
                console.error("getLocation call failed");
            }).always(function() {
                //do nothing
            });
        } else {
            console.error("Geolocation is disabled.");
        }
        //return locData;
    },
    getLocation = function(callback) {
        if (!location)
            refreshLocation(callback);
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
}());


$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");


$(document).on("pagebeforeshow", function() {
    var ua = navigator.userAgent.toLowerCase();
    if (!(ua.match(/MicroMessenger/i) == "micromessenger")) {
        $(".header").show();

        var lastScroll = 0;
        window.onscroll = function(event) {
            var t = $(this).scrollTop();
            if (t > lastScroll)
                $('.header').css('position','absolute');
            else
                $('.header').css('position','fixed');
        lastScroll = t;
        };
    }
});


//$('.header').toolbar({ hideDuringFocus: "button" });
//$( ".footer" ).toolbar( "option", "hideDuringFocus", "input" );
//$('.footer').toolbar({ hideDuringFocus: "input"});
//$("[data-role=footer]").fixedtoolbar({ hideDuringFocus: "input, select" });
