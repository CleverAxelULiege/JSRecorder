const NO_DEVICE_DETECTED = 8;
const PERMISSION_DENIED = 0;
export class Peripheral {
    constructor() {

    }

    /**@returns {Promise<{audio:{exist:boolean, hasPermission:boolean}, video:{exist:boolean, hasPermission:boolean}}>} */
    askPermissionsToDevices(){
        return new Promise((resolve) => {            
            Promise.all([this.askAudioPermission(), this.askVideoPermission()]).then((values) => {
                resolve({
                    audio : values[0],
                    video : values[1]
                })
            });
        })
    }

    /**@returns {Promise<{exist:boolean, hasPermission:boolean}>} */
    askAudioPermission(){
        return new Promise((resolve) => {
            let constraint = {
                exist : false,
                hasPermission : false,
            }
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                constraint.exist = true;
                constraint.hasPermission = true;
                resolve(constraint);
            })
            .catch((err) => {
                //the error is a DOMException
                //https://developer.mozilla.org/en-US/docs/Web/API/DOMException
                if(err.code == PERMISSION_DENIED){
                    constraint.exist = true;
                }
                resolve(constraint);
            });
        })
    }

    /**@returns {Promise<{exist:boolean, hasPermission:boolean}>} */
    askVideoPermission(){
        return new Promise((resolve) => {
            let constraint = {
                exist : false,
                hasPermission : false,
            }
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                constraint.exist = true;
                constraint.hasPermission = true;
                resolve(constraint);
            })
            .catch((err) => {
                //the error is a DOMException
                //https://developer.mozilla.org/en-US/docs/Web/API/DOMException
                if(err.code == PERMISSION_DENIED){
                    constraint.exist = true;
                }
                resolve(constraint);
            });
        })
    }
}