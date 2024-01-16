export class Recorder {
    /**
     * @param {{
     * startRecordingButton:HTMLButtonElement, 
     * stopRecordingButton:HTMLButtonElement,
     * toggleVideoDeviceButton:HTMLButtonElement|null,
     * downloadButton:HTMLButtonElement, 
     * previewVideo:HTMLVideoElement, 
     * recordedVideo:HTMLVideoElement}} element
     */
    constructor(
        element,
        constraints,
    ) {
        /**@type {HTMLButtonElement} */
        this.startRecordingButton = element.startRecordingButton;

        /**@type {HTMLButtonElement} */
        this.stopRecordingButton = element.stopRecordingButton;

        /**@type {HTMLButtonElement|null} */
        this.toggleVideoDeviceButton = element.toggleVideoDeviceButton;

        /**@type {HTMLButtonElement} */
        this.downloadButton = element.downloadButton || document.createElement("a");



        /**@type {HTMLVideoElement} */
        this.previewVideo = element.previewVideo;

        /**@type {HTMLVideoElement} */
        this.recordedVideo = element.recordedVideo;


        /**
        * @type {{audio:boolean, video:boolean}|
        * {audio:{deviceId:string|null}, video:{width:number, height:number, frameRate:{ideal:number, max:number}, facingMode:string, deviceId:string|null}}}
        */
        this.constraints = constraints;

        /**@type {MediaStream|null} */
        this.mediaStream = null;

        /**@type {MediaRecorder|null} */
        this.mediaRecorder = null;
        /**@type {Blob[]} */
        this.recordedChunks = [];

        this.initEventListeners();
    }


    initEventListeners() {
        this.startRecordingButton.addEventListener("click", () => {
            this.asyncStartStreamingAndRecording();
        });

        this.stopRecordingButton.addEventListener("click", () => {
            this.stopStreamingAndRecording();
        })

        this.toggleVideoDeviceButton.addEventListener("click", () => {
            this.toggleVideoDevice();
        })
    }

    toggleVideoDevice() {
        if(!this.constraints.video){
            window.alert("Didn't get the permission to use the video device or it doesn't exist.");
            return;
        }

        this.mediaStream.getVideoTracks()[0].enabled = !this.mediaStream.getVideoTracks()[0].enabled;
        this.toggleVideoDeviceButton.classList.toggle("disabled_by_user");
    }

    async asyncStartStreamingAndRecording() {
        await this.startStreamingToPreviewVideo();
        this.startRecording();
    }

    /**@returns {Promise<void>} */
    startStreamingToPreviewVideo() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(this.constraints)
                .then((stream) => {
                    this.mediaStream = stream;
                    this.previewVideo.srcObject = this.mediaStream;
                    resolve();
                });
        })
    }

    startRecording() {
        this.mediaRecorder = new MediaRecorder(this.mediaStream);
        this.initEventListenersOnMediaRecorder();
        this.mediaRecorder.start();
    }

    initEventListenersOnMediaRecorder() {

        this.mediaRecorder.ondataavailable = (blobEvent) => {
            this.recordedChunks.push(blobEvent.data);
        }

        this.mediaRecorder.onstop = (event) => {
            console.log("stopped the recording");
            // let recordedBlob = new Blob(this.recordedChunks, { type: "video/webm" });
            let recordedBlob = new Blob(this.recordedChunks, { type: "video/webm" });
            this.recordedVideo.src = URL.createObjectURL(recordedBlob);

            this.downloadButton.href = this.recordedVideo.src;
            this.downloadButton.download = "RecordedVideo.webm";
        }
    }

    stopStreamingAndRecording() {
        if (this.mediaStream === null) {
            window.alert("No media stream set, you probably didn't start the recording.");
            return;
        }

        if (this.mediaRecorder === null) {
            window.alert("No media recorder set, you probably didn't start the recording.");
            return;
        }

        this.stopStreamingToPreviewVideo();
        this.stopRecording();
    }

    stopStreamingToPreviewVideo() {
        if (this.constraints.video)
            this.mediaStream.getVideoTracks()[0].enabled = false;

        if (this.constraints.audio)
            this.mediaStream.getAudioTracks()[0].enabled = false;
    }

    stopRecording() {
        this.mediaRecorder.stop();
    }
}