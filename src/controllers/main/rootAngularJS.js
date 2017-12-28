/**
 * Created by danihbelan on 26/12/2017.
 */

var myApp = angular.module('myApp', ['md.data.table', 'ngMaterial', 'ngMessages', 'ngRoute', 'mp.autoFocus',
	'chart.js', 'ngLodash', 'angularMoment', 'ngFileUpload', 'ngImgCrop', 'mdPickers', 'ngCsvImport']);
/**
 * Definimos los colores que vamos a utilizar https://material.angularjs.org/0.10.0/#/Theming/03_configuring_a_theme
 */
myApp.config(['$mdThemingProvider', '$mdDateLocaleProvider','moment',
	function($mdThemingProvider, $mdDateLocaleProvider, moment) {
		$mdThemingProvider.theme('default')
			.primaryPalette('teal',{
				'default':'500',
				'hue-1': '100'
			})
			.accentPalette('deep-orange');
		
		moment.locale('es');
		moment.utc();
/*
		$mdDateLocaleProvider.formatDate = function (date) {
			console.log(moment().utcOffset());
			return date ? moment(date).format('DD-MM-YYYY') : '';
		};
*/

	}
]);

/**
 * Filtro para hacer ellipsize
 *  Param 1: True/false si se quiere que termine la palabra
 *  Param 2: Number. Numero de caracteres antes del ellipsize
 *      ej: {{variable|cut:true:100}}
 */
myApp.filter('cut', function cut() {
	return function (value, wordwise, max, tail) {
		if (!value) return '';

		max = parseInt(max, 10);
		if (!max) return value;
		if (value.length <= max) return value;

		value = value.substr(0, max);
		if (wordwise) {
			var lastspace = value.lastIndexOf(' ');
			if (lastspace != -1) {
				value = value.substr(0, lastspace);
			}
		}

		return value + (tail || ' …');
	};
});

myApp.directive('onReadSheet',['$parse', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
			var fn = $parse(attrs.onReadSheet);

			element.on('change', function(onChangeEvent) {
				var reader = new FileReader();
				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, {$fileContent:onLoadEvent.target.result});
					});
				};

				reader.readAsBinaryString((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
}]);

/**
 * Filtro que elimina los acentos
 */
myApp.filter('removeAccents', function removeAccents() {
	return function (source) {
		var accent = [
				/[\300-\306]/g, /[\340-\346]/g, // A, a
				/[\310-\313]/g, /[\350-\353]/g, // E, e
				/[\314-\317]/g, /[\354-\357]/g, // I, i
				/[\322-\330]/g, /[\362-\370]/g, // O, o
				/[\331-\334]/g, /[\371-\374]/g, // U, u
				/[\321]/g, /[\361]/g, // N, n
				/[\307]/g, /[\347]/g, // C, c
			],
			noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

		for (var i = 0; i < accent.length; i++){
			source = source.replace(accent[i], noaccent[i]);
		}

		return source;
	};
});

myApp.filter('listFilter', function listFilter() {
	return function (source) {
		var accent = [
				/[\300-\306]/g, /[\340-\346]/g, // A, a
				/[\310-\313]/g, /[\350-\353]/g, // E, e
				/[\314-\317]/g, /[\354-\357]/g, // I, i
				/[\322-\330]/g, /[\362-\370]/g, // O, o
				/[\331-\334]/g, /[\371-\374]/g, // U, u
				/[\321]/g, /[\361]/g, // N, n
				/[\307]/g, /[\347]/g, // C, c
			],
			noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

		for (var i = 0; i < accent.length; i++){
			source = source.replace(accent[i], noaccent[i]);
		}

		return source;
	};
})


myApp.directive('cajalTable', cajalTable);
function cajalTable(){
	function Controller($scope) {
		this.getCtrl = function() {
			return $scope.ctrlTable;
		};

	}

	function postLink (scope, elem, attrs) {}

	Controller.$inject = ['$scope'];

	return {
		template : '<div ng-transclude></div>',
		restrict : "E",
		transclude:true,
		controller: Controller,
		controllerAs: '$cajalTable',
		link : postLink,

		//Scope exclusivas de la directiva
		scope:{
			ctrlTable: '=',
		}
	}
};

/**
 * Directiva que devuelve un toolbar para controlar una tabla
 * Este toolbar contiene un buscador, añadir y actualizar.
 * Los parametros los recibe del objeto ControlTable
 */
