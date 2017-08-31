"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Auth = require("./Auth");

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("babel-polyfill");

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var url = 'https://www.ztm.lublin.eu/api/query';

var auth = _Auth2.default.getAuth();

var numberOfFechedObject = 0;
var numberOfObjectsToFetch = 1;

exports.default = module = {
    resetObjectsCounter: function resetObjectsCounter() {
        numberOfFechedObject = 0;
    },
    setNumberOfObjectsToFetch: function setNumberOfObjectsToFetch(number) {
        console.log("objects to fetch: " + number);
        numberOfObjectsToFetch = number;
    },
    getSchedulesDataFromZTE: function getSchedulesDataFromZTE() {
        var requestData = {
            method: 'schedules',
            auth: auth
        };

        return this.sendRequest(requestData);
    },
    getLinesDataFromZTE: function getLinesDataFromZTE() {
        var requestData = {
            method: 'lines',
            auth: auth
        };

        return this.sendRequest(requestData);
    },
    getBusstopsDataFromZTE: function getBusstopsDataFromZTE() {
        var requestData = {
            method: 'busstops',
            auth: auth
        };

        return this.sendRequest(requestData);
    },
    sendRequest: function sendRequest(requestData) {
        try {
            var request = new XMLHttpRequest();
            request.open("POST", url, false); // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                numberOfFechedObject++;
                console.log("fetched object number: " + numberOfFechedObject + "/" + numberOfObjectsToFetch);
                return JSON.parse(request.responseText).response;
            }
        } catch (e) {
            console.log("request failed. trying to send again");
            return this.sendRequest(requestData);
        }
    },
    getLineWithBusstopPosition: function getLineWithBusstopPosition(line_no, schedule_id) {
        var requestData = {
            method: 'line',
            line_no: line_no,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getLineWithBusstopPositionRequest(requestData);
    },
    getLineWithBusstopPositionRequest: function getLineWithBusstopPositionRequest(requestData) {
        try {
            var request = new XMLHttpRequest();
            request.open("POST", url, false); // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                var responseText = JSON.parse(request.responseText)['response'];
                var responseObject = {};
                responseObject.line_no = requestData.line_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: " + numberOfFechedObject + "/" + numberOfObjectsToFetch);
                return responseObject;
            }
        } catch (e) {
            console.log("request failed. trying to send again");
            return this.getLineWithBusstopPositionRequest(requestData);
        }
    },
    getBusstopWithLineNumber: function getBusstopWithLineNumber(busstop_id, schedule_id) {
        var requestData = {
            method: 'line',
            busstop_no: busstop_id,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getBusstopWithLineNumberRequest(requestData);
    },
    getBusstopWithLineNumberRequest: function getBusstopWithLineNumberRequest(requestData) {
        try {
            var request = new XMLHttpRequest();
            request.open("POST", url, false); // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                var responseText = JSON.parse(request.responseText)['response'];
                var responseObject = {};
                responseObject.busstop_no = requestData.busstop_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: " + numberOfFechedObject + "/" + numberOfObjectsToFetch);
                return responseObject;
            }
        } catch (e) {
            console.log("request failed. trying to send again");
            return this.getBusstopWithLineNumberRequest(requestData);
        }
    },
    getLineAtBusstop: function getLineAtBusstop(busstop_id, line_no, schedule_id) {
        var requestData = {
            method: 'lineAtBusstop',
            busstop_no: busstop_id,
            line_no: line_no,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getLineAtBusstopRequest(requestData);
    },
    getLineAtBusstopRequest: function getLineAtBusstopRequest(requestData) {
        try {
            var request = new XMLHttpRequest();
            request.open("POST", url, false); // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                var responseText = JSON.parse(request.responseText)['response'];
                var responseObject = {};
                responseObject.busstop_no = requestData.busstop_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.line_no = requestData.line_no;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: " + numberOfFechedObject + "/" + numberOfObjectsToFetch);
                return responseObject;
            }
        } catch (e) {
            console.log("request failed. trying to send again");
            return this.getLineAtBusstopRequest(requestData);
        }
    }
};