'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
    function MatchBinder(location, params, command, root) {
        this.bindings = [];
        this.location = root || location || '';
        this.command = command;
        this.params = params;
    }

    MatchBinder.prototype.match = function (pattern, mapHandler) {

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
    };
    MatchBinder.prototype.getSubBinder = function (pattern) {
        return new MatchBinder(pattern);
    };
    MatchBinder.prototype.getMatchBinding = function (pattern, root) {
        return new MatchBinding(pattern, root);
    };
    MatchBinder.prototype.filter = function (location) {
        return this.bindings.filter(function (binding) {
            return binding.test(location);
        });
    };
    MatchBinder.prototype.run = function () {
        this.command(this);
    };
    return MatchBinder;
});
//# sourceMappingURL=MatchBinder.js.map
