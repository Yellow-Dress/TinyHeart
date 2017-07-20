var xlsx = require('xlsx');
var async = require('async');

var workBook = xlsx.readFile(__dirname + '/upload/bedInfo.xlsx'),
    workSheet = workBook.Sheets[workBook.SheetNames[0]];

// console.log(xlsx.utils.sheet_to_json(workSheet))
// console.log(workSheet)
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

        // headers[col] = value;
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

console.log(data.slice(2))
// data.slice(2).forEach(function(bedInfo) {
//     console.log(bedInfo.id);
    
// })
//  console.log(data.slice(2));
//  async.each(data.slice(2), function(bedInfo, callback) {
//     console.log(bedInfo.id);
//     callback();
//  }, function(err) {

//  })

//  console.log('hello')
