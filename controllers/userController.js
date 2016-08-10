var UserModel = require('../model/mongoose').UserModel;
var async = require('async');


function RegUser(username, passowrd, email, firstname, res){
    var user = new UserModel({
        username: username,
        password: passowrd,
        email: email,
        firstname: firstname
    });
    
    async.parallel([
        function(callback){
            user.save(callback);
        }
    ], function(err){
        if(!err){
            res.cookie('lionSession', {username: username});
            res.redirect('board')
        } else {
            res.redirect('reg')
        }
    });
}

function CheckUser(username, password, res){
    async.parallel([
        function(callback){
            UserModel.findOne({username: username, password: password}, callback);
        }
    ], function(err, user){
        if(user[0] != null){
            res.cookie('lionSession', {username: username});
            res.redirect('/board');
        } else {
            res.redirect('/');
        }
    });
}

module.exports.RegUser = RegUser;
module.exports.CheckUser = CheckUser;