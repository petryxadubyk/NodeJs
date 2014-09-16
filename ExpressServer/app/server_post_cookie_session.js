var express = require('express');

var app = express();

app.use(express.bodyParser({keepExtensions: true})); // puts the parsed body in req.body, and posted files in req.files
app.use(express.cookieParser()); //puts cookies in req.cookies
app.use(express.session({
    secret: 'cat on keyboard',
    cookie: {maxAge: 86400000},
    store: new express.session.MemoryStore()
}));
//Use HTTP Basic Authentication Globally (for all routes)
//app.use(express.basicAuth('username','secret')); //prompt dialog will appear to user before visiting resource

//Route related only basic authentication
app.get('/admin', express.basicAuth('username','secret'), function (req, res) {
});

app.get('*', function (req, res) {
    //need to be set before anything is written to response object
    res.cookie('pet', 'cat', {maxAge: 86400000}); //1 day
    res.clearCookie('pet');

    var s = JSON.stringify(req.session);
    req.session.last_visit = Date.now();

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(JSON.stringify(req.cookies) + "<br/>\n");
    res.end(s + '\nThanks!\n');
});

app.post('*', function (req, res) {
    res.end(JSON.stringify(req.body) + '\n' +
        JSON.stringify(req.files) + '\n')
});

app.listen(3030);