/**
 * Created by Valera on 6/30/2016.
 */
$(function() {
    var pagePanelMargin = 0;

    if ($('#page-list').css('width') != undefined) {
        pagePanelMargin = $('#page-list').css('width').replace('px', '');
        if (pagePanelMargin > 100) {
            pagePanelMargin -= 25;
        } else {
            pagePanelMargin = 0;
        }
        $('#page-panel').css('margin-left', pagePanelMargin);
    }

    $('#summernote-add-page').summernote({
        minHeight: 400
    });

    $(window).resize(function () {
        if ($('#page-list').css('width') != undefined) {
            pagePanelMargin = $('#page-list').css('width').replace('px', '');
            if (pagePanelMargin > 100) {
                pagePanelMargin -= 25;
            } else {
                pagePanelMargin = 0;
            }
            $('#page-panel').css('margin-left', pagePanelMargin);
        }
    });

    $(document).on('click', 'button#page', function () {
        $('button.list-group-item.d_active').removeClass('d_active');
        var pathname = location.pathname.split('/');
        history.pushState('Wiki page', 'Title', '/wiki/' + pathname[2] + '/' + $(this).attr('data-id'));
        socket.emit('get page', $(this).attr('data-id'));
    });
    
    $('#buttonSendImages').click(function(){
        var files = $('#image-files').prop('files');
        
        for(var i = 0; i < files.length; i++){
            var reader = new FileReader();
            reader.onload = function(e){
                var buffer = e.target.result;
                socket.emit('send file', '-wiki_image.jpg', buffer);
            }
            reader.readAsBinaryString(files[i]);
        }
        
        $('#image-files').val('');
    });
    
    $(document).on('click', 'button#buttonRemoveImage', function(){
        var imageName = $(this).attr('data-name');
        $(this).parent().parent().parent().parent().fadeOut('500', function(){$(this).remove();});
        socket.emit('remove file', imageName);
    });

    socket.on('get page', function (pageInfo) {
        $('button[data-id=' + pageInfo._id + ']').addClass('d_active');

        $('#page-info').fadeIn();
    });
    
    socket.on('send file', function(imageName){
        var mediaImage = $('<div class="media" style="display: none;"><div class="media-left media-middle"><img src="'+'/attachments/'+imageName+'" alt="" class="media-object" style="height: 90px"></div><div class="media-body"><div class="input-group"><input type="text" class="form-control" value="/attachments/'+imageName+'" readonly><span class="input-group-btn"><button class="btn btn-danger" id="buttonRemoveImage" data-name="'+imageName+'"><i class="fa fa-remove"></i></button></span></div></div></div>');
        $('#images').append(mediaImage);
        mediaImage.fadeIn();
    });
});