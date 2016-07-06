/**
 * Created by Valera on 6/30/2016.
 */
var WikiModel = require('../model/mongoose').WikiModel;
var ProjectModel = require('../model/mongoose').ProjectModel;
var async = require('async');

function MakeWikiView(req, res, pageId){
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
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }

            res.render('wiki', {
                projectId: req.params.projectId,
                projectName: results[0].title,
                projects: results[1],
                page: 'index',
                pages: results[2],
                pageId: pageId,
                username: req.cookies.lionSession.username
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function MakeWikiAddPageView(req, res){
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.findById(req.params.projectId, callback);
            },
            function(callback){
                ProjectModel.find(callback);
            }
        ], function(err, results){
            if(!results[0]){
                res.render('errors/404');
                return;
            }

            res.render('wiki', {
                projectId: req.params.projectId,
                projectName: results[0].title,
                projects: results[1],
                page: 'add',
                username: req.cookies.lionSession.username
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function AddPage(socket, pageInfo) {
    var page = new WikiModel({
        project_id: pageInfo.project_id,
        title: pageInfo.page_title,
        text: pageInfo.content,
        last_time_update: Date.now()
    });
    
    page.save(function(err){
        if(!err){
            socket.emit('page status', '<a href="/wiki/'+page.project_id+'/'+page._id+'">Page</a> was added!');
            io.emit('page added', page);
        } else {
            socket.emit('page status', 'Something went wrong, try again later.');
        }
    });
}

function GetPage(socket, pageId){
    WikiModel.findById(pageId, function(err, page){
        if(!err){
            socket.emit('get page', page);
        } else {
            console.log('error');
        }
    });
}

function RemovePage(pageId){
    WikiModel.remove({_id: pageId}, function(err){
        if(!err){
            io.emit('remove page', pageId);
        } else {
            console.log(err);
        }
    });
}

module.exports.MakeWikiView = MakeWikiView;
module.exports.MakeWikiAddPageView = MakeWikiAddPageView;
module.exports.GetPage = GetPage;
module.exports.AddPage = AddPage;
module.exports.RemovePage = RemovePage;