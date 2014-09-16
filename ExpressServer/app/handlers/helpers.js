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

    this.send_success = function(res, data) {
        res.writeHead(200, {"Content-Type": "application/json"});
        var output = { error: null, data: data };
        res.end(JSON.stringify(output) + "\n");
    };

    this.send_failure = function(res, http_code, err) {
        var code = err.code ? err.code : err.name;
        res.writeHead(http_code, { "Content-Type" : "application/json" });
        res.end(JSON.stringify({error: code, message: err.message}) + "\n");
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
/*var helpers_instance = require('./helpers_instance');
var helper = helpers_instance.create_responses();
helper.send_success();*/

//OR

//Expose Module as a Constructor Module
//module.exports = Responses;
//using
/*var Responses = require('./helpers_instance');
var helper = new Responses();
helper.send_success();*/