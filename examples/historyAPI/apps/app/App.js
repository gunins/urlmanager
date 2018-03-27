define(["require", "exports"], function(require, exports) {
    function AppHandler(id) {
        var container = document.getElementById('Container');
        container.innerHTML = '<div class="app"><h1>Application</h1><div id="MailAppContent"></div></div>';
    }

    function map(match) {
        match.to(AppHandler);
    }
    exports.map = map;
});
