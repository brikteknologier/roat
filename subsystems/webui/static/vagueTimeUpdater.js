document.addEventListener("DOMContentLoaded", function(event) {
    var elements = document.getElementsByClassName("vagueTime");

    for (var i = 0; i < elements.length; ++i) {
        watchElement(elements[i]);
    }

    function watchElement(element) {
        var since = new Date(element.getAttribute("data-since"));

        function update() {
            var now = new Date();
            var results = vagueTime.get({
                from: now,
                to: since,
                remaining: true
            });
            element.innerText = results.timeString;
            setTimeout(update, results.remaining);
        }
        update();
    }
});
