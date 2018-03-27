define([
           './mail/Mail', './settings/Settings', './app/App', '../common/Application'
       ], function (Mail, Settings, App, Application) {
    class MyApplication extends Application {
        run() {
            super.run();
            const {router} = this;
            router.match(function (match) {
                Mail.map(match('/mail'));
                App.map(match('/app'));
                Settings.map(match('/settings'));
            });

            const onHashChange = () => router.trigger(window.location.pathname);

            window.addEventListener('popstate', () => onHashChange());

            document.body.addEventListener('click', (e) => {
                const {target} = e;
                if (target.dataset.local !== undefined) {
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