myApp.directive('cajalToolbar', cajalToolbar);
function cajalToolbar(){
	var template =  '<div>' +
		'<h4 ng-if="!ctrlTable.arrayTotal.length" class="md-padding palette-Red-800 text">{{noDataMsg}}</h4>'+
		'<p>{{clickAdd}}</p>'+
		'<md-toolbar ng-if="!modeToolbarSearch" class="md-table-toolbar md-default">'+
		'<div class="md-toolbar-tools"><span>{{label}}</span>'+
		'<div flex="flex"></div>'+
		'<button ng-if="canSearch" ng-click="changeModeToolbar(true)" aria-label="Buscar" class="md-icon-button md-button">'+
		'<md-icon md-svg-src="/artwork/ic_search.svg"></md-icon>'+
		'</button>'+
		'<button ng-if="clickAdd" ng-click="clickAdd()" aria-label="Crear competencia" class="md-icon-button md-button">'+
		'<md-icon md-svg-src="/artwork/ic_add.svg"></md-icon>'+
		'</button>'+
		'<button ng-if="clickUpdate" ng-click="clickUpdate()" aria-label="Actualizar datos" class="md-icon-button md-button">'+
		'<md-icon md-svg-src="/artwork/ic_update.svg"></md-icon>'+
		'</button>'+
		'</div>'+
		'</md-toolbar>'+
		'<md-toolbar ng-if="modeToolbarSearch" class="md-table-toolbar md-default">'+
		'<div class="md-toolbar-tools">'+
		'<md-icon md-svg-src="/artwork/ic_search.svg"></md-icon>'+
		'<form flex="flex">'+
		'<input flex="flex" ng-model="ctrlTable.searchText" placeholder="{{placeholder}}" auto-focus="auto-focus" ng-change="ctrlTable.filterDisplay()"/>'+
		'</form>'+
		'<button ng-click="changeModeToolbar(false)" aria-label="Cerrar" class="md-icon-button md-button">'+
		'<md-icon md-svg-src="/artwork/ic_close_black_toolbar.svg"></md-icon>'+
		'</button>'+
		'</div>'+
		'</md-toolbar>'+
		'</div>';

	function postLink(scope, element, attrs, parentCtrl) {
		scope.ctrlTable = parentCtrl.getCtrl();
	}

	function Controller($scope) {
		$scope.modeToolbarSearch = false;
		$scope.searchText = "";
		$scope.noDataMsg = $scope.noDataMsg || "Sin registros";

		$scope.changeModeToolbar = function(mode){
			$scope.modeToolbarSearch = mode;
			if (mode === false) {
				$scope.ctrlTable.searchText = "";
				if ($scope.ctrlTable.arrayTotal.length != $scope.ctrlTable.arrayFiltered.length)
					$scope.ctrlTable.filterDisplay();
			}
		};
	}
	Controller.$inject = ['$scope'];

	return {
		restrict : "E",
		require: '^cajalTable',
		template : template,
		controller: Controller,
		link : postLink,
		//Scope exclusivas de la directiva
		scope:{
			label: '@', // es lo mismo que poner '@label' @ indica atributo
			placeholder : '@searchPlaceholder',
			canSearch : '@',
			clickAdd : '=',
			clickUpdate : '=',
			noDataMsg : '@'
		}
	}
};

myApp.directive('cajalFooter', cajalFooter);
function cajalFooter() {
	function postLink(scope, element, attrs, parentCtrl) {
		scope.ctrlTable = parentCtrl.getCtrl();
	}

	function Controller($scope) {
		if (!$scope.label) {
			$scope.label = {
				page: "Página:",
				rowsPerPage: "Filas por página",
				of: "de"
			}
		}

		$scope.onPagination = function(page, currentLimit){
			$scope.ctrlTable.page = page;
			$scope.ctrlTable.limit = currentLimit;
			$scope.ctrlTable.filterDisplay();
		}

	}
	Controller.$inject = ['$scope'];

	var template = '' +
		'<md-table-pagination ' +
		'ng-if="ctrlTable.arrayTotal.length"' +
		'md-limit="ctrlTable.limit" ' +
		'md-page="ctrlTable.page" ' +
		'md-total="{{ctrlTable.arrayFiltered.length}}" ' +
		'md-options="ctrlTable.limitOptions" ' +
		'md-label="{{label}}" ' +
		'md-on-paginate = "onPagination" ' +
		'md-boundary-links="boundaryLinks">' +
		'</md-table-pagination>';

	return {
		restrict: "E",
		require: '^cajalTable',
		template: template,
		scope: {
			boundaryLinks: '@',
			label: '@'
		},
		link: postLink,
		controller: Controller
	}
}

