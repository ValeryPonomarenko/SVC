/**
 * Created by Valera on 6/30/2016.
 */
var WikiModel = require('../model/mongoose').WikiModel;
var ProjectModel = require('../model/mongoose').ProjectModel;
var async = require('async');

function MakeWikiView(req, res){
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
            res.render('error');
            return;
        }

        res.render('wiki', {
            projectId: req.params.projectId,
            projectName: results[0].title,
            projects: results[1],
            page: 'index',
            pages: results[2]
        })
    });
}

function MakeWikiAddPageView(req, res){
    async.parallel([
        function(callback){
            ProjectModel.findById(req.params.projectId, callback);
        },
        function(callback){
            ProjectModel.find(callback);
        }
    ], function(err, results){
        if(!results[0]){
            res.render('error');
            return;
        }

        res.render('wiki', {
            projectId: req.params.projectId,
            projectName: results[0].title,
            projects: results[1],
            page: 'add'
        })
    });
}

function AddPage(socket, pageInfo) {
    console.log(pageInfo);
    
    var page = new WikiModel({
        project_id: pageInfo.project_id,
        title: pageInfo.page_title,
        text: pageInfo.content,
        last_time_update: Date.now()
    });
    
    page.save(function(err){
        if(!err){
            socket.emit('page status', '<a href="/wiki/'+page.project_id+'/'+page._id+'">Page</a> was added!');
        } else {
            socket.emit('page status', 'Something went wrong, try again later.');
        }
    });
    console.log(page);
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

module.exports.MakeWikiView = MakeWikiView;
module.exports.MakeWikiAddPageView = MakeWikiAddPageView;
module.exports.GetPage = GetPage;
module.exports.AddPage = AddPage;