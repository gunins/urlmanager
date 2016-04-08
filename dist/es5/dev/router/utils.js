'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*globals define*/
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    }
})(undefined, function () {
    'use strict';

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

    function setQuery(parts) {
        var query = {};
        if (parts) {
            iterateQueryString(parts, function (name, value) {
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
        return query;
    }

    function serialize(obj) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }return str.join("&");
    };

    function getLocation(params, pattern) {

        return {
            getQuery: function getQuery() {
                return params.query;
            },
            getLocation: function getLocation() {
                var fragment = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
                var isQuery = arguments[1];

                var current = params.root.substring(0, params.root.length - pattern.length),
                    newQuery = void 0;

                if (isQuery === true) {
                    newQuery = serialize(params.query);
                } else if (isQuery === false) {
                    newQuery = '';
                } else {
                    newQuery = serialize(isQuery);
                }
                return current + fragment + (newQuery.length === 0 ? '' : '?' + newQuery);
            }
        };
    };

    // attach the .equals method to Array's prototype to call it on any array
    function equals(arr1, arr2) {
        // if the other arr2 is a falsy value, return
        if (!arr2) return false;
        // compare lengths - can save a lot of time
        if (arr1.length !== arr2.length) return false;

        for (var i = 0, l = arr1.length; i < l; i++) {
            // Check if we have nested arrays
            if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                // recurse into the nested arrays
                if (!equals(arr1[i], arr2[i])) return false;
            } else if (arr1[i] !== arr2[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        ARGUMENT_NAMES = /(?:^|,)\s*([^\s,=]+)/g;

    function getArgs(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, ''),
            argsList = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')),
            result = argsList.match(ARGUMENT_NAMES);
        return result === null ? [] : result.map(function (item) {
            return item.replace(/[\s,]/g, '');
        });
    }

    return {
        serialize: serialize, getLocation: getLocation, equals: equals, setQuery: setQuery, getArgs: getArgs
    };
});
//# sourceMappingURL=utils.js.map
