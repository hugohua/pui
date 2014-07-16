/*========================================================================
 @作者：hugohua
 @说明：jquery menu plugin 仿亚马逊菜单三角区域插件 for seaJs
 @最后编辑：$Author:: hugohua           $
 $Date:: 2014-32-05 9:32#$
 ========================================================================*/
(function(P){
    var MOUSE_LOCS_TRACKED = 3,         // number of past mouse locations to track
        BELOW_HEIGHT = 5,               //距底部高度
        ENTER_DELAY = 100,
        DELAY = 300,                    // ms delay when user appears to be entering submenu
        sTimeId,                        //switch time id 切换菜单的settimeout id
        eTimeId,                        //enter time id 进入菜单的settimeout id
        lTimeId,                        //leave time id 移出菜单的setTimeout id
        rowIndex = null,                //当前menu item 索引
        lastDelayLoc,                   //最后一个点坐标
        activate,                       //是否已经激活了二级菜单
        mouseLocs = [],                 //鼠标移动时创建的数组
        $win = P.$win;

    P.$doc.off('mousemove.menu').on('mousemove.menu', function (e) {
        mouseLocs.push({x: e.pageX, y: e.pageY});
        if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
            mouseLocs.shift();
        }
    });

    P.widget('pp.menu', P.pp.iframe,{

        version:'0.1.5',

        options:{
            menuList        : '.cat_list',          //一级菜单容器
            menuPop         : '.cat_pop',           //二级菜单容器
            rowSelector     : '> li',               //一级菜单的item
            current         : 'on',                 //一级菜单item鼠标经过类名
            tolerance       : 0,                     //斜度、预测值 值越大，范围越广
            show            : $.noop,
            //扩展iframe插件
            iframe          : {
                target:'.cat_pop'
            }
        },

        _create:function(){
            var opts = this.options;
            this.$menuList = this.$el.find(opts.menuList);
            this.$menuItems = this.$menuList.find(opts.rowSelector);
            this.$menuPop = this.$el.find(opts.menuPop);

            this.offset = this.$el.offset();    //当前offset位置
            this.size = {
                width: this.$el.outerWidth(),
                height: this.$el.outerHeight()
            };
            this._initEvents();
            //调用父类iframe的create方法
            this._super();
        },



        _initEvents: function () {
            var me = this;
            /**
             * menu添加移出事件
             */
            me._on({
                'mouseleave':function(){
                    me.clearTime();
                    if (activate) {
                        lTimeId = setTimeout(function () {
                            me.hideSubPop();
                        }, ENTER_DELAY)
                    } else {
                        me.hideSubPop();
                    }
                }
            });

            /**
             * 单个子元素的mouseover事件
             */
            me._on(me.$menuItems,{
                'mouseenter':function(e){
                    var idx,
                        $row = $(e.delegateTarget);

                    me.clearTime();
                    if (!activate) {
                        eTimeId = setTimeout(function () {
                            idx = me.getIndex($row);
                            me._possiblyActivate(idx);
                        }, ENTER_DELAY)
                    } else {
                        idx = me.getIndex($row);
                        me._possiblyActivate(idx);
                    }
                }
            });

            this._on(this.$menuPop,{
                'mouseenter >div':function(e){
                    me.clearTime();
                    var idx = me.getIndex($(e.currentTarget));
                    me.showSubPop(idx);
                }
            })

        },

        clearTime: function () {
            if (sTimeId) clearTimeout(sTimeId);
            if (lTimeId) clearTimeout(lTimeId);
            if (eTimeId) clearTimeout(eTimeId);
        },


        /**
         * 显示二级菜单
         * @param idx 一级菜单li的索引值
         */
        showSubPop: function (idx) {
            var me = this,
                top,
                returnVal,
                $menuCur;
            if (idx == rowIndex) return;

            returnVal = this.options.show(idx);

            function _showPop(){
                $menuCur = me.getMenuItem(idx);
                me.$menuItems.removeClass(me.options.current);
                $menuCur.addClass(me.options.current);
                me.$menuPop.show();
                top = $menuCur.data('top') ||  me.getMenuItemPos(idx);
//                me.$menuPop.stop().animate({
//                    'top': top
//                }, 100);
                me.$menuPop.css('top',top);
                me.getSubPop(idx).show().siblings(':visible').hide();
                rowIndex = idx;
                activate = true;
                //显示iframe
                me.options.iframe.top = top;
                me.syncIframe('show')
            }

            //判断返回值是否存在，并且是否是jqXHR
            if(returnVal && $.isPlainObject(returnVal) && returnVal.done){
                returnVal.done(_showPop)
            }else{
                _showPop();
            }

        },

        /**
         * 隐藏二级菜单
         */
        hideSubPop: function () {
            this.$menuItems.removeClass(this.options.current);
            this.$menuPop.add(this.$menuPop.children(':visible')).hide();
            rowIndex = null;
            activate = null;
            this._trigger('hide',{
                idx:rowIndex
            });
            //隐藏iframe
            this.syncIframe('hide');
        },

        /**
         * 获取menu的Index
         * @param $menuCur
         * @returns {string} 索引值
         */
        getIndex: function ($menuCur) {
            var idx = $menuCur.attr('data-index');
            if(!idx){
                idx = $menuCur.index();
            }
            return idx;
//            return $(row).attr('data-index') ||  $(row).index();
        },

        /**
         * 获取子元素的pop对象
         * @param idx
         */
        getSubPop:function(idx){
            var $pop = this.$menuPop.find('[data-index="'+ idx +'"]');
            if(!$pop.length){
                $pop = this.$menuPop.children().eq(idx);
            }
            return  $pop;
        },

        getMenuItem:function(idx){
            var $pop = this.$menuItems.filter('[data-index="'+ idx +'"]');
            if(!$pop.length){
                $pop = this.$menuItems.eq(idx);
            }
            return  $pop;
        },

        /**
         * 获取menu的坐标值
         */
        getMenuItemPos: function (idx) {

            var $menuCur = this.getMenuItem(idx),
                oTop = parseFloat($menuCur.offset().top, 10),                           //当前一级菜单坐标
                height = parseFloat(this.getSubPop(idx).outerHeight(), 10),             //d 二级菜单高度 d
                mTop = parseFloat(this.$menuList.offset().top, 10),                     //e 当前一级菜单的row位置信息 e
                winHeight = parseFloat($win.height(), 10),                              //窗口高度
                wsTop = parseFloat($win.scrollTop(), 10),                               //滚动条高度
                pos;

            //正常高度
            if (oTop + height - wsTop <= winHeight) {
                pos = oTop - mTop;
            } else {
                //超出的高度
                pos = winHeight - (height + BELOW_HEIGHT) + wsTop - mTop;
            }
            $menuCur.data('top',pos);
            return pos;

        },


        _activationDelay: function () {
//                debugger;
            //首次进入，直接显示
            if (rowIndex === null) return 0;

            var offset = this.offset,
            //无需
                upperLeft = {
                    x: offset.left,
                    y: offset.top + this.options.tolerance
                },
                lowerLeft = {
                    x: offset.left,
                    y: offset.top + this.size.height + this.options.tolerance
                },

                upperRight = {
                    x: offset.left + this.size.width,
                    y: upperLeft.y
                },
                lowerRight = {
                    x: offset.left + this.size.width,
                    y: lowerLeft.y
                },
                loc = mouseLocs[mouseLocs.length - 1],
                prevLoc = mouseLocs[0];

            if (!loc) {
                return 0;
            }

            if (!prevLoc) {
                prevLoc = loc;
            }
            //不在菜单区域内
            if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x ||
                prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
                return 0;
            }

            if (lastDelayLoc &&
                loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
                return 0;
            }
            //计算直线斜率，斜率越大，则越陡
            function slope(a, b) {
                return (b.y - a.y) / (b.x - a.x);
            }

            var decreasingCorner = upperRight,
                increasingCorner = lowerRight;

            var decreasingSlope = slope(loc, decreasingCorner),
                increasingSlope = slope(loc, increasingCorner),
                prevDecreasingSlope = slope(prevLoc, decreasingCorner),
                prevIncreasingSlope = slope(prevLoc, increasingCorner);

            if (decreasingSlope < prevDecreasingSlope &&
                increasingSlope > prevIncreasingSlope) {

                lastDelayLoc = loc;
                return DELAY;
            }

            lastDelayLoc = null;
            return 0;
        },

        _possiblyActivate: function (idx) {
            var me = this;
            var delay = me._activationDelay();
            if (delay) {
                sTimeId = setTimeout(function () {
                    me._possiblyActivate(idx);
                }, delay);
            } else {
                me.showSubPop(idx);
            }
        },

        removePos:function(){
            this.$menuItems.removeData('top');
        }


    })

})(Pui);

