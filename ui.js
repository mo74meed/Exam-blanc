// "Exam Blanc" Interactive UI Controller
// Manages DOM rendering, events, and transitions

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Initialize State
    // ----------------------------------------------------
    loadState();
    
    // Theme setup
    const savedTheme = localStorage.getItem("eb_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    if (examSubmitted) {
        renderResults();
    } else {
        startTimer();
        renderSidebarGrid();
        renderQuestion(currentQuestionIndex);
    }
    
    // ----------------------------------------------------
    // 2. Global Event Bindings
    // ----------------------------------------------------
    // Theme Toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("eb_theme", newTheme);
        });
    }
    
    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById("mobileToggle");
    const sidebar = document.querySelector(".app-sidebar");
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
    
    // Bookmark/Flag Button
    const flagBtn = document.getElementById("flagBtn");
    if (flagBtn) {
        flagBtn.addEventListener("click", () => {
            const q = questions[currentQuestionIndex];
            flaggedQuestions[q.id] = !flaggedQuestions[q.id];
            saveState();
            updateFlagButtonState();
            updateSidebarCell(currentQuestionIndex);
        });
    }
    
    // Navigation Buttons
    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentQuestionIndex > 0) {
                saveCurrentAnswer();
                currentQuestionIndex--;
                saveState();
                renderQuestion(currentQuestionIndex);
            }
        });
    }
    
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentQuestionIndex < questions.length - 1) {
                saveCurrentAnswer();
                currentQuestionIndex++;
                saveState();
                renderQuestion(currentQuestionIndex);
            }
        });
    }
    
    // Submit Button
    const submitBtn = document.getElementById("submitExamBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            saveCurrentAnswer();
            openSubmitConfirmation();
        });
    }
    
    // Lightbox Controls
    const lightbox = document.getElementById("imageLightbox");
    const lightboxClose = document.querySelector(".lightbox-close");
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("active");
        });
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
            }
        });
    }
    
    // Modal Confirmations
    const confirmOverlay = document.getElementById("confirmSubmitModal");
    const cancelSubmit = document.getElementById("cancelSubmit");
    const confirmSubmit = document.getElementById("confirmSubmit");
    if (cancelSubmit && confirmOverlay) {
        cancelSubmit.addEventListener("click", () => {
            confirmOverlay.classList.remove("active");
        });
    }
    if (confirmSubmit && confirmOverlay) {
        confirmSubmit.addEventListener("click", () => {
            confirmOverlay.classList.remove("active");
            submitExam();
        });
    }
});

