'use strict'

let playerInfoList = [];
let statList = [];

let labels = [];
let datasets = [];

//chart insertion
let chartData = {
    labels: labels,
    datasets: datasets,
}

/******************     GLOBAL_FUNCTIONS (ALSO AJAX FUNCTION USING A CALLBACK xD)    ******************/
    // for undifined checks
    const isDefined = (x) => x != null;
    // Everytime he has to call new data - all the way from some american server - he puts it in your (browser)sessionStorage
    const ajaxUse = (url, useData, method, key, data) => {
        if(isDefined(sessionStorage.getItem(key)) && method == 'GET'){
            const data = JSON.parse(sessionStorage.getItem(key));
            return useData(data);
        }else{
            $.ajax({
                url: url,
                method: method,
                data: data,
                dataType: 'json'
            }).done(function (data) {
                if(isDefined(key)){sessionStorage.setItem(key, JSON.stringify(data));}
                useData(data);
            }).fail(function (err1, err2) {
                console.log(err1);
                console.log(err2);
            });
        }
    }
    // some ajex 'put's', 'get's' or 'delete' don't 
    const justReturnPlease = (data) => {
        return data;
    }
/******************     DOCUMENT.READY BUT STILL GLOBAL FUNCTIONS THAT WON'T BE EXPORTED    ******************/

    $(function(){
    
    const cleanItAll = () => {
        localStorage.removeItem('dataLists');
        $('#yourPlayerList').empty();
        $('#yourStatList').empty();
        playerInfoList = [];
        statList = [];
        labels = [];
        datasets = [];
        chart.data.datasets = datasets;
        chart.data.labels = labels;
        chart.update();
    }
    
/******************     GLOBAL_VARIABLES    ******************/

    //chartdata
    let ctx = $('canvas#chart');
    let chart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
        responsive: true
    }
    });

/******************     'CHOOSE YOUR PLAYER & STAT' FUNCTIONS   ******************/

    const  searchPlayerByName = (data) => {
        const playerName = $('#playerSearch').val();
        const player = data.find(player => player.FantasyDraftName == playerName);
        addPlayer(player);
    }
    const addPlayer = (newPlayer) => {
        const div = $("#yourPlayerList");
        div.empty();      
        const player = playerInfoList.find(x => x.PlayerID == newPlayer.PlayerID);
        if(!isDefined(player)){
            playerInfoList.push(newPlayer);
        }else if(player.PlayerID !== newPlayer.PlayerID){
            playerInfoList.push(newPlayer);
        }
        for(let playerInfo of playerInfoList){
            div.append(`<li>${playerInfo.FantasyDraftName}</li>`);
        }
        updateChart(statList, playerInfoList);
    }
    const addStat = (stat) => {
        const div = $("#yourStatList");
        div.empty();
        if(statList.find(stats => stats == stat) !== stat){statList.push(stat);};
        for(let theStat of statList){
            div.append(`<li>${theStat}</li>`);
        }
        updateChart(statList, playerInfoList);
    }

/******************     .ON('CLICKERS',FUNCTIONS)    ******************/

    $('#playerSelectionCall').on('click',function(){ 
        // url to every active basketball player in the NBA
        const url = 'https://api.sportsdata.io/v3/nba/scores/json/Players?key=0a78d72e65534fb4bda5e9b3faff325a'
        // search player by input Name
        ajaxUse(url,searchPlayerByName,'GET','allNBAPlayers');

    });
    $('#addStat').on('click', function(){
        const newStat = $('#statSelect').val();
        addStat(newStat);
    });
    $('#updateChart').on('click',function(){
        updateChart(statList, playerInfoList);
    });
    $('#clear').on('click',function(){
        cleanItAll();
    });
    $('#saveChart').on('click',function(){
        const previousData = JSON.parse(localStorage.getItem('dataLists'));
        const dataLists = {
            id : isDefined(previousData) ? previousData.id : null,
            stats : statList,
            players : playerInfoList
        }
        localStorage.setItem('dataLists', JSON.stringify(dataLists));
        return true;
    });

/******************     UPDATING_THE_CHART    ******************/

    const updateChart = (stats, players) => {
        for(let stat of stats){
             let statArray = [];
             const pushToStatArray = (data) => {
                const individualStat = data[stat];
                statArray.push(individualStat);
            }
            for(let player of players){
                const ID = player.PlayerID;
                const url = `https://api.sportsdata.io/v3/nba/stats/json/PlayerSeasonStatsByPlayer/2020/${ID}?key=0a78d72e65534fb4bda5e9b3faff325a`
                ajaxUse(url, pushToStatArray,'GET',ID);
            }
            addDataset(stat,statArray);
        }
        addLabels(players);
    }
    const updateChartData = (labelz, datasetz) => {
        chartData = {
            labels: labelz,
            datasets: datasetz,
        }
        chart.update();
    }
    const addDataset = (stat, data) => {
        const thisDataset = datasets.find(x => x.label == stat);
        let newDataset = {
            label: stat,
            backgroundColor: 'rgb(0, 0, 0,0.0)',
            borderColor: `rgb(0, 0, 0)`,
            borderWidth: 3,
            data: data
        }
            if(!isDefined(thisDataset)){
                datasets.push(newDataset);
            }else if(stat !== thisDataset.label){
                datasets.push(newDataset);
            }else{
                thisDataset.data = data;
            }
    }
    const addLabels = (List) => {
        for(let player of List){
            const playerN = labels.find(x => x == player.FantasyDraftName);
            if(player.FantasyDraftName !== playerN){
            labels.push(player.FantasyDraftName);
            }
        }
        updateChartData(labels,datasets);
    }

/******************     DISPLAY_SAVED_CHARTS    ******************/

    const printSavedCharst = () => {
        ajaxUse('http://127.0.0.1:3001/api/chartdatalist', makeList, 'GET');
    }
     function displayChart(id)  {
        const findMyChart = (data) =>{
            const chartObj = data[0];
            const dataLists = {
                id : id,
                stats : chartObj.stats,
                players : chartObj.players
            }
            localStorage.setItem('dataLists', JSON.stringify(dataLists));
            $('#title').empty();
            $('#title').text(chartObj.chartName);
            playerInfoList = chartObj.players;
            statList = chartObj.stats;
            for(let playerObj of chartObj.players){
                addPlayer(playerObj);
            }
            for(let stat of chartObj.stats){
                addStat(stat);
            }
            updateChart(chartObj.stats,chartObj.players);
        } 
        ajaxUse(`http://127.0.0.1:3001/api/chartdatalist/${id}`, findMyChart, 'GET');
    }
    const makeList = (data) => {
         for ( let oneChart of data ){
             const div = $('#saveChartsList');
             div.append(`<li class="savedChartL"><a href="index.html" id="${oneChart._id}" class="deleteChart"><img src="images/close.svg" width="10"></img></a><a href="" id="${oneChart._id}" class="savedChart">${oneChart.chartName}</a></li>`);
         }
         $('.savedChart').on('click',  function(e){
            cleanItAll();
            e.preventDefault();
            const id = $(this).attr('id');
            displayChart(id);
        });
        $('.deleteChart').on('click',  function(){
            const id = $(this).attr('id');
            deleteChart(id);
            return true;
        });
     }
    printSavedCharst();

    /******************     DELETE_CHART    ******************/

    const deleteChart = (id) =>{
        ajaxUse(`http://127.0.0.1:3001/api/chartdatalist/${id}`, printSavedCharst,'DELETE');
        
    }
}); 

 

export{ajaxUse, isDefined}; 
    