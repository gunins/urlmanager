define(['./MatchBinding'], function (MatchBinding) {
        function MatchBinder() {
            this.bindings = [];
        }

        MatchBinder.prototype.match = function (pattern, mapHandler) {
            var binding = this.getMatchBinding(pattern);
            this.bindings.push(binding);
            if (mapHandler) {
                var subBinder = this.getSubBinder();
                binding.setSubBinder(subBinder);
                mapHandler(subBinder.match.bind(subBinder));
            }
            return binding;
        };
        MatchBinder.prototype.getSubBinder = function () {
            return new MatchBinder();
        };
        MatchBinder.prototype.getMatchBinding = function (pattern) {
            return new MatchBinding(pattern);
        };
        MatchBinder.prototype.filter = function (location) {
            return this.bindings.filter(function (binding) {
                return binding.test(location);
            });
        };

    return MatchBinder;
});
