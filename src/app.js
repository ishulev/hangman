(function(){
	'use strict';
	window.onload = function() {
		var hangmanApp = angular.module('hangmanApp', ['ngComponentRouter']);

		hangmanApp.config(function($locationProvider) {
			$locationProvider.html5Mode(true);
		})
		.value('$routerRootComponent', 'newGame')
		.component('newGame', {
			templateUrl: 'ng-templates/template-new-game.html',
			bindings: {
				categories: '<',
				multiplayer: '<',
				missingNumbers: '<',
				setNumOfWords: '&',
				setNumOfPlayers: '&',
				setCategory: '&'
			}
		})
		.component('gameComponent', {
			templateUrl: 'ng-templates/template-game-component.html',
			bindings: {
				selectedData: '<'
			},
			controller: function(){
				var randomWordIndex = Math.floor(Math.random() * (this.selectedData.length));
				this.hangmanPhase = 0;
				this.currentWord = this.selectedData[randomWordIndex];
			}
		})
		.component('wordComponent', {
			templateUrl: 'ng-templates/template-word-component.html',
			bindings: {
				wordObject: '<'
			},
			controller: function(){
			}
		})
		.component('scribbleComponent', {
			templateUrl: 'ng-templates/template-scribble-component.html',
			bindings: {
				answer: '<'
			},
			controller: function(){
				this.scribble = this.answer.split('');
			}
		});

		hangmanApp.factory('conundrums', function($http){
			return {
				getData: function(callback){
					$http.get('data/data.json').success(callback);
				}
			};
		});
		hangmanApp.filter('singleOrNot', function() {
			return function(input, multiplayer) {
				input = input || '';
				var out = '';
				if (!multiplayer) {
					out = 'Multiplayer';
				}
				else {
					out = 'Singleplayer';
				}
				return out;
			};
		})
		hangmanApp.controller('HangmanParentController', function ($scope, conundrums){
			var completeData;
			$scope.categories = [];
			$scope.multiplayer = false;
			$scope.numOfWords = 0;
			$scope.numOfPlayers = 0;
			$scope.missingNumbers = false;
			$scope.startGameState = true;
			conundrums.getData(function(data) {
				completeData = data;
				$scope.categories = Object.keys(data);
			});

			$scope.setCategory = function(cat){
				$scope.category = cat;
			};
			$scope.setNumOfWords = function(event){
				$scope.numOfWords = event.target.valueAsNumber;
			};
			$scope.setNumOfPlayers = function(event){
				$scope.numOfPlayers = event.target.valueAsNumber;
			};
			$scope.startGame = function(){
				if(this.multiplayer){
					if(this.numOfWords === 0 || this.numOfPlayers === 0){
						this.missingNumbers = true;
						return;
					}
					else {
						this.missingNumbers = false;
					}
				}
				this.selectedData = completeData[this.category];
				this.startGameState = false;
			}
		});
		hangmanApp.directive('categoryButton', function() {
			return {
				restrict: 'E',
				scope: {
					key: '=',
					onClick: '&'
				},
				require: '^^newGame',
				replace: true,
				template: '<button class="btn">{{key}}</button>',
				link: function(scope, element, attrs, parentCtrl){
					element.on('click', function(){
						element.parent().children().removeClass('btn-primary');
						element.addClass('btn-primary');
						parentCtrl.setCategory({category: scope.key});
					});
				}
			};
		});

		angular.bootstrap(document, ['hangmanApp']);
	};
})();