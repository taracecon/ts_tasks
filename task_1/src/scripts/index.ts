import {StarPort} from "./StarPort";

let sp = new StarPort();
let ar = sp.getAllRockets();

for (var i=0; i<ar.length; i++) {
    console.log(`Prepare to the next launch number ${i+1}:`)
    ar[i].launch()
}
