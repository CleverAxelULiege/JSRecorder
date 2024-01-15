import { Device } from "./Device.js";
import { Recorder } from "./Recorder.js";

const MAIN = document.querySelector("main");
const ERROR_BOX = document.querySelector(".error_box");
const GOT_PERMISSION_TO_RECORD_FROM_SITE = document.getElementById("permission_to_record_from_site");
//Liste déroulante de sélection de périphérique
const DEVICES_CONTAINER = document.querySelector(".devices");
const AUDIO_DEVICE_SELECT = document.getElementById("audio_device_select");
const VIDEO_DEVICE_SELECT = document.getElementById("video_device_select")

let device = new Device();
let recorder = null;
let recorderConstraints = {
    audio: false,
    video: false,
}

device.askPermissions()
    .then((_device) => {
        recorderConstraints.audio = _device.audio.hasPermission && _device.audio.exists;
        recorderConstraints.video = _device.video.hasPermission && _device.video.exists;
        GOT_PERMISSION_TO_RECORD_FROM_SITE.classList.remove("hidden");

        tryToRemoveSelectableDevices();
        enumerateDevicesInSelect();
        initRecording(recorderConstraints);
    })
    .catch((status) => {
        let msg = "Il vous est impossible d'enregistrer une vidéo depuis le site.<br><br>Néanmoins, vous avez toujours la possibilité d'upload(ou télécharger en amont) une vidéo enregistrée personnellement."
        switch (status) {
            case device.statusNoAudioNoVideo:
                ERROR_BOX.innerHTML = `<p>Aucun périphérique (audio ou vidéo) d'enregistrement n'a été détécté. ${msg}</p>`;
                break;
            case device.statusNoPermissionsForBoth:
                ERROR_BOX.innerHTML = `<p>Vous n'avez pas donné votre accord pour utiliser votre micro et/ou votre caméra. ${msg}</p>`;
                break;
            case device.statusNoPermissionAudioButCanVideo:
                ERROR_BOX.innerHTML = `<p>Vous ne pouvez pas enregistrer une vidéo sans son, veuillez donner votre accord pour utiliser votre micro. ${msg}</p>`;
                break;
            default:
                ERROR_BOX.innerHTML = '<p>Une erreur inconnue est survenue.</p>';
                break;
        }

        removePossibilityToRecordFromSite();
    });

function removePossibilityToRecordFromSite() {
    MAIN.removeChild(GOT_PERMISSION_TO_RECORD_FROM_SITE);
}

/**
 * Retirera la sélection de périphérique disponible en fonction de ce qui existe/a été autorisé
 */
function tryToRemoveSelectableDevices(){
    if(!recorderConstraints.audio){
        DEVICES_CONTAINER.removeChild(document.querySelector(".device_container.audio_device"));
    }
    
    if(!recorderConstraints.video){
        DEVICES_CONTAINER.removeChild(document.querySelector(".device_container.video_device"));
    }
}

/**
 * Populate les select disponibles en fonction des périphériques branchés
 */
function enumerateDevicesInSelect(){
    navigator.mediaDevices.enumerateDevices()
    .then((_devices) => {
        _devices.forEach((_device) => {
            switch(_device.kind){
                case "videoinput":
                    if(recorderConstraints.video){
                        VIDEO_DEVICE_SELECT.appendChild(createOptionDevice(_device));
                    }
                    break;
                case "audioinput":
                    if(recorderConstraints.audio){
                        AUDIO_DEVICE_SELECT.appendChild(createOptionDevice(_device));
                    }
                    break;
            }
        })
    })
}

function createOptionDevice(device){
    let option = document.createElement("option");
    option.textContent = device.label;
    option.value = device.deviceId
    return option;
}

function initRecording(recorderConstraints) {
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

    recorder = new Recorder(
        START_RECORDING_BUTTON,
        STOP_RECORDING_BUTTON,
        DOWNLOAD_BUTTON,
        PREVIEW_VIDEO,
        RECORDED_VIDEO,
        recorderConstraints
    );

    recorder.startStreamingToPreviewVideo();
}