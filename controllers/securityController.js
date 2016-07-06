var UserModel = require('../model/mongoose').UserModel;

function CheckAuth(req, res){
    if(req.cookies.lionSession == undefined){
        res.render('errors/403');
        return false;
    } else {
        console.log(req.cookies.lionSession.username);
        
        UserModel.find({username: req.cookies.lionSession.username}, function(err, user){
            if(user){
                res.render('errors/403');
                return false;
            } else {
                return true;
            }
        });
    }
}

function CheckUser(username, password){
    UserModel.find({username: username, password: password}, function(err, user){
        return user;
    });
}

module.exports.CheckAuth = CheckAuth;
module.exports.CheckUser = CheckUser;