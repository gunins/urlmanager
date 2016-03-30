'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.MatchBinding = factory();
    }
})(undefined, function () {
    'use strict';

    var MatchBinding = function () {
        function MatchBinding(pattern, location) {
            _classCallCheck(this, MatchBinding);

            if (location === '') {
                this.pattern = location = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
            } else {
                this.pattern = pattern;
                location = location + pattern;
            }
            this.location = location.replace(/\((.*?)\)/g, '$1').replace(/^\/|$/g, '');

            var route = this.pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&').replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?').replace(MatchBinding.NAMED_PARAM, function (match, optional) {
                return optional ? match : '([^\/]+)';
            }).replace(MatchBinding.SPLAT_PARAM, '(.*?)');

            this.patternRegExp = new RegExp('^' + route);
            this.routeHandler = [];
            this.leaveHandler = [];
            this.queryHandler = [];
            this.routes = [];
        }

        _createClass(MatchBinding, [{
            key: 'onBind',
            value: function onBind() {}
        }, {
            key: 'setOnBind',
            value: function setOnBind(onBinding) {
                this.onBind = onBinding;
            }
        }, {
            key: 'rebind',
            value: function rebind() {
                if (this.onBind !== undefined) {
                    this.onBind();
                }
            }
        }, {
            key: 'setRoutes',
            value: function setRoutes(routes) {
                this.routes.push(routes);
                return this;
            }
        }, {
            key: 'getRoutes',
            value: function getRoutes() {
                return this.routes;
            }
        }, {
            key: 'to',
            value: function to(routeHandler) {
                this.routeHandler.push(routeHandler);
                return this;
            }
        }, {
            key: 'leave',
            value: function leave(leaveHandler) {
                this.leaveHandler.push(leaveHandler);
                return this;
            }
        }, {
            key: 'query',
            value: function query(queryHandler) {
                this.queryHandler.push(queryHandler);
                return this;
            }
        }, {
            key: 'remove',
            value: function remove() {
                this.routes.splice(0, this.routes.length);
                this.routeHandler.splice(0, this.routeHandler.length);
                this.leaveHandler.splice(0, this.leaveHandler.length);
                this.queryHandler.splice(0, this.queryHandler.length);
                return this;
            }
        }, {
            key: 'test',
            value: function test(location) {
                return this.patternRegExp.test(location);
            }
        }, {
            key: 'getFragment',
            value: function getFragment(location) {
                var subLocation = this.applyParams(location);
                return location.replace(subLocation, '');
            }
        }, {
            key: 'applyParams',
            value: function applyParams(location) {
                var matches = this.pattern.replace(/\((.*?)\)/g, '$1').split('/');
                var matches2 = location.split('/');
                return matches2.splice(0, matches.length).join('/');
            }
        }, {
            key: 'extractParams',
            value: function extractParams(fragment) {
                var params = this.patternRegExp.exec(fragment).slice(1);
                return params.map(function (param) {
                    return param ? decodeURIComponent(param) : null;
                });
            }
        }, {
            key: 'setSubBinder',
            value: function setSubBinder(subBinder) {
                this.subBinder = subBinder;
                return subBinder;
            }
        }, {
            key: 'getSubBinder',
            value: function getSubBinder() {
                return this.subBinder;
            }
        }, {
            key: 'getHandler',
            value: function getHandler() {
                return this.routeHandler;
            }
        }, {
            key: 'getLeaveHandler',
            value: function getLeaveHandler() {
                return this.leaveHandler;
            }
        }, {
            key: 'getQueryHandler',
            value: function getQueryHandler() {
                return this.queryHandler;
            }
        }]);

        return MatchBinding;
    }();

    ;
    Object.assign(MatchBinding, {
        OPTIONAL_PARAM: /\((.*?)\)/g,
        NAMED_PARAM: /(\(\?)?:\w+/g,
        SPLAT_PARAM: /\*\w+/g,
        ESCAPE_PARAM: /[\-{}\[\]+?.,\\\^$|#\s]/g
    });

    return MatchBinding;
});
//# sourceMappingURL=MatchBinding.js.map
