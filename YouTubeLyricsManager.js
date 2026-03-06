// ==UserScript==
// @name         YouTube Lyrics Manager
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  Lyrics panel
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
"use strict";

let currentVideoId = null;
let panel = null;
let lastUrl = location.href;

function getVideoId(){
    const url = new URL(window.location.href);
    return url.searchParams.get("v");
}

function getStorageKey(videoId){
    return "yt_lyrics_" + videoId;
}

function saveLyrics(text){
    if(!currentVideoId) return;
    localStorage.setItem(getStorageKey(currentVideoId), text);
}

function loadLyrics(videoId){
    if(!videoId) return "";
    return localStorage.getItem(getStorageKey(videoId)) || "";
}

function createButton(){

    if(document.getElementById("yt-lyrics-btn")) return;

    const owner = document.querySelector("#owner");
    if(!owner) return;

    const btn = document.createElement("button");
    btn.id = "yt-lyrics-btn";
    btn.textContent = "Lyrics";

    Object.assign(btn.style,{
        marginLeft:"12px",
        padding:"6px 16px",
        background:"#272727",
        color:"white",
        border:"1px solid #3f3f3f",
        borderRadius:"18px",
        cursor:"pointer",
        fontSize:"14px",
        height:"36px"
    });

    owner.appendChild(btn);

    btn.onclick = togglePanel;
}

function createPanel(){

    if(panel) return;

    panel = document.createElement("div");

    Object.assign(panel.style,{
        position:"fixed",
        width:"420px",
        height:"520px",
        background:"#181818",
        border:"1px solid #333",
        borderRadius:"12px",
        display:"none",
        flexDirection:"column",
        zIndex:"9999",
        boxShadow:"0 0 25px rgba(0,0,0,0.6)"
    });

    const header = document.createElement("div");

    Object.assign(header.style,{
        padding:"8px 12px",
        background:"#202020",
        cursor:"move",
        color:"white",
        fontWeight:"bold",
        userSelect:"none"
    });

    header.textContent = "Lyrics";

    panel.appendChild(header);

    const textarea = document.createElement("textarea");

    Object.assign(textarea.style,{
        flex:"1",
        background:"#121212",
        color:"white",
        border:"none",
        padding:"12px",
        resize:"none",
        fontSize:"14px",
        outline:"none"
    });

    textarea.oninput = ()=> saveLyrics(textarea.value);

    panel.appendChild(textarea);

    document.body.appendChild(panel);

    // DRAG (solo visual, no guarda posición)

    let dragging=false;
    let offsetX=0;
    let offsetY=0;

    header.onmousedown=(e)=>{
        dragging=true;
        offsetX=e.clientX-panel.offsetLeft;
        offsetY=e.clientY-panel.offsetTop;
    };

    document.onmousemove=(e)=>{

        if(!dragging) return;

        let left=e.clientX-offsetX;
        let top=e.clientY-offsetY;

        const maxLeft=window.innerWidth-panel.offsetWidth;
        const maxTop=window.innerHeight-panel.offsetHeight;

        left=Math.max(0,Math.min(left,maxLeft));
        top=Math.max(0,Math.min(top,maxTop));

        panel.style.left=left+"px";
        panel.style.top=top+"px";
    };

    document.onmouseup=()=> dragging=false;
}

function togglePanel(){

    createPanel();

    const textarea = panel.querySelector("textarea");

    if(panel.style.display==="none"){

        // POSICIÓN FIJA SIEMPRE
        panel.style.left = (window.innerWidth - 470) + "px";
        panel.style.top = "120px";

        currentVideoId = getVideoId();
        textarea.value = loadLyrics(currentVideoId);

        panel.style.display="flex";

    }else{

        panel.style.display="none";
    }
}

setInterval(()=>{

    if(location.href!==lastUrl){

        lastUrl=location.href;
        currentVideoId=getVideoId();

        const textarea=panel?.querySelector("textarea");

        if(textarea)
            textarea.value=loadLyrics(currentVideoId);
    }

},1000);

const observer=new MutationObserver(createButton);

observer.observe(document.body,{
    childList:true,
    subtree:true
});

})();
