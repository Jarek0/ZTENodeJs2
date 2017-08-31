'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Network = require('./Network');

var _Network2 = _interopRequireDefault(_Network);

var _ExportCSV = require('./ExportCSV');

var _ExportCSV2 = _interopRequireDefault(_ExportCSV);

var _Database = require('./Database');

var _Database2 = _interopRequireDefault(_Database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedules = {};
var lines = {};
var busstops = {};
var linesWithBusstopsPosition = {};
var busstopsWithLineNumber = {};
var linesAtBusstop = {};

var preparedBusstops = {};

exports.default = module = {
    getDataFromZTMAndSaveItToCSV: function getDataFromZTMAndSaveItToCSV(dropDatabase) {

        if (dropDatabase) {
            this.getNewDataFromZTM();
            this.saveDataToDatabase();
        } else {
            this.getDataFromDatabase();
        }

        this.prepareBusstopsBeforeCalculateResults();
        this.calculateResults();
    },
    getNewDataFromZTM: function getNewDataFromZTM() {
        console.log("start download data from ZTM server");
        console.log("start fetching schedules");
        schedules = _Network2.default.getSchedulesDataFromZTE();
        _Network2.default.resetObjectsCounter();
        console.log("schedules fetched");
        var actualSchedule = schedules.find(function (schedule) {
            return new Date(schedule['date_start']) < new Date() && new Date(schedule['date_stop']) > new Date();
        });

        console.log("start fetching lines");
        lines = _Network2.default.getLinesDataFromZTE();
        _Network2.default.resetObjectsCounter();
        console.log("lines fetched");

        console.log("start fetching bus stops");
        busstops = _Network2.default.getBusstopsDataFromZTE();
        _Network2.default.resetObjectsCounter();
        console.log("bus stops fetched");

        console.log("start fetching lines with bus stops position");
        _Network2.default.setNumberOfObjectsToFetch(Object.keys(lines).length);
        linesWithBusstopsPosition = [];

        for (var line in lines) {
            linesWithBusstopsPosition.push(_Network2.default.getLineWithBusstopPosition(line, actualSchedule.id));
        }

        _Network2.default.resetObjectsCounter();
        console.log("lines with bus stops position fetched");

        console.log("start fetching bus stops with line number");
        _Network2.default.setNumberOfObjectsToFetch(busstops.length);
        busstopsWithLineNumber = [];

        busstops.forEach(function (busstop) {
            busstopsWithLineNumber.push(_Network2.default.getBusstopWithLineNumber(busstop.id, actualSchedule.id));
        });

        _Network2.default.resetObjectsCounter();
        console.log("bus stops with line number fetched");

        console.log("start fetching lines at bus stop");

        var numberOfLinesAtBusstopRequests = 0;

        linesWithBusstopsPosition.forEach(function (lineWithBusstopPosition) {
            if (lineWithBusstopPosition.data !== undefined) lineWithBusstopPosition.data.forEach(function (direction) {
                direction.data.forEach(function (busstopOnLine) {
                    numberOfLinesAtBusstopRequests++;
                });
            });
        });

        _Network2.default.resetObjectsCounter();
        _Network2.default.setNumberOfObjectsToFetch(numberOfLinesAtBusstopRequests);
        linesAtBusstop = [];

        linesWithBusstopsPosition.forEach(function (lineWithBusstopPosition) {
            if (lineWithBusstopPosition.data !== undefined) lineWithBusstopPosition.data.forEach(function (direction) {
                direction.data.forEach(function (busstopOnLine) {
                    linesAtBusstop.push(_Network2.default.getLineAtBusstop(busstopOnLine.busstop, lineWithBusstopPosition.line_no, actualSchedule.id));
                });
            });
        });
        console.log("lines at bus stops fetched");
        console.log("data from ZTM downloaded");
    },
    saveDataToDatabase: function saveDataToDatabase() {
        _Database2.default.saveToFile('schedules.txt', schedules);
        _Database2.default.saveToFile('lines.txt', lines);
        _Database2.default.saveToFile('linesWithBusstopsPosition.txt', linesWithBusstopsPosition);
        _Database2.default.saveToFile('busstops.txt', busstops);
        _Database2.default.saveToFile('busstopsWithLineNumber.txt', busstopsWithLineNumber);
        _Database2.default.saveToFile('linesAtBusstop.txt', linesAtBusstop);
    },
    getDataFromDatabase: function getDataFromDatabase() {
        schedules = _Database2.default.readTextFile("schedules.txt");
        lines = _Database2.default.readTextFile("lines.txt");
        linesWithBusstopsPosition = _Database2.default.readTextFile("linesWithBusstopsPosition.txt");
        busstops = _Database2.default.readTextFile("busstops.txt");
        busstopsWithLineNumber = _Database2.default.readTextFile("busstopsWithLineNumber.txt");
        linesAtBusstop = _Database2.default.readTextFile("linesAtBusstop.txt");
    },
    prepareBusstopsBeforeCalculateResults: function prepareBusstopsBeforeCalculateResults() {
        linesWithBusstopsPosition.forEach(function (lineWithBusstopPosition) {
            if (lineWithBusstopPosition.data !== undefined) lineWithBusstopPosition.data.forEach(function (direction) {
                direction.data.forEach(function (busstopOnLine) {
                    var preparedBusstop = {};
                    preparedBusstop.line_no = linesWithBusstopsPosition.line_no;
                    preparedBusstop.schedule_id = linesWithBusstopsPosition.schedule_id;
                    preparedBusstop.direction_name = linesWithBusstopsPosition.direction_name;
                    preparedBusstop.id = busstopOnLine.busstop;
                    preparedBusstop.position = busstopOnLine.position - 1;

                    var busstop = busstops.find(function (busStop) {
                        return busStop.id === preparedBusstop.id;
                    });
                    preparedBusstop.latitude = busstop.latitude;
                    preparedBusstop.longitude = busstop.longitude;

                    preparedBusstops.push(preparedBusstop);
                });
            });
        });
    },
    calculateResults: function calculateResults() {
        var line = [];
        var leavesArray = [];
        var differences = [];
        linesAtBusstop = this.changeArray(preparedBusstops, linesAtBusstop);
        var keys = Object.keys(linesAtBusstop);
        for (var i = 0; i < keys.length; i++) {
            var klucze = Object.keys(linesAtBusstop[keys[i]]);
            for (var j = 0; j < klucze.length; j++) {
                leavesArray = findTime(linesAtBusstop[keys[i]][klucze[j]]);
                if (leavesArray) {
                    differences.push(substractTime(leavesArray, preparedBusstops));
                }
            }
        }
        line = _ExportCSV2.default.prepare(differences);
        _ExportCSV2.default.download(line);
    },
    changeArray: function changeArray(busStopArray, array) {
        var schedule = {};
        busStopArray.forEach(function (busstop) {
            if (!schedule[busstop.line_no]) {
                schedule[busstop.line_no] = {};
            }
            schedule[busstop.line_no][busstop.direction_name] = [];
        });
        busStopArray.forEach(function (busstopOnLine) {
            var element = array.find(function (busstop) {
                return busstopOnLine.line_no === busstop.line_no && busstop.busstop_no === busstopOnLine.id;
            });
            if (element !== undefined && element.data !== undefined) {
                element.data.direction_name = busstopOnLine.direction_name;
                element.data.position = busstopOnLine.position;
                var hours = void 0;
                if (element.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']) {
                    hours = element.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY'];
                } else if (element.data.godziny['POWSZEDNI LETNI']) {
                    hours = element.data.godziny['POWSZEDNI LETNI'];
                } else {
                    hours = element.data.godziny;
                }

                element.data.godziny = hours;
                schedule[element.line_no][element.data.direction_name].push(element.data);
            }
        });
        return schedule;
    },
    substractTime: function substractTime(leavesArray, busstopResponse) {
        var ride = [];
        for (var i = 1; i < leavesArray.length; i++) {
            ride[i - 1] = {};
            var result = leavesArray[i].leaveTime - leavesArray[i - 1].leaveTime;
            if (result < 0) result += 60;
            var directionName = leavesArray[i].dir;
            var coorX = void 0;
            var coorY = void 0;
            for (var j = 0; j < busstopResponse.length; j++) {
                if (leavesArray[i].busstopId === busstopResponse[j].id) {
                    coorX = busstopResponse[j].longitude;
                    coorY = busstopResponse[j].latitude;
                    break;
                }
            }
            ride[i - 1] = { id: leavesArray[i].busstopId, dir: directionName, diff: result, longitude: coorX, latitude: coorY, pos: leavesArray[i].pos, line_no: leavesArray[i].linia };
        }
        return ride;
    },
    loops: function loops(keys, stopsArray) {
        var i = 0;
        for (var x = 0; x < keys.length; x++) {
            for (var j = 0; j < stopsArray[0].godziny[keys[x]].length; j++) {
                if (parseInt(keys[x]) === 7) {
                    return i;
                }
                i++;
            }
        }
        return i;
    },
    findingLoops: function findingLoops(stopsArray, keys, i) {
        var z = 0;
        console.log(stopsArray.godziny);
        for (var x = 0; x < keys.length; x++) {
            var minutes = stopsArray.godziny[keys[x]];
            for (var w = 0; w < minutes.length; w++) {
                if (i === z) {
                    console.log(keys[x], minutes[w]);
                    console.log(minutes);
                    return { linia: stopsArray.linia, dir: stopsArray.direction_name, busstopId: stopsArray.przystanek, pos: stopsArray.position, leaveTime: minutes[w] };
                }
                z++;
            }
        }
    },
    findTime: function findTime(stopsArray) {
        if (stopsArray[0]) {
            var leavesArray = [];
            console.log(stopsArray[0].direction_name);
            var keys = Object.keys(stopsArray[0].godziny);
            var i = loops(keys, stopsArray);
            for (var j = 0; j < stopsArray.length; j++) {
                keys = Object.keys(stopsArray[j].godziny);
                leavesArray.push(findingLoops(stopsArray[j], keys, i));
            }
            //console.log(leavesArray);
            return leavesArray;
        }
    }
};