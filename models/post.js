var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/blog');
var Schema = mongoose.Schema; //  创建模型
var userScheMa = new Schema({
    name: String,
    title: String,
    post: String

}, {
    collection: 'users'
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
var userModel = mongoose.model('users', userScheMa); //  与users集合关联