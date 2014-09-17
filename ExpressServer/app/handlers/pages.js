
var fs = require('fs'),
    async = require('async'),
    local = require('./../local.config.js');

exports.version = '0.1.0';

// /pages/home
// /pages/album/italy2012
// /pages/admin/home
// /pages/admin/add_photo
// /pages/admin/add_album

exports.serve_page = function (req, res) {
    var page_name = req.params.page_name;

    if(req.params.sub_page && req.params.page_name == 'admin')
        page_name = req.params.page_name + "_" + req.params.sub_page;
   console.log(req.params.page_name);
    fs.readFile('basic.html', 'utf8',
        function (err, contents) {
            if (err) {
                res.writeHead(503, {'Content-Type':'text/html'});
                res.end("Can't load stub");
                return;
            }
            // replace page name, and then dump to output.
            var host = local.config.host +":"+local.config.port;

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents.replace('{{PAGE_NAME}}', page_name).replace(new RegExp('{{HOST}}', 'g'), host));
        }
    );
};