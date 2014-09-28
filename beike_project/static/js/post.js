/****************************************
 *    Buy/Sell posts list javascript    *
 ****************************************/
var postLoaderConstructor = function() { return (function($, undefined) {
    var page, $page, // buy or sell
        $document = $(document),
        $window = $(window),
        $list1, $list2, $loadmore,
        $searchbar, $searchbox, $zip, $keyword,
        postPageNum, numPerPage, hasMorePost, slotPos = 0,
        currentPosition,
        loadingPost = false,
        category = null,
        keyword = null,
    toggleExtra = function() {
        $searchbar.toggleClass('search-extra');
        if ( $searchbar.hasClass('search-extra') )
            setTimeout(function() { $zip.focus(); }, 600);
        else {
            refreshPosts();
            $page.find(".post-ask-location").hide();
        }
    },
    showCategory = function() {
        $searchbox.addClass('search-category-on');
    },
    hideCategory = function(refresh) {
        $searchbox.removeClass('search-category-on');
        if (refresh) refreshPosts();
    },
    init = function(initPage) {
        console.log(initPage+" init");
        page = initPage;
        $page = $('#nearby-'+page+'post');

        $list1 = $page.find('.post-list1');
        $list2 = $page.find('.post-list2');
        $loadmore = $page.find('.post-load-more').show();
        $zip = $page.find('#zipcode');
        $keyword = $page.find('#searchKeyword');
        $searchbar = $page.find('.search-bar');
        $searchbox = $page.find('.search-category-box');
        numPerPage = $page.find('.num-per-page').val();
        clearPosts();
        
        hasMorePost = true;
        locUtil.getLocation(function(data) {
            $zip.val(data.zipcode);
            currentPosition = data;
            getAndDisplayPosts();
        }, function() {
            clearPosts();
            toggleExtra();
            $loadmore.hide();
            $page.find(".post-ask-location").show();
        });
        
        $(document).on('scrollstop', function() { //alert($window.scrollTop()+','+$document.height()+','+$window.height());
            if (($('.ui-page-active')[0].id === 'nearby-'+page+'post') && ($window.scrollTop() >= $document.height() - $window.height() - 200)) {
                getAndDisplayPosts();
            }
        });

        $zip.keypress(function (e) { 
            if (e.which == 13) { toggleExtra(); $(this).blur(); }
        });

        $keyword.keypress(function (e) { 
            if (e.which == 13) { hideCategory(1); $(this).blur(); } 
        });

        $page.find('.ui-radio').on('click', function() {
            $keyword.focus();
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
                //'<a class="post-item" href="/detail/' + page + '/' + posts[i]['post_id'] + '" data-transition="slide">' +
                '<a class="post-item" onmousedown="'+page+'PostLoader.loadPage('+posts[i]['post_id']+');" onmouseup="'+page+'PostLoader.changePage('+posts[i]['post_id']+');">' +
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
        
        if ($list1.is(":empty") && $list2.is(":empty")) $page.find(".post-empty").show();
        else $page.find(".post-empty").hide();
    },
    loadPage = function(id) {
        /*setTimeout(function() {$('body').pagecontainer('load', '/detail/'+page+'/'+id).on('pagecontainerload', function() {
            console.log('loaded');aaloaded=true;$('body').off('pagecontainerload');});
        }, 300);*/
    },
    changePage = function(id) {
        hideCategory(0);
//console.log('change');
        //if (aaloaded) {
            //$('body').off('pagecontainerload'); aaloaded = false; console.log('why');
            $('body').pagecontainer('change', '/detail/'+page+'/'+id);
            //$('body').off('pagecontainerload');
        /*}
        else
            $('body').on('pagecontainerload', function(event, ui) {
                console.log('loaded2');
                $('body').off('pagecontainerload'); aaloaded = false;
                $('body').pagecontainer('change', ui.content, {transition: 'slide'});$('body').off('pagecontainerload');
            });*/
        
    },
    refreshPosts = function() {
        //$page.find('#popupBasic-popup').removeClass('ui-popup-active');
        //$page.find('#popupBasic-popup').addClass('ui-popup-hidden');
        //$page.find('#popupBasic-popup').addClass('ui-popup-truncate');
        category = $page.find('input[name="category"]:checked').val();
        keyword = $keyword.val();
        locUtil.getLocByZip($zip.val(), function(data) {
            currentPosition = data;
            clearPosts();
            getAndDisplayPosts();
        }, function() {
            clearPosts();
            toggleExtra();
            $loadmore.hide();
            $page.find(".post-ask-location").show();
        });
    };
    
    return { 
        init: init,
        refreshPosts: refreshPosts,
        loadPage: loadPage,
        changePage: changePage,
        toggleExtra: toggleExtra,
        showCategory: showCategory,
        hideCategory: hideCategory
    };
}(jQuery)); };

var buyPostLoader = postLoaderConstructor();
var sellPostLoader = postLoaderConstructor();
