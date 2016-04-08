define(["require", "exports"], function(require, exports) {
    function Inbox(builder) {
        var first = builder.getLocation('/email/0123456789', {
            filter: 1
        });

        var second = builder.getLocation('/email/qwertyui', {
            filter: 2
        });

        var content = document.getElementById('MailAppContent');
        content.innerHTML = '<div><h1>Inbox</h1><ul>' + '<li><a href="#' + first + '">Andrew Werber</a></li>' + '<li><a href="#' + second + '">Mat Connor</a></li>' + '</ul></div>';
    }

    
    return Inbox;
});
