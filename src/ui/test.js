/*========================================================================
      @作者：hugohua
      @说明：插件test
      @最后编辑：$Author:: hugohua           $
                 $Date:: 2014-34-06 17:34#$
========================================================================*/

Pui.widget('pp.test',{
    _init:function(){
        console.log('create');
    },
    _create:function(){
        console.info('sub')
        this._super();
    }
});