var TaskModel = require('../model/mongoose').TaskModel;
var ProjectModel = require('../model/mongoose').ProjectModel;
var WikiModel = require('../model/mongoose').WikiModel;
var UserModel = require('../model/mongoose').UserModel;
var async = require('async');

function MakeTaskView(req, res, taskId){
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.findById(req.params.projectId, callback);
            },
            function(callback){
                ProjectModel.find(callback);
            },
            function(callback){
                TaskModel.find({project_id: req.params.projectId}, callback);
            },
            function(callback){
                WikiModel.find({project_id: req.params.projectId}, callback);
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }

            res.render('project', {
                page: 'task',
                projectId: req.params.projectId,
                projectName: results[0].title,
                projects: results[1],
                tasks: results[2],
                taskId: taskId,
                user:{
                    username: req.cookies.lionSession.username,
                    name: results[4].firstname,
                    imgUrl: results[4].profileImg
                },
                wikiPages: results[3]
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function MakeKanbanView(req, res){
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.findById(req.params.projectId, callback);
            },
            function(callback){
                ProjectModel.find(callback);
            },
            function(callback){
                WikiModel.find({project_id: req.params.projectId}, callback);
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }

            res.render('project', {
                page: 'kanban',
                projectId: req.params.projectId,
                projectName: 'Kanban :: ' + results[0].title,
                projects: results[1],
                user:{
                    username: req.cookies.lionSession.username,
                    name: results[3].firstname,
                    imgUrl: results[3].profileImg
                },
                wikiPages: results[2]
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function MakeReportView(req, res){
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.findById(req.params.projectId, callback);
            },
            function(callback){
                ProjectModel.find(callback);
            },
            function(callback){
                WikiModel.find({project_id: req.params.projectId}, callback);
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }

            res.render('project', {
                page: 'report',
                projectId: req.params.projectId,
                projectName: 'Report :: ' + results[0].title,
                projects: results[1],
                user:{
                    username: req.cookies.lionSession.username,
                    name: results[3].firstname,
                    imgUrl: results[3].profileImg
                },
                wikiPages: results[2]
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function AddTask(socket, taskInfo){
    for(field in taskInfo){
        if(taskInfo[field] == ""){
            socket.emit('task add error', { msg: 'Error! One of the fields is empty.' });
            return;
        }
    }
    
    var task = new TaskModel({
        project_id: taskInfo.project_id,
        title: taskInfo.title,
        description: taskInfo.description,
        label: taskInfo.label,
        priority: taskInfo.priority,
        due_date: taskInfo.due_date,
        wikiPageId: taskInfo.wikiPageId
    });
    
    task.save(function(err){
        if(!err){
            io.emit('task added', {
                project_id: task.project_id,
                id: task._id,
                title: task.title,
                label: task.label,
                due_date: task.due_date
            });
        } else {
            socket.emit('task add error', { msg: 'Error #' + err.code + '. Try again later.'});
        }
    });
}

function GetTask(socket, taskId){
    TaskModel.findById(taskId, function(err, task){
        if(!err){
            UserModel.findOne({username: task.assignee}, function(err, user){
                if(!err){
                    var newTask = JSON.parse(JSON.stringify(task));
                    if(user != null){
                        newTask.assignee = {
                            name: user.firstname,
                            username: task.assignee,
                            imgUrl: user.profileImg
                        };
                    }
                    socket.emit('get task', newTask, 'empty');
                }
            });
        } else {
            console.log('error');
        }
    });
}

function RemoveTask(taskId){
    TaskModel.remove({_id: taskId}, function(err){
        if(!err){
            io.emit('remove task', taskId);
        } else {
            console.log(err);
        }
    });
}

function AddAssignee(username, taskId){
    TaskModel.findById(taskId, function(err, task){
        if(!err){
            if(task.assignee == undefined){
                task.assignee = username;
                task.save(function(err){
                    if(!err){
                        UserModel.findOne({username: username}, function(err, user){
                            if(!err){
                                io.emit('assignee added', {firstname: user.firstname, imgUrl: user.profileImg}, taskId);
                            }
                        });
                    } else {
                        console.log('Add assignee error ' + err);
                    }
                });
            }
        }
    });
}

module.exports.MakeTaskView = MakeTaskView;
module.exports.MakeKanbanView = MakeKanbanView;
module.exports.MakeReportView = MakeReportView;
module.exports.AddTask = AddTask;
module.exports.GetTask = GetTask;
module.exports.RemoveTask = RemoveTask;
module.exports.AddAssignee = AddAssignee;