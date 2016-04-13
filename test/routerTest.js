/*global describe, it*/
(function(root, factory) {
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
        function testGlobal(method) {
            return this[method] === undefined;
        }

        function testEs6(methods) {
            var global = this;
            if (methods.filter(testGlobal.bind(global)).length > 0) {
                require('babel/polyfill');
            }
        };

        var check = function() {
            'use strict';

            if (typeof Symbol == 'undefined') return false;
            try {
                eval('class Foo {}');
                eval('var bar = (x) => x+1');
                eval('function Bar(a=\'a\'){};');
                eval('function Foo(...a){return [...a]}');
                eval('var [a,b,c]=[1,2,3]');
            } catch (e) {
                return false;
            }

            return true;
        }();

        var target = check ? 'es6' : 'es5';
        console.log('This version of Nodejs supporting: ' + target);
        testEs6(['Map', 'Set', 'Symbol'])
        module.exports = factory(require('chai'), require('../dist/' + target + '/dev/router/Router'));
    }
}(this, function(chai, Router) {
    'use strict';

    var expect = chai.expect;
    var router = new Router();
    var route = {};
    var matchLevel;

    router.match(function(match) {
        //Nested Routes
        match('(/)levelB', function(match) {
            match(function() {
                // Dynamic parametres
                match('/:a/:b/:c', function(match) {
                    // Nested route for example displaying table
                    match('/table', function(match) {
                        // Dynamic route for table
                        match('/:id').to(function(id, params) {
                            route.tableId = id;
                            route.tableLocation = params.getLocation();
                            console.log('table id', id);
                        });
                    }).to(function() {
                        route.table = 'table';
                        console.log('table');
                    });
                    // Nested route for example displaying list
                    match('/list', function(match) {
                        // dynamic route for list
                        match('/:id').to(function(id, params) {
                            route.listId = id;
                            route.listLocation = params.getLocation()
                            console.log('list id', id);
                        }).leave(function() {
                            route.listLeave = 'leave';
                            console.log('list id is leaved');
                        });
                    }).to(function() {
                        route.list = 'list';
                        console.log('list');
                    }).leave(function(done) {
                        setTimeout(function() {
                            route.listLeavea = 'leave200';
                            done();
                        }, 200)
                    }).leave(function(done) {
                        setTimeout(function() {
                            route.listLeaveb = 'leave300';
                            done();
                        }, 300)
                    });

                    // Triggering and return particullar url segments
                }).to(function(a, b, c, params) {
                    route.levelOptC = {
                        a: a,
                        b: b,
                        c: c
                    };
                    console.log('leveloptC', a, b, c, params.getQuery())
                }).leave(function() {
                    route.levelOptCLeave = 'leaved';
                    console.log('leveloptC leaved');
                });
            });
        }).to(function() {
            route.levelB = 'levelB';
            console.log('levelB Triggered')
        });
        //same route in different Location
        match('/levelB').to(function() {
            route.levelBEx = 'levelBEx';
            console.log('External B called')

        });
    });
    router.match(function(match) {
        //Another Route
        match('/levelA', function(match) {
            match().match(function(match) {

                match('/levelC').to(function() {
                    route.levelC = 'levelC';
                    console.log('levelC dash triggered');
                    //    Triggering when Leave Route
                }).leave(function() {
                    route.levelCLeaved = 'levelCLeaved';
                    console.log('levelC dash Leaved');
                    //    Triggering everytime params is changed
                }).query(function(params) {
                    route.query = params.getQuery();
                    console.log('query', params.getQuery());
                });
            });

        }).to(function() {
            route.levelA = 'levelA';
            console.log('levelA triggered')
        }).to(function() {
            route.levelACh = 'levelACh';
            console.log('levelA chained triggered')
        }).leave(function() {
            route.levelAleave = 'levelAleave';
        }).match(function(match) {
            var innerMatch = match('/levelR(/:id)').to(function(id) {
                route.levelR = 'levelR: ' + id;
                console.log('levelR triggered' + id);
                if (id === 'remove') {
                    innerMatch.remove();
                }
            });

        });

        var count = 0;
        match('/levelR').to(function() {
            route.levelTestR = 'levelR'

        }).leave(function(done) {
            setTimeout(function() {
                route.leavedR = 'not Triggered:' + count;
                done(count);
                count++;
            }, 300)
        });

        match('/levelS').to(function() {
            route.levelS = 'levelS'
        });

        var apply = false;
        match('/levelT', function(match) {
            match('/levelU').to(function() {
                route.levelTestU = 'levelU'
            }).leave(function(done) {
                if (apply) {
                    done(true);
                } else {
                    setTimeout(function() {
                        route.leavedU = 'not Triggered';
                        done(false);
                        apply = true;
                    }, 300);
                }
            });
        }).to(function() {
            route.levelTestT = 'levelT';
        }).leave(function(done) {
            if (apply) {
                done(true);
            } else {
                setTimeout(function() {
                    route.leavedT = 'not Triggered';
                    done(true);
                }, 200)
            }
        });

        match('/levelV').to(function() {
            route.levelV = 'levelV'
        });


        //Another setRoutes CF
        match('/levelC').setRoutes(function(routes) {
            routes.match('/levelF').to(function() {
                route.levelCF = 'levelCF'
                console.log('levelCF triggered');
            });
        });

        //TimeoutRoutes  setRoutes CF
        matchLevel = match('/levelD').to(function() {
            route.levelD = 'levelD'
            console.log('levelD triggered');

        });

        //optional Routes
        match('optional', function(match) {
            match('/page-:a(/:b)').to(function(a, b) {
                route.optionalA = a;
                route.optionalB = b;

            });
            match('file/*filename').to(function(filename) {
                route.filename = filename;
            })
        })

    });

    router.start();

    describe('url manager tests', function() {
        describe('Changeroutes', function() {
            describe('Static routes and lazy routes in ASC order', function() {

                it('levelD  route triggered should equal to levelD', function() {
                    router.trigger('/levelD/levelE');
                    expect(route).to.deep.equal({levelD: 'levelD'});
                });

                it('levelD/levelF lazy route triggered should equal to levelDF', function() {
                    router.trigger('/levelD/levelF');
                    matchLevel.setRoutes(function(routes) {
                        routes.match('/levelF').to(function() {
                            route.levelDF = 'levelDF'
                            console.log('levelDF triggered');
                        });
                    });
                    expect(route).to.deep.equal({levelDF: 'levelDF'});

                });

                it('levelD/levelE lazy route triggered after Timeout should equal to levelDE', function(done) {
                    setTimeout(function() {
                        router.trigger('/levelD/levelE');
                        matchLevel.setRoutes(function(routes) {
                            routes.match('/levelE').to(function() {
                                route.levelDE = 'levelDE'
                                console.log('levelDE triggered');
                            });
                        });
                        expect(route).to.deep.equal({levelDE: 'levelDE'});
                        done();
                    }, 200);

                });

                it('levelC/levelF lazy route triggered should equal to levelCF', function() {
                    router.trigger('/levelC/levelF/36');
                    expect(route).to.deep.equal({levelCF: 'levelCF'});

                });

                it('retrigger levelD/levelE lazy route triggered should equal to levelDE', function() {

                    router.trigger('/levelD/levelE');
                    expect(route).to.deep.equal({
                        levelD:  'levelD',
                        levelDE: 'levelDE'
                    });

                });

                it('levelA/levelR lazy route triggered should equal to levelR and id = 35', function() {
                    router.trigger('/levelA/levelR/35');
                    expect(route).to.deep.equal({
                        levelA:   'levelA',
                        levelACh: 'levelACh',
                        levelR:   'levelR: 35'
                    });

                });
                it('levelA/levelR lazy route triggered should equal to levelR and id = 36', function() {
                    router.trigger('/levelA/levelR/36');
                    expect(route).to.deep.equal({levelR: 'levelR: 36'});

                });
                it('levelA/levelR/remove Route should be removed and not trigger any more', function() {
                    router.trigger('/levelA/levelR/remove');
                    expect(route).to.deep.equal({
                        levelR: 'levelR: remove'
                    });

                    router.trigger('/levelA/levelR/48');
                    expect(route).to.deep.equal({
                        levelR: 'levelR: remove'
                    });

                });
                it('trigger \'/\' and Routes should be emtyed', function() {
                    router.trigger('/');
                    expect(route).to.deep.equal({levelAleave: 'levelAleave'});
                });
            });

            describe('Trigger queries in the routes', function() {

                it('levelA route triggered should equal to levelA levelACh', function() {
                    router.trigger('/levelA');
                    expect(route).to.deep.equal({levelA: 'levelA', levelACh: 'levelACh'});
                });

                it('levelA/levelC route triggered should equal to levelA levelACh and query should be {}', function() {
                    router.trigger('/levelA/levelC');
                    expect(route).to.deep.equal({
                        levelC: 'levelC',
                        query:  {}
                    });
                });
                it('levelA/levelC?a=5 route triggered query souldBe 5', function() {
                    router.trigger('/levelA/levelC?a=5');
                    expect(route.query).to.deep.equal({a: '5'});
                });

                it('levelA/levelC?a=6 route triggered query souldBe 6', function() {
                    router.trigger('/levelA/levelC?a=6');
                    expect(route.query).to.deep.equal({a: '6'});
                });
                it('levelA/levelC route triggered query souldBe {}', function() {
                    router.trigger('/levelA/levelC');
                    expect(route.query).to.deep.equal({});
                });

                it('levelA route triggered again should equal to LevelC Leaved', function() {
                    router.trigger('/levelA');
                    expect(route).to.deep.equal({levelCLeaved: 'levelCLeaved'});
                });

                it('levelR route triggered but Leave not accepted', function(done) {
                    router.trigger('/levelR');
                    expect(route).to.deep.equal({
                        levelTestR:  'levelR',
                        levelAleave: 'levelAleave'
                    });
                    var listener = router.setListener(function(location) {
                        expect(location).to.equal('/levelR');
                        listener.remove();
                    });
                    router.trigger('/levelS');

                    setTimeout(function() {
                        expect(route).to.deep.equal({
                            levelTestR:  'levelR',
                            leavedR:     'not Triggered:0',
                            levelAleave: 'levelAleave'
                        });
                        router.trigger('/levelS');
                        setTimeout(function() {
                            expect(route).to.deep.equal({
                                levelTestR:  'levelR',
                                leavedR:     'not Triggered:1',
                                levelAleave: 'levelAleave',
                                levelS:      'levelS'
                            });
                            done();
                        }, 310)
                    }, 310);

                });

                it('levelT/levelU route triggered but Leave not accepted', function(done) {
                    router.trigger('/levelT/levelU');

                    expect(route).to.deep.equal({levelTestT: 'levelT', levelTestU: 'levelU'});
                    var listener = router.setListener(function(location) {
                        expect(location).to.equal('/levelT/levelU');
                        listener.remove();
                    });

                    router.trigger('/levelV');
                    setTimeout(function() {

                        expect(route).to.deep.equal({
                            levelTestT: 'levelT',
                            levelTestU: 'levelU',
                            leavedT:    'not Triggered',
                            leavedU:    'not Triggered'
                        });
                        done();
                    }, 310);
                });
            });

            describe('Mixed Routes triggered in DESC Order', function() {
                it('levelB/a/b/c/list/35 route triggered', function() {
                    router.trigger('levelB/a/b/c/list/35');
                    var compare =
                    {
                        levelBEx:     'levelBEx',
                        levelB:       'levelB',
                        levelOptC:    {
                            a: 'a',
                            b: 'b',
                            c: 'c'
                        },
                        list:         'list',
                        listId:       '35',
                        listLocation: 'levelB/a/b/c/list'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/c/list/36 route triggered, only id is changed', function() {
                    router.trigger('levelB/a/b/c/list/36');
                    var compare =
                    {
                        listId:       '36',
                        listLocation: 'levelB/a/b/c/list',
                        listLeave:    'leave'
                    };

                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/c/table/36 route triggered, only id is changed', function(done) {
                    router.trigger('levelB/a/b/c/table/36');

                    setTimeout(function() {
                        var compare = {listLeavea: 'leave200', listLeave: 'leave'}
                        expect(route).to.deep.equal(compare)
                    }, 210);

                    setTimeout(function() {
                        var compare =
                        {
                            table:         'table',
                            tableLocation: 'levelB/a/b/c/table',
                            tableId:       '36',
                            listLeave:     'leave',
                            listLeavea:    'leave200',
                            listLeaveb:    'leave300',
                        };
                        expect(route).to.deep.equal(compare);
                        done();
                    }, 310);

                });
                it('levelB/a/b/c/table/35 route triggered, only id is changed', function() {
                    router.trigger('levelB/a/b/c/table/35');
                    var compare =
                    {
                        tableLocation: 'levelB/a/b/c/table',
                        tableId:       '35'
                    };

                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/d/table/35 route after levelB triggered', function() {
                    router.trigger('levelB/a/b/d/table/35');
                    var compare =
                    {
                        levelOptCLeave: 'leaved',
                        levelOptC:      {
                            a: 'a',
                            b: 'b',
                            c: 'd'
                        },
                        tableLocation:  'levelB/a/b/d/table',
                        table:          'table',
                        tableId:        '35'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/a/b/d route triggered, nothing changed', function() {
                    router.trigger('levelB/a/b/d');
                    var compare = {};
                    expect(route).to.deep.equal(compare);
                });
                it('levelB/ route triggered, nothing changed', function() {
                    router.trigger('levelB/');
                    var compare = {
                        levelOptCLeave: 'leaved',
                    };
                    expect(route).to.deep.equal(compare);
                });

            });

            describe('Optional Parameters', function() {
                it('optional/page-a route triggered, required param equals a, optional param equals null', function() {
                    router.trigger('optional/page-a');
                    var compare = {
                        optionalA: 'a',
                        optionalB: null
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('optional/page-a/b route triggered and a param not changed b equals b', function() {
                    router.trigger('optional/page-a/b');
                    var compare = {
                        optionalA: 'a',
                        optionalB: 'b'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('optional/page-c/d route triggered and both params are changed', function() {
                    router.trigger('optional/page-c/d');
                    var compare = {
                        optionalA: 'c',
                        optionalB: 'd'
                    };
                    expect(route).to.deep.equal(compare);
                });
                it('optional/file/path/to/file.txt route triggered full segment passed', function() {
                    router.trigger('optional/file/path/to/file.txt');
                    var compare = {
                        filename: 'path/to/file.txt'
                    };
                    expect(route).to.deep.equal(compare);
                });

            });

        });
        afterEach(function() {
            route = {};
        });
    });
}));
