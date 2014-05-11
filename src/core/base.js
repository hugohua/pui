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