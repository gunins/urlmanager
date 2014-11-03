define(["require", "exports", './inbox/Inbox', './inbox/EMail'], function(require, exports, Inbox, EMail) {
    function InboxRegion(route) {
        route.match('(/)').to(Inbox);
        route.match('/:id').to(EMail);
        route.run();
    }

    
    return InboxRegion;
});
