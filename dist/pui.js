/*
 * pui 0.0.1
 * A simple ui framework based on Jquery
 *
 * http://www.paipai.com
 *
 * Copyright 2014, hugohua
 *
 * Licensed under MIT
 *
 * Released on: May 28, 2014
*/

(function(window){
    window.rAF = window.requestAnimationFrame	||
    window.webkitRequestAnimationFrame	||
    window.mozRequestAnimationFrame		||
    window.oRequestAnimationFrame		||
    window.msRequestAnimationFrame		||
    function (callback) { window.setTimeout(callback, 1000 / 60); }
})(window);

(function(window,$){
    //防止重复加载
    if (window.Pui) {
        return
    }

var Pui = window.Pui ={
    version: '0.1.0'
};

Pui.mix = function(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
};




Pui.mix(Pui,{

    $win:$(window),

    $doc:$(document),

    /**
     * 页面模块
     * @param name
     * @param func 公共方法
     */
    add:function(name,func){
        var exports = {},
            returnVal,
            me = this;
        if(typeof name !== 'string'){
            $.error(name + '必须是个字符串！');
            return;
        }


        //如果之前就有这个对象 就直接合并
        //name
        me[name] = me[name] || {};
        //将func里面的export参数抽取出来，用于合并到Pui命名空间上
        //同时判断是否存在return值
        returnVal = func(exports,me);
        //判断返回值是否是对象
        if(returnVal && $.isPlainObject(returnVal)){
            $.extend(exports,returnVal);
        }
        for(var i in exports){
            me[name][i] = exports[i];
            //如果有init的话 就立即执行
            if(i === 'init'){
                exports[i]();
            }else if(i === 'lazyInit'){
                //1s后执行
                (function(i){
                    setTimeout(function(){
                        me[name][i]();
                    },1000)
                })(i);
            }else if(i === 'winLoad'){
                //win load 后执行
                (function(i){
                    me.$win.load(function(){
                        me[name][i]();
                    })
                })(i);

            }
        }
        //断开引用 回收内存
        exports = null;
    },

    /**
     * 检测浏览器是否支持css属性
     * @param prop: CSS3的属性
     * @returns {boolean}
     */
    supports:function(prop){
        var div = document.createElement('div'),
            vendors = 'Khtml Ms O Moz Webkit'.split(' '),
            len;
        if (prop in div.style) return true;

        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });
        len = vendors.length - 1;
        while (len >= 0) {
            if (vendors[len] + prop in div.style) {
                return true;
            }
            len--;
        }
        return false;
    },
    /**
     * 当该函数被调用，wait毫秒后才执行，wait毫秒期间如果再次触发则重新计时。
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    debounce:function(func, wait, immediate){
        var timeout, result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;//最后一次调用时清除延时
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            //每次func被调用，都是先清除延时再重新设置延时，这样只有最后一次触发func再经过wait延时后才会调用func
            clearTimeout(timeout);//
            timeout = setTimeout(later, wait);
            //如果第一次func被调用 && immediate ->立即执行func
            if (callNow) result = func.apply(context, args);
            return result;
        };
    },
    /**
     * 无视一定时间内所有的调用
     * 函数调用的频度控制器
     * @param func
     * @param wait
     * @returns {Function}
     */
    throttle:function(func,wait){
        var context, args, timeout, throttling, more, result;
        //延时wait后将more  throttling 设置为false
        var whenDone = this.debounce(function(){
            more = throttling = false;
        }, wait);
        return function() {
            context = this; args = arguments;
            var later = function() {
                timeout = null;
                if (more) { //more：最后一次func调用时，确保还能再调用一次
                    result = func.apply(context, args);
                }
                whenDone();
            };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) {
                more = true;
            } else {
                //每次触发func 有会保证throttling 设置为true
                throttling = true;
                result = func.apply(context, args);
            }
            //每次触发func 在 wait延时后将 more  throttling 设置为false
            whenDone();
            return result;
        };
    },


    /**
     * 懒加载容器内的Image iframe等
     * @param $warp 容器
     */
    loadAsset:function($warp){
        var $asset = $warp.find('[data-src]');
        if(!$asset.length) return;
        $asset.each(function(){
            var $this = $(this),
                src = $this.attr('data-src');
            $this.attr('src',src).removeAttr('data-src');
        })
    }

});

