(function(){

var fileUrl = require('file-url');
var path = require('path');
var request = require('request');
var util = require('./js/node/vl_util.js');
var subtitle = require('./js/node/subtitle.js');
var subsync = require('./js/node/subsync.js');
var database = require('./js/node/database.js');

var gui = require('nw.gui');
var win = gui.Window.get();

var wjs = require("wcjs-player");
var player = new wjs("#player").addPlayer({ autoplay: true });
player.subtitles(false);
$('.wcp-subtitle-but').remove();
$('#down').appendTo(player.wrapper);

var app = angular.module('app', ['ui.bootstrap', 'ui.select', 'ngAnimate']);
app.config(function($sceProvider) {
    // Completely disable SCE
    $sceProvider.enabled(false);
});

// prevent default drag (would open any page that's dragged into app window)
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

app.controller('mainCtrl', ['$scope', '$interval', '$timeout', '$sce', '$document', function ($scope, $interval, $timeout, $sce, $document) {

    $scope.data = {
        // list of languages supported by Google Translate
        languages: {"af": "Afrikaans", "sq": "Albanian", "ar": "Arabic", "hy": "Armenian", "az": "Azerbaijani", "eu": "Basque", "be": "Belarusian", "bn": "Bengali", "bs": "Bosnian", "bg": "Bulgarian", "ca": "Catalan", "ceb": "Cebuano", "ny": "Chichewa", "zh-CN": "Chinese", "hr": "Croatian", "cs": "Czech", "da": "Danish", "nl": "Dutch", "en": "English", "eo": "Esperanto", "et": "Estonian", "tl": "Filipino", "fi": "Finnish", "fr": "French", "gl": "Galician", "ka": "Georgian", "de": "German", "el": "Greek", "gu": "Gujarati", "ht": "Haitian Creole", "ha": "Hausa", "iw": "Hebrew", "hi": "Hindi", "hmn": "Hmong", "hu": "Hungarian", "is": "Icelandic", "ig": "Igbo", "id": "Indonesian", "ga": "Irish", "it": "Italian", "ja": "Japanese", "jw": "Javanese", "kn": "Kannada", "kk": "Kazakh", "km": "Khmer", "ko": "Korean", "lo": "Lao", "la": "Latin", "lv": "Latvian", "lt": "Lithuanian", "mk": "Macedonian", "mg": "Malagasy", "ms": "Malay", "ml": "Malayalam", "mt": "Maltese", "mi": "Maori", "mr": "Marathi", "mn": "Mongolian", "my": "Myanmar (Burmese)", "ne": "Nepali", "no": "Norwegian", "fa": "Persian", "pl": "Polish", "pt": "Portuguese", "pa": "Punjabi", "ro": "Romanian", "ru": "Russian", "sr": "Serbian", "st": "Sesotho", "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian", "so": "Somali", "es": "Spanish", "su": "Sundanese", "sw": "Swahili", "sv": "Swedish", "tg": "Tajik", "ta": "Tamil", "te": "Telugu", "th": "Thai", "tr": "Turkish", "uk": "Ukrainian", "ur": "Urdu", "uz": "Uzbek", "vi": "Vietnamese", "cy": "Welsh", "yi": "Yiddish", "yo": "Yoruba", "zu": "Zulu"},
        languageList: [{code: "af", name: "Afrikaans"},{ code: "sq", name: "Albanian"},{ code: "ar", name: "Arabic"},{ code: "hy", name: "Armenian"},{ code: "az", name: "Azerbaijani"},{ code: "eu", name: "Basque"},{ code: "be", name: "Belarusian"},{ code: "bn", name: "Bengali"},{ code: "bs", name: "Bosnian"},{ code: "bg", name: "Bulgarian"},{ code: "ca", name: "Catalan"},{ code: "ceb", name: "Cebuano"},{ code: "ny", name: "Chichewa"},{ code: "zh-CN", name: "Chinese"},{ code: "hr", name: "Croatian"},{ code: "cs", name: "Czech"},{ code: "da", name: "Danish"},{ code: "nl", name: "Dutch"},{ code: "en", name: "English"},{ code: "eo", name: "Esperanto"},{ code: "et", name: "Estonian"},{ code: "tl", name: "Filipino"},{ code: "fi", name: "Finnish"},{ code: "fr", name: "French"},{ code: "gl", name: "Galician"},{ code: "ka", name: "Georgian"},{ code: "de", name: "German"},{ code: "el", name: "Greek"},{ code: "gu", name: "Gujarati"},{ code: "ht", name: "Haitian Creole"},{ code: "ha", name: "Hausa"},{ code: "iw", name: "Hebrew"},{ code: "hi", name: "Hindi"},{ code: "hmn", name: "Hmong"},{ code: "hu", name: "Hungarian"},{ code: "is", name: "Icelandic"},{ code: "ig", name: "Igbo"},{ code: "id", name: "Indonesian"},{ code: "ga", name: "Irish"},{ code: "it", name: "Italian"},{ code: "ja", name: "Japanese"},{ code: "jw", name: "Javanese"},{ code: "kn", name: "Kannada"},{ code: "kk", name: "Kazakh"},{ code: "km", name: "Khmer"},{ code: "ko", name: "Korean"},{ code: "lo", name: "Lao"},{ code: "la", name: "Latin"},{ code: "lv", name: "Latvian"},{ code: "lt", name: "Lithuanian"},{ code: "mk", name: "Macedonian"},{ code: "mg", name: "Malagasy"},{ code: "ms", name: "Malay"},{ code: "ml", name: "Malayalam"},{ code: "mt", name: "Maltese"},{ code: "mi", name: "Maori"},{ code: "mr", name: "Marathi"},{ code: "mn", name: "Mongolian"},{ code: "my", name: "Myanmar (Burmese)"},{ code: "ne", name: "Nepali"},{ code: "no", name: "Norwegian"},{ code: "fa", name: "Persian"},{ code: "pl", name: "Polish"},{ code: "pt", name: "Portuguese"},{ code: "pa", name: "Punjabi"},{ code: "ro", name: "Romanian"},{ code: "ru", name: "Russian"},{ code: "sr", name: "Serbian"},{ code: "st", name: "Sesotho"},{ code: "si", name: "Sinhala"},{ code: "sk", name: "Slovak"},{ code: "sl", name: "Slovenian"},{ code: "so", name: "Somali"},{ code: "es", name: "Spanish"},{ code: "su", name: "Sundanese"},{ code: "sw", name: "Swahili"},{ code: "sv", name: "Swedish"},{ code: "tg", name: "Tajik"},{ code: "ta", name: "Tamil"},{ code: "te", name: "Telugu"},{ code: "th", name: "Thai"},{ code: "tr", name: "Turkish"},{ code: "uk", name: "Ukrainian"},{ code: "ur", name: "Urdu"},{ code: "uz", name: "Uzbek"},{ code: "vi", name: "Vietnamese"},{ code: "cy", name: "Welsh"},{ code: "yi", name: "Yiddish"},{ code: "yo", name: "Yoruba"},{ code: "zu", name: "Zulu"}],
        // show dialog (initially show file dialog)
        dialog: 'file', // 'file', 'subs', 'shortcuts', 'about', null
        // selected file paths
        paths: { 
            movie: '',
            sub1: '', // subtitle paths
            sub2: ''
        },
        playerInfo: {  // for tracking playback position
            positionPercent: 0.0
            //mrl: 'file:///C:/Users/Ognjen/Downloads/The.Big.Bang.Theory.S08E12.HDTV.x264-LOL.mp4'
        },

        recentFiles: JSON.parse(localStorage.recentFiles || '[]'),

        lang1: localStorage.lang1 || 'de',
        lang2: localStorage.lang2 || 'en',

        // subtitle objects (contains sub1, sub2)
        subtitles: {},

        // current subtitle
        currentSub1: {},
        currentSub2: {},

        // current word definition
        wordDefinition: {},

        // for filtering words in words dialog
        languagePair: {},

        // word sort options
        wordSortOptions: ['Frequency', 'Recent', 'Alphabetical'],
        wordSort: 'Frequency',

        // word knowledge levels
        levels: [
            {value: 1, color: '#ff0000', colorLight: '#ff9988', label: 'New'},
            {value: 2, color: '#ff8a00', colorLight: '#ffd099', label: 'Recognized'},
            {value: 3, color: '#ffff00', colorLight: '#ffff99', label: 'Familiar'},
            {value: 4, color: '#00ff00', colorLight: '#99ff99', label: 'Known'}
        ],
        showLevels: {
            1: true, 2: true, 3: true, 4: false
        },
        showTypes: {

        },

        levelCounts: {1: 0, 2: 0, 3: 0, 4: 0},

        // word typed in manually in words dialog
        newManualWord: {text: '', translation: ''},

        config: {
            dontPlayWordOnClick: false
        }

};

//    $scope.player = document.getElementById('player');
    $scope.player = player;

    // word database
    $scope.db = database.openDatabase(gui);

    // plays word using google translate TTS (triggers click inside iframe)
    $scope.playWord = function(fromSubs){
        if(fromSubs && $scope.data.config.dontPlayWordOnClick) return;

        $timeout(function(){
            function triggerMouseEvent (node, eventType) {
                var clickEvent = document.createEvent ('MouseEvents');
                clickEvent.initEvent (eventType, true, true);
                node.dispatchEvent (clickEvent);
            }

            var targetNode = document.getElementById('iframe').contentDocument.getElementById('gt-src-listen');
            triggerMouseEvent (targetNode, "mouseover");
            triggerMouseEvent (targetNode, "mousedown");
            triggerMouseEvent (targetNode, "mouseup");
            triggerMouseEvent (targetNode, "click");
        }, 200);
    };


    $scope.hidePopover = function(){
        $(".popover").remove();
        //$(".file-dialog .ui-select-search").attr('placeholder', 'Search');
    };

    // updates subtitles periodically, and auto-pauses playback if enabled
    $interval(function () {
        // update position variables
        $scope.data.playerInfo.positionPercent = $scope.player.position();
        $scope.data.playerInfo.positionTime = parseFloat($scope.player.time()) / 1000.0;
        $scope.data.playerInfo.playing = $scope.player.playing();
        $scope.data.playerInfo.showControls =
            ((! $scope.data.playerInfo.subMouseEntered || ! $scope.data.playerInfo.wasPlaying)
            && ! $scope.data.playerInfo.playing && $scope.data.paths.movie);

        // show appropriate subtitle
        if ($scope.data.subtitles.sub1 && $scope.data.subtitles.sub1.data) {
            var text1 = subtitle.findSub($scope.data.subtitles.sub1, $scope.data.playerInfo.positionTime || 0);
            if (! $scope.data.currentSub1 || text1.subtitle.text != $scope.data.currentSub1.text) { // subtitle changed
                $scope.data.currentSub1 = text1.subtitle;
                $scope.highlightWords($scope.data.currentSub1);
            }
        }
        if ($scope.data.subtitles.sub2 && $scope.data.subtitles.sub2.data) {
            var text2 = subtitle.findSub($scope.data.subtitles.sub2, $scope.data.playerInfo.positionTime || 0);
            if (! $scope.data.currentSub2 || text2.subtitle.text != $scope.data.currentSub2.text) {
                $scope.data.currentSub2 = text2.subtitle;
            }
        }
    }, 200);

    // update word status for every word in subtitle (get from db)
    $scope.highlightWords = function (sub) {
        // todo: optimize (select in)
        for (var i = 0; i < sub.words.length; i++) {
            (function (s) { // sub = i
                if (sub.words[i].isWord) {
                    database.getWord($scope.db, sub.words[i].text.toLowerCase(), $scope.data.lang1, $scope.data.lang2, function (word) {
                        if (word) {
                            sub.words[s].level = word.level;
                        } else {
                            delete sub.words[s].level;
                        }
                    })
                }
            }(i));
        }
    };

    // when mouse hovers subtitle, pause video
    $scope.pauseVideoTemp = function(){
        if(! $scope.data.playerInfo.subMouseEntered){
            $scope.data.playerInfo.wasPlaying = $scope.player.playing();
            $scope.data.playerInfo.subMouseEntered = true;
        }
        $scope.player.pause();
    };

    // when mouse leaves subtitle, unpause video
    $scope.playVideoTemp = function(){
        $scope.data.playerInfo.subMouseEntered = false;
        if($scope.data.playerInfo.wasPlaying){
            $scope.player.play();
        }
    };


    // replay current subtitle
    $scope.replayCurrentSub = function(){
        if($scope.data.currentSub1){
            $scope.player.time($scope.data.currentSub1.start * 1000 + 50);
            $scope.player.play();
        }
    };

    // play subtitle relative to current subtitle
    $scope.playRelativeSub = function(position){
        if($scope.data.currentSub1 &&
            $scope.data.currentSub1.id - 1 + position >= 0 &&
            $scope.data.currentSub1.id - 1 + position < $scope.data.subtitles.sub1.data.length){

            $scope.player.time($scope.data.subtitles.sub1.data[$scope.data.currentSub1.id - 1 + position].subtitle.start * 1000 + 10);
        }
    };

    // play previous subtitle
    $scope.playPrevSub = function(){
        $scope.playRelativeSub(-1);
    };

    // play next subtitle
    $scope.playNextSub = function(){
        $scope.playRelativeSub(1);
    };

    $scope.play = function(){
        if (! $scope.data.dialog){
            $scope.player.togglePause();
            $scope.player.animatePause();
        }
    };

    $scope.showDialog = function(dialogName){
        $scope.player.pause();
        if(dialogName=='words') $scope.getUniqueLanguagePairs();

        $scope.data.dialog = dialogName;
    };

    $scope.scrapeGoogleTranslateFromIFrame = function(){
        try {
            var $iframe = $('iframe');
            // get translated word
            var translation = $($($iframe.contents()).find("#result_box")).last().text();
            var original = $($($iframe.contents()).find("textarea#source")).last().val();
            // get dictionary table (if hidden, consider it empty)
            var dict = $($($iframe.contents()).find(".gt-cc-r .gt-cd-c")).last();
            var table = '';
            if (dict.is(":visible")){
                table = dict.html() || '';
            }
            // return word definition
            $scope.data.wordDefinition = {
                original: original,
                translation: translation,
                dictionary: $sce.trustAsHtml(table)
            };

//            // image:
//            $('#left').empty();
//            $($iframe.contents()).find("img:lt(3)").appendTo($('#left'));

        } catch(e){
            // empty it in case of error
            $scope.data.wordDefinition = {
                original: '',
                translation: '',
                dictionary: $sce.trustAsHtml('')
            };
        }

        if(! $scope.data.dialog){
            $scope.fixPopoverPosition();
        }
    };

    // fix popover position
    $scope.fixPopoverPosition = function(){
        var $popover = $('.popover');
        var $down = $('#down');
        var pos = $popover.position();
        var width = $popover.width();
        var parent_width = $down.width();
        if($popover && pos && width && parent_width){
            if (pos.left < 0){
                $popover.css('margin-left', -pos.left);
                $('.popover .arrow').css({'margin-left': -11 + pos.left});
            } else if (pos.left + width > parent_width){
                $popover.css('margin-left',  parent_width - width - pos.left);
                $('.popover .arrow').css({'margin-left': -11 +  width + pos.left - parent_width});
            } else {
                $popover.css('margin-left',0);
                $('.popover .arrow').css({'margin-left': -11});
            }
        }
    };

    $scope.define = function (word, sourceLang, targetLang) {
        var url = $scope.data.translateUrl = 'https://translate.google.com/#' + sourceLang + '/' + targetLang + '/' + encodeURIComponent(word.text.toLowerCase());
        $timeout(function(){
            if($scope.data.translateUrl == url){
                $('#iframe').attr('src', url);
                // observe iframe changes by dirty checking (I think there's no event for that)
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 50);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 100);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 150);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 200);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 300);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 500);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 1000);
                $timeout($scope.scrapeGoogleTranslateFromIFrame, 2000);
            }
        }, 150);

