/*globals define*/
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './MatchBinder'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinder'));
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.Router = factory(root.UrlManager.MatchBinder);
    }
}(this, function(MatchBinder) {
    'use strict';

    // attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function(array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;
        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (let i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };

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
        let keyValues = queryString.split('&');
        keyValues.forEach((keyValue)=> {
            let arr = keyValue.split('=');
            callback(arr.shift(), arr.join('='));
        });
    }

    function getLocation(fragment, isQuery, params, location) {
        let current = params.root.substring(0, params.root.length - location.length), newQuery;
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

    class Router {
        constructor() {
            this.root = this.getBinder();
            this.bindings = [];
        };

        getBinder() {
            return new MatchBinder();
        };

        match(mapHandler) {
            mapHandler(this.root.match.bind(this.root));
        };

        trigger(location) {
            if (this.started) {
                let parts = location.split('?', 2);
                let query = {};
                if (parts[1]) {
                    iterateQueryString(parts[1], function(name, value) {
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
                let loc = parts[0].replace(/^\/|$/g, ''),
                    params = {
                        root:  loc,
                        query: query
                    },
                    notValid = [],
                    matched = false;

                this.bindings.forEach(function(binder) {
                    let fragment,
                        pattern = binder.pattern.replace(/\((.*?)\)/g, '$1').replace(/^\//, '').split('/'),
                        binderLocation = binder.location.split('/'),
                        prevLoc = binder.prevLoc.replace(/^\//, '').split('/'),
                        checkSegment = function(link) {
                            let currSegment = link.splice(binderLocation.length - pattern.length, pattern.length),
                                prevSegment = prevLoc.splice(0, pattern.length);
                            return (!currSegment.equals(prevSegment));
                        };
                    fragment = checkSegment(matched || loc.split('/'));
                    if (fragment) {
                        matched = loc.split('/').splice(0, binderLocation.length - pattern.length);
                        let handler = binder.getLeaveHandler(),
                            args = [];
                        binder.setOnBind();

                        this.applyHandler(handler, args, params, location);
                        notValid.push(binder);
                    }
                }.bind(this));

                notValid.forEach(function(binder) {
                    this.bindings.splice(this.bindings.indexOf(binder), 1);
                }.bind(this));

                this.find(this.root, loc, params);
            }
        };

        find(binder, location, params) {
            let bindings = binder.filter(location);
            bindings.forEach(this.onBinding.bind(this, location, params));
        };

        execute(binder) {
            let binderlocation = binder.location.split('/'),
                rootLocation = binder.params.root.split('/'),
                location = '/' + rootLocation.splice(binderlocation.length, rootLocation.length -
                        binderlocation.length).join('/');
            this.find(binder, location, binder.params);
        };

        onBinding(location, params, binding) {
            binding.setOnBind(this.onBinding.bind(this, location, params, binding))
            this.runHandler(location, params, binding);
            let fragment = binding.getFragment(location);
            let subBinder = binding.getSubBinder();
            if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
                this.find(subBinder, fragment, params);
            }
            let subRoutes = binding.getRoutes();
            if (subRoutes && subRoutes.length > 0) {
                while (subRoutes.length > 0) {
                    let Route = subRoutes[0],
                        binder = new MatchBinder(binding.getFragment(location), params, this.execute.bind(this), binding.location);
                    Route(binder);
                    subBinder.bindings = subBinder.bindings.concat(binder.bindings);
                    subRoutes.shift();
                }
            }

        };

        serialize(obj) {
            let str = [];
            for (let p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        };

        runHandler(location, params, binding) {

            if (this.bindings.indexOf(binding) === -1) {
                let handler = binding.getHandler();
                let args = binding.extractParams(location);

                binding.prevLoc = location;

                this.applyHandler(handler, args, params, location);
                this.bindings.push(binding);
            }

            let handler = binding.getQueryHandler();
            if (handler) {
                this.applyHandler(handler, [], params, location);
            }

        };

        applyHandler(handlers, args, params, location) {
            if (handlers && handlers.length > 0) {
                handlers.forEach(function(handler) {
                    handler.apply(this, args.concat({
                        getQuery:    function() {
                            return params.query;
                        },
                        getLocation: function(fragment, isQuery) {
                            return getLocation.call(this, fragment, isQuery, params, location)
                        }.bind(this)
                    }));
                }.bind(this));
            }
        };

        start() {
            this.started = true;
        };

        stop() {
            this.started = false;
        };
    }
    return Router;
}));
