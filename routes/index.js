var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    Post.get(null, function(err, posts) {
        if (err) {
            posts = [];
        }
        // console.log(posts);
        res.render('index', {
            title: '主页',
            user: req.session.user,
            posts: posts,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
});
// router.get('/login', function(req, res, next) {
//     res.render('login', { title: '登录' });
// });
router.get('/login', checkNotLogin);
//登录
router.get('/login', function(req, res, next) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
})
router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
    //生成密码的md5值
    // var md5 = crypto.createHash('md5');
    // var password = md5.update(req.body.password).digest('hex');
    //检测用户是否存在
    User.get(req.body.name, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在1');
            return res.redirect('/login'); //用户不存在则跳转到登录也
        }
        //检测密码是否一致
        if (user.password != req.body.password) {
            req.flash('error', '用户不存在2');
            return res.redirect('/login'); // 密码错误则跳转到登录页
        }
        //用户名密码都匹配后，将用户名信息存入 session
        req.session.user = user;
        req.flash('success', '登录成功');
        res.redirect('/'); //登录后跳转到主页
    })
})
router.get('/reg', checkNotLogin);
//注册
router.get('/reg', function(req, res, next) {
    res.render('reg', {
        title: '用户注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var password_re = req.body['password-repeat'];
    console.log('-----8----------');
    console.log(req.session.user);
    //检查用户密码是否输入对了
    if (password_re != password) {
        console.log('两次输入的密码不一样');
        req.flash('error', '两次输入的密码不一样');
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
    //检测用户名是否存在
    User.get(req.body.name, function(err, user) {
        if (err) {
            console.log(err);
            req.flash('error', err);
            return res.redirect('/');
        }
        if (user) {
            req.flash('error', '用户名已经存在');
            return res.redirect('/reg');
        }
        //如果不存在，则新增用户
        newUser.save(function(err, user) {
            if (err) {
                console.log(err);
                req.flash('error', err);
                return res.redirect('/reg'); //注册失败返回注册页
            }
            req.session.user = user; //用户信息存入 session
            console.log('注册成功！');
            req.flash('success', '注册成功！');
            res.redirect('/');
        });
    })

});
// router.get("/nswbmw",function(req,res){
//   res.send('<h1>hello world<h1>');
// })
router.get('/logout', checkLogin);
//退出
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '退出成功');
    res.redirect('/'); //登录后跳转到主页
});
//发表
router.get('/post', checkLogin);
router.get('/post', function(req, res) {
    res.render('post', {
        title: '发表Blog',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
router.post('/post', checkLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功');
        res.redirect('/');
    });
});
//使用路由中间件，对页面权限控制。
// 如果当前中间件没有终结请求-响应循环，则必须调用 next() 方法将控制权交给下一个中间件，
// 否则请求就会挂起。中间件一般不直接对客户端进行响应，而是对请求进行一些预处理，再传递下去；
// 中间件一般会在路由处理之前执行
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录！');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        res.redirect('back'); //返回之前登录页面
    }
    next();
}
module.exports = router;
