var http = require('http'),
    url = require('url'),
    fsHelper = require('./fileSystemHelper'),
    responses = require('./respModule'),
    resp = responses.create_responses();

//ROUTES TO HANDLE
//  /albums.json
//  /albums/italy2012.json
//  /content/BLAH.html
//  /templates/BLAH.html
//  /pages/home

function handle_incoming_request(req, res){
    req.parsed_url = url.parse(req.url, true);
    var core_url = req.parsed_url.pathname;

    if (core_url.substring(0, 7) == '/pages/') {
        fsHelper.serve_page(req, res);
    } else if (core_url.substring(0, 11) == '/templates/') {
        fsHelper.serve_static_file("templates/" + core_url.substring(11), res);
    } else if (core_url.substring(0, 9) == '/content/') {
        fsHelper.serve_static_file("content/" + core_url.substring(9), res);
    } else if (core_url == '/albums.json') {
        handle_list_albums(req, res);
    } else if (core_url.substr(0, 7) == '/albums'
        && core_url.substr(core_url.length - 5) == '.json') {
        handle_get_album(req, res);
    } else {
        resp.send_failure(res, 404, resp.invalid_resource());
    }
}

function handle_list_albums(req, res) {
    fsHelper.load_album_list(function (err, albums) {
        if (err) {
            resp.send_failure(res, 500, err);
            return;
        }
        resp.send_success(res, { albums: albums });
    });
}

function handle_get_album(req, res) {

    // get the GET params
    var album_name = resp.get_album_name(req);
    var getp = resp.get_query_params(req);
    var page_num = getp.page ? getp.page : 0;
    var page_size = getp.page_size ? getp.page_size : 1000;

    if (isNaN(parseInt(page_num))) page_num = 0;
    if (isNaN(parseInt(page_size))) page_size = 1000;

    fsHelper.load_album(
        album_name,
        page_num,
        page_size,
        function (err, album_contents) {
            if (err && err == "no_such_album") {
                resp.send_failure(res, 404, err);
            }  else if (err) {
                resp.send_failure(res, 500, err);
            } else {
                resp.send_success(res, { album_data: album_contents });
            }
        }
    );
}

var server = http.createServer(handle_incoming_request);
server.listen(8080);

