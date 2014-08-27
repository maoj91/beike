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
    var listA = $("#post-list-a");
    var listB = $("#post-list-b");
    var i = 0,
        len = posts.length;
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

        image_width = document.body.clientWidth * 0.4;
        image_height = image_info['height'] / image_info['width'] * image_width;
        var distance = posts[i]["distance"];
        if (posts[i]["distance"] > 1000) {
            distance = (posts[i]["distance"] / 1000).toFixed(0) + "K"
        }

        var postTemplate = $('<li class="sellpost-li"></li>');
        postTemplate.append($('<div><p><img style="width: 20px; height: 20px; margin: 0px 0 -4px 0;" src="/static/images/nearby_sell_posts/sell_logo.png" /><span style="font-size: 18px;">&nbsp;&nbsp;' + posts[i]["title"] + '</span></p></div>'));
        postTemplate.append($('<div><a href="/detail/sell/' + posts[i]['post_id'] + '"><img src="' + image_info['image_url'] + '" width="' + image_width + '" height="' + image_height + '"/></a></div>'));
        postTemplate.append($('<div style="font-size: 16px;"><span style="color: #ff9999;">$&nbsp;</span>' + posts[i]["price"] + '</div>'));
        postTemplate.append($('<div style="font-size: 12px; color: rgb(172,172,172);">距离你 ' + distance + ' miles</div>'));

        if (slot_pos % 2 === 0) {
            listA.append(postTemplate);
        } else {
            listB.append(postTemplate);
        }
        slot_pos++;
    }
    listA.listview("refresh");
    listB.listview("refresh");
    if (len < numPerPage) {
        hasMoreSellPost = false;
        $('#load-more').hide();
    } else {
        hasMoreSellPost = true;
        sellPostPageNum++;
    }

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
