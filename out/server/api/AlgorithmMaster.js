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

var preparedBusstops = [];
var finalResults = [];

var preferedStartHour = 7;

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
        var _this = this;

        linesWithBusstopsPosition.forEach(function (lineWithBusstopPosition) {
            if (lineWithBusstopPosition.data !== undefined) lineWithBusstopPosition.data.forEach(function (direction) {
                direction.data.forEach(function (busstopOnLine) {
                    var preparedBusstop = {};

                    preparedBusstop.line_no = lineWithBusstopPosition.line_no;
                    preparedBusstop.schedule_id = lineWithBusstopPosition.schedule_id;
                    preparedBusstop.direction_name = direction.direction_name;

                    preparedBusstop.id = busstopOnLine.busstop;
                    preparedBusstop.position = busstopOnLine.position - 1;

                    var busstop = busstops.find(function (busStop) {
                        return busStop.id === preparedBusstop.id;
                    });
                    preparedBusstop.latitude = busstop.latitude;
                    preparedBusstop.longitude = busstop.longitude;

                    var lineAtBusstop = linesAtBusstop.find(function (lineAtBusstop) {
                        return preparedBusstop.line_no === lineAtBusstop.line_no && lineAtBusstop.busstop_no === preparedBusstop.id;
                    });

                    if (lineAtBusstop !== undefined && lineAtBusstop.data !== undefined) {
                        if (lineAtBusstop.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']) {
                            preparedBusstop.hours = _this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']);
                        } else if (lineAtBusstop.data.godziny['POWSZEDNI LETNI']) {
                            preparedBusstop.hours = _this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny['POWSZEDNI LETNI']);
                        } else {
                            preparedBusstop.hours = _this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny);
                        }
                    }
                    if (preparedBusstop.hours !== undefined && preparedBusstop.hours.length > 0) preparedBusstops.push(preparedBusstop);
                });
            });
        });
    },
    flatHoursTableToTableOfMinutes: function flatHoursTableToTableOfMinutes(hours) {
        var tableOfMinutes = [];

        var _loop = function _loop(hour) {
            if (hours.hasOwnProperty(hour) && hours[hour] instanceof Array) {
                hours[hour].forEach(function (minute) {
                    if (minute.indexOf('a') === -1) tableOfMinutes.push(parseInt(hour) * 60 + parseInt(minute));
                });
            }
        };

        for (var hour in hours) {
            _loop(hour);
        }
        return tableOfMinutes;
    },
    calculateResults: function calculateResults() {
        var previousTime = void 0;
        var currentLine = void 0;
        for (var preparedBusStopPosition = 0; preparedBusStopPosition < preparedBusstops.length; preparedBusStopPosition++) {
            if (preparedBusStopPosition > 0 && preparedBusstops[preparedBusStopPosition].line_no === currentLine) {
                var time = this.findTime(preparedBusstops[preparedBusStopPosition].hours, previousTime);
                var timeDifrence = time - previousTime;
                var finalResult = {};
                finalResult.line_no = preparedBusstops[preparedBusStopPosition].line_no;
                finalResult.direction_name = preparedBusstops[preparedBusStopPosition].direction_name;
                finalResult.id = preparedBusstops[preparedBusStopPosition].id;
                finalResult.position = preparedBusstops[preparedBusStopPosition].position;
                finalResult.latitude = preparedBusstops[preparedBusStopPosition].latitude;
                finalResult.longitude = preparedBusstops[preparedBusStopPosition].longitude;
                finalResult.longitude = preparedBusstops[preparedBusStopPosition].longitude;
                finalResult.timeDifrence = timeDifrence;
                finalResults.push(finalResult);
                previousTime = time;
            } else {
                previousTime = this.findTime(preparedBusstops[preparedBusStopPosition].hours, preferedStartHour * 60);
                currentLine = preparedBusstops[preparedBusStopPosition].line_no;
            }
        }
        var savedResult = void 0;
        _Database2.default.saveToFile("finalResults.txt", finalResults);
        savedResult = _ExportCSV2.default.prepare(finalResults);
        _ExportCSV2.default.download(savedResult);
    },
    findTime: function findTime(hours, previousTime) {
        var wantedTime = hours[0];
        for (var hour in hours) {
            if (Math.abs(previousTime - hour) < Math.abs(previousTime - wantedTime) && hour > previousTime) wantedTime = hour;
        }
        return wantedTime;
    }
};