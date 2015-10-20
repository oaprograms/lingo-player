/**
 * Created by Ognjen on 10/19/15.
 */

exports.parseSUB = function( data, frameRate ) {
    if(! frameRate) frameRate = 23.976;
    var ret = {
        data: []
    };
    var srt = data.replace(/\r\n|\r|\n/g, '\n');
    srt = srt.replace(/^\s+|\s+$/g,"");
    var srty = srt.split('\n');

    for (var s = 0; s < srty.length; s++) {
        var st = srty[s].split('}{');
        if (st.length >=2) {
            var start = Math.round(st[0].substr(1)) / frameRate;
            var end = Math.round(st[1].split('}')[0]) / frameRate;
            var text = st[1].split('}')[1].replace('|', '\n');
            ret.data.push({
                subtitle:{
                    start: start,
                    end: end,
                    text: text
                }
            });
        }
    }
    return ret;
};