// Boards & Beyond Study Companion UI Controller
// Manages Routing, State persistence, Collapsible Menus, Local Video Player, and Netflix-inspired Study Aesthetics

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Core State Definition
    // ----------------------------------------------------
    let state = {
        completedVideos: {}, // { videoId: true/false }
        completedDates: {},  // { videoId: "YYYY-MM-DD" } -> Watch dates for consistency grid
        videoSources: {},    // { videoId: { type: 'local', value: string, name?: string } }
        videoNotes: {},      // { videoId: string }
        recentVideos: [],    // [ videoId1, videoId2, ... ]
        currentView: "dashboard",
        activeSubjectId: null,
        activeVideoId: null,
        sidebarCollapsed: false
    };

    const subjectColors = {
        gastroenterology: "#e50914",   /* Netflix Red accent */
        pharmacology: "#10b981",
        cardiology: "#ff3b30",
        pulmonary: "#14b8a6"
    };

    // Load initial state from LocalStorage
    function loadState() {
        try {
            const savedCompleted = localStorage.getItem("bb_completed");
            if (savedCompleted) state.completedVideos = JSON.parse(savedCompleted);

            const savedDates = localStorage.getItem("bb_completed_dates");
            if (savedDates) state.completedDates = JSON.parse(savedDates);

            const savedSources = localStorage.getItem("bb_sources");
            if (savedSources) state.videoSources = JSON.parse(savedSources);

            const savedNotes = localStorage.getItem("bb_notes");
            if (savedNotes) state.videoNotes = JSON.parse(savedNotes);

            const savedRecents = localStorage.getItem("bb_recents");
            if (savedRecents) state.recentVideos = JSON.parse(savedRecents);

            const savedView = localStorage.getItem("bb_view") || "dashboard";
            state.currentView = savedView;

            const savedSubject = localStorage.getItem("bb_active_subject");
            if (savedSubject) state.activeSubjectId = savedSubject;

            const savedVideo = localStorage.getItem("bb_active_video");
            if (savedVideo) state.activeVideoId = savedVideo;

            state.sidebarCollapsed = localStorage.getItem("bb_sidebar_collapsed") === "true";
        } catch (e) {
            console.error("Failed to parse LocalStorage data", e);
        }
    }

    // Save state changes to LocalStorage
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

    // ----------------------------------------------------
    // 2. Routing Engine (Views Swapping)
    // ----------------------------------------------------
    function navigateTo(viewName, subjectId = null) {
        state.currentView = viewName;
        
        // Hide all views
        document.getElementById("dashboardView").style.display = "none";
        document.getElementById("subjectView").style.display = "none";
        document.getElementById("settingsView").style.display = "none";

        // Remove active class from nav buttons if they exist in the sidebar
        const navDash = document.getElementById("navDashboard");
        if (navDash) navDash.classList.remove("active");
        const navSet = document.getElementById("navSettings");
        if (navSet) navSet.classList.remove("active");

        // Hide breadcrumbs by default
        const breadcrumbs = document.getElementById("headerBreadcrumbs");
        if (breadcrumbs) {
            breadcrumbs.style.display = "none";
        }

        if (viewName === "dashboard") {
            document.getElementById("dashboardView").style.display = "block";
            renderSidebarSubjects();
            renderDashboard();
            const activeDash = document.getElementById("navDashboard");
            if (activeDash) activeDash.classList.add("active");
        } else if (viewName === "settings") {
            document.getElementById("settingsView").style.display = "block";
            renderSidebarSubjects();
            const activeSet = document.getElementById("navSettings");
            if (activeSet) activeSet.classList.add("active");
        } else if (viewName.startsWith("subject-") && subjectId) {
            state.activeSubjectId = subjectId;
            document.getElementById("subjectView").style.display = "block";
            renderSubjectDetail(subjectId);
        }

        saveState();
        // Scroll workspace to top
        document.querySelector(".content-panel").scrollTop = 0;
    }

    // ----------------------------------------------------
    // 3. Render Helper Functions
    // ----------------------------------------------------
    
    // Sidebar list rendering for Dashboard & Settings Views
    function renderSidebarSubjects() {
        const dynamicContent = document.getElementById("sidebarDynamicContent");
        if (!dynamicContent) return;

        // Render Dashboard navigation & search in the sidebar
        dynamicContent.innerHTML = `
            <div class="sidebar-dashboard-container">
                <div class="sidebar-title">Navigation</div>
                <nav class="sidebar-nav">
                    <button class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" id="navDashboard">
                        <span class="nav-icon">📊</span>
                        <span class="nav-label">Dashboard</span>
                    </button>
                    <button class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" id="navSettings">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-label">Settings</span>
                    </button>
                </nav>
                
                <div class="sidebar-title">Search</div>
                <div class="sidebar-search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="sidebarSearchInput" placeholder="Filter subjects...">
                </div>

                <div class="sidebar-title">Subjects</div>
                <div class="sidebar-subjects-list" id="sidebarSubjectsList">
                    <!-- Dynamic subject items -->
                </div>
                
                <div class="sidebar-footer">
                    <a href="https://t.me/USMLEBoardsAndBeyondVideos" target="_blank" class="tg-channel-link">
                        <span>📢</span> Telegram Channel
                    </a>
                </div>
            </div>
        `;

        const container = document.getElementById("sidebarSubjectsList");
        if (!container) return;

        for (const id in subjects) {
            const subject = subjects[id];
            
            // Count stats
            const total = countSubjectVideos(subject);
            const watched = countSubjectCompleted(subject);

            const button = document.createElement("button");
            button.className = `sidebar-subj-item ${state.activeSubjectId === id && state.currentView.startsWith("subject-") ? 'active' : ''}`;
            button.id = `side-subj-${id}`;
            button.addEventListener("click", () => navigateTo(`subject-${id}`, id));

            button.innerHTML = `
                <span class="subj-item-label">
                    <span title="${subject.title}">${subject.icon}</span>
                    <span class="nav-label">${subject.title}</span>
                </span>
                <span class="subj-item-badge" id="side-badge-${id}">${watched}/${total}</span>
            `;
            container.appendChild(button);
        }

        // Connect Search Box listener for Dashboard mode
        const searchInput = document.getElementById("sidebarSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                // Filter sidebar subjects list
                document.querySelectorAll(".sidebar-subj-item").forEach(item => {
                    const label = item.querySelector(".nav-label").textContent.toLowerCase();
                    if (label.includes(query)) {
                        item.style.display = "flex";
                    } else {
                        item.style.display = "none";
                    }
                });

                // If on dashboard, also filter main dashboard subjects row cards
                if (state.currentView === "dashboard") {
                    document.querySelectorAll(".subject-card").forEach(card => {
                        const title = card.querySelector("h4").textContent.toLowerCase();
                        if (title.includes(query)) {
                            card.style.display = "flex";
                        } else {
                            card.style.display = "none";
                        }
                    });
                }
            });
        }
    }

    // Update global header stats and progress rings
    function updateGlobalProgress() {
        const all = getAllVideos();
        const total = all.length;
        let completed = 0;

        all.forEach(v => {
            if (state.completedVideos[v.id]) completed++;
        });

        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Header stat
        const headerStat = document.getElementById("globalHeaderStat");
        if (headerStat) {
            headerStat.textContent = `${completed}/${total} Completed`;
        }
        
        // Hero Percent Text
        const percentLabel = document.getElementById("globalProgressPercent");
        if (percentLabel) {
            percentLabel.textContent = `${percent}%`;
        }

        // Radial Ring Circle update
        const circle = document.getElementById("globalProgressRing");
        if (circle) {
            const radius = 55;
            const circumference = 2 * Math.PI * radius; // 345.575
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = offset;
        }

        // Render consistency grid calendar
        renderContributionGrid();

        return { completed, total, percent };
    }

    // Render study contribution grid (GitHub style)
    function renderContributionGrid() {
        const grid = document.getElementById("studyContributionGrid");
        if (!grid) return;
        
        grid.innerHTML = "";

        // Gather completion dates stats
        const dateCounts = {}; // { "YYYY-MM-DD": count }
        if (state.completedDates) {
            for (const vid in state.completedDates) {
                const dateStr = state.completedDates[vid];
                if (dateStr) {
                    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                }
            }
        }

        // Generate dates for the last 371 days (53 weeks) to keep grid aligned
        const today = new Date();
        const daysToShow = 371; // 53 weeks * 7 days
        
        // Find starting day (adjust to align week columns starting on Sunday)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysToShow + 1);
        
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        const totalBlocks = 371;
        for (let i = 0; i < totalBlocks; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateString = currentDate.toISOString().slice(0, 10);
            const count = dateCounts[dateString] || 0;

            let level = 0;
            if (count === 1) level = 1;
            else if (count >= 2 && count <= 3) level = 2;
            else if (count >= 4) level = 3;

            const box = document.createElement("div");
            box.className = `contrib-box level-${level}`;
            
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedDate = currentDate.toLocaleDateString('en-US', options);
            box.title = `${count} video${count === 1 ? '' : 's'} watched on ${formattedDate}`;
            
            grid.appendChild(box);
        }
    }

    // Render Dashboard
    function renderDashboard() {
        updateGlobalProgress();

        // 1. Render Spotlight Study Billboard contents (Netflix Banner Style)
        let spotlightSubjectId = state.activeSubjectId || "gastroenterology";
        let spotlightSubject = subjects[spotlightSubjectId] || subjects["gastroenterology"];
        
        if (spotlightSubject) {
            document.getElementById("billboardSubjectTitle").textContent = spotlightSubject.title;
            document.getElementById("billboardSubjectDesc").textContent = spotlightSubject.description;
            
            const totalSpot = countSubjectVideos(spotlightSubject);
            document.getElementById("billboardSubjectVideos").textContent = `${totalSpot} Videos`;

            // Setup button routes
            const playBtn = document.getElementById("billboardPlayBtn");
            const infoBtn = document.getElementById("billboardInfoBtn");

            // Play button resumes studying this subject
            playBtn.onclick = () => {
                navigateTo(`subject-${spotlightSubject.id}`, spotlightSubject.id);
            };

            // Info button opens subject curriculum index
            infoBtn.onclick = () => {
                navigateTo(`subject-${spotlightSubject.id}`, spotlightSubject.id);
            };
        }

        // 2. Resume Study logic (Continue Watching row)
        const resumeContainer = document.getElementById("resumeSection");
        const resumeCard = document.getElementById("resumeCard");
        
        if (state.recentVideos && state.recentVideos.length > 0) {
            const lastVideoId = state.recentVideos[0];
            const video = findVideoById(lastVideoId);
            
            if (video) {
                resumeContainer.style.display = "block";
                resumeCard.innerHTML = ""; // clear

                const card = document.createElement("div");
                card.className = "resume-card";
                card.innerHTML = `
                    <div class="resume-info">
                        <div class="resume-icon">${subjects[video.subjectId].icon}</div>
                        <div class="resume-details">
                            <h4 title="${video.title}">${video.title}</h4>
                            <p>${video.subjectTitle} &bull; ${video.sectionTitle} &bull; ${video.duration}</p>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="padding: 6px 14px; font-size: 12.5px;" id="resumePlayBtn">► Play</button>
                `;

                card.addEventListener("click", (e) => {
                    if (e.target.id !== "resumePlayBtn") {
                        navigateTo(`subject-${video.subjectId}`, video.subjectId);
                        selectVideo(video.id);
                    }
                });

                resumeCard.appendChild(card);

                document.getElementById("resumePlayBtn").addEventListener("click", (e) => {
                    e.stopPropagation();
                    navigateTo(`subject-${video.subjectId}`, video.subjectId);
                    selectVideo(video.id);
                });
            } else {
                resumeContainer.style.display = "none";
            }
        } else {
            resumeContainer.style.display = "none";
        }

        // 3. Subjects list row (Horizontal Carousel)
        const grid = document.getElementById("subjectsGrid");
        grid.innerHTML = "";

        for (const id in subjects) {
            const subject = subjects[id];
            const total = countSubjectVideos(subject);
            const watched = countSubjectCompleted(subject);
            const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

            const card = document.createElement("div");
            card.className = `subject-card ${percent === 100 ? 'all-completed' : ''}`;
            
            let badgeText = "Not Started";
            let badgeClass = "";
            if (watched === total && total > 0) {
                badgeText = "Completed";
                badgeClass = "completed";
            } else if (watched > 0) {
                badgeText = "In Progress";
                badgeClass = "started";
            }

            card.innerHTML = `
                <div>
                    <div class="subj-card-header">
                        <div class="subj-card-icon">${subject.icon}</div>
                        <span class="subj-card-completed-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <h4>${subject.title}</h4>
                    <p class="subj-card-desc">${subject.description}</p>
                </div>
                <div>
                    <div class="subj-card-progress">
                        <div class="subj-card-progress-info">
                            <span>Progress</span>
                            <span>${watched}/${total} (${percent}%)</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <button class="btn btn-secondary" style="width: 100%;" id="btn-card-${id}">Study Videos</button>
                </div>
            `;
            
            grid.appendChild(card);
            
            // Connect card click button
            document.getElementById(`btn-card-${id}`).addEventListener("click", (e) => {
                e.stopPropagation();
                navigateTo(`subject-${id}`, id);
            });

            card.addEventListener("click", () => {
                navigateTo(`subject-${id}`, id);
            });
        }
    }

    // Render Subject detail inside Left Sidebar (Accordion list morphing)
    function renderSubjectDetail(subjectId) {
        const subject = subjects[subjectId];
        if (!subject) return;

        const dynamicContent = document.getElementById("sidebarDynamicContent");
        if (!dynamicContent) return;

        // Inject Subject Video Curriculum structure directly into the sidebar
        dynamicContent.innerHTML = `
            <div class="sidebar-curriculum-container">
                <button class="back-btn" id="subjectBackToDashboardBtn" title="Back to Dashboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Back to Dashboard</span>
                </button>
                
                <div class="sidebar-subject-header">
                    <span class="sidebar-subject-icon">${subject.icon}</span>
                    <div class="sidebar-subject-info">
                        <h3 class="sidebar-subject-title" title="${subject.title}">${subject.title}</h3>
                        <span class="sidebar-subject-progress-text" id="subjectProgressText">0 of 0 Completed</span>
                    </div>
                </div>
                
                <div class="sidebar-progress-bar-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="subjectProgressBarFill" style="width: 0%"></div>
                    </div>
                    <span class="sidebar-progress-percent" id="subjectProgressPercent">0%</span>
                </div>
                
                <div class="sidebar-title">Search</div>
                <div class="sidebar-search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="sidebarSearchInput" placeholder="Filter videos...">
                </div>

                <div class="sidebar-title">Videos</div>
                <div class="curriculum-accordion" id="curriculumAccordion">
                    <!-- Dynamic accordion sections -->
                </div>
            </div>
        `;

        // Update progress stats in the sidebar
        const total = countSubjectVideos(subject);
        const watched = countSubjectCompleted(subject);
        const percent = total > 0 ? Math.round((watched / total) * 100) : 0;
        
        document.getElementById("subjectProgressText").textContent = `${watched} of ${total} Completed`;
        document.getElementById("subjectProgressPercent").textContent = `${percent}%`;
        document.getElementById("subjectProgressBarFill").style.width = `${percent}%`;

        // Render accordion
        const accordion = document.getElementById("curriculumAccordion");
        accordion.innerHTML = "";

        subject.sections.forEach((section, sIdx) => {
            const secDiv = document.createElement("div");
            secDiv.className = "accordion-section active"; // default expand
            secDiv.id = `section-box-${sIdx}`;

            const header = document.createElement("button");
            header.className = "accordion-header";
            header.innerHTML = `
                <span>${section.title}</span>
                <span class="accordion-toggle-icon">▼</span>
            `;
            
            header.addEventListener("click", () => {
                secDiv.classList.toggle("active");
            });

            const content = document.createElement("div");
            content.className = "accordion-content";

            section.videos.forEach(video => {
                const isCompleted = state.completedVideos[video.id];
                const isActive = state.activeVideoId === video.id;

                const videoRow = document.createElement("button");
                videoRow.className = `video-index-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
                videoRow.id = `video-row-${video.id}`;

                videoRow.innerHTML = `
                    <div class="video-checkbox" id="check-${video.id}"></div>
                    <div class="video-index-details">
                        <span class="video-index-title" title="${video.title}">${video.title}</span>
                        <span class="video-index-duration">⏱️ ${video.duration}</span>
                    </div>
                `;

                videoRow.addEventListener("click", (e) => {
                    if (e.target.classList.contains("video-checkbox")) {
                        e.stopPropagation();
                        toggleVideoCompleted(video.id);
                    } else {
                        selectVideo(video.id);
                    }
                });

                content.appendChild(videoRow);
            });

            secDiv.appendChild(header);
            secDiv.appendChild(content);
            accordion.appendChild(secDiv);
        });

        // Search box event listener for Subject study curriculum filtering
        const searchInput = document.getElementById("sidebarSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase().trim();

                subject.sections.forEach((section, sIdx) => {
                    const secDiv = document.getElementById(`section-box-${sIdx}`);
                    if (!secDiv) return;

                    let matchCount = 0;

                    section.videos.forEach(video => {
                        const row = document.getElementById(`video-row-${video.id}`);
                        if (!row) return;

                        const title = video.title.toLowerCase();
                        if (title.includes(query)) {
                            row.style.display = "flex";
                            matchCount++;
                        } else {
                            row.style.display = "none";
                        }
                    });

                    if (matchCount > 0 || query === "") {
                        secDiv.style.display = "block";
                        if (query !== "") {
                            secDiv.classList.add("active");
                        }
                    } else {
                        secDiv.style.display = "none";
                    }
                });
            });
        }

        // Initialize active video selection
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

    // ----------------------------------------------------
    // 4. Video Selection & Player Core
    // ----------------------------------------------------
    function selectVideo(videoId) {
        state.activeVideoId = videoId;
        
        const video = findVideoById(videoId);
        if (!video) return;

        // Add to recent queue
        updateRecents(videoId);
        saveState();

        // Highlight active row in accordion list
        document.querySelectorAll(".video-index-item").forEach(el => {
            el.classList.remove("active");
        });
        const activeRow = document.getElementById(`video-row-${videoId}`);
        if (activeRow) activeRow.classList.add("active");

        // Set Labels in main workspace
        document.getElementById("videoSectionLabel").textContent = video.sectionTitle;
        document.getElementById("videoTitleLabel").textContent = video.title;

        // Watched Toggle Button status
        const toggleBtn = document.getElementById("videoCompletedToggle");
        if (state.completedVideos[videoId]) {
            toggleBtn.classList.add("completed");
        } else {
            toggleBtn.classList.remove("completed");
        }

        // Set up Prev/Next buttons
        updatePrevNextButtons(video);

        // Load study notes
        const notesArea = document.getElementById("studyNotesTextarea");
        notesArea.value = state.videoNotes[videoId] || "";

        // Update header breadcrumbs
        const breadcrumbs = document.getElementById("headerBreadcrumbs");
        if (breadcrumbs) {
            breadcrumbs.style.display = "flex";
            document.getElementById("bcSubject").textContent = video.subjectTitle;
            document.getElementById("bcSection").textContent = video.sectionTitle;
            document.getElementById("bcVideo").textContent = video.title;
        }

        // Update Dynamic Ambient Glow color
        const glow = document.getElementById("ambientGlowBackdrop");
        if (glow) {
            glow.style.backgroundColor = subjectColors[video.subjectId] || "#e50914";
        }

        // Load media files
        loadPlayerConfig(videoId);
    }

    function updateRecents(videoId) {
        state.recentVideos = state.recentVideos.filter(id => id !== videoId);
        state.recentVideos.unshift(videoId);
        if (state.recentVideos.length > 5) {
            state.recentVideos.pop();
        }
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
                row.classList.add("completed");
            } else {
                row.classList.remove("completed");
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
            renderSidebarSubjects();
        }
        
        if (state.activeSubjectId && state.currentView.startsWith("subject-")) {
            const subject = subjects[state.activeSubjectId];
            if (subject) {
                const total = countSubjectVideos(subject);
                const watched = countSubjectCompleted(subject);
                const percent = total > 0 ? Math.round((watched / total) * 100) : 0;
                
                const progressText = document.getElementById("subjectProgressText");
                if (progressText) progressText.textContent = `${watched} of ${total} Completed`;
                
                const progressPercent = document.getElementById("subjectProgressPercent");
                if (progressPercent) progressPercent.textContent = `${percent}%`;
                
                const progressBarFill = document.getElementById("subjectProgressBarFill");
                if (progressBarFill) progressBarFill.style.width = `${percent}%`;
            }
        }
    }

    function updatePrevNextButtons(currentVideo) {
        const subject = subjects[currentVideo.subjectId];
        const flatList = [];
        
        subject.sections.forEach(sec => {
            sec.videos.forEach(v => {
                flatList.push(v.id);
            });
        });

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

    // ----------------------------------------------------
    // 5. Local Player Loaders & Event Handlers
    // ----------------------------------------------------
    function loadPlayerConfig(videoId) {
        const video = findVideoById(videoId);
        if (!video) return;

        // Reset Local Player
        const videoNode = document.getElementById("localVideoNode");
        videoNode.removeAttribute("src");
        
        // Remove old event listeners
        videoNode.onloadedmetadata = null;
        videoNode.onerror = null;
        
        // Reset File Status/Dropzone
        document.getElementById("fileDropzone").style.display = "flex";
        document.getElementById("fileStatusBar").style.display = "none";
        document.getElementById("linkedFileName").textContent = "";

        const relativePath = `videos/${video.subjectId}/${video.id}.mp4`;

        // Direct video load success listener
        videoNode.onloadedmetadata = function() {
            document.getElementById("fileDropzone").style.display = "none";
            document.getElementById("fileStatusBar").style.display = "flex";
            document.getElementById("linkedFileName").textContent = `Auto-Detected: ${video.title}.mp4`;
            
            // Format and update actual duration in UI
            const actualDuration = formatDuration(videoNode.duration);
            if (actualDuration) {
                const activeRow = document.getElementById(`video-row-${videoId}`);
                if (activeRow) {
                    const durationSpan = activeRow.querySelector(".video-index-duration");
                    if (durationSpan) {
                        durationSpan.textContent = `⏱️ ${actualDuration}`;
                    }
                }
                video.duration = actualDuration;
            }

            // Auto play
            videoNode.play().catch(e => console.log("Auto-play blocked or aborted", e));
        };

        // Direct video load error listener (fallback to manual link if exists)
        videoNode.onerror = function() {
            videoNode.removeAttribute("src");
            videoNode.onloadedmetadata = null;
            videoNode.onerror = null;
            
            // Check if there is a manual local file association saved in state
            const srcConfig = state.videoSources[videoId] || null;
            if (srcConfig && srcConfig.type === "local") {
                document.getElementById("fileDropzone").style.display = "flex";
                document.getElementById("fileStatusBar").style.display = "flex";
                document.getElementById("linkedFileName").textContent = `Linked File: ${srcConfig.name || 'Local Video file'}`;
            }
        };

        // Try direct file loading first
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

        // Save association in state
        if (state.activeVideoId) {
            state.videoSources[state.activeVideoId] = {
                type: "local",
                value: file.name,
                name: file.name
            };
            saveState();

            // Set metadata hook to update duration of the manually linked file
            videoNode.onloadedmetadata = function() {
                const actualDuration = formatDuration(videoNode.duration);
                if (actualDuration) {
                    const activeRow = document.getElementById(`video-row-${state.activeVideoId}`);
                    if (activeRow) {
                        const durationSpan = activeRow.querySelector(".video-index-duration");
                        if (durationSpan) {
                            durationSpan.textContent = `⏱️ ${actualDuration}`;
                        }
                    }
                    const videoObj = findVideoById(state.activeVideoId);
                    if (videoObj) {
                        videoObj.duration = actualDuration;
                    }
                }
            };
        }

        videoNode.play().catch(e => console.log("Auto-play blocked", e));
    }

    // Auto-advance logic
    const localVideoPlayer = document.getElementById("localVideoNode");
    if (localVideoPlayer) {
        localVideoPlayer.addEventListener("ended", () => {
            if (state.activeVideoId) {
                if (!state.completedVideos[state.activeVideoId]) {
                    toggleVideoCompleted(state.activeVideoId);
                }
                
                const nextBtn = document.getElementById("nextVideoBtn");
                if (nextBtn && !nextBtn.disabled) {
                    setTimeout(() => {
                        nextBtn.click();
                    }, 1500);
                }
            }
        });
    }

    // ----------------------------------------------------
    // 6. Study Notes autosaving & Markdown Editor Helpers
    // ----------------------------------------------------
    let saveTimeout = null;
    const notesTextarea = document.getElementById("studyNotesTextarea");
    
    notesTextarea.addEventListener("input", () => {
        if (!state.activeVideoId) return;

        const saveIndicator = document.getElementById("notesSaveStatus");
        saveIndicator.textContent = "Saving...";
        saveIndicator.className = "save-indicator saving";

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            state.videoNotes[state.activeVideoId] = notesTextarea.value;
            saveState();

            saveIndicator.textContent = "Saved";
            saveIndicator.className = "save-indicator saved";
            
            setTimeout(() => {
                saveIndicator.className = "save-indicator"; // hide
            }, 1500);
        }, 800);
    });

    // Helper function to inject Markdown tags
    function insertMarkdown(tagBefore, tagAfter = "") {
        const textarea = document.getElementById("studyNotesTextarea");
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        
        const replacement = tagBefore + selectedText + tagAfter;
        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        
        textarea.focus();
        textarea.selectionStart = start + tagBefore.length;
        textarea.selectionEnd = start + tagBefore.length + selectedText.length;
        
        // Dispatch input event to save notes state
        textarea.dispatchEvent(new Event("input"));
    }

    // Bind markdown toolbar buttons
    document.getElementById("btnBold").addEventListener("click", () => insertMarkdown("**", "**"));
    document.getElementById("btnItalic").addEventListener("click", () => insertMarkdown("*", "*"));
    document.getElementById("btnHeading").addEventListener("click", () => insertMarkdown("\n### "));
    document.getElementById("btnBulletList").addEventListener("click", () => insertMarkdown("\n- "));
    document.getElementById("btnCode").addEventListener("click", () => insertMarkdown("\n\`\`\`\n", "\n\`\`\`\n"));
    document.getElementById("btnHighYield").addEventListener("click", () => insertMarkdown("⭐ **HIGH-YIELD:** "));

    // ----------------------------------------------------
    // 7. Workspace Tab Routing
    // ----------------------------------------------------
    const studyTabsRow = document.querySelector(".study-tabs");
    if (studyTabsRow) {
        studyTabsRow.addEventListener("click", (e) => {
            const btn = e.target.closest(".tab-btn");
            if (!btn) return;

            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const targetPaneId = btn.getAttribute("data-tab");
            const activePane = document.getElementById(targetPaneId);
            if (activePane) {
                activePane.classList.add("active");
            }
        });
    }

    // ----------------------------------------------------
    // 8. Dynamic Event Delegation (Sidebar clicks)
    // ----------------------------------------------------
    const appSidebar = document.getElementById("appSidebar");
    if (appSidebar) {
        appSidebar.addEventListener("click", (e) => {
            const navDashboardBtn = e.target.closest("#navDashboard");
            if (navDashboardBtn) {
                navigateTo("dashboard");
                return;
            }
            
            const navSettingsBtn = e.target.closest("#navSettings");
            if (navSettingsBtn) {
                navigateTo("settings");
                return;
            }
            
            const backBtn = e.target.closest("#subjectBackToDashboardBtn");
            if (backBtn) {
                navigateTo("dashboard");
                return;
            }
        });
    }

    // Header brand return home click
    document.getElementById("goHomeBtn").addEventListener("click", () => {
        navigateTo("dashboard");
    });

    // Watched toggle button click
    document.getElementById("videoCompletedToggle").addEventListener("click", () => {
        if (state.activeVideoId) {
            toggleVideoCompleted(state.activeVideoId);
        }
    });

    // Collapsible Main Sidebar Toggle (Theater Mode)
    document.getElementById("sidebarToggleBtn").addEventListener("click", () => {
        const sidebar = document.querySelector(".app-sidebar");
        sidebar.classList.toggle("collapsed");
        state.sidebarCollapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("bb_sidebar_collapsed", state.sidebarCollapsed ? "true" : "false");
    });

    // Local file browser hooks
    const dropzone = document.getElementById("fileDropzone");
    const filePicker = document.getElementById("localFilePicker");

    document.getElementById("browseFilesBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        filePicker.click();
    });

    dropzone.addEventListener("click", () => {
        filePicker.click();
    });

    filePicker.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            loadLocalFile(e.target.files[0]);
        }
    });

    // Drag-and-drop actions
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = "rgba(229, 9, 20, 0.05)";
        dropzone.style.borderColor = "var(--color-primary)";
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.style.backgroundColor = "transparent";
        dropzone.style.borderColor = "var(--border-color)";
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = "transparent";
        dropzone.style.borderColor = "var(--border-color)";

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            loadLocalFile(e.dataTransfer.files[0]);
        }
    });

    // Change file button action
    document.getElementById("changeLocalFileBtn").addEventListener("click", () => {
        filePicker.value = ""; // clear old
        filePicker.click();
    });

    // Theme Switcher Toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("bb_theme", newTheme);
        });
    }

    // ----------------------------------------------------
    // 9. Backup Import/Export Handlers
    // ----------------------------------------------------
    
    // Reset Data
    document.getElementById("resetAllProgressBtn").addEventListener("click", () => {
        if (confirm("🚨 WARNING: Are you absolutely sure you want to delete all study statistics, notes, dates, and video configurations? This cannot be undone.")) {
            localStorage.clear();
            alert("Data reset successfully.");
            window.location.reload();
        }
    });

    // Export study backup JSON file
    document.getElementById("exportDataBtn").addEventListener("click", () => {
        const backupData = {
            completedVideos: state.completedVideos,
            completedDates: state.completedDates || {},
            videoSources: state.videoSources,
            videoNotes: state.videoNotes,
            recentVideos: state.recentVideos,
            version: "1.0",
            exportedAt: new Date().toISOString()
        };

        const jsonString = JSON.stringify(backupData, null, 4);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `BB_Study_Companion_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import study backup JSON file
    const importPicker = document.getElementById("importFileSelector");
    
    document.getElementById("importBtnTrigger").addEventListener("click", () => {
        importPicker.click();
    });

    importPicker.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(evt) {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    
                    if (parsed.completedVideos || parsed.videoSources || parsed.videoNotes) {
                        if (parsed.completedVideos) state.completedVideos = parsed.completedVideos;
                        if (parsed.completedDates) state.completedDates = parsed.completedDates;
                        if (parsed.videoSources) state.videoSources = parsed.videoSources;
                        if (parsed.videoNotes) state.videoNotes = parsed.videoNotes;
                        if (parsed.recentVideos) state.recentVideos = parsed.recentVideos;
                        
                        saveState();
                        alert("Backup data restored successfully!");
                        window.location.reload();
                    } else {
                        alert("Invalid backup file: Missing study state tables.");
                    }
                } catch (err) {
                    alert("Error parsing JSON file. Please verify it is a valid Study Companion Backup.");
                    console.error("JSON parsing error", err);
                }
            };
            
            reader.readAsText(file);
        }
    });

    // ----------------------------------------------------
    // 10. Initializing execution flow
    // ----------------------------------------------------
    
    // Theme setup
    const savedTheme = localStorage.getItem("bb_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Load State
    loadState();

    // Apply collapsible classes based on saved preferences
    if (state.sidebarCollapsed) {
        document.getElementById("appSidebar").classList.add("collapsed");
    }

    // Check last view state and route
    if (state.currentView === "settings") {
        navigateTo("settings");
    } else if (state.currentView.startsWith("subject-") && state.activeSubjectId) {
        navigateTo(state.currentView, state.activeSubjectId);
    } else {
        navigateTo("dashboard");
    }

    // ----------------------------------------------------
    // 11. Counting Utility helpers
    // ----------------------------------------------------
    function formatDuration(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        const formattedSecs = secs.toString().padStart(2, '0');
        if (hrs > 0) {
            const formattedMins = mins.toString().padStart(2, '0');
            return `${hrs}:${formattedMins}:${formattedSecs}`;
        }
        return `${mins}:${formattedSecs}`;
    }

    function countSubjectVideos(subject) {
        let count = 0;
        subject.sections.forEach(sec => {
            count += sec.videos.length;
        });
        return count;
    }

    function countSubjectCompleted(subject) {
        let count = 0;
        subject.sections.forEach(sec => {
            sec.videos.forEach(v => {
                if (state.completedVideos[v.id]) count++;
            });
        });
        return count;
    }
});
