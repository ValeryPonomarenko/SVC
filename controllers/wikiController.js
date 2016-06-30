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
module.exports.GetPage = GetPage;