/*========================================================================
 @作者：hugohua
 @说明：插件widget类
 @最后编辑：$Author:: hugohua           $
 $Date:: 2014-34-06 17:34#$
 ========================================================================*/

(function(Pui,$){
    var widget_uuid = 0,
        widget_slice = [].slice;

    /**
     * Pui的插件方法，所有插件通过widget进行创建
     * @param name
     * @param base
     * @param prototype
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
        //如 $(':ui-menu') 则表示选择定义了ui-menu插件的元素
        $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
            return !!$.data( elem, fullName );
        };

        //将插件的调用方法暴露给Gui上，可统一用Gui.namespace.plugin来管理查看插件
        Pui[ namespace ] = Pui[ namespace ] || {};
        //实际创建的对象为 $.pp.plugin
        constructor = Pui[ namespace ][ name ] = function( element,options ) {
//            debugger;
            if ( !this._createWidget ) {
//                console.info(this)
                return new constructor( element,options );
            }
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                this._createWidget( element , options );
            }
        };

        //实例化父类 获取父类的  prototype
        basePrototype = new base();
//        basePrototype.options = $.extend(true, {}, basePrototype.options );
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
//            constructor:constructor,
            // 组件的事件名前缀，调用_trigger的时候会默认给trigger的事件加上前缀
            // 例如_trigger('create')实际会触发'tabscreate'事件
            widgetEventPrefix: constructor.prototype.widgetEventPrefix || name
        }, proxiedPrototype );
        Pui.bridge( name, constructor );//将此方法挂在jQuery对象上

        return constructor;
    };

    /**
     * Pui插件的基类，所有基于widget创建的插件都将基础base
     */
    Pui.Base = function(){};
    Pui.Base.prototype = {
        /**
         * 创建插件的方法
         * @param element
         * @param options 插件的配置参数
         * @private
         */
        _createWidget:function(element , options){
            //插件最外层对象
            this.$el = $(element);
            //插件实例化个数
            this.uuid = widget_uuid++;
            //事件的命名空间
            this.eventNamespace = "." + this.widgetName + this.uuid;
            //插件的配置参数 支持data-xx的方式进行参数设置
            this.options = $.extend(true,{}, this.options, this.$el.data(), options);
            //转为dom对象 用于存储实例
            element = this.$el[0];
            //缓存实例，单例
            $.data( element, this.widgetName, this );
            // 开发者实现
            this._create();
            // 如果绑定了初始化的回调函数，会在这里触发。
            // 注意绑定的事件名是需要加上前缀的，如$('#tab1').bind('tabscreate',function(){});
            this._trigger( "create" );
            // 开发者实现
            this._init();
        },

        _create     : $.noop,
        _init       : $.noop,

        // $.widget中优化过的trigger方法。可以同时调用config中的方法和bind的方法。
        // 即可以用两个方式去给组件绑定事件。
        // Thanks to jquery ui widget _trigget
        // 如$("tabs").omTabs({"change":function(){//handler}});
        // 或者$("tabs").bind("tabschange",function(){//handler});
        _trigger: function( type, event, data ){
            var prop, orig,
                callback = this.options[ type ];

            data = data || {};
            event = $.Event( event );
            event.type = ( type === this.widgetEventPrefix ?
                type :
                this.widgetEventPrefix + type ).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.$el[ 0 ];
            // copy original event properties over to the new event
            orig = event.originalEvent;
            if ( orig ) {
                for ( prop in orig ) {
                    if ( !( prop in event ) ) {
                        event[ prop ] = orig[ prop ];
                    }
                }
            }
            // 触发element中绑定的事件
            this.$el.trigger( event, data );
//            debugger
            return !( $.isFunction( callback ) &&
                callback.apply( this.$el[0], [ event ].concat( data ) ) === false ||
                event.isDefaultPrevented() );
        }
    };


    /**
     * 通过bridge方法将插件暴露给jq对象
     */
    Pui.bridge = function(name, object){
        var fullName = object.prototype.widgetName || name;
        //定义一个插件
        $.fn[name] = function(options){
            var returnValue = this;
            this.each(function () {
                var instance = $.data( this, fullName );
                //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
                //已经调用过
                if(instance){
                    instance.option( options || {} );
                    instance._init  && instance._init()

                }else{
                    //第一次调用
                    //将实例化后的插件缓存在dom结构里（内存里）
                    $.data( this, fullName, new object( this,options ) );
                }

                if ($.type(options) === 'string') instance[options]();
            });

            return returnValue;
        }

    };

})(Pui,jQuery);
