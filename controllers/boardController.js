var ProjectModel = require('../model/mongoose').ProjectModel;
var TaskModel = require('../model/mongoose').TaskModel;
var async = require('async');

function MakeView(req, res){
    /*
    callback = function(){
        ProjectModel.find(function(err, projects){
            if(!err){
                res.render('board',{
                    projects: projects,
                    username: req.cookies.lionSession.username
                });
            }
        });
    };
    */
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.find(callback);
            },
            function(callback){
                TaskModel.find({assignee: req.cookies.lionSession.username}, callback);
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }
            
            res.render('board', {
                projects: results[0],
                username: req.cookies.lionSession.username,
                tasks: results[1]
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback)
}

function AddProject(socket, projectInfo){
    for(field in projectInfo){
        if(projectInfo[field] == ""){
            socket.emit('project add error', { msg: 'Error! One of the fields is empty.' });
            return;
        }
    }
    
    var project = new ProjectModel({
        _id: projectInfo.tag,
        title: projectInfo.title,
        description: projectInfo.description,
        svn_url: projectInfo.svn_url
    });
    
    project.save(function(err){
        if(!err){
            io.emit('project added', { 
                tag: projectInfo.tag, 
                title: projectInfo.title 
            });
        } else {
            socket.emit('project add error', { msg: 'Error #' + err.code + '. Try again later.'});
        }
    });
};

module.exports.AddProject = AddProject;
module.exports.MakeView = MakeView;