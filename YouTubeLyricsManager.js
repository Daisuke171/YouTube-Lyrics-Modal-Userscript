// ==UserScript==
// @name         YouTube Lyrics Manager
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Lyrics panel con guardado automático + export/import JSON
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let currentVideoId = null;
    let panel = null;
    let lastUrl = location.href;

    // ============================
    // VIDEO ID
    // ============================
    function getVideoId() {
        const url = new URL(window.location.href);
        return url.searchParams.get("v");
    }

    function getStorageKey(videoId) {
        return "yt_lyrics_" + videoId;
    }

    // ============================
    // STORAGE
    // ============================
    function saveLyrics(text) {
        if (!currentVideoId) return;
        localStorage.setItem(getStorageKey(currentVideoId), text);
    }

    function loadLyrics(videoId) {
        if (!videoId) return "";
        return localStorage.getItem(getStorageKey(videoId)) || "";
    }

    function savePosition(left, top) {
        localStorage.setItem("yt_lyrics_position", JSON.stringify({ left, top }));
    }

    function loadPosition() {
        const pos = localStorage.getItem("yt_lyrics_position");
        return pos ? JSON.parse(pos) : null;
    }

    // ============================
    // BOTÓN EN #owner
    // ============================
    function createButton() {

        if (document.getElementById("yt-lyrics-btn")) return;

        const owner = document.querySelector("#owner");
        if (!owner) return;

        const btn = document.createElement("button");
        btn.id = "yt-lyrics-btn";
        btn.textContent = "Lyrics";

        Object.assign(btn.style, {
            marginLeft: "12px",
            padding: "6px 16px",
            background: "#272727",
            color: "white",
            border: "1px solid #3f3f3f",
            borderRadius: "18px",
            cursor: "pointer",
            fontSize: "14px",
            height: "36px"
        });

        owner.appendChild(btn);
        btn.addEventListener("click", togglePanel);
    }

    // ============================
    // PANEL
    // ============================
    function createPanel() {

        if (panel) return;

        panel = document.createElement("div");

        Object.assign(panel.style, {
            position: "fixed",
            width: "420px",
            height: "520px",
            background: "#181818",
            border: "1px solid #333",
            borderRadius: "12px",
            display: "none",
            flexDirection: "column",
            zIndex: "9999",
            boxShadow: "0 0 25px rgba(0,0,0,0.6)"
        });

        const savedPos = loadPosition();
        if (savedPos) {
            panel.style.left = savedPos.left + "px";
            panel.style.top = savedPos.top + "px";
        } else {
            panel.style.top = "120px";
            panel.style.right = "50px";
        }

        // ============================
        // HEADER
        // ============================
        const header = document.createElement("div");
        Object.assign(header.style, {
            padding: "8px 12px",
            background: "#202020",
            cursor: "move",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            userSelect: "none"
        });

        const title = document.createElement("span");
        title.textContent = "Lyrics";
        header.appendChild(title);

        // ⚙ SETTINGS BUTTON
        const settingsBtn = document.createElement("button");
        settingsBtn.textContent = "⚙";
        Object.assign(settingsBtn.style, {
            background: "transparent",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px"
        });

        header.appendChild(settingsBtn);
        panel.appendChild(header);

        // ============================
        // ACTION MENU (hidden)
        // ============================
        const actionMenu = document.createElement("div");
        Object.assign(actionMenu.style, {
            display: "none",
            flexDirection: "column",
            background: "#2a2a2a"
        });

        function createMenuButton(text) {
            const btn = document.createElement("button");
            btn.textContent = text;
            Object.assign(btn.style, {
                padding: "10px",
                background: "#2a2a2a",
                color: "white",
                border: "none",
                cursor: "pointer",
                textAlign: "left"
            });
            btn.onmouseenter = () => btn.style.background = "#3a3a3a";
            btn.onmouseleave = () => btn.style.background = "#2a2a2a";
            return btn;
        }

        const exportBtn = createMenuButton("Export JSON");
        const importBtn = createMenuButton("Import JSON");

        actionMenu.appendChild(exportBtn);
        actionMenu.appendChild(importBtn);
        panel.appendChild(actionMenu);

        settingsBtn.onclick = () => {
            actionMenu.style.display =
                actionMenu.style.display === "none" ? "flex" : "none";
        };

        // ============================
        // TEXTAREA
        // ============================
        const textarea = document.createElement("textarea");

        Object.assign(textarea.style, {
            flex: "1",
            background: "#121212",
            color: "white",
            border: "none",
            padding: "12px",
            resize: "none",
            fontSize: "14px",
            outline: "none"
        });

        textarea.addEventListener("input", () => {
            saveLyrics(textarea.value);
        });

        panel.appendChild(textarea);
        document.body.appendChild(panel);

        // ============================
        // EXPORT
        // ============================
        exportBtn.onclick = () => {

            const data = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key.startsWith("yt_lyrics_")) {
                    const videoId = key.replace("yt_lyrics_", "");
                    const lyrics = localStorage.getItem(key);

                    data.push({
                        videoId,
                        url: "https://www.youtube.com/watch?v=" + videoId,
                        lyrics
                    });
                }
            }

            const blob = new Blob(
                [JSON.stringify(data, null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "youtube_lyrics_backup.json";
            a.click();
            URL.revokeObjectURL(url);
        };

        // ============================
        // IMPORT (merge)
        // ============================
        importBtn.onclick = () => {

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (event) {
                    try {
                        const data = JSON.parse(event.target.result);

                        data.forEach(item => {
                            if (item.videoId && item.lyrics) {
                                localStorage.setItem(
                                    getStorageKey(item.videoId),
                                    item.lyrics
                                );
                            }
                        });

                        alert("Import successful ✔");

                        if (currentVideoId) {
                            textarea.value = loadLyrics(currentVideoId);
                        }

                    } catch (err) {
                        alert("Invalid JSON file ❌");
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        };

        // ============================
        // DRAG
        // ============================
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const left = e.clientX - offsetX;
            const top = e.clientY - offsetY;
            panel.style.left = left + "px";
            panel.style.top = top + "px";
            panel.style.right = "auto";
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                savePosition(panel.offsetLeft, panel.offsetTop);
            }
            isDragging = false;
        });
    }

    function togglePanel() {
        createPanel();
        const textarea = panel.querySelector("textarea");

        if (panel.style.display === "none") {
            currentVideoId = getVideoId();
            textarea.value = loadLyrics(currentVideoId);
            panel.style.display = "flex";
        } else {
            panel.style.display = "none";
        }
    }

    // ============================
    // SPA DETECTION
    // ============================
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            currentVideoId = getVideoId();
            const textarea = panel?.querySelector("textarea");
            if (textarea) textarea.value = loadLyrics(currentVideoId);
        }
    }, 1000);

    const observer = new MutationObserver(createButton);
    observer.observe(document.body, { childList: true, subtree: true });

})();
