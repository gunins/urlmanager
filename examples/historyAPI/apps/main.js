var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) {
        d[p] = b[p];
    }

    function __() {
        this.constructor = d;
    }

    __.prototype = b.prototype;
    d.prototype  = new __();
};
define([
           './mail/Mail', './settings/Settings', './app/App', '../common/Application'
       ], function (Mail, Settings, App, Application) {
    class MyApplication extends Application {
        run() {
            super.run();
            this.router.match(function (match) {
                Mail.map(match('/mail'));
                App.map(match('/app'));
                Settings.map(match('/settings'));
            });

            const onHashChange = () => {
                this.router.trigger(window.location.pathname);
            };

            window.addEventListener('popstate', () => onHashChange());

            document.body.addEventListener('click', (e) => {
                const {target} = e;
                if (target.tagName === 'A') {
                    e.preventDefault();
                    history.pushState({}, '', target.getAttribute('href'));
                    onHashChange();
                }
            });

            onHashChange();
        }


    }

    return MyApplication;
});
