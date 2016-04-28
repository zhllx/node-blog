var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '主页' });
});
router.get('/login', function(req, res, next) {
    res.render('login', { title: '登录' });
});
router.get('/reg', function(req, res, next) {
    res.render('reg', { title: '用户注册' });
});
router.post('/reg', function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var password_re = req.body['password-repeat'];
    console.log('-----8----------');
    console.log(req.session.user);
    //检查用户密码是否输入对了
    if (password_re != password) {
        console.log( '两次输入的密码不一样');
        return res.redirect('/reg'); //重新加载注册页
    }
    //生成密码的md5值
    // var md5 = crypto.createHash('md5');
    // var password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    User.get(newUser.name, function(err, user) {
        console.log('-----9----------');
        if (err) {
            console.log( err);
            return res.redirect('/');
        }
        if (user) {

            console.log( '9999999用户已经存在'+'----'+err+'---'+user);
           
            return res.redirect('/reg');
        }
        //如果不存在，则新增用户
        newUser.save(function(err, user) {
            console.log('-----10----------');
            if (err) {
                console.log('-----11----------');
                console.log( err);
                return res.redirect('/reg'); //注册失败返回注册页
            }
            console.log('-----1----------2---'+user);
            req.session.user = user;//用户信息存入 session
            console.log('-----12----------');
            console.log('注册成功！');
            res.redirect('/');
        });
    })

});
// router.get("/nswbmw",function(req,res){
//   res.send('<h1>hello world<h1>');
// })

module.exports = router;
