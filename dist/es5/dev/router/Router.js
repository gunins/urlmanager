'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*globals define*/
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./MatchBinder', './utils'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinder'), require('./utils'));
    }
})(undefined, function (MatchBinder, utils) {
    'use strict';

    var Router = function () {
        function Router(location) {
            _classCallCheck(this, Router);

            if (location !== undefined && location !== '') {
                this._location = location.replace(/^\/|\/$/g, '') + '/';
            }
            this.root = this.getBinder();
            this._listeners = new Set();
            this._handlers = new Set();
        }

        _createClass(Router, [{
            key: 'getBinder',
            value: function getBinder() {
                return new MatchBinder('', this);
            }
        }, {
            key: 'test',
            value: function test(loc) {
                return new RegExp('^' + this._location, 'g').test(loc);
            }
        }, {
            key: 'getLocation',
            value: function getLocation(loc) {
                var location = loc.replace(/^\/|$/g, '');
                if (this._location !== undefined) {
                    if (this.test(location)) {
                        return location.replace(this._location, '');
                    } else {
                        return false;
                    }
                }
                return location;
            }
        }, {
            key: 'reTrigger',
            value: function reTrigger() {
                if (this.currLocation) {
                    this.trigger(this.currLocation);
                }
            }
        }, {
            key: 'trigger',
            value: function trigger(location) {
                if (this.started && location) {
                    this.started = false;
                    this.currLocation = location;
                    var parts = location.split('?', 2),
                        segments = this.getLocation(parts[0]);
                    if (segments || segments === '') {
                        var query = utils.setQuery(parts[1]),
                            params = {
                            root: segments,
                            query: query
                        };
                        this.execute(segments, params);
                    }
                }
            }
        }, {
            key: 'execute',
            value: function execute(location, params) {
                var _this = this;

                var matched = location.replace(/^\/|$/g, '').split('/'),
                    binder = this.root,
                    active = binder.checkStatus(matched, params);
                if (active.length > 0) {
                    active.forEach(function (item) {
                        item.handler(function (applied) {
                            if (!item.triggered) {
                                item.triggered = true;
                                item.applied = applied;
                                if (active.filter(function (item) {
                                    return item.applied;
                                }).length === active.length) {
                                    active.forEach(function (item) {
                                        return item.disable();
                                    });
                                    _this.setRoutes(true, location, params);
                                } else if (active.filter(function (item) {
                                    return item.triggered;
                                }).length === active.length) {
                                    _this.setRoutes(false);
                                }
                            }
                        });
                    });
                } else {
                    this.setRoutes(true, location, params);
                }
            }
        }, {
            key: 'setRoutes',
            value: function setRoutes(move, location, params) {
                if (move) {
                    this._handlers.forEach(function (handler) {
                        return handler();
                    });
                    this.root.triggerRoutes(location, params);
                }
                this.setLocation(move);
            }
        }, {
            key: 'setListener',
            value: function setListener(listener) {
                var listeners = this._listeners;
                listeners.add(listener);
                return {
                    remove: function remove() {
                        listeners.delete(listener);
                    }
                };
            }
        }, {
            key: 'onRouteChange',
            value: function onRouteChange(handler) {
                var handlers = this._handlers;
                handlers.add(handler);
                return {
                    remove: function remove() {
                        handlers.delete(handler);
                    }
                };
            }
        }, {
            key: 'setLocation',
            value: function setLocation(move) {
                var location = move ? this.currLocation : this.prevLocation;
                this.prevLocation = location;
                this.started = true;
                this._listeners.forEach(function (listener) {
                    return listener(location, move);
                });
            }
        }, {
            key: 'match',
            value: function match(mapHandler) {
                mapHandler(this.root.match.bind(this.root));
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
