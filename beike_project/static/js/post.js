/****************************************
 *    Buy/Sell posts list javascript    *
 ****************************************/
var postLoader = (function($, undefined) {
    var page, $page, // buy or sell
        $document = $(document),
        $window = $(window),
        $list1, $list2, $loadmore,
        postPageNum, numPerPage, hasMorePost, slotPos = 0,
        currentPosition,
        loadingPost = false,
        category = null,
        keyword = null,
    init = function(initPage) {
        page = initPage;
        $page = $('#'+page+'-list');
        
        $list1 = $page.children('.post-list1');
        $list2 = $page.children('.post-list2');
        $loadmore = $page.find('.post-load-more').show();
        numPerPage = $page.find('.num-per-page').val();
        clearPosts();
        
        getCurrentPositionDeferred({
            enableHighAccuracy: true
        }).done(function(position) {
            currentPosition = position;
            getAndDisplayPosts();
        }).fail(function() {
            console.error('getCurrentPosition call failed');
        }).always(function() {
            //do nothing
        });
        
        $(document).on('scrollstop', function() {console.log(page); getAndDisplayPosts(); });
    },
    clearPosts = function() {
        slot_pos = 0;
        postPageNum = 1;
        hasMorePost = true;
        $list1.empty();
        $list2.empty();
    },
    getAndDisplayPosts = function() {
        if (hasMorePost && (typeof currentPosition !== 'undefined') && $window.scrollTop()>=$document.height()-$window.height()-200) {
            getPosts();
        }
    },
    getPosts = function() {
        //Get posts via ajax
        return $.ajax({
            type: 'get',
            url: '/' + page + '/get_posts_by_page',
            dataType: 'json',
            data: {
                pageNum: postPageNum,
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
                category: category,
                keyword: keyword
            }
        }).then(function(posts) {
            displayPosts(posts);
        });
    },
    displayPosts = function(posts) {
        var tempList1 = $(''),
            tempList2 = $(''),
            i = 0, len = posts.length;
        if (len < numPerPage) {
            hasMorePost = false;
            $loadmore.hide();
        } else {
            hasMorePost = true;
            postPageNum++;
        }
        //process posts data
        for (i = 0; i < len; i++) {
            var distance = formatDistance(posts[i]['distance']), price, image_info_list, item;
            
            if (page === 'sell') {
                image_info_list = jQuery.parseJSON(posts[i]['image_info']);
                if (image_info_list.length > 0) {
                    //only display the first image
                    image_info = image_info_list[0];
                } else {
                    image_info = undefined;
                    continue;
                }
                
                item = '<img class="post-image" src="' + image_info['image_url'] + '" />'; 
                price = formatPrice(posts[i]["price"]);+ 
                        '</div>'+
                        '<div class="post-distance">距离你 ' + distance + ' miles</div>'+
                    '</a></div>';
            } else if (page === 'buy') {
                item = '';
                price = formatPrice(posts[i]["max_price"]);
            }
            
            item = '<div class="post-item-box">' +
                '<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '" data-transition="slide">' +
                    '<div>' +
                        '<img class="post-icon" src="/static/images/general/' + page + '_logo.png" />' +
                        '<span class="post-title">' + posts[i]["title"] + '</span>' +
                    '</div>' + item + 
                    '<div class="post-price">' +
                        '<span class="post-currency">$&nbsp;</span>' + price + 
                    '</div>' +
                    '<div class="post-distance">距离你 ' + distance + ' miles</div>' +
                '</a></div>';

            if (slotPos % 2 === 0) {
                tempList1.after($(item));
            } else {
                tempList2.after($(item));
            }
            slotPos++;
        }

        $list1.append(tempList1);
        $list2.append(tempList2);
    },
    refreshPosts = function() {
        $('#popupBasic-popup').removeClass('ui-popup-active');
        $('#popupBasic-popup').addClass('ui-popup-hidden');
        $('#popupBasic-popup').addClass('ui-popup-truncate');
        
        category = $('input[name="category"]:checked').val();
        keyword = $('#sellPostKeyword').val();
        
        clearPosts();
        getAndDisplayPosts();
    };
    
    return { 
        init: init,
        refreshPosts: refreshPosts
    };
}(jQuery));

$(document).delegate('#nearby-buypost', 'pagebeforeshow', function() {
    $(document).off('scrollstop');
    postLoader.init('buy');
});

$(document).delegate('#nearby-sellpost', 'pagebeforeshow', function() {
    $(document).off('scrollstop');
    postLoader.init('sell');
});
