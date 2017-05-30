//note entity 
var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({

    identity: 'process',
    connection: 'mysql',

    attributes: {
        id: {
            type: 'string',
            primaryKey:true,
            autoIncrement: true
        },
        title: {
            type: 'string'
        },        
        content: {
            type: 'string'
        },
        user_name: {
            type: 'string'
        },
        sequence: {
            type: 'integer'
        },
        process_name: {
            type: 'string'
        },
        process_status:{
            type: 'integer'
        },
        code_url : {
            type: 'string'
        }
    }
});