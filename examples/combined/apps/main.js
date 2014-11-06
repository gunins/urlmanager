var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(['./mail/Mail', './settings/Settings', './app/App', '../common/Application'], function(Mail, Settings, App, Application) {
    var MyApplication = (function (_super) {
        __extends(MyApplication, _super);
        function MyApplication() {
            _super.apply(this, arguments);
        }
        MyApplication.prototype.run = function () {
            _super.prototype.run.call(this);

            this.router.match(function (match) {
                match('mail', Mail.map);
                match('app', App.map);
                match('settings', Settings.map);
            });

            window.addEventListener('hashchange', this.onHashChange.bind(this), false);
            this.onHashChange();
        };

        MyApplication.prototype.onHashChange = function () {
            var match = window.location.href.match(/#(.*)$/);
            this.router.trigger(match ? match[1] : '');
        };
        return MyApplication;
    })(Application);

    
    return MyApplication;
});
