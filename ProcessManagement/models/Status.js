//note entity 
var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({

    identity: 'status',
    connection: 'mysql',

    attributes: {
        id: {
            type: 'string',
            primaryKey:true,
            autoIncrement: true
        },
        studentid: {
            type: 'string'
        },        
        pid: {
            type: 'string'
        },
        process_status:{
            type: 'integer'
        }
    }
});