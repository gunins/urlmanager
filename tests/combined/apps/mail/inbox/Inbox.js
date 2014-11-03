define(["require", "exports"], function(require, exports) {
    function Inbox(builder) {
        var first = builder.getLocation('/0123456789', {
            filter: 1
        });

        var second = builder.getLocation('/qwertyui', {
            filter: 2
        });

        var content = document.getElementById('MailAppContent');
        content.innerHTML = '<div><h1>Inbox</h1><ul>' + '<li><a href="#' + first + '">John Smith, Second Mail</a></li>' + '<li><a href="#' + second + '">Saturn Plato, First Mail</a></li>' + '</ul></div>';
    }

    
    return Inbox;
});
