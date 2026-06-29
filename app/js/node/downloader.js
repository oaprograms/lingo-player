// Subtitle search + download via the OpenSubtitles.org public website (no API key).
//   - precise: matches the exact movie file by its OpenSubtitles hash
//   - multi-language, ranked by downloads / rating
//   - native ZIP/GZIP extraction (zlib), no extra dependencies

var https = require('https');
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');
var urlmod = require('url');

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// ---------------------------------------------------------------- HTTP GET (-> Buffer), follows redirects
function httpGetBuffer(urlStr, cb, redirs) {
    redirs = redirs || 0;
    var u = urlmod.parse(urlStr);
    var mod = u.protocol === 'https:' ? https : http;
    var options = {
        host: u.hostname,
        port: u.port,
        path: u.path,
        headers: { 'User-Agent': UA, 'Accept': '*/*' },
        rejectUnauthorized: false
    };
    var req = mod.get(options, function (res) {
        if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location && redirs < 6) {
            res.resume();
            return httpGetBuffer(urlmod.resolve(urlStr, res.headers.location), cb, redirs + 1);
        }
        if (res.statusCode !== 200) { res.resume(); return cb(new Error('HTTP ' + res.statusCode)); }
        var chunks = [];
        res.on('data', function (c) { chunks.push(c); });
        res.on('end', function () { cb(null, Buffer.concat(chunks), res.headers); });
    });
    req.on('error', cb);
    req.setTimeout(20000, function () { req.abort(); });
}

// ---------------------------------------------------------------- OpenSubtitles movie hash
// 64-bit checksum: filesize + sum of 64-bit ints over the first 64KB and last 64KB.
function computeHash(filePath) {
    var HASH_SIZE = 65536;
    var fd = fs.openSync(filePath, 'r');
    try {
        var size = fs.fstatSync(fd).size;
        if (size < HASH_SIZE) return null; // too small to hash reliably
        var buf = new Buffer(HASH_SIZE * 2); // (io.js 1.2 has no Buffer.alloc; fully overwritten below)
        fs.readSync(fd, buf, 0, HASH_SIZE, 0);
        fs.readSync(fd, buf, HASH_SIZE, HASH_SIZE, size - HASH_SIZE);
        var lo = size % 0x100000000;
        var hi = Math.floor(size / 0x100000000);
        for (var i = 0; i + 8 <= buf.length; i += 8) {
            lo += buf.readUInt32LE(i);
            hi += buf.readUInt32LE(i + 4);
            while (lo >= 0x100000000) { lo -= 0x100000000; hi += 1; }
            hi = hi % 0x100000000;
        }
        function h8(n) { var s = (n >>> 0).toString(16); while (s.length < 8) s = '0' + s; return s; }
        return { hash: (h8(hi) + h8(lo)).toLowerCase(), size: size };
    } finally { fs.closeSync(fd); }
}

// ---------------------------------------------------------------- ZIP / GZIP -> first subtitle Buffer
function extractSubtitle(buf, extensions) {
    if (buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
        return zlib.gunzipSync(buf); // single gzipped file
    }
    // zip: locate the End Of Central Directory record, then walk the directory
    var eocd = -1;
    for (var i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65536; i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('not a zip');
    var count = buf.readUInt16LE(eocd + 10);
    var p = buf.readUInt32LE(eocd + 16);
    var best = null;
    for (var e = 0; e < count; e++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) break;
        var method = buf.readUInt16LE(p + 10);
        var compSize = buf.readUInt32LE(p + 20);
        var nameLen = buf.readUInt16LE(p + 28);
        var extraLen = buf.readUInt16LE(p + 30);
        var commLen = buf.readUInt16LE(p + 32);
        var localOff = buf.readUInt32LE(p + 42);
        var name = buf.toString('binary', p + 46, p + 46 + nameLen); // 'latin1' alias absent in io.js 1.2
        var ext = name.split('.').pop().toLowerCase();
        if (!extensions || extensions.indexOf(ext) !== -1) { best = { method: method, compSize: compSize, localOff: localOff }; break; }
        p += 46 + nameLen + extraLen + commLen;
    }
    if (!best) throw new Error('no subtitle file in zip');
    var lo = best.localOff;
    if (buf.readUInt32LE(lo) !== 0x04034b50) throw new Error('bad local header');
    var dataStart = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28);
    var comp = buf.slice(dataStart, dataStart + best.compSize);
    if (best.method === 0) return comp;                      // stored
    if (best.method === 8) return zlib.inflateRawSync(comp);  // deflate
    throw new Error('unsupported zip compression ' + best.method);
}

