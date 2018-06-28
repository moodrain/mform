mform
=======
沐雨表单
-------

> this lib uses es6 and require muyu-util
>  
> 该库使用es6语法，需要沐雨工具库的依赖

### demo
a form with comprehensive elements holding various types and attributes, which loads and post in ajax, verify inputs before submit, and enables to  customize your style and action by using callback

一个元素齐全、属性完备的表单，通过ajax加载和提交数据，提交之前验证输入，通过传入回调函数可自定义样式和动作

demo.html

    $mform({
        prefix: 'student',
        api: 'api.php',
        enctype: 'json',
        fields: [
            '编号:id:number>readonly',
            '姓名:name>required,autofocus',
            '手机:phone',
            '邮箱:email',
            '密码:password:password',
            '确认密码:rePassword:password:再输入一遍密码',
            '头像:avatar:file',
            '性别:sex:select>disabled|未选择:0,男:1,女:2',
            '上次登录:updatedAt:date',
            '简介:detail:textarea>autooff',
            '团员:tuanyuan:checkbox'
        ],
        btns: [
            '确认提交:submit-btn:submit',
            '重置:reset-btn:reset:pure-button',
        ],
        values: {
            id: 11,
            name: 'Muyu',
            detail: 'Hello World',
            tuanyuan: true,
            updatedAt: 1530108967000
        },
        format: {
            updatedAt: t => $date(t)
        },
        verify: {
            all: 'notnull',
            default: 'on',
        }
    }, 'container')

api.php

	header('Content-Type: application/json');
	if($_SERVER['REQUEST_METHOD'] == 'GET') {    
	    echo json_encode([
	        'data' => [
	            'sex' => 1
	        ]
	    ]);
	 } else if($_SERVER['REQUEST_METHOD'] == 'POST') {
	     echo json_encode([
	        'code' => 200,
	        'msg' => '',
	        'data' => null, 
	     ]);
	 }

![demo](https://cdn.moodrain.cn/github/mform-1.png)

### option list

    $mfotm({
        prefix: '',
        api: '',
        action: '',      // you can not set api and action at the same time
        load: false      // set load false will not load field value from ajax
        enctype: 'json', // the enctype can be form (default), data or json
        fields: [
            'label:id or name:type:placeholder>attribute1,attribute2',
            'label:id or name:select>attribute1|text1:val1,text2:val2',
        ],
        btns: [
            'text:id or name:type:class',
        ],
        values: {
            field1: val1,
            field2: val2,
        },
        format: {
            field: value => {}
        },
        verify: {
            all: 'notnull',
            default: true,          // will verify username, password, rePassword, phone, email fields
            phone: 'notnull,phone', // all the rules are notnull, phone, email, repassword
            field: value => {       // the rule can be a function
                return {
                    result: false,
                    message: 'verify field fail',
                }
            }
        },
        notifier: {
            success: message => {},
            error: message => {},
        },
    }, 'element', form => {})


### others
> the form style uses [pure.css](https://github.com/pure-css/pure) by default 