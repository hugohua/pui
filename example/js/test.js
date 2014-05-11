define(function(require, exports, module){

    var pui = require('dist/pui');

    pui.widget('pp.test',{

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
//    module.exports = utils;
    exports.load = function(){
        console.info(pui)
        console.info('test load')
        $('#J_test').test();
    }
});