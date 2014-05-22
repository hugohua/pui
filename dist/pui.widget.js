/*
 * pui 0.0.1
 * A simple ui framework based on Jquery
 *
 * http://www.paipai.com
 *
 * Copyright 2014, hugohua
 *
 * Licensed under MIT
 *
 * Released on: May 22, 2014
*/
Pui.widget('pp.test',{

    template:{
        'aa':'aa'
    },

    options:{
        'a':1,
        'b':2
    },

    _init:function(){
        console.log('create');
    },
    _create:function(){
        console.info(this,'el')
        console.info('sub')
        this._on({
            'click li':function(){
                console.info('my click')
            }
        })
        //测试模板
        this.tpl2html();
    }
});

//插件的格式是 命名空间.插件名称 （必须带有命名空间）
//命名空间建议使用项目名称 ，比如拍拍：pp
Pui.widget('pp.template',{
    /**
     *
     * 插件默认的配置参数
     * 同时也会暴露出去给外部重置和修改
     */
    options:{
        defaultVal1     :   1,
        defaultVal2     :   2
    },

    /**
     * 插件创建
     * @method _create
     * 插件创建并初始化时调用，同一个dom下的实例仅调用一次，类似于我们平时写插件时的init方法。
     * 注意：在方法名称前面加 "_" ，表示插件的私有方法，外部调用私有方法会抛出异常（PUI里面做了限制）
     * @private
     */
    _create:function(){
        //在这里做相关的初始化工作

        //$el是插件默认的外层容器、
        //比如 $('#id').template() 其中$('#id')就是this.$el
        this.$child = this.$el.find('.child')
    },

    /**
     * 移除插件
     * @private
     */
    _destroy: function() {
        //通过_supper(),_superApply()方法来调用父类的同名方法
        return this._super();
    },

    /**
     * 自定义方法
     * @private
     */
    _initEvent:function(){
        //绑定事件
        this._on();
        //
        this._off();
        //
        this._trigger();
    },

    /**
     * 提供给外部调用的方法
     */
    pubFunc:function(){

    }
});