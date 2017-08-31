"use strict";

module.exports = {
    getBusstopsRequestData: function getBusstopsRequestData() {
        return { method: "busstops" };
    },

    getBusstopRequestData: function getBusstopRequestData(idBusstop, idSchedule) {
        return {
            method: "busstop",
            schedule_id: idSchedule,
            busstop_no: idBusstop
        };
    },

    getLinesRequestData: function getLinesRequestData() {
        return { method: "lines" };
    },

    getLineRequestData: function getLineRequestData(nrLine, idSchedule) {
        return {
            method: "line",
            line_no: nrLine,
            schedule_id: idSchedule
        };
    },

    getLineAtBusstopRequestData: function getLineAtBusstopRequestData(nrLine, idSchedule, idBusstop) {
        return {
            method: "lineAtBusstop",
            schedule_id: idSchedule,
            line_no: nrLine,
            busstop_no: idBusstop
        };
    },

    getSchedulesRequestData: function getSchedulesRequestData() {
        return {
            method: "schedules"
        };
    }
};