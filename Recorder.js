const VIDEO_CONSTRAINT = {
    width: 854,
    height: 480,
    frameRate : {ideal: 24, max : 24},
    facingMode: "user",
};

export class Recorder {
    /**
     * @param {HTMLButtonElement} startRecordingButton 
     * @param {HTMLButtonElement} stopRecordingButton
     * @param {HTMLButtonElement} downloadButton
     * @param {HTMLVideoElement} previewVideo 
     * @param {HTMLVideoElement} recordedVideo 
     */
    constructor(
        startRecordingButton,
        stopRecordingButton,
        downloadButton,
        previewVideo,
        recordedVideo,
        constraints = { video: true, audio: true }
    ) {
        /**@type {HTMLButtonElement} */
        this.startRecordingButton = startRecordingButton;
        /**@type {HTMLButtonElement} */
        this.stopRecordingButton = stopRecordingButton;
        /**@type {HTMLButtonElement} */
        this.downloadButton = downloadButton;
        /**@type {HTMLVideoElement} */
        this.previewVideo = previewVideo;
        /**@type {HTMLVideoElement} */
        this.recordedVideo = recordedVideo;


        /**@type {{video:boolean, audio:boolean}} */
        this.constraints = constraints;

        if(constraints.video){
            this.constraints.video = {...VIDEO_CONSTRAINT}
        }


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