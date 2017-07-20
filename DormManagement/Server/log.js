var fs = require('fs');

module.exports.read = function(filePath) {
    // 判断是否存在文件
    if (fs.existsSync(filePath) == false) {
        return null;
    } else {    
        // 全部读出来
        return fs.readFileSync(filePath, 'utf-8');
    }
}

module.exports.delete = function(filePath) {
    // 清空
    fs.writeFileSync(filePath, '', { flag: 'w'});
}

module.exports.write = function(filePath, msg) {
    // 追加写
    fs.writeFileSync(filePath, msg + '\n', { flag: 'a+'});
}

module.exports.hasContent = function(filePath) {
    if (fs.existsSync(filePath) == true) {
        if (fs.readFileSync(filePath, 'utf-8').length != 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}