var UserModel = require('../model/mongoose').UserModel;
var localStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    UserModel.findById(id, function(err, user){
        err? done(err): done(null, user);
    })
});

function CheckUser(){
    new localStrategy({
        usernameField: 'login',
        passwordField: 'password'
    }, function(username, passowrd, done){
        UserModel.findOne({username: username}, function(err, user){
            if(!err){
                return user
                    ? passowrd === user.password
                        ? done(null, user)
                        : done (null, false, {message: 'Incorrent password'})
                    : done (null, false, {message: 'Incorrent username'});
            } else {
                return done(err);
            }
        });
    });
}

function Login(req, res, next){
    passport.authenticate('local', function(err, user, info){
        if(err){
            return next(err);
        } else {
            return user
                ? req.logIn(user, function(err){
                    return err ? next(err) : res.redirect('/private');
                })
                : res.redirect('/');
        }
    })(req, res, next);
}

function Register(req, res, next){
    
}

function Logout(req, res){
    req.logout();
    res.redirect('/');
}

module.exports.CheckUser = CheckUser;
module.exports.Login = Login;
module.exports.Register = Register;
module.exports.Logout = Logout;