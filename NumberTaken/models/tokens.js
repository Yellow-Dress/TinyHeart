var mongodb = require('./db');

function Token(accessToken,name) {
  this.accessToken = accessToken;
  this.name = name;
};

module.exports = Token;

//存储token信息
Token.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var token = {
      access_token: this.accesToken,
      name : 'wechat'
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('tokens', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 tokens 集合
      collection.insert(token, {
        safe: true
      }, function (err, token) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, token[0]);//成功！err 为 null，并返回存储后的token文档
      });
    });
  });
};
//更新
Token.updateData = function (access_token,callback) {

    //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('tokens', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      var whereData = {"name":"wechat"}
      var updateDat = {$set: {"access_token":access_token}}; //如果不用$set，替换整条数据
      console.log(access_token);
      //将用户数据插入 tokens 集合
      collection.update(whereData, updateDat, function (err, token) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, token[0]);//成功！err 为 null，并返回存储后的token文档
      });
    });
  });
};
//读取token信息
Token.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('tokens', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      collection.findOne({
        name: name
      }, function (err, token) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, token);//成功！返回查询的token信息
      });
    });
  });
};