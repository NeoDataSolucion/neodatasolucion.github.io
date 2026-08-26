"use strict";

/* =========================================================
   NEOCONCILIA ENGINE v1.0
   Motor reutilizable para demostraciones del Ecosistema Neo
========================================================= */

(() => {

    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const CONFIG = {
        initialDelay: 700,
        sourceDelay: 350,
        stepDuration: 650,
        counterDuration: 1100,

        totalProcessed: 15292,

        steps: [
            {
                label: "Preparando fuentes",
                status: "Preparando",
                progress: 5
            },
            {
                label: "Conectando fuentes",
                status: "Conectando",
                progress: 18
            },
            {
                label: "Leyendo registros",
                status: "Leyendo información",
                progress: 38
            },
            {
                label: "Aplicando reglas",
                status: "Validando reglas",
                progress: 62
            },
            {
                label: "Comparando información",
                status: "Comparando",
                progress: 86
            },
            {
                label: "Generando reporte",
                status: "Generando reporte",
                progress: 100
            }
        ]
    };


    /* =====================================================
       ESTADO DEL MOTOR
    ===================================================== */

    const state = {
        isRunning: false,
        runId: 0,
        results: null
    };


    /* =====================================================
       REFERENCIAS DEL DOM
    ===================================================== */

    const dom = {
        dashboard: null,
        status: null,
        statusDot: null,

        sourceCards: [],
        sourceStates: [],

        processLabel: null,
        processPercentage: null,
        progress: null,
        progressBar: null,

        resultCards: [],
        resultNumbers: [],
        resultDetails: [],

        restartButton: null,
        executionTime: null
    };


    /* =====================================================
       INICIALIZACIÓN
    ===================================================== */

    function init() {

        cacheDom();

        if (!dom.dashboard) {
            console.warn(
                "NeoConcilia Engine: no se encontró el dashboard."
            );

            return;
        }

        prepareAccessibility();
        bindEvents();
        startDemo();
    }


    function cacheDom() {

        dom.dashboard =
            document.getElementById("conciliaDashboard");

        dom.status =
            document.getElementById("dashboardStatus");

        dom.statusDot =
            document.querySelector(
                ".concilia-dashboard__status-dot"
            );

        dom.sourceCards =
            Array.from(
                document.querySelectorAll(
                    ".concilia-source-card"
                )
            );

        dom.sourceStates =
            Array.from(
                document.querySelectorAll(
                    ".concilia-source-card__state"
                )
            );

        dom.processLabel =
            document.getElementById("processLabel");

        dom.processPercentage =
            document.getElementById("processPercentage");

        dom.progress =
            document.querySelector(".concilia-progress");

        dom.progressBar =
            document.getElementById("processBar");

        dom.resultCards =
            Array.from(
                document.querySelectorAll(
                    ".concilia-result-card"
                )
            );

        dom.resultNumbers =
            Array.from(
                document.querySelectorAll(
                    ".concilia-result-card__number"
                )
            );

        dom.resultDetails =
            Array.from(
                document.querySelectorAll(
                    ".concilia-result-card__detail"
                )
            );

        dom.restartButton =
            document.getElementById("restartDemo");

        dom.executionTime =
            document.querySelector(
                ".concilia-results__time"
            );
    }


    function prepareAccessibility() {

        if (dom.progress) {
            dom.progress.setAttribute(
                "aria-valuenow",
                "0"
            );
        }

        if (dom.restartButton) {
            dom.restartButton.setAttribute(
                "aria-label",
                "Ejecutar nuevamente la demostración de NeoConcilia"
            );
        }
    }


    function bindEvents() {

        dom.restartButton?.addEventListener(
            "click",
            startDemo
        );
    }


    /* =====================================================
       CONTROL PRINCIPAL
    ===================================================== */

    async function startDemo() {

        if (state.isRunning) {
            return;
        }

        state.isRunning = true;
        state.runId += 1;

        const currentRun = state.runId;

        disableRestartButton();
        resetDemo();

        await wait(CONFIG.initialDelay);

        if (!isCurrentRun(currentRun)) {
            return;
        }

        await showSources(currentRun);
        await runEngine(currentRun);
        await showResults(currentRun);

        if (!isCurrentRun(currentRun)) {
            return;
        }

        finishDemo();
    }


    function isCurrentRun(runId) {
        return state.runId === runId;
    }


    /* =====================================================
       REINICIO
    ===================================================== */

    function resetDemo() {

        state.results = generateResults();

        updateStatus(
            "Preparando",
            "running"
        );

        updateProgress(
            0,
            "Preparando fuentes"
        );

        dom.sourceCards.forEach((card) => {

            card.classList.remove(
                "is-visible",
                "is-active"
            );

            card.style.opacity = "0";
            card.style.transform =
                "translateY(12px)";
        });

        dom.resultCards.forEach((card) => {

            card.classList.remove(
                "is-visible",
                "is-complete"
            );

            card.style.opacity = "0";
            card.style.transform =
                "translateY(14px)";
        });

        dom.resultNumbers.forEach((number) => {
            number.textContent = "0";
        });

        if (dom.executionTime) {
            dom.executionTime.textContent =
                "Procesando...";
        }

        updateResultDetails(state.results);
    }


    /* =====================================================
       FUENTES
    ===================================================== */

    async function showSources(runId) {

        updateStatus(
            "Conectando",
            "running"
        );

        updateProgress(
            12,
            "Conectando fuentes"
        );

        for (
            let index = 0;
            index < dom.sourceCards.length;
            index += 1
        ) {

            if (!isCurrentRun(runId)) {
                return;
            }

            const card = dom.sourceCards[index];

            card.classList.add(
                "is-visible",
                "is-active"
            );

            card.style.opacity = "1";
            card.style.transform =
                "translateY(0)";

            await wait(CONFIG.sourceDelay);
        }
    }


    /* =====================================================
       MOTOR DE PROCESAMIENTO
    ===================================================== */

    async function runEngine(runId) {

        for (const step of CONFIG.steps) {

            if (!isCurrentRun(runId)) {
                return;
            }

            updateStatus(
                step.status,
                "running"
            );

            updateProgress(
                step.progress,
                step.label
            );

            await wait(CONFIG.stepDuration);
        }
    }


    function updateProgress(
        percentage,
        label
    ) {

        const safePercentage =
            Math.min(
                100,
                Math.max(0, percentage)
            );

        if (dom.processLabel) {
            dom.processLabel.textContent = label;
        }

        if (dom.processPercentage) {
            dom.processPercentage.textContent =
                `${safePercentage}%`;
        }

        if (dom.progressBar) {
            dom.progressBar.style.width =
                `${safePercentage}%`;
        }

        if (dom.progress) {
            dom.progress.setAttribute(
                "aria-valuenow",
                String(safePercentage)
            );
        }
    }


    /* =====================================================
       RESULTADOS
    ===================================================== */

    async function showResults(runId) {

        const values = [
            state.results.matches,
            state.results.differences,
            state.results.duplicates,
            state.results.pending
        ];

        for (
            let index = 0;
            index < dom.resultCards.length;
            index += 1
        ) {

            if (!isCurrentRun(runId)) {
                return;
            }

            const card =
                dom.resultCards[index];

            const number =
                dom.resultNumbers[index];

            card.classList.add("is-visible");

            card.style.opacity = "1";
            card.style.transform =
                "translateY(0)";

            await animateCounter(
                number,
                values[index],
                CONFIG.counterDuration
            );

            card.classList.add(
                "is-complete"
            );

            await wait(140);
        }
    }


    function generateResults() {

        const differences =
            randomInteger(6, 16);

        const duplicates =
            randomInteger(2, 6);

        const pending =
            randomInteger(3, 9);

        const matches =
            CONFIG.totalProcessed
            - differences
            - duplicates
            - pending;

        return {
            matches,
            differences,
            duplicates,
            pending,
            total: CONFIG.totalProcessed
        };
    }


    function updateResultDetails(results) {

        if (dom.resultDetails.length < 4) {
            return;
        }

        const matchPercentage =
            (
                results.matches
                / results.total
                * 100
            ).toFixed(2);

        dom.resultDetails[0].textContent =
            `${matchPercentage}% del total`;

        dom.resultDetails[1].textContent =
            `${results.differences} requieren validación`;

        dom.resultDetails[2].textContent =
            `${results.duplicates} coincidencias de llave`;

        dom.resultDetails[3].textContent =
            `${results.pending} no localizados`;
    }


    /* =====================================================
       CONTADORES
    ===================================================== */

    function animateCounter(
        element,
        target,
        duration
    ) {

        return new Promise((resolve) => {

            if (!element) {
                resolve();
                return;
            }

            const startTime =
                performance.now();

            function update(currentTime) {

                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );

                const easedProgress =
                    easeOutCubic(progress);

                const currentValue =
                    Math.floor(
                        target * easedProgress
                    );

                element.textContent =
                    formatNumber(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent =
                        formatNumber(target);

                    resolve();
                }
            }

            requestAnimationFrame(update);
        });
    }


    function easeOutCubic(value) {
        return 1 - Math.pow(1 - value, 3);
    }


    /* =====================================================
       FINALIZACIÓN
    ===================================================== */

    function finishDemo() {

        updateStatus(
            "Conciliación completada",
            "success"
        );

        updateProgress(
            100,
            "Reporte generado correctamente"
        );

        if (dom.executionTime) {
            dom.executionTime.textContent =
                "00:08 segundos";
        }

        dom.sourceCards.forEach((card) => {
            card.classList.add("is-active");
        });

        enableRestartButton();

        state.isRunning = false;
    }


    function updateStatus(
        text,
        type
    ) {

        if (dom.status) {
            dom.status.textContent = text;
        }

        const statusContainer =
            dom.status?.closest(
                ".concilia-dashboard__status"
            );

        if (!statusContainer) {
            return;
        }

        statusContainer.dataset.status = type;

        if (type === "success") {
            statusContainer.style.color =
                "#137b58";

            statusContainer.style.background =
                "rgba(26, 168, 116, 0.12)";

            if (dom.statusDot) {
                dom.statusDot.style.background =
                    "#1aa874";

                dom.statusDot.style.animation =
                    "none";
            }
        } else {
            statusContainer.style.color = "";
            statusContainer.style.background = "";

            if (dom.statusDot) {
                dom.statusDot.style.background = "";
                dom.statusDot.style.animation = "";
            }
        }
    }


    /* =====================================================
       BOTÓN DE REINICIO
    ===================================================== */

    function disableRestartButton() {

        if (!dom.restartButton) {
            return;
        }

        dom.restartButton.disabled = true;
        dom.restartButton.style.opacity = "0.5";
        dom.restartButton.style.cursor =
            "not-allowed";
    }


    function enableRestartButton() {

        if (!dom.restartButton) {
            return;
        }

        dom.restartButton.disabled = false;
        dom.restartButton.style.opacity = "1";
        dom.restartButton.style.cursor =
            "pointer";
    }


    /* =====================================================
       UTILIDADES
    ===================================================== */

    function wait(milliseconds) {

        return new Promise((resolve) => {
            window.setTimeout(
                resolve,
                milliseconds
            );
        });
    }


    function randomInteger(
        minimum,
        maximum
    ) {

        return Math.floor(
            Math.random()
            * (maximum - minimum + 1)
        ) + minimum;
    }


    function formatNumber(number) {

        return new Intl.NumberFormat(
            "es-MX"
        ).format(number);
    }


    /* =====================================================
       ARRANQUE
    ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();