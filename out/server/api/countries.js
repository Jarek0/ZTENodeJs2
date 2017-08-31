"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {
    app.get('/countries', function (req, res) {
        res.status(200).json(["Netherlands", "Belgium", "Poland"]);
    });
};