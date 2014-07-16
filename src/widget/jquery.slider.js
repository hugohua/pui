/**
 * slider plugin
 * author: aronhuang
 * require: jquery
 * version: 1.0
 */

(function(P, $){

    P.widget('pp.slider', {

        version:'0.1.0',

        //选项设置
        options: {
            scroller: '.mod_slide_img',
            nav: '.mod_slide_nav',
            triggerEvent: 'mouseover',
            prevBtn: '.mod_slide_btn_pre',
            nextBtn: '.mod_slide_btn_next',
            curCls: 'on',
            index: 0,
            speed: 500,
            delay: 3000,
            needBtn: true,
            navTpl: '<li></li>', //需要index可 '<li>{index}<li>' index从1起
            btnTpl: '<a href="#" class="mod_slide_btn"><i></i></a>',
            preload: true, //配合lazyload使用，预加载下一帧
            lazyload: 'data-src',
            loadingCls: 'mod_loading',
            autoPlay: true,
            effect: 'fade',
            btnHoverShow: false, //是否需要hover时控制btn的显示
            useWebkitTransition: false
        },

        /**
         * 初始化
         * @private
         */
        _create: function () {
            var opts = this.options;
            this.element = this.$el; //兼容原有，后续再调整
            this.scroller = this.element.find(opts.scroller);
            this.slides = this.scroller.children();
            this.index = isNaN(opts.index) ? 0 : opts.index;
            if (opts.lazyload) {
                this._loadImg(this.index);
            }
            if (this.slides.length < 2) {
                return ;
            }
            this.navWrap = this.element.find(opts.nav)
            this._createNav();
            if (opts.needBtn) {
                this._createBtns();
            }
            this.nav = this.navWrap.children();
            this.speed = opts.speed;
            this.autoPlay = opts.autoPlay;
            this.delay = opts.delay;
            this.length = this.slides.length;
            this.maxIndex = this.length - 1;
            this.transition = 'webkitTransition' in document.body.style && opts.useWebkitTransition;
            this._initEffect();
            if (this.autoPlay) {
                this.play();
            }
            this._bindEvent();
        },

        /**
         * 效果函数集
         * TODO: use css3 transition
         */
        effectFns: {
            none: function(index){
                this.slides.hide().eq(index).show();
            },

            fade: function(index){
                var curIdx = this.index;
                this.slides.eq(curIdx).stop().css('z-index', 0).animate({opacity: 0}, this.speed);
                this.slides.eq(index).stop().css('z-index', 1).animate({opacity: 1}, this.speed);
            },

            scrollX: function(index){
                this.scroller.stop().animate({'left': -index * this.stepWidth}, this.speed);
            },

            scrollY: function(index){
                this.scroller.stop().animate({'top': -index * this.stepWidth}, this.speed);
            }
        },




        /**
         * 绑定事件
         * @private
         */
        _bindEvent: function () {
            var opts = this.options, self = this;
            //导航事件
            this.nav.on(opts.triggerEvent, function(e){
                var index = self.nav.index($(this));
                if (index == self.index) {
                    return ;
                }
                self.slideTo(index);
            });

            //hover事件
            this.element.on('mouseenter', function(e){
                if (self.autoPlay) {
                    self.stop();
                }
                
            }).on('mouseleave', function(e){
                if (self.autoPlay) {
                    self.play();
                }
            });

            if (opts.needBtn) {
                if (opts.btnHoverShow) {
                    this.element.on('mouseenter', function(e){
                        self.prevBtn.fadeIn();
                        self.nextBtn.fadeIn();
                    }).on('mouseleave', function(e){
                        self.prevBtn.fadeOut();
                        self.nextBtn.fadeOut();
                    });
                }
                //前后按钮
                this.prevBtn.on('click', function(e){
                    e.preventDefault();
                    self.prev();
                });
                this.nextBtn.on('click', function(e){
                    e.preventDefault();
                    self.next();
                });
            }
            
            
        },

        /**
         * 生成导航节点
         * @private
         */
        _createNav: function () {
            if (this.navWrap.length == 0) {
                return ;
            }
            var tpl = this.options.navTpl, html = [];
            for (var i = 0, len = this.slides.length; i < len; i++) {
                var row = tpl.replace(/{index}/g, i + 1);
                html.push(row);
            }
            this.navWrap.html(html.join(''));
        },

        /**
         * 生成按钮
         * @private
         */
        _createBtns: function () {
            var opts = this.options, prevBtn = this.element.find(opts.prevBtn), nextBtn = this.element.find(opts.nextBtn);
            this.prevBtn = prevBtn.length === 0 ? $(opts.btnTpl).addClass(opts.prevBtn.substring(1)).appendTo(this.element) : prevBtn;
            this.nextBtn = nextBtn.length === 0 ? $(opts.btnTpl).addClass(opts.nextBtn.substring(1)).appendTo(this.element) : nextBtn;
        },

        /**
         * 初始化效果样式
         * @private
         */
        _initEffect: function () {
            var opts = this.options, effect = opts.effect, slides = this.slides, index = this.index;
            this.effectFn = this.effectFns[effect];
            switch(effect){
                case 'none':
                    slides.hide().eq(index).show();
                    break ;
                case 'fade':
                    slides.css({'opacity': 0, 'position': 'absolute', 'top': 0, 'left': 0, 'z-index': 0}).eq(index).css({'opacity': 1, 'z-index': 1});
                    break ;
                case 'scrollX':
                    this.stepWidth = slides.eq(0).width();
                    this.scroller.css({'position': 'absolute', 'width': this.length * this.stepWidth, 'left': -index * this.stepWidth});
                    slides.css('float', 'left');
                    break ;
                case 'scrollY':
                    this.stepWidth = this.slides.eq(0).height();
                    this.scroller.css({'position': 'absolute', 'top': -index * this.stepWidth});
                    break ;
            }
            this._updateNav();
        },

        /**
         * 获取当前帧索引
         * @public
         * @return 当前索引
         */
        getIndex: function () {
            return this.index;
        },

        /**
         * 播放
         * @public
         */
        play: function () {
            var self = this;
            if (!this.timer) {
                this.timer = window.setInterval(function () {
                    self.next();
                }, this.delay);
            }
        },

        /**
         * 暂停
         * @public
         */
        stop: function () {
            if (this.timer) {
                window.clearInterval(this.timer);
                this.timer = null;
            }
        },

        /**
         * 滚动到指定帧
         * @public
         * @prama 帧索引
         */
        slideTo: function(index){
            var opts = this.options;
            if (index === this.index || index < 0 || index > this.maxIndex) {
                return ;
            }
            this.effectFn(index);
            this.index = index;
            this._updateNav();
            if (opts.lazyload) {
                this._loadImg(index)
            }
            //预加载下一帧图片
            if (opts.lazyload && opts.preload) {
                index = index === 0 ? this.maxIndex : index === this.maxIndex ? 0 : index;
                this._loadImg(index);
            }
        },

        /**
         * 下一帧
         * @public
         */
        next: function () {
            var index = this.index + 1;
            if (index > this.maxIndex) {
                index = index % this.length;
            }
            this.slideTo(index);
        },

        /**
         * 上一帧
         * @public
         */
        prev: function () {
            var index = this.index - 1;
            if (index < 0) {
                index = this.maxIndex;
            }
            this.slideTo(index);
        },

        /**
         * lazyload 图片
         * @private
         * TODO: 增加预加载下一帧功能
         */
        _loadImg: function(index){
            var self = this, img = this.slides.eq(index).find('img'), opts = this.options, lazyAttr = opts.lazyload, loadingCls = opts.loadingCls;
            var src = $(img).attr(lazyAttr);
            if (!src) {
                return ;
            }
            this.slides.eq(index).addClass(loadingCls);
            var imgObj = new Image();
            $(imgObj).on('load', function(e){
                img.attr('src', src).removeAttr(lazyAttr);
                self.slides.eq(index).removeClass(loadingCls);
            });
            imgObj.src = src;
        },

        /**
         * 更新导航状态
         * @private
         */
        _updateNav: function () {
            var index = this.index, curCls = this.options.curCls;
            this.nav.eq(index).addClass(curCls).siblings().removeClass(curCls);
        }


    });
})(Pui, jQuery);


