define(['./inbox/Inbox', './inbox/EMail'], function(Inbox, EMail) {

    function InboxRegion(match) {
        match('inbox').to(Inbox);
        match('email(/:id)').to(EMail);
    }

    return InboxRegion;
});
