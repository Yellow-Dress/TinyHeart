var mongodb = require('./db');

function Ticket(apiTicket,name) {
  this.apiTicket = apiTicket;
  this.name = name;
};

module.exports = Ticket;

//存储API ticket信息
Ticket.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var ticket = {
      apiTicket: this.apiTicket,
      name : 'wechat'
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tickets 集合
    db.collection('tickets', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //将数据插入 tickets 集合
      collection.insert(ticket, {
        safe: true
      }, function (err, ticket) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, ticket[0]);//成功！err 为 null，并返回存储后的ticket文档
      });
    });
  });
};

Ticket.updateData = function (apiTicket,callback) {

    //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tickets 集合
    db.collection('tickets', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      var whereData = {"name":"wechat"}
      var updateDat = {$set: {"apiTicket":apiTicket}}; //如果不用$set，替换整条数据
      console.log(apiTicket);
      //将数据插入 tokens 集合
      collection.update(whereData, updateDat, function (err, ticket) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, ticket[0]);//成功！err 为 null，并返回存储后的ticket文档
      });
    });
  });
};
//读取tickets信息
Ticket.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 tickets 集合
    db.collection('tickets', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      collection.findOne({
        name: name
      }, function (err, ticket) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, ticket);//成功！返回查询的ticket信息
      });
    });
  });
};