myApp.directive('cajalData', cajalData);
function cajalData() {
	function postLink(scope, element, attrs, parentCtrl) {
		scope.ctrlTable = parentCtrl.getCtrl();

		if(scope.rowSelect)
			scope.ctrlTable.listenRowSelected = scope.rowSelect;
	}

	function Controller($scope) {
		this.getCtrl = function() {
			return $scope.ctrlTabctrlTable;
		};
	}
	Controller.$inject = ['$scope'];

	var template = '<md-table-container ng-if="ctrlTable.arrayTotal.length">' +
		'<div ng-transclude></div>'+
		'</md-table-container>';

	return {
		restrict: "E",
		require: '^cajalTable',
		template: template,
		transclude : true,
		scope: {
			'rowSelect' : '=?'
		},
		link: postLink,
		controller: Controller
	}
}
/**
 * La lista de entrada debe ser
 * La lista o array de entrada cada elemento debe ser:
 * {
 *      nameDisplay: ...,
 *      ...
 *      {propChild}:[
 *          {
 *              nameDisplay:...,
 *              {propLeft}: true/false,
 *              ...
 *          },
 *          ...
 *      ]
 * }
 */
myApp.directive('dual', dual);
function dual(){
	function Controller($scope) {
		$scope.listLeft = [];
		$scope.listRight = [];
		var copyData = [];
		var checkedLeft = {};
		var checkedRight = {};

		if($scope.toggleLeft ==null){
			$scope.toggleLeft = false;
		}

		if($scope.toggleRight == null){
			$scope.toggleRight = false;
		}

		if($scope.labelSave == null){
			$scope.labelSave = "Guardar cambios";
		}

		/**
		 * Checkea o descheckea todos lo items de un grupo. Si los items se checkea
		 * automaticamente se abre el toggle del grupo
		 *
		 * @param group     Grupo al que pertenece
		 * @param left      True si es la lista de la izquierda
		 * @param checked   Indica si se van a checkear o no
		 */
		$scope.checkAll = function(group, left, checked){
			if(checked){
				if(left){
					group.toggleLeft = true;
				}else{
					group.toggleRight = true;
				}
			}


			for(var i=0; i<group.childs.length; i++){
				if(group.childs[i].item[$scope.propLeft] == left){
					group.childs[i].checked = checked;

					//metemos el item en la checklist de la derecha o izquieda
					if(group.childs[i].item[$scope.propLeft]){
						checkedLeft[group.childs[i].$$hashKey] = group.childs[i]
					}else{
						checkedRight[group.childs[i].$$hashKey] = group.childs[i]
					}

				}
			}
		};

		$scope.search = function(text, left){
			var listScope = left ? $scope.listLeft : $scope.listRight;
			var atLeastOne;
			var cleanedSearch = removeAccent(text.toLowerCase());
			var cleanedName;

			angular.forEach(listScope, function(group) {
				atLeastOne = false;

				angular.forEach(group.childs, function(child) {
					cleanedName = removeAccent(child.nameDisplay.toLowerCase());
					if(cleanedName.indexOf(cleanedSearch) != -1) {
						atLeastOne = true;
						child.hide = false;
					}else{
						child.hide = true;
					}
				});

				if(atLeastOne){
					group.hide = false;
					group.toggle = true;
				}else{
					group.hide = true;
				}
			});
		}

		/**
		 * Checkea un item individual y lo introduce en el array donde se cuentan los item
		 * con los que el usuario ha interaccionado
		 *
		 * @param item  Item con el que se ha interaccionado
		 */
		$scope.checkItem = function(group, item, left){
			var checked = item.checked;
			var listChecked = left ? checkedLeft : checkedRight

			if(checked){
				listChecked[group.idHead] = listChecked[group.idHead]|| {};
				listChecked[group.idHead][item.idChild] = item;

			}else{
				delete listChecked[group.idHead][item.idChild];
				if(countProperties(listChecked[group.idHead])== 0){
					delete listChecked[group.idHead];
				}
			}
		};

		/**
		 * Pasa los items chekados de izquierda a derecha.
		 *
		 * Deselecciona todos los items asi como limpia la lista de items seleccionados
		 */
		$scope.push = function(left){
			var checkedList = left ? checkedLeft : checkedRight;
			var origin = left ? $scope.listLeft : $scope.listRight;
			var destin = left ? $scope.listRight : $scope.listLeft;
			var pairs = [];

			angular.forEach(checkedList, function(head, idHead){
				angular.forEach(head, function(child, idChild){
					pairs.push({idHead: idHead,idChild: idChild});
				});
			});

			var item;
			var pair;
			for(var i =0; i<pairs.length; i++){
				pair = pairs[i];
				item = origin[pair.idHead].childs[pair.idChild];
				item.checked = false;

				//Si esta vacio esa cabecera la creamos
				if(!destin[pair.idHead]){
					destin[pair.idHead] = clone(origin[pair.idHead]);
					destin[pair.idHead].childs = {};
				}
				destin[pair.idHead].childs[pair.idChild] = item;

				// Eliminamos de la lista original el item
				delete origin[pair.idHead].childs[pair.idChild];
				if(countProperties(origin[pair.idHead].childs) == 0){
					delete origin[pair.idHead];
				}
			}

			// reiniciamos el array de checked
			if(left){
				checkedLeft = {};
			}else{
				checkedRight = {};
			}

		};



		$scope.save = function(){
			var idsLeft = [];
			//TODO mejorar para que solo se busquen los que han cambiado
			//recorremos el array de cada lista y obtenemos los ids de los hijos
			angular.forEach($scope.listLeft, function(head) {
				angular.forEach(head.childs, function(child) {
					idsLeft.push(child.idRef);
				});
			});

			angular.forEach(copyData, function(head) {
				angular.forEach(head[$scope.propChild], function(child) {
					child[$scope.propLeft] = !!idsLeft.indexOf(child.idChild);
				});
			});

			$scope.onSave(copyData);

		};

		/**
		 * De una lista pasa a dos listas, una la de la derecha y otra la de la izquierda
		 *
		 * En un array llamado "copyData" contiene una copia exacta del array inicial con la
		 * diferencia de que los hijos y los padres estan referenciados con un idChild o idHead
		 * respectivamente. Esto servira para que al guardar devolvamos un array como el inicial
		 * pero con los items cambiados
		 *
		 * Cada item de las dos listas será:
		 * idHead:{
         *      nameDisplay: ...,
         *      toggle: true/false,
         *      idHead: idHead
         *      childs:[
         *          idChild:{
         *              nameDisplay: ...
         *              idChild:idChild
         *          },
         *          ...
         *      ]
         * }
		 *
		 * @param {object[]}array       Array de entrada(Descrito en la cabecera de esta funcion)
		 * @param {string}propChild     Nombre de la etiqueta hijos
		 * @param {string}propLeft      Nombre de la etiqueta que indica si va o no en la columna izquierda
		 * @param {boolean}toggleLeft   True si deben estar desplegados los elementos de la izquierda
		 * @param {boolean}toggleRight  True si deben estar desplegados los elementos de la derecha
		 */
		$scope.importData =  function(array, propChild, propLeft, toggleLeft, toggleRight){
			var outputLeft = {};
			var outputRight = {};
			var groupLeft, groupRight;

			angular.forEach(array, function(head) {
				groupLeft = {toggle: toggleLeft,
					nameDisplay : head.nameDisplay,
					idHead : head.idHead,
					childs : {}
				};
				groupRight = {toggle: toggleRight,
					nameDisplay : head.nameDisplay,
					childs : {},
					idHead : head.idHead
				};

				angular.forEach(head[propChild], function(child) {
					if(child[propLeft] == true){
						groupLeft.childs[child.idChild] = child;
					}else{
						groupRight.childs[child.idChild] = child;
					}
				});

				if(countProperties(groupLeft.childs) > 0){
					outputLeft[head.idHead+""] = groupLeft;
				}

				if(countProperties(groupRight.childs) > 0){
					outputRight[head.idHead+""] = groupRight;
				}

			});

			$scope.listLeft = outputLeft;
			$scope.listRight = outputRight;

		};

		/**
		 * Ponemos un watcher para actualizar el "array" en las listas.
		 *
		 * Cada vez que se ejecuta creamos un array nuevo "copyData" que contienelos elementos
		 * del array junto con un id arbitrario a cada padre e hijo
		 */
		$scope.$watchCollection('array', function() {
			copyData = clone($scope.array);
			var idHead = 1;
			var idChild = 1;

			//Marco los nuevo items que llegan
			angular.forEach(copyData, function(head) {
				head.idHead = idHead
				idHead++;
				angular.forEach(head[$scope.propChild], function(child) {
					child.idChild = idChild;
					idChild++;
				})
			});

			$scope.importData(copyData,$scope.propChild,$scope.propLeft,
				$scope.toggleLeft, $scope.toggleRight);
		});

		function removeAccent(source) {
			var accent = [
					/[\300-\306]/g, /[\340-\346]/g, // A, a
					/[\310-\313]/g, /[\350-\353]/g, // E, e
					/[\314-\317]/g, /[\354-\357]/g, // I, i
					/[\322-\330]/g, /[\362-\370]/g, // O, o
					/[\331-\334]/g, /[\371-\374]/g, // U, u
					/[\321]/g, /[\361]/g, // N, n
					/[\307]/g, /[\347]/g, // C, c
				],
				noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

			for (var i = 0; i < accent.length; i++){
				source = source.replace(accent[i], noaccent[i]);
			}

			return source;
		}

		function countProperties(obj){
			var  i=0 ;
			for(var key in obj){
				if(obj.hasOwnProperty(key)){
					i++
				}
			}

			return i;
		}


	}
	Controller.$inject = ['$scope'];

	var template = '<div layout="row"><div md-whiteframe="md-whiteframe" flex="flex"><div class="padding-24 header-dual-list"><span flex="flex">{{labelLeft}}</span></div><md-divider></md-divider><div class="padding-24"><div><input flex="flex" placeholder="Buscar" ng-model="searchLeft" ng-change="search(searchLeft, true)" maxlength="25" class="input-search"/></div><div ng-repeat="group in list" ng-if="atLeastOneItem(group, true)"><div layout="row" layout-align="start center" class="selectingRow"><p ng-click="group.toggleLeft = !group.toggleLeft" flex="flex" class="no-margin padding-16-v">{{group.head.nameDisplay}}</p></div><div ng-show="group.toggleLeft" ng-repeat="item in group.childs" ng-if="item.item[propLeft] &amp;&amp; isSearched(group, searchLeft, item)"><p>{{item.nameDisplay}}</p></div></div></div></div><div layout="column" layout-align="center center"><md-button ng-click="pushLeft()" class="md-raised md-primary">></md-button><md-button ng-click="pushRight()" class="md-raised md-primary"><</md-button></div><div md-whiteframe="md-whiteframe" flex="flex"><div class="padding-24 header-dual-list"><span flex="flex">{{labelRight}}</span></div><md-divider></md-divider><div class="padding-24"><div><input flex="flex" placeholder="Buscar" ng-model="searchRight" maxlength="25" class="input-search"/></div><div ng-repeat="group in list" ng-if="atLeastOneItem(group, false)"><div layout="row" layout-align="start center" class="selectingRow"><p ng-click="group.toggleRight = !group.toggleRight" flex="flex" class="no-margin padding-16-v">{{group.head.nameDisplay}}</p></div><div ng-show="group.toggleRight" ng-repeat="item in group.childs" ng-if="!item.item[propLeft] &amp;&amp; isSearched(group, searchRight, item)"><p>{{item.nameDisplay}}</p></div></div></div></div></div>';

	return {
		restrict: "E",
		templateUrl: "/directives/coordinator/duallist",
		scope: {
			'array' : '=ngModel',
			'propChild' : '=',
			'propLeft' : '=',
			'toggleLeft' : '=?',
			'toggleRight' : '=?',
			'labelLeft' : '@',
			'labelRight' : '@',
			'labelSave' : '@?',
			'onSave' : '='

		},
		controller: Controller
	}
}

