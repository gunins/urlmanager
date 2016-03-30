(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/MatchBinding',factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.UrlManager              = root.UrlManager || {};
        root.UrlManager.MatchBinding = factory();
    }
}(this, function () {
    function MatchBinding(pattern, location) {

        if (location === '') {
            this.pattern = location = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
        } else {
            this.pattern = pattern;
            location     = (location + pattern);
        }
        this.location = location.replace(/\((.*?)\)/g, '$1').replace(/^\/|$/g, '');

        var route = this.pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&')
            .replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?')
            .replace(MatchBinding.NAMED_PARAM, function (match, optional) {
                         return optional ? match : '([^\/]+)';
                     }).replace(MatchBinding.SPLAT_PARAM, '(.*?)');

        this.patternRegExp = new RegExp('^' + route);
        this.routeHandler  = [];
        this.leaveHandler  = [];
        this.queryHandler  = [];
        this.routes        = [];
    }

    MatchBinding.prototype.onBind    = function () {
    };
    MatchBinding.prototype.setOnBind = function (onBinding) {
        this.onBind = onBinding
    };
    MatchBinding.prototype.rebind    = function () {
        if (this.onBind !== undefined) {
            this.onBind();
        }
    };

    MatchBinding.prototype.setRoutes = function (routes) {
        this.routes.push(routes);
        return this;
    };

    MatchBinding.prototype.getRoutes = function () {
        return this.routes;
    };

    MatchBinding.prototype.to              = function (routeHandler) {
        this.routeHandler.push(routeHandler);
        return this;
    };
    MatchBinding.prototype.leave           = function (leaveHandler) {
        this.leaveHandler.push(leaveHandler);
        return this;
    };
    MatchBinding.prototype.query           = function (queryHandler) {
        this.queryHandler.push(queryHandler);
        return this;
    };
    MatchBinding.prototype.remove          = function () {
        this.routes.splice(0, this.routes.length);
        this.routeHandler.splice(0, this.routeHandler.length);
        this.leaveHandler.splice(0, this.leaveHandler.length);
        this.queryHandler.splice(0, this.queryHandler.length);
        return this;
    };
    MatchBinding.prototype.test            = function (location) {
        return this.patternRegExp.test(location);
    };
    MatchBinding.prototype.getFragment     = function (location) {
        var subLocation = this.applyParams(location);
        return location.replace(subLocation, '');
    };
    MatchBinding.prototype.applyParams     = function (location) {
        var matches  = this.pattern.replace(/\((.*?)\)/g, '$1').split('/');
        var matches2 = location.split('/');
        return matches2.splice(0, matches.length).join('/');
    };
    MatchBinding.prototype.extractParams   = function (fragment) {
        var params = this.patternRegExp.exec(fragment).slice(1);
        return params.map(function (param) {
            return param ? decodeURIComponent(param) : null;
        });
    };
    MatchBinding.prototype.setSubBinder    = function (subBinder) {
        this.subBinder = subBinder;
        return subBinder;
    };
    MatchBinding.prototype.getSubBinder    = function () {
        return this.subBinder;
    };
    MatchBinding.prototype.getHandler      = function () {
        return this.routeHandler;
    };
    MatchBinding.prototype.getLeaveHandler = function () {
        return this.leaveHandler;
    };
    MatchBinding.prototype.getQueryHandler = function () {
        return this.queryHandler;
    };

    MatchBinding.OPTIONAL_PARAM = /\((.*?)\)/g;
    MatchBinding.NAMED_PARAM    = /(\(\?)?:\w+/g;
    MatchBinding.SPLAT_PARAM    = /\*\w+/g;
    MatchBinding.ESCAPE_PARAM   = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    return MatchBinding;
}));
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/MatchBinder',[
            './MatchBinding'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinding'));
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.MatchBinder = factory(root.UrlManager.MatchBinding);
    }
}(this, function(MatchBinding) {
    function MatchBinder(location, params, command, root) {
        this.bindings = [];
        this.location = root || location || '';
        this.command = command;
        this.params = params;

    }

    MatchBinder.prototype.match = function(pattern, mapHandler) {

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
    MatchBinder.prototype.getSubBinder = function(pattern) {
        return new MatchBinder(pattern);
    };
    MatchBinder.prototype.getMatchBinding = function(pattern, root) {
        return new MatchBinding(pattern, root);
    };
    MatchBinder.prototype.filter = function(location) {
        return this.bindings.filter(function(binding) {
            return binding.test(location);
        });
    };
    MatchBinder.prototype.run = function() {
        this.command(this);
    };
    return MatchBinder;
}));

/*globals define*/
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/Router',[
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
}(this, function (MatchBinder) {
    'use strict';

    // attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;
        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
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
            var loc = parts[0].replace(/^\/|$/g, ''),
                params = {
                    root: loc,
                    query: query
                },
                notValid = [],
                matched = false;

            this.bindings.forEach(function (binder) {
                var fragment,
                    pattern = binder.pattern.replace(/\((.*?)\)/g, '$1').replace(/^\//, '').split('/'),
                    binderLocation = binder.location.split('/'),
                    prevLoc = binder.prevLoc.replace(/^\//, '').split('/'),
                    checkSegment = function (link) {
                        var currSegment = link.splice(binderLocation.length - pattern.length, pattern.length),
                            prevSegment = prevLoc.splice(0, pattern.length);
                        return (!currSegment.equals(prevSegment));
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
            }.bind(this));

            notValid.forEach(function (binder) {
                this.bindings.splice(this.bindings.indexOf(binder), 1);
            }.bind(this));

            this.find(this.root, loc, params);
        }
    };
    Router.prototype.find = function (binder, location, params) {
        var bindings = binder.filter(location);
        bindings.forEach(this.onBinding.bind(this, location, params));
    };

    Router.prototype.execute = function (binder) {
        var binderlocation = binder.location.split('/'),
            rootLocation = binder.params.root.split('/'),
            location = '/' + rootLocation.splice(binderlocation.length, rootLocation.length -
                                                                        binderlocation.length).join('/');
        this.find(binder, location, binder.params);
    };

    Router.prototype.onBinding = function (location, params, binding) {
        binding.setOnBind(this.onBinding.bind(this, location, params, binding))
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

        if (this.bindings.indexOf(binding) === -1) {
            var handler = binding.getHandler();
            var args = binding.extractParams(location);

            binding.prevLoc = location;

            this.applyHandler(handler, args, params, location);
            this.bindings.push(binding);
        }

        var handler = binding.getQueryHandler();
        if (handler) {
            this.applyHandler(handler, [], params, location);
        }

    };
    Router.prototype.applyHandler = function (handlers, args, params, location) {
        if (handlers && handlers.length > 0) {
            handlers.forEach(function (handler) {
                handler.apply(this, args.concat({
                    getQuery: function () {
                        return params.query;
                    },
                    getLocation: function (fragment, isQuery) {
                        return getLocation.call(this, fragment, isQuery, params, location)
                    }.bind(this)
                }));
            }.bind(this));
        }
    };
    Router.prototype.start = function () {
        this.started = true;
    };
    Router.prototype.stop = function () {
        this.started = false;
    };

    return Router;
}));

