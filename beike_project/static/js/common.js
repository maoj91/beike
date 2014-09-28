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

var locUtil = (function($, undefined) {
    var hasLocation = false,
        locData = {
            latitude: null, longitude: null, 
            city: null, state: null, zipcode: null
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
            url: "/user/get_info/get_latlong_by_zipcode",
            dataType: "json",
            data: { zipcode: zipcode }
        }).then(function(data) {
            hasLocation = true;
            locData.zipcode = zipcode;
            locData.city = data.city;
            locData.state = convert_state(data.state,'abbrev');
            locData.latitude = data.latitude;
            locData.longitude = data.longitude;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        }).fail(function() {
            locData = {
                latitude: null, longitude: null, 
                city: null, state: null, zipcode: null
            };
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
            url: "/user/get_info/get_zipcode_by_latlong",
            dataType: "json",
            data: {
                latitude: latlon.latitude,
                longitude: latlon.longitude
            }
        }).then(function(data) {
            hasLocation = true;
            locData.city = data.city;
            locData.state = convert_state(data.state,'abbrev');
            locData.zipcode = data.zipcode;
            if (callback && callback.apply !== undefined)
                callback.apply(null, [locData]);
            else
                defaultCallback.apply(null, [locData]);
        }).fail(function() {
            //hasLocation = false;
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
                // clear if refresh and does not find location.
                locData = {
                    latitude: null, longitude: null, 
                    city: null, state: null, zipcode: null
                };
                hasLocation = false;
                console.error("getLocation call failed");
                if (failCallback && failCallback.apply !== undefined)
                    failCallback.apply(null);
            }).always(function() {
                //do nothing
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

$.validator.addMethod("digitonly", function(value) {
    return /^\d+$/.test(value);
}, "只能包含数字");
