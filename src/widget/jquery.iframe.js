/*========================================================================
 @作者：hugohua
 @说明：jquery iframe
 @最后编辑：$Author:: hugohua           $
 $Date:: 2014-32-05 9:32#$
 ========================================================================*/
(function(P){
    var isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1;

    P.widget('pp.iframe',{

        version:'0.1.0',
        //选项设置
        options : {
            iframe:{
                target          :   'body',
                className       :   'mod_pop_iframe',
                width           :   null,
                height          :   null,
                top             :   null,
                left            :   null
            }
        },

        _create:function(){
            if(isIE6){
                this.$target = this.$el.find(this.options.iframe.target);
            }
        },

        _createIframe:function(){
            var css = {
                display: 'none',
                border: 'none',
                opacity: 0,
//                background:'#000',
                position: 'absolute'
            };


            // 如果 target 存在 zIndex 则设置
            var zIndex = this.$target.css('zIndex');
            if (zIndex && zIndex > 0) {
                css.zIndex = zIndex - 1;
            }
            this.$iframe = $('<iframe>', {
                src: 'javascript:\'\'', // 不加的话，https 下会弹警告
                frameborder: 0,
                'class':this.options.iframe.className,
                css: css
            }).insertBefore(this.$target);
            return this.$iframe;
        },

        /**
         * 同步显示或隐藏iframe
         * @param status {string} 状态 可选值 show/hide
         */
        syncIframe:function(status){
            var $target = this.$target,
                $iframe = this.$iframe,
                ops     = this.options.iframe,
                width,
                height,
                pos,
                left,
                top;
            // 如果未传 target 则不处理
            if(!$target || !$target.length) return;

            // 如果目标元素隐藏，则 iframe 也隐藏
            if (status === 'hide') {
                $iframe && $iframe.hide();
            } else {
                // 第一次显示时才创建：as lazy as possible
                $iframe || ($iframe = this._createIframe());
                height      = ops.height || $target.outerHeight();
                width       = ops.width || $target.outerWidth();
                pos         = $target.position();
                left        = $.isNumeric(ops.left) ? ops.left :  pos.left;
                top         = $.isNumeric(ops.top) ? ops.top : pos.top;

                $iframe.css({
                    'height': height,
                    'width': width,
                    'top':top,
                    'left':left
                });
                $iframe.show();
            }

        },

        /**
         * 移除iframe
         * @private
         */
        _destroy:function(){
            if (this.$iframe) {
                this.$iframe.remove();
                delete this.$iframe;
            }
        }



    });
})(Pui);

