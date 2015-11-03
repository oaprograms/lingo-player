var http = require('http');
var fs = require('fs');

exports.download = function(url, dest, cb) {
    // check if file exists
    fs.stat(dest, function(err, stat) {
        if(err == null) {
            // file exists already, just return
            cb();
        } else {
            var file = fs.createWriteStream(dest);
            var request = http.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close(cb);  // close() is async, call cb after close completes.
                });
            }).on('error', function(err) { // Handle errors
                fs.unlink(dest); // Delete the file async. (But we don't check the result)
                if (cb) cb(err.message);
            });
        }
    });


};