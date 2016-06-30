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

    socket.on('get page', function (pageInfo) {
        $('button[data-id=' + pageInfo._id + ']').addClass('d_active');

        $('#page-info').fadeIn();
    })
});