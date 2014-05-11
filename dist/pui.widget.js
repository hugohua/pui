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
 * Released on: May 11, 2014
*/
Pui.widget('pp.test',{

    template:{
        'aa':'aa'
    },

    _init:function(){
        console.log('create');
    },
    _create:function(){
        console.info(this,'el')
        console.info('sub')
        this._on(this.$el,{
            'click':function(){
                console.info('my click')
            }
        })
        //测试模板
        this.tpl2html();
    }
});