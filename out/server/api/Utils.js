"use strict";

module.exports = {
    copyPropsToAnotherObject: function copyPropsToAnotherObject(firstObject, secondObject) {
        for (var k in firstObject) {
            secondObject[k] = firstObject[k];
        }
    }
};