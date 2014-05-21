function initiatePage() {
    // $('#email-checked').prop( "checked", true).checkboxradio('refresh');
}

function validateBuyForm() {
    var titleExist = false;
    var priceValid = false;
    var phoneValid = true;
    var qqValid = true;

    var title = $('[name="title"]').val();
    var min_price = $('[name="min_price"]').val();
    var max_price = $('[name="max_price"]').val();

    var phone_checked = $("#phone-checked").prop("checked")
    var qq_checked = $("#qq-checked").prop("checked")
    var phone_number = $('[name="phone_number"]').val();
    var qq_number = $('[name="qq_number"]').val();
    var content = $('[name="content"]').val();

    if (!title) {
        $('#title_required').html('输入项不能为空');
    } else {
        titleExist = true;
    }
    if (!min_price) {
        $('#price_required').html('输入项不能为空');
    } else if (!max_price) {
        $('#price_required').html('输入项不能为空');
    } else if (!isValidInteger(min_price) || !isValidInteger(max_price)) {
        $('#price_required').html('请检查您输入的价格');
    } else if (parseInt(min_price) >= parseInt(max_price)) {
        $('#price_required').html('最低价应小于最高价');
    } else {
        priceValid = true;
    }


    if (phone_checked) {
        if (!phone_number) {
            phoneValid = false;
            $('#phone_required').html('请提供电话号码');
        } else {
            $('#phone_required').html('');
        }
    }

    if (qq_checked) {
        if (!qq_number) {
            qqValid = false;
            $('#qq_required').html('请提供QQ号码，对方可添加您为微信好友');
        } else {
            $('#qq_required').html('');
        }
    }
    return titleExist && priceValid && phoneValid && qqValid;
}

function isValidInteger(str) {
    return (!isNaN(str)) && (str.indexOf(".") == -1);
}

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