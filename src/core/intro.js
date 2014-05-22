
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