// ---------------------------------------------------------------- parse OpenSubtitles.org XML results
function field(block, name) {
    var m = block.match(new RegExp('<' + name + '[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + name + '>', 'i'));
    return m ? m[1].trim() : '';
}
function parseSubtitles(xml) {
    var out = [];
    var re = /<subtitle>([\s\S]*?)<\/subtitle>/g, m;
    while ((m = re.exec(xml))) {
        var b = m[1];
        var dl = b.match(/<IDSubtitle[^>]*\bLinkDownload='([^']+)'/i);
        if (!dl) continue;
        out.push({
            url: dl[1],
            format: (field(b, 'SubFormat') || 'srt').toLowerCase(),
            downloads: parseInt(field(b, 'SubDownloadsCnt'), 10) || 0,
            rating: parseFloat(field(b, 'SubRating')) || 0,
            bad: parseInt(field(b, 'SubBad'), 10) || 0
        });
    }
    return out;
}

// ---------------------------------------------------------------- ranking (most trustworthy first)
function rank(list, extensions) {
    return list
        .filter(function (s) { return !extensions || extensions.indexOf(s.format) !== -1; })
        .sort(function (a, b) {
            if (b.downloads !== a.downloads) return b.downloads - a.downloads;
            if (b.rating !== a.rating) return b.rating - a.rating;
            return a.bad - b.bad;
        });
}

function searchUrl(language, parts) {
    return 'https://www.opensubtitles.org/en/search/sublanguageid-' + encodeURIComponent(language) + '/' + parts + '/xml';
}

function cleanQuery(moviePath) {
    var name = path.basename(moviePath).replace(/\.[a-z0-9]{2,4}$/i, '');
    name = name.replace(/[._]/g, ' ')
        .replace(/\b(1080p|720p|2160p|480p|x264|x265|h264|h265|hevc|bluray|brrip|bdrip|webrip|web-dl|web|hdtv|dvdrip|aac|ac3|dts|xvid|yify|rarbg|repack|proper|extended)\b.*$/i, '')
        .replace(/[\[\(].*$/, '')
        .trim();
    return name;
}

// ---------------------------------------------------------------- public API
// returns an array of { url, format }, best match first
exports.searchSubsExtendByImdbID = function (language, moviePath, extensions, limit, cb) {
    var info = null;
    try { info = computeHash(moviePath); } catch (e) { info = null; }

    function done(list) {
        cb(rank(list, extensions).slice(0, limit).map(function (s) { return { url: s.url, format: s.format }; }));
    }

    function byQuery() {
        var q = cleanQuery(moviePath);
        if (!q) return cb([]);
        httpGetBuffer(searchUrl(language, 'query-' + encodeURIComponent(q)), function (err, buf) {
            if (err || !buf) return cb([]);
            done(parseSubtitles(buf.toString('utf8')));
        });
    }

    if (info) {
        httpGetBuffer(searchUrl(language, 'moviehash-' + info.hash + '/moviebytesize-' + info.size), function (err, buf) {
            var list = (!err && buf) ? parseSubtitles(buf.toString('utf8')) : [];
            if (list.length) return done(list);
            byQuery(); // exact-file search found nothing -> fall back to the title
        });
    } else {
        byQuery();
    }
};

// downloads url (zip/gz), extracts the subtitle, writes it to dest
exports.download = function (url, dest, cb) {
    fs.stat(dest, function (err) {
        if (!err) return cb(); // already downloaded
        httpGetBuffer(url, function (e, buf) {
            if (e) return cb(e.message || 'download failed');
            var sub;
            try { sub = extractSubtitle(buf, ['srt', 'sub', 'txt', 'ass', 'ssa']); }
            catch (ex) { return cb(ex.message); }
            fs.writeFile(dest, sub, function (werr) { cb(werr ? werr.message : undefined); });
        });
    });
};
