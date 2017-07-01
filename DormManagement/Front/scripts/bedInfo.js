Zepto(function($){

    var bedInfosBackup = {};

    // var error = getQueryString('error');

    // if (error != null) {
    //     switch(error) {
    //         case '1001':
    //             alert('导出Excel失败，请重试'); 
    //             break;
    //     }
    // }

    // function getQueryString(name) {
    //     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");

    //     var r = decodeURI(window.location.search).substr(1).match(reg);

    //     if(r != null) return r[2]; return null;
    // }   

    var bedInfo_vm = new Vue({
        el: '#bedInfo',
        data: {
            bedInfos: {},
            loading: false,
            loadingContent: ''
        },
        methods: {

        }
    }); 

    $.ajax({
        type: 'POST',
        url: 'http://localhost:4000/checkLogin',
        success: function(data){
            if (data.isSuccess == true) {
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:4000/getErrorMsg',
                    data: { from: 'bed'},
                    dataType: 'json',
                    success: function(data){
                        if (data.hasContent == true) {
                            alert(data.errorMsg);
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });

                $.ajax({  
                    type: 'POST',
                    url: 'http://localhost:4000/getBedInfo',
                    data: {

                    },
                    dataType: 'json',
                    success: function(data){
                        if (data.isConnect == false) {
                            alert('数据库连接失败！');
                        } else {
                            if (data.isSuccess == false) {
                                alert('查询失败！');
                            } else {
                                bedInfo_vm._data.bedInfos = data.bedInfos.concat();
                                bedInfosBackup = data.bedInfos.concat();                               
                            }
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });
            } else {
                window.location.href = './index.html';
            }
        },
        error: function(xhr, type){
            console.log(xhr);
            alert('Ajax error!')
        }
    });



    // 返回功能选择
    $('.js-func').on('click', function() {
        window.location.href = './chooseFunc.html';
    });

    // 注销并退出
    $('.js-logout').on('click', function() {
        var logoutCheck = confirm("确认退出吗？");
        if (logoutCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/logout',
                dataType: 'json',
                success: function(data){
                    if (data.isSuccess == true) {
                        window.location.href = './index.html';
                    } else {
                        alert('注销失败，请重试！');
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });    
        }
    });

    // 冒泡捕获
    $('.js-tbody').on('click', function(e) {
        if (e.target.tagName == 'TD') {
            cancelChecked();
            $(e.target).parents('tr').find('.js-selectOne')[0].checked ? 
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = false :
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = 'checked';
            e.stopPropagation();
        }
        
    })

    // 上传要导入的excel文件
    $('.js-upload').on('click', function(e) {
        e.preventDefault();

        $('#uploadBedInfo').trigger('click');
    });

    $('#uploadBedInfo').on('change', function(e) {
        var path = $('#uploadBedInfo').val();

        var tempArr = path.split('\\');
        
        if (tempArr[tempArr.length - 1].indexOf('.xlsx') != -1) {
            $('#uploadBedInfoForm').submit();
        } else {
            alert('上传文件格式有误！');
        }
    })

    $('.js-checkin').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个床位！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个床位！");
            return;
        }
        
        var bedInfoBlock = $(checkboxs[0]).parents('tr');

        var checkinCheck = confirm('确认办理入住吗？');
        if (checkinCheck == true) {
            // 校验是否能办理入住
            var index = bedInfoBlock.data('index'),
                bedInfoObj = bedInfo_vm._data.bedInfos[index];
            
            if (bedInfoObj.status == 0) {
                alert('未分配学生不可办理入住！');
                return;
            }

            if (bedInfoObj.status == 2) {
                alert('该床位已有同学入住！');
                return;
            }

            if (bedInfoObj.studentName == undefined || bedInfoObj.studentNo == undefined) {
                alert('分配学生信息不完整！请先重新分配');
                return;
            }

            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkin',
                data: bedInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('办理入住失败！');
                            }              
                        } else {
                            var backupIndex = bedInfosBackup.indexOf(bedInfoObj);
                           
                            bedInfoObj.status = 2;
                            bedInfo_vm._data.bedInfos[index] = bedInfoObj;
                            bedInfosBackup[backupIndex] = bedInfoObj;
                            alert('已成功办理入住！');
                            cancelChecked();
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }
    })

    $('.js-checkout').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个床位！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个床位！");
            return;
        }
        
        var bedInfoBlock = $(checkboxs[0]).parents('tr');

        var checkoutCheck = confirm('确认办理退宿吗？');
        if (checkoutCheck == true) {
            // 校验是否能办理退宿
            var index = bedInfoBlock.data('index'),
                bedInfoObj = bedInfo_vm._data.bedInfos[index];
            
            // status为1或2才可以办理退宿
            if (bedInfoObj.status == 0) {
                alert('未分配学生不可办理退宿！');
                return;
            }

            if (bedInfoObj.studentName == undefined || bedInfoObj.studentNo == undefined) {
                alert('分配学生信息不完整！请先重新分配');
                return;
            }

            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkout',
                data: bedInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('办理退宿失败！');
                            }              
                        } else {
                            var backupIndex = bedInfosBackup.indexOf(bedInfoObj);
                           
                            bedInfoObj.status = 0;
                            bedInfoObj.studentNo = undefined;
                            bedInfoObj.studentName = undefined;
                            bedInfo_vm._data.bedInfos[index] = bedInfoObj;
                            bedInfosBackup[backupIndex] = bedInfoObj;
                            alert('已成功办理退宿！');
                            cancelChecked();  
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }        
    });

    $('.js-usable').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个床位！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个床位！");
            return;
        }
        
        var bedInfoBlock = $(checkboxs[0]).parents('tr');

        var index = bedInfoBlock.data('index'),
            bedInfoObj = bedInfo_vm._data.bedInfos[index],
            usableCheck;
        
        if (bedInfoObj.usable == 1) {
            usableCheck = confirm('确认置为不可用吗？');
        } else {
            usableCheck = confirm('确认置为可用吗？');
        }

        if (usableCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/usable',
                data: bedInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('设置失败！');
                            }              
                        } else {
                            var backupIndex = bedInfosBackup.indexOf(bedInfoObj);

                            bedInfoObj.usable = bedInfoObj.usable ^ 1;
                            bedInfo_vm._data.bedInfos[index] = bedInfoObj;
                            bedInfosBackup[backupIndex] = bedInfoObj;
                            console.log(bedInfo_vm._data.bedInfos);
                            console.log(bedInfosBackup);
                            
                            if (bedInfoObj.usable == 1) {
                                alert('已将床位设置为可用！');
                            } else {
                                alert('已将床位设置为不可用！');
                            }            
                            cancelChecked();
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }
    });
    
    $('.js-distribute').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个床位！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个床位！");
            return;
        }

        var bedInfoBlock = $(checkboxs[0]).parents('tr');

        var index = bedInfoBlock.data('index'),
            bedInfoObj = bedInfo_vm._data.bedInfos[index];

        if (bedInfoObj.status != 0) {
            alert('只有空床状态才可以分配学生！');
            return;
        }

        $('.modal').show();
    });

    $('.js-cancel').on('click', function() {
        clearModal();
        $('.modal').hide();
    });

    //清空模态框内容
    function clearModal() {
        $('.js-studentNo').val('');
        $('.js-studentName').val('');
    }

    $('.js-submit').on('click', function() {
        var studentNo = $('.js-studentNo').val().trim(),
            studentName = $('.js-studentName').val().trim();
        
        if (studentNo.length == 0 || studentName.length == 0) {
            alert('输入信息不完全！');
            return;
        }

        // var re = /^\d{10}$/;
        // if (!re.test(studentNo)) {
        //     alert('学号输入有误。')
        //     return;
        // }   
        
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        var bedInfoBlock = $(checkboxs[0]).parents('tr');

        var index = bedInfoBlock.data('index');
        var tempStr = JSON.stringify(bedInfo_vm._data.bedInfos[index]);
            bedInfoObj = JSON.parse(tempStr);
        console.log(bedInfoObj)
        bedInfoObj.studentName = studentName;
        bedInfoObj.studentNo = studentNo;
        
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/distribute',
            data: bedInfoObj,
            dataType: 'json',
            success: function(data){
                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        if (data['errorMsg'] != undefined) {
                            alert(data['errorMsg']);
                        } else {
                            alert('分配失败！');
                        }  
                        return;            
                    } else {

                        bedInfoObj.status = 1;

                        var tempArr = bedInfo_vm.bedInfos.concat();
                        tempArr[index] = bedInfoObj;
                        bedInfo_vm._data.bedInfos = tempArr;

                        var backupIndex = -1;

                        for (var i = 0; i < bedInfosBackup.length; i++) {
                            var obj = bedInfosBackup[i];
                            if (obj.buildingNo == bedInfoObj.buildingNo && obj.roomNo == bedInfoObj.roomNo && obj.bedNo == bedInfoObj.bedNo) {
                                backupIndex = i;
                                break;
                            }
                        }

                        bedInfosBackup[backupIndex] = bedInfoObj;

                        clearModal();
                        $('.modal').hide();
                        alert('分配学生成功！');
                        cancelChecked();
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });

    });

    $('.js-roomNo-search').on('click', function() {
        var roomNo = $('#roomNo-input').val().trim();

        if (roomNo.length == 0) {
            bedInfo_vm._data.bedInfos = bedInfosBackup.concat();
            alert('请输入要查询的宿舍号。');
            return;
        }

        var bedInfos = bedInfo_vm._data.bedInfos.filter(function(elem) {
            return elem.roomNo.indexOf(roomNo) != -1;
        });

        if (bedInfos.length != 0) {
            bedInfo_vm._data.bedInfos = bedInfos;
        } else {
            alert('查无此宿舍号。');
        }
    });

    $('#roomNo-input').on('keypress', function(e) {
        var e = e || window.event;
        if (e.keyCode == 13) {
             $('.js-roomNo-search').trigger('click');
        }
    });

    $('#roomNo-input').on('input', function(e) {
        var roomNoInput = $(this);

        if (roomNoInput.val().trim().length == 0) {
            bedInfo_vm._data.bedInfos = bedInfosBackup.concat();
        }
    });

    $('.js-studentNo-search').on('click', function() {
        var studentNo = $('#studentNo-input').val().trim();

        if (studentNo.length == 0) {
            bedInfo_vm._data.bedInfos = bedInfosBackup.concat();
            alert('请输入要查询的学生学号。');
            return;
        }

        // var re = /^\d{10}$/;

        // if (!re.test(studentNo)) {
        //     alert('学号输入有误。')
        //     return;
        // }   

        var bedInfos = bedInfo_vm._data.bedInfos.filter(function(elem) {
            if (elem.studentNo == undefined) {
                return false;
            } else {
                return elem.studentNo.indexOf(studentNo) != -1;
            }
        });

        if (bedInfos.length != 0) {
            bedInfo_vm._data.bedInfos = bedInfos;
        } else {
            alert('查无此学生。');
        }
    });

    $('#studentNo-input').on('keypress', function(e) {
        var e = e || window.event;
        if (e.keyCode == 13) {
            $('.js-studentNo-search').trigger('click');
        } 
    });

    $('#studentNo-input').on('input', function(e) {
        var studentNoInput = $(this);

        if (studentNoInput.val().trim().length == 0) {
            bedInfo_vm._data.bedInfos = bedInfosBackup.concat();
        }
    });

    function cancelChecked() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        });

        checkboxs.forEach(function(element) {
            element.checked = false;
        });  
    }
});
