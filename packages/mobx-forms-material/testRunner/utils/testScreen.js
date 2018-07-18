/**
 * Created by ilyin on 21.09.2015.
 */
var TestUtils = require('react-dom/test-utils');


var helperFuncs = {
    checkbox : function ($el, val) {
        if ($el.is(":disabled"))
            return false;
        if (!$el.is(":visible"))
            return false;
        console.log("Change!" + val + " from " + $el[0].checked);
        TestUtils.Simulate.change($el[0], {target : {value : val, checked:val}});
    },

    checkFocused($el) {
        return $el.is(":focus");
    },

    checkVal : function($el, val){
        return $el.val() == val;
    },

    check : function($el, callback){
        return callback($el);
    },

    checkEnabled : function ($el) {
        return !$el.is(":disabled");
    },

    click($el) {
        if (!$el.is(":visible"))
            return false;

        TestUtils.Simulate.mouseDown($el[0]);
        TestUtils.Simulate.click($el[0], {button: 0});
        // $el.click();
    },

    type($el, text) {
        TestUtils.Simulate.focus($el[0]);
        TestUtils.Simulate.change($el[0], {target: {value: text}});
    },

    checkVisible($el){
        return $el.is(":visible");
    },
    focus($el){

        TestUtils.Simulate.focus($el[0]);
        $el.focus();
    },
    blur($el){
        TestUtils.Simulate.blur($el[0]);
    },

    keyDown($el, key, count){
        count = count || 1;
        for(var i =0;i<count;i++)
            TestUtils.Simulate.keyDown($el[0], {key: key});
    }
};

var waitSelector = function(selector){
    console.log("Waiting for element " + selector);
    var r = new Promise((resolve, reject)=>{
        var passed = 0;
        var self = this;
        var waits = [10,20,50, 100, 300,500,1000, 2000];
        var currentWaitNum = 0;
        var check = ()=> {

            var $el = find(selector, self.$testDom);
            if ($el.length==0) {
                if (passed < 10000) {
                    var wait = waits[currentWaitNum] || 2000;
                    passed += wait;
                    currentWaitNum++;
                    setTimeout(check, wait);
                }
                else
                    reject("Too long wait for " + selector);
            }
            else {
                resolve($el);
                console.log("Found element " + selector + " :)");
            }
        };
        check();
    });

    return r;

}

function slowPromise(p, time){
    if (time==null)
time = 20000;
if (time===0)
    return Promise.resolve().then(()=>p);
return wait(time).then(()=>p);
}

function wait(time){
    return new Promise((r)=>{
        setTimeout(function() {
            r();
        }, time);

    })
}


var waitElement = function(selector, checkFunc, methodName, checkArgs) {
    var _selector = selector;
    return slowPromise(waitSelector.call(this, selector).then(($el)=>{
        return waitCondition(()=>checkFunc($el))
    }), 1);
};

var waitCondition = function(func, wrapped) {
    var r = new Promise((resolve)=>{
        var passed = 0;
        var self = this;
        var waits = [10,20,50, 100, 200, 300, 500, 1000, 2000];
        var currentWaitNum = 0;

        var check = ()=> {
            Promise.resolve().then(()=>func()).then(x=>{
                if (x!==false) {
                    resolve();
                }
                else {
                    if (passed>10000)
                        throw ["Too long... failed to wait ", wrapped];

                    currentWaitNum++;
                    var wait = waits[currentWaitNum] || 2000;
                    passed += wait;
                    setTimeout(check, wait);
                }

            });
        };
        check();
    });
    return r;
};






var QueueContainer = function(){
    this.queue = Promise.resolve();
}
var queueContainer = new QueueContainer();

function find(selector, $parent) {
    console.log("Find ", selector);
    var x = _find(selector, $parent);
    console.log("Found: ", x);
    return x;
}

function _find(selector, $parent){
    if (typeof(selector)=='string') {

        if (!selector && $parent)
            return $parent;

        selector = selector.replace(/~(\w)*/g, (x)=> {return "[data-ft='" + x.substring(1) + "']";});
        if (/body/.test(selector) || !$parent)
            return $(selector);
        else
            return $parent.find(selector);
    }

    if (typeof(selector)=='function'){
        var res = selector($parent);
        if (res)
            return $(res);
        else
            return $([]);
    }
    return selector ? $(selector) : $('body');
}

var TestScreen = function(testDom, parent, additionalWait) {
    var self = this;

    this.additionalWait = additionalWait;
    this.queueContainer = queueContainer;
    this.waitElement = waitElement;
    this.reset = ()=>{
        this.queueContainer.queue = Promise.resolve();
    };
    for (var method in helperFuncs) {
        if (!helperFuncs.hasOwnProperty(method))
            continue;
        this[method] = wrapMethod(helperFuncs[method], method, this.additionalWait);
    }
    this.go = function(callback) {
        this.queueContainer.queue.then(callback);
    }
    this.enqueue = function (func) {
        self.queueContainer.queue = self.queueContainer.queue.then(func);
        return self;
    }

    this.waitFinished =function () {
        return self.queueContainer.queue.then(()=>this.additionalWait && this.additionalWait());
    }

    this.checkHidden = function(selector){
        return self.queueContainer.queue = self.queueContainer.queue.then(function(){
            return waitCondition(function(){
                var $el = find(selector, self.$testDom);

                var isHidden = $el.length==0 || !$el.is(":visible");
                console.log("Check hidden..." + selector + " found, is hidden:" + isHidden+":", $el);
                return isHidden;
            },"Waiting dom element " + testDom);
        })
    }


    this.find = function(selector){ return find(selector, self.$testDom);};
    this.queueContainer.queue = this.queueContainer.queue.then(function(){
        return waitCondition(function(){
            console.log("Waiting for " + testDom);
            self.$testDom = find(testDom, parent && parent.$testDom);
            return self.$testDom.length>0;
        },"Waiting dom element " + testDom);

    })
};

var wrapMethod = function(methodToWrap, methodName, additionalWait){
    return function () {
        var args = arguments;
        var self = this;
        self.queueContainer.queue = self.queueContainer.queue.then(()=>additionalWait ? additionalWait() : null);
        self.queueContainer.queue = self.queueContainer.queue.then(()=> {
            console.log("tester:" + methodName);
            var checkFunc = ($el)=>{
                args[0] = $el;
                return methodToWrap.apply(self, args)
            };
            return self.waitElement(args[0], checkFunc, methodName, args);
        });
        return self.queueContainer.queue;
    }
};

module.exports = TestScreen;