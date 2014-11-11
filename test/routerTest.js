(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'chai',
            'router/Router'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('chai'), require('../dist/router/Router'));
    }
}(this, function (chai, Router) {
    var expect = chai.expect;
    var router = new Router;
    var route = {};

    router.match(function (match) {
        //Nested Routes
        match('(/)levelB', function (match) {
            // Dynamic parametres
            match('/:a/:b/:c', function (match) {
                // Nested route for example displaying table
                match('/table', function (match) {
                    // Dynamic route for table
                    match('/:id').to(function (id) {
                        route.tableId = id;
                        console.log('table id', id);
                    });
                }).to(function () {
                    route.table = 'table';
                    console.log('table');
                });
                // Nested route for example displaying list
                match('/list', function (match) {
                    // dynamic route for list
                    match('/:id').to(function (id) {
                        route.listId = id;
                        console.log('list id', id);
                    }).leave(function () {
                        route.listLeave = 'leave';
                        console.log('list id is leaved');
                    });
                }).to(function () {
                    route.list = 'list';
                    console.log('list');
                });

                // Triggering and return particullar url segments
            }).to(function (a, b, c, params) {
                route.levelOptC = {a: a, b: b, c: c};
                console.log('leveloptC', a, b, c, params.getQuery())
            }).leave(function () {
                route.levelOptCLeave = 'leaved';
                console.log('leveloptC leaved');
            });

        }).to(function () {
            route.levelB = 'levelB';
            console.log('levelB Triggered')
        });
        //same route in different Location
        match('/levelB').to(function () {
            route.levelBEx = 'levelBEx';
            console.log('External B called')

        });
        //Another Route
        match('/levelA', function (match) {
            match('/levelC').to(function () {
                route.levelC = 'levelC';
                console.log('levelC dash triggered');
                //    Triggering when Leave Route
            }).leave(function () {
                route.levelCLeaved = 'levelCLeaved';
                console.log('levelC dash Leaved');
                //    Triggering everytime params is changed
            }).query(function (params) {
                route.query = params.getQuery();
                console.log(params.getQuery());
            });
        }).to(function () {
            route.levelA = 'levelA';
            console.log('levelA triggered')
        }).to(function () {
            route.levelACh = 'levelACh';
            console.log('levelA chained triggered')
        }).setRoutes(function(routes){
            routes.match('/levelR').to(function(){
                route.levelR = 'levelR';
                console.log('levelR triggered');
            });
            routes.run();

        });

    });
    router.start();
    /*
     /levelB
     levelB/a/b/c/list/35
     levelB/a/b/c/table/35
     */
    describe('url manager tests', function () {
        describe('Changeroutes', function () {
            describe('Static routes Changed with query in ASC order', function () {
                it('levelA route triggered should equal to levelA levelACh', function () {
                    router.trigger('/levelA');
                    expect(route).to.deep.equal({levelA: 'levelA', levelACh: 'levelACh'});
                });
                it('levelA/levelR lazy route triggered should equal to levelR', function () {
                    router.trigger('/levelA/levelR');
                    expect(route).to.deep.equal({levelR: 'levelR'});
                });

                it('levelA/levelC route triggered should equal to levelA levelACh', function () {
                    router.trigger('/levelA/levelC');
                    expect(route).to.deep.equal({levelC: 'levelC'});
                });

                it('levelA/levelC?a=5 route triggered query souldBe 5', function () {
                    router.trigger('/levelA/levelC?a=5');
                    expect(route.query).to.deep.equal({a: '5'});
                });

                it('levelA/levelC?a=6 route triggered query souldBe 6', function () {
                    router.trigger('/levelA/levelC?a=6');
                    expect(route.query).to.deep.equal({a: '6'});
                });

                it('levelA route triggered again should equal to LevelC Leaved', function () {
                    router.trigger('/levelA');
                    expect(route).to.deep.equal({levelCLeaved: 'levelCLeaved'});
                });
            });
            describe('Mixed Routes triggered in DESC Order', function () {
                it('levelB/a/b/c/list/35 route triggered', function () {
                    router.trigger('levelB/a/b/c/list/35');
                    var compare =
                    {
                        levelBEx: 'levelBEx',
                        levelB: 'levelB',
                        levelOptC: {a: 'a', b: 'b', c: 'c'},
                        list: 'list',
                        listId: '35'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/c/list/36 route triggered, only id is changed', function () {
                    router.trigger('levelB/a/b/c/list/36');
                    var compare =
                    {
                        listId: '36',
                        listLeave: 'leave'
                    };

                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/c/table/36 route triggered, only id is changed', function () {
                    router.trigger('levelB/a/b/c/table/36');
                    var compare =
                    {
                        table: 'table',
                        tableId: '36',
                        listLeave: 'leave'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/c/table/35 route triggered, only id is changed', function () {
                    router.trigger('levelB/a/b/c/table/35');
                    var compare =
                    {
                        tableId: '35'
                    };

                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/d/table/35 route after levelB triggered', function () {
                    router.trigger('levelB/a/b/d/table/35');
                    var compare =
                    {
                        levelOptCLeave: 'leaved',
                        levelOptC: {a: 'a', b: 'b', c: 'd'},
                        table: 'table',
                        tableId: '35'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/d route triggered, nothing changed', function () {
                    router.trigger('levelB/a/b/d');
                    var compare = {};
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/ route triggered, nothing changed', function () {
                    router.trigger('levelB/');
                    var compare = {
                        levelOptCLeave: 'leaved',
                    };
                    expect(route).to.deep.equal(compare);
                });

            });

        });
        afterEach(function () {
            route = {};
        });
    });
}));
