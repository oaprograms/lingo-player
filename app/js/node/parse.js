srt = require('./parsers/popcorn.parserSRT.js');
sub = require('./parsers/parserSUB.js');
exports.parseSubtitles = function(data, extension){
    if (extension == 'srt'){
        return srt.parseSRT(data);
    } else if (extension == 'sub' || extension == 'txt'){
        return sub.parseSUB(data);
    } else {
        return {};
    }

};