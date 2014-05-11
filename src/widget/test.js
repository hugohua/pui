/*========================================================================
      @作者：hugohua
      @说明：插件test
      @最后编辑：$Author:: hugohua           $
                 $Date:: 2014-34-06 17:34#$
========================================================================*/

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