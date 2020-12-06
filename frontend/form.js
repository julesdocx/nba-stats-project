'use strict';

import * as mainJs from '../frontend/script.js'; 
// import * as MyChart from '../frontend/myChartClass.js'; 

$(function(){

    class MyChart {

        constructor(chartName,name,email,stats, players){
            this.chartName = chartName;
            this.name = name;
            this.email = email;
            this.stats = stats;
            this.players = players;
        }
    }

 /******************     ON_LOAD   ******************/

    const fillIntheUser = (data) =>{
        const chartObj = data[0];
        $('#chartName').val(chartObj.chartName);
        $('#yourName').val(chartObj.name);
        $('#email').val(chartObj.email);
    }
    const fillInIfUpdating = () => {
        const dataQuestion = JSON.parse(localStorage.getItem('dataLists'));
        if(mainJs.isDefined(dataQuestion) && mainJs.isDefined(dataQuestion.id)){
            mainJs.ajaxUse(`http://127.0.0.1:3001/api/chartdatalist/${dataQuestion.id}`, fillIntheUser, 'GET')
        }
        
    }
    fillInIfUpdating();

 /******************     DELETE_CHART    ******************/

    const onSucces = (data) => {
        localStorage.removeItem('dataLists')
    }

    const methodSearch = (data) => mainJs.isDefined(data.id) ? 
    {method: 'PUT', url:`http://127.0.0.1:3001/api/chartdatalist/${data.id}`}: 
    {method: 'POST', url:`http://127.0.0.1:3001/api/chartdatalist`};

    const submitIt = () => {
        const data = JSON.parse(localStorage.getItem('dataLists'));
        const submitType = methodSearch(data);
        const chartName = $('#chartName').val();
        const name = $('#yourName').val();
        const email = $('#email').val();
        const stat = data.stats;
        const players = data.players;
        let newChart = new MyChart(chartName,name,email,stat,players);
        mainJs.ajaxUse(submitType.url, onSucces, submitType.method,newChart.chartName, newChart);
    }

    $('#submitChart').on('click', function(){
        submitIt();
    });
    
    

});
