var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var BoardController = require('./controllers/boardController');
var ProjectController = require('./controllers/projectController');
var WikiController = require('./controllers/wikiController');
var FileController = require('./controllers/fileController');
var SecurityController = require('./controllers/securityController');
var UserController = require('./controllers/userController');

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    if(req.cookies.lionSession != undefined){ res.redirect('/board'); return;}
    res.render('index');
});

app.get('/reg', function(req, res){
    res.render('reg');
});

app.get('/logout', function(req, res){
    res.clearCookie('lionSession');
    res.redirect('/');
});

app.get('/board', function (req, res) {
    BoardController.MakeView(req, res);
});

app.get('/project/:projectId', function (req, res) {
    ProjectController.MakeTaskView(req, res, 0);
});

app.get('/project/:projectId/kanban', function (req, res) {
    ProjectController.MakeKanbanView(req, res);
});

app.get('/project/:projectId/report', function (req, res) {
    ProjectController.MakeReportView(req, res);
});

app.get('/project/:projectId/:taskId', function (req, res) {
    ProjectController.MakeTaskView(req, res, req.params.taskId);
});

app.get('/wiki/:projectId', function (req, res) {
    WikiController.MakeWikiView(req, res, 0);
});

app.get('/wiki/:projectId/add', function (req, res) {
    WikiController.MakeWikiAddPageView(req, res);
});

app.get('/wiki/:projectId/:wikiPageId', function (req, res) {
    WikiController.MakeWikiView(req, res, req.params.wikiPageId);
});

app.post('/login', function(req, res){
    UserController.CheckUser(req.body.username, req.body.password, res);
});

app.post('/reg', function(req, res){
    UserController.RegUser(req.body.username,
                           req.body.password,
                           req.body.email,
                           req.body.firstname,
                           res);
});

io.on('connection', function (socket) {
    socket.on('add project', function (projectInfo) {
        BoardController.AddProject(socket, projectInfo);
    });
    
    socket.on('add task', function (taskInfo) {
        ProjectController.AddTask(socket, taskInfo);
    });
    socket.on('get task', function (taskId) {
        ProjectController.GetTask(socket, taskId);
    });
    socket.on('remove task', function (taskId) {
        ProjectController.RemoveTask(taskId);
    });
    socket.on('assignee added', function(username, taskId){
        ProjectController.AddAssignee(username, taskId);
    });
    
    socket.on('get page', function (pageId) {
        WikiController.GetPage(socket, pageId);
    });
    socket.on('add wiki', function(pageInfo){
        WikiController.AddPage(socket, pageInfo);
    });
    socket.on('remove page', function(pageId){
        WikiController.RemovePage(pageId);
    });
    
    socket.on('send file', function(name, buffer){
        FileController.SaveFile(socket, name, __dirname + '/public/attachments/', buffer);
    });
    socket.on('remove file', function(name){
        FileController.RemoveFile(__dirname + '/public/attachments/' + name);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
global.io = io;
global.SecurityManager = SecurityController;