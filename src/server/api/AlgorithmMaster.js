import Network from './Network';
import ExportCSV from './ExportCSV'
import Database from './Database'

let schedules = {};
let lines = {};
let busstops = {};
let linesWithBusstopsPosition = {};
let busstopsWithLineNumber = {};
let linesAtBusstop = {};

let preparedBusstops = [];
let finalResults = [];

let preferedStartHour = 7;

export default module={
    getDataFromZTMAndSaveItToCSV(dropDatabase){

        if(dropDatabase)
        {
            this.getNewDataFromZTM();
            this.saveDataToDatabase();
        }
        else{
            this.getDataFromDatabase();
        }

        this.prepareBusstopsBeforeCalculateResults();
        this.calculateResults();
    },

    getNewDataFromZTM(){
        console.log("start download data from ZTM server");
        console.log("start fetching schedules");
        schedules = Network.getSchedulesDataFromZTE();
        Network.resetObjectsCounter();
        console.log("schedules fetched");
        let actualSchedule = schedules.find(schedule =>{ return new Date(schedule['date_start'])<new Date() && new Date(schedule['date_stop'])>new Date()});

        console.log("start fetching lines");
        lines = Network.getLinesDataFromZTE();
        Network.resetObjectsCounter();
        console.log("lines fetched");

        console.log("start fetching bus stops");
        busstops = Network.getBusstopsDataFromZTE();
        Network.resetObjectsCounter();
        console.log("bus stops fetched");

        console.log("start fetching lines with bus stops position");
        Network.setNumberOfObjectsToFetch(Object.keys(lines).length);
        linesWithBusstopsPosition = [];

        for(let line in lines){
            linesWithBusstopsPosition.push(Network.getLineWithBusstopPosition(line,actualSchedule.id));
        }

        Network.resetObjectsCounter();
        console.log("lines with bus stops position fetched");

        console.log("start fetching bus stops with line number");
        Network.setNumberOfObjectsToFetch(busstops.length);
        busstopsWithLineNumber = [];

        busstops.forEach( busstop => {
            busstopsWithLineNumber.push(Network.getBusstopWithLineNumber(busstop.id,actualSchedule.id));
        });

        Network.resetObjectsCounter();
        console.log("bus stops with line number fetched");

        console.log("start fetching lines at bus stop");

        let numberOfLinesAtBusstopRequests = 0;

        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                numberOfLinesAtBusstopRequests++;
                            });
                        }
                    )
            }
        );

        Network.resetObjectsCounter();
        Network.setNumberOfObjectsToFetch(numberOfLinesAtBusstopRequests);
        linesAtBusstop = [];

        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                linesAtBusstop.push(Network.getLineAtBusstop(busstopOnLine.busstop,lineWithBusstopPosition.line_no,actualSchedule.id));
                            });
                        }
                    )
            }
        );
        console.log("lines at bus stops fetched");
        console.log("data from ZTM downloaded");
    },

    saveDataToDatabase(){
        Database.saveToFile('schedules.txt',schedules);
        Database.saveToFile('lines.txt',lines);
        Database.saveToFile('linesWithBusstopsPosition.txt',linesWithBusstopsPosition);
        Database.saveToFile('busstops.txt',busstops);
        Database.saveToFile('busstopsWithLineNumber.txt',busstopsWithLineNumber);
        Database.saveToFile('linesAtBusstop.txt',linesAtBusstop);
    },

    getDataFromDatabase(){
        schedules = Database.readTextFile("schedules.txt");
        lines = Database.readTextFile("lines.txt");
        linesWithBusstopsPosition = Database.readTextFile("linesWithBusstopsPosition.txt");
        busstops = Database.readTextFile("busstops.txt");
        busstopsWithLineNumber = Database.readTextFile("busstopsWithLineNumber.txt");
        linesAtBusstop = Database.readTextFile("linesAtBusstop.txt");
    },

    prepareBusstopsBeforeCalculateResults(){

        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                let preparedBusstop = {};

                                preparedBusstop.line_no = lineWithBusstopPosition.line_no;
                                preparedBusstop.schedule_id = lineWithBusstopPosition.schedule_id;
                                preparedBusstop.direction_name = direction.direction_name;

                                preparedBusstop.id = busstopOnLine.busstop;
                                preparedBusstop.position = busstopOnLine.position-1;

                                let busstop = busstops.find(busStop => {return busStop.id === preparedBusstop.id});
                                preparedBusstop.latitude = busstop.latitude;
                                preparedBusstop.longitude = busstop.longitude;

                                let lineAtBusstop = linesAtBusstop.find((lineAtBusstop) => {
                                    return (preparedBusstop.line_no === lineAtBusstop.line_no && lineAtBusstop.busstop_no === preparedBusstop.id);
                                });

                                if (lineAtBusstop !== undefined && lineAtBusstop.data!== undefined)
                                {
                                    preparedBusstop.discription = lineAtBusstop.data.opis;
                                    preparedBusstop.legend = lineAtBusstop.data.legenda;

                                    if(lineAtBusstop.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']){
                                        preparedBusstop.hours =
                                            this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']);
                                    }
                                    else if(lineAtBusstop.data.godziny['POWSZEDNI LETNI']){
                                        preparedBusstop.hours =
                                            this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny['POWSZEDNI LETNI']);
                                    }
                                    else{
                                        preparedBusstop.hours =
                                            this.flatHoursTableToTableOfMinutes(lineAtBusstop.data.godziny);
                                    }
                                }
                                if(preparedBusstop.hours!==undefined && preparedBusstop.hours.length>0)
                                    preparedBusstops.push(preparedBusstop);
                            });
                        }
                    )
            }
        );
    },

    flatHoursTableToTableOfMinutes(hours){
        let tableOfMinutes = [];
        for(let hour in hours){
            if (hours.hasOwnProperty(hour) && hours[hour] instanceof Array) {
                hours[hour].forEach( minute => {
                    if(/^\d+$/.test(minute))
                    tableOfMinutes.push(parseInt(hour)*60+parseInt(minute));
                })
            }
        }
        return tableOfMinutes;
    },

    calculateResults() {
        let previousTime;
        let actualDiscription;
        let actualLegend;
        for(let preparedBusStopPosition=0;preparedBusStopPosition<preparedBusstops.length;preparedBusStopPosition++){
            if(preparedBusstops[preparedBusStopPosition].position!==0){
                if(preparedBusstops[preparedBusStopPosition].discription!==actualDiscription ||
                    preparedBusstops[preparedBusStopPosition].legend!==actualLegend)
                    continue;

                let time = this.findTime(preparedBusstops[preparedBusStopPosition].hours,previousTime,false);
                let timeDifrence = time - previousTime;
                let finalResult = {};
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
            }
            else
            {
                previousTime = this.findTime(preparedBusstops[preparedBusStopPosition].hours,preferedStartHour*60,true);
                actualDiscription = preparedBusstops[preparedBusStopPosition].discription;
                actualLegend = preparedBusstops[preparedBusStopPosition].legend;
            }
        }
        let savedResult;
        Database.saveToFile("finalResults.txt",finalResults);
        savedResult=(ExportCSV.prepare(finalResults));
        ExportCSV.download(savedResult);
    },

    findTime(hours,previousTime,firstTime) {
        if(!firstTime)
        hours = hours.filter(hour => hour>=previousTime);
        let wantedTime = hours[0];

        hours.forEach(hour =>{
                if(Math.abs(previousTime - hour) < Math.abs(previousTime - wantedTime))
                    wantedTime = hour;
        });
        return wantedTime;
    }
};
