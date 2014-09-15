var path = require("path");

var Responses = function(){
    this.content_type_for_file = function(file) {
        var ext = path.extname(file);
        switch (ext.toLowerCase()) {
            case '.html': return "text/html";
            case ".js": return "text/javascript";
            case ".css": return 'text/css';
            case '.jpg': case '.jpeg': return 'image/jpeg';
            default: return 'text/plain';
        }
    };

    this.get_page_name = function(req) {
        var core_url = req.parsed_url.pathname;
        var parts = core_url.split("/");
        return parts[2];
    };

    this.get_album_name = function(req) {
        var core_url = req.parsed_url.pathname;
        return core_url.substr(7, core_url.length - 12);
    }
    this.get_template_name = function(req) {
        var core_url = req.parsed_url.pathname;
        return core_url.substring(11);       // remove /templates/
    }
    this.get_query_params=function(req) {
        return req.parsed_url.query;
    }

    this.send_success = function(res, data) {
        res.writeHead(200, {"Content-Type": "application/json"});
        var output = { error: null, data: data };
        res.end(JSON.stringify(output) + "\n");

    };

    this.send_failure = function(res, code, err) {
        res.writeHead(code, { "Content-Type" : "application/json" });
        res.end(JSON.stringify(err) + "\n");
    };

    this.invalid_resource=function() {
        return { error: "invalid_resource",
            message: "the requested resource does not exist." };
    };
}

//Expose Module as a Factory Module
exports.create_responses = function(){
    return new Responses();
};
//using
/*var responses = require('./responses');
var resp = responses.create_responses();
resp.send_success();*/

//OR

//Expose Module as a Constructor Module
//module.exports = Responses;
//using
/*var Responses = require('./responses');
var resp = new Responses();
resp.send_success();*/