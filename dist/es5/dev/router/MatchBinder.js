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
        function MatchBinder(location, params, command, root) {
            _classCallCheck(this, MatchBinder);

            this.bindings = [];
            this.location = root || location || '';
            this.command = command;
            this.params = params;
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

                var binding = this.getMatchBinding(pattern, this.location);
                this.bindings.push(binding);

                var subBinder = this.getSubBinder(this.location + (pattern || ''));
                binding.setSubBinder(subBinder);

                if (mapHandler) {
                    mapHandler(subBinder.match.bind(subBinder));
                }
                return binding;
            }
        }, {
            key: 'getSubBinder',
            value: function getSubBinder(pattern) {
                return new MatchBinder(pattern);
            }
        }, {
            key: 'getMatchBinding',
            value: function getMatchBinding(pattern, root) {
                return new MatchBinding(pattern, root);
            }
        }, {
            key: 'filter',
            value: function filter(location) {
                return this.bindings.filter(function (binding) {
                    return binding.test(location);
                });
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
