/*globals define*/
define([
    './MatchBinder'
], function (MatchBinder) {
    'use strict';
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    function parseParams(value) {
        try {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        }
        catch (err) {
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
        var current = params.root.substring(0, params.root.length - location.length), newQuery;
        fragment = fragment || '';
        if (isQuery === true) {
            newQuery = this.serialize(params.query);
        }
        else if (isQuery === false) {
            newQuery = '';
        }
        else {
            newQuery = this.serialize(isQuery);
        }
        return current + fragment + (newQuery.length === 0 ? '' : '?' + newQuery);
    }

    function Router() {
        this.root = this.getBinder();
        this.bindings = [];
    }

    Router.prototype.getBinder = function () {
        return new MatchBinder();
    };
    Router.prototype.match = function (mapHandler) {
        mapHandler(this.root.match.bind(this.root));
    };
    Router.prototype.trigger = function (location) {
        if (this.started) {
            var parts = location.split('?', 2);
            var query = {};
            if (parts[1]) {
                iterateQueryString(parts[1], function (name, value) {
                    value = parseParams(value);
                    if (!query[name]) {
                        query[name] = value;
                    }
                    else if (typeof query[name] === 'string') {
                        query[name] = [query[name], value];
                    }
                    else {
                        query[name].push(value);
                    }
                });
            }
            var loc = parts[0].replace(/^\/|$/g, '');
            this.find(this.root, loc, {
                root: loc,
                query: query
            });
        }
    };
    Router.prototype.find = function (binder, location, params) {
        var bindings = binder.filter(location);
        bindings.forEach(this.onBinding.bind(this, location, params));
    };
    Router.prototype.onBinding = function (location, params, binding) {
        var fragment = binding.getFragment(location);
        var subBinder = binding.getSubBinder();
        if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
            this.find(subBinder, fragment, params);
        }
        this.runHandler(location, params, binding);
    };
    Router.prototype.serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    Router.prototype.runHandler = function (location, params, binding) {
        var notValid = [];
        this.bindings.forEach(function (binder) {
            var binderLocation,
                fragment;
            //TODO: need add for dynamic params support
            if (binder.pattern.indexOf(':') === -1) {
                binderLocation = binder.location;
                fragment = params.root.substring(0, binderLocation.length)!==binderLocation;

            } else {
                binderLocation = binder.location.replace(binder.pattern.replace(/\((.*?)\)/g, '$1'), binder.prevLoc);
                fragment = params.root.replace(binderLocation, '') !== '';
            }


            if (fragment) {
                var handler = binder.getLeaveHandler();
                var args = [];
                this.applyHandler(handler, args, params, location);
                notValid.push(binder);
            }
        }.bind(this));

        notValid.forEach(function (binder) {
            this.bindings.splice(this.bindings.indexOf(binder), 1);
        }.bind(this))

        if (this.bindings.indexOf(binding) === -1) {
            var handler = binding.getHandler();
            var args = binding.extractParams(location);
            binding.prevLoc = location;
            this.applyHandler(handler, args, params, location);
            this.bindings.push(binding);
        }
        if (!isEmpty(params.query)) {
            var handler = binding.getQueryHandler();
            var args = [];
            this.applyHandler(handler, args, params, location);
        }

    };
    Router.prototype.applyHandler = function (handler, args, params, location) {
        if (handler) {
            handler.apply(this, args.concat({
                getQuery: function () {
                    return params.query;
                },
                getLocation: function (fragment, isQuery) {
                    return getLocation.call(this, fragment, isQuery, params, location)
                }.bind(this)
            }));
        }
    };
    Router.prototype.start = function () {
        this.started = true;
    };
    Router.prototype.stop = function () {
        this.started = false;
    };

    return Router;
});
