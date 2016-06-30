/**
 * Created by Valera on 6/30/2016.
 */
$(function(){
    var pagePanelMargin = $('#page-list').css('width').replace('px', '');
    if(pagePanelMargin > 100){
        pagePanelMargin-=25;
    } else {
        pagePanelMargin=0;
    }
    $('#page-panel').css('margin-left', pagePanelMargin);
    
    $('#summernote').summernote({
        minHeight:null,
        maxHeight: 200,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'strikethrough']],
            ['font', ['fontsize', 'color']],
            ['paragraph', ['ol', 'ul', 'paragraph']]
        ]
    });

    $(window).resize(function(){
        pagePanelMargin = $('#page-list').css('width').replace('px', '');
        if(pagePanelMargin > 100){
            pagePanelMargin-=25;
        } else {
            pagePanelMargin=0;
        }
        $('#page-panel').css('margin-left', pagePanelMargin);
    });

    $(document).on('click', 'button#page', function(){
        $('button.list-group-item.d_active').removeClass('d_active');
        var pathname = location.pathname.split('/');
        history.pushState('Wiki page', 'Title', '/wiki/'+pathname[2]+'/'+$(this).attr('data-id'));
        socket.emit('get page', $(this).attr('data-id'));
    });

    socket.on('get task', function(pageInfo){
        $('button[data-id='+pageInfo._id+']').addClass('d_active');

        $('#page-info').fadeIn();
    })
});