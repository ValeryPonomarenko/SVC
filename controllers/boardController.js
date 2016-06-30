var ProjectModel = require('../model/mongoose').ProjectModel;

function MakeView(req, res){
    ProjectModel.find(function(err, projects){
        if(!err){
            res.render('board',{
                projects: projects
            });
        }
    });
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
        document_url: projectInfo.url,
        svn_name: projectInfo.svn_name
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