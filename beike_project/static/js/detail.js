/****************************************
 *   Buy/Sell post detail javascript    *
 ****************************************/
var detailLoader = (function($, undefined) {
    var page, $page,
        wx_id, post_id,

    init = function(initPage) {
        page = initPage;
        $page = $('#'+page+'-detail');
        wx_id = $page.find('#wx_id').val();
        post_id = $page.find('#post_id').val();

        var $price = $page.find('.detail-price');
        $price.html(formatPrice($price.html()));
        
        $page.find('#follow-post').on('slidestop', function(event) {
            var follow_option = $(this).val();
            return $.ajax({
                type: "get",
                url: '/'+page+'/follow_post',
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    follow_option: follow_option
                }
            }).then(function(data) {});
        });

        $page.find('#open-close-post').on('slidestop', function(event) {
            var operation = $(this).val();
            return $.ajax({
                type: "get",
                url: '/'+page+'/open_close_post',
                dataType: "json",
                data: {
                    wx_id: wx_id,
                    post_id: post_id,
                    operation: operation
                }
            }).then(function(data) {});
        });
        
        showFollowStatus();
        showPostStatus();
    },
    toggleFollowStatus = function() {
        var is_followed = $page.find('#is_followed').val(); 
        var follow_img = '';   
        var popup_msg = '';
        if( is_followed == 'False'){
            is_followed = 'True';
            follow_img = '/static/images/detail/followed.png';
            popup_msg = '<p>关注本帖!</p>';
        } else {
            is_followed = 'False';
            popup_msg = '<p>取消关注！</p>';
            follow_img = '/static/images/detail/not_followed.png';
        }
        $page.find('#is_followed').val(is_followed);
        $page.find('#follow').attr('src', follow_img);
        $page.find('#follow-popup').html(popup_msg);
        $page.find('#follow-popup').popup('open');
        setTimeout(function() {
            $page.find('#follow-popup').popup('close');
        }, 1000);
        $.ajax({
            type: 'get',
            url: '/' + page + '/follow_post',
            dataType: 'json',
            data: {
                wx_id: wx_id,
                post_id: post_id,
                is_followed: is_followed
            }
        }).then(function(data) {

        });
    },
    showFollowStatus = function() {
        var is_followed = $page.find('#is_followed').val();
        if( is_followed == 'False'){
            $page.find('#follow').attr('src', '/static/images/detail/not_followed.png');
        } else {
            $page.find('#follow').attr('src', '/static/images/detail/followed.png');
        }
    },
    showShareMsg = function() {
        $page.find('#share_msg').show();
    },
    hideShareMsg = function() {
        $page.find('#share_msg').hide();
    };

    showPostStatus = function() {
        var is_open = $page.find('#is_open').val();
        if( is_open == 'False'){
            $page.find('#open .ui-btn-text').text('标记为待售');
        } else {
            $page.find('#open .ui-btn-text').text('标记为已售');
        }
    };

    togglePostStatus = function() {
        var is_open = $page.find('#is_open').val(); 
        
        var msg = '';
        if( is_open == 'False'){
            is_open = 'True';
            msg = "标记为已售";
        } else {
            is_open = 'False';
            msg = "标记为待售";
        }
        $page.find('#is_open').val(is_open);
        $page.find('#open .ui-btn-text').text(msg);

        $.ajax({
            type: 'get',
            url: '/' + page + '/toggle_post',
            dataType: 'json',
            data: {
                wx_id: wx_id,
                post_id: post_id,
                is_open: is_open
            }
        }).then(function(data) {

        });
    };

    return {
        init: init, 
        showFollowStatus: showFollowStatus,
        toggleFollowStatus: toggleFollowStatus,
        showShareMsg: showShareMsg,
        hideShareMsg: hideShareMsg, 
        showPostStatus: showPostStatus,
        togglePostStatus: togglePostStatus
    };
}(jQuery));

$(document).delegate('#sell-detail', 'pagebeforeshow', function(event) {
//$("body").on('pagecontainerbeforetransition', function() {
    detailLoader.init('sell');
    gallerySwiper.init($('#sell-detail .gallery'));
});

$(document).delegate('#buy-detail', 'pagebeforeshow', function(event) {
    detailLoader.init('buy');
});

$(document).delegate('#sell-edit', 'pagebeforeshow', function(event) {
    formLoader.init('sell', $('#sell-edit'));
    gallerySwiper.init($('#sell-edit .gallery'));
});

$(document).delegate('#buy-edit', 'pagebeforeshow', function(event) {
    formLoader.init('buy', $('#buy-edit'));
});

