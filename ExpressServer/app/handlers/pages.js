
var fs = require('fs'),
    async = require('async'),
    helpers_instance = require('./helpers'),
    helpers = helpers_instance.create_responses();

exports.version = '0.1.0';

exports.serve_static_content = function (file, res) {
    fs.exists(file, function (exists) {
        if (!exists) {
            var out = { error: "not_found", message: "'" + file + "' not found" };
            helpers.send_failure(res, 404, out);
            return;
        }
        var rs = fs.createReadStream(file);
        var ct = helpers.content_type_for_file(file);

        rs.on('error',
            function () {
                var out = { error: "resource_not_found", message: "'" + file + "' not found" };
                helpers.send_failure(res, 404, out);
            }
        );
        res.writeHead(200, { "Content-Type": ct });
        rs.pipe(res);
    });
};

/**
 * All pages come from the same one skeleton HTML file that
 * just changes the name of the JavaScript loader that needs to be
 * downloaded.
 */
exports.serve_page = function (req, res) {
    var page_name = req.params.page_name;
    fs.readFile('basic.html', 'utf8',
        function (err, contents) {
            if (err) {
                res.writeHead(503, {'Content-Type':'text/html'});
                res.end("Can't load stub");
                return;
            }
            // replace page name, and then dump to output.
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents.replace('{{PAGE_NAME}}', page_name));
        }
    );
};