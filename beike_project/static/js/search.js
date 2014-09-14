// search
function toggleKeyword() {
    $('.search-bar').toggleClass('search-keyword');
    if ( $('.search-bar').hasClass('search-keyword') )
        setTimeout(function() {$('#sellPostKeyword').focus();}, 600);
    else
        postLoader.refreshPosts();
}
function toggleLocation() {
    $('.search-bar').toggleClass('search-location');
    if ( $('.search-bar').hasClass('search-location') )
        setTimeout(function() {$('#zipcode').focus();}, 600);
    else
        postLoader.refreshPosts();
}
function toggleCategory() {
    $('.search-category-box').toggleClass('search-category');
    if ( !$('.search-category-box').hasClass('search-category') )
        postLoader.refreshPosts();
}
$('#sellPostKeyword').keypress(function (e) {
    if (e.which == 13) {
        toggleKeyword();
    }
});
$('#zipcode').keypress(function (e) {
    if (e.which == 13) {
        toggleLocation();
    }
});

