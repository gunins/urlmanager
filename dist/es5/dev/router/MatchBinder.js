'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
        function MatchBinder(location, params, command) {
            _classCallCheck(this, MatchBinder);

            this.bindings = [];
            this._activeBindings = [];
            this.location = location || '';
            this.command = command;
            this.params = params;
            this._active = false;
        }

        _createClass(MatchBinder, [{
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
                var binding = new MatchBinding(pattern, this.location, this);
                binding.setSubBinder(MatchBinder, this.location + (pattern || ''), mapHandler);
                this.bindings.push(binding);
                return binding;
            }
        }, {
            key: 'filter',
            value: function filter(location) {
                var bindings = this.bindings.filter(function (binding) {
                    return binding.test(location);
                });
                return bindings;
            }
        }, {
            key: 'clearActive',
            value: function clearActive(params, location) {
                if (this._activeBindings.length > 0) {
                    this._activeBindings.forEach(function (binding) {
                        return binding.clearActive(params, location);
                    });
                    this._activeBindings = [];
                }
            }
        }, {
            key: 'checkStatus',
            value: function checkStatus(matched, params) {
                if (this._activeBindings.length > 0) {
                    this._activeBindings = this._activeBindings.filter(function (binding) {
                        return binding.checkSegment(matched, params);
                    });
                }
            }
        }, {
            key: 'trigger',
            value: function trigger(params, location) {
                var matched = location.replace(/^\/|$/g, '').split('/');
                this.checkStatus(matched, params);
                this.onBinding(location, params);
            }
        }, {
            key: 'onBinding',
            value: function onBinding(location, params) {
                var _this = this;

                var bindings = this.filter(location);
                if (bindings.length > 0) {
                    bindings.forEach(function (binding) {
                        _this.runHandler(location, params, binding);
                        var fragment = binding.getFragment(location);
                        if (fragment.trim() !== '') {
                            var subBinder = binding.getSubBinder();
                            if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
                                subBinder.trigger(params, fragment);
                            }
                        }
                    });
                }
            }
        }, {
            key: 'runHandler',
            value: function runHandler(location, params, binding) {
                if (this._activeBindings.indexOf(binding) === -1) {
                    binding.trigger('to', params, location);
                    this._activeBindings.push(binding);
                }
                binding.trigger('query', params, location);
            }
        }, {
            key: 'run',
            value: function run() {
                this.command(this);
            }
        }]);

        return MatchBinder;
    }();

    return MatchBinder;
});
//# sourceMappingURL=MatchBinder.js.map
