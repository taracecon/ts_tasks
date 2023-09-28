import * as express from 'express';
import { SpaceXRocket } from '../core/SpaceXRocket';
import { NasaRocket } from '../core/NasaRocket';
import { MilitaryRocket } from '../core/MilitaryRocket';
import { RocketBase } from '../core/RocketBase';

// new class, created for adding new rockets
import { CustomRocket } from '../core/CustomRocket'; 

const app = express();

// Use process.env.PORT if available, otherwise, use port 2004
const port = process.env.PORT || 2004; 

// IP address template
const ip = '192.168.0.113';  

// dictionary for storing rockets and for their O(1) search
let rocketsDict: { [key: string]: RocketBase } = {};

// create and add rockets to new dictionary
let spacexObj = new SpaceXRocket();
let nasaObj = new NasaRocket();
let militaryObj = new MilitaryRocket();

rocketsDict[spacexObj.name.toLowerCase()] = spacexObj;
rocketsDict[nasaObj.name.toLowerCase()] = nasaObj;
rocketsDict[militaryObj.name.toLowerCase()] = militaryObj;

////////////////////////////////////// GET ////////////////////////////////////

app.get('/list', (req: express.Request, res: express.Response) => {
    let namesList = [];    
    for (const key in rocketsDict) {
        namesList.push(rocketsDict[key].name)
    }

    res.send(namesList.sort());
    console.log(`List of rocket names sorted A-Z is sent`)
});

app.get('/:rocketName', (req: express.Request, res: express.Response) => {  
    // for case insensitive comparison 
    const rocketNameLower = req.params.rocketName.toLowerCase()  
    console.log(`Checking rocket name on server...`);

    // Searching key in dictionary O(1)
    let objByKey = rocketsDict[rocketNameLower];

    if(objByKey) {
        console.log(`Found rocket on server. Its info can be viewed`)
        res.send({
            date: new Date().toISOString(), 
            name: objByKey.name
        })  
    }
    // this (else if block) code is useless and can be commented because when 
    // rocketName is "list" then the previous app.get will be always called 
    // else if (rocketNameLower == "list"){
    //     console.log(`Bad request error. Rocket name cannot be 'list'`)
    //     res.sendStatus(400)
    // }
    else {
        console.log(`Rocket name Not found`)
        res.sendStatus(404)
    };
});

////////////////////////////////////// POST ///////////////////////////////////

// Middleware to parse JSON in the request body
app.use(express.json());

app.post('/add', (req: express.Request, res: express.Response) => {
    const jsonData = req.body;
    console.log(`Json data received in body`)

    let newRocketName = jsonData.name
    if(!newRocketName) {
        throw new Error(`New rocket name is empty ` + 
                        `or not specified in the request body`);
    }
    
    // for searching/adding in/to dictionary
    let newRocketNameLower = newRocketName.toLowerCase();

    // If rocket already exists or name is “list”
    // then send 409 HTTP code with empty body
    if(rocketsDict[newRocketNameLower] || newRocketNameLower == 'list') {
        console.log(`Conflict. Rocket cannot be added because ` + 
                    `its name is 'list' or it already exists`)
        res.sendStatus(409)
    }
    // else add new rocket into dictionary
    else {
        rocketsDict[newRocketNameLower] = new CustomRocket(newRocketName);
        console.log(`Rockets' dictionary updated successfully`)
        res.sendStatus(200)
    }
});

///////////////////////////////// Middleware //////////////////////////////////

// display server info
app.listen(port, () => {
    console.log(`Express server is running at http://${ip}:${port}`);
});

// error-handling middleware
app.use((err: Error, req: express.Request, res: express.Response, 
                                            next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({errorMsg:`A server error occurred: ` + err.message});
});

// middleware for handling 404 errors (any other request should return 404)
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({errorMsg: `Not Found`});
});


