function $mform(mform, container, callback) {
    let inputWrapper = $vdf(mform.inputWrapper, defaultInputWrapper)
    let formWrapper = $vdf(mform.formWrapper, defaultFormWrapper)
    let btnWrapper = $vdf(mform.btnWrapper, defaultBtnWrapper)
    if (!mform.notifier)
        importMuyuCss()
    mform.notifier = $vdf(mform.notifier, {
        success: msg => { $notify(msg) },
        error: msg => { $notify(msg, 'muyu-notify-error') },
    })
    let inputs = []
    let btns = []
    mform.mform = mform
    if (mform.inputWrapper === undefined || mform.formWrapper === undefined)
        importPureCss()
    mform.fields = initFields(mform.fields)
    mform.btns = $vlt(mform.btns, b => initBtns(b))
    mform.verify = mform.verify ? initVerify(mform) : mform.verify
    mform.fields.forEach(field => { inputs.push(inputWrapper(createInput(field))) })
    mform.fields = inputs
    if (mform.btns) {
        mform.btns.forEach(btn => { btns.push(btnWrapper(createBtn(btn, mform))) })
        mform.btns = btns
    }
    mform.formData = () => {
        let keys = []
        mform.object.fields.forEach(field => { keys.push(field.object.name.replace('[]', '')) })
        return $fd(keys, $vdf(mform.object.prefix, undefined))
    }
    mform = mform.mform = formWrapper(createForm(mform))
    if (container)
        $add($e(container), mform.tag)
    if (mform.object.api && mform.object.load !== false) {
        if (!mform.object.values)
            mform.object.values = {}
        $get(mform.object.api, rs => {
            for ([key, val] of Object.entries(rs.data))
                mform.object.values[key] = val
            setValues(mform.object)
        })
    } else {
        if (mform.object.values)
            setValues(mform.object)
    }
    if (callback)
        callback(mform)
    return mform

    function reset(form) {
        form.fields.forEach(field => { $v(field.object.id, '') })
        setValues(form)
    }

    function setValues(form) {
        for ([key, val] of Object.entries(form.values)) {
            if (form.format)
                for ([fKey, formatter] of Object.entries(form.format))
                    if (fKey == key)
                        val = formatter(val)
            $v(form.prefix ? form.prefix + '-' + key : key, val)
        }
    }

    function initFields(rawFields) {
        let fields = []
        rawFields.forEach(rawField => {
            let fd = rawField.split(':')
            let key, id, name, tag, type, options, attributes, placeholder, checkboxVal
            key = fd[0]
            id = (mform.prefix ? mform.prefix + '-' + fd[1] : fd[1]).split('>')[0]
            name = fd[1].split('>')[0]
            tag = $vex(fd[2], 'input', rs => rs !== undefined, elem => elem.split('|')[0].split('>')[0])
            switch (tag) {
                case 'text':
                case 'number':
                case 'date':
                case 'datetime':
                case 'file':
                case 'checkbox':
                case 'password':
                    type = tag
                    tag = 'input'
            }
            type = $vdf(type, 'text')
            if (tag == 'select') {
                optionKVs = rawField.split('|')[1].split(',')
                options = {}
                optionKVs.forEach(optionKV => {
                    optionKV = optionKV.split(':')
                    options[optionKV[0]] = optionKV[1]
                })
            }
            if (type == 'checkbox') {
                name = name + '[]'
                checkboxVal = $vdf(rawField.split('|')[1], id)
            }
            attributes = $vlt(rawField.split('>')[1], e => e.split('|')[0], e => e.split(','))
            if (attributes)
                for (let i = 0; i < attributes.length; i++)
                    if (attributes[i] == 'readonly')
                        attributes[i] = 'readOnly'
            placeholder = $vdf(fd[3], undefined)
            fields.push({ key, id, name, tag, type, options, attributes, placeholder, checkboxVal })
        })
        return fields
    }

    function initBtns(rawBtns) {
        let btns = []
        rawBtns.forEach(rawBtn => {
            let bd = rawBtn.split(':')
            btns.push({
                key: bd[0],
                id: bd[1] ? (mform.prefix + '-' + bd[1]) : '',
                name: $vdf(bd[1], ''),
                type: $vdf(bd[2], 'button'),
                className: $vdf(bd[3], ''),
            })
        })
        return btns
    }

    function initVerify(form) {
        let rules = {}
        for ([key, val] of Object.entries(form.verify)) {
            val = typeof val == 'function' ? [val] : val.split(',')
            if (key == 'default') {
                form.fields.forEach(field => {
                    switch (field.name) {
                        case 'phone':
                            rules.phone = $vdf(rules.phone, [])
                            rules.phone.push('phone')
                            break
                        case 'email':
                            rules.email = $vdf(rules.email, [])
                            rules.email.push('email')
                            break
                        case 'username':
                            rules.username = $vdf(rules.username, [])
                            rules.username.push('notnull')
                            break
                        case 'password':
                            rules.password = $vdf(rules.password, [])
                            rules.password.push('notnull')
                            break
                        case 'rePassword':
                            rules.rePassword = $vdf(rules.rePassword, [])
                            rules.rePassword.push('repassword')
                            break
                    }
                })
            } else if (key == 'all') {
                form.fields.forEach(field => {
                    key = field.name
                    rules[key] = $vdf(rules[key], [])
                    rules[key] = rules[key].concat(val)
                })
            } else {
                rules[key] = $vdf(rules[key], [])
                rules[key] = rules[key].concat(val)
            }
        }
        return rules
    }

    function defaultFormWrapper(form) {
        let tag = form.tag
        let fieldset = $tag('fieldset')
        let control = $tag('div')
        tag.className = $vdf(mform.class, 'pure-form pure-form-aligned')
        form.object.fields.forEach(field => {
            $add(fieldset, field.tag)
        })
        control.className = 'pure-controls'
        if (form.object.btns)
            form.object.btns.forEach(btn => {
                $add(control, btn.tag)
            })
        $add(fieldset, control)
        $add(tag, fieldset)
        return form
    }

    function defaultInputWrapper(input) {
        input.div.className = 'pure-control-group'
        return input
    }

    function defaultBtnWrapper(btn) {
        if (!btn.object.className)
            btn.tag.className = btn.object.className = 'pure-button pure-button-primary'
        return btn
    }

    function createForm(form) {
        let tag = $tag('form')
        tag.action = form.action = $vdf(form.action, '')
        tag.method = form.method = $vdf(form.method, 'post')
        if (form.id)
            tag.id = form.id
        if (form.name)
            tag.name = form.name
        if (form.className)
            tag.className = form.className
        form.enctype = $vdf(form.enctype, 'form')
        switch (form.enctype) {
            case 'form':
                form.enctype = tag.enctype = 'application/x-www-form-urlencoded'
                break
            case 'json':
                form.enctype = tag.enctype = 'application/json'
                break
            case 'data':
                form.enctype = tag.enctype = 'multipart/form-data'
        }
        return { tag, object: form }
    }

    function createInput(input) {
        let tag = $tag(input.tag)
        let label = $tag('label', input.key)
        let div = $tag('div')
        tag.id = input.id
        tag.name = input.name
        label.for = input.id
        input.attributes = $vdf(input.attributes, [])
        switch (input.name) {
            case 'phone':
                input.attributes.push('phone')
            case 'email':
                input.attributes.push('email')
            case 'name':
                input.attributes.push('name')
            case 'rePassword':
            case 'password':
                input.attributes.push('password')
        }
        if (input.placeholder)
            tag.placeholder = input.placeholder
        if (input.type)
            tag.type = input.type
        if (input.options) {
            for ([key, val] of Object.entries(input.options)) {
                let optionTag = $tag('option')
                optionTag.innerHTML = key
                optionTag.value = val
                $add(tag, optionTag)
            }
        }
        if (input.checkboxVal)
            tag.value = input.checkboxVal
        if (input.attributes) {
            input.attributes.forEach(attribute => {
                switch (attribute) {
                    case 'autooff':
                        tag.autocomplete = 'off';
                        break
                    case 'phone':
                        tag.autocomplete = 'tel-national';
                        break
                    case 'email':
                        tag.autocomplete = 'email';
                        break
                    case 'name':
                        tag.autocomplete = 'name';
                        break
                    case 'password':
                        tag.autocomplete = 'new-password';
                        break
                    default:
                        tag[attribute] = true
                }
            })
        }
        if (input.placeholder) {
            tag.placeholder = input.placeholder
        }
        $add(div, label, tag)
        return {
            tag: div,
            input: tag,
            label: label,
            div: div,
            object: input,
        }
    }

    function createBtn(btn, form) {
        let tag = $tag('button')
        let verify = (rule, val) => {
            if (typeof rule == 'function')
                return rule(val).result
            switch (rule) {
                case 'phone':
                    return /^(((13[0-9]{1})|15[0-9]{1}|18[0-9]{1}|)+\d{8})$/.test(val)
                case 'email':
                    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
                case 'repassword':
                    return form.mform.tag.password.value === form.mform.tag.rePassword.value
                case 'notnull':
                    return val !== '' && val !== null
            }
        }
        let getMsg = (rule, key, val) => {
            form.mform.object.fields.forEach(field => {
                if (field.object.name == key)
                    key = field.object.key
            })
            if (typeof rule == 'function')
                return rule(val).message
            switch (rule) {
                case 'notnull':
                    return key + '不能为空'
                case 'phone':
                case 'email':
                    return key + '不符合格式'
                case 'repassword':
                    return '两次输入密码不相同'
                default:
                    return '验证失败，未知错误'
            }
        }
        tag.type = 'button'
        tag.innerHTML = btn.key
        tag.id = btn.id
        tag.name = btn.name
        tag.className = btn.className
        switch (btn.type) {
            case 'reset':
                $click(tag, () => { reset(form) });
                break
            case 'submit':
                $click(tag, () => {
                    let tag = form.mform.tag
                    let obj = form.mform.object
                    let success = obj.notifier.success
                    let error = obj.notifier.error
                    let rs = true
                    if (obj.verify) {
                        let rules = form.mform.object.verify
                        let fd = obj.formData()
                        for ([key, rule] of Object.entries(rules)) {
                            for ([field, val] of Object.entries(fd)) {
                                if (field == key) {
                                    for (let i = 0; i < rule.length; i++)
                                        if (!verify(rule[i], val)) {
                                            rs = false
                                            form.mform.object.notifier.error(getMsg(rule[i], key, val))
                                            break
                                        }
                                }
                            }
                        }
                    }
                    if (rs) {
                        if (obj.api)
                            $post(obj.api, obj.formData(), rs => { success($vdf(rs.msg, '提交成功')) }, rs => { error($vdf(rs.msg, '提交失败')) }, obj.enctype == 'application/json' ? 'json' : 'form')
                        else
                            tag.submit()
                    }
                })
        }
        return {
            tag,
            object: btn
        }
    }

    function importPureCss() {
        let links = document.querySelectorAll('link')
        for (let i = 0; i < links.length; i++)
            if (links[i].href.indexOf('pure.css') >= 0 || links[i].href.indexOf('pure.min.css') >= 0)
                return
        $l('未发现pure的link标签，将通过ajax加载 | the link tag of pure not found, loading from ajax')
        $get('https://s1.moodrain.cn/lib/pure/index.css', {}, rs => {
            let css = $tag("style", rs)
            css.type = "text/css"
            $add(document.body, css)
        }, () => {}, false)
    }

    function importMuyuCss() {
        let links = document.querySelectorAll('link')
        for (let i = 0; i < links.length; i++)
            if (links[i].href.indexOf('muyu.css'))
                return
        $l('未发现muyu的link标签，将通过ajax加载 | the link tag of muyu not found, loading from ajax')
        $get('https://s1.moodrain.cn/lib/muyu/index.css', {}, rs => {
            let css = $tag("style", rs)
            css.type = "text/css"
            $add(document.body, css)
        }, () => {}, false)
    }
}
