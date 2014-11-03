var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(['../coreRouter/Router', './RegMatchBinder'], function (Router, MyMatchBinder) {
    var MyRouter = (function (_super) {
        __extends(MyRouter, _super);
        function MyRouter() {
            _super.apply(this, arguments);
        }
        MyRouter.prototype.getBinder = function () {
            return new MyMatchBinder();
        };
        MyRouter.prototype.onBinding = function (location, query, binding) {
            _super.prototype.onBinding.call(this, location, query, binding);
            var Region = binding.getRegion();
            if (Region) {
                Region(new MyMatchBinder(binding.getFragment(location), query, this));
            }
        };
        MyRouter.prototype.execute = function (binder) {
            var bindings = binder.filter(binder.fragment);
            bindings.forEach(this.runHandler.bind(this, binder.fragment, binder.query));
        };
        return MyRouter;
    })(Router);
    return MyRouter;
});
