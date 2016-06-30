var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var BoardController = require('./controllers/boardController');
var ProjectController = require('./controllers/projectController');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
    res.render('index');
});

app.get('/board', function(req, res){
    BoardController.MakeView(req, res);
});

app.get('/project/:projectId', function(req, res){
    ProjectController.MakeTaskView(req, res);
});

app.get('/project/:projectId/kanban', function(req, res){
    ProjectController.MakeKanbanView(req, res);
});

app.get('/project/:projectId/report', function(req, res){
    ProjectController.MakeReportView(req, res);
});

app.get('/project/:projectId/:taskId', function(req, res){
    ProjectController.MakeTaskViewWithTask(req, res, req.params.taskId);
});

io.on('connection', function(socket){
    socket.on('add project', function(projectInfo){
        BoardController.AddProject(socket, projectInfo);
    });
    socket.on('add task', function(taskInfo){
        ProjectController.AddTask(socket, taskInfo);
    });
    socket.on('get task', function(taskId){
        ProjectController.GetTask(socket, taskId);
    });
    socket.on('remove task', function(taskId){
        ProjectController.RemoveTask(taskId);
    })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
global.io = io;