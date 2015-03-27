process.env.NODE_ENV = process.env.NODE_ENV || (process.argv[2] == 'pro' ? 'production' : 'development');

var express = require('express'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    YAML = require('yamljs'),
    config = require('./config/default.yml'),
    CONFIG = config[process.env.NODE_ENV],
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    crypto = require('crypto'),
    bodyParser = require('body-parser'),
    request = require('request'),
    helmet = require('helmet'),
    methodOverride = require('method-override'),
//ROUTE
    app = express();
    var server = require('http').Server(app),
        io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ store: new RedisStore(CONFIG.redisOptions), secret: 'supersecret' }));
app.use(passport.initialize());
app.use(passport.session());
/// catch 404 and forwarding to error handler
/// error handlers
// development error handler
// will print stacktrace

// ============================ socket io ===========================
io.on('connection', function (socket) {
    socket.emit('news', { hello: 'Hanh Map' });

    socket.on('private message', function (msg, from) {
        console.log('I received a private message by ', from, ' saying ', msg);
    });

    socket.on('testSendCallBack', function(name, fn){
        console.log(name);
        fn('Hanh');
    });

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

if (app.get('env') == 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(CONFIG.port || 3000);


