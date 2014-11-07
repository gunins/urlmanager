define([ './inbox/Inbox', './inbox/EMail'], function (Inbox, EMail) {

    function InboxRegion(match) {
        match('(/)').to(Inbox);
        match('/:id').to(EMail);
    }

    return InboxRegion;
});
