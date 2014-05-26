var buyPostPageNum = 1;
var current_position;
var hasMoreBuyPost = true;

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
        }).then(function(data) {
            displayBuyposts(data);
        });
    }

    function displayBuyposts(posts) {
        var listA = $("#buypost-list-a");
        var listB = $("#buypost-list-b");
        var i = 0,
            len = posts.length;
        //process posts data
        for (i = 0; i < len; i++) {
            var displayCss = "horizontal-li";
            if (i % 2 === 0) {
                displayCss = "vertical-li";
            }
            var template = '<li class="' + displayCss + '"><div><a href="/detail/buy/' + posts[i]['post_id'] + '"><img width="20" height="20" src="/static/images/nearby_buy_posts/request_logo.png" /></a></div><div>' +
                posts[i]["title"] + '</div><div> $' + posts[i]["min_price"] + ' - $' +
                posts[i]["max_price"] +
                '</div><div>距离你 ' + posts[i]["distance"] + ' miles</div></li>';
            if (i % 2 === 0) {
                listA.append(template);
            } else {
                listB.append(template);
            }
        }

        listA.listview("refresh");
        listB.listview("refresh");
        if (len == 0) {
            hasMoreBuyPost = false;
            $('#load-more').hide();
        } else {
            hasMoreBuyPost = true;
            buyPostPageNum++;
        }
    }
    return pub;
}(jQuery));

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
});

$(document).delegate("#buy-form", "pageinit", function(event) {
    $('form').validate({
        errorPlacement: function(error, element) {
            if (element.is('select')) {
                error.insertAfter(element.parents('div.ui-select'));
            } else {
                error.insertAfter(element);
            }
        }
    });
});