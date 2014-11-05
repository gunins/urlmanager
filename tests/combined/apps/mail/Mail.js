define(["require", "exports", './Compose', './InboxRegion'], function (require, exports, Compose, InboxRegion) {
    function MailApp(builder) {
        var compose = builder.getLocation('/compose');
        var inbox = builder.getLocation('/inbox', false);
        var query = builder.getQuery();

        var container = document.getElementById('Container');
        container.innerHTML = (query.filter ? 'Filter: ' + query.filter : '') +
                              '<table class="mailApp" width="100%"><tr valign="top"><td width="150"><ul>' +
                              '<li><a href="#' + compose + '">Compose</a></li>' + '<li><a href="#' + inbox +
                              '">Inbox</a></li>' +
                              '</ul></td><td><div id="MailAppContent"><h1>Mail Application</h1></div></td></tr></table>';
    }

    function map(match) {
        match('(/)').to(MailApp);
        match('/compose').to(Compose);
        match('/inbox', InboxRegion);
    }

    exports.map = map;
});
