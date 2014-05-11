
//添加CMD支持 for seajs
if(typeof define === "function"){
    define(function(require, exports, module){
        module.exports = Pui;
    });
}else{
    this.Pui = Pui;
}

//this is window
})(this,jQuery);