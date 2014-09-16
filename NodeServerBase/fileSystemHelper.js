/**
 * Created by user on 15/09/2014.
 */
var fs = require('fs'),
    async = require('async'),
    responses = require('./respModule'),
    resp = responses.create_responses();

exports.load_album_list = function(callback){
    fs.readdir("albums/",
        function (err, files) {
            if (err) {
                callback({ error: "file_error",
                    message: JSON.stringify(err) });
                return;
            }
            var only_dirs = [];
            async.forEach(
                files,
                function (element, cb) {
                    fs.stat("albums/" + element,
                        function (err, stats) {
                            if (err) {
                                cb({ error: "file_error",
                                    message: JSON.stringify(err) });
                                return;
                            }
                            if (stats.isDirectory()) {
                                only_dirs.push({ name: element });
                            }
                            cb(null);
                        }
                    );
                },
                function (err) {
                    callback(err, err ? null : only_dirs);
                }
            );
        }
    );
};

exports.load_album = function(album_name, page, page_size, callback) {
    fs.readdir("albums/" + album_name,
        function (err, files) {
            if (err) {
                if (err.code == "ENOENT") {
                    callback(no_such_album());
                } else {
                    callback({ error: "file_error",
                        message: JSON.stringify(err) });
                }
                return;
            }

            var only_files = [];
            var path = "albums/" + album_name + "/";

            async.forEach(
                files,
                function (element, cb) {
                    fs.stat(path + element,
                        function (err, stats) {
                            if (err) {
                                cb({ error: "file_error",
                                    message: JSON.stringify(err) });
                                return;
                            }
                            if (stats.isFile()) {
                                var obj = { filename: element,
                                    desc: element };
                                only_files.push(obj);
                            }
                            cb(null);
                        }
                    );
                },
                function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        var ps = page_size;
                        var photos = only_files.splice(page * ps, ps);
                        var obj = { short_name: album_name.substring(1),
                            photos: photos };
                        callback(null, obj);
                    }
                }
            );
        }
    );
};

exports.serve_static_file = function(file, res) {
    fs.exists(file, function (exists) {
        if (!exists) {
            var out = { error: "not_found",
                message: "'" + file + "' not found" };
            resp.send_failure(res,404,out);
            return;
        }

        var rs = fs.createReadStream(file);
        rs.on(
            'error',
            function () {
                res.end();
            }
        );

        var ct = resp.content_type_for_file(file);
        res.writeHead(200, { "Content-Type" : ct });
        rs.pipe(res);
    });
};

/**
 * All pages come from the same one skeleton HTML file that
 * just changes the name of the JavaScript loader that needs to be
 * downloaded.
 */
exports.serve_page = function(req, res) {

    var page = resp.get_page_name(req);

    fs.readFile('basic.html', 'utf8',
        function (err, contents) {
            if (err) {
                resp.send_failure(res, 500, err);
                return;
            }

            // replace page name, and then dump to output.
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents.replace('{{PAGE_NAME}}', page));
        }
    );
};