//        // get image
//        request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURIComponent(word.text.toLowerCase()), function (error, response, body) {
//            try {$scope.data.images = JSON.parse(body).responseData.results;}
//        });

    };

    $scope.getUniqueLanguagePairs = function () {
        $scope.data.languagePair = {
            lang1: $scope.data.lang1,
            lang2: $scope.data.lang2
        };
        $scope.loadWords();
        database.uniqueLanguagePairs($scope.db, function (pairs) {
            $scope.data.languagePairs = pairs;
        });
    };

    $scope.loadWords = function () {
        database.getWords($scope.db, $scope.data.languagePair.lang1, $scope.data.languagePair.lang2,
            0, $scope.data.wordSort, $scope.data.showLevels, function (docs) {
            $scope.data.words = docs;
            $scope.getWordCounts();
        });
    };

    $scope.getWordCounts = function(){
        for(var level = 1; level <= 4; level++){
            (function(val){
                database.getCount($scope.db, $scope.data.languagePair.lang1, $scope.data.languagePair.lang2, val, function (cnt) {
                    $scope.data.levelCounts[val] = cnt;
                });
            })(level);
        }
    };

    $scope.level = function(word, up, dontRemove){
        if(word.level){
            if (up){
                word.level --;
                if (word.level < 1 && !dontRemove) word.level = 0;
                if (word.level < 1 && dontRemove) word.level = 1;
            } else {
                word.level++;
                if (word.level > 4 && !dontRemove) word.level = 0;
                if (word.level > 4 && dontRemove) word.level = 4;
            }
        } else {
            if(up){
                word.level = 4;
            } else {
                word.level = 1;
            }
        }
    };

    $scope.changeWordLevel = function(word, up, lang1, lang2, dontRemove){
        $scope.level(word, up, dontRemove);
        if (word.level){
            $scope.saveWord(word, word.level, lang1, lang2);
        } else {
            $scope.removeWord(word, lang1, lang2);
        }
    };

    $scope.wordFrequency = function(word){
        return word.frequency ||
            ((($scope.data.wordFrequencies||{})[word.text.toLowerCase()] || {}).percentCount || 0);
    };

    // save word to db
    $scope.saveWord = function (word, level, lang1, lang2) {
        if(! word || ! word.text) return;
        database.saveWord($scope.db, word.text.toLowerCase(), lang1 || $scope.data.lang1, lang2 || $scope.data.lang2,
            '', level, $scope.wordFrequency(word), function (err, newDoc) {
            $scope.player.notify('saved ' + $scope.data.levels[level - 1].label.toLowerCase() + ' "' + word.text.toLowerCase() + '"');
        });
    };
    // remove word from db
    $scope.removeWord = function (word, lang1, lang2) {
        database.removeWord($scope.db, word.text.toLowerCase(), lang1 || $scope.data.lang1, lang2 || $scope.data.lang2, function (err, newDoc) {
                $scope.player.notify('removed "' + word.text.toLowerCase() + '"');
        });
    };
    // save all non-marked words in current subtitle to db
    $scope.saveAllWords = function(level){
        for (var i = 0; i < $scope.data.currentSub1.words.length; i++){
            var word = $scope.data.currentSub1.words[i];
            if (word.isWord && ! word.level){
                database.saveWord($scope.db, word.text.toLowerCase(), $scope.data.lang1, $scope.data.lang2,
                    '', level, $scope.wordFrequency(word), function (err, newDoc) {
                    $scope.highlightWords($scope.data.currentSub1);
                });
            }
        }
    };

    $scope.initPlayback = function () {
        // play
        $scope.data.dialog = null;
        $scope.player.play();

    };

    $scope.chooseFile = function (fileType) {
        $scope.fileDialogFileType = fileType;
        if(fileType == 'movie'){
            $('#fileDialog').trigger('click');
        } else {
            $('#fileDialog2').trigger('click');
        }
    };


    $scope.reloadMovie = function(){
        $scope.player.clearPlaylist();
        $scope.player.addPlaylist(fileUrl($scope.data.paths.movie));
        if(! $scope.data.dialog) $scope.player.play();
    };

    $scope.reloadSubs = function () {
        try{
            if($scope.data.paths.sub1){
                $scope.data.subtitles.sub1 = util.addTokenizations(util.loadSubtitle($scope.data.paths.sub1, $scope.data.lang1));
                $scope.data.wordFrequencies = util.countWordFrequencies($scope.data.subtitles.sub1);
            } else {
                delete $scope.data.subtitles.sub1;
            }
            if($scope.data.paths.sub2){
                $scope.data.subtitles.sub2 = util.addTokenizations(util.loadSubtitle($scope.data.paths.sub2, $scope.data.lang2));
            } else {
                delete $scope.data.subtitles.sub2;
            }
            if($scope.data.subtitles.sub1 && $scope.data.subtitles.sub2){
                var bestSync = subsync.getBestTransform($scope.data.subtitles.sub1.data, $scope.data.subtitles.sub2.data);
                $scope.data.subtitles = subtitle.alignSubs($scope.data.subtitles.sub1, $scope.data.subtitles.sub2, bestSync);
                $scope.data.subtitles.sub2 = util.addTokenizations($scope.data.subtitles.sub2);
            }
        } catch (e){
            $scope.player.notify("Error: Couldn't load subtitle");
            throw(e);
        }
    };

    $scope.getFileName = function(file_path){
        return path.basename(file_path);
    };

    $scope.getRecent = function(files){
        $scope.data.paths.movie = files.movie;
        $scope.data.paths.sub1 = files.sub1;
        $scope.data.paths.sub2 = files.sub2;
        $scope.data.lang1 = files.lang1;
        $scope.data.lang2 = files.lang2;
        $scope.reloadMovie();
        $scope.reloadSubs();
    };

    $scope.updateRecentMovie = function(){
        // remove movie from array
        for(var i = 0; i < $scope.data.recentFiles.length; i++){
            if($scope.data.recentFiles[i].movie == $scope.data.paths.movie){
                $scope.data.recentFiles.splice(i,1);
            }
        }
        // add movie to the start of array
        $scope.data.recentFiles.unshift({
            movie: $scope.data.paths.movie,
            sub1: $scope.data.paths.sub1,
            sub2: $scope.data.paths.sub2,
            lang1: $scope.data.lang1,
            lang2: $scope.data.lang2
        });

        // limit array length
        if($scope.data.recentFiles.length > 6){
            $scope.data.recentFiles.splice(6);
        }
    };

    $scope.updateRecentData = function(){
        for(var i = 0; i < $scope.data.recentFiles.length; i++){
            var r = $scope.data.recentFiles[i];
            if(r.movie == $scope.data.paths.movie){
                r.sub1 = $scope.data.paths.sub1;
                r.sub2 = $scope.data.paths.sub2;
                r.lang1 = $scope.data.lang1;
                r.lang2 = $scope.data.lang2;
                return;
            }
        }
    };

    $scope.setFile = function(){
        var path = $(this).val();
        $(this).val('');

        if ($scope.fileDialogFileType == 'movie'){
            $scope.data.paths.movie = path;
            $scope.reloadMovie();
            $scope.updateRecentMovie();
        } else {
            $scope.data.paths[$scope.fileDialogFileType] = path;
            $scope.reloadSubs();
            $scope.updateRecentData();
        }
    };

    $('#fileDialog').change($scope.setFile);
    $('#fileDialog2').change($scope.setFile);

    // keyboard shortcuts
    $(document).bind('keydown', function(e) {
        if($scope.data.dialog) return; // ignore shortcuts on open dialog

        if (e.which == 37){ // left arrow
            $scope.playPrevSub();
        } else if (e.which == 39){ // right arrow
            $scope.playNextSub();
        } else if (e.which == 82){ // r letter
            $scope.replayCurrentSub();
        } else if (e.which == 32){ // space
            $scope.play();
        } else if (e.which == 38){ // up arrow
            $scope.player.volume(Math.min($scope.player.volume()+20,200));
            $scope.player.notify('Volume: ' + $scope.player.volume() + '%');
        } else if (e.which == 40){ // up arrow
            $scope.player.volume(Math.max($scope.player.volume()-20,0));
            $scope.player.notify('Volume: ' + $scope.player.volume() + '%');
        }
    });

    // scroll dictionary popup with mouse wheel
    $('.subtitle').bind('wheel', function(e){
        var $def = $('.def');
        if(e.originalEvent.wheelDelta > 0) { // scroll up
            $def.animate({ scrollTop: $def.scrollTop() - 100 }, 100);
        }
        else{ // scroll down
            $def.animate({ scrollTop: $def.scrollTop() + 100 }, 100);
        }
    });

    $scope.showDevTools = function(){
        gui.Window.get().showDevTools();
    };

    $scope.openUrl = function(url){
        gui.Shell.openExternal(url)
    };

    $scope.initMenu = function(){
        // create menu

        var menubar = new gui.Menu({
            type: 'menubar'
        });

        var file = new gui.Menu();
        file.append(new gui.MenuItem({
            label: 'Open...',
            click: function() {
                $scope.showDialog('file');
            }
        }));

        var view = new gui.Menu();
        view.append(new gui.MenuItem({
            label: 'Saved Words',
            click: function() {
                $scope.showDialog('words');
            }
        }));

        view.append(new gui.MenuItem({ type: 'separator' }));

        view.append(new gui.MenuItem({
            label: 'Subtitle Listing',
            click: function() {
                $scope.data.subsDialogLoading = true;
                $scope.showDialog('subs');
                $timeout(function(){
                    $scope.data.subsDialogLoading = false;
                }, 250);
            }
        }));

        var help = new gui.Menu();
        help.append(new gui.MenuItem({
            label: 'Submit Feedback',
            click: function() {
                var feedbackUrl = 'https://docs.google.com/forms/d/1slrFh5R23kvgvZaN1LG9Vj-tqxz0eoAwlZSZfl7K8EM/viewform';
                $scope.openUrl(feedbackUrl);
            }
        }));

        help.append(new gui.MenuItem({
            label: 'Keyboard Shortcuts',
            click: function() {
                $scope.showDialog('shortcuts');
            }
        }));

        help.append(new gui.MenuItem({ type: 'separator' }));

        help.append(new gui.MenuItem({
            label: 'About',
            click: function() {
                $scope.showDialog('about');
            }
        }));

        menubar.append(new gui.MenuItem({ label: 'File', submenu: file}));
        menubar.append(new gui.MenuItem({ label: 'View', submenu: view}));
        menubar.append(new gui.MenuItem({ label: 'Help', submenu: help}));

        win.menu = menubar;

    };
    $scope.initMenu();


    // save variables to localStorage on app exit
    win.on('close', function() {
        localStorage.lang1 = $scope.data.lang1;
        localStorage.lang2 = $scope.data.lang2;
        localStorage.recentFiles = JSON.stringify($scope.data.recentFiles);
//        localStorage.moviePath = $scope.data.paths.movie;
//        localStorage.sub1Path = $scope.data.paths.sub1;
//        localStorage.sub2Path = $scope.data.paths.sub2;
        this.close(true);
    });

    // enable opening files by dragging them into the app window
    var holder = document.getElementsByTagName("BODY")[0];
    holder.ondrop = function (e) {
        $scope.$apply(function(){
            e.preventDefault();
            var reloadMovie = false;
            var reloadSubs = false;
            for (var i = 0; i < e.dataTransfer.files.length; ++i) {
                var filePath = e.dataTransfer.files[i].path;
                if (util.detectFormat(filePath).type == 'video'){
                    $scope.data.paths.movie = filePath;
                    reloadMovie = true;
                } else if (util.detectFormat(filePath).type == 'subtitle'){
                    if (! $scope.data.paths.sub1){
                        $scope.data.paths.sub1 = filePath;
                    } else if (! $scope.data.paths.sub2){
                        $scope.data.paths.sub2 = filePath;
                    } else {
                        $scope.data.paths.sub1 = filePath;
                    }
                    reloadSubs = true;
                }
            }
            if(reloadMovie) $scope.reloadMovie();
            if(reloadSubs) $scope.reloadSubs();
            $scope.initPlayback();
            return false;
        });

    };

}]);

app.filter('percentage', ['$filter', function($filter) {
    return function(input, decimals) {
        return $filter('number')(input*100, decimals)+'%';
    };
}]);

app.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if(attr && attr.stopEvent)
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
        }
    };
});
}());