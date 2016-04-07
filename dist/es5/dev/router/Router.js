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
        }

        _createClass(Router, [{
            key: 'getBinder',
            value: function getBinder() {
                return new MatchBinder();
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
            key: 'trigger',
            value: function trigger(location) {
                var _this = this;

                if (this.started) {
                    this.started = false;
                    var parts = location.split('?', 2),
                        loc = this.getLocation(parts[0]);
                    if (loc) {
                        var query = utils.setQuery(parts[1]),
                            params = {
                            root: loc,
                            query: query
                        };
                        this.root.trigger(loc, params, function (move) {
                            _this.setLocation(move ? location : _this.prevLocation);
                            _this.prevLocation = location;
                            _this.started = true;
                        });
                    }
                }
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
            key: 'setLocation',
            value: function setLocation(location) {
                this._listeners.forEach(function (listener) {
                    return listener(location);
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
