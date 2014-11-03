define(["require", "exports"], function(require, exports) {
    function SettingsHandler() {
        var container = document.getElementById('Container');
        container.innerHTML = '<div class="settings"><h1>Settings</h1></div>';
    }

    function map(match) {
        match('(/)').to(SettingsHandler);
    }
    exports.map = map;
});
