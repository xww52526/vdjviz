(function () {
    var app = angular.module('databaseSearch', []);

    app.directive('database', function() {
        return {
            restrict: 'E',
            controller: ['$rootScope','$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

                //public variables
                $scope.showAdditionalInfo = showAdditionalInfo;
                $scope.hideAdditionalInfo = hideAdditionalInfo;
                $scope.isAdditionalInfo = isAdditionalInfo;
                $scope.searchInput = searchInput;
                $scope.isMainInfo = isMainInfo;
                $scope.isValid = isValid;
                $scope.searchResult = [];
                $scope.additionalInfo = {
                    data: null,
                    show: false
                };
                $rootScope.$on('$locationChangeSuccess', function() {
                    var newInfo = $location.search().info;
                    if (typeof newInfo === 'undefined') {
                        hideAdditionalInfo();
                    }
                });

                //Initializing
                var input = $location.search().input;
                if (typeof input == 'string') {
                    $scope.input = input;
                    searchInput();
                } else {
                    $scope.input = 'CASSLAPGATNEKLFF';
                }

                function isValid() {
                    var regexp = /^[FLSYCWPHQRIMTNKVADEG]+$/;
                    return regexp.test($scope.input);
                }

                function showAdditionalInfo(result) {
                    $scope.additionalInfo.data = result;
                    $location.search('info', result.hash);
                    $scope.additionalInfo.show = true;
                }

                function searchInput() {
                    $http.post('/database/api/search', { input: $scope.input })
                        .success(function(data) {
                            $location.search('input', $scope.input);
                            var info = $location.search().info;
                            $scope.searchResult = data;
                            angular.forEach(data, function(result) {
                                if (result.hash == info) {
                                    showAdditionalInfo(result);
                                }
                            })
                        })
                        .error(function() {
                        })
                }

                function hideAdditionalInfo() {
                    $location.search('info', null);
                    $scope.additionalInfo.show = false;
                }

                function isAdditionalInfo() {
                    return $scope.additionalInfo.show;
                }

                function isMainInfo() {
                    return !$scope.additionalInfo.show;
                }
            }]
        }
    })
})();

function loading(place) {
    var d3Place = d3.select(place);
    d3Place.style("display", "block");
    var loading = d3Place.append("div").attr("class", "loading");
    loading.append("div").attr("class", "wBall").attr("id", "wBall_1").append("div").attr("class", "wInnerBall");
    loading.append("div").attr("class", "wBall").attr("id", "wBall_2").append("div").attr("class", "wInnerBall");
    loading.append("div").attr("class", "wBall").attr("id", "wBall_3").append("div").attr("class", "wInnerBall");
    loading.append("div").attr("class", "wBall").attr("id", "wBall_4").append("div").attr("class", "wInnerBall");
    loading.append("div").attr("class", "wBall").attr("id", "wBall_5").append("div").attr("class", "wInnerBall");
}

function loaded(place) {
    d3.select(place)
        .select(".loading")
        .remove();
}