(function(P){
// Cookie
// -------------
// Thanks to:
//  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
//  - http://developer.yahoo.com/yui/3/cookie/


    var Cookie = {};

    var decode = decodeURIComponent;
    var encode = encodeURIComponent;


    /**
     * Returns the cookie value for the given name.
     *
     * @param {String} name The name of the cookie to retrieve.
     *
     * @param {Function|Object} options (Optional) An object containing one or
     *     more cookie options: raw (true/false) and converter (a function).
     *     The converter function is run on the value before returning it. The
     *     function is not used if the cookie doesn't exist. The function can be
     *     passed instead of the options object for conveniently. When raw is
     *     set to true, the cookie value is not URI decoded.
     *
     * @return {*} If no converter is specified, returns a string or undefined
     *     if the cookie doesn't exist. If the converter is specified, returns
     *     the value returned from the converter.
     */
    Cookie.get = function(name, options) {
        validateCookieName(name);

        if (typeof options === 'function') {
            options = { converter: options };
        }
        else {
            options = options || {};
        }

        var cookies = parseCookieString(document.cookie, !options['raw']);
        return (options.converter || same)(cookies[name]);
    };


    /**
     * Sets a cookie with a given name and value.
     *
     * @param {string} name The name of the cookie to set.
     *
     * @param {*} value The value to set for the cookie.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     expires (number or a Date object), secure (true/false),
     *     and raw (true/false). Setting raw to true indicates that the cookie
     *     should not be URI encoded before being set.
     *
     * @return {string} The created cookie string.
     */
    Cookie.set = function(name, value, options) {
        validateCookieName(name);

        options = options || {};
        var expires = options['expires'];
        var domain = options['domain'];
        var path = options['path'];

        if (!options['raw']) {
            value = encode(String(value));
        }

        var text = name + '=' + value;

        // expires
        var date = expires;
        if (typeof date === 'number') {
            date = new Date();
            date.setDate(date.getDate() + expires);
        }
        if (date instanceof Date) {
            text += '; expires=' + date.toUTCString();
        }

        // domain
        if (isNonEmptyString(domain)) {
            text += '; domain=' + domain;
        }

        // path
        if (isNonEmptyString(path)) {
            text += '; path=' + path;
        }

        // secure
        if (options['secure']) {
            text += '; secure';
        }

        document.cookie = text;
        return text;
    };


    /**
     * Removes a cookie from the machine by setting its expiration date to
     * sometime in the past.
     *
     * @param {string} name The name of the cookie to remove.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     and secure (true/false). The expires option will be overwritten
     *     by the method.
     *
     * @return {string} The created cookie string.
     */
    Cookie.remove = function(name, options) {
        options = options || {};
        options['expires'] = new Date(0);
        return this.set(name, '', options);
    };


    function parseCookieString(text, shouldDecode) {
        var cookies = {};

        if (isString(text) && text.length > 0) {

            var decodeValue = shouldDecode ? decode : same;
            var cookieParts = text.split(/;\s/g);
            var cookieName;
            var cookieValue;
            var cookieNameValue;

            for (var i = 0, len = cookieParts.length; i < len; i++) {

                // Check for normally-formatted cookie (name-value)
                cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                if (cookieNameValue instanceof Array) {
                    try {
                        cookieName = decode(cookieNameValue[1]);
                        cookieValue = decodeValue(cookieParts[i]
                            .substring(cookieNameValue[1].length + 1));
                    } catch (ex) {
                        // Intentionally ignore the cookie -
                        // the encoding is wrong
                    }
                } else {
                    // Means the cookie does not have an "=", so treat it as
                    // a boolean flag
                    cookieName = decode(cookieParts[i]);
                    cookieValue = '';
                }

                if (cookieName) {
                    cookies[cookieName] = cookieValue;
                }
            }

        }

        return cookies;
    }

    P.cookie = Cookie;


// Helpers

    function isString(o) {
        return typeof o === 'string';
    }

    function isNonEmptyString(s) {
        return isString(s) && s !== '';
    }

    function validateCookieName(name) {
        if (!isNonEmptyString(name)) {
            throw new TypeError('Cookie name must be a non-empty string');
        }
    }

    function same(s) {
        return s;
    }
})(Pui);


/***
 * Module based on jquery plugin from http://www.stoimen.com/blog/2010/02/26/jquery-localstorage-plugin-alpha
 * localStorage类，支持object，number类型
 */
