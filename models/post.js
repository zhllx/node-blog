var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, tags, post) {

    this.name = name;
    this.title = title;
    this.post = post;
    this.time = {};
    this.tags = tags;
}
module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 　1),
        day: date.getFullYear() + '-' + (date.getMonth() + 　1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 　1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    this.time = time;
    var post = {
        name: this.name,
        time: this.time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        pv: 0,
        comments: [] //用来存储留言功能
    }

    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取post集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null); //返回err 为null
            });
        });
    });
};

//读取文章
Post.get = function(name, page, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //根据query 对象查询文章
            // collection.find(query).sort({
            //     time: -1
            // }).toArray(function(err, docs) {
            //     mongodb.close();
            //     if (err) {

            //         return callback(err);
            //     }
            //     //markdown 格式
            //     docs.forEach(function(doc,index) {
            //         doc.post = markdown.toHTML(doc.post);
            //         console.log(index);
            //     })
            //     callback(null, docs);
            // });
            //使用 count 返回特定查询的文档数 total
            collection.count(query, function(err, total) {
                //根据 query对象查询，并跳过前（page-1）*10个结果，返回之后的10个结果
                collection.find(query, {
                    skip: (page - 1),
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function(err, docs) {
                    mongodb.close();
                    if (err) {

                        return callback(err);
                    }
                    //markdown 格式
                    docs.forEach(function(doc, index) {
                        doc.post = markdown.toHTML(doc.post);
                        // console.log(index);
                    })
                    callback(null, docs, total);
                });
            })

        });
    })
};
//根据用户名，发布日期以及文章名精确获取一篇文章
Post.getOne = function(name, day, title, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                'name': name,
                'time.day': day,
                'title': title
            }, function(err, doc) {
                if (doc) {
                    collection.update({
                        'name': name,
                        'time.day': day,
                        'title': title
                    }, { "$inc": { "pv": 1 } });
                }
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //解析markdown 为HTML
                if (doc) {
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function(comment) {
                        comment.content = markdown.toHTML(comment.content);
                    })
                }
                callback(null, doc);
            });
        })
    });
};
//返回原始发表的内容（markdown 格式）
Post.edit = function(name, day, title, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                'name': name,
                'time.day': day,
                'title': title
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //返回查询的文章（markdown格式）
                callback(null, doc);
            });
        })
    })
};

//更新一篇文章及其相关信息
Post.update = function(name, day, title, post, callback) {
        mongodb.open(function(err, db) {
            if (err) {
                return callback(err);
            }
            db.collection('posts', function(err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                collection.update({
                    'name': name,
                    'time.day': day,
                    'title': title
                }, {
                    $set: { post: post }
                }, function(err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //返回查询的文章（markdown格式）
                    callback(null);
                });
            })
        })
    }
    //删除
Post.remove = function(name, day, title, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                'name': name,
                'time.day': day,
                'title': title
            }, {
                w: 1
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //返回查询的文章（markdown格式）
                callback(null);
            });
        })
    })
};
//返回所有文章存档信息
Post.archive = function(callback) {

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //返回只包含 name、time、title 属性的文档组成的存档数组
            collection.find({}, {
                name: 1,
                time: 1,
                title: 1
            }, {
                sort: { time: -1 }
            }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                return callback(null, docs);
            });
        });
    });
};
//爬到的数据返回在数据库中保持
