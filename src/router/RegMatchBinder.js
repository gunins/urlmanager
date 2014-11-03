var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(['../coreRouter/MatchBinder', './RegMatchBinding'], function (MatchBinder, RegMatchBinding) {
    var RegMatchBinder = (function (_super) {
        __extends(RegMatchBinder, _super);
        function RegMatchBinder(fragment, query, command) {
            _super.call(this);
            this.fragment = fragment;
            this.query = query;
            this.command = command;
        }
        RegMatchBinder.prototype.getSubBinder = function () {
            return new RegMatchBinder();
        };
        RegMatchBinder.prototype.getMatchBinding = function (pattern) {
            return new RegMatchBinding(pattern);
        };
        RegMatchBinder.prototype.run = function () {
            this.command.execute(this);
        };
        return RegMatchBinder;
    })(MatchBinder);
    return RegMatchBinder;
});
