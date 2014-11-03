define(["require", "exports"], function(require, exports) {
    var Application = (function () {
        function Application(router) {
            this.router = router;
        }
        Application.prototype.run = function () {
            this.router.start();
        };
        return Application;
    })();

    
    return Application;
});
