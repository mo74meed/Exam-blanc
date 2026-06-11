// Boards & Beyond Study Platform — UI Controller
// Professional study workspace with state management, local video player, and study tools

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------------
    // 1. State Definition
    // -----------------------------------------------
    let state = {
        completedVideos: {},
        completedDates: {},
        videoSources: {},
        videoNotes: {},
        recentVideos: [],
        currentView: "dashboard",
        activeSubjectId: null,
        activeVideoId: null,
        sidebarCollapsed: false
    };

    const subjectColors = {
        gastroenterology: "#6366f1",
        pharmacology: "#22c55e",
        cardiology: "#ef4444",
        pulmonary: "#06b6d4"
    };

    // -----------------------------------------------
    // 2. State Persistence (LocalStorage)
    // -----------------------------------------------
    function loadState() {
        try {
            const c = localStorage.getItem("bb_completed");
            if (c) state.completedVideos = JSON.parse(c);

            const d = localStorage.getItem("bb_completed_dates");
            if (d) state.completedDates = JSON.parse(d);

            const s = localStorage.getItem("bb_sources");
            if (s) state.videoSources = JSON.parse(s);

            const n = localStorage.getItem("bb_notes");
            if (n) state.videoNotes = JSON.parse(n);

            const r = localStorage.getItem("bb_recents");
            if (r) state.recentVideos = JSON.parse(r);

            state.currentView = localStorage.getItem("bb_view") || "dashboard";

            const sub = localStorage.getItem("bb_active_subject");
            if (sub) state.activeSubjectId = sub;

            const vid = localStorage.getItem("bb_active_video");
            if (vid) state.activeVideoId = vid;

            state.sidebarCollapsed = localStorage.getItem("bb_sidebar_collapsed") === "true";
        } catch (e) {
            console.error("Failed to parse LocalStorage data", e);
        }
    }

    function saveState() {
        localStorage.setItem("bb_completed", JSON.stringify(state.completedVideos));
        localStorage.setItem("bb_completed_dates", JSON.stringify(state.completedDates || {}));
        localStorage.setItem("bb_sources", JSON.stringify(state.videoSources));
        localStorage.setItem("bb_notes", JSON.stringify(state.videoNotes));
        localStorage.setItem("bb_recents", JSON.stringify(state.recentVideos));
        localStorage.setItem("bb_view", state.currentView);
        if (state.activeSubjectId) localStorage.setItem("bb_active_subject", state.activeSubjectId);
        if (state.activeVideoId) localStorage.setItem("bb_active_video", state.activeVideoId);
    }

    // -----------------------------------------------
    // 3. Counting Utilities
    // -----------------------------------------------
    function countSubjectVideos(subject) {
        let count = 0;
        subject.sections.forEach(sec => count += sec.videos.length);
        return count;
    }

    function countSubjectCompleted(subject) {
        let count = 0;
        subject.sections.forEach(sec => {
            sec.videos.forEach(v => { if (state.completedVideos[v.id]) count++; });
        });
        return count;
    }

    function formatDuration(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const fs = secs.toString().padStart(2, '0');
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${fs}`;
        return `${mins}:${fs}`;
    }

    function getActiveDaysCount() {
        if (!state.completedDates) return 0;
        const uniqueDays = new Set(Object.values(state.completedDates));
        return uniqueDays.size;
    }

    // -----------------------------------------------
    // 4. Routing Engine
    // -----------------------------------------------
    function navigateTo(viewName, subjectId = null) {
        state.currentView = viewName;

        document.getElementById("dashboardView").style.display = "none";
        document.getElementById("subjectView").style.display = "none";
        document.getElementById("settingsView").style.display = "none";

        // Hide breadcrumbs
        const bc = document.getElementById("headerBreadcrumbs");
        if (bc) bc.style.display = "none";

        if (viewName === "dashboard") {
            document.getElementById("dashboardView").style.display = "block";
            renderSidebarDashboard();
            renderDashboard();
        } else if (viewName === "settings") {
            document.getElementById("settingsView").style.display = "block";
            renderSidebarDashboard();
        } else if (viewName.startsWith("subject-") && subjectId) {
            state.activeSubjectId = subjectId;
            document.getElementById("subjectView").style.display = "block";
            renderSubjectDetail(subjectId);
        }

        saveState();
        document.querySelector(".app-main").scrollTop = 0;
    }

    // -----------------------------------------------
    // 5. Sidebar — Dashboard Mode
    // -----------------------------------------------
    function renderSidebarDashboard() {
        const container = document.getElementById("sidebarDynamicContent");
        if (!container) return;

        container.innerHTML = `
            <div class="sidebar-nav-wrap">
                <div class="sidebar-section-label">Navigation</div>
                <div class="sidebar-nav">
                    <button class="nav-link ${state.currentView === 'dashboard' ? 'active' : ''}" id="navDashboard">
                        <span class="nav-icon">📊</span> Dashboard
                    </button>
                    <button class="nav-link ${state.currentView === 'settings' ? 'active' : ''}" id="navSettings">
                        <span class="nav-icon">⚙️</span> Settings
                    </button>
                </div>

                <div class="sidebar-divider"></div>

                <div class="sidebar-section-label">Search</div>
                <div class="sidebar-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="sidebarSearchInput" placeholder="Filter subjects...">
                </div>

                <div class="sidebar-section-label">Subjects</div>
                <div class="sidebar-subject-list" id="sidebarSubjectsList"></div>

                <div class="sidebar-footer">
                    <a href="https://t.me/USMLEBoardsAndBeyondVideos" target="_blank" class="tg-link">
                        📢 Telegram Channel
                    </a>
                </div>
            </div>
        `;

        const list = document.getElementById("sidebarSubjectsList");
        if (!list) return;

        for (const id in subjects) {
            const subject = subjects[id];
            const total = countSubjectVideos(subject);
            const watched = countSubjectCompleted(subject);

            const btn = document.createElement("button");
            btn.className = `sidebar-subject-btn ${state.activeSubjectId === id && state.currentView.startsWith("subject-") ? 'active' : ''}`;
            btn.id = `side-subj-${id}`;
            btn.addEventListener("click", () => navigateTo(`subject-${id}`, id));

            btn.innerHTML = `
                <span class="subj-left">
                    <span class="subj-icon">${subject.icon}</span>
                    <span class="subj-name">${subject.title}</span>
                </span>
                <span class="subj-count">${watched}/${total}</span>
            `;
            list.appendChild(btn);
        }

        // Search
        const searchInput = document.getElementById("sidebarSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const q = e.target.value.toLowerCase().trim();
                document.querySelectorAll(".sidebar-subject-btn").forEach(item => {
                    const name = item.querySelector(".subj-name").textContent.toLowerCase();
                    item.style.display = name.includes(q) ? "flex" : "none";
                });
                // Also filter dashboard cards
                if (state.currentView === "dashboard") {
                    document.querySelectorAll(".subj-card").forEach(card => {
                        const title = card.querySelector("h4").textContent.toLowerCase();
                        card.style.display = title.includes(q) ? "flex" : "none";
                    });
                }
            });
        }
    }

    // -----------------------------------------------
    // 6. Global Progress & Stats
    // -----------------------------------------------
    function updateGlobalProgress() {
        const all = getAllVideos();
        const total = all.length;
        let completed = 0;
        all.forEach(v => { if (state.completedVideos[v.id]) completed++; });
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Header pill
        const headerStat = document.getElementById("globalHeaderStat");
        if (headerStat) headerStat.textContent = `${completed}/${total}`;

        // Hero ring
        const percentLabel = document.getElementById("globalProgressPercent");
        if (percentLabel) percentLabel.textContent = `${percent}%`;

        const circle = document.getElementById("globalProgressRing");
        if (circle) {
            const r = 42;
            const circ = 2 * Math.PI * r;
            const offset = circ - (percent / 100) * circ;
            circle.style.strokeDasharray = `${circ}`;
            circle.style.strokeDashoffset = offset;
        }

        // Stats cards
        const sp = document.getElementById("statProgress");
        if (sp) sp.textContent = `${percent}%`;

        const sc = document.getElementById("statCompleted");
        if (sc) sc.textContent = `${completed}`;

        const scs = document.getElementById("statCompletedSub");
        if (scs) scs.textContent = `of ${total} total`;

        const ss = document.getElementById("statSubjects");
        if (ss) ss.textContent = `${Object.keys(subjects).length}`;

        const sad = document.getElementById("statActiveDays");
        if (sad) sad.textContent = `${getActiveDaysCount()}`;

        // Calendar
        renderContributionGrid();

        return { completed, total, percent };
    }

    function renderContributionGrid() {
        const grid = document.getElementById("studyContributionGrid");
        if (!grid) return;
        grid.innerHTML = "";

        const dateCounts = {};
        if (state.completedDates) {
            for (const vid in state.completedDates) {
                const ds = state.completedDates[vid];
                if (ds) dateCounts[ds] = (dateCounts[ds] || 0) + 1;
            }
        }

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 370);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        for (let i = 0; i < 371; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const ds = d.toISOString().slice(0, 10);
            const count = dateCounts[ds] || 0;

            let level = 0;
            if (count === 1) level = 1;
            else if (count >= 2 && count <= 3) level = 2;
            else if (count >= 4) level = 3;

            const box = document.createElement("div");
            box.className = "contrib-box";
            box.style.backgroundColor = `var(--cal-${level === 0 ? 'empty' : 'l' + level})`;

            const opts = { month: 'short', day: 'numeric', year: 'numeric' };
            box.title = `${count} video${count === 1 ? '' : 's'} on ${d.toLocaleDateString('en-US', opts)}`;
            grid.appendChild(box);
        }
    }

    // -----------------------------------------------
    // 7. Dashboard Renderer
    // -----------------------------------------------
    function renderDashboard() {
        updateGlobalProgress();

        // Hero card
        let spotId = state.activeSubjectId || "gastroenterology";
        let spot = subjects[spotId] || subjects["gastroenterology"];

        if (spot) {
            document.getElementById("heroSubjectTitle").textContent = spot.title;
            document.getElementById("heroSubjectDesc").textContent = spot.description;

            document.getElementById("heroPlayBtn").onclick = () => navigateTo(`subject-${spot.id}`, spot.id);
            document.getElementById("heroInfoBtn").onclick = () => navigateTo(`subject-${spot.id}`, spot.id);
        }

        // Resume card
        const resumeSection = document.getElementById("resumeSection");
        const resumeCardEl = document.getElementById("resumeCard");

        if (state.recentVideos && state.recentVideos.length > 0) {
            const lastId = state.recentVideos[0];
            const video = findVideoById(lastId);

            if (video) {
                resumeSection.style.display = "block";
                resumeCardEl.innerHTML = "";

                const card = document.createElement("div");
                card.className = "resume-card";
                card.innerHTML = `
                    <div class="resume-left">
                        <div class="resume-icon-box">${subjects[video.subjectId].icon}</div>
                        <div class="resume-meta">
                            <h4 title="${video.title}">${video.title}</h4>
                            <p>${video.subjectTitle} · ${video.sectionTitle} · ${video.duration}</p>
                        </div>
                    </div>
                    <button class="resume-play-btn" id="resumePlayBtn">▶ Play</button>
                `;

                card.addEventListener("click", (e) => {
                    if (e.target.id !== "resumePlayBtn") {
                        navigateTo(`subject-${video.subjectId}`, video.subjectId);
                        selectVideo(video.id);
                    }
                });

                resumeCardEl.appendChild(card);

                document.getElementById("resumePlayBtn").addEventListener("click", (e) => {
                    e.stopPropagation();
                    navigateTo(`subject-${video.subjectId}`, video.subjectId);
                    selectVideo(video.id);
                });
            } else {
                resumeSection.style.display = "none";
            }
        } else {
            resumeSection.style.display = "none";
        }

        // Subject grid
        const grid = document.getElementById("subjectsGrid");
        grid.innerHTML = "";

        for (const id in subjects) {
            const subject = subjects[id];
            const total = countSubjectVideos(subject);
            const watched = countSubjectCompleted(subject);
            const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

            let badgeText = "Not Started";
            let badgeClass = "not-started";
            if (watched === total && total > 0) {
                badgeText = "Completed";
                badgeClass = "all-done";
            } else if (watched > 0) {
                badgeText = "In Progress";
                badgeClass = "in-progress";
            }

            const card = document.createElement("div");
            card.className = `subj-card ${percent === 100 ? 'completed' : ''}`;

            card.innerHTML = `
                <div>
                    <div class="subj-card-top">
                        <div class="subj-card-icon">${subject.icon}</div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <h4>${subject.title}</h4>
                    <p class="subj-desc">${subject.description}</p>
                </div>
                <div class="subj-card-bottom">
                    <div class="subj-progress">
                        <span>Progress</span>
                        <span>${watched}/${total} (${percent}%)</span>
                    </div>
                    <div class="prog-track">
                        <div class="prog-fill" style="width: ${percent}%"></div>
                    </div>
                    <button class="btn-open-subject" id="btn-card-${id}">Open Subject</button>
                </div>
            `;

            grid.appendChild(card);

            document.getElementById(`btn-card-${id}`).addEventListener("click", (e) => {
                e.stopPropagation();
                navigateTo(`subject-${id}`, id);
            });
            card.addEventListener("click", () => navigateTo(`subject-${id}`, id));
        }
    }

    // -----------------------------------------------
    // 8. Subject Detail — Sidebar Curriculum
    // -----------------------------------------------
    function renderSubjectDetail(subjectId) {
        const subject = subjects[subjectId];
        if (!subject) return;

        const container = document.getElementById("sidebarDynamicContent");
        if (!container) return;

        container.innerHTML = `
            <div class="sidebar-curriculum">
                <button class="sidebar-back-btn" id="subjectBackToDashboardBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back to Dashboard
                </button>

                <div class="sidebar-subj-header">
                    <div class="sidebar-subj-icon-box">${subject.icon}</div>
                    <div class="sidebar-subj-meta">
                        <h3 title="${subject.title}">${subject.title}</h3>
                        <span id="subjectProgressText">0 of 0 completed</span>
                    </div>
                </div>

                <div class="sidebar-progress-row">
                    <div class="prog-bar-track">
                        <div class="prog-bar-fill" id="subjectProgressBarFill" style="width: 0%"></div>
                    </div>
                    <span class="prog-percent" id="subjectProgressPercent">0%</span>
                </div>

                <div class="sidebar-section-label">Search</div>
                <div class="sidebar-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="sidebarSearchInput" placeholder="Filter videos...">
                </div>

                <div class="sidebar-section-label">Curriculum</div>
                <div class="accordion" id="curriculumAccordion"></div>
            </div>
        `;

        // Update progress
        const total = countSubjectVideos(subject);
        const watched = countSubjectCompleted(subject);
        const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

        document.getElementById("subjectProgressText").textContent = `${watched} of ${total} completed`;
        document.getElementById("subjectProgressPercent").textContent = `${percent}%`;
        document.getElementById("subjectProgressBarFill").style.width = `${percent}%`;

        // Render accordion
        const accordion = document.getElementById("curriculumAccordion");
        accordion.innerHTML = "";

        subject.sections.forEach((section, sIdx) => {
            const sec = document.createElement("div");
            sec.className = "accordion-section open";
            sec.id = `section-box-${sIdx}`;

            const trigger = document.createElement("button");
            trigger.className = "accordion-trigger";
            trigger.innerHTML = `
                <span>${section.title}</span>
                <span class="chevron">▼</span>
            `;
            trigger.addEventListener("click", () => sec.classList.toggle("open"));

            const body = document.createElement("div");
            body.className = "accordion-body";

            section.videos.forEach(video => {
                const isDone = state.completedVideos[video.id];
                const isActive = state.activeVideoId === video.id;

                const row = document.createElement("button");
                row.className = `vid-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`;
                row.id = `video-row-${video.id}`;

                row.innerHTML = `
                    <div class="vid-check" id="check-${video.id}">${isDone ? '✓' : ''}</div>
                    <div class="vid-info">
                        <span class="vid-title" title="${video.title}">${video.title}</span>
                        <span class="vid-duration">${video.duration}</span>
                    </div>
                `;

                row.addEventListener("click", (e) => {
                    if (e.target.classList.contains("vid-check")) {
                        e.stopPropagation();
                        toggleVideoCompleted(video.id);
                    } else {
                        selectVideo(video.id);
                    }
                });

                body.appendChild(row);
            });

            sec.appendChild(trigger);
            sec.appendChild(body);
            accordion.appendChild(sec);
        });

        // Search filtering
        const searchInput = document.getElementById("sidebarSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const q = e.target.value.toLowerCase().trim();

                subject.sections.forEach((section, sIdx) => {
                    const secDiv = document.getElementById(`section-box-${sIdx}`);
                    if (!secDiv) return;

                    let matchCount = 0;
                    section.videos.forEach(video => {
                        const row = document.getElementById(`video-row-${video.id}`);
                        if (!row) return;
                        const match = video.title.toLowerCase().includes(q);
                        row.style.display = match ? "flex" : "none";
                        if (match) matchCount++;
                    });

                    if (matchCount > 0 || q === "") {
                        secDiv.style.display = "block";
                        if (q !== "") secDiv.classList.add("open");
                    } else {
                        secDiv.style.display = "none";
                    }
                });
            });
        }

        // Select initial video
        if (state.activeVideoId) {
            const currentVid = findVideoById(state.activeVideoId);
            if (!currentVid || currentVid.subjectId !== subjectId) {
                if (subject.sections[0] && subject.sections[0].videos[0]) {
                    selectVideo(subject.sections[0].videos[0].id);
                }
            } else {
                selectVideo(state.activeVideoId);
            }
        } else {
            if (subject.sections[0] && subject.sections[0].videos[0]) {
                selectVideo(subject.sections[0].videos[0].id);
            }
        }
    }

    // -----------------------------------------------
    // 9. Video Selection & Player
    // -----------------------------------------------
    function selectVideo(videoId) {
        state.activeVideoId = videoId;

        const video = findVideoById(videoId);
        if (!video) return;

        updateRecents(videoId);
        saveState();

        // Highlight active row
        document.querySelectorAll(".vid-item").forEach(el => el.classList.remove("active"));
        const activeRow = document.getElementById(`video-row-${videoId}`);
        if (activeRow) activeRow.classList.add("active");

        // Player labels
        document.getElementById("videoSectionLabel").textContent = video.sectionTitle;
        document.getElementById("videoTitleLabel").textContent = video.title;
        document.getElementById("videoDurationLabel").textContent = video.duration;

        // Completed toggle
        const toggleBtn = document.getElementById("videoCompletedToggle");
        if (state.completedVideos[videoId]) {
            toggleBtn.classList.add("completed");
        } else {
            toggleBtn.classList.remove("completed");
        }

        // Prev/Next
        updatePrevNextButtons(video);

        // Notes
        const notesArea = document.getElementById("studyNotesTextarea");
        notesArea.value = state.videoNotes[videoId] || "";

        // Breadcrumbs
        const bc = document.getElementById("headerBreadcrumbs");
        if (bc) {
            bc.style.display = "flex";
            document.getElementById("bcSubject").textContent = video.subjectTitle;
            document.getElementById("bcSection").textContent = video.sectionTitle;
            document.getElementById("bcVideo").textContent = video.title;
        }

        // Load media
        loadPlayerConfig(videoId);
    }

    function updateRecents(videoId) {
        state.recentVideos = state.recentVideos.filter(id => id !== videoId);
        state.recentVideos.unshift(videoId);
        if (state.recentVideos.length > 5) state.recentVideos.pop();
    }

    function toggleVideoCompleted(videoId) {
        state.completedVideos[videoId] = !state.completedVideos[videoId];

        if (state.completedVideos[videoId]) {
            state.completedDates[videoId] = new Date().toISOString().slice(0, 10);
        } else {
            delete state.completedDates[videoId];
        }

        saveState();

        const row = document.getElementById(`video-row-${videoId}`);
        if (row) {
            if (state.completedVideos[videoId]) {
                row.classList.add("done");
                const check = row.querySelector(".vid-check");
                if (check) check.textContent = "✓";
            } else {
                row.classList.remove("done");
                const check = row.querySelector(".vid-check");
                if (check) check.textContent = "";
            }
        }

        if (state.activeVideoId === videoId) {
            const toggleBtn = document.getElementById("videoCompletedToggle");
            if (state.completedVideos[videoId]) {
                toggleBtn.classList.add("completed");
            } else {
                toggleBtn.classList.remove("completed");
            }
        }

        updateGlobalProgress();

        if (state.currentView === "dashboard" || state.currentView === "settings") {
            renderSidebarDashboard();
        }

        if (state.activeSubjectId && state.currentView.startsWith("subject-")) {
            const subject = subjects[state.activeSubjectId];
            if (subject) {
                const total = countSubjectVideos(subject);
                const watched = countSubjectCompleted(subject);
                const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

                const pt = document.getElementById("subjectProgressText");
                if (pt) pt.textContent = `${watched} of ${total} completed`;
                const pp = document.getElementById("subjectProgressPercent");
                if (pp) pp.textContent = `${percent}%`;
                const pf = document.getElementById("subjectProgressBarFill");
                if (pf) pf.style.width = `${percent}%`;
            }
        }
    }

    function updatePrevNextButtons(currentVideo) {
        const subject = subjects[currentVideo.subjectId];
        const flatList = [];
        subject.sections.forEach(sec => sec.videos.forEach(v => flatList.push(v.id)));

        const index = flatList.indexOf(currentVideo.id);
        const prevBtn = document.getElementById("prevVideoBtn");
        const nextBtn = document.getElementById("nextVideoBtn");

        if (index > 0) {
            prevBtn.disabled = false;
            prevBtn.onclick = () => selectVideo(flatList[index - 1]);
        } else {
            prevBtn.disabled = true;
        }

        if (index < flatList.length - 1) {
            nextBtn.disabled = false;
            nextBtn.onclick = () => selectVideo(flatList[index + 1]);
        } else {
            nextBtn.disabled = true;
        }
    }

    // -----------------------------------------------
    // 10. Local Player
    // -----------------------------------------------
    function loadPlayerConfig(videoId) {
        const video = findVideoById(videoId);
        if (!video) return;

        const videoNode = document.getElementById("localVideoNode");
        videoNode.removeAttribute("src");
        videoNode.onloadedmetadata = null;
        videoNode.onerror = null;

        document.getElementById("fileDropzone").style.display = "flex";
        document.getElementById("fileStatusBar").style.display = "none";
        document.getElementById("linkedFileName").textContent = "";

        const relativePath = `videos/${video.subjectId}/${video.id}.mp4`;

        videoNode.onloadedmetadata = function () {
            document.getElementById("fileDropzone").style.display = "none";
            document.getElementById("fileStatusBar").style.display = "flex";
            document.getElementById("linkedFileName").textContent = `Auto-Detected: ${video.title}.mp4`;

            const actualDuration = formatDuration(videoNode.duration);
            if (actualDuration) {
                const activeRow = document.getElementById(`video-row-${videoId}`);
                if (activeRow) {
                    const durSpan = activeRow.querySelector(".vid-duration");
                    if (durSpan) durSpan.textContent = actualDuration;
                }
                video.duration = actualDuration;
                const dLabel = document.getElementById("videoDurationLabel");
                if (dLabel) dLabel.textContent = actualDuration;
            }

            videoNode.play().catch(e => console.log("Auto-play blocked", e));
        };

        videoNode.onerror = function () {
            videoNode.removeAttribute("src");
            videoNode.onloadedmetadata = null;
            videoNode.onerror = null;

            const srcConfig = state.videoSources[videoId] || null;
            if (srcConfig && srcConfig.type === "local") {
                document.getElementById("fileDropzone").style.display = "flex";
                document.getElementById("fileStatusBar").style.display = "flex";
                document.getElementById("linkedFileName").textContent = `Linked: ${srcConfig.name || 'Local file'}`;
            }
        };

        videoNode.src = relativePath;
        videoNode.load();
    }

    function loadLocalFile(file) {
        if (!file) return;

        const videoNode = document.getElementById("localVideoNode");
        const objUrl = URL.createObjectURL(file);
        videoNode.src = objUrl;
        videoNode.load();

        document.getElementById("fileDropzone").style.display = "none";
        document.getElementById("fileStatusBar").style.display = "flex";
        document.getElementById("linkedFileName").textContent = `Playing: ${file.name}`;

        if (state.activeVideoId) {
            state.videoSources[state.activeVideoId] = {
                type: "local",
                value: file.name,
                name: file.name
            };
            saveState();

            videoNode.onloadedmetadata = function () {
                const actualDuration = formatDuration(videoNode.duration);
                if (actualDuration) {
                    const activeRow = document.getElementById(`video-row-${state.activeVideoId}`);
                    if (activeRow) {
                        const durSpan = activeRow.querySelector(".vid-duration");
                        if (durSpan) durSpan.textContent = actualDuration;
                    }
                    const videoObj = findVideoById(state.activeVideoId);
                    if (videoObj) videoObj.duration = actualDuration;
                    const dLabel = document.getElementById("videoDurationLabel");
                    if (dLabel) dLabel.textContent = actualDuration;
                }
            };
        }

        videoNode.play().catch(e => console.log("Auto-play blocked", e));
    }

    // Auto-advance
    const localVideoPlayer = document.getElementById("localVideoNode");
    if (localVideoPlayer) {
        localVideoPlayer.addEventListener("ended", () => {
            if (state.activeVideoId) {
                if (!state.completedVideos[state.activeVideoId]) {
                    toggleVideoCompleted(state.activeVideoId);
                }
                const nextBtn = document.getElementById("nextVideoBtn");
                if (nextBtn && !nextBtn.disabled) {
                    setTimeout(() => nextBtn.click(), 1500);
                }
            }
        });
    }

    // -----------------------------------------------
    // 11. Notes & Markdown Editor
    // -----------------------------------------------
    let saveTimeout = null;
    const notesTextarea = document.getElementById("studyNotesTextarea");

    notesTextarea.addEventListener("input", () => {
        if (!state.activeVideoId) return;

        const indicator = document.getElementById("notesSaveStatus");
        indicator.textContent = "Saving...";
        indicator.className = "save-status saving";

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            state.videoNotes[state.activeVideoId] = notesTextarea.value;
            saveState();
            indicator.textContent = "Saved";
            indicator.className = "save-status saved";
            setTimeout(() => { indicator.className = "save-status"; }, 1500);
        }, 800);
    });

    function insertMarkdown(before, after = "") {
        const ta = document.getElementById("studyNotesTextarea");
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const selected = text.substring(start, end);
        ta.value = text.substring(0, start) + before + selected + after + text.substring(end);
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = start + before.length + selected.length;
        ta.dispatchEvent(new Event("input"));
    }

    document.getElementById("btnBold").addEventListener("click", () => insertMarkdown("**", "**"));
    document.getElementById("btnItalic").addEventListener("click", () => insertMarkdown("*", "*"));
    document.getElementById("btnHeading").addEventListener("click", () => insertMarkdown("\n### "));
    document.getElementById("btnBulletList").addEventListener("click", () => insertMarkdown("\n- "));
    document.getElementById("btnCode").addEventListener("click", () => insertMarkdown("\n```\n", "\n```\n"));
    document.getElementById("btnHighYield").addEventListener("click", () => insertMarkdown("⭐ **HIGH-YIELD:** "));

    // -----------------------------------------------
    // 12. Workspace Tabs
    // -----------------------------------------------
    const tabBar = document.querySelector(".tab-bar");
    if (tabBar) {
        tabBar.addEventListener("click", (e) => {
            const btn = e.target.closest(".tab-btn");
            if (!btn) return;
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            const pane = document.getElementById(btn.getAttribute("data-tab"));
            if (pane) pane.classList.add("active");
        });
    }

    // -----------------------------------------------
    // 13. Event Bindings
    // -----------------------------------------------
    const appSidebar = document.getElementById("appSidebar");
    if (appSidebar) {
        appSidebar.addEventListener("click", (e) => {
            if (e.target.closest("#navDashboard")) { navigateTo("dashboard"); return; }
            if (e.target.closest("#navSettings")) { navigateTo("settings"); return; }
            if (e.target.closest("#subjectBackToDashboardBtn")) { navigateTo("dashboard"); return; }
        });
    }

    document.getElementById("goHomeBtn").addEventListener("click", () => navigateTo("dashboard"));

    document.getElementById("videoCompletedToggle").addEventListener("click", () => {
        if (state.activeVideoId) toggleVideoCompleted(state.activeVideoId);
    });

    document.getElementById("sidebarToggleBtn").addEventListener("click", () => {
        const sb = document.querySelector(".app-sidebar");
        sb.classList.toggle("collapsed");
        state.sidebarCollapsed = sb.classList.contains("collapsed");
        localStorage.setItem("bb_sidebar_collapsed", state.sidebarCollapsed ? "true" : "false");
    });

    // File picker
    const dropzone = document.getElementById("fileDropzone");
    const filePicker = document.getElementById("localFilePicker");

    document.getElementById("browseFilesBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        filePicker.click();
    });

    dropzone.addEventListener("click", () => filePicker.click());

    filePicker.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) loadLocalFile(e.target.files[0]);
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--accent)";
    });
    dropzone.addEventListener("dragleave", () => {
        dropzone.style.borderColor = "";
    });
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "";
        if (e.dataTransfer.files && e.dataTransfer.files[0]) loadLocalFile(e.dataTransfer.files[0]);
    });

    document.getElementById("changeLocalFileBtn").addEventListener("click", () => {
        filePicker.value = "";
        filePicker.click();
    });

    // Theme toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("bb_theme", next);
        });
    }

    // -----------------------------------------------
    // 14. Backup Import/Export
    // -----------------------------------------------
    document.getElementById("resetAllProgressBtn").addEventListener("click", () => {
        if (confirm("⚠️ WARNING: Delete all study progress, notes, and video configurations? This cannot be undone.")) {
            localStorage.clear();
            alert("Data reset successfully.");
            window.location.reload();
        }
    });

    document.getElementById("exportDataBtn").addEventListener("click", () => {
        const data = {
            completedVideos: state.completedVideos,
            completedDates: state.completedDates || {},
            videoSources: state.videoSources,
            videoNotes: state.videoNotes,
            recentVideos: state.recentVideos,
            version: "1.0",
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `BB_Study_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const importPicker = document.getElementById("importFileSelector");
    document.getElementById("importBtnTrigger").addEventListener("click", () => importPicker.click());

    importPicker.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (evt) {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed.completedVideos || parsed.videoSources || parsed.videoNotes) {
                        if (parsed.completedVideos) state.completedVideos = parsed.completedVideos;
                        if (parsed.completedDates) state.completedDates = parsed.completedDates;
                        if (parsed.videoSources) state.videoSources = parsed.videoSources;
                        if (parsed.videoNotes) state.videoNotes = parsed.videoNotes;
                        if (parsed.recentVideos) state.recentVideos = parsed.recentVideos;
                        saveState();
                        alert("Backup restored successfully!");
                        window.location.reload();
                    } else {
                        alert("Invalid backup file.");
                    }
                } catch (err) {
                    alert("Error parsing JSON file.");
                    console.error("JSON parse error", err);
                }
            };
            reader.readAsText(file);
        }
    });

    // -----------------------------------------------
    // 15. Initialization
    // -----------------------------------------------
    const savedTheme = localStorage.getItem("bb_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    loadState();

    if (state.sidebarCollapsed) {
        document.getElementById("appSidebar").classList.add("collapsed");
    }

    if (state.currentView === "settings") {
        navigateTo("settings");
    } else if (state.currentView.startsWith("subject-") && state.activeSubjectId) {
        navigateTo(state.currentView, state.activeSubjectId);
    } else {
        navigateTo("dashboard");
    }
});
