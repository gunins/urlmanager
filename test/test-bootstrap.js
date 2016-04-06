// PhantomJS doesn't support bind yet
if (Function.prototype.bind === undefined) {
    (function() {
        var Ap = Array.prototype;
        var slice = Ap.slice;
        var Fp = Function.prototype;

        if (!Fp.bind) {
            // PhantomJS doesn't support Function.prototype.bind natively, so
            // polyfill it whenever this module is required.
            Fp.bind = function(context) {
                var func = this;
                var args = slice.call(arguments, 1);

                function bound() {
                    var invokedAsConstructor = func.prototype && (this instanceof func);
                    return func.apply(
                        // Ignore the context parameter when invoking the bound function
                        // as a constructor. Note that this includes not only constructor
                        // invocations using the new keyword but also calls to base class
                        // constructors such as BaseClass.call(this, ...) or super(...).
                        !invokedAsConstructor && context || this,
                        args.concat(slice.call(arguments))
                    );
                }

                // The bound function must share the .prototype of the unbound
                // function so that any object created by one constructor will count
                // as an instance of both constructors.
                bound.prototype = func.prototype;

                return bound;
            };
        }
    })();
}

function testGlobal(method) {
    return this[method] === undefined;
}
function testEs6(done, methods) {
    var global = this;
    if (methods.filter(testGlobal.bind(global)).length > 0) {
        require(['babel/polyfill'], function() {
            done();
        });
    } else {
        done();
    }
};

var check = function() {
    'use strict';

    if (typeof Symbol == 'undefined') return false;
    try {
        eval('class Foo {}');
        eval('var bar = (x) => x+1');
        eval('function Bar(a="a"){};');
        eval('function Foo(...a){return [...a]}');
        eval('var [a,b,c]=[1,2,3]');
    } catch (e) {
        return false;
    }

    return true;
}();

var target = check ? 'es6' : 'es5';
console.log('This browser version supporting: ' + target);

if (window.testDev!==undefined) {

    require.config({
        baseUrl: '../src', // '../dist/'+target+'/prod',
        paths:   {
            test: '../test',
            chai: "../node_modules/chai/chai"
        }
    });
} else {
    require.config({
        baseUrl: '../dist/' + target + '/prod',
        paths:   {
            test: '../../../test',
            chai: "../../../node_modules/chai/chai"
        }
    });
}


mocha.setup({
    ui: 'bdd'
});

mocha.ui('bdd');
testEs6(function run() {
        require([
            testPathname
        ], function() {

            if (window.mochaPhantomJS) {
                window.mochaPhantomJS.run();
            }
            else {
                mocha.run();
            }

        });
    },
    //Add there list of es6 feature you yse, for checking if need polyfill.
    ['Map', 'Set', 'Symbol'])