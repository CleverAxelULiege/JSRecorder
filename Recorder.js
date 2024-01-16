export class Recorder {
    /**
     * @param {{
     * startRecordingButton:HTMLButtonElement, 
     * stopRecordingButton:HTMLButtonElement,
     * pauseResumeRecordingButton:HTMLButtonElement,
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

        /**@type {HTMLButtonElement} */
        this.pauseResumeRecordingButton = element.pauseResumeRecordingButton;

        /**@type {HTMLButtonElement|null} */
        this.toggleVideoDeviceButton = element.toggleVideoDeviceButton;

        /**@type {HTMLButtonElement} */
        this.downloadButton = element.downloadButton || document.createElement("a");


        /**@type {HTMLVideoElement} */
        this.previewVideo = element.previewVideo;

        /**@type {HTMLVideoElement} */
        this.recordedVideo = element.recordedVideo;

        /**@type {HTMLSpanElement} */
        this.timeElapsedSpan = this.startRecordingButton.querySelector(".time_elapsed");


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

        this.idInterval = null;
        this.timeElapsedInSeconds = 0;
        this.recordStarted = false;
        this.isRecordPaused = false;

        this.initEventListeners();
    }


    initEventListeners() {
        this.startRecordingButton.addEventListener("click", () => {
            if (this.recordStarted) {
                window.alert("The recording already started.");
                return;
            }

            this.startRecording();
        });

        this.stopRecordingButton.addEventListener("click", () => {
            if (!this.recordStarted || this.mediaRecorder == null) {
                window.alert("No recording started or no recorder set.")
                return;
            }
            this.stopRecording();
        })

        this.pauseResumeRecordingButton.addEventListener("click", () => {
            if (!this.recordStarted || this.mediaRecorder == null) {
                window.alert("No recording started or no recorder set.")
                return;
            }

            if (this.isRecordPaused) {
                this.resumeRecording();
            } else {
                this.pauseRecording();
            }

            this.isRecordPaused = !this.isRecordPaused;
        })

        this.toggleVideoDeviceButton.addEventListener("click", () => {
            this.toggleVideoDevice();
        })
    }

    toggleVideoDevice() {
        if (!this.constraints.video) {
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
                    console.info("Started streaming to the preview video.");
                    resolve();
                });
        })
    }

    startCounterTimeElapsed() {
        this.recordStarted = true;
        this.startRecordingButton.classList.add("active");
        this.timeElapsedSpan.classList.remove("hidden");
        this.stopRecordingButton.classList.remove("hidden");
        this.pauseResumeRecordingButton.classList.remove("hidden");
        this.startRecordingButton.querySelector(".circle").classList.add("blink_animation");
        this.startRecordingButton.querySelector(".title").classList.add("hidden");
        let offsetLeft = this.startRecordingButton.offsetLeft - 10;

        this.startRecordingButton.style.transform = `translateX(-${offsetLeft}px)`;

        this.timeElapsedInSeconds = 0;
        clearInterval(this.idInterval);

        this.formaTimeInCounter();
        this.startInterval();
    }

    startInterval() {
        this.idInterval = setInterval(() => {
            this.timeElapsedInSeconds += 1;
            this.formaTimeInCounter();
        }, 1000);
    }

    formaTimeInCounter() {
        let minute = Math.floor(this.timeElapsedInSeconds / 60);
        let second = this.timeElapsedInSeconds % 60;

        let minuteFormat = minute < 10 ? `0${minute}` : minute;
        let secondFormat = second < 10 ? `0${second}` : second;

        this.timeElapsedSpan.innerText = `${minuteFormat}:${secondFormat}`;
    }



    startRecording() {
        if (this.mediaStream == null) {
            window.alert("No stream available.");
            return;
        }
        this.mediaRecorder = new MediaRecorder(this.mediaStream);
        this.initEventListenersOnMediaRecorder();
        this.startCounterTimeElapsed();
        this.mediaRecorder.start();
    }

    initEventListenersOnMediaRecorder() {

        this.mediaRecorder.ondataavailable = (blobEvent) => {
            this.recordedChunks.push(blobEvent.data);
        }

        this.mediaRecorder.onstop = (event) => {
            console.info("Stopped the recording");
            // let recordedBlob = new Blob(this.recordedChunks, { type: "video/webm" });
            let recordedBlob = new Blob(this.recordedChunks, { type: "video/webm" });

            this.clearObjectURL();
            this.recordedVideo.src = URL.createObjectURL(recordedBlob);

            this.downloadButton.href = this.recordedVideo.src;
            this.downloadButton.download = "RecordedVideo.webm";
        }
    }

    clearObjectURL() {
        URL.revokeObjectURL(this.recordedVideo.src);
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
        this.isRecordPaused = false;

        clearInterval(this.idInterval);

        if (this.recordStarted)
            this.mediaRecorder.pause();

        this.startRecordingButton.querySelector(".circle").classList.remove("blink_animation");
        this.pauseResumeRecordingButton.querySelector(".pause_icon").classList.remove("hidden");
        this.pauseResumeRecordingButton.querySelector(".resume_icon").classList.add("hidden");

        if (this.recordStarted)
            this.mediaRecorder.stop();

        this.recordStarted = false;
        this.startRecordingButton.classList.remove("active");
        this.timeElapsedSpan.classList.add("hidden");
        this.stopRecordingButton.classList.add("hidden");
        this.pauseResumeRecordingButton.classList.add("hidden");
        this.startRecordingButton.querySelector(".circle").classList.remove("blink_animation");
        this.startRecordingButton.querySelector(".title").classList.remove("hidden");
        this.startRecordingButton.style.transform = ``;
        clearInterval(this.idInterval);
    }

    pauseRecording() {
        clearInterval(this.idInterval);

        if (this.recordStarted)
            this.mediaRecorder.pause();

        this.startRecordingButton.querySelector(".circle").classList.remove("blink_animation");
        this.pauseResumeRecordingButton.querySelector(".pause_icon").classList.add("hidden");
        this.pauseResumeRecordingButton.querySelector(".resume_icon").classList.remove("hidden");
        this.pauseResumeRecordingButton.title = "Reprendre l'enregistrement";
    }

    resumeRecording() {
        this.startRecordingButton.querySelector(".circle").classList.add("blink_animation");
        this.startInterval();

        if (this.recordStarted)
            this.mediaRecorder.resume();

        this.pauseResumeRecordingButton.querySelector(".pause_icon").classList.remove("hidden");
        this.pauseResumeRecordingButton.querySelector(".resume_icon").classList.add("hidden");
        this.pauseResumeRecordingButton.title = "Mettre en pause l'enregistrement";
    }
}