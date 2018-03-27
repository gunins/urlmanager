define(function() {
    function Mail(id, builder) {
        var data = {
            '0123456789': {
                from: 'Andrew Werber',
                subject: 'Hello Andrew'
            },
            'qwertyui': {
                from: 'Mat Connor',
                subject: 'This is Matt'
            }
        };
        var mail = data[id];
        var content = document.getElementById('MailAppContent');
        var query = builder.getQuery();

        content.innerHTML = '<div>' + '<div><b>From</b>: ' + mail.from + '</div>' + '<div><b>Subject</b>: ' + mail.subject + '</div>' + (query.filter ? '<div><b>Filter</b>: ' + query.filter + '</div>' : '') + '</div>';
    }

    
    return Mail;
});
