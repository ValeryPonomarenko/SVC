/**
 * Created by Valera on 6/30/2016.
 */
$(function() {
    var pagePanelMargin = 0;

    if ($('#page-list').css('width') != undefined) {
        pagePanelMargin = $('#page-list').css('width').replace('px', '');
        if (pagePanelMargin > 946) {
            pagePanelMargin -= 25;
            $('#page-panel').css('position', 'fixed');
        } else {
            pagePanelMargin = 0;
            $('#page-panel').removeAttr('style');
        }
        $('#page-panel').css('margin-left', pagePanelMargin);
    }

    $('#summernote-add-page').summernote({
        minHeight: 400
    });

    $(window).resize(function () {
        if ($('#page-list').css('width') != undefined) {
            pagePanelMargin = $('#page-list').css('width').replace('px', '');
            if (pagePanelMargin > 946) {
                pagePanelMargin -= 25;
                $('#page-panel').css('position', 'fixed');
            } else {
                pagePanelMargin = 0;
                $('#page-panel').removeAttr('style');
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
        if(files.length == 0) return;
        
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
    
    $('#buttonSavePage').click(function(){
        var pathname = location.pathname.split('/');
        
        var project_id = pathname[pathname.length-2];
        var page_title = $('#page_title').val();
        var pageContent = $('#summernote-add-page').summernote('code');
        var imageAttachments = Array();
        
        if(page_title == '') { 
            $('#page_title').trigger('focus');
            return;
        }
        
        $("button[id='buttonRemoveImage']").each(function(i, el){
             imageAttachments.push($(this).attr('data-name'));
        });
        
        var pageInfo = {
            project_id: project_id,
            page_title: page_title,
            content: pageContent,
            attachments: imageAttachments
        };
        
        socket.emit('add wiki', pageInfo);
    });
    
    $(document).on('click', 'button#buttonRemoveImage', function(){
        var imageName = $(this).attr('data-name');
        $(this).parent().parent().parent().parent().fadeOut('500', function(){$(this).remove();});
        socket.emit('remove file', imageName);
    });
    
    $('#deletePageButton').click(function(){
        var pathname = location.pathname.split('/');
        socket.emit('remove page', pathname[pathname.length - 1]);
    });

    socket.on('get page', function (pageInfo) {
        $('button[data-id=' + pageInfo._id + ']').addClass('d_active');
        $('#page-heading').text(pageInfo.title);
        $('#page-body').html(pageInfo.text);
        $('#editPageButton').attr('href', '/wiki/'+pageInfo.project_id+'/'+pageInfo._id+'/edit');
        $('#page-info').fadeIn();
    });
    
    socket.on('send file', function(imageName){
        var mediaImage = $('<div class="media" style="display: none;"><div class="media-left media-middle"><img src="'+'/attachments/'+imageName+'" alt="" class="media-object" style="height: 90px"></div><div class="media-body"><div class="input-group"><input type="text" class="form-control" value="/attachments/'+imageName+'" readonly><span class="input-group-btn"><button class="btn btn-danger" id="buttonRemoveImage" data-name="'+imageName+'"><i class="fa fa-remove"></i></button></span></div></div></div>');
        $('#images').append(mediaImage);
        mediaImage.fadeIn();
    });
    
    socket.on('page status', function(msg){
        var pageStatus = $('<div class="alert alert-warning alert-dismissible" role="alert" style="display: none"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + msg + '</div>');
        $('#page-form').before(pageStatus);
        pageStatus.fadeIn();
    });
    
    socket.on('page added', function(pageInfo){
        if (pageInfo.project_id != location.pathname.split('/')[2]) {
            return;
        }
        alert('page added');
        var pageButton = $('<button class="list-group-item" id="page" data-id="' + pageInfo._id + '">' + pageInfo.title + '</button>');
        $('#pages').append(pageButton);
    });
    
    socket.on('remove page', function(pageId){
        var pathname = location.pathname.split('/');
        if (pageId == pathname[pathname.length - 1]) {
            $('#page-info').fadeOut();
            history.pushState('Page', 'Title', '/wiki/' + pathname[2]);
        }
        $('button[data-id=' + pageId + ']').fadeOut(500, function () {
            $(this).remove();
        }); 
    });
});