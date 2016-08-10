var AttachmentModel = require('../model/mongoose').AttachmentModel;

function SaveFile(socket, name, pathToSave, buffer){
    var fs = require('fs');
    name = Date.now() + name;
    pathToSave += name;

    fs.open(pathToSave, 'a', 0755, function(err, fd){
        if(err) console.log(err);

        fs.write(fd, buffer, null, 'Binary', function(err, written, buff){
            fs.close(fd, function(){
                socket.emit('send file', name); 
            });
        })
    });
}

function RemoveFile(path, name){
    AttachmentModel.remove({attachmentName: name}, function(err){
        if(err){
            console.log('RemoveFile - error: ' + err);
        }
    });
    var fullPath = path + name;
    var fs = require('fs');
    fs.unlinkSync(fullPath);
}

module.exports.SaveFile = SaveFile;
module.exports.RemoveFile = RemoveFile;