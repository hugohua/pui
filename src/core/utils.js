/*========================================================================
      @作者：hugohua
      @说明：utils 提供了常用的静态方法集
      @最后编辑：$Author:: hugohua           $
                 $Date:: 2014-21-13 12:21#$
========================================================================*/

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
            returnVal;
        if(typeof name !== 'string'){
            $.error(name + '必须是个字符串！')
            return;
        }


        //如果之前就有这个对象 就直接合并
        //name
        this[name] = this[name] || {};
        //将func里面的export参数抽取出来，用于合并到Pui命名空间上
        //同时判断是否存在return值
        returnVal = func(exports,this);
        //判断返回值是否是对象
        if(returnVal && $.isPlainObject(returnVal)){
            $.extend(exports,returnVal);
        }
        for(var i in exports){
            this[name][i] = exports[i];
            //如果有init的话 就立即执行
            if(i === 'init'){
                exports[i]();
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
     * 客户端信息检测
     * @returns {{os, browser, engine, version}}
     */
    detector:function(){
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
    },

    /**
     * 懒加载容器内的Image
     * @param $warp 容器
     */
    loadImg:function($warp){
        var $images = $warp.find('img[data-src]');
        if(!$images.length) return;
        $images.each(function(){
            var $this = $(this),
                src = $this.attr('data-src');
            $this.attr('src',src).removeAttr('data-src');
        })
    }
});

/*!
 Underscore.js templates as a standalone implementation.
 Underscore templates documentation: http://documentcloud.github.com/underscore/#template
 Modifyed by hugohua
 */
(function () {

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

    Pui.tmpl = function(text, data, settings) {
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

}());