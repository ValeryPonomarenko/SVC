/**
 * Created by Valera on 6/30/2016.
 */
var WikiModel = require('../model/mongoose').WikiModel;
var ProjectModel = require('../model/mongoose').ProjectModel;
var AttachmentModel = require('../model/mongoose').AttachmentModel;
var UserModel = require('../model/mongoose').UserModel;
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
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
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
                user:{
                    name: results[3].firstname,
                    imgUrl: results[3].profileImg
                }
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
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
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
                user:{
                    name: results[2].firstname,
                    imgUrl: results[2].profileImg
                }
            })
        });
    };
    
    SecurityManager.CheckAuth(req, res, callback);
}

function MakeWikiEditPageView(req, res, pageId){
    callback = function(){
        async.parallel([
            function(callback){
                ProjectModel.findById(req.params.projectId, callback);
            },
            function(callback){
                ProjectModel.find(callback);
            },
            function(callback){
                WikiModel.findById(pageId, callback);
            },
            function(callback){
                AttachmentModel.find({page_id: pageId}, callback);
            },
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
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
                page: 'edit',
                wikiPageTitle: results[2].title,
                wikiPageText: results[2].text,
                attachments: results[3],
                user:{
                    name: results[4].firstname,
                    imgUrl: results[4].profileImg
                }
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
    
    pageInfo.attachments.forEach(function(item, i, arr){
        var attachment = new AttachmentModel({
            page_id: page._id,
            attachmentName: item
        });
        attachment.save();
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

function UpdatePage(socket, pageInfo){
    WikiModel.findById(pageInfo.id, function(err, page){
        if(!err){
            page.text = pageInfo.content;
            
            pageInfo.attachments.forEach(function(item, i, arr){
                AttachmentModel.find({attachmentName: item}, function(err, object){
                    if(object.length == 0){
                        var attachment = new AttachmentModel({
                            page_id: page._id,
                            attachmentName: item
                        });
                        attachment.save();
                    }
                });
            });
            
            page.save(function(err){
                if(!err){
                    socket.emit('page status', '<a href="/wiki/'+page.project_id+'/'+page._id+'">Page</a> was updated!');
                    io.emit('page updated', page);
                } else {
                    socket.emit('page status', 'Something went wrong, try again later.');
                }
            });
        } else {
            console.log('UpdatePage - error');
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
            AttachmentModel.find({page_id: pageId}, function(err, objects){
                objects.forEach(function(object, i){
                    FileManager.RemoveFile(object.attachmentName);
                });
            });
            io.emit('remove page', pageId);
        } else {
            console.log(err);
        }
    });
}

module.exports.MakeWikiView = MakeWikiView;
module.exports.MakeWikiAddPageView = MakeWikiAddPageView;
module.exports.MakeWikiEditPageView = MakeWikiEditPageView;
module.exports.GetPage = GetPage;
module.exports.AddPage = AddPage;
module.exports.UpdatePage = UpdatePage;
module.exports.RemovePage = RemovePage;