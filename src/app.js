(function(){
	'use strict';
	window.onload = function() {
		var hangmanApp = angular.module('hangmanApp', ['ngComponentRouter']);

		hangmanApp.config(function($locationProvider) {
			$locationProvider.html5Mode(true);
		})
		.value('$routerRootComponent', 'newGame')
		.component('newGame', {
			templateUrl: 'ng-templates/template-new-game.html'
		});

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
			});
			$scope.setCategory = function(cat){
				$scope.category = cat;
			};
			$scope.startGame = function(){

			}
		});
		hangmanApp.directive('categoryButton', function() {
			return {
				restrict: 'E',
				scope: {
					key: '=',
					onClick: '&'
				},
				template: '<button class="btn btn-primary">{{key}}</button>',
				link: function(scope, element){
					element.on('click', function(){
						scope.onClick({category: scope.key});
					});
				}
			};
		});

		angular.bootstrap(document, ['hangmanApp']);
	};
})();