var mysql = require('mysql');
var xlsx = require('xlsx');

module.exports = {
    parseBedExcel: function(filePath) {
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
                    break;
                case 'sex':
                    if (value == '男') {
                        value = 1;
                    } else if (value == '女') {
                        value = 0;
                    }                        
                    break;
                case 'status':
                    if (value == '空床') {
                        value = 0;
                    } else if (value == '已分配') {
                        value = 1;
                    } else if (value == '已入住') {
                        value = 2;
                    }
                    break;
                        
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);
    },
    parseDormExcel: function(filePath) {
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

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'roomNo':
                    value = (value + '').trim();
                    break;                       
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);
    },
    parseStudentExcel: function(filePath) {
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

                if (value.indexOf('学号') != -1) {
                    headers[col] = 'studentNo';
                }      

                if (value.indexOf('姓名') != -1) {
                    headers[col] = 'studentName';
                }      

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'studentNo':
                    value = (value + '').trim();
                    break;   
                case 'studentName':
                    value = (value + '').trim();
                    break;                                      
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);       
    }
}