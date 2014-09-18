var http = require('http'),
    express = require('express'),
    local = require('./local.config.js'),
    albumHandler = require('./handlers/albums'),
    pagesHandler = require('./handlers/pages'),
    userHandler = require('./handlers/users'),
    helper = require('./handlers/helpers');

//Two key global variables in node.js
//global.const = 'CONSTANT_GLOBAL';
//process.exit(-1);

//Express.js is build on top of Connect.js witch provides lots of Middleware functionality (like working with logger, cookies, cache, etc)
//Not all connect.js functionality is re-exposed by express.js, but can be used as well;

var app = express();

//USE connect.js MIDDLEWARE components
//ORDER is important here
//app.use(express.logger('dev')); //prints server logs to console
app.use(express.responseTime()); //adds new header to the output to hold response time there, X-Response-Time
app.use(express.bodyParser({keepExtensions: true}));
app.use(function(req, res, next){
    if(req.url=='/MOO_COW'){
        res.end('Forbidden url!!!');
        return;
    }
    next(); //don't wont a request, than call next() - it will proceed into further pipeline
});
//To teach server to handle static files use 'STATIC' middleware
app.use(express.static(__dirname + '/../static')); //__dirname - current executing folder, for security consideration only limit access to static folder files
app.use(express.cookieParser());
app.use(express.session({
    secret: 'it\'s very secretive',
    cookie: { maxAge: 86400000 },
    store: new express.session.MemoryStore()
}));
//YOU can use 'npm search middleware connect' to look for some custom middleware

//ROUTES
app.get('/v1/albums.json', albumHandler.list_all);
app.put('/v1/albums.json', requireAPILogin, albumHandler.create_album);
app.get('/v1/albums/:album_name.json', albumHandler.album_by_name);

app.get('/v1/albums/:album_name/photos.json', albumHandler.photos_for_album);
app.put('/v1/albums/:album_name/photos.json', requireAPILogin, albumHandler.add_photo_to_album);

app.put('/v1/users.json', userHandler.register);

//Not need this anymore because STATIC middleware component will do that for us
/*app.get('/content/:file_name', function (req, res) {
    pagesHandler.serve_static_content("content/" + req.params.file_name, res);
});
app.get('/templates/:file_name', function (req, res) {
    pagesHandler.serve_static_content("templates/" + req.params.file_name, res);
});
app.get('/albums/:album_name/:file_name', function (req, res) {
    pagesHandler.serve_static_content("albums/" + req.params.album_name + '/' + req.params.file_name, res);
});*/

//app.get('/pages/admin/home', check_auth, pagesHandler.serve_page); //should go before other page routes to be called
app.get('/pages/:page_name', requirePageLogin, pagesHandler.serve_page);
app.get('/pages/:page_name/:sub_page', requirePageLogin, pagesHandler.serve_page);
app.post('/service/login', userHandler.login);

app.get("/", function (req, res) {
    res.redirect("/pages/home");
    res.end();
});

app.get('*', function(req, res){
    helper.send_failure(res, 404, helper.invalid_resource());
});

//It is a middleware function, so 'next' function parameter is present
function requirePageLogin (req, res, next) {
    if(req.params && req.params.page_name == 'admin'){
        if(req.session && req.session.logged_in){
            next();
        }else{
            res.redirect("/pages/login");
        }
    }else{
        next();
    }
}

function requireAPILogin(req, res, next) {
    // if they're using the API from the browser, then they'll be auth'd
    if (req.session && req.session.logged_in) {
        next();
        return;
    }
    var rha = req.headers.authorization;
    if (rha && rha.search('Basic ') === 0) {
        var creds = new Buffer(rha.split(' ')[1], 'base64').toString();
        var parts = creds.split(":");
        userHandler.authenticate_API(
            parts[0],
            parts[1],
            function (err, resp) {
                if (!err && resp) {
                    next();
                } else
                    need_auth(req, res);
            }
        );
    } else
        need_auth(req, res);
}

function need_auth(req, res) {
    res.header('WWW-Authenticate',
        'Basic realm="Authorization required"');
    if (req.headers.authorization) {
        // no more than 1 failure / 5s
        setTimeout(function () {
            res.send('Authentication required\n', 401);
        }, 5000);
    } else {
        res.send('Authentication required\n', 401);
    }
}


require('./data/db.js').init(function (err, results) {
    if(err){
        console.error("FATAL ERROR INIT:");
        console.error(err);
        process.exit(-1);
    }else{
        app.listen(local.config.port);
    }
});
