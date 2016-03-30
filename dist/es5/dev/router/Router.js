'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*globals define*/
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./MatchBinder'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinder'));
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.Router = factory(root.UrlManager.MatchBinder);
    }
})(undefined, function (MatchBinder) {
    'use strict';

    // attach the .equals method to Array's prototype to call it on any array

    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array) return false;
        // compare lengths - can save a lot of time
        if (this.length != array.length) return false;

        for (var i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i])) return false;
            } else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };

    function parseParams(value) {
        try {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        } catch (err) {
            // Failover to whatever was passed if we get junk data
            return value;
        }
    }

    function iterateQueryString(queryString, callback) {
        var keyValues = queryString.split('&');
        keyValues.forEach(function (keyValue) {
            var arr = keyValue.split('=');
            callback(arr.shift(), arr.join('='));
        });
    }

    function getLocation(fragment, isQuery, params, location) {
        var current = params.root.substring(0, params.root.length - location.length),
            newQuery = void 0;
        fragment = fragment || '';
        if (isQuery === true) {
            newQuery = this.serialize(params.query);
        } else if (isQuery === false) {
            newQuery = '';
        } else {
            newQuery = this.serialize(isQuery);
        }
        return current + fragment + (newQuery.length === 0 ? '' : '?' + newQuery);
    }

    var Router = function () {
        function Router() {
            _classCallCheck(this, Router);

            this.root = this.getBinder();
            this.bindings = [];
        }

        _createClass(Router, [{
            key: 'getBinder',
            value: function getBinder() {
                return new MatchBinder();
            }
        }, {
            key: 'match',
            value: function match(mapHandler) {
                mapHandler(this.root.match.bind(this.root));
            }
        }, {
            key: 'trigger',
            value: function trigger(location) {
                var _this = this;

                if (this.started) {
                    (function () {
                        var parts = location.split('?', 2);
                        var query = {};
                        if (parts[1]) {
                            iterateQueryString(parts[1], function (name, value) {
                                value = parseParams(value);
                                if (!query[name]) {
                                    query[name] = value;
                                } else if (typeof query[name] === 'string') {
                                    query[name] = [query[name], value];
                                } else {
                                    query[name].push(value);
                                }
                            });
                        }
                        var loc = parts[0].replace(/^\/|$/g, ''),
                            params = {
                            root: loc,
                            query: query
                        },
                            notValid = [],
                            matched = false;

                        _this.bindings.forEach(function (binder) {
                            var fragment = void 0,
                                pattern = binder.pattern.replace(/\((.*?)\)/g, '$1').replace(/^\//, '').split('/'),
                                binderLocation = binder.location.split('/'),
                                prevLoc = binder.prevLoc.replace(/^\//, '').split('/'),
                                checkSegment = function checkSegment(link) {
                                var currSegment = link.splice(binderLocation.length - pattern.length, pattern.length),
                                    prevSegment = prevLoc.splice(0, pattern.length);
                                return !currSegment.equals(prevSegment);
                            };
                            fragment = checkSegment(matched || loc.split('/'));
                            if (fragment) {
                                matched = loc.split('/').splice(0, binderLocation.length - pattern.length);
                                var handler = binder.getLeaveHandler(),
                                    args = [];
                                binder.setOnBind();

                                this.applyHandler(handler, args, params, location);
                                notValid.push(binder);
                            }
                        }.bind(_this));

                        notValid.forEach(function (binder) {
                            this.bindings.splice(this.bindings.indexOf(binder), 1);
                        }.bind(_this));

                        _this.find(_this.root, loc, params);
                    })();
                }
            }
        }, {
            key: 'find',
            value: function find(binder, location, params) {
                var bindings = binder.filter(location);
                bindings.forEach(this.onBinding.bind(this, location, params));
            }
        }, {
            key: 'execute',
            value: function execute(binder) {
                var binderlocation = binder.location.split('/'),
                    rootLocation = binder.params.root.split('/'),
                    location = '/' + rootLocation.splice(binderlocation.length, rootLocation.length - binderlocation.length).join('/');
                this.find(binder, location, binder.params);
            }
        }, {
            key: 'onBinding',
            value: function onBinding(location, params, binding) {
                binding.setOnBind(this.onBinding.bind(this, location, params, binding));
                this.runHandler(location, params, binding);
                var fragment = binding.getFragment(location);
                var subBinder = binding.getSubBinder();
                if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
                    this.find(subBinder, fragment, params);
                }
                var subRoutes = binding.getRoutes();
                if (subRoutes && subRoutes.length > 0) {
                    while (subRoutes.length > 0) {
                        var Route = subRoutes[0],
                            binder = new MatchBinder(binding.getFragment(location), params, this.execute.bind(this), binding.location);
                        Route(binder);
                        subBinder.bindings = subBinder.bindings.concat(binder.bindings);
                        subRoutes.shift();
                    }
                }
            }
        }, {
            key: 'serialize',
            value: function serialize(obj) {
                var str = [];
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                }return str.join("&");
            }
        }, {
            key: 'runHandler',
            value: function runHandler(location, params, binding) {

                if (this.bindings.indexOf(binding) === -1) {
                    var _handler = binding.getHandler();
                    var args = binding.extractParams(location);

                    binding.prevLoc = location;

                    this.applyHandler(_handler, args, params, location);
                    this.bindings.push(binding);
                }

                var handler = binding.getQueryHandler();
                if (handler) {
                    this.applyHandler(handler, [], params, location);
                }
            }
        }, {
            key: 'applyHandler',
            value: function applyHandler(handlers, args, params, location) {
                if (handlers && handlers.length > 0) {
                    handlers.forEach(function (handler) {
                        handler.apply(this, args.concat({
                            getQuery: function getQuery() {
                                return params.query;
                            },
                            getLocation: function (fragment, isQuery) {
                                return getLocation.call(this, fragment, isQuery, params, location);
                            }.bind(this)
                        }));
                    }.bind(this));
                }
            }
        }, {
            key: 'start',
            value: function start() {
                this.started = true;
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.started = false;
            }
        }]);

        return Router;
    }();

    return Router;
});
//# sourceMappingURL=Router.js.map
