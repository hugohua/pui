/**
 * PUI
 * @module
 */
var Pui = {
    version: '0.0.1'
};

Pui.mix = function(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
};



