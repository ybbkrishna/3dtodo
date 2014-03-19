
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('127.0.0.1:27017/TODO');
var app = express();
var ObjectID = require('mongodb').ObjectID;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req,res) {
	res.sendfile('./public/index.html');
});
app.post('/login',routes.login(db));
app.get('/logout',routes.logout(db));
app.post('/newuser',routes.newuser(db));
app.post('/addtask',routes.addtask(db));
app.post('/edittask',routes.edittask(db));
app.post('/deltask',routes.deltask(db));
app.get('/alltasks',routes.alltasks(db));
app.post('/editPriority',routes.editPriority(db));
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
