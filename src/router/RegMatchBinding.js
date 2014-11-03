var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(['../coreRouter/MatchBinding'], function (MatchBinding) {
    var MyMatchBinding = (function (_super) {
        __extends(MyMatchBinding, _super);
        function MyMatchBinding() {
            _super.apply(this, arguments);
        }
        MyMatchBinding.prototype.toRegion = function (region) {
            this.region = region;
        };
        MyMatchBinding.prototype.getRegion = function () {
            return this.region;
        };
        return MyMatchBinding;
    })(MatchBinding);
    return MyMatchBinding;
});
