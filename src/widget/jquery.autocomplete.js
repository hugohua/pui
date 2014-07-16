/**
 * autocomplete pluin
 * author: aronhuang
 * require: jquery jquery.iframe.js
 * version: 1.0
 */

(function(P, $){
    //键盘码
    var KEY = {backSpace: 8,esc: 27,up: 38,down: 40,tab: 9,enter: 13,home: 36,end: 35,pageUp: 33,pageDown: 34,space: 32};


    P.widget('pp.autocomplete', {
        version:'0.1.0',

        //选项设置
        options : {
            /*source: array or url*/ 
            text: 'text',
            value: 'value',
            /*dataFormatter: function(){},*/
            cache: true,
            delay: 100,
            minChars: 1,
            /*maxLength: 0,*/
            caseSensitive: true,
            keySelect: true, //上下箭头是否触发选择，否则仅加高亮态
            listTpl: '<li class="J_listItem">{text}</li>',
            className: {
                list: 'list',
                listItem: 'list_item',
                active: 'list_item_active'
            },
            //ajax的配置基本同jq
            /*ajaxOptions: {
            },
            onAjaxSuccess: function(){},
            onAjaxError: function(){},
            onSelect: function(){},*/
            zIndex: 999
        },

        _create: function(){
            var opts = this.options, delay;
            this.input = this.$el;

            //数据模式 local or remote
            this.dataMode = this._getDataMode();
            if (!this.dataMode) {
                return;
            }

            //数据缓存
            if (opts.cache) {
                this.cache = {};
            }

            //取消浏览器默认自动完成
            this.input.attr('autocomplete', 'off');

            //查询延时
            delay = parseInt(opts.queryDelay, 10);
            if (isNaN(delay) || delay < 0) {
                this.delay = 100;
            } else {
                this.delay = delay
            }

            this.disabled = !!opts.disabled;

            this._buildList();

            this._bindEvent();
        },

        
        /**
         * 根据source配置获取数据模式 远程 or 本地
         * @private
         */     
        _getDataMode: function(){
            var opts = this.options, source = opts.source, type = typeof source, mode;
            switch(type){
                case 'string': 
                    this.url = source;
                    mode = 'remote';
                    break ;
                case 'object':
                    this.data = source;
                    mode = 'local';
                    break ;
//                default :
//                    break ;
            }
            return mode;
        },

        /**
         * 设置缓存
         * @public
         */
        setCache: function(value){
            if (value && !this.cache) {
                this.cache = {};
            } else if (!value && this.cache) {
                this.cache = null
            }
        },

        /**
         * 绑定事件
         * @private
         */
        _bindEvent: function(){
            var self = this, opts = this.options;

            //搜索框事件
            this._bindInputKeyEvent();
            this.input.on('focus', function(e){
                if (self.disabled) {return;}
                self._focus();
            }).on('blur', function(e){
                self._blur();
            });

            //点击其他区域隐藏
            $(document).on('click', function(e){
                var target  = e.target || e.srcElement;
                if($(target).closest(self.input).length === 0 && $(target).closest(self.list).length === 0){
                    self.collapse();
                }
            });

            //下拉项hover高亮 & 点击事件
            this.list.on('mouseenter', '.' + opts.className.listItem, function(e){
                var idx = self.listItems.index(this);
                self._active(idx);
            }).on('mouseleave', '.' + opts.className.listItem, function(e){
                $(this).removeClass(opts.className.active);
            }).on('click', '.' + opts.className.listItem, function(e){
                var idx = self.listItems.index(this);
                self._select(idx);
                self.collapse();
            });
        },


        /**
         * 键盘处理事件
         * @private
         */
        _bindInputKeyEvent: function(){
            var self = this, opts = this.options;

            this.input.on('keydown', function(e){
                if (self.disabled) {return;}
                switch (e.keyCode) {
                    case KEY.down:
                    case KEY.up:
                        if (self.isExpanded) {
                            e.preventDefault();
                            var listItems = self.listItems, idx = self._getActiveItemIdx();
                            if (e.keyCode === KEY.down) {
                                idx = (idx === -1 || idx === (listItems.length - 1)) ? 0 : idx + 1;
                            } else {
                                idx = (idx === -1 || idx === 0) ? listItems.length - 1 : idx - 1;
                            }
                            self._active(idx);
                            if (opts.keySelect) {
                                self._select(idx);
                            }
                        }
                        break ;
                }
            })
            .on('keyup', function(e){
                if (self.disabled) {return;}
                var query = $.trim($(this).val());
                if (!query) {
                    self.collapse();
                    return;
                }
                var k = e.which;
                //是否功能键
                //112-123 F键  16-20 16shift 17ctrl 18alt 19pause 20capsLock 8backspace 9tab 13enter 27esc
                //33-40 33home 34pageup 35end 36pagedown 37up 38left 39down 40right44-46 44insert 45delete 46print 144 145 144numlock 145 scorllLock
                var isFuncKey = k == 9 || k == 13 || k == 27 || (k >= 16 && k <= 20) ||(k >= 33 && k <= 40) || (k >= 44 && k <= 46) || (k >= 112 && k <= 123) || k == 144 || k == 145;
                if (query.length >= opts.minChars && !isFuncKey) {
                    self.queryDelay(query);
                }
            })
        },

        /**
         * 生成下拉菜单
         * @private
         */
        _buildList: function(){
            //下拉菜单
            var opts = this.options, width = parseInt(opts.listWidth, 10);
            width = isNaN(width) ? this.input.outerWidth() : width, iframeOpts = opts.iframe;

            if (opts.listNode && $(opts.listNode).length == 1) {
                this.list = $(opts.listNode).show();
                this.list.hide();
            } else {
                this.list = $('<div class='+ opts.className.list +' />' ).appendTo('body').css({
                    position: 'absolute',
                    overflow: 'auto',
                    zIndex : opts.zIndex
                }).outerWidth(width).hide();
                this._setListPosition();
                //resize重新定位list
                $(window).on('resize', function(e){
                    if (self.isExpanded) {
                        self._setListPosition();
                    }
                });
            }
            this.iframe = this.list.parent().iframe({iframe: iframeOpts}).data('pp-iframe');
        },


        /**
         * 设置下拉菜单定位
         * @private
         */
        _setListPosition: function(){
            var offset = this.input.offset(),
                adjuct = this.options.positionAdjuct,
                adjuctX = adjuct ? parseInt(adjuct.x, 10) : 0,
                adjuctY = adjuct ? parseInt(adjuct.y, 10) : 0;
            adjuctX = isNaN(adjuctX) ? 0 : adjuctX;
            adjuctY = isNaN(adjuctY) ? 0 : adjuctY;
            this.list.css({
                top: this.input.outerHeight() + offset.top + adjuctY,
                left: offset.left + adjuctX
            });
        },

        /**
         * 选中下拉项
         * @private
         */
        _select: function(idx){
            var text;
            this._selectedIndex = idx;
            text = this._getText() || this.queryKey;
            this.input.val(text);
            this._trigger('select', this.filterData[idx]);
        },

        /**
         * 获取当前选中的文本
         * @private
         */
        _getText: function(){
            var idx = this._selectedIndex, textKey = this.options.text;
            if (idx !== -1) {
                return this.filterData[idx] && this.filterData[idx][textKey];
            }
        },


        /**
         * 获取当前选中的值
         * @private
         */
        _getValue: function(){
            var idx = this._selectedIndex, valueKey = this.options.value;
            if (idx !== -1) {
                return this.filterData[idx] && this.filterData[idx][valueKey];
            }
        },

        /**
         * 获取选择项
         * @private
         */
        _getListItems: function(){
            var opts = this.options;
            return this.list.find('.' + opts.className.listItem);
        },

        /**
         * 获取高亮选择项索引
         * @private
         */
        _getActiveItemIdx: function(){
            var opts = this.options,
                listItems = this.listItems, 
                activeItem = this.list.find('.' + opts.className.active);;
            return listItems.index(activeItem);
        },


        /**
         * 增加下拉内容项
         * @private
         */
        _addListItem: function(data){
            if (!data) { return;}
            var opts = this.options, listHtml, displayFormatter = opts.displayFormatter;
            if (typeof displayFormatter === 'function') {
                listHtml = displayFormatter(data, this.queryKey);
            } else {
                listHtml = this._renderListTpl(data);
            }
            if (!listHtml) {
                this.collapse();
            } else {
                this.list[0].innerHTML = listHtml;
                this.expand();
            }
            this.listItems = this._getListItems(); 
        },

        /**
         * 默认模版渲染
         * @private
         */
        _renderListTpl: function(data){
            var tpl = this.options.listTpl, listHtml = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var row = data[i], html;
                html = tpl.replace(/{([\w\-]+)\}/g, function(match, key){
                    return row[key] || '';
                });
                listHtml.push(html);
            }
            return listHtml.join('');
        },

        /**
         * 本地数据过滤
         * @private
         */
        _filterLocalData: function(query){
            var opts = this.options, filterData = [], filterFunc = opts.customerMatch;
            query = !query ? '' : query;
            //无查询条件返回全部数据
            if (query === '') {
                return this.data;
            }
            //执行查询
            if (typeof filterFunc !== 'function') {
                filterFunc = (function(){
                    var i = opts.caseSensitive ? '' : 'i';
                    var reg = new RegExp(query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), i);
                    return function(text, query){
                        return text.search(reg) !== -1;
                    };
                })();
            }
            for (var i = 0, len = this.data.length; i < len; i++) {
                if (filterData.length >= opts.maxLength) {
                    break ;
                }
                var row = this.data[i], key = opts.text, text = row[key];
                if (filterFunc(text, query)) {
                    filterData.push(row);
                }
            }
            this.filterData = filterData;
            this._addListItem(filterData);
        },

        /**
         * 高亮选项
         * 无item参数取消所有高亮
         * @private
         */
        _active: function(idx){
            var opts = this.options, activeCls = opts.className.active;
            this.listItems.removeClass(activeCls);
            if (idx || idx === 0) {
                this.listItems.eq(idx).addClass(activeCls);
            }
        },


        /**
         * 数据查询
         * @private
         */
        query: function(query){
            var mode = this.dataMode;
            this.queryKey = query;
            //读取缓存数据
            if(this.cache && this.cache[query]){
                this.filterData = this.cache[query];
                this._addListItem(this.filterData);
                return;
            }
            if(mode === 'local'){
                this._filterLocalData(query);
            } else if (mode === 'remote') {
                this._loadAjaxData(query);
            }
        },


        /**
         * 数据查询延迟
         * @private
         */
        queryDelay: function(query){
            var self = this;
            if(this.queryTimer){
                window.clearTimeout(self.queryTimer);
            }
            self.queryTimer = window.setTimeout(function(){
                self.query(query);
            }, this.delay);
        },


        /**
         * ajax获取数据
         * @private
         */
        _loadAjaxData: function(query){
            var opts = this.options, self = this, ajaxOpts = opts.ajaxOptions, dataFormatter = opts.dataFormatter;

            //抛弃未完成的查询
            if (this.xhr) {
                this.xhr.abort();
            }
            
            //服务器获取
            this.xhr = $.ajax($.extend({}, ajaxOpts, {
                url: self.url.replace(/{query}/g, query),
                complete: function(xhr, status){
                    if (typeof ajaxOpts.complete === 'function') {
                        ajaxOpts.complete(xhr, status);
                    }
                    self.xhr = null;
                },
                success: function(data, status){
                    if (typeof ajaxOpts.success === 'function') {
                        ajaxOpts.success(data, status);
                    }
                    self.filterData = typeof dataFormatter === 'function' ? dataFormatter(data) : data;
                    self._addListItem(self.filterData);
                    if (self.cache) {
                        self.cache[query] = self.filterData;
                    }
                    self._trigger('ajaxSuccess', data, status);
                },
                error: function(xhr, status, error){
                    if (typeof ajaxOpts.error === 'function') {
                        ajaxOpts.error(xhr, status, error);
                    }
                    self._trigger('ajaxError', xhr, status, error);
                }
            }));
        },

        /**
         * foucus
         * @private
         */
        _focus: function(){
            var value = $.trim(this.input.val());
            if (value) {
                this.queryDelay(value);
            }
        },


        /**
         * 触发自定义事件
         * @private
         */
        _trigger: function(event){
            var args = Array.prototype.slice.call(arguments, 1);
            event = event.toLowerCase();
            event = this['on' + event] || this['on' + event.substring(0,1).toUpperCase() + event.substring(1)];
            if (typeof event === 'function') {
                event.apply(this, args);
            }
        },

        _blur: function(){
            //this.collapse();
        },

        
        collapse: function(){
            this.iframe.syncIframe('hide');
            if (!this.isExpanded) {
                return;
            }
            var opts = this.options;
            this.list.hide();
            this.isExpanded = false;
        },

        expand: function(){
            this.iframe.syncIframe('show');
            if (this.isExpanded) {
                return;
            }
            this.list.show();
            this.isExpanded = true;
            
        },

        enable: function(){
            if (!this.disabled) {
                return;
            }
            this.disabled = false;
        },


        disable: function(){
            if (this.disabled) {
                return;
            }
            this.disabled = true;
            this.collapse();
        }

    });
})(Pui, jQuery);
