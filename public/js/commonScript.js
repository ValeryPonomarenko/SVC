/**
 * Created by Valera on 6/30/2016.
 */
var socket = io();
$(function() {
    $('[data-toggle="tooltip"]').tooltip();

    socket.on('project added', function (projectInfo) {
        var projectLink = $('<li><a href="/project/' + projectInfo.tag + '">' + projectInfo.title + '</a></li>');
        $('.divider').before(projectLink);
    });
});