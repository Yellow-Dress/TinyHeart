var mysql = require('mysql');
var xlsx = require('xlsx');

module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            console.log('未登录！');
            return res.redirect('views/index.html');
        }
        next();
    },
    parseExcel: function parseExcel(filePath) {
        var workBook = xlsx.readFile(filePath),
            workSheet = workBook.Sheets[workBook.SheetNames[0]];

        var keys = Object.keys(workSheet);
        var headers = [];
        var data = [];

        keys.filter(function(k) {
            return k[0] !==  '!';
        }).forEach(function(k) {
            var col = k.substring(0, 1);
            var row = parseInt(k.substring(1));
            var value = workSheet[k].v;

            if (row === 1) {
                    // console.log(value)
                if (value.indexOf('序号') != -1) {
                    headers[col] = 'id';
                }

                if (value.indexOf('楼号') != -1) {
                    headers[col] = 'buildingNo';
                }      

                if (value.indexOf('宿舍号') != -1) {
                    headers[col] = 'roomNo';
                }      

                if (value.indexOf('床位') != -1) {
                    headers[col] = 'bedNo';
                }  

                if (value.indexOf('性别') != -1) {
                    headers[col] = 'sex';
                }  

                if (value.indexOf('状态') != -1) {
                    headers[col] = 'status';
                }

                if (value.indexOf('学生学号') != -1) {
                    headers[col] = 'studentNo';
                }

                if (value.indexOf('学生姓名') != -1) {
                    headers[col] = 'studentName';
                }

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'roomNo':
                    value = (value + '').trim();
                    break; 
                case 'studentNo':
                    value = (value + '').trim();
                    break;
                case 'studentName':
                    value = (value + '').trim();
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);
    }
}