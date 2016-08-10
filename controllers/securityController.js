var UserModel = require('../model/mongoose').UserModel;
var async = require('async');

function CheckAuth(req, res, callback){
    if(req.cookies.lionSession == undefined){
        res.render('errors/403');
        return false;
    } else {
        async.parallel([
            function(callback){
                UserModel.findOne({username: req.cookies.lionSession.username}, callback);
            }
        ], function(err, user){
            
            if(user[0] != null){
                callback();
            } else {
                res.clearCookie('lionSession');
                res.render('errors/403');
                return false;
            };
        });
    }
}

module.exports.CheckAuth = CheckAuth;