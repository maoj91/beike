/******************************/
/* Sell posts dynamic loading */
/******************************/

var numPerPage;
var sellPostPageNum = 1;
var sellPostCurLatLon = {};
var hasMoreSellPost = true;
var slot_pos = 0;
var category = '';
var keyword = '';

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
        category = sellPostCategory;
        keyword = sellPostKeyword;
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
    return pub;
}(jQuery));

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
    }).then(function(posts) {
        displayPosts(posts);
    });
}

function displayPosts(posts) {
    var listA = $(""),
        listB = $(""),
        i = 0,
        len = posts.length,
        image_width = document.body.clientWidth * 0.4;
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

        var distance = posts[i]["distance"];
        if (posts[i]["distance"] > 1000) {
            distance = (posts[i]["distance"] / 1000).toFixed(0) + "K"
        }
        var item = $('<div class="post-item-div">'+
            '<a class="post-item" href="/detail/sell/' + posts[i]['post_id'] + '">'+
                '<div>'+
                    '<img class="post-icon" src="/static/images/nearby_sell_posts/sell_logo.png" />'+
                    '<span class="post-title">' + posts[i]["title"] + '</span>'+
                '</div>'+
                '<img class="post-image" src="' + image_info['image_url'] + '" width="' + image_width + '" height="' + image_height + '"/>'+
                '<div class="post-price">'+
                    '<span class="post-currency">$&nbsp;</span>' + posts[i]["min_price"]+ 
                '</div>'+
                '<div class="post-distance">距离你 ' + distance + ' miles</div>'+
            '</a></div>');

        if (slot_pos % 2 === 0) {
            listA.after(item);
        } else {
            listB.after(item);
        }
        slot_pos++;
    }
    if (len < numPerPage) {
        hasMoreSellPost = false;
        $('#load-more').hide();
    } else {
        hasMoreSellPost = true;
        sellPostPageNum++;
    }
    $("#sellpost-list1").append(listA);
    $("#sellpost-list2").append(listB);
}

function refreshSellPosts() {
    $('#popupBasic-popup').removeClass('ui-popup-active');
    $('#popupBasic-popup').addClass('ui-popup-hidden');
    $('#popupBasic-popup').addClass('ui-popup-truncate');
    slot_pos = 0;
    var zipcode = $('#zipcode').val();
    var sellPostCategory = 0;
    sellPostCategory = $('input[name="category"]:checked').val();
    var sellPostKeyword = $('#sellPostKeyword').val();
    $.ajax({
        type: "get",
        url: "/user/get_info/get_latlong_by_zipcode",
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
    document.getElementById("zipcode").value = '';
    document.getElementById("sellPostKeyword").value = '';
    if (sellPostCategory != 0) {
        $('input[name=category][value=]').prop("checked", true).checkboxradio("refresh");
        $('input[name=category][value=' + sellPostCategory + ']').prop("checked", false).checkboxradio("refresh");
    }
    return false;
}


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
    numPerPage = $('#num-per-page').val();

    $(document).on("scrollstart", function() {

        if ($(document).height() > $(window).height() && hasMoreSellPost) {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 200) {
                if (typeof sellPostCurLatLon !== 'undefined') {
                    hasMoreSellPost = false;
                    sellPostLoader.getAndDisplayPosts(sellPostCurLatLon, category, keyword);
                }
            }
        }
    });
    $(document).on("scrollstop", function() {

        if ($(document).height() > $(window).height() && hasMoreSellPost) {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 200) {
                if (typeof sellPostCurLatLon !== 'undefined') {
                    hasMoreSellPost = false;
                    sellPostLoader.getAndDisplayPosts(sellPostCurLatLon, category, keyword);
                }
            }
        }
    });
});
