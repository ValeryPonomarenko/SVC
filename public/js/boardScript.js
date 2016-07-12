$(function(){
    var socket = io();

    $('#addProjectButton').on('click', function(){
        $(this).button('loading');

        var projectInfo = {
            tag: $('#inputTag').val(),
            title: $('#inputTitle').val(),
            description: $('#inputDescription').val(),
            svn_url: $('#inputSvn').val()
        }
        socket.emit('add project', projectInfo);
    });

    socket.on('project added', function(projectInfo){
        $('#addProjectForm').trigger('reset');
        $('#addProjectButton').button('reset');
        var projectLink = $('<li><a href="/project/' + projectInfo.tag + '">' + projectInfo.title + '</a></li>');
        $('.divider').before(projectLink);
        $('#addProjectModal').modal('hide'); 
    });
    
    socket.on('project add error', function(error){
        $('#addProjectButton').button('reset');
        var projectLink = $('<div class="alert alert-danger alert-dismissible" role="alert" style="display: none"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + error.msg + '</div>');
        $('#addProjectForm').before(projectLink);
        $(projectLink).slideDown();
    });
});