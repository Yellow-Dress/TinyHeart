var Waterline = require('waterline');

var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');

// models
var User = require('../models/User');
var Process = require('../models/Process');
var Token = require('../models/Token');
var Status = require('../models/Status');
var Student = require('../models/Student');

var orm = new Waterline();
var wlconfig = {
    adapters: {
        default: mysqlAdapter,
        mysql: mysqlAdapter,
        mongo: mongoAdapter
    },
    connections: {
        'mysql': {
            adapter: 'mysql',
            host: 'your host',
            user: 'root',
            password: '******',
            chartset:'utf8',
            database:'db_node'
        },
        'mongo': {
            adapter: 'mongo',
            url: 'mongodb://your host/db_name'
        }
    }
};
orm.loadCollection(User);
orm.loadCollection(Process);
orm.loadCollection(Token);
orm.loadCollection(Status);
orm.loadCollection(Student);

exports.orm = orm;
exports.config = wlconfig;