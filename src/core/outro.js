
this.Pui = Pui;
//添加CMD支持 for seajs
if(typeof define === "function"){
    define(function(require, exports, module){
        module.exports = Pui;
    });
}

//this is window
})(this,jQuery);