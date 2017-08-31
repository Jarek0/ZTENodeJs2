"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

exports.default = module = {
    readTextFile: function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", 'file:///ZTENodeJs2/' + file, false);
        rawFile.setRequestHeader('Content-Type', 'application/json');
        rawFile.send();

        return rawFile.responseText;
    },
    saveToFile: function saveToFile(path, object) {
        fs.writeFile(path, '', function () {
            console.log('done');
        });
        fs.writeFile(path, JSON.stringify(object), function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }
};