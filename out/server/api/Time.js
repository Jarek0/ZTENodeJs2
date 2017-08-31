'use strict';

//stopsArray- bus stop IDs
//timesArray- hours when EVERY bus of the line leaves bus stop
//returned array when bus leaves EVERY bus stop
function findTime() {
    //for each bus stop
    var leavesArray = [];
    for (var i = 0; i < stopsArray.length; i++) {
        leavesArray[i] = [];
        var hours = Object.keys(timesArray[stopsArray[i]]);
        for (var _j = 0; _j < hours.length; _j++) {
            var leaveTime = timesArray[stopsArray[i]][hours[_j]];
            for (var x = 0; x < leaveTime.length; x++) {
                leavesArray[i].push(leaveTime[x]);
            }
        }
        leavesArray[i].push(stopsArray[i]);
    }
    return leavesArray;
}

function substractTime(leavesArray, lineNumber, direction) {
    var ride = [];
    ride[0] = [lineNumber, direction];
    for (var i = 1; i < leavesArray.length; i++) {
        ride[i] = {};
        for (var _j2 = 0; _j2 < leavesArray[i].length - 1; _j2++) {
            var result = leavesArray[i][_j2] - leavesArray[i - 1][_j2];
            if (result < 0) result += 60;
            ride[i][_j2] = result;
        }
        //pobranie wspolrzednych przystanku
        var directionName = leavesArray[i][leavesArray[i].length - 1];
        ride[i][j] = [directionName];
    }
    return ride;
}
function controller() {
    var leavesArray = findTime();
    var differences = substractTime(leavesArray, 47, leavesArray[leavesArray.length - 1][leavesArray[0].length - 1]);
    var line = prepare(differences);
    download(line);
}

var stopsArray = ['felin spiessa', 'rondo przemyslowcow', 'rondo karszo-siedlewskiego', 'vetterow', 'felin europark', 'doswiadczalna'];
var timesArray = { 'felin spiessa': { '5': ['55'], '6': ['35'], '7': ['15', '55'], '13': ['55'],
        '14': ['35'], '15': ['15', '55'], '16': ['35'], '19': ['15'], '22': ['20'] },
    'rondo przemyslowcow': { '5': ['57'], '6': ['37'], '7': ['17', '57'], '13': ['57'],
        '14': ['37'], '15': ['17', '57'], '16': ['37'], '19': ['17'], '22': ['22'] },
    'rondo karszo-siedlewskiego': { '5': ['58'], '6': ['38'], '7': ['18', '58'], '13': ['58'],
        '14': ['38'], '15': ['18', '58'], '16': ['38'], '19': ['18'], '22': ['23'] },
    'vetterow': { '5': ['59'], '6': ['39'], '7': ['19', '59'], '13': ['59'], '14': ['39'],
        '15': ['19', '59'], '16': ['39'], '19': ['19'], '22': ['24'] },
    'felin europark': { '6': ['00', '40'], '7': ['20'], '8': ['00'], '14': ['00', '40'],
        '15': ['20'], '16': ['00', '40'], '19': ['20'], '22': ['25'] },
    'doswiadczalna': { '6': ['02', '42'], '7': ['22'], '8': ['02'], '14': ['02', '42'],
        '15': ['22'], '16': ['02', '42'], '19': ['22'], '22': ['27'] } };