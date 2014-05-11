/*========================================================================
 @作者：hugohua
 @说明：插件widget类
 @最后编辑：$Author:: hugohua           $
 $Date:: 2014-34-06 17:34#$
 ========================================================================*/

    var widget_uuid = 0,
        widget_slice = [].slice;

    /**
     * widget工厂方法，用于创建插件
     * @param name 包含命名空间的插件名称，格式 xx.xxx
     * @param base 需要继承的ui组件
     * @param prototype 插件的实际代码
     * @returns {Function} constructor
     */
    Pui.widget = function(name,base,prototype){
        var fullName,
            namespace = name.split( "." )[ 0 ],
            basePrototype,
            proxiedPrototype = {},
            constructor;

        name = name.split( "." )[ 1 ];
        fullName = namespace + "-" + name;
        //如果只有2个参数  base默认为Widget类，组件默认会继承base类的所有方法
        if ( !prototype ) {
            prototype = base;
            base = Pui.Base;
        }

        //创建一个自定义的伪类选择器
        //如 $(':pp-menu') 则表示选择定义了pp-menu插件的元素
        $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
            return !!$.data( elem, fullName );
        };

        //将插件的调用方法暴露给Gui上，可统一用Gui.namespace.plugin来管理查看插件
        Pui[ namespace ] = Pui[ namespace ] || {};
        //实际创建的对象为 Pui.pp.plugin
        constructor = Pui[ namespace ][ name ] = function( element,options ) {
//            debugger;
            if ( !this._createWidget ) {
                return new constructor( element,options );
            }
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                this._createWidget( element , options );
            }
        };

        //赋值版本号
        constructor.version = prototype.version;

        //实例化父类 获取父类的  prototype
        basePrototype = new base();
        //继承
        //在传入的ui原型中有方法调用this._super 和this.__superApply会调用到base上（最基类上）的方法
        //主要是给prototype增加 调用父类的方法
        $.each( prototype, function( prop, value ) {
            //如果val不是function 则直接给对象赋值字符串
            if ( !$.isFunction( value ) ) {
                proxiedPrototype[ prop ] = value;
                return;
            }
            //如果val是function
            proxiedPrototype[ prop ] = (function() {
                //两种调用父类函数的方法
                var _super = function() {
                        //将当前实例调用父类的方法
                        return base.prototype[ prop ].apply( this, arguments );
                    },
                    _superApply = function( args ) {
                        return base.prototype[ prop ].apply( this, args );
                    };
//                debugger;
                return function() {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;
//                console.log(prop, value,this,this._super,'===')
//                debugger;
                    //在这里调用父类的函数
                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply( this, arguments );

                    this._super = __super;
                    this._superApply = __superApply;
//                console.log(this,value,returnValue,prop,'===')
                    return returnValue;
                };
            })();
        });

        // 给om.tabs继承父类的所有原型方法和参数
        constructor.prototype = $.extend( true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName,
            constructor:constructor,        //将constructor指向constructor变量，完善作用域链
            // 组件的事件名前缀，调用_trigger的时候会默认给trigger的事件加上前缀
            // 例如_trigger('create')实际会触发'tabscreate'事件
            widgetEventPrefix: constructor.prototype.widgetEventPrefix || name
        }, proxiedPrototype );

        //将此方法挂在jQuery对象上
        Pui.bridge( name, constructor );

        return constructor;
    };


