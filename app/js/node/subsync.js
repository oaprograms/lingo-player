/**
 * Created by Ognjen on 10/19/15.
 */

// counts differences between subtitles (text lengths over intervals)
function getDiff(subs1, subs2, k, n, searchIntervals, searchNumSubs){
    var diffs = {};
    var subLen, subTime, key;
    for (var i in searchIntervals){
        var interval = searchIntervals[i];
        for(var i1 in subs1){
            subLen = subs1[i1].subtitle.text.length;
            subTime = Math.round(subs1[i1].subtitle.start / interval);
            key = interval + '|' + subTime;
            diffs[key] = (diffs[key] || 0) + subLen;
            if(i1 > searchNumSubs) break;
        }
        for(var i2 in subs2){
            subLen = subs2[i2].subtitle.text.length;
            subTime = Math.round((subs2[i2].subtitle.start * k + n) / interval);
            key = interval + '|' + subTime;
            diffs[key] = (diffs[key] || 0) - subLen;
            if(i2 > searchNumSubs) break;
        }
    }
    // just sum absolute values of all diff values
    var diff = 0;
    for (key in diffs) {
        diff += Math.abs(diffs[key]);
    }
    return diff;
}


// returns best k, n (subtitle timing t is transformed like: t*k+n)
exports.getBestTransform = function(subs1, subs2){
    var params = {
        rates: [1, 23.976 / 25.0, 25.0 / 23.976, 30.0 / 23.976, 23.976 / 30.0], //  // 24.0, 30.0
        range1: 30.0, delta1: 1,
        range2: 3.0, delta2: 0.2,
        searchIntervals: [2, 20],
        searchNumSubs: 200
    };
    var start = new Date().getTime();
    var best = {diff: null, k: 1, n:0};
    var diff;
    for (var ki in params.rates){
        var k = params.rates[ki];
        for(var n = - params.range1; n <= params.range1; n+=params.delta1){
            diff = getDiff(subs1, subs2, k, n, params.searchIntervals, params.searchNumSubs);
            if (best.diff === null || diff < best.diff){
                best = {diff:diff, k:k, n:n};
            }
        }
        for(var n2 = best.n - params.range2; n2 <= best.n + params.range2; n2+=params.delta2){
            diff = getDiff(subs1, subs2, k, n2, params.searchIntervals, params.searchNumSubs);
            if (best.diff === null || diff < best.diff){
                best = {diff:diff, k:k, n:n2};
            }
        }
    }
    best.duration = new Date().getTime() - start;
    return best;

};