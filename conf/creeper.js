 var http = require('http');
 var cheerio = require("cheerio");

 function Cheerio(url) {
     this.url = url;
 }
 // var url = 'http://www.cnblogs.com/cate/108703/';
 Cheerio.prototype.get = function(callback) {
    http.get(this.url,function(resp){
        var html = '';
        resp.on('data',function(data){
            html += data;

        });
        resp.on('end',function(){
            callback(html);
        })
    })

 };
 module.exports = Cheerio;