(function(P){
    var ls = null,
        hasJSON = (typeof JSON !== 'undefined');

    if (typeof localStorage !== 'undefined') {
        ls = localStorage;
    }

    P.localStore = {
        set: function (key, value) {
            if (!ls || !P.localStore.canStore(value)) return false;
            ls.setItem(key, JSON.stringify(value));
            return true;
        },

        get: function (key) {
            if (!ls) return false;
            return JSON.parse(ls.getItem(key));
        },

        remove: function (key) {
            if (!ls) return false;
            ls.removeItem(key);
            return true;
        },

        canStore: function (value) {
            switch (typeof value) {
                case 'string':
                case 'number':
                    return true;
            }
            if (!hasJSON) {
                console && console.warn('localStore cannot serialise object data.');
            }
            return hasJSON;
        },

        clear: function () {
            ls.clear();
        }
    };

})(Pui);

/**
 * 客户端信息检测
 * @returns {{os, browser, engine, version}}
 */
(function(P){

    var detector = function(){
        var ua = navigator.userAgent.toLowerCase(),
            re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;

        function toString(object){
            return Object.prototype.toString.call(object);
        }

        function isString(object){
            return toString(object) === "[object String]";
        }


        var ENGINE = [
            ["trident", re_msie],
            ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
            ["gecko", /\bgecko\/(\d+)/],
            ["presto", /\bpresto\/([0-9.]+)/]
        ];

        var BROWSER = [
            ["ie", re_msie],
            ["firefox", /\bfirefox\/([0-9.ab]+)/],
            ["opera", /\bopr\/([0-9.]+)/],
            ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
            ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//]
        ];

        // 操作系统信息识别表达式
        var OS = [
            ["windows", /\bwindows nt ([0-9.]+)/],
            ["ipad", "ipad"],
            ["ipod", "ipod"],
            ["iphone", /\biphone\b|\biph(\d)/],
            ["mac", "macintosh"],
            ["linux", "linux"]
        ];

        var IE = [
            [6,'msie 6.0'],
            [7,'msie 7.0'],
            [8,'msie 8.0'],
            [9,'msie 9.0'],
            [10,'msie 10.0']
        ];

        var detect = function(client, ua){
            for(var i in client){
                var name = client[i][0],
                    expr = client[i][1],
                    isStr = isString(expr),
                    info;
                if(isStr){
                    if(ua.indexOf(expr) !== -1){
                        info = name;
                        return info
                    }
                }else{
                    if(expr.test(ua)){
                        info = name;
                        return info;
                    }
                }
            }
            return 'unknow';
        };

        return {
            os:detect(OS,ua),
            browser:detect(BROWSER,ua),
            engine:detect(ENGINE,ua),
            //只有IE才检测版本，否则意义不大
            version:re_msie.test(ua) ? detect(IE,ua) : ''
        };
    };

    var det = detector();

    P.detector = {
        os : det.os,
        engine : det.engine,
        browser : det.browser,
        version: det.version
    }

})(Pui);

/*!
 Underscore.js templates as a standalone implementation.
 Underscore templates documentation: http://documentcloud.github.com/underscore/#template
 Modifyed by hugohua
 */
(function (P) {

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /.^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        '\\': '\\',
        "'": "'",
        'r': '\r',
        'n': '\n',
        't': '\t',
        'u2028': '\u2028',
        'u2029': '\u2029'
    };

    for (var p in escapes) {
        escapes[escapes[p]] = p;
    }

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    var escapeChar = function(match) {
        return '\\' + escapes[match];
    };

    P.tmpl = function(text, data, settings) {
        settings = $.extend({}, settings, templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            var render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data);
        var template = function(data) {
            return render.call(this, data);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

}(Pui));
var widget_uuid = 0,
        widget_slice = [].slice;

    /**
     * widget工厂方法，用于创建插件
     * @method
     * @param {string} name 包含命名空间的插件名称，格式 xx.xxx
     * @param [base=Pui.Base] {object} base 需要继承的ui组件 （可选） 默认继承Pui.Base
     * @param {object} prototype 插件的实际代码
     * @return {Function} constructor
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

        //将插件的调用方法暴露给Pui上，可统一用Pui.namespace来管理查看插件
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
            //如果val是func
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
//                debugger;
                    //在这里调用父类的函数
                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply( this, arguments );

                    this._super = __super;
                    this._superApply = __superApply;
                    return returnValue;
                };
            })();
        });

        // 给当前插件继承父类的所有原型方法和参数
        constructor.prototype = $.extend( true, {},basePrototype, {
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

//添加CMD支持 for seajs
if(typeof define === "function"){
    define(function(require, exports, module){
        module.exports = Pui;
    });
}

//this is window
})(window,jQuery,undefined);