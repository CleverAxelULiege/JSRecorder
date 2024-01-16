const DISPLAY_RECORDER_BUTTON = document.querySelector(".display_recorder_button");
const CLOSE_RECORDER_BUTTON = document.querySelector(".close_recorder_button");

//c'est le truc avec un background rgba avec une opacité de ~0.7 et qui contient le retour caméra, bouton etc
const RECORDER_CONTAINER = document.querySelector(".recorder_container");
const RECORDER = document.querySelector(".recorder");

let isRecorderContainerUp = false;

window.addEventListener("click", (e) => {
    if(!isRecorderContainerUp){
        return;
    }
    
    if(e.target.closest(".recorder") == null){
        closeRecorderContainer();
    }
});

CLOSE_RECORDER_BUTTON.addEventListener("click", () => {
    closeRecorderContainer();
})

DISPLAY_RECORDER_BUTTON.addEventListener("click", () => {
    openRecorderContainer();
});

function openRecorderContainer(){
    RECORDER_CONTAINER.classList.remove("hidden");
    document.body.style.overflowY = "hidden";
    setTimeout(() => {
        isRecorderContainerUp = true;
        RECORDER.classList.remove("animation_enter_recorder");
    });
}


function closeRecorderContainer(){
    RECORDER_CONTAINER.classList.add("hidden");
    document.body.style.overflowY = "";
    isRecorderContainerUp = false;
    RECORDER.classList.add("animation_enter_recorder");
}

openRecorderContainer();

