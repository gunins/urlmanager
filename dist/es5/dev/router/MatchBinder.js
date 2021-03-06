'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./MatchBinding'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinding'));
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.MatchBinder = factory(root.UrlManager.MatchBinding);
    }
})(undefined, function (MatchBinding) {
    'use strict';

    var MatchBinder = function () {
        function MatchBinder(location, parent) {
            _classCallCheck(this, MatchBinder);

            this._parent = parent;
            this.bindings = new Set();
            this.location = location || '';
            this._active = false;
        }

        _createClass(MatchBinder, [{
            key: 'reTrigger',
            value: function reTrigger() {
                this._parent.reTrigger();
            }
        }, {
            key: 'match',
            value: function match(pattern, mapHandler) {
                if (typeof pattern === 'function') {
                    mapHandler = pattern;
                    pattern = false;
                }
                if (pattern === '') {
                    pattern = false;
                }
                return this.getMatchBinding(pattern, mapHandler);
            }
        }, {
            key: 'getMatchBinding',
            value: function getMatchBinding(pattern, mapHandler) {
                if (pattern) {
                    var binding = new MatchBinding(pattern, this.location, this);
                    binding.setSubBinder(MatchBinder, this.location + (pattern || ''), mapHandler);
                    this.bindings.add(binding);
                    return binding;
                } else {
                    if (typeof mapHandler === 'function') {
                        mapHandler(this.match.bind(this));
                    }
                    return {
                        match: this.match.bind(this)
                    };
                }
            }
        }, {
            key: 'clearActive',
            value: function clearActive(params, location) {
                var active = [];
                if (this.bindings.size > 0) {
                    this.bindings.forEach(function (binding) {
                        active = active.concat(binding.clearActive(params, location));
                    });
                }
                return active;
            }
        }, {
            key: 'checkStatus',
            value: function checkStatus(matched, params) {
                var active = [];
                if (this.bindings.size > 0) {
                    this.bindings.forEach(function (binding) {
                        active = active.concat(binding.checkSegment(matched, params));
                    });
                }
                return active;
            }
        }, {
            key: 'remove',
            value: function remove() {
                if (this.bindings.size > 0) {
                    this.bindings.forEach(function (binding) {
                        return binding.remove();
                    });
                }
            }
        }, {
            key: 'triggerRoutes',
            value: function triggerRoutes(location, params) {
                if (this.bindings.size > 0) {
                    this.bindings.forEach(function (binding) {
                        return binding.triggerTo(location, params);
                    });
                }
            }
        }]);

        return MatchBinder;
    }();

    return MatchBinder;
});
//# sourceMappingURL=MatchBinder.js.map
