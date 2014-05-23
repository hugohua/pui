/*========================================================================
      @作者：hugohua
      @说明：更安全的使用console
      @最后编辑：$Author:: hugohua           $
                 $Date:: 2014-07-23 11:07#$
========================================================================*/
//利用注释巧妙实现debug模式自动开启及关闭
//link:http://km.oa.com/articles/show/193790
(function(P){
    var regResult = (function(){/* DEBUG_MODE */}).toString().match(/\/\*\s([\s\S]*)\s\*\//),
        debugApi = ['assert','count','debug','dir','dirxml','error','exception','group','groupCollapsed','groupEnd','info','log','markTimeline','profile','profileEnd','time','timeEnd','trace','warn'];
    //将参数暴露给Pui，后续可用该属性做判断进行调试
    P.debugMode = (!!regResult && 'DEBUG_MODE' === regResult[1]) && typeof(console) !== 'undefined';
    //如果已经开启了调试模式 则赋值console
    for(var i in debugApi){
        var name = debugApi[i];
        P[name] = P.debugMode ? console[name] : $.noop;
    }

})(Pui);