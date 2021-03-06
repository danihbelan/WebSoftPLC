/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages')
        .controller('dashboardCtrl', dashboardCtrl);

    /** @ngInject */
    function dashboardCtrl($scope, $http, $timeout, baConfig, baUtil, $element, layoutPaths) {
        //TODO crear función que lea en bucle todos los valores y estados

        $scope.stateRoof = 'PARADO'
        $scope.stateWall = 'PARADO'
        $scope.stateVentilador = 'APAGADO'
        $scope.stateResistencia = 'APAGADO'

        $scope.temperature = 21.0
        $scope.time
        $scope.date
        var values = []

        /*-----------------------------
         ----------- Updates ----------
         ------------------------------ */
        var initElements = function () {
            //Llamos a la funcion que se encarga de obtener los datos de la base de datos
            getDateTime()
            getValues()
        }

        var getDateTime = function(){
            var d = new Date()

            $scope.time = d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes()
            $scope.date = d.getDate() + "/" + d.getMonth()+1 + "/" + d.getFullYear()

            //Volvemos a llamar a la funcion cada 999 milisegundos
            setTimeout(function () {
                getDateTime()
            },999)
        }

        var getValues = function (){
            var promised = $http.post('/m/u/getValues')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    //Actualizar valores de temperatura
                    values = response.data.result
                    $scope.temperature = values[values.length -1].temperature
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })

            //Volvemos a llamar a la funcion cada 5 segundo
            setTimeout(function () {
                getValues()
            },5000)
        }

        //Llamamos a la función que inicia los datos
        initElements()



        /*-----------------------------
         ----------- Buttons ----------
         ------------------------------ */
        $scope.clickAbort = function (data) {

            var promised = $http.post('/m/u/abort')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateRoof = 'PARADO'
                    $scope.stateWall = 'PARADO'
                    $scope.stateVentilador = 'APAGADO'
                    $scope.stateResistencia = 'APAGADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })

        }

        $scope.changeVentilador = function (data) {
            var json = {value: data.from}
            if(data.from == 0)
                $scope.stateVentilador = 'APAGADO'
            else if(data.from == 100)
                $scope.stateVentilador = 'MAXIMA POTENCIA'
            else
                $scope.stateVentilador = 'POTENCIA AL ' +data.from +' %'

            var promised = $http.post('/m/u/changeVentilador', json)
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    //TODO poner aqui estado
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.changeResistencia = function (data) {
            var json = {value: data.from}
            if(data.from == 0)
                $scope.stateResistencia = 'APAGADO'
            else if(data.from == 100)
                $scope.stateResistencia = 'MAXIMA POTENCIA'
            else
                $scope.stateResistencia = 'POTENCIA AL ' +data.from +' %'

            var promised = $http.post('/m/u/changeResistencia', json)
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    //TODO poner aqui estado
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickOpen = function () {
            $scope.stateRoof = 'ABRIENDO...'

            var promised = $http.post('/m/u/openRoof')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateRoof = 'PARADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickClose = function () {
            $scope.stateRoof = 'CERRANDO...'

            var promised = $http.post('/m/u/closeRoof')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateRoof = 'PARADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickStopRoof = function () {
            $scope.stateRoof = 'PARADO'

            var promised = $http.post('/m/u/stopRoof')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateRoof = 'PARADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickMoveRight = function () {
            $scope.stateWall = 'MOVIENDO A LA DERECHA...'

            var promised = $http.post('/m/u/moveRight')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateWall = 'PARADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickMoveLeft = function () {
            $scope.stateWall = 'MOVIENDO A LA IZQUIERDA...'

            var promised = $http.post('/m/u/moveLeft')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateWall = 'PARADO'
                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

        $scope.clickStopWall = function () {
            $scope.stateWall = 'PARADO'

            var promised = $http.post('/m/u/stopWall')
            promised.then(function success(response) {

                if (response.data.error == 0) {
                    $scope.stateWall = 'PARADO'

                } else {
                    console.log('Error: ', response.data)
                }

            }, function failed(data) {

            })
        }

    }
})();