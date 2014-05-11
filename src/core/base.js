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

        //缓存实例，单例 第一个参数：转为dom对象 用于存储实例
        $.data( this.$el[0], this.widgetFullName, this );
        //收集有事件绑定的dom
        //用于destroy
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
     * 销毁对象
     * @method _destroy
     */
    _destroy: $.noop,

    /**
     * 获取插件的dom warp
     * @method widget
     * @returns 当前插件的jquery dom对象
     */
    widget: function() {
        return this.$el;
    },

    /**
     * 设置选项函数
     * 支持直接通过插件$('#id').plugin('option',key,value)
     * @param {string|object} key
     * @param {*} value
     * @returns {*}
     */
    option: function( key, value ) {
        var options = key,
            parts,
            curOption,
            i;

        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            //返回一个新的对象，不是内部数据的引用
            return $.extend(true, {}, this.options );
        }

        if ( typeof key === "string" ) {
            // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
            options = {};
            parts = key.split( "." );
            key = parts.shift();
            if ( parts.length ) {
                curOption = options[ key ] = $.extend(true, {}, this.options[ key ] );
                for ( i = 0; i < parts.length - 1; i++ ) {
                    curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                    curOption = curOption[ parts[ i ] ];
                }
                key = parts.pop();
                if ( arguments.length === 1 ) {
                    return curOption[ key ] === undefined ? null : curOption[ key ];
                }
                curOption[ key ] = value;
            } else {
                if ( arguments.length === 1 ) {
                    return this.options[ key ] === undefined ? null : this.options[ key ];
                }
                options[ key ] = value;
            }
        }

        this._setOptions( options );

        return this;
    },

    _setOptions: function( options ) {
        var key;

        for ( key in options ) {
            this._setOption( key, options[ key ] );
        }

        return this;
    },

    _setOption: function( key, value ) {
        this.options[ key ] = value;
        return this;
    },

    enable: function() {
        return this._setOptions({ disabled: false });
    },
    disable: function() {
        return this._setOptions({ disabled: true });
    },

    //销毁模块：去除绑定事件、去除数据、去除样式、属性
    destroy: function() {
        this._destroy();
        // we can probably remove the unbind calls in 2.0
        // all event bindings should go through this._on()
        this.$el
            .unbind( this.eventNamespace )
            .removeData( this.widgetFullName )

        // clean up events and states
        this.bindings.unbind( this.eventNamespace );
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
            callback = this.options[ type ];        //支持options的调用方式

        data = data || {};
        //将event转为jq的event对象
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
     * @param [suppressDisabledCheck=false] {boolean} suppressDisabledCheck
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
            element = this.$el;
            delegateElement = this.widget();
        } else {
            // accept selectors, DOM elements
            element = delegateElement = $( element );
            //将事件绑定的对象添加进bindings
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {
                // allow widgets to customize the disabled handling
                // - disabled as an array instead of boolean
                // - disabled class as method for disabling individual parts
                //如果是disabled状态 则不触发事件
                if ( !suppressDisabledCheck && instance.options.disabled === true ) {
                    return;
                }
                //主要处理this指向问题
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            // copy the guid so direct unbinding works
            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }
            //处理带命名空间的事件名
            //如果是类似 'click li'则将li事件委派给$el
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
     * @param {jQuery} element
     * @param {String} eventName
     * @private
     */
    _off: function( element, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        element.unbind( eventName ).undelegate( eventName );
    },

    /**
     * 将模板转为html
     * @method tpl2html
     */
    tpl2html :function(){
        var tpl = this.template;
        console.info(tpl,'tpl')
    }

};