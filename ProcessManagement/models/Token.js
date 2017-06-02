//user entity
var Waterline = require('waterline');
module.exports = Waterline.Collection.extend({

    identity: 'token',
    connection: 'mysql',

    attributes: {
    	id: {
            type: 'string',
            primaryKey:true,
            autoIncrement: true
        },
        access_token : {
            type: 'string'
        }
    }
});