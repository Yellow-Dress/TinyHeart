//user entity
var Waterline = require('waterline');
module.exports = Waterline.Collection.extend({

    identity: 'user',
    connection: 'mysql',

    attributes: {
        user_id: {
            type: 'integer',
            primaryKey:true,
        },

        user_name: {
            type: 'string'
        },

        user_password: {
            type: 'string'
        }
    }
});