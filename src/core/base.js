/**
 * Pui插件的基类，所有基于widget创建的插件都将基础base
 * @class Base
 * @constructor
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
        $.data( element, this.widgetFullName, this );
        this.bindings = $();
        // 开发者实现
        this._create();
        // 如果绑定了初始化的回调函数，会在这里触发。
        // 注意绑定的事件名是需要加上前缀的，如$('#tab1').bind('tabscreate',function(){});
        this._trigger( "create" );
        // 开发者实现
        this._init();
    },

    /**
     * 在页面调用widget的时候，就会执行此方法
     * Widget的绝大大多数行为和结构都是在这里进行创建及初始化的。
     * @method _create
     */
    _create     : $.noop,
    /**
     * 每次调用插件时会执行此方法
     * 与_create不同的是_create只调用一次，_init则在每次调用时都执行
     * @method _init
     */
    _init       : $.noop,

    /**
     * 获取插件的dom warp
     * @method widget
     * @returns 当前插件的jquery dom对象
     */
    widget: function() {
        return this.$el;
    },

    /**
     * $.widget中优化过的trigger方法。可以同时调用config中的方法和bind的方法。
     * 即可以用两个方式去给组件绑定事件。
     * Thanks to jquery ui widget _trigget
     * 如$("tabs").omTabs({"change":function(){//handler}});
     * 或者$("tabs").bind("tabschange",function(){//handler});
     * @method _trigger
     * @param type 事件类型
     * @param event 事件对象
     * @param data 数据
     * @returns {boolean}
     * @private
     */
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
    },

    /**
     * 事件绑定
     * @method _on
     * @param [suppressDisabledCheck=false] {bollean} suppressDisabledCheck
     * @param [element=this.$el] {jQuery} element
     * @param {Object} handlers
     */
    _on: function( suppressDisabledCheck, element, handlers ) {
        var delegateElement,
            instance = this;

        // no suppressDisabledCheck flag, shuffle arguments
        if ( typeof suppressDisabledCheck !== "boolean" ) {
            handlers = element;
            element = suppressDisabledCheck;
            suppressDisabledCheck = false;
        }

        // no element argument, shuffle and use this.element
        if ( !handlers ) {
            handlers = element;
            element = this.element;
            delegateElement = this.widget();
        } else {
            // accept selectors, DOM elements
            element = delegateElement = $( element );
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {
                // allow widgets to customize the disabled handling
                // - disabled as an array instead of boolean
                // - disabled class as method for disabling individual parts
                if ( !suppressDisabledCheck &&
                    ( instance.options.disabled === true ||
                        $( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return;
                }
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            // copy the guid so direct unbinding works
            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }

            var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
                eventName = match[1] + instance.eventNamespace,
                selector = match[2];
            if ( selector ) {
                delegateElement.delegate( selector, eventName, handlerProxy );
            } else {
                element.bind( eventName, handlerProxy );
            }
        });
    },

    /**
     * 取消事件绑定
     * @method _off
     * @params element
     * @params eventName
     * @private
     */
    _off: function( element, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        element.unbind( eventName ).undelegate( eventName );
    },

    /**
     * 将模板转为html
     */
    tpl2html :function(){
        var tpl = this.template;
        console.info(tpl,'tpl')
    }

};