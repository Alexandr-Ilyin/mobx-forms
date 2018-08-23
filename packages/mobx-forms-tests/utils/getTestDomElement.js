import $ from 'jquery'

/**
 * Created by ilyin on 15.09.2015.
 */

var ReactDOM = require('react-dom');

var getTestDomElement = function(num){
    if (!num)
        num = 0;
    var id = "__c" + (num);
    var top = 30 + num*100;
    var width = window.innerWidth - 500;
    if ($('#'+id).length==0)
        $(document.body).append("<div id='" + id + "' style='background:white;border:10px solid lightgray;position:absolute; " +
            "top: " + top + "px; width: " + width + "px; ' class='SCREEN'/>");
    var el = $('#'+id)[0];
    ReactDOM.unmountComponentAtNode(el);
    if(el.cleanUp){
        el.cleanUp();
        el.cleanUp = null;
    }
    el.innerHTML = '';
    return el;
};


module.exports = getTestDomElement;