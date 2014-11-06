define(['../../src/router/Router'], function (Router) {

    var router = new Router;
    router.match(function (match) {
        //Nested Routes
        match('(/)levelB', function (match) {
            // Dynamic parametres
            match('/:a/:b/:c', function (match) {
                // Nested route for example displaying table
                match('/table', function (match) {
                    // Dynamic route for table
                    match('/:id').to(function (id) {
                        console.log('table id', id);
                    });
                }).to(function () {
                    console.log('table');
                });
                // Nested route for example displaying list
                match('/list', function (match) {
                    // dynamic route for list
                    match('/:id').to(function (id) {
                        console.log('list id', id);
                    });
                }).to(function () {
                    console.log('list');
                });

                // Triggering and return particullar url segments
            }).to(function (a, b, c, params) {
                console.log('leveloptC', a, b, c, params)
            });

        }).to(function () {
            console.log('levelB Triggered')
        });
        //same route in different Location
        match('/levelB').to(function () {
            console.log('External B called')

        });
        //Another Route
        match('/levelA', function (match) {
            match('/levelC').to(function () {
                console.log(arguments)
                console.log('levelC dash triggered');
                //    Triggering when Leave Route
            }).leave(function () {
                console.log('levelC dash Leaved');
                //    Triggering everytime params is changed
            }).query(function (params) {
                console.log(params.getQuery());
            });
        }).to(function () {
            console.log('levelA triggered')
        }).to(function () {
            console.log('levelA chained triggered')
        });

    });

    return router;
});