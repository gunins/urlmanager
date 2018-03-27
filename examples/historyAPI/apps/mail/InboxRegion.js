define(['./inbox/Inbox', './inbox/EMail'], function(Inbox, EMail) {

    function InboxRegion(match) {
        match('inbox').to(Inbox).leave(()=>document.getElementById('MailAppContent').innerHTML='');
        match('email(/:id)').to(EMail).leave(()=>document.getElementById('MailAppContent').innerHTML='');
    }
    return InboxRegion;
});
