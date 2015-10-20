var _ = require('underscore');

/**
 * Finds caption to be shown at a given time
 * @param subs - subtitles
 * @param time - time in seconds
 * @returns the caption
 */
exports.findSub = function(subs, time){ // todo: add searchStartIndex argument
    var index = _.sortedIndex(subs.data, {subtitle: {start: time}}, function(sub){return sub.subtitle.start});
    if (index > subs.data.length){
        index = subs.data.length
    } else if (index < 1){
        index = 1;
    }
    var ret = subs.data[index - 1];

    return ret;
};


/**
 * Counts words in subtitle file
 * @param subs - subtitles
 * @returns dictionary {word: count} for every word in subtitle (case-insensitive)
 */
exports.wordFrequencies = function(subs){
    return {}; // todo
};

/**
 * Aligns a pair of subtitles recursively
 * @param sub1 - 1st subtitle (subtitle's data property)
 * @param sub2 - 2nd subtitle
 * @param _i1 - index in sub1 to look from
 * @param _i2 - index in sub2 to look from
 * @param numAligned - num. of aligned captions so far (for stats)
 * @param numUnaligned - num. of unaligned captions so far
 * @param pairs - output pairs
 */
function tryAndAlign(sub1, sub2, _i1, _i2, numAligned, numUnaligned, pairs){
    var i1 = _i1, i2 = _i2;

    // make sure we're not out of range
    if(i1 < sub1.length && i2 < sub2.length){
        s1 = sub1[i1].subtitle.start;
        s2 = sub2[i2].subtitle.start;

        // check if timings are near enough to be merged
        var diff = Math.abs(s1 - s2);
        if (diff <= 1.5){ // 1 second precision
            pairs.push([JSON.parse(JSON.stringify(sub1[i1])), JSON.parse(JSON.stringify(sub2[i2]))]);
            // merge them
            if (s1 > s2){
                sub1[i1].subtitle.start = s2;
            } else {
                sub2[i2].subtitle.start = s1;
            }
            // continue
            return tryAndAlign(sub1, sub2, i1 + 1, i2 + 1, numAligned + 2 - diff, numUnaligned, pairs);
        } else {
            // continue with next possible pair
            if (s1 < s2){
                pairs.push([JSON.parse(JSON.stringify(sub1[i1])), null]);
                // merge subs if possible
                if(i1-1 >= 0 && sub1[i1-1].subtitle.text.length + sub1[i1].subtitle.text.length < 180 &&
                    Math.abs(sub1[i1].subtitle.start - sub1[i1-1].subtitle.start) < 12){
                    sub1[i1-1].subtitle.text += ' ' + sub1[i1].subtitle.text;
                    sub1.splice(i1, 1);
                    i1 -= 1;
                }
                return tryAndAlign(sub1, sub2, i1 + 1, i2, numAligned, numUnaligned + 1, pairs);
            } else {
                pairs.push([null, JSON.parse(JSON.stringify(sub2[i2]))]);
                // merge subs if possible
                if(i2-1 >= 0 && sub2[i2-1].subtitle.text.length + sub2[i2].subtitle.text.length < 180 &&
                    Math.abs(sub2[i2].subtitle.start - sub2[i2-1].subtitle.start) < 12){
                    sub2[i2-1].subtitle.text += ' ' + sub2[i2].subtitle.text;
                    sub2.splice(i2, 1);
                    i2 -= 1;
                }
                return tryAndAlign(sub1, sub2, i1, i2 + 1, numAligned, numUnaligned + 1, pairs)
            }
        }
    } else {
        // return stats (% match)
        return {
            match: numAligned / (numAligned + numUnaligned)
        };
    }
}

/**
 * Aligns a pair of subtitles
 * @param sub1 - 1st subs
 * @param sub2 - 2nd subs
 * @param sync - k & n for 2nd sub
 * @returns {{sub1: first sub aligned, sub2: second sub aligned}}
 */
exports.alignSubs = function(sub1, sub2, sync){
    // make deep copy of subs
    var sub1Copy = JSON.parse(JSON.stringify(sub1));
    var sub2Copy = JSON.parse(JSON.stringify(sub2));
    var pairs = [];
    // align subs
    console.log(sub1);
    for(var ii in sub2Copy.data){
        sub2Copy.data[ii].subtitle.start *= sync.k;
        sub2Copy.data[ii].subtitle.start += sync.n;
//        sub2Copy.data[ii].subtitle.text = ii;
    }
    if(sub1.data && sub2.data){
        var stats = tryAndAlign(sub1Copy.data, sub2Copy.data, 0, 0, 0, 0, pairs);
    }
//    for(var ii in sub2Copy.data){
//        console.log(sub2Copy.data[ii].subtitle.text);
//    }
    // update ids
    if(sub1.data){
        for(var i = 0; i < sub1Copy.data.length; i++){
            sub1Copy.data[i].subtitle.id = i + 1;
        }
    }
    if(sub2.data){
        for(i = 0; i < sub2Copy.data.length; i++){
            sub2Copy.data[i].subtitle.id = i + 1;
        }
    }
    console.log(sub1Copy);
    return {
        sub1: sub1Copy,
        sub2: sub2Copy,
        match: stats.match,
        pairs: pairs
    }
};