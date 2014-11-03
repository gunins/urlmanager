define(['../../src/coreRouter/Router'], function (Router) {
    function LevelBHandler() {
        console.log(this, arguments);
    }

    function LevelOneProcessor() {
        console.log(this, arguments);
    }

    function LevelTwoHandler() {
        console.log(this, arguments);
    }

    function LevelTwoProcessor() {
        console.log(this, arguments);
    }

    var router = new Router;
    router.match(function (match) {
        match('/levelA', function (match) {
            match('/').to(function () {
                console.log('levelA dash triggered')
            });
            match('/do').to(LevelOneProcessor);

            match('/levelC', function (match) {
                match('/').to(function () {
                    console.log('levelC dash triggered');
                });
                match('/do').to(LevelTwoProcessor);
            });
        });
        match('/levelA').to(function () {
            console.log('levelA Triggered')

        })

        match('/levelB').to(function () {
            console.log('levelB Triggered')
        });

    });

    return router;
});