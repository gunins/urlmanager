(function (root, factory) {

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