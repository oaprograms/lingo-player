/**
 * Created by Ognjen on 6/24/15.
 */
'use strict';
/**
 * Checks if character is a letter
 * @param c character
 * @returns {boolean}
 */
exports.is_letter = function(c){
    return [' ', '.', ',', ';', '!', ':', '?', '@', '%', '^', '&', '=',
        '\t', '-', '/', '\\', '|', '"', '”', '”', '<', '>', '\n', '(', ')'].indexOf(c) < 0;
};
//var a = require('./tokenizer.js');
// console.log(a.splitWords('ovo je ptoba'));
exports.splitWords = function(str){
    var s = str.replace('<br/>', ' ').replace('<br />', ' ');
    s = s.replace('<i>', ' ').replace('</i>', ' ');
    var ret = [{'text': ''}];
    var nw = false;
    for (var i = 0, len = s.length; i < len; i++) {
        var c = s[i];
        if ((! exports.is_letter(c)) != nw){
            if (ret[ret.length - 1]['text'] != ''){
                if (! nw) ret[ret.length - 1]['isWord'] = true;
                ret.push({'text':''});
            }
        }
        nw = ! exports.is_letter(c);
        ret[ret.length - 1]['text'] = ret[ret.length - 1]['text'] + c
    }
    if (! nw) ret[ret.length - 1]['isWord'] = true;

    return ret;

};