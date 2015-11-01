/**
 * Created by Ognjen on 4/18/15.
 */
var fs = require("fs");
var jschardet = require("jschardet");
var iconv = require('iconv-lite');
var parse = require('./parse.js');
var subtitle = require('./subtitle.js');
var encodings = require('./encodings.js');
var tokenizer = require('./tokenizer.js');

var loadFile = function(path, langCode, explicit_encoding){
    var encoding = explicit_encoding;
    var content = fs.readFileSync(path);
    if (! encoding) {
        encoding = jschardet.detect(content).encoding.toLowerCase();
        if (!encoding.startsWith('utf-') && langCode) {
            encoding = encodings.getEncodings(langCode)[0];
        }
    }
    return iconv.decode(content, encoding);
};

exports.detectFormat = function(path){
    var pathArr =  path.toLowerCase().split('.');
    var extension = pathArr.pop();
    if (extension == 'srt' || extension == 'sub'){
        return {
            type: 'subtitle',
            extension: extension
        };
    } else {
        return {
            type: 'video',
            extension: extension
        };
    }
};

exports.loadSubtitle = function(path, langCode, encoding){
    // load file to string, then auto-detect format and language
    var format = exports.detectFormat(path);
    if (format.type == 'subtitle'){
        var content = loadFile(path, langCode, encoding);
        return parse.parseSubtitles(content, format.extension);
        // .data[i].subtitle.start, end, id, text
    }else {
        return {};
    }
};

exports.addTokenizations = function(sub){
    if(sub && sub.data){
        for(var i = 0; i < sub.data.length; i++){
            sub.data[i].subtitle.words = tokenizer.splitWords(sub.data[i].subtitle.text)
        }
    }
    return sub;
};


var addInc = function(obj, val){
    if (val in obj){
        obj[val] ++;
    } else {
        obj[val] = 1;
    }
};
var dictTop = function(obj, n){
    //sort objects by value, return top n
    var sortable = [];
    for (var p in obj){
        sortable.push({
                p: p,
                v: obj[p]
            }
        );
    }
    sortable.sort(function(a, b) {return b.v - a.v});
    ret = [];
    for (var i = 0; i < Math.min(sortable.length, n); i++){
        ret.push(sortable[i].p);
    }
    return ret;
};

exports.countWordFrequencies = function(sub){
    // get word counts
    var words = {};
    var total = 0;
    var prevWord = null;
    if(sub && sub.data){
        sub.data.forEach(function(s){
            s.subtitle.words.forEach(function(word){
                if(word.isWord){
                    var lower = word.text.toLowerCase();
                    // add word count
                    if (lower in words){
                        words[lower].count ++;
                    } else {
                        words[lower] = {
                            count: 1,
                            prev: {},
                            next: {}
                        };
                    }
                    // add prev/next words
                    if (prevWord){
                        addInc(words[lower].prev, prevWord);
                        addInc(words[prevWord].next, lower);
                    }
                    total ++;

                    prevWord = lower;
                }
            });
        });
    }

    var ret = {};
    for (var w in words){
        var word = words[w];
        ret[w] = {
            count: word.count,
            percentCount: word.count * 100 / total,
            topPrevWords: dictTop(word.prev, 3),
            topNextWords: dictTop(word.next, 3)
        }
    }
    return ret;
};