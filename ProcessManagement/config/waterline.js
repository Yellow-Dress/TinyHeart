var Waterline = require('waterline');

var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');

// models
var User = require('../models/User');
var Process = require('../models/Process');

var orm = new Waterline();
var wlconfig = {
    adapters: {
        default: mongoAdapter,
        mysql: mysqlAdapter,
        mongo: mongoAdapter
    },
    connections: {
        'mysql': {
            adapter: 'mysql',
            host: '60.205.220.42',
            user: 'root',
            password: '123456',
            chartset:'utf8',
            database:'db_node'
        },
        'mongo': {
            adapter: 'mongo',
            url: 'mongodb://60.205.220.42/xblog'
        }
    }
};
orm.loadCollection(User);
orm.loadCollection(Process);

exports.orm = orm;
exports.config = wlconfig;