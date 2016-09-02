(function(){
	'use strict';
	window.onload = function() {
		var hangmanApp = angular.module('hangmanApp', []);
		hangmanApp.factory('conundrums', function($http){
			return {
				getData: function(callback){
					$http.get('data/data.json').success(callback);
				}
			};
		});
		hangmanApp.controller('HangmanParentController', function ($scope, conundrums){
			conundrums.getData(function(data) {
				$scope.conundrums = data;
				$scope.category = '';
			});
		});
		hangmanApp.directive('categoryButton', function() {
			return {
				restrict: 'E',
				scope: {
					key: '=',
					click: '&'
				},
				template: '<button class="btn btn-primary">{{key}}</button>'
			};
		});

		angular.bootstrap(document, ['hangmanApp']);
	};
})();