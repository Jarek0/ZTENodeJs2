'use strict';

var _AlgorithmMaster = require('./api/AlgorithmMaster');

var _AlgorithmMaster2 = _interopRequireDefault(_AlgorithmMaster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express'),
    app = express(),
    PORT = 3000;

app.get('/drop', function _callee(req, res) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    res.status(200).json(_AlgorithmMaster2.default.getDataFromZTMAndSaveItToCSV(true));

                case 1:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, undefined);
});

app.get('/', function _callee2(req, res) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    res.status(200).json(_AlgorithmMaster2.default.getDataFromZTMAndSaveItToCSV(false));

                case 1:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, undefined);
});

app.listen(PORT, function () {
    console.log('listening on http://localhost:' + PORT);
});