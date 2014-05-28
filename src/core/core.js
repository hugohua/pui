/**
 * PUI
 * @module
 */
var Pui = window.Pui ={
    version: '0.1.0'
};

Pui.mix = function(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
};



