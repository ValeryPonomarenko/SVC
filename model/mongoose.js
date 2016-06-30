var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test1');
var db = mongoose.connection;

db.on('error', function(err){
    console.log('connection error:', err.message);
});

var Schema = mongoose.Schema;

var Project = new Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    document_url: { type: String, required: true},
    svn_name: { type: String, required: true }
});

var Task = new Schema({
    project_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    label: { type: String, required: true },
    priority: { type: String, required: true },
    due_date: { type: String, required: true },
    state: { type: String, default: 'waiting'}
});

var Wiki = new Schema({
    _id: { type: String, required: true },
    project_id: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    last_time_update: { type: String, required: true }
});

var TaskModel = mongoose.model('Task', Task);
var ProjectModel = mongoose.model('Project', Project);
var WikiModel = mongoose.model('Wiki', Wiki);

module.exports.ProjectModel = ProjectModel;
module.exports.TaskModel = TaskModel;
module.exports.WikiModel = WikiModel;