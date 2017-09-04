import Network from './Network';
import ExportCSV from './ExportCSV'
import Database from './Database'

let schedules = {};
let lines = {};
let busstops = {};
let linesWithBusstopsPosition = {};
let busstopsWithLineNumber = {};
let linesAtBusstop = {};
let test = [];

let finalResults = [];

let preferedHour = 7;
let minutesOfPreferedStartHour = preferedHour*60;

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
        linesWithBusstopsPosition = Database.readTextFile("testData.txt");
        busstops = Database.readTextFile("busstops.txt");
        busstopsWithLineNumber = Database.readTextFile("busstopsWithLineNumber.txt");
        linesAtBusstop = Database.readTextFile("linesAtBusstop.txt");
    },

    calculateResults(){
        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            for(let busstopOnLinePosition=0;busstopOnLinePosition<direction.data.length;busstopOnLinePosition++){
                                let finalResult = {};

                                finalResult.line_no = lineWithBusstopPosition.line_no;
                                finalResult.direction_name = direction.direction_name;
                                finalResult.id = direction.data[busstopOnLinePosition].busstop;
                                finalResult.position = direction.data[busstopOnLinePosition].position-1;

                                let busstop = busstops.find(busStop => {return busStop.id === finalResult.id});
                                finalResult.latitude = busstop.latitude;
                                finalResult.longitude = busstop.longitude;

                                let lineAtBusstop = linesAtBusstop.find((lineAtBusstop) => {
                                    return (finalResult.line_no === lineAtBusstop.line_no && lineAtBusstop.busstop_no === finalResult.id);
                                });

                                if (lineAtBusstop !== undefined && lineAtBusstop.data!== undefined)
                                {
                                    direction.data[busstopOnLinePosition].hours = lineAtBusstop.data.godziny[Object.keys(lineAtBusstop.data.godziny)[0]];
                                    //direction.graphOfAccessPoints = this.createGraphOfAccessPoints(direction.data[busstopOnLinePosition].hours);
                                    if(direction.data[busstopOnLinePosition].hours!==undefined && Object.keys(direction.data[busstopOnLinePosition].hours).length>0)
                                    {
                                        if(busstopOnLinePosition>0){
                                            let previousTime = this.findTime(direction.data[busstopOnLinePosition-1].hours,minutesOfPreferedStartHour);
                                            finalResult.timeDifrence = this.findTime(direction.data[busstopOnLinePosition].hours,previousTime)-previousTime;
                                            let hourAttempt=4;
                                            while(isNaN(finalResult.timeDifrence)){
                                                previousTime = this.findTime(direction.data[busstopOnLinePosition-1].hours,hourAttempt);
                                                finalResult.timeDifrence = this.findTime(direction.data[busstopOnLinePosition].hours,previousTime)-previousTime;
                                                hourAttempt++;
                                                if(hourAttempt>23)
                                                    break;
                                            }
                                            if(!isNaN(finalResult.timeDifrence)){
                                                let testValue = finalResult;
                                                testValue.graphOfAccessPoints=direction.graphOfAccessPoints;
                                                testValue.hours=direction.data[busstopOnLinePosition].hours;
                                                test.push(testValue);
                                                finalResults.push(finalResult);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    )
            }
        );

        Database.saveToFile('test.txt',test);
        Database.saveToFile('finalResults.txt',finalResults);
        let savedResult=(ExportCSV.prepare(finalResults));
        ExportCSV.download(savedResult);
    },

    findTime(hours, preferedHour){
        for(let hour in hours){
            for(let minutePosition = 0;minutePosition<hours[hour].length;minutePosition++){
                let minutes = hours[hour][minutePosition];
                let minutesOfHour = parseInt(hour)*60+parseInt(minutes.replace(/\D/g,''));
                if(minutesOfHour>=preferedHour){
                    return minutesOfHour;
                }
            }
        }
    },

    createGraphOfAccessPoints(hours){
        let graphOfAccessPoints = {};
        let allPoints = 0;
        let allAccessPointsNumber = 0;
        for(let hour in hours){
            if (hours.hasOwnProperty(hour) && hours[hour] instanceof Array) {
                hours[hour].forEach( minute => {
                    allPoints++;
                    if((minute).length===3){
                        let graphOfAccessPointKey = minute.charAt(2);
                        if(Object.keys(graphOfAccessPoints).indexOf(graphOfAccessPointKey)===-1){
                            graphOfAccessPoints[graphOfAccessPointKey]=1;
                            allAccessPointsNumber++;
                        }
                        else{
                            graphOfAccessPoints[graphOfAccessPointKey]++;
                            allAccessPointsNumber++;
                        }
                    }
                })
            }
        }
        graphOfAccessPoints['normal'] = allPoints - allAccessPointsNumber;
        graphOfAccessPoints['allPoints'] = allPoints;
        return graphOfAccessPoints;
    }
};