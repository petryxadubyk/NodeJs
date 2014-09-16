//Use 'npm init' to create package.json file for project,
//than specify dependencies section in this file and call 'npm update' to get all dependencies

var express = require('express');

var app = express();

//ROUTES
//Template: app.method(url regex, optional functions, handler function)

//app.post('/users', update_user);
//app.put('/users', create_user);
//app.delete('/users/:id', delete_user);
//app.all('/contacts', all_http_methods_handler);
//REGEX CAN BE USED AS PATH
//app.all('/user[s]?/:username', handler);

app.get('/users/:username', function(req, res){
    res.end('Ypu asked to see '+ req.params.username);
});

app.get('*', function(req, res){
    res.end("Hello World Express");
});

app.listen(3030);