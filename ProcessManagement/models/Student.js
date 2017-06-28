//user entity
var Waterline = require('waterline');
module.exports = Waterline.Collection.extend({

    identity: 'student',
    connection: 'mysql',

    attributes: {
        id: {
            type: 'integer'
        },
        sid: {
            type: 'string',
            primaryKey:true,
        },
        sname: {
            type: 'string'
        },
        sex: {
            type: 'string'
        },
        enroll_type: {
            type: 'string'
        },
        student_type: {
            type: 'string'
        },
        degree_type: {
            type: 'string'
        },
        subject: {
            type: 'string'
        },
        subject_name: {
            type: 'string'
        },
        direction_name: {
            type: 'string'
        },
        attend_type: {
            type: 'string'
        },
        is_abroad: {
            type: 'string'
        },
        abroad_student: {
            type: 'string'
        },
        campus: {
            type: 'string'
        },
        school_year: {
            type: 'string'
        },
        grade: {
            type: 'string'
        }
    }
});