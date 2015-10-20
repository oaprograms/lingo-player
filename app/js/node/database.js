/**
 * Created by Ognjen on 6/27/15.
 */

exports.openDatabase = function (gui) {
    var path = require('path');
    var Datastore = require('nedb');
    var db = new Datastore({
        filename:path.join(gui.App.dataPath, 'lingo_player_words.nedb'),

        autoload: true
    });
    db.ensureIndex({ fieldName: 'text'});
    db.ensureIndex({ fieldName: 'lang1'});
    db.ensureIndex({ fieldName: 'lang2'});
    db.ensureIndex({ fieldName: 'level'});
    db.ensureIndex({ fieldName: 'frequency'});
    return db;
};

exports.saveWord = function (db, word, lang1, lang2, translation, level, frequency, callback) {
    db.update({
            text: word,
            lang1: lang1,
            lang2: lang2
        }, {
            text: word,
            lang1: lang1,
            lang2: lang2,
            translation: translation,
            level: level,
            frequency:frequency,
            date: Date.now()
        }, { upsert: true },
        function (err, numReplaced, upsert) {
            callback(err, numReplaced, upsert);
        });
};

exports.removeWord = function (db, word, lang1, lang2, callback) {
    db.remove({
            text: word,
            lang1: lang1,
            lang2: lang2
        }, function (err) {
            callback(err);
        });
};

exports.getWords = function (db, lang1, lang2, limit, sortBy, levels, callback) {
    var sortOptions = {
        'Frequency': {frequency: -1},
        'Recent': {date: -1},
        'Alphabetical': {text: 1}
    };
    var levelsList = [];
    for (var level in levels){
        if(levels.hasOwnProperty(level)){
            if(levels[level]) levelsList.push(parseInt(level));
        }
    }

    var findBy = {lang1: lang1, lang2: lang2, level: {$in: levelsList}};

    db.find(findBy).sort(sortOptions[sortBy]).limit(limit).exec(function (err, docs) {
        callback(docs);
    });

};

exports.getCount = function (db, lang1, lang2, level, callback) {

    db.count({level: level, lang1: lang1, lang2: lang2}).exec(function (err, cnt) {
        callback(cnt);
    });
};

exports.getWord = function (db, word, lang1, lang2, callback) {
    db.find({text: word, lang1: lang1, lang2: lang2}).exec(function (err, docs) {
        if (docs.length){
            callback(docs[0]);
        } else {
            callback(null);
        }
    });
};

exports.getAll = function (db, callback) {
    db.find({}).sort({date: -1}).exec(function (err, docs) {
        callback(docs);
    });
};

exports.uniqueLanguagePairs = function(db, callback){
    // todo: optimize
    var langPairs = {};
    exports.getAll(db, function(docs){
        for (var i in docs){
            if(docs.hasOwnProperty(i)){
                langPairs[docs[i].lang1 + '|' + docs[i].lang2] = {
                    lang1 : docs[i].lang1,
                    lang2: docs[i].lang2
                };
            }
        }
        var ret = [];
        for (var i in langPairs){
            ret.push(langPairs[i]);
        }
        callback(ret);
    });
};