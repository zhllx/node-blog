var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
//引入settings 配置文件
var settings = require('./settings');
//引入connect-flash 模板 实现页面通知的功能
var flash = require('connect-flash');
//修改ejs模板 为 HTML
// var ejs = require('ejs');
//使用express-session connect-mongo 模块实现会话信息存储到moogoDB
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//增加文件上传功能
var multer = require('multer');


var app = express();
//注册hmtl模板引擎

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
//将模板引擎换成HTML
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//页面通知
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db, //cookie 名字
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 24 * 30 }, //30 days
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        // db: settings.db,
        // host: settings.host,
        // port: settings.port
        url: 'mongodb://localhost/blog'
    })
}));
app.use(multer({
  dest: './public/upload',
  rename: function (fieldname, filename) {
    return filename+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);
  }
}));
app.use(flash());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
//文件上传
// app.use(multer({
//     dest:'./public/images',//上传文件所在目录
//     //rename 函数用来修改上传后文件名，这里不修改
//     rename:function(fieldname,filename){
//         return filename;
//     }
// }));


// catch 404 and forward to error handler


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
require('events').EventEmitter.defaultMaxListeners = Infinity;

module.exports = app;
