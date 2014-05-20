/*========================================================================
 @作者：hugohua
 @说明：全站公共调用的模块
 @最后编辑：$Author:: hugohua           $
 $Date:: 2014-31-07 16:31#$
 ========================================================================*/

(function($,P){
    var detector = P.detector(),
        ltie8 = detector.browser === 'ie' && detector.version && detector.version < 9;  //小于等于ie8
    /**
     * 添加头标签
     */
    var browserCheck = function(){
        var css3 = P.supports("Transition") ? "transitions": "notransitions",
            css3 = P.supports("animation") ? css3 + " animations": css3 + " noanimations",
            version = detector.version ? 'ie'+ detector.version : '';
        $("html").addClass( css3 + " " + detector.os + " " + detector.engine + " " + detector.browser + " " + version);
    };

    /**
     * 宽窄版
     */
    var mediaCheck = function(){
        var $body = $('body'),
            old  = 1;       //1是宽版 2是窄版
        //ie 8 以下
        //
        var _media = function() {
            var isMini = (document.documentElement.clientWidth || document.body.clientWidth) < 1190;
            if( isMini && (old === 1) ){
                old = 2;
                ltie8 && $body.addClass("p_mini");
                $body.trigger('resizebody',['mini']);
            }else if (!isMini && (old === 2)){
                old = 1;
                ltie8 && $body.removeClass("p_mini");
                $body.trigger('resizebody',['normal']);
            }
        };
        ltie8 && _media();
        P.$win.on("resize.global", P.throttle(function(){_media()},500))
    };

    /**
     * IE6 给背景图标添加缓存 避免图片重复加载
     */
    var bgCacheForIe6 = function(){
        if (detector.version < 7) {
            try {
                document.execCommand("BackgroundImageCache", false, true);
            } catch(e) {}
        }
    }

    var init = function(){
        browserCheck();
        //如果没有宽窄版则不执行宽窄版代码
        !window.noMini && mediaCheck();
        bgCacheForIe6();
    };

    init();

})(jQuery,Pui);



