/**
 * 通过bridge方法将插件暴露给jq对象
 */
Pui.bridge = function(name, object){
    var fullName = object.prototype.widgetFullName || name;
    //定义一个插件
    $.fn[name] = function(options){
        var isMethodCall = $.type(options) === 'string',
            args = widget_slice.call( arguments, 1 ),
            returnValue = this;

        options = !isMethodCall && args.length ?
            $.extend.apply( null, [ true, options ].concat(args) ) :
            options;
        //这里对字符串和对象分别作处理
        if ( isMethodCall ) {
            this.each(function() {
                var methodValue,
                    instance = $.data( this, fullName );
                //如果传递的是instance则将this返回。
                if ( options === "instance" ) {
                    returnValue = instance;
                    return false;
                }

                //这里对私有方法的调用做了限制，直接调用会抛出异常事件
                if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
                    return $.error(options + "' 是 " + name + " 的私有方法，不可直接调用" );
                }
                //这里是如果传递的是字符串，则调用字符串方法，并传递对应的参数.
                //比如插件有个方法hide(a,b); 有2个参数：a，b
                //则调用时$('#id').menu('hide',1,2);//1和2 分别就是参数a和b了。
                methodValue = instance[ options ].apply( instance, args );
                //如果methodValue不是插件对象也不是undefined
                if ( methodValue !== instance && methodValue !== undefined ) {
                    //如果是methodValue是jq对象则自动设置jq链式调用 支持end()等方法回溯
                    //pushStack:http://www.learningjquery.com/2011/12/using-jquerys-pushstack-for-reusable-dom-traversing-methods/
                    //如：$('#id').plugin().end();
                    returnValue = methodValue && methodValue.jquery ?
                        returnValue.pushStack( methodValue.get() ) :
                        methodValue;
                    return false;
                }
            });
        } else {
            this.each(function() {
                var instance = $.data( this, fullName );

                if ( instance ) {
//                        instance.option( options || {} );
                    //这里每次都调用init方法
                    if ( instance._init ) {
                        instance._init();
                    }
                } else {
                    //缓存插件实例
                    $.data( this, fullName, new object( this,options ) );
                }
            });
        }
        return returnValue;
    }

};