var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test1');
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});

var Schema = mongoose.Schema;

var Project = new Schema({
    _id: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    svn_url: {type: String, required: true}
});

var Task = new Schema({
    project_id: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    label: {type: String, required: true},
    priority: {type: String, required: true},
    wikiPageId: {type: String, required: true},
    due_date: {type: String, required: true},
    state: {type: String, default: 'waiting'},
    assignee: {type: String}
});

var Wiki = new Schema({
    project_id: {type: String, required: true},
    title: {type: String, required: true},
    text: {type: String, required: true},
    last_time_update: {type: Date, default: Date.now()}
});

var User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    firstname: {type: String, required: true}
});

var Attachment = new Schema({
    page_id: {type: String, required: true},
    attachemntName: {type: String, required: true}
});

var TaskModel = mongoose.model('Task', Task);
var ProjectModel = mongoose.model('Project', Project);
var WikiModel = mongoose.model('Wiki', Wiki);
var UserModel = mongoose.model('User', User);
var AttachmentModel = mongoose.model('Attachment', Attachment);

module.exports.ProjectModel = ProjectModel;
module.exports.TaskModel = TaskModel;
module.exports.WikiModel = WikiModel;
module.exports.UserModel = UserModel;
module.exports.AttachmentModel = AttachmentModel;