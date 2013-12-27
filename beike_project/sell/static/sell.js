function cloneMore(selector, type) {
    var newElement = $(selector).clone(true);
    var total = $('#id_' + type + '-TOTAL_FORMS').val();
    newElement.find(':input').each(function() {
        var name = $(this).attr('name').replace('-' + (total-1) + '-','-' + total + '-');
        var id = 'id_' + name;
        $(this).attr({'name': name, 'id': id}).val('').removeAttr('checked');
    });
    newElement.find('label').each(function() {
        var newFor = $(this).attr('for').replace('-' + (total-1) + '-','-' + total + '-');
        $(this).attr('for', newFor);
    });
    total++;
    $('#id_' + type + '-TOTAL_FORMS').val(total);
    $(selector).after(newElement);
}


function image_upload(){
    $('#status').html('Upload progress: ' );
}
	
function s3_upload_copy(){
    $('#status').html('Upload progress: ' );
    var s3upload = new S3Upload({
        file_dom_selector: '#file',
        s3_sign_put_url: 'sign_s3/',

        onProgress: function(percent, message) {
            $('#status').html('Upload progress: ' + percent + '%' + message);
        },
        onFinishS3Put: function(url) {
            $('#status').html('Upload completed. Uploaded to: '+ url);
            $("#avatar_url").val(url);
            $("#preview").html('<img src="'+url+'" style="width:300px;" />');
        },
        onError: function(status) {
            $('#status').html('Upload error: ' + status);
        }
    });
}
