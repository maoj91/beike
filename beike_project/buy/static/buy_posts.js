var buyPostPageNum = 1;
var current_position;
var hasMoreBuyPost = true;
var buypost_slot = 0;
var numPerPage;

var buyPostLoader = (function($, undefined) {
    var pub = {};
    pub.init = function() {
        //Refresh the posts when scrolling to the bottom
        $(window).live("hitBottom",
            function() {
                pub.getAndDisplayPosts();
            });
    };

    pub.getAndDisplayPosts = function(position) {
        //Starting loading animation
        $('#load-more').show();
        //Get posts and add success callback using then
        getBuyposts(position).then(function() {
            //Stop loading animation on success
            // $('#load-more').hide();
        });
    };

    pub.clearPosts = function() {
        $("#buypost-list-a").empty();
        $("#buypost-list-b").empty();
    }

    return pub;
}(jQuery));

function getBuyposts(position) {
    //Get posts via ajax
    return $.ajax({
        type: "get",
        url: "/buy/get_posts_by_page",
        dataType: "json",
        data: {
            pageNum: buyPostPageNum,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
    }).then(function(posts) {
        displayBuyposts(posts);
    });
}

function displayBuyposts(posts) {
    var listA = $("#buypost-list-a");
    var listB = $("#buypost-list-b");
    var i = 0,
        len = posts.length;
    //process posts data
    for (i = 0; i < len; i++) {
        var distance = posts[i]["distance"];
        if (posts[i]["distance"] > 1000) {
            distance = (posts[i]["distance"] / 1000).toFixed(2) + " K"
        }
        var postTemplate = $('<li class="sellpost-li"><div></div></li>');
        var content = $('<a href="/detail/buy/' + posts[i]['post_id'] + '" style="text-decoration:none; color: rgb(0,0,0);font-weight:normal;"></a>')
        content.append($('<div><p><img style="width: 20px; height: 20px; margin: 0px 0 -4px 0;" src="/static/images/nearby_buy_posts/request_logo.png" /><span style="font-size: 18px;">&nbsp;&nbsp;' + posts[i]["title"] + '</span></p></div>'))
        content.append($('<div style="font-size: 16px;"><span style="color: #ff9933;">$&nbsp;</span>' + posts[i]["min_price"] + '</div>'));
        content.append($('<div style="font-size: 12px; color: rgb(172,172,172);">距离你 ' + distance + ' miles</div>'));

        postTemplate.children().append(content);
        if (buypost_slot % 2 === 0) {
            listA.append(postTemplate);
        } else {
            listB.append(postTemplate);
        }
        buypost_slot++;
    }

    listA.listview("refresh");
    listB.listview("refresh");
    if (len < numPerPage) {
        hasMoreBuyPost = false;
        $('#load-more').hide();
    } else {
        hasMoreBuyPost = true;
        buyPostPageNum++;
    }
}

$(document).delegate("#nearby-buypost", "pageinit", function() {
    buyPostPageNum = 1;
    buyPostLoader.init();
    buyPostLoader.clearPosts();
    getCurrentPositionDeferred({
        enableHighAccuracy: true
    }).done(function(position) {
        current_position = position;
        buyPostLoader.getAndDisplayPosts(position);
    }).fail(function() {
        console.log("getCurrentPosition call failed")
    }).always(function() {
        //do nothing
    });
    numPerPage = $('#num-per-page').val();

    $(document).on("scrollstart", function() {
        if ($(document).height() > $(window).height() && hasMoreBuyPost) {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
                if (typeof current_position !== 'undefined') {
                    hasMoreBuyPost = false;
                    buyPostLoader.getAndDisplayPosts(current_position);
                }
            }
        }
    });

    $(document).on("scrollstop", function() {
        if ($(document).height() > $(window).height() && hasMoreBuyPost) {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
                if (typeof current_position !== 'undefined') {
                    hasMoreBuyPost = false;
                    buyPostLoader.getAndDisplayPosts(current_position);
                }
            }
        }
    });

});
