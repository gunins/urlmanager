(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.MatchBinding = factory();
    }
}(this, function() {
    'use strict';
    
    class MatchBinding {
        constructor(pattern, location) {

            if (location === '') {
                this.pattern = location = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
            } else {
                this.pattern = pattern;
                location = (location + pattern);
            }
            this.location = location.replace(/\((.*?)\)/g, '$1').replace(/^\/|$/g, '');
            console.log(this.location, this.pattern);

            let route = this.pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&')
                .replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?')
                .replace(MatchBinding.NAMED_PARAM, function(match, optional) {
                    return optional ? match : '([^\/]+)';
                }).replace(MatchBinding.SPLAT_PARAM, '(.*?)');

            this.patternRegExp = new RegExp('^' + route);
            this.routeHandler = [];
            this.leaveHandler = [];
            this.queryHandler = [];
            this.routes = [];
        }

        onBind() {
        };

        setOnBind(onBinding) {
            this.onBind = onBinding
        };

        rebind() {
            if (this.onBind !== undefined) {
                this.onBind();
            }
        };

        setRoutes(routes) {
            this.routes.push(routes);
            return this;
        };

        getRoutes() {
            return this.routes;
        };

        to(routeHandler) {
            this.routeHandler.push(routeHandler);
            return this;
        };

        leave(leaveHandler) {
            this.leaveHandler.push(leaveHandler);
            return this;
        };

        query(queryHandler) {
            this.queryHandler.push(queryHandler);
            return this;
        };

        remove() {
            this.routes.splice(0, this.routes.length);
            this.routeHandler.splice(0, this.routeHandler.length);
            this.leaveHandler.splice(0, this.leaveHandler.length);
            this.queryHandler.splice(0, this.queryHandler.length);
            return this;
        };

        test(location) {
            return this.patternRegExp.test(location);
        };

        getFragment(location) {
            let subLocation = this.applyParams(location);
            return location.replace(subLocation, '');
        };

        applyParams(location) {
            let matches = this.pattern.replace(/\((.*?)\)/g, '$1').split('/');
            let matches2 = location.split('/');
            return matches2.splice(0, matches.length).join('/');
        };

        extractParams(fragment) {
            let params = this.patternRegExp.exec(fragment).slice(1);
            return params.map(function(param) {
                return param ? decodeURIComponent(param) : null;
            });
        };

        setSubBinder(subBinder) {
            this.subBinder = subBinder;
            return subBinder;
        };

        getSubBinder() {
            return this.subBinder;
        };

        getHandler() {
            return this.routeHandler;
        };

        getLeaveHandler() {
            return this.leaveHandler;
        };

        getQueryHandler() {
            return this.queryHandler;
        };
    };
    Object.assign(MatchBinding, {
        OPTIONAL_PARAM: /\((.*?)\)/g,
        NAMED_PARAM:    /(\(\?)?:\w+/g,
        SPLAT_PARAM:    /\*\w+/g,
        ESCAPE_PARAM:   /[\-{}\[\]+?.,\\\^$|#\s]/g
    });

    return MatchBinding;
}));