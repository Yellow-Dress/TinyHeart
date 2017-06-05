var mongodb = require('./db');

function Number(numberCur,name) {
  this.numberCur = numberCur;
  this.name = name;
};

module.exports = Number;

//存储token信息
Number.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var number = {
      numberCur: this.numberCur,
      name : 'wechat'
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('numbers', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 tokens 集合
      collection.insert(number, {
        safe: true
      }, function (err, number) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, number[0]);//成功！err 为 null，并返回存储后的token文档
      });
    });
  });
};
//更新
Number.updateData = function (numberCur,callback) {

    //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('numbers', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      var whereData = {"name":"wechat"}
      var updateDat = {$set: {"numberCur":numberCur}}; //如果不用$set，替换整条数据
      console.log(numberCur);
      //将用户数据插入 tokens 集合
      collection.update(whereData, updateDat, function (err, number) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, number[0]);//成功！err 为 null，并返回存储后的token文档
      });
    });
  });
};
//读取token信息
Number.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tokens 集合
    db.collection('numbers', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      collection.findOne({
        name: name
      }, function (err, number) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, number);//成功！返回查询的token信息
      });
    });
  });
};