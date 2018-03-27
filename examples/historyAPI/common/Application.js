define(["require", "exports"], function(require, exports) {
    class Application {
        constructor(router){
            this.router = router;
        }
        run() {
            this.router.start();
        }
    }

    return Application;
});
