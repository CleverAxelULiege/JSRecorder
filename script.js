import { Recorder } from "./Recorder.js";

(() => {
    let recorderConstraints = {
        audio: true,
        video: true,
    }


    /** @type {HTMLButtonElement}*/
    const START_RECORDING_BUTTON = document.getElementById("start_recording_button");
    /** @type {HTMLButtonElement}*/
    const STOP_RECORDING_BUTTON = document.getElementById("stop_recording_button");

    /** @type {HTMLVideoElement}*/
    const PREVIEW_VIDEO = document.getElementById("preview_video");
    /** @type {HTMLVideoElement}*/
    const RECORDED_VIDEO = document.getElementById("recorded_video");

    let recorder = new Recorder(
        START_RECORDING_BUTTON,
        STOP_RECORDING_BUTTON,
        PREVIEW_VIDEO,
        RECORDED_VIDEO,
        recorderConstraints
    );
})();