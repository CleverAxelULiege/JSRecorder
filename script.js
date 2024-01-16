"use strict";
import { Device } from "./Device.js";
import { Recorder } from "./Recorder.js";

// onbeforeunload = (event) => {
//     event.preventDefault();
//     event.returnValue = true;
// };

const VIDEO_CONSTRAINT = {
    width: 854,
    height: 480,
    frameRate : {ideal: 24, max : 24},
    facingMode: "user",
    deviceId : null,
};

const AUDIO_CONSTRAINT = {
    deviceId: null
};
/**
 * @type {{audio:boolean, video:boolean}|
 * {audio:{deviceId:string|null}, video:{width:number, height:number, frameRate:{ideal:number, max:number}, facingMode:string, deviceId:string|null}}}
 */
let recorderConstraints = {
    audio: false,
    video: false,
};

const MAIN = document.querySelector("main");

//Contiendra les messages d'erreur si aucun périphérique détecté/aucune permission
const ERROR_BOX = document.querySelector(".error_box");
const GOT_PERMISSION_TO_RECORD_FROM_SITE = document.getElementById("permission_to_record_from_site");

//container des select de périphérique
const DEVICES_CONTAINER = document.querySelector(".devices");
const AUDIO_DEVICE_SELECT = document.getElementById("audio_device_select");
const VIDEO_DEVICE_SELECT = document.getElementById("video_device_select")

let device = new Device();

/** @type {null|Recorder}*/
let recorder = null;


asyncAskPermissionsAndDetectDevices();

/**
 * Retire le "formulaire" pour enregistrer une vidéo depuis le site.
 */
function removePossibilityToRecordFromSite() {
    MAIN.removeChild(GOT_PERMISSION_TO_RECORD_FROM_SITE);
}

/**
 * Mettra à jour le deviceId.
 * Vu que l'objet est passé par référence à Recorder, cela se mettra à jour
 */
function updateDeviceIdInConstraintFromSelect(){
    if(recorderConstraints.audio){
        AUDIO_DEVICE_SELECT.addEventListener("change", (e) => {
            recorderConstraints.audio.deviceId = e.target.value;
        });
    }
    
    if(recorderConstraints.video){
        VIDEO_DEVICE_SELECT.addEventListener("change", (e) => {
            recorderConstraints.video.deviceId = e.target.value;
        });
    }
}

/**
 * 
 * @param {string|null} audioDeviceId 
 * @param {string|null} videoDeviceId 
 * Va mettre à jour l'objet recorderConstraints avec les paramètres accummulés.
 */
function setRecorderConstraints(audioDeviceId, videoDeviceId){
    if(recorderConstraints.video){
        recorderConstraints.video = {...VIDEO_CONSTRAINT};
        recorderConstraints.video.deviceId = videoDeviceId;
    }

    if(recorderConstraints.audio){
        recorderConstraints.audio = {...AUDIO_CONSTRAINT};
        recorderConstraints.audio.deviceId = audioDeviceId;
    }
}

/**
 * Retirera la sélection de périphérique disponible en fonction de ce qui existe/a été autorisé
 */
function tryToRemoveSelectableDevices() {
    if (!recorderConstraints.audio) {
        DEVICES_CONTAINER.removeChild(document.querySelector(".device_container.audio_device"));
    }

    if (!recorderConstraints.video) {
        DEVICES_CONTAINER.removeChild(document.querySelector(".device_container.video_device"));
    }
}

/**
 * 
 * @param {string|null} audioDeviceId 
 * @param {string|null} videoDeviceId
 * Va populate les select en fonction des periphériques disponibles.
 * Je me serts des deviceIds pour sélectionner celui choisi par la boite de dialogue.
 */
function enumerateDevicesInSelect(audioDeviceId, videoDeviceId) {
    navigator.mediaDevices.enumerateDevices()
        .then((_devices) => {
            _devices.forEach((_device) => {
                switch (_device.kind) {
                    case "videoinput":
                        if (recorderConstraints.video) {
                            VIDEO_DEVICE_SELECT.appendChild(createOptionDevice(_device, _device.deviceId == videoDeviceId));
                        }
                        break;
                    case "audioinput":
                        if (recorderConstraints.audio) {
                            AUDIO_DEVICE_SELECT.appendChild(createOptionDevice(_device, _device.deviceId == audioDeviceId));
                        }
                        break;
                }
            });
        });
}

/**
 * @param {MediaDeviceInfo} device
 * @param {boolean} selected
 */
function createOptionDevice(device, selected) {
    let option = document.createElement("option");
    option.textContent = device.label;
    option.value = device.deviceId;
    option.selected = selected;
    return option;
}

/**
 * Demande/détecte les périphériques d'entrée et mettra à jour le DOM et les contraintes de mediaDevice en fonction des scénarios
 */
async function asyncAskPermissionsAndDetectDevices(){
    try{
        let _device = await device.askPermissions();
        recorderConstraints.audio = _device.audio.hasPermission && _device.audio.exists;
        recorderConstraints.video = _device.video.hasPermission && _device.video.exists;

        //permission accordée on peut afficher le "formulaire"
        GOT_PERMISSION_TO_RECORD_FROM_SITE.classList.remove("hidden");

        tryToRemoveSelectableDevices();
        enumerateDevicesInSelect(_device.audio.deviceId, _device.video.deviceId);
        setRecorderConstraints(_device.audio.deviceId, _device.video.deviceId);
        updateDeviceIdInConstraintFromSelect();
        initRecording();

    }catch(status){
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
                ERROR_BOX.innerHTML = `<p>Une erreur inconnue est survenue. Contactez le responsable.</p>`;
                break;
        }

        removePossibilityToRecordFromSite();
    }
}


function initRecording() {
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