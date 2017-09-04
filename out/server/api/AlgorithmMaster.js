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
var test = [];

var finalResults = [];

var preferedHour = 7;
var minutesOfPreferedStartHour = preferedHour * 60;

exports.default = module = {
    getDataFromZTMAndSaveItToCSV: function getDataFromZTMAndSaveItToCSV(dropDatabase) {

        if (dropDatabase) {
            this.getNewDataFromZTM();
            this.saveDataToDatabase();
        } else {
            this.getDataFromDatabase();
        }

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
        linesWithBusstopsPosition = _Database2.default.readTextFile("testData.txt");
        busstops = _Database2.default.readTextFile("busstops.txt");
        busstopsWithLineNumber = _Database2.default.readTextFile("busstopsWithLineNumber.txt");
        linesAtBusstop = _Database2.default.readTextFile("linesAtBusstop.txt");
    },
    calculateResults: function calculateResults() {
        var _this = this;

        linesWithBusstopsPosition.forEach(function (lineWithBusstopPosition) {
            if (lineWithBusstopPosition.data !== undefined) lineWithBusstopPosition.data.forEach(function (direction) {
                var _loop = function _loop(busstopOnLinePosition) {
                    var finalResult = {};

                    finalResult.line_no = lineWithBusstopPosition.line_no;
                    finalResult.direction_name = direction.direction_name;
                    finalResult.id = direction.data[busstopOnLinePosition].busstop;
                    finalResult.position = direction.data[busstopOnLinePosition].position - 1;

                    var busstop = busstops.find(function (busStop) {
                        return busStop.id === finalResult.id;
                    });
                    finalResult.latitude = busstop.latitude;
                    finalResult.longitude = busstop.longitude;

                    var lineAtBusstop = linesAtBusstop.find(function (lineAtBusstop) {
                        return finalResult.line_no === lineAtBusstop.line_no && lineAtBusstop.busstop_no === finalResult.id;
                    });

                    if (lineAtBusstop !== undefined && lineAtBusstop.data !== undefined) {
                        direction.data[busstopOnLinePosition].hours = lineAtBusstop.data.godziny[Object.keys(lineAtBusstop.data.godziny)[0]];
                        if (direction.data[busstopOnLinePosition].hours !== undefined && Object.keys(direction.data[busstopOnLinePosition].hours).length > 0) {
                            if (busstopOnLinePosition > 0) {
                                var previousTime = _this.findTime(direction.data[busstopOnLinePosition - 1].hours, minutesOfPreferedStartHour);
                                finalResult.timeDifrence = _this.findTime(direction.data[busstopOnLinePosition].hours, previousTime) - previousTime;
                                var hourAttempt = 4;
                                while (isNaN(finalResult.timeDifrence)) {
                                    previousTime = _this.findTime(direction.data[busstopOnLinePosition - 1].hours, hourAttempt);
                                    finalResult.timeDifrence = _this.findTime(direction.data[busstopOnLinePosition].hours, previousTime) - previousTime;
                                    hourAttempt++;
                                    if (hourAttempt > 23) break;
                                }
                                if (!isNaN(finalResult.timeDifrence)) {
                                    var testValue = finalResult;
                                    testValue.hours = direction.data[busstopOnLinePosition].hours;
                                    testValue.discription = lineAtBusstop.data.opis;
                                    testValue.legend = lineAtBusstop.data.legenda;
                                    test.push(testValue);
                                    finalResults.push(finalResult);
                                }
                            }
                        }
                    }
                };

                for (var busstopOnLinePosition = 0; busstopOnLinePosition < direction.data.length; busstopOnLinePosition++) {
                    _loop(busstopOnLinePosition);
                }
            });
        });

        _Database2.default.saveToFile('test.txt', test);
        _Database2.default.saveToFile('finalResults.txt', finalResults);
        var savedResult = _ExportCSV2.default.prepare(finalResults);
        _ExportCSV2.default.download(savedResult);
    },
    findTime: function findTime(hours, preferedHour) {
        for (var hour in hours) {
            for (var minutePosition = 0; minutePosition < hours[hour].length; minutePosition++) {
                var minutes = hours[hour][minutePosition];
                var minutesOfHour = parseInt(hour) * 60 + parseInt(minutes.replace(/\D/g, ''));
                if (minutesOfHour >= preferedHour) {
                    return minutesOfHour;
                }
            }
        }
    }
};