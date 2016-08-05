$(function() {
    var showSettings = false;
    var settingsWidth = $('#sortMenu').width() + 10;
    var taskPanelMargin = 0;

    if ($('#task-list').css('width') != undefined) {
        taskPanelMargin = $('#task-list').css('width').replace('px', '');
        if (taskPanelMargin > 946) {
            taskPanelMargin -= 25;
            $('#task-panel').css('position', 'fixed');
        } else {
            taskPanelMargin = 0;
            $('#task-panel').removeAttr('style');
        }
        $('#task-panel').css('margin-left', taskPanelMargin);
    }

    $('#summernote').summernote({
        minHeight: null,
        maxHeight: 200,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'strikethrough']],
            ['font', ['fontsize', 'color']],
            ['paragraph', ['ol', 'ul', 'paragraph']]
        ]
    });

    $(window).resize(function () {
        if ($('#task-list').css('width') != undefined) {
            taskPanelMargin = $('#task-list').css('width').replace('px', '');
            if (taskPanelMargin > 946) {
                taskPanelMargin -= 25;
                $('#task-panel').css('position', 'fixed');
            } else {
                taskPanelMargin = 0;
                $('#task-panel').removeAttr('style');
            }
            $('#task-panel').css('margin-left', taskPanelMargin);
        }
    });

    $('#showSortMenu').on('click', function () {
        if (showSettings) {
            $('#settingButtons').animate({
                right: '-=' + settingsWidth + 'px'
            }, 800, function () {
            });
            $('#sortMenu').animate({
                opacity: 0
            }, 800, function () {
            });
        } else {
            $('#settingButtons').animate({
                right: '+=' + settingsWidth + 'px'
            }, 800, function () {
            });
            $('#sortMenu').animate({
                opacity: 1
            }, 800, function () {
            });
        }
        showSettings = !showSettings;
    });

    $(document).on('click', 'button#task', function () {
        $('button.list-group-item.d_active').removeClass('d_active');
        var pathname = location.pathname.split('/');
        history.pushState('Task', 'Title', '/project/' + pathname[2] + '/' + $(this).attr('data-id'));
        socket.emit('get task', $(this).attr('data-id'));
    });

    $('button#addTaskButton').click(function () {
        $(this).button('loading');
        var task = {
            project_id: location.pathname.split('/')[2],
            title: $('#inputTitle').val(),
            description: $('#summernote').summernote('code'),
            label: $('#inputLabel').val(),
            priority: $('#inputPriority').val(),
            attachments: 'attachments',
            due_date: $('#inputDate').val(),
            wikiPageId: $('#inputWikiPage').val()
        };

        socket.emit('add task', task);
    });

    $('button#deleteTaskButton').click(function () {
        var pathname = location.pathname.split('/');
        socket.emit('remove task', pathname[pathname.length - 1]);
    });
    
    $('button#assignToMe').click(function(){
        if($('#assignedUser').is(':empty')){
            var pathname = location.pathname.split('/');
            socket.emit('assignee added', $('span#username').text(), pathname[pathname.length-1]);
        }
    });

    socket.on('task add error', function (error) {
        $('#addTaskButton').button('reset');
        var errorDiv = $('<div class="alert alert-danger alert-dismissible" role="alert" style="display: none"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + error.msg + '</div>');
        $('#addTaskForm').before(errorDiv);
        $(errorDiv).slideDown();
    });

    socket.on('task added', function (taskInfo) {
        if (taskInfo.project_id != location.pathname.split('/')[2]) {
            return;
        }
        $('#addTaskForm').trigger('reset');
        $('#summernote').summernote('code', '');
        $('#addTaskButton').button('reset');
        var taskButton = $('<button class="list-group-item ' + taskInfo.label + '" id="task" data-id="' + taskInfo.id + '">' + taskInfo.title + '</button>');
        $('#tasks').append(taskButton);
        $('#addTaskModal').modal('hide');
    });

    socket.on('get task', function (taskInfo, comments) {
        $('button[data-id=' + taskInfo._id + ']').addClass('d_active');
        $('#task-heading').text(taskInfo.title);
        $('#task-description').html(taskInfo.description);
        $('#o-' + taskInfo.state).trigger('click');
        $('#task-label').text(taskInfo.label);
        $('#task-priority').text(taskInfo.priority);
        $('#task-status').text(taskInfo.state);
        $('#task-duedate').text(taskInfo.due_date);
        $('#task-wikiPageId').attr('href', '/wiki/'+taskInfo.project_id+'/'+taskInfo.wikiPageId);
        
        if(taskInfo.assignee != undefined){
            $('button#assignToMe').fadeOut();
            $('#assignedUser').text(taskInfo.assignee);
        } else {
            $('button#assignToMe').fadeIn();
            $('#assignedUser').empty();
        }
        
        $('#task-info').fadeIn();
    })

    socket.on('remove task', function (taskId) {
        var pathname = location.pathname.split('/');
        if (taskId == pathname[pathname.length - 1]) {
            $('#task-info').fadeOut();
            history.pushState('Task', 'Title', '/project/' + pathname[2]);
        }
        $('button[data-id=' + taskId + ']').fadeOut(500, function () {
            $(this).remove();
        });
    });
    
    socket.on('assignee added', function (username, taskId){
        var pathname = location.pathname.split('/');
        if (taskId == pathname[pathname.length - 1]) {
            $('button#assignToMe').fadeOut();
            $('#assignedUser').append('<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzu947KXQJ74ZYxf5DPPUH0sAYLLSG--wXYM8XJ2wA_JNggPDh3Q9Fgfg" alt="" style="width:20px;">'+username);
        }
    });
});