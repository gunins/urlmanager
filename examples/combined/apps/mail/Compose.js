define(["require", "exports"], function(require, exports) {
    function Compose() {
        var content = document.getElementById('MailAppContent');
        content.innerHTML = '<div>' + '<div>To: <input></div>' + '<div><textarea></textarea></div>' + '</div>';
    }

    
    return Compose;
});