// ----------------------------------------------------
// 3. Question Render Controller
// ----------------------------------------------------
function renderQuestion(index) {
    const q = questions[index];
    if (!q) return;
    
    // Mark as visited
    visitedQuestions[q.id] = true;
    saveState();
    
    // Close mobile sidebar if open
    const sidebar = document.querySelector(".app-sidebar");
    if (sidebar) sidebar.classList.remove("active");
    
    // Update active cell in grid
    document.querySelectorAll(".q-cell").forEach((cell, idx) => {
        if (idx === index) {
            cell.classList.add("active");
        } else {
            cell.classList.remove("active");
        }
    });
    updateSidebarCell(index);
    updateProgress();
    
    // Compile Question HTML
    const qArea = document.getElementById("questionArea");
    qArea.innerHTML = "";
    
    // Question Card Box
    const card = document.createElement("div");
    card.className = "q-card animate-fadeIn";
    
    // Badge Container
    const badgeContainer = document.createElement("div");
    badgeContainer.style.display = "flex";
    badgeContainer.style.gap = "8px";
    badgeContainer.style.marginBottom = "10px";
    
    // Category Badge
    const catBadge = document.createElement("div");
    catBadge.className = "q-badge";
    catBadge.style.marginBottom = "0";
    const partNum = index >= 23 ? 2 : 1;
    catBadge.textContent = `Partie ${partNum} | ${q.category} • Q${index + 1}/${questions.length}`;
    badgeContainer.appendChild(catBadge);
    
    // Type Badge
    const typeBadge = document.createElement("div");
    typeBadge.className = "q-badge";
    typeBadge.style.marginBottom = "0";
    typeBadge.style.backgroundColor = "var(--color-gray-bg)";
    typeBadge.style.color = "var(--text-secondary)";
    typeBadge.style.border = "1px solid var(--border-color)";
    
    if (q.type === "qcm") {
        typeBadge.textContent = "QCM (Choix multiple)";
    } else if (q.type === "qcu" || q.type === "qcu_image") {
        typeBadge.textContent = "QCU (Choix unique)";
    } else if (q.type === "text") {
        typeBadge.textContent = "Question Rédigée";
        typeBadge.style.backgroundColor = "var(--color-warning-bg)";
        typeBadge.style.color = "var(--color-warning-hover)";
        typeBadge.style.borderColor = "var(--color-warning-hover)";
    } else if (q.type === "matching" || q.type === "matching_zones") {
        typeBadge.textContent = "Association / Appariement";
    }
    badgeContainer.appendChild(typeBadge);
    card.appendChild(badgeContainer);
    
    // Question Text
    const text = document.createElement("div");
    text.className = "q-text";
    text.textContent = q.text;
    card.appendChild(text);
    
    // Question Image or Custom HTML Content (if exists)
    if (q.htmlContent) {
        const customContainer = document.createElement("div");
        customContainer.className = "custom-html-container";
        customContainer.innerHTML = q.htmlContent;
        card.appendChild(customContainer);
    } else if (q.image) {
        const imgBox = document.createElement("div");
        imgBox.className = "q-image-box";
        
        const img = document.createElement("img");
        img.src = q.image;
        img.alt = `Radiographie Question ${q.id}`;
        imgBox.appendChild(img);
        
        const zoomHint = document.createElement("div");
        zoomHint.className = "zoom-hint";
        zoomHint.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            Agrandir l'image
        `;
        imgBox.appendChild(zoomHint);
        
        imgBox.addEventListener("click", () => {
            triggerLightbox(q.image, `Figure Clinique - Question ${index + 1}`);
        });
        
        card.appendChild(imgBox);
    }
    
    // Options/Input container
    const inputContainer = document.createElement("div");
    inputContainer.className = "input-container";
    
    // Render based on type
    if (q.type === "qcm" || q.type === "qcu") {
        const list = document.createElement("div");
        list.className = "options-list";
        
        const userVal = userAnswers[q.id] || (q.type === "qcm" ? [] : "");
        
        q.options.forEach(opt => {
            const label = document.createElement("label");
            label.className = "option-label";
            
            const input = document.createElement("input");
            input.type = q.type === "qcm" ? "checkbox" : "radio";
            input.name = `question_${q.id}`;
            input.value = opt.id;
            
            // Check state
            const isChecked = q.type === "qcm" ? userVal.includes(opt.id) : userVal === opt.id;
            input.checked = isChecked;
            if (isChecked) label.classList.add("checked");
            
            // Event to update selection styling and answer state immediately
            input.addEventListener("change", () => {
                if (q.type === "qcm") {
                    const currentAnswers = label.parentElement.querySelectorAll("input:checked");
                    const vals = Array.from(currentAnswers).map(el => el.value);
                    userAnswers[q.id] = vals;
                    
                    // Update classes
                    label.parentElement.querySelectorAll(".option-label").forEach(lbl => {
                        const cb = lbl.querySelector("input");
                        if (cb.checked) lbl.classList.add("checked");
                        else lbl.classList.remove("checked");
                    });
                } else {
                    userAnswers[q.id] = opt.id;
                    label.parentElement.querySelectorAll(".option-label").forEach(lbl => {
                        lbl.classList.remove("checked");
                    });
                    label.classList.add("checked");
                }
                saveState();
                updateSidebarCell(index);
            });
            
            label.appendChild(input);
            
            const spanText = document.createElement("span");
            spanText.textContent = `${opt.id.toUpperCase()}. ${opt.text}`;
            label.appendChild(spanText);
            
            list.appendChild(label);
        });
        inputContainer.appendChild(list);
        
    } else if (q.type === "qcu_image") {
        const grid = document.createElement("div");
        grid.className = "image-options-grid";
        
        const userVal = userAnswers[q.id] || "";
        
        q.options.forEach(opt => {
            const label = document.createElement("label");
            label.className = "img-option-label";
            if (userVal === opt.id) label.classList.add("checked");
            
            const preview = document.createElement("div");
            preview.className = "img-option-preview";
            const img = document.createElement("img");
            img.src = opt.image;
            img.alt = opt.text;
            preview.appendChild(img);
            label.appendChild(preview);
            
            const footer = document.createElement("div");
            footer.className = "img-option-footer";
            
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question_${q.id}`;
            input.value = opt.id;
            input.checked = userVal === opt.id;
            footer.appendChild(input);
            
            const span = document.createElement("span");
            span.textContent = `${opt.id.toUpperCase()}. ${opt.text}`;
            footer.appendChild(span);
            
            label.appendChild(footer);
            
            input.addEventListener("change", () => {
                userAnswers[q.id] = opt.id;
                label.parentElement.querySelectorAll(".img-option-label").forEach(lbl => {
                    lbl.classList.remove("checked");
                });
                label.classList.add("checked");
                saveState();
                updateSidebarCell(index);
            });
            
            grid.appendChild(label);
        });
        inputContainer.appendChild(grid);
        
    } else if (q.type === "text") {
        const wrapper = document.createElement("div");
        wrapper.className = "textarea-wrapper";
        
        const textLabel = document.createElement("div");
        textLabel.style.fontSize = "13px";
        textLabel.style.fontWeight = "700";
        textLabel.style.marginBottom = "5px";
        textLabel.style.color = "var(--text-secondary)";
        textLabel.textContent = "Votre réponse rédigée :";
        wrapper.appendChild(textLabel);
        
        const textarea = document.createElement("textarea");
        textarea.className = "textarea-input";
        textarea.placeholder = "Saisissez votre interprétation ou diagnostic détaillé ici...";
        textarea.value = userAnswers[q.id] || "";
        
        const counter = document.createElement("div");
        counter.style.fontSize = "11px";
        counter.style.color = "var(--text-secondary)";
        counter.style.textAlign = "right";
        counter.style.marginTop = "2px";
        
        const updateWordCount = (val) => {
            const words = val.trim() ? val.trim().split(/\s+/).length : 0;
            const chars = val.length;
            counter.textContent = `${words} mots | ${chars} caractères`;
        };
        
        updateWordCount(textarea.value);
        
        textarea.addEventListener("input", (e) => {
            userAnswers[q.id] = e.target.value;
            updateWordCount(e.target.value);
            saveState();
            updateSidebarCell(index);
        });
        
        wrapper.appendChild(textarea);
        wrapper.appendChild(counter);
        inputContainer.appendChild(wrapper);
        
    } else if (q.type === "matching") {
        const list = document.createElement("div");
        list.className = "matching-list";
        
        const userVals = userAnswers[q.id] || {};
        
        q.matchingItems.forEach(item => {
            const row = document.createElement("div");
            row.className = "matching-row";
            
            const label = document.createElement("div");
            label.className = "match-label";
            label.textContent = item.label;
            row.appendChild(label);
            
            const select = document.createElement("select");
            select.className = "match-select";
            
            const placeholderOpt = document.createElement("option");
            placeholderOpt.value = "";
            placeholderOpt.textContent = "Choisir le dispositif...";
            select.appendChild(placeholderOpt);
            
            q.options.forEach(optVal => {
                const option = document.createElement("option");
                option.value = optVal;
                option.textContent = optVal;
                if (userVals[item.id] === optVal) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            select.addEventListener("change", (e) => {
                if (!userAnswers[q.id]) userAnswers[q.id] = {};
                userAnswers[q.id][item.id] = e.target.value;
                saveState();
                updateSidebarCell(index);
            });
            
            row.appendChild(select);
            list.appendChild(row);
        });
        inputContainer.appendChild(list);
        
    } else if (q.type === "matching_zones") {
        const container = document.createElement("div");
        container.className = "zones-matching-container";
        
        const grid = document.createElement("div");
        grid.className = "zones-grid";
        
        const userVals = userAnswers[q.id] || {};
        
        q.zones.forEach(zoneNum => {
            const row = document.createElement("div");
            row.className = "zone-match-row";
            
            const badge = document.createElement("div");
            badge.className = "zone-number-badge";
            badge.textContent = zoneNum;
            row.appendChild(badge);
            
            const select = document.createElement("select");
            select.className = "match-select";
            
            const placeholderOpt = document.createElement("option");
            placeholderOpt.value = "";
            placeholderOpt.textContent = `Associer la Zone ${zoneNum}...`;
            select.appendChild(placeholderOpt);
            
            q.options.forEach(optVal => {
                const option = document.createElement("option");
                option.value = optVal;
                // shorten label in select to look nicer
                option.textContent = optVal.split(" (")[0];
                if (userVals[zoneNum] === optVal) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            select.addEventListener("change", (e) => {
                if (!userAnswers[q.id]) userAnswers[q.id] = {};
                userAnswers[q.id][zoneNum] = e.target.value;
                saveState();
                updateSidebarCell(index);
            });
            
            row.appendChild(select);
            grid.appendChild(row);
        });
        container.appendChild(grid);
        inputContainer.appendChild(container);
    }
    
    card.appendChild(inputContainer);
    qArea.appendChild(card);
    
    // Update Button availability
    updateNavButtons();
    updateFlagButtonState();
}

function saveCurrentAnswer() {
    // Standard inputs are bound to event listeners, but we call saveState as a fallback
    saveState();
}

function updateNavButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentQuestionIndex === questions.length - 1;
    }
}

function updateFlagButtonState() {
    const flagBtn = document.getElementById("flagBtn");
    if (!flagBtn) return;
    
    const q = questions[currentQuestionIndex];
    if (flaggedQuestions[q.id]) {
        flagBtn.classList.remove("btn-secondary");
        flagBtn.classList.add("btn-warning");
        flagBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            Signalé
        `;
    } else {
        flagBtn.classList.remove("btn-warning");
        flagBtn.classList.add("btn-secondary");
        flagBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            Signaler pour relecture
        `;
    }
}

// ----------------------------------------------------
// 4. Sidebar Dynamic Updates
// ----------------------------------------------------
function renderSidebarGrid() {
    const grid = document.getElementById("questionGrid");
    if (!grid) return;
    grid.innerHTML = "";
    
    // Header for Part 1
    const h1 = document.createElement("div");
    h1.className = "grid-part-header";
    h1.textContent = "Partie 1 (Gastro & Pneumo)";
    grid.appendChild(h1);
    
    questions.forEach((q, idx) => {
        if (idx === 23) {
            // Header for Part 2
            const h2 = document.createElement("div");
            h2.className = "grid-part-header";
            h2.textContent = "Partie 2 (Compléments)";
            grid.appendChild(h2);
        }
        
        const cell = document.createElement("div");
        cell.className = "q-cell";
        cell.textContent = idx + 1;
        
        // Add click behavior
        cell.addEventListener("click", () => {
            saveCurrentAnswer();
            currentQuestionIndex = idx;
            saveState();
            renderQuestion(idx);
        });
        
        grid.appendChild(cell);
        updateSidebarCell(idx);
    });
}

function updateSidebarCell(index) {
    const q = questions[index];
    const cells = document.querySelectorAll(".q-cell");
    if (cells.length <= index) return;
    const cell = cells[index];
    
    // Remove states
    cell.classList.remove("visited", "answered", "flagged");
    
    // Apply states
    if (visitedQuestions[q.id]) cell.classList.add("visited");
    
    // Check if answered
    let isAnswered = false;
    const answer = userAnswers[q.id];
    if (answer !== undefined && answer !== null) {
        if (q.type === "qcm" && Array.isArray(answer) && answer.length > 0) isAnswered = true;
        else if (q.type === "text" && typeof answer === "string" && answer.trim().length > 0) isAnswered = true;
        else if ((q.type === "qcu" || q.type === "qcu_image") && typeof answer === "string" && answer.length > 0) isAnswered = true;
        else if ((q.type === "matching" || q.type === "matching_zones") && typeof answer === "object") {
            // Check if at least one dropdown is selected
            const keys = Object.keys(answer);
            if (keys.length > 0 && keys.some(k => answer[k] && answer[k].length > 0)) {
                isAnswered = true;
            }
        }
    }
    
    if (isAnswered) cell.classList.add("answered");
    if (flaggedQuestions[q.id]) cell.classList.add("flagged");
}

function updateProgress() {
    let answeredCount = 0;
    
    questions.forEach(q => {
        const answer = userAnswers[q.id];
        if (answer !== undefined && answer !== null) {
            if (q.type === "qcm" && Array.isArray(answer) && answer.length > 0) answeredCount++;
            else if (q.type === "text" && typeof answer === "string" && answer.trim().length > 0) answeredCount++;
            else if ((q.type === "qcu" || q.type === "qcu_image") && typeof answer === "string" && answer.length > 0) answeredCount++;
            else if ((q.type === "matching" || q.type === "matching_zones") && typeof answer === "object") {
                const keys = Object.keys(answer);
                if (keys.length > 0 && keys.some(k => answer[k] && answer[k].length > 0)) {
                    answeredCount++;
                }
            }
        }
    });
    
    const pct = Math.round((answeredCount / questions.length) * 100);
    
    const fill = document.getElementById("progressFill");
    if (fill) fill.style.width = `${pct}%`;
    
    const counter = document.getElementById("progressCounter");
    if (counter) {
        counter.textContent = `${answeredCount} sur ${questions.length} répondus (${pct}%)`;
    }
}

// ----------------------------------------------------
// 5. Lightbox Trigger
// ----------------------------------------------------
function triggerLightbox(src, title) {
    const lightbox = document.getElementById("imageLightbox");
    const lbImg = document.getElementById("lightboxImage");
    const lbTitle = document.querySelector(".lightbox-title");
    
    if (lightbox && lbImg && lbTitle) {
        lbImg.src = src;
        lbTitle.textContent = title;
        lightbox.classList.add("active");
    }
}

// ----------------------------------------------------
// 6. Submission confirmation
// ----------------------------------------------------
function openSubmitConfirmation() {
    const overlay = document.getElementById("confirmSubmitModal");
    const bodyText = document.getElementById("confirmModalBody");
    
    let answeredCount = 0;
    questions.forEach(q => {
        const answer = userAnswers[q.id];
        if (answer !== undefined && answer !== null) {
            if (q.type === "qcm" && Array.isArray(answer) && answer.length > 0) answeredCount++;
            else if (q.type === "text" && typeof answer === "string" && answer.trim().length > 0) answeredCount++;
            else if ((q.type === "qcu" || q.type === "qcu_image") && typeof answer === "string" && answer.length > 0) answeredCount++;
            else if ((q.type === "matching" || q.type === "matching_zones") && typeof answer === "object") {
                const keys = Object.keys(answer);
                if (keys.length > 0 && keys.some(k => answer[k] && answer[k].length > 0)) {
                    answeredCount++;
                }
            }
        }
    });
    
    const uncompleted = questions.length - answeredCount;
    
    if (overlay && bodyText) {
        if (uncompleted > 0) {
            bodyText.innerHTML = `Vous avez répondu à <strong>${answeredCount}</strong> questions sur <strong>${questions.length}</strong>.<br><br>Il vous reste <strong>${uncompleted}</strong> question(s) sans réponse.<br><br>Êtes-vous sûr de vouloir soumettre votre copie ?`;
        } else {
            bodyText.innerHTML = `Toutes les <strong>${questions.length}</strong> questions ont été traitées.<br><br>Voulez-vous soumettre votre copie et terminer l'épreuve ?`;
        }
        overlay.classList.add("active");
    }
}

function submitExam() {
    examSubmitted = true;
    saveState();
    clearInterval(timerInterval);
    renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----------------------------------------------------
// 7. Results Dashboard & Correction Renderer
// ----------------------------------------------------
function renderResults() {
    // Hide standard exam panels
    const mainWrapper = document.getElementById("mainWrapper");
    if (mainWrapper) mainWrapper.style.display = "none";
    
    const headerControls = document.getElementById("headerControls");
    if (headerControls) headerControls.style.display = "none";
    
    const submitBtn = document.getElementById("submitExamBtn");
    if (submitBtn) submitBtn.style.display = "none";
    
    // Score calculation
    const scores = calculateScore();
    const timeTakenStr = getFormattedTimeTaken();
    
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";
    resultContainer.style.display = "flex";
    
    // Result Card
    const resultCard = document.createElement("div");
    resultCard.className = "result-card";
    
    const h2 = document.createElement("h2");
    h2.textContent = "Résultats de l'Examen";
    h2.style.fontSize = "26px";
    resultCard.appendChild(h2);
    
    // Score circle indicator
    const circleWrapper = document.createElement("div");
    circleWrapper.className = "score-circle-wrapper";
    
    const radius = 70;
    const circ = 2 * Math.PI * radius; // 439.8
    const strokeDashOffset = circ - (scores.percentage / 100) * circ;
    
    circleWrapper.innerHTML = `
        <svg class="score-circle-svg" width="160" height="160">
            <circle class="score-circle-bg" cx="80" cy="80" r="${radius}"></circle>
            <circle class="score-circle-fill" cx="80" cy="80" r="${radius}" 
                style="stroke-dasharray: ${circ}; stroke-dashoffset: ${strokeDashOffset}"></circle>
        </svg>
        <div class="score-circle-text">
            ${scores.percentage}%
            <span class="score-circle-label">${scores.score} / ${scores.totalQCMs}</span>
        </div>
    `;
    resultCard.appendChild(circleWrapper);
    
    // Stats grid
    const statsGrid = document.createElement("div");
    statsGrid.className = "stats-grid";
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${scores.score} / ${scores.totalQCMs}</div>
            <div class="stat-label">Score QCM/Matching</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${timeTakenStr}</div>
            <div class="stat-label">Temps Écoulé</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${questions.filter(q => q.type === "text").length}</div>
            <div class="stat-label">Réponses Rédigées (À valider)</div>
        </div>
    `;
    resultCard.appendChild(statsGrid);
    
    // Reset buttons
    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "15px";
    btnRow.style.marginTop = "10px";
    
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn btn-primary";
    restartBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        Recommencer l'épreuve
    `;
    restartBtn.addEventListener("click", () => {
        if (confirm("Voulez-vous réinitialiser toutes vos réponses et recommencer l'épreuve ?")) {
            resetState();
            window.scrollTo(0, 0);
            window.location.reload();
        }
    });
    btnRow.appendChild(restartBtn);
    resultCard.appendChild(btnRow);
    resultContainer.appendChild(resultCard);
    
    // Correction Recap Header
    const filterBar = document.createElement("div");
    filterBar.className = "filter-bar";
    filterBar.innerHTML = `
        <div class="filter-title">Correction détaillée et Corrigé type</div>
        <div class="filter-buttons">
            <button class="filter-btn active" id="f-all">Tous</button>
            <button class="filter-btn" id="f-qcm">QCMs uniquement</button>
            <button class="filter-btn" id="f-text">Questions rédigées</button>
        </div>
    `;
    resultContainer.appendChild(filterBar);
    
    // Review list wrapper
    const reviewList = document.createElement("div");
    reviewList.className = "review-list";
    resultContainer.appendChild(reviewList);
    
    // Populate cards
    renderCorrectionCards("all", reviewList);
    
    // Filter click bindings
    filterBar.querySelector("#f-all").addEventListener("click", (e) => {
        setActiveFilter(e.target);
        renderCorrectionCards("all", reviewList);
    });
    filterBar.querySelector("#f-qcm").addEventListener("click", (e) => {
        setActiveFilter(e.target);
        renderCorrectionCards("qcm", reviewList);
    });
    filterBar.querySelector("#f-text").addEventListener("click", (e) => {
        setActiveFilter(e.target);
        renderCorrectionCards("text", reviewList);
    });
}

function setActiveFilter(btn) {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function renderCorrectionCards(filter, container) {
    container.innerHTML = "";
    
    questions.forEach((q, idx) => {
        // filter conditions
        if (filter === "qcm" && q.type === "text") return;
        if (filter === "text" && q.type !== "text") return;
        
        const card = document.createElement("div");
        card.className = "review-card";
        
        // Header
        const header = document.createElement("div");
        header.className = "review-header";
        
        const title = document.createElement("div");
        const partText = idx >= 23 ? "Partie 2" : "Partie 1";
        title.innerHTML = `<span style="color: var(--text-secondary); font-weight: bold; margin-right: 8px;">Q${idx + 1}</span><span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; background: var(--color-primary-bg); color: var(--color-primary); padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-weight: 700; border: 1px solid var(--border-color);">${partText}</span><strong>${q.category}</strong>`;
        header.appendChild(title);
        
        // Evaluate state
        const badge = document.createElement("div");
        badge.className = "status-badge";
        
        const answer = userAnswers[q.id];
        
        if (q.type === "text") {
            card.classList.add("manual-review");
            badge.classList.add("manual-review");
            badge.textContent = "Réponse rédigée";
        } else {
            let isCorrect = false;
            if (q.type === "qcm") {
                const userSelection = answer || [];
                const correctSet = q.draftCorrectAnswers;
                isCorrect = [...correctSet].sort().length === [...userSelection].sort().length &&
                    [...correctSet].sort().every((val, i) => val === [...userSelection].sort()[i]);
            } else if (q.type === "qcu" || q.type === "qcu_image") {
                isCorrect = answer === q.draftCorrectAnswer;
            } else if (q.type === "matching" || q.type === "matching_zones") {
                const userVals = answer || {};
                const correctSet = q.draftCorrectAnswers;
                let keys = Object.keys(correctSet);
                let correctCount = 0;
                keys.forEach(k => {
                    if (userVals[k] === correctSet[k]) correctCount++;
                });
                isCorrect = correctCount === keys.length;
            }
            
            if (isCorrect) {
                card.classList.add("correct");
                badge.classList.add("correct");
                badge.textContent = "Correct";
            } else {
                card.classList.add("incorrect");
                badge.classList.add("incorrect");
                badge.textContent = "Incorrect ou partiel";
            }
        }
        
        header.appendChild(badge);
        card.appendChild(header);
        
        // Question Text
        const text = document.createElement("div");
        text.className = "q-text";
        text.style.fontSize = "16px";
        text.style.marginBottom = "15px";
        text.textContent = q.text;
        card.appendChild(text);
        
        // Image reference or Custom HTML Content
        if (q.htmlContent) {
            const customContainer = document.createElement("div");
            customContainer.className = "custom-html-container";
            customContainer.innerHTML = q.htmlContent;
            card.appendChild(customContainer);
        } else if (q.image) {
            const imgBox = document.createElement("div");
            imgBox.className = "q-image-box";
            imgBox.style.maxHeight = "200px";
            imgBox.style.padding = "5px";
            
            const img = document.createElement("img");
            img.src = q.image;
            img.style.maxHeight = "180px";
            imgBox.appendChild(img);
            
            imgBox.addEventListener("click", () => {
                triggerLightbox(q.image, `Figure Clinique - Question ${idx + 1}`);
            });
            
            card.appendChild(imgBox);
        }
        
        // Answers Correction panel
        const answersBox = document.createElement("div");
        answersBox.className = "review-answers-box";
        
        if (q.type === "qcm" || q.type === "qcu") {
            const list = document.createElement("div");
            list.className = "options-list";
            list.style.gap = "8px";
            
            const userVal = answer || (q.type === "qcm" ? [] : "");
            
            q.options.forEach(opt => {
                const line = document.createElement("div");
                line.className = "review-answer-line";
                
                const isSelected = q.type === "qcm" ? userVal.includes(opt.id) : userVal === opt.id;
                const isCorrect = q.type === "qcm" ? q.draftCorrectAnswers.includes(opt.id) : q.draftCorrectAnswer === opt.id;
                
                let icon = "";
                let textColor = "var(--text-primary)";
                let weight = "normal";
                
                if (isSelected && isCorrect) {
                    icon = `<svg class="answer-check-icon correct" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    textColor = "var(--color-success)";
                    weight = "600";
                } else if (isSelected && !isCorrect) {
                    icon = `<svg class="answer-check-icon incorrect" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    textColor = "var(--color-danger)";
                    weight = "600";
                } else if (!isSelected && isCorrect) {
                    icon = `<svg class="answer-check-icon correct" style="opacity: 0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    textColor = "var(--color-success)";
                    weight = "500";
                } else {
                    icon = `<span style="width: 16px; display:inline-block"></span>`;
                }
                
                line.innerHTML = `
                    ${icon}
                    <span style="color: ${textColor}; font-weight: ${weight}">
                        ${opt.id.toUpperCase()}. ${opt.text} ${isSelected ? "<strong>(Votre réponse)</strong>" : ""}
                    </span>
                `;
                list.appendChild(line);
            });
            answersBox.appendChild(list);
            card.appendChild(answersBox);
            
        } else if (q.type === "qcu_image") {
            const list = document.createElement("div");
            list.className = "options-list";
            list.style.gap = "8px";
            
            const userVal = answer || "";
            
            q.options.forEach(opt => {
                const line = document.createElement("div");
                line.className = "review-answer-line";
                
                const isSelected = userVal === opt.id;
                const isCorrect = q.draftCorrectAnswer === opt.id;
                
                let icon = "";
                let textColor = "var(--text-primary)";
                let weight = "normal";
                
                if (isSelected && isCorrect) {
                    icon = `<svg class="answer-check-icon correct" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    textColor = "var(--color-success)";
                    weight = "600";
                } else if (isSelected && !isCorrect) {
                    icon = `<svg class="answer-check-icon incorrect" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    textColor = "var(--color-danger)";
                    weight = "600";
                } else if (!isSelected && isCorrect) {
                    icon = `<svg class="answer-check-icon correct" style="opacity: 0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    textColor = "var(--color-success)";
                    weight = "500";
                } else {
                    icon = `<span style="width: 16px; display:inline-block"></span>`;
                }
                
                line.innerHTML = `
                    ${icon}
                    <span style="color: ${textColor}; font-weight: ${weight}">
                        ${opt.id.toUpperCase()}. ${opt.text} ${isSelected ? "<strong>(Votre réponse)</strong>" : ""}
                    </span>
                `;
                list.appendChild(line);
            });
            answersBox.appendChild(list);
            card.appendChild(answersBox);
            
        } else if (q.type === "matching" || q.type === "matching_zones") {
            const list = document.createElement("div");
            list.style.display = "flex";
            list.style.flexDirection = "column";
            list.style.gap = "8px";
            
            const userVals = answer || {};
            const correctSet = q.draftCorrectAnswers;
            
            const items = q.type === "matching" ? q.matchingItems : q.zones.map(z => ({ id: z, label: `Zone ${z}` }));
            
            items.forEach(item => {
                const line = document.createElement("div");
                line.className = "review-answer-line";
                
                const userChoice = userVals[item.id] || "Non associé";
                const correctChoice = correctSet[item.id];
                const isCorrect = userChoice === correctChoice;
                
                let icon = isCorrect 
                    ? `<svg class="answer-check-icon correct" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                    : `<svg class="answer-check-icon incorrect" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                
                line.innerHTML = `
                    ${icon}
                    <span>
                        <strong>${item.label} :</strong> 
                        <span style="color: ${isCorrect ? "var(--color-success)" : "var(--color-danger)"}">
                            ${userChoice.split(" (")[0]}
                        </span>
                        ${!isCorrect ? ` <span style="color: var(--text-secondary)">(Attendu : ${correctChoice.split(" (")[0]})</span>` : ""}
                    </span>
                `;
                list.appendChild(line);
            });
            
            answersBox.appendChild(list);
            card.appendChild(answersBox);
            
        } else if (q.type === "text") {
            // Text comparison split view
            const compareGrid = document.createElement("div");
            compareGrid.className = "text-compare-grid";
            
            const userPane = document.createElement("div");
            userPane.className = "text-compare-pane";
            userPane.innerHTML = `
                <div class="pane-title">Votre Réponse</div>
                <div class="pane-content">${(answer || "").trim() ? answer : "<em>(Aucune réponse saisie)</em>"}</div>
            `;
            compareGrid.appendChild(userPane);
            
            const modelPane = document.createElement("div");
            modelPane.className = "text-compare-pane";
            modelPane.innerHTML = `
                <div class="pane-title">Proposition de correction</div>
                <div class="pane-content">${q.modelAnswer}</div>
            `;
            compareGrid.appendChild(modelPane);
            
            answersBox.appendChild(compareGrid);
            card.appendChild(answersBox);
        }
        
        // Explanation
        if (q.explanation) {
            const exp = document.createElement("div");
            exp.className = "explanation-block";
            exp.innerHTML = `
                <strong>Explication Clinique :</strong>
                ${q.explanation}
            `;
            card.appendChild(exp);
        }
        
        container.appendChild(card);
    });
}
