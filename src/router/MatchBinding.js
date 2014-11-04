define(function () {
    function MatchBinding(pattern, location) {
        this.pattern = pattern;
        this.location = location + pattern;
        var route = pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&')
            .replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?')
            .replace(MatchBinding.NAMED_PARAM, function (match, optional) {
                return optional ? match : '([^\/]+)';
            }).replace(MatchBinding.SPLAT_PARAM, '(.*?)');

        this.patternRegExp = new RegExp('^' + route);
    }

    MatchBinding.prototype.to = function (routeHandler) {
        this.routeHandler = routeHandler;
        return this;
    };
    MatchBinding.prototype.leave = function (leaveHandler) {
        this.leaveHandler = leaveHandler;
        return this;
    };
    MatchBinding.prototype.query = function (queryHandler) {
        this.queryHandler = queryHandler;
        return this;
    };
    MatchBinding.prototype.test = function (location) {
        return this.patternRegExp.test(location);
    };
    MatchBinding.prototype.getFragment = function (location) {
        var subLocation = this.applyParams();
        return location.replace(subLocation, '');
    };
    MatchBinding.prototype.applyParams = function () {
        return this.pattern;
    };
    MatchBinding.prototype.extractParams = function (fragment) {
        var params = this.patternRegExp.exec(fragment).slice(1);
        return params.map(function (param) {
            return param ? decodeURIComponent(param) : null;
        });
    };
    MatchBinding.prototype.setSubBinder = function (subBinder) {
        this.subBinder = subBinder;
        return subBinder;
    };
    MatchBinding.prototype.getSubBinder = function () {
        return this.subBinder;
    };
    MatchBinding.prototype.getHandler = function () {
        return this.routeHandler;
    };
    MatchBinding.prototype.getLeaveHandler = function () {
        return this.leaveHandler;
    };
    MatchBinding.prototype.getQueryHandler = function () {
        return this.queryHandler;
    };
    MatchBinding.OPTIONAL_PARAM = /\((.*?)\)/g;
    MatchBinding.NAMED_PARAM = /(\(\?)?:\w+/g;
    MatchBinding.SPLAT_PARAM = /\*\w+/g;
    MatchBinding.ESCAPE_PARAM = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    return MatchBinding;
});
