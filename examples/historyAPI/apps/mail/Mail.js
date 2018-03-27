define(["require", "exports", './Compose', './InboxRegion'], function (require, exports, Compose, InboxRegion) {
    function MailApp(builder) {
        var compose = builder.getLocation('mail/compose');
        var inbox = builder.getLocation('mail/inbox', false);
        var query = builder.getQuery();

        var container = document.getElementById('Container');
        container.innerHTML = (query.filter ? 'Filter: ' + query.filter : '') +
                              '<table class="mailApp" width="100%"><tr valign="top"><td width="150"><ul>' +
                              '<li><a data-local href="/' + compose + '">Compose</a></li>' + '<li><a data-local href="/' + inbox +
                              '">Inbox</a></li>' +
                              '</ul></td><td><div id="MailAppContent"><h1>Mail Application</h1></div></td></tr></table>';
    }

    function map(match) {
        match.to(MailApp);
        match.match(function(match) {
          match('/compose').to(Compose).leave(()=>document.getElementById('MailAppContent').innerHTML='');
        });
         match.match(InboxRegion);
    }

    exports.map = map;
});
