define(['../../src/router/Router'], function (Router) {

    var router = new Router;
    router.match(function (match) {
        match('/levelB').to(function () {
            console.log('levelB Triggered')
        });

        match('/levelA', function (match) {
   /*         match('').to(function () {
                console.log('levelA dash triggered')
            }).leave(function(){
                console.log('levelA dash leaved')
            });*/

            match('/levelC').to(function () {
                console.log(arguments)
                console.log('levelC dash triggered');
            }).leave(function(){
                console.log('levelC dash Leaved');
            }).query(function(params){
                console.log(params.getQuery());
            });
        }).to(function () {
            console.log('levelA triggered')
        });




    });

    return router;
});