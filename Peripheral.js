export class Peripheral {
    constructor(){

    }

    checkForDevices(){
        let device = {
            audio: false,
            video : false,
        };

        navigator.mediaDevices.getUserMedia({audio: true})
        .catch((err) => {
            
        })
    }
}