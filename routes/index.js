var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var Creeper = require('../conf/creeper.js');

// var http = require('http');
var cheerio = require("cheerio");
var superagent = require('superagent');
/* GET home page. */
router.get('/', function(req, res, next) {
    //判断是否是第一页，并把请求的页数转换成number 类型
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //查询并返回第page页的10篇文章
    Post.get(null, page, function(err, posts, total) {
        if (err) {
            posts = [];
        }
        // console.log(posts);
        res.render('index', {
            title: '主页',
            user: req.session.user,
            posts: posts,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + posts.length) == total,
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
    // console.log(req.session.user);
    //检查用户密码是否输入对了

    if (password_re != password) {
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
            // console.log(err);
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
    var tags = [req.body.tag1, req.body.tag2, req.body.tag3];
    var post = new Post(currentUser.name, req.body.title, tags, req.body.post);
    post.save(function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功');
        res.redirect('/');
    });
});
//upload
router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
    res.render('upload', {
        title: '文件上传',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
// router.post('/upload',checkNotLogin);
router.post('/upload', function(req, res) {
        req.flash('success', '上传成功');
        res.redirect('/upload');
    })
    //个人主页
router.get('/u/:name', function(req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //检查用户名是否存在
    User.get(req.params.name, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name, page, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts,
                user: req.session.user,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
});
//文章中详细页
router.get('/u/:name/:day/:title', function(req, res) {
    var name = req.params.name;
    var day = req.params.day;
    var title = req.params.title;


    Post.getOne(name, day, title, function(err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('article', {
            title: title,
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
});
router.post('/u/:name/:day/:title', function(req, res) {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 　1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '留言成功');
        res.redirect('back');
    });
});
//编辑
router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    var day = req.params.day;
    var title = req.params.title;
    Post.edit(currentUser.name, day, title, function(err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        res.render('edit', {
            title: '编辑',
            post: post,
            user: currentUser,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
});
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    var day = req.params.day;
    var title = req.params.title;
    Post.update(currentUser.name, day, title, req.body.post, function(err) {
        var url = encodeURI('/u/' + currentUser.name + '/' + day + '/' + title);
        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }
        req.flash('success', '修改成功');
        res.redirect(url);
    })

});
//删除
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    var day = req.params.day;
    var title = req.params.title;
    Post.remove(currentUser.name, day, title, function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '删除成功');
        res.redirect('/');
    })
});
//archive 存档路由
router.get('/archive', function(req, res) {
    Post.archive(function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        // console.log(posts);
        res.render('archive', {
            title: "存档",
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
})
router.get('/creeper', checkLogin);
router.get('/creeper', function(req, res) {
    res.render('creeper', {
        title: '发表Blog',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/creeper', checkLogin);
router.post('/creeper', function(req, res) {

    var currentUser = req.session.user;
    // var url = 'http://www.cnblogs.com/cate/108703/';
    var page = req.body.page;
    var content = req.body.content;
    var arr = [];
    var add = [];
    var x = 0;
    var a = 0;


    var url = 'http://www.cnblogs.com/cate/108703/' + page;
    console.log(url)
    superagent.get(url).end(function(err, sers) {
        var $ = cheerio.load(sers.text);
        var title = $('.titlelnk');
        var bool = true;
        title.each(function(index, titlelnk) {
            superagent.get($(titlelnk).attr('href')).end(function(err, sers) {
                var $ = cheerio.load(sers.text);
                var content = $('#cnblogs_post_body').text();
                add[index] = {};
                add[index].head = $(titlelnk).text();
                add[index].content = $('#cnblogs_post_body').text();
                add[index].link = $(titlelnk).attr('href');
                arr.push(index);
                // console.log($(titlelnk).text());
                if (arr.length == title.length) {
                    var post = [];
                    post[0] = new Post(currentUser.name, add[0].head, ["转载", "--", add[0].link], add[0].content);
                    post[0].save(function(err) {
                        post[1] = new Post(currentUser.name, add[1].head, ["转载", "--", add[1].link], add[1].content);
                        post[1].save(function(err) {
                            post[2] = new Post(currentUser.name, add[2].head, ["转载", "--", add[2].link], add[2].content);
                            post[2].save(function(err) {
                                post[3] = new Post(currentUser.name, add[3].head, ["转载", "--", add[3].link], add[3].content);
                                post[3].save(function(err) {
                                    post[4] = new Post(currentUser.name, add[4].head, ["转载", "--", add[4].link], add[4].content);
                                    post[4].save(function(err) {
                                        post[5] = new Post(currentUser.name, add[5].head, ["转载", "--", add[5].link], add[5].content);
                                        post[5].save(function(err) {
                                            post[6] = new Post(currentUser.name, add[6].head, ["转载", "--", add[6].link], add[6].content);
                                            post[6].save(function(err) {
                                                post[7] = new Post(currentUser.name, add[7].head, ["转载", "--", add[7].link], add[7].content);
                                                post[7].save(function(err) {
                                                    post[8] = new Post(currentUser.name, add[8].head, ["转载", "--", add[8].link], add[8].content);
                                                    post[8].save(function(err) {
                                                        post[9] = new Post(currentUser.name, add[9].head, ["转载", "--", add[9].link], add[9].content);

                                                        post[9].save(function(err) {
                                                            post[10] = new Post(currentUser.name, add[10].head, ["转载", "--", add[10].link], add[10].content);

                                                            post[10].save(function(err) {
                                                                post[11] = new Post(currentUser.name, add[11].head, ["转载", "--", add[11].link], add[11].content);

                                                                post[11].save(function(err) {
                                                                    post[12] = new Post(currentUser.name, add[12].head, ["转载", "--", add[12].link], add[12].content);

                                                                    post[12].save(function(err) {
                                                                        post[13] = new Post(currentUser.name, add[13].head, ["转载", "--", add[13].link], add[13].content);

                                                                        post[13].save(function(err) {
                                                                            post[14] = new Post(currentUser.name, add[14].head, ["转载", "--", add[14].link], add[14].content);

                                                                            post[14].save(function(err) {
                                                                                post[15] = new Post(currentUser.name, add[15].head, ["转载", "--", add[15].link], add[15].content);

                                                                                post[15].save(function(err) {
                                                                                    post[16] = new Post(currentUser.name, add[16].head, ["转载", "--", add[16].link], add[16].content);

                                                                                    post[16].save(function(err) {
                                                                                        return res.redirect('/archive');
                                                                                    });

                                                                                });

                                                                            });
                                                                        });

                                                                    });

                                                                });

                                                            });

                                                        });

                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

            })
        })
    })

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
