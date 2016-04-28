var mongoose = require("mongoose"); //  顶会议用户组件
mongoose.connect('mongodb://localhost/blog');
var Schema = mongoose.Schema; //  创建模型
var userScheMa = new Schema({
    name: String,
    password: String,
    email: String

}, {
    collection: 'users'
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
var userModel = mongoose.model('users', userScheMa); //  与users集合关联

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};
//存储用户信息
User.prototype.save = function(callback) {
    console.log('-----4----------');
    //要存入的数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    var newUser = new userModel(user);
    newUser.save(function(err, user) {
        console.log('-----5----------');
        if (err) {
            console.log('-----6----------'+ err);
            return callback(err);
        }
        console.log('-----7----------');
        console.log( '777777777存在'+'----'+err+'---'+user);
        callback(null, user)
    });

};
User.get = function(name, callback) {
    userModel.findOne({ name: name }, function(err, user) {
        console.log('-----1----------');
        if (err) {
            console.log('-----2----------'+ err);
            return callback(err);
        }
        console.log( '22222222222用户已经存在'+'----'+err+'---'+user);
        console.log('-----3----------');
        callback(null, user)
         
    })

}
module.exports = User;
