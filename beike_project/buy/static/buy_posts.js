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

function formatPrice(price) {
    var i = parseFloat(price),
        s = i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (s.indexOf('.') < 0) { s += '.00'; }
    if (s.indexOf('.') == (s.length - 2)) { s += '0'; }
    return s;
}

function displayBuyposts(posts) {
    var listA = $(""),
        listB = $(""),
        i = 0, len = posts.length;
    for (i = 0; i < len; i++) {
        var distance = posts[i]["distance"];
        if (posts[i]["distance"] > 1000) {
            distance = (posts[i]["distance"] / 1000).toFixed(2) + "k"
        }
        var item = $('<div class="post-item-div">'+
            '<a class="post-item" href="/detail/buy/' + posts[i]['post_id'] + '">'+
                '<div>'+
                    '<img class="post-icon" src="/static/images/general/buy_logo.png" />'+
                    '<span class="post-title">' + posts[i]["title"] + '</span>'+
                '</div>'+
                '<div class="post-price">'+
                    '<span class="post-currency">$&nbsp;</span>' + formatPrice(posts[i]["max_price"])+ 
                '</div>'+
                '<div class="post-distance">距离你 ' + distance + ' miles</div>'+
            '</a></div>');
        
        if (slot_pos % 2 === 0) {
            listA.after(item);
        } else {
            listB.after(item);
        }
        slot_pos++;
        buypost_slot++;
    }
    
    if (len < numPerPage) {
        hasMoreBuyPost = false;
        $('#load-more').hide();
    } else {
        hasMoreBuyPost = true;
        buyPostPageNum++;
    }
    $("#buypost-list1").append(listA);
    $("#buypost-list2").append(listB);
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
