var mysql = require('mysql');

module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            console.log('未登录！');
            return res.redirect('views/index.html');
        }
        next();
    },
    // sqlQuery: function(sql, sqlParams, func) {
    //     sqlPool.getConnection(function(err, connection) {
    //         if (err) {
    //             console.log(err);
    //             throw err;
    //         }

    //         connection.query(sql, sqlParams, func);
    //     })
    // }
}