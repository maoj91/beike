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
        page = initPage;console.log(page+" init");
        $page = $('#'+page+'-list');
        
        $list1 = $page.children('.post-list1');
        $list2 = $page.children('.post-list2');
        $loadmore = $page.find('.post-load-more').show();
        numPerPage = $page.find('.num-per-page').val();
        clearPosts();
        
        hasMorePost = true;
        locUtil.getLocation(function(data) {
            currentPosition = data;
            getAndDisplayPosts();
        });
        
        $(document).on('scrollstop', function() { 
            if ($window.scrollTop() >= $document.height() - $window.height() - 200)
                getAndDisplayPosts();
        });
    },
    clearPosts = function() {
        slot_pos = 0;
        postPageNum = 1;
        hasMorePost = true;
        $list1.empty();
        $list2.empty();
    },
    getAndDisplayPosts = function() {
        if (hasMorePost && (typeof currentPosition !== 'undefined')) {
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
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
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
                price = formatPrice(posts[i]["price"]);
            } else if (page === 'buy') {
                item = '';
                price = formatPrice(posts[i]["max_price"]);
            }
            
            item = '<div class="post-item-box">' +
                '<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '" data-transition="slide">' +
                //'<a class="post-item" onmousedown="postLoader.loadPage('+posts[i]['post_id']+');" onmouseup="postLoader.changePage('+posts[i]['post_id']+');">' +
                    '<div>' +
                        '<img class="post-icon" src="/static/images/general/' + page + '_icon_40.png" />' +
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
    loadPage = function(id) {
        /*setTimeout(function() {$('body').pagecontainer('load', '/detail/'+page+'/'+id).on('pagecontainerload', function() {
            console.log('loaded');aaloaded=true;$('body').off('pagecontainerload');});
        }, 300);*/
    },
    changePage = function(id) {
//console.log('change');
        //if (aaloaded) {
            //$('body').off('pagecontainerload'); aaloaded = false; console.log('why');
            $('body').pagecontainer('change', '/detail/'+page+'/'+id);//$('body').off('pagecontainerload');
        /*}
        else
            $('body').on('pagecontainerload', function(event, ui) {
                console.log('loaded2');
                $('body').off('pagecontainerload'); aaloaded = false;
                $('body').pagecontainer('change', ui.content, {transition: 'slide'});$('body').off('pagecontainerload');
            });*/
        
    },
    refreshPosts = function() {
        $('#popupBasic-popup').removeClass('ui-popup-active');
        $('#popupBasic-popup').addClass('ui-popup-hidden');
        $('#popupBasic-popup').addClass('ui-popup-truncate');
        
        category = $('input[name="category"]:checked').val();
        keyword = $('#sellPostKeyword').val();
        locUtil.getLocByZip($('#zipcode').val(), function(data) {
            currentPosition = data;
            clearPosts();
            getAndDisplayPosts();
        });
    };
    
    return { 
        init: init,
        refreshPosts: refreshPosts,
        loadPage: loadPage,
        changePage: changePage
    };
}(jQuery));

$(document).delegate('#nearby-buypost', 'pagebeforeshow', function() {
    if ($('.ui-page-active').attr('id') !== 'buy-detail')
    {
        $(document).off('scrollstop');
        postLoader.init('buy');
        //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();WeixinApi.showOptionMenu();});
    }
//$('#zipcode').keypress(function (e) { if (e.which == 13) toggleExtra(); });
//$('#sellPostKeyword').keypress(function (e) { if (e.which == 13) {hideCategory(1);$(this).blur();} });
});

$(document).delegate('#nearby-sellpost', 'pagebeforeshow', function() {
    if ($('.ui-page-active').attr('id') !== 'sell-detail')
    {
        $(document).off('scrollstop');
        postLoader.init('sell'); //console.log('refresh');
        //WeixinApi.ready(function() {WeixinApi.hideOptionMenu();WeixinApi.showOptionMenu();});
    }
$('#zipcode').keypress(function (e) { if (e.which == 13) {toggleExtra();$(this).blur();} });
$('#sellPostKeyword').keypress(function (e) { if (e.which == 13) {hideCategory(1);$(this).blur();} });
$('.ui-checkbox:not(.up)').on('click', function() { $('#sellPostKeyword').focus(); });
//$('.search-icon.location-go').on('click', function() { toggleExtra(); });
});


function toggleExtra() {
    $('.search-bar').toggleClass('search-extra');
    if ( $('.search-bar').hasClass('search-extra') )
        setTimeout(function() {$('#zipcode').focus();}, 600);
    else
        postLoader.refreshPosts();
}
function showCategory() {
    $('.search-category-box').addClass('search-category-on');
}
function hideCategory(refresh) {
    $('.search-category-box').removeClass('search-category-on');
    if (refresh) postLoader.refreshPosts();
}

