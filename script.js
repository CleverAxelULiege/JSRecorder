import { Device } from "./Device.js";
import { Recorder } from "./Recorder.js";

(() => {
    let peripheral = new Device();

    peripheral.askPermissionsToDevices()
        .then((device) => {
            // if (!device.audio.exists && !device.video.exists) {
            //     window.alert("No audio device and/or video device detected.");
            // }
            // else if (!device.audio.hasPermission && !device.video.hasPermission) {
            //     window.alert("No permission to record from the audio device and/or from the video device.");
            // }
            // else {
            //     let recorderConstraints = {
            //         audio: device.audio.hasPermission && device.audio.exists,
            //         video: device.video.hasPermission && device.video.exists,
            //     };

            //     init(recorderConstraints);
            // }

            if(!checkIfGotCorrectPermissionsToRecord(device)){
                return;
            }

            let recorderConstraints = {
                audio: device.audio.hasPermission && device.audio.exists,
                video: device.video.hasPermission && device.video.exists,
            };
            init(recorderConstraints);

        });

    /**
     * @param {{audio:{exists:boolean, hasPermission:boolean}, video:{exists:boolean, hasPermission:boolean}}} device 
     */
    function checkIfGotCorrectPermissionsToRecord(device) {
        if (!device.audio.exists && !device.video.exists) {
            window.alert("No audio device and/or video device detected.");
            return false;
        }
        else if (!device.audio.hasPermission && !device.video.hasPermission) {
            window.alert("No permission to record from the audio device and/or from the video device.");
            return false;
        }
        else if(!device.audio.hasPermission && device.video.hasPermission){
            window.alert("You can't give the permission to use your video device and exclude your audio device.")
            return false;
        }

        return true;
    }

    function init(recorderConstraints) {
        /** @type {HTMLButtonElement}*/
        const START_RECORDING_BUTTON = document.getElementById("start_recording_button");
        /** @type {HTMLButtonElement}*/
        const STOP_RECORDING_BUTTON = document.getElementById("stop_recording_button");
        /** @type {HTMLButtonElement}*/
        const DOWNLOAD_BUTTON = document.getElementById("download_button");

        /** @type {HTMLVideoElement}*/
        const PREVIEW_VIDEO = document.getElementById("preview_video");
        /** @type {HTMLVideoElement}*/
        const RECORDED_VIDEO = document.getElementById("recorded_video");

        let recorder = new Recorder(
            START_RECORDING_BUTTON,
            STOP_RECORDING_BUTTON,
            DOWNLOAD_BUTTON,
            PREVIEW_VIDEO,
            RECORDED_VIDEO,
            recorderConstraints
        );
    }

})();