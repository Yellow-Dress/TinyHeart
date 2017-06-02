//user entity
var Waterline = require('waterline');
module.exports = Waterline.Collection.extend({

    identity: 'student',
    connection: 'mysql',

    attributes: {
        studentid: {
            type: 'string',
            primaryKey:true,
        },
        name: {
            type: 'string'
        },
        gender: {
            type: 'string'
        },
        location: {
            type: 'string'
        },
        grade: {
            type: 'string'
        },
        gender: {
            type: 'string'
        },
        enrollcomplete: {
            type: 'string'
        },
        enrolldate: {
            type: 'string'
        },
        financecomplete: {
            type: 'string'
        },
        financedate: {
            type: 'string'
        },
        jwbcomplete: {
            type: 'string'
        },
        jwbdate: {
            type: 'string'
        },
        isdorm: {
            type: 'string'
        }
    }
});