/**
 * La lista de entrada debe ser
 * La lista o array de entrada cada elemento debe ser:
 * {
 *      nameDisplay: ...,
 *      ...
 *      {propChild}:[
 *          {
 *              nameDisplay:...,
 *              {propLeft}: true/false,
 *              ...
 *          },
 *          ...
 *      ]
 * }
 */
myApp.directive('dualTree', dualTree);
function dualTree(){
	function Controller($scope) {
		$scope.listLeft = [];
		$scope.listRight = [];
		var copyData = [];
		var listCheckedRight = {};
		var listCheckedLeft = {};
		var groupClicked = null;

		if($scope.toggleLeft ==null){
			$scope.toggleLeft = false;
		}

		if($scope.toggleRight == null){
			$scope.toggleRight = false;
		}

		if($scope.labelSave == null){
			$scope.labelSave = "Guardar cambios";
		}

		$scope.search = function(text, left){
			var listScope = left ? $scope.listLeft : $scope.listRight;
			var atLeastOne;
			var cleanedSearch = removeAccent(text.toLowerCase());
			var cleanedName;

			angular.forEach(listScope, function(group) {
				atLeastOne = false;

				angular.forEach(group.childs, function(child) {
					cleanedName = removeAccent(child.nameDisplay.toLowerCase());
					if(cleanedName.indexOf(cleanedSearch) != -1) {
						atLeastOne = true;
						child.hide = false;
					}else{
						child.hide = true;
					}
				});

				if(atLeastOne){
					group.hide = false;
					group.toggle = true;
				}else{
					group.hide = true;
				}
			});
		};

		$scope.clickGroup = function(group){
			angular.forEach($scope.listLeft, function(item){
				item.clicked = false;
			});

			group.clicked = true;
			groupClicked = group;
		};

		$scope.checkItem = function(item, left){
			var checked = item.checked;
			var list = left ? listCheckedLeft :listCheckedRight;

			if(checked){
				list[item.idList] = item;

			}else {
				delete list[item.idList]
			}
		};

		$scope.checkAll = function(group){
			//Se ha pulsado, por lo que va a cambiar
			var checked = !group.checked;

			angular.forEach(group.childs, function(child) {
				child.checked = checked;
				if(checked){
					listCheckedLeft[child.idList] = child;
				}else{
					delete listCheckedLeft[child.idList]
				}

			});

			group.checked = !group.checked;
		};

		$scope.push = function(left){
			if(left){
				angular.forEach($scope.listLeft, function(group){
					angular.forEach(group.childs, function(child, key){
						if(child.checked){
							child.checked = false;
							delete group.childs[key];
							$scope.listRight[key] = child;
						}
					});
				});

			}else if(groupClicked){
				angular.forEach($scope.listRight, function(item, key){
					if(item.checked){
						delete $scope.listRight[key];
						item.checked = false;
						groupClicked.childs[key] = item;
					}

				});
			}

		};

		$scope.save = function(){
			//TODO Mejorable a buscar los cambios en el array
			angular.forEach(copyData, function(head) {
				delete head.idList;
				var arrayChilds = [];

				angular.forEach(head[$scope.propChild], function(child) {
					delete child.idList;
					arrayChilds.push(child)
				});

				head[$scope.propChild] = arrayChilds;
			});
			$scope.onSave(copyData);
		};


		/**
		 * Importancion de datos. Se activa cuando alguno de los arrays principales cambian
		 */
		$scope.$watchCollection('array', dataChanged);
		$scope.$watchCollection('ngOffset', dataChanged);
		var copyOffset;

		/**
		 * Cuando alguno de los arrays principales cambien, hacemos copias de los originales y las copias las etiquetamos
		 * con idHead e idChild. De esta forma operamos con items mas pequeños y en el momento de devolver los cambios
		 * hechos buscamos unimos referencias (idHead, idChild) entre las listas que se muestran y las listas de items
		 */
		function dataChanged(){
			copyData = clone($scope.array);
			copyOffset = clone($scope.ngOffset);

			var idList = 1;
			//Tagueamos todos los elementos
			angular.forEach(copyData, function(head) {
				head.idList = idList
				idList++;
				angular.forEach(head[$scope.propChild], function(child) {
					child.idList = idList;
					idList++;
				})
			});

			angular.forEach(copyOffset, function(item) {
				item.idList = idList;
				idList++;
			})
			// Creamos las listas que se van a mostrar
			importData();
		}

		function importData(){
			var outputLeft = {};
			var groupLeft;
			var listRight;

			angular.forEach(copyData, function(head) {
				groupLeft = {toggle: $scope.toggleLeft,
					nameDisplay : head.nameDisplay,
					idList : head.idList,
					childs : {}
				};

				angular.forEach(head[$scope.propChild], function(child) {
					groupLeft.childs[child.idList] = child;
				});

				outputLeft[head.idList] = groupLeft;

			});

			listRight = {};
			angular.forEach(copyOffset, function(item) {
				listRight[item.idList] = item;
			});

			$scope.listLeft = outputLeft;
			$scope.listRight = listRight;

		};

		function removeAccent(source) {
			var accent = [
					/[\300-\306]/g, /[\340-\346]/g, // A, a
					/[\310-\313]/g, /[\350-\353]/g, // E, e
					/[\314-\317]/g, /[\354-\357]/g, // I, i
					/[\322-\330]/g, /[\362-\370]/g, // O, o
					/[\331-\334]/g, /[\371-\374]/g, // U, u
					/[\321]/g, /[\361]/g, // N, n
					/[\307]/g, /[\347]/g, // C, c
				],
				noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

			for (var i = 0; i < accent.length; i++){
				source = source.replace(accent[i], noaccent[i]);
			}

			return source;
		}

		function countProperties(obj){
			var  i=0 ;
			for(var key in obj){
				if(obj.hasOwnProperty(key)){
					i++
				}
			}

			return i;
		}


	}
	Controller.$inject = ['$scope'];

	var template = '<div layout="row"><div md-whiteframe="md-whiteframe" flex="flex"><div class="padding-24 header-dual-list"><span flex="flex">{{labelLeft}}</span></div><md-divider></md-divider><div class="padding-24"><div><input flex="flex" placeholder="Buscar" ng-model="searchLeft" ng-change="search(searchLeft, true)" maxlength="25" class="input-search"/></div><div ng-repeat="group in list" ng-if="atLeastOneItem(group, true)"><div layout="row" layout-align="start center" class="selectingRow"><p ng-click="group.toggleLeft = !group.toggleLeft" flex="flex" class="no-margin padding-16-v">{{group.head.nameDisplay}}</p></div><div ng-show="group.toggleLeft" ng-repeat="item in group.childs" ng-if="item.item[propLeft] &amp;&amp; isSearched(group, searchLeft, item)"><p>{{item.nameDisplay}}</p></div></div></div></div><div layout="column" layout-align="center center"><md-button ng-click="pushLeft()" class="md-raised md-primary">></md-button><md-button ng-click="pushRight()" class="md-raised md-primary"><</md-button></div><div md-whiteframe="md-whiteframe" flex="flex"><div class="padding-24 header-dual-list"><span flex="flex">{{labelRight}}</span></div><md-divider></md-divider><div class="padding-24"><div><input flex="flex" placeholder="Buscar" ng-model="searchRight" maxlength="25" class="input-search"/></div><div ng-repeat="group in list" ng-if="atLeastOneItem(group, false)"><div layout="row" layout-align="start center" class="selectingRow"><p ng-click="group.toggleRight = !group.toggleRight" flex="flex" class="no-margin padding-16-v">{{group.head.nameDisplay}}</p></div><div ng-show="group.toggleRight" ng-repeat="item in group.childs" ng-if="!item.item[propLeft] &amp;&amp; isSearched(group, searchRight, item)"><p>{{item.nameDisplay}}</p></div></div></div></div></div>';

	return {
		restrict: "E",
		templateUrl: "/directives/coordinator/duallistTree",
		scope: {
			'array' : '=ngModel',
			'propChild' : '=',
			'toggleLeft' : '=?',
			'labelLeft' : '@',
			'labelRight' : '@',
			'labelSave' : '@?',
			'onSave' : '=',
			'ngOffset' : "=" //Lista de la derecha

		},
		controller: Controller
	}
}

myApp.directive('avatarZoom', avatarZoom);
function avatarZoom(){
	function Controller($scope, $q, $http, $mdDialog) {
		$scope.clickZoomImage = function () {
			zoomImage($q, $http, $mdDialog, $scope.idPicture);
		};

		if ($scope.idPicture){

			$scope.style = {
				"background-image": "url(" + $scope.url + ")"
			}
		}else{
			$scope.url = null
		}
	}


	Controller.$inject = ['$scope','$q','$http','$mdDialog'];

	return {
		template : '<img ng-click="clickZoomImage()" ' +
		'ng-src="{{url}}"' +
		'ng-class="{\'md-avatar\': !noAvatar, \'image-default-user\':!idPicture}" class="avatar-profile"></div>',
		restrict : "E",
		controller: Controller,
		//Scope exclusivas de la directiva
		scope:{
			url: '@',
			idPicture: '@',
			noAvatar: '='
		}
	}
};

myApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain. **.
    'https://s3-us-west-2.amazonaws.com/**'
  ]);
})
