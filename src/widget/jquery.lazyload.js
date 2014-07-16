/*
 * name: lazyloader
 * author: aronhuang
 * usage: $(document).lazyloader({
            srcLazyAttr: 'data-lazy', //img iframe lazyload属性名，值为真实地址 默认为 data-lazy
            moduleLazyAttr: 'data-lazy-module', //module lazyload属性名，值为module ID, ID作为回调事件的参数 默认为 data-lazy-module
            autoDestroy: true, // lazyload内容都加载完成时，是否自动停止监听 默认true
            dynamic: true, //是否有动态的内容插入 默认 true
            threshold: 30, //预加载的距离 默认 100 
            moduleLoadCallback: moduleLoadCallback // 带 moduleLazyAttr值 和 module容器为参数
          });
*/

(function(P, $){

    P.widget('pp.lazyloader', {

        version:'0.1.0',

        //选项设置
        options: {
            srcLazyAttr: 'data-lazy', //img iframe lazyload属性名，值为真实地址
            moduleLazyAttr: 'data-lazy-module', //module lazyload属性名，值为module ID, ID作为回调事件的参数
            autoDestroy: true, //容器内的图片都加载完成时，是否自动停止监听
            dynamic: true, //是否有动态的内容插入
            threshold: 150, //预加载的距离
            moduleLoadCallback: null //模块加载回调 带 moduleLazyAttr值 和 module容器为参数
        },

        /*
         * 初始化
         * @private
        */
        _create: function () {
            var opts = this.options;
            this.container = this.$el;
            //若无动态插入的内容,缓存待加载的内容
            if (!opts.dynamic) {
                this._filterItems();
                //无加载内容
                if (this.srcLazyItems.length === 0 && this.moduleLazyItems.length === 0) {
                    return; 
                }
            }
            this._bindEvent();
            //初始化时执行load
            this.load();
            this.container.data('Lazyloader', this); //兼容原有
        },

        /*
         * 获取需lazyload的图片 和模块
         * @private
        */
        _filterItems: function () {
            var opts = this.options;
            this.srcLazyItems = this.container.find('[' + opts.srcLazyAttr + ']');
            this.moduleLazyItems = this.container.find('[' + opts.moduleLazyAttr + ']');
        },

        /*
         * 绑定事件
         * @private
        */
        _bindEvent: function () {
            var self = this;
            this._loadFn = function () {
                if (self.timer) {
                    window.clearTimeout(self.timer);
                }
                self.curTime = +new Date();
                if (!self.startTime) {
                    self.startTime = self.curTime;
                }
                if ((self.curTime - self.startTime) > 100) {
                    self.load();
                    self.startTime = undefined;
                    return;
                }
                self.timer = window.setTimeout(function () {
                    self.load();
                }, 30);
            };
            P.$win.on('resize.lazyloader' + ' scroll.lazyloader', this._loadFn);
        },

        /*
         * 加载lazy内容
         * @private
        */
        load: function () {
            //dynamic为true(存在动态内容)时，每次都取一次待加载内容
            var opts = this.options;
            if (opts.dynamic) {
                this._filterItems();
            }
            this._loadSrc();
            this._loadModule();
            //无动态插入时，更新待加载内容
            if (!opts.dynamic) {
                this._filterItems();
                //完全加载时，若autoDestroy为true，执行destroy
                if (this.srcLazyItems.length === 0 && this.moduleLazyItems.length === 0 && opts.autoDestroy) {
                    this.destroy();
                }
            }
        },


        /*
         * 加载资源
         * @private
        */
        _loadSrc: function () {
            var opts = this.options, self = this, attr = opts.srcLazyAttr, items = this.srcLazyItems;
            $.each(items, function () {
                var item = $(this), src, tagName = this.tagName.toLowerCase();
                if (self._isInViewport(item)) {
                    src = item.attr(attr);
                    if (tagName === 'img' || tagName === 'iframe') {
                        item.attr('src', src).removeAttr(attr);
                    } else {
                        item.css('background-image', 'url(' + src + ')').removeAttr(attr);
                    }   
                }
            });
        },

        /*
         * 加载模块
         * @private
        */
        _loadModule: function () {
            var opts = this.options, self = this, attr = opts.moduleLazyAttr, callback = opts.moduleLoadCallback, items = this.moduleLazyItems;
            $.each(items, function () {
                var item = $(this), id;
                if (self._isInViewport(item)) {
                    id = item.attr(attr);
                    item.removeAttr(attr);
                    if (typeof callback === 'function') {
                        callback(id, item);
                    }
                }
            });
        },

        /*
         * 是否在视窗中 暂只考虑垂直方向
         * @private
         * @param object 
        */
        _isInViewport: function (item) {
            var win = P.$win,
                scrollTop = win.scrollTop(),
                threshold = this.options.threshold,
                maxTop = scrollTop + win.height() + threshold,
                minTop = scrollTop - threshold,
                itemTop = item.offset().top,
                itemBottom = itemTop + item.outerHeight();
            if (itemTop > maxTop || itemBottom < minTop) {
                return false;
            }
            return true;
        },

        /*
         * 停止监听
         * @private
        */
        destroy: function () {
            P.$win.off('resize.lazyloader' + ' scroll.lazyloader', this._loadFn);
            this.container.removeData('Lazyloader').removeData('pp-lazyloader');
        }
    });
})(Pui, jQuery);

