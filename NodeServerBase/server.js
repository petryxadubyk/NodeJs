var http = require('http'),
    async = require('async'),
    path = require("path"),
    fs = require('fs'),
    url = require('url');


function handle_incoming_request(req, res){
    req.parsedUrl = url.parse(req.url, true);
    var core_url = req.parsed_Url.pathname;

    if (core_url.substring(0, 7) == '/pages/') {
        serve_page(req, res);
    } else if (core_url.substring(0, 11) == '/templates/') {
        serve_static_file("templates/" + core_url.substring(11), res);
    } else if (core_url.substring(0, 9) == '/content/') {
        serve_static_file("content/" + core_url.substring(9), res);
    } else {
        send_failure(res, 404, invalid_resource());
    }
}

var server = http.createServer(handle_incoming_request);


function serve_static_file(file, res) {
    fs.exists(file, function(exists){
        if(!exists){
            res.writeHead(404, {'Content-Type': 'application/json'});
            var out = { error: "not_found",
                message: "'" + file + "' not found" };
            res.end(JSON.stringify(out) + "\n");
            return;
        }

        var rs = fs.createReadStream(file);
        rs.on('error',
        function(){
           res.end();
        });

        var ct = content_type_for_file(file);
        res.writeHead(200, {'Content-Type': ct});
        rs.pipe(res);
    });
}

function content_type_for_file (file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        default: return 'text/plain';
    }
}

function send_success(res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");

}


function send_failure(res, code, err) {
    res.writeHead(code, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(err) + "\n");
}


function invalid_resource() {
    return { error: "invalid_resource",
        message: "the requested resource does not exist." };
}