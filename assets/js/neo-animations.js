/* ==========================================================
   NEO ANIMATIONS
   Motor de animaciones compartido para NeoWeb

   Versión: 2.0.0

   API HTML principal:

   data-neo-counter="12400000"
   data-neo-width="88"
   data-neo-height="42"
   data-neo-opacity="1"
   data-neo-scale="1"
   data-neo-rotate="360"
   data-neo-translate-x="40"
   data-neo-translate-y="40"

   Configuración opcional:

   data-neo-duration="1200"
   data-neo-delay="150"
   data-neo-threshold="0.35"
   data-neo-easing="cubic-bezier(.22, 1, .36, 1)"
   data-neo-once="true"

   Reinicio de un contenedor:

   data-neo-restart="#selector"
========================================================== */

(() => {

    "use strict";


    /* ======================================================
       MOTOR PRINCIPAL
    ====================================================== */

    const NeoAnimations = {


        /* ==================================================
           INFORMACIÓN DEL MOTOR
        ================================================== */

        name: "NeoAnimations",

        version: "2.0.0",


        /* ==================================================
           CONFIGURACIÓN GLOBAL
        ================================================== */

        config: {

            /*
             * Duración general para animaciones visuales.
             */
            duration: 1200,

            /*
             * Duración predeterminada para contadores.
             */
            counterDuration: 1500,

            /*
             * Retraso predeterminado.
             */
            delay: 0,

            /*
             * Porcentaje visible requerido para activar
             * una animación.
             */
            threshold: 0.35,

            /*
             * Curva general de movimiento.
             */
            easing: "cubic-bezier(.22, 1, .36, 1)",

            /*
             * Ejecutar cada animación una sola vez.
             */
            once: true,

            /*
             * Ajuste del área observada.
             */
            rootMargin: "0px 0px -5% 0px",

            /*
             * Mostrar advertencias de desarrollo.
             */
            debug: false

        },


        /* ==================================================
           SELECTORES DEL MOTOR
        ================================================== */

        selectors: {

            /*
             * Elementos que contienen una animación Neo.
             *
             * En bloques posteriores ampliaremos esta lista
             * si agregamos nuevos tipos de animación.
             */
            animated: [
                "[data-neo-counter]",
                "[data-neo-width]",
                "[data-neo-height]",
                "[data-neo-opacity]",
                "[data-neo-scale]",
                "[data-neo-rotate]",
                "[data-neo-translate-x]",
                "[data-neo-translate-y]"
            ].join(", "),

            /*
             * Botones utilizados para reiniciar animaciones.
             */
            restart: "[data-neo-restart]"

        },


        /* ==================================================
           ESTADO INTERNO
        ================================================== */

        state: {

            /*
             * Indica si el motor ya fue inicializado.
             */
            initialized: false,

            /*
             * Preferencia del usuario respecto al movimiento.
             */
            reducedMotion: false,

            /*
             * Referencia a matchMedia.
             */
            reducedMotionQuery: null,

            /*
             * Observadores creados por el motor.
             */
            observers: new Set(),

            /*
             * Identificadores de requestAnimationFrame.
             */
            animationFrames: new WeakMap(),

            /*
             * Identificadores de setTimeout.
             */
            timeouts: new WeakMap()

        },


        /* ==================================================
           INICIALIZACIÓN
        ================================================== */

        init(options = {}) {

            /*
             * Evita inicializar el motor más de una vez.
             */
            if (this.state.initialized) {

                this.log(
                    "El motor ya se encuentra inicializado."
                );

                return this;

            }


            /*
             * Permite sustituir valores globales desde
             * JavaScript.
             *
             * Ejemplo:
             *
             * NeoAnimations.init({
             *     duration: 1000,
             *     threshold: 0.25
             * });
             */
            this.config = {

                ...this.config,

                ...options

            };


            /*
             * Detecta la preferencia de movimiento reducido.
             */
            this.setupReducedMotion();


            /*
             * Busca y observa todos los elementos animables.
             *
             * Esta función será creada en el Bloque 2.
             */
            this.observe(document);


            /*
             * Activa los botones para reiniciar animaciones.
             *
             * Esta función se completará en bloques
             * posteriores.
             */
            this.bindRestartButtons(document);


            this.state.initialized = true;


            /*
             * Evento global que indica que el motor
             * terminó de inicializarse.
             */
            document.dispatchEvent(

                new CustomEvent(
                    "neoanimations:ready",
                    {

                        detail: {

                            name: this.name,

                            version: this.version

                        }

                    }
                )

            );


            this.log(
                `${this.name} ${this.version} iniciado.`
            );


            return this;

        },


        /* ==================================================
           MOVIMIENTO REDUCIDO
        ================================================== */

        setupReducedMotion() {

            if (
                typeof window.matchMedia !== "function"
            ) {

                return;

            }


            const query = window.matchMedia(

                "(prefers-reduced-motion: reduce)"

            );


            this.state.reducedMotionQuery = query;

            this.state.reducedMotion = query.matches;


            const handleChange = (event) => {

                this.state.reducedMotion =
                    event.matches;


                document.dispatchEvent(

                    new CustomEvent(
                        "neoanimations:motionchange",
                        {

                            detail: {

                                reducedMotion:
                                    event.matches

                            }

                        }
                    )

                );

            };


            if (
                typeof query.addEventListener ===
                "function"
            ) {

                query.addEventListener(

                    "change",

                    handleChange

                );

            } else if (
                typeof query.addListener ===
                "function"
            ) {

                /*
                 * Compatibilidad con navegadores antiguos.
                 */
                query.addListener(
                    handleChange
                );

            }

        },


        /* ==================================================
           UTILIDADES GENERALES
        ================================================== */

        resolveRoot(root) {

            /*
             * Documento completo.
             */
            if (root === document) {

                return document;

            }


            /*
             * Elemento HTML o fragmento de documento.
             */
            if (
                root instanceof Element ||
                root instanceof DocumentFragment
            ) {

                return root;

            }


            /*
             * Selector CSS.
             */
            if (typeof root === "string") {

                return document.querySelector(root);

            }


            return null;

        },


        getAnimatedElements(root = document) {

            const scope = this.resolveRoot(root);


            if (!scope) {

                return [];

            }


            const elements = [];


            /*
             * Incluye al propio contenedor si también
             * contiene una animación.
             */
            if (
                scope instanceof Element &&
                scope.matches(this.selectors.animated)
            ) {

                elements.push(scope);

            }


            /*
             * Incluye todos los descendientes animables.
             */
            elements.push(

                ...scope.querySelectorAll(
                    this.selectors.animated
                )

            );


            return elements;

        },


        getNumber(value, fallback = 0) {

            const number = Number(value);


            return Number.isFinite(number)
                ? number
                : fallback;

        },


        getBoolean(value, fallback = true) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                return fallback;

            }


            const normalizedValue = String(value)
                .trim()
                .toLowerCase();


            return ![
                "false",
                "0",
                "no",
                "off"
            ].includes(normalizedValue);

        },


        /* ==================================================
           REGISTRO DE MENSAJES
        ================================================== */

        log(...messages) {

            if (!this.config.debug) {

                return;

            }


            console.log(

                `[${this.name}]`,

                ...messages

            );

        },


        warn(...messages) {

            if (!this.config.debug) {

                return;

            }


            console.warn(

                `[${this.name}]`,

                ...messages

            );

        },


        /* ==================================================
        SISTEMA DE OBSERVACIÓN
        ================================================== */

        observe(root = document, options = {}) {

            const scope = this.resolveRoot(root);


            if (!scope) {

                this.warn(
                    "No se encontró el contenedor solicitado " +
                    "para observar las animaciones."
                );

                return this;

            }


            /*
             * force permite volver a observar elementos que
             * anteriormente ya habían sido registrados.
             *
             * Se utiliza principalmente durante restart().
             */
            const force = Boolean(options.force);


            /*
             * Obtiene todos los elementos que contienen
             * alguno de los atributos de animación Neo.
             */
            const elements = this.getAnimatedElements(
                scope
            );


            if (!elements.length) {

                this.log(
                    "No se encontraron elementos animables.",
                    scope
                );

                return this;

            }


            /*
             * Cuando el usuario ha solicitado movimiento
             * reducido, no se crean observadores.
             *
             * Los elementos se muestran directamente en
             * su estado final.
             */
            if (this.state.reducedMotion) {

                elements.forEach((element) => {

                    this.runAnimation(
                        element,
                        {
                            immediate: true
                        }
                    );

                });


                return this;

            }


            /*
             * Compatibilidad para navegadores que no
             * soportan IntersectionObserver.
             */
            if (
                !(
                    "IntersectionObserver" in window
                )
            ) {

                elements.forEach((element) => {

                    this.runAnimation(
                        element,
                        {
                            immediate: true
                        }
                    );

                });


                return this;

            }


            /*
             * Los elementos se agrupan por threshold.
             *
             * IntersectionObserver utiliza un threshold
             * común para todos los elementos registrados
             * dentro del mismo observador.
             *
             * Por eso, cuando diferentes elementos tienen
             * thresholds distintos, se crea un observador
             * para cada grupo.
             */
            const groups = new Map();


            elements.forEach((element) => {

                /*
                 * Evita registrar dos veces el mismo
                 * elemento, salvo que force sea true.
                 */
                if (
                    element.dataset.neoObserved ===
                        "true" &&
                    !force
                ) {

                    return;

                }


                const threshold = this.getNumber(

                    element.dataset.neoThreshold,

                    this.config.threshold

                );


                /*
                 * Threshold solamente admite valores entre
                 * 0 y 1.
                 */
                const normalizedThreshold = Math.min(

                    Math.max(
                        threshold,
                        0
                    ),

                    1

                );


                const groupKey =
                    String(normalizedThreshold);


                if (!groups.has(groupKey)) {

                    groups.set(
                        groupKey,
                        []
                    );

                }


                groups
                    .get(groupKey)
                    .push(element);

            });


            /*
             * Crea un IntersectionObserver por cada grupo
             * de threshold.
             */
            groups.forEach(
                (
                    groupElements,
                    thresholdKey
                ) => {

                    const observer =
                        this.createObserver({

                            threshold:
                                Number(
                                    thresholdKey
                                )

                        });


                    groupElements.forEach(
                        (element) => {

                            /*
                             * Marca interna utilizada para
                             * evitar registros duplicados.
                             */
                            element.dataset.neoObserved =
                                "true";


                            observer.observe(element);

                        }
                    );


                    /*
                     * Guarda la referencia para poder
                     * desconectarla posteriormente.
                     */
                    this.state.observers.add(
                        observer
                    );

                }
            );


            return this;

        },


        /* ==================================================
           CREAR INTERSECTION OBSERVER
        ================================================== */

        createObserver(options = {}) {

            const threshold = this.getNumber(

                options.threshold,

                this.config.threshold

            );


            const observer =
                new IntersectionObserver(

                    (entries) => {

                        this.handleIntersections(

                            entries,

                            observer

                        );

                    },

                    {

                        threshold,

                        rootMargin:
                            this.config.rootMargin

                    }

                );


            return observer;

        },


        /* ==================================================
           PROCESAR INTERSECCIONES
        ================================================== */

        handleIntersections(
            entries,
            observer
        ) {

            entries.forEach((entry) => {

                const element = entry.target;


                /*
                 * El elemento todavía no ha entrado dentro
                 * del área visible requerida.
                 */
                if (!entry.isIntersecting) {

                    return;

                }


                /*
                 * Emite un evento antes de iniciar la
                 * animación.
                 */
                element.dispatchEvent(

                    new CustomEvent(
                        "neoanimations:enter",
                        {

                            bubbles: true,

                            detail: {

                                element,

                                intersectionRatio:
                                    entry.intersectionRatio

                            }

                        }
                    )

                );


                /*
                 * Ejecuta la animación correspondiente.
                 *
                 * runAnimation() será desarrollado en el
                 * siguiente bloque.
                 */
                this.runAnimation(element);


                /*
                 * Cada elemento puede decidir si debe
                 * ejecutarse una sola vez o repetirse cada
                 * vez que vuelva a entrar en pantalla.
                 */
                const once = this.getBoolean(

                    element.dataset.neoOnce,

                    this.config.once

                );


                if (once) {

                    observer.unobserve(element);


                    /*
                     * Ya no está siendo observado, pero
                     * conservamos la marca de que alguna vez
                     * fue registrado.
                     */
                    element.dataset.neoObserved =
                        "completed";

                }

            });

        },


        /* ==================================================
           DETECTAR TIPO DE ANIMACIÓN
        ================================================== */

        getAnimationType(element) {

            if (!(element instanceof Element)) {

                return null;

            }


            /*
             * El orden es importante.
             *
             * Si accidentalmente un elemento contiene más
             * de un atributo de animación, se utilizará el
             * primero que aparezca en esta lista.
             */
            const animationAttributes = [

                {
                    attribute:
                        "data-neo-counter",

                    type:
                        "counter"
                },

                {
                    attribute:
                        "data-neo-width",

                    type:
                        "width"
                },

                {
                    attribute:
                        "data-neo-height",

                    type:
                        "height"
                },

                {
                    attribute:
                        "data-neo-opacity",

                    type:
                        "opacity"
                },

                {
                    attribute:
                        "data-neo-scale",

                    type:
                        "scale"
                },

                {
                    attribute:
                        "data-neo-rotate",

                    type:
                        "rotate"
                },

                {
                    attribute:
                        "data-neo-translate-x",

                    type:
                        "translate-x"
                },

                {
                    attribute:
                        "data-neo-translate-y",

                    type:
                        "translate-y"
                }

            ];


            const match =
                animationAttributes.find(
                    (animation) => {

                        return element.hasAttribute(
                            animation.attribute
                        );

                    }
                );


            return match
                ? match.type
                : null;

        },


        /* ==================================================
           OBTENER VALOR DE LA ANIMACIÓN
        ================================================== */

        getAnimationValue(
            element,
            type = null
        ) {

            if (!(element instanceof Element)) {

                return null;

            }


            const animationType =
                type ||
                this.getAnimationType(element);


            if (!animationType) {

                return null;

            }


            const attributes = {

                counter:
                    "data-neo-counter",

                width:
                    "data-neo-width",

                height:
                    "data-neo-height",

                opacity:
                    "data-neo-opacity",

                scale:
                    "data-neo-scale",

                rotate:
                    "data-neo-rotate",

                "translate-x":
                    "data-neo-translate-x",

                "translate-y":
                    "data-neo-translate-y"

            };


            const attribute =
                attributes[animationType];


            if (!attribute) {

                return null;

            }


            return element.getAttribute(
                attribute
            );

        },

        /* ==================================================
        DESPACHADOR DE ANIMACIONES
        ================================================== */

        runAnimation(
            element,
            options = {}
        ) {

            if (!(element instanceof Element)) {

                this.warn(
                    "runAnimation() recibió un elemento inválido."
                );

                return this;

            }


            /*
             * Identifica el tipo de animación declarado
             * en los atributos data-neo-*.
             */
            const type =
                this.getAnimationType(element);


            if (!type) {

                this.warn(
                    "No se encontró un tipo de animación válido.",
                    element
                );

                return this;

            }


            /*
             * Obtiene el valor principal de la animación.
             */
            const rawValue =
                this.getAnimationValue(
                    element,
                    type
                );


            /*
             * Marca interna para indicar que el elemento
             * ya comenzó a animarse.
             */
            element.dataset.neoAnimated =
                "true";


            element.classList.add(
                "neo-is-animated"
            );


            /*
             * Evento emitido justo antes de ejecutar
             * cualquier animación.
             */
            element.dispatchEvent(

                new CustomEvent(
                    "neoanimations:start",
                    {

                        bubbles: true,

                        detail: {

                            element,

                            type,

                            value: rawValue

                        }

                    }
                )

            );


            /*
             * Despachador principal.
             */
            switch (type) {

                case "counter":

                    this.animateCounter(
                        element,
                        rawValue,
                        options
                    );

                    break;


                case "width":

                case "height":

                case "opacity":

                case "scale":

                case "rotate":

                case "translate-x":

                case "translate-y":

                    /*
                     * animateProperty() será desarrollado
                     * en el siguiente bloque.
                     */
                    this.animateProperty(
                        element,
                        type,
                        rawValue,
                        options
                    );

                    break;


                default:

                    this.warn(
                        `Tipo de animación no soportado: ${type}`,
                        element
                    );

            }


            return this;

        },


        /* ==================================================
           MOTOR DE CONTADORES
        ================================================== */

        animateCounter(
            element,
            rawValue,
            options = {}
        ) {

            /*
             * Convierte el valor declarado en HTML a número.
             */
            const targetValue =
                this.getNumber(
                    rawValue,
                    NaN
                );


            if (!Number.isFinite(targetValue)) {

                this.warn(
                    "El contador no contiene un valor numérico válido.",
                    element
                );

                return this;

            }


            /*
             * Cuando immediate es true, el contador muestra
             * directamente su valor final.
             *
             * Se utiliza para:
             *
             * - prefers-reduced-motion
             * - navegadores sin IntersectionObserver
             * - ejecuciones manuales inmediatas
             */
            const immediate =
                Boolean(options.immediate) ||
                this.state.reducedMotion;


            /*
             * Duración individual.
             *
             * Ejemplo:
             *
             * data-neo-duration="1800"
             */
            const duration = immediate
                ? 0
                : Math.max(
                    this.getNumber(
                        element.dataset.neoDuration,
                        this.config.counterDuration
                    ),
                    0
                );


            /*
             * Retraso individual.
             *
             * Ejemplo:
             *
             * data-neo-delay="250"
             */
            const delay = immediate
                ? 0
                : Math.max(
                    this.getNumber(
                        element.dataset.neoDelay,
                        this.config.delay
                    ),
                    0
                );


            /*
             * Valor inicial opcional.
             *
             * Ejemplo:
             *
             * data-neo-start="500"
             */
            const startValue =
                this.getNumber(
                    element.dataset.neoStart,
                    0
                );


            /*
             * Formato solicitado.
             *
             * Valores previstos:
             *
             * number
             * integer
             * currency
             * currency-short
             * percent
             */
            const format =
                String(
                    element.dataset.neoFormat ||
                    "number"
                )
                    .trim()
                    .toLowerCase();


            /*
             * Prefijo y sufijo personalizados.
             *
             * Ejemplo:
             *
             * data-neo-prefix="+"
             * data-neo-suffix=" clientes"
             */
            const prefix =
                element.dataset.neoPrefix ||
                "";


            const suffix =
                element.dataset.neoSuffix ||
                "";


            /*
             * Número de decimales.
             *
             * Si no se configura, se calcula a partir
             * del valor final.
             */
            const decimals =
                this.getCounterDecimals(
                    targetValue,
                    element.dataset.neoDecimals
                );


            /*
             * Detiene cualquier ejecución anterior del mismo
             * elemento antes de comenzar una nueva.
             */
            this.clearAnimationFrame(element);

            this.clearElementTimeout(element);


            /*
             * Guarda el valor inicial para que restart()
             * pueda restaurarlo posteriormente.
             */
            if (
                element.dataset.neoInitialText ===
                undefined
            ) {

                element.dataset.neoInitialText =
                    element.textContent.trim();

            }


            /*
             * Función que coloca directamente el valor final.
             */
            const showFinalValue = () => {

                element.textContent =
                    this.formatCounterValue(
                        targetValue,
                        {

                            format,

                            prefix,

                            suffix,

                            decimals

                        }
                    );


                this.emitComplete(
                    element,
                    {

                        type: "counter",

                        value: targetValue

                    }
                );

            };


            /*
             * Sin duración no es necesario utilizar
             * requestAnimationFrame.
             */
            if (duration <= 0) {

                showFinalValue();

                return this;

            }


            /*
             * Función principal del contador.
             */
            const startCounter = () => {

                let startTime = null;


                const updateCounter = (
                    timestamp
                ) => {

                    /*
                     * El primer frame establece el momento
                     * inicial de la animación.
                     */
                    if (startTime === null) {

                        startTime = timestamp;

                    }


                    const elapsed =
                        timestamp - startTime;


                    /*
                     * Progreso normalizado de 0 a 1.
                     */
                    const progress = Math.min(

                        elapsed / duration,

                        1

                    );


                    /*
                     * Aplica una curva de desaceleración
                     * para que el contador termine de forma
                     * más natural.
                     */
                    const easedProgress =
                        this.easeOutCubic(
                            progress
                        );


                    /*
                     * Interpolación entre valor inicial
                     * y valor final.
                     */
                    const currentValue =
                        startValue +
                        (
                            targetValue -
                            startValue
                        ) *
                        easedProgress;


                    element.textContent =
                        this.formatCounterValue(
                            currentValue,
                            {

                                format,

                                prefix,

                                suffix,

                                decimals

                            }
                        );


                    /*
                     * Continúa solicitando frames mientras
                     * no se alcance el 100%.
                     */
                    if (progress < 1) {

                        const frameId =
                            requestAnimationFrame(
                                updateCounter
                            );


                        this.setAnimationFrame(

                            element,

                            frameId

                        );


                        return;

                    }


                    /*
                     * Asegura que el último valor mostrado
                     * sea exactamente el objetivo.
                     */
                    this.clearAnimationFrame(
                        element
                    );


                    showFinalValue();

                };


                const frameId =
                    requestAnimationFrame(
                        updateCounter
                    );


                this.setAnimationFrame(

                    element,

                    frameId

                );

            };


            /*
             * Aplica el retraso configurado.
             */
            if (delay > 0) {

                const timeoutId =
                    window.setTimeout(
                        startCounter,
                        delay
                    );


                this.setElementTimeout(

                    element,

                    timeoutId

                );

            } else {

                startCounter();

            }


            return this;

        },


        /* ==================================================
           DETERMINAR DECIMALES DEL CONTADOR
        ================================================== */

        getCounterDecimals(
            targetValue,
            configuredDecimals
        ) {

            /*
             * Si el usuario indicó explícitamente el número
             * de decimales, se utiliza esa configuración.
             */
            if (
                configuredDecimals !== undefined &&
                configuredDecimals !== null &&
                configuredDecimals !== ""
            ) {

                const decimals =
                    Number(
                        configuredDecimals
                    );


                if (
                    Number.isInteger(decimals) &&
                    decimals >= 0
                ) {

                    return decimals;

                }

            }


            /*
             * Los enteros no requieren decimales.
             */
            if (
                Number.isInteger(targetValue)
            ) {

                return 0;

            }


            /*
             * Determina cuántos decimales contiene
             * originalmente el valor objetivo.
             */
            const valueText =
                String(targetValue);


            if (
                !valueText.includes(".")
            ) {

                return 0;

            }


            return valueText
                .split(".")[1]
                .length;

        },


        /* ==================================================
           FORMATEAR VALOR DEL CONTADOR
        ================================================== */

        formatCounterValue(
            value,
            options = {}
        ) {

            const format =
                options.format ||
                "number";


            const prefix =
                options.prefix ||
                "";


            const suffix =
                options.suffix ||
                "";


            const decimals =
                Number.isInteger(
                    options.decimals
                )
                    ? options.decimals
                    : 0;


            /*
             * Moneda abreviada.
             *
             * Ejemplos:
             *
             * 12500       → $12.5 K
             * 12400000    → $12.4 M
             * 3200000000  → $3.2 B
             */
            if (
                format === "currency-short"
            ) {

                return (
                    prefix +
                    this.formatCurrencyShort(
                        value,
                        decimals
                    ) +
                    suffix
                );

            }


            /*
             * Moneda completa en pesos mexicanos.
             */
            if (
                format === "currency"
            ) {

                const currency =
                    value.toLocaleString(
                        "es-MX",
                        {

                            style: "currency",

                            currency: "MXN",

                            minimumFractionDigits:
                                decimals,

                            maximumFractionDigits:
                                decimals

                        }
                    );


                return (
                    prefix +
                    currency +
                    suffix
                );

            }


            /*
             * Porcentaje.
             *
             * El valor se interpreta tal cual.
             *
             * data-neo-counter="88"
             * data-neo-format="percent"
             *
             * Resultado:
             *
             * 88%
             */
            if (
                format === "percent"
            ) {

                const percentage =
                    value.toLocaleString(
                        "es-MX",
                        {

                            minimumFractionDigits:
                                decimals,

                            maximumFractionDigits:
                                decimals

                        }
                    );


                return (
                    prefix +
                    percentage +
                    "%" +
                    suffix
                );

            }


            /*
             * Número entero.
             */
            if (
                format === "integer"
            ) {

                const integer =
                    Math.round(value)
                        .toLocaleString(
                            "es-MX"
                        );


                return (
                    prefix +
                    integer +
                    suffix
                );

            }


            /*
             * Número general.
             */
            const formattedNumber =
                value.toLocaleString(
                    "es-MX",
                    {

                        minimumFractionDigits:
                            decimals,

                        maximumFractionDigits:
                            decimals

                    }
                );


            return (
                prefix +
                formattedNumber +
                suffix
            );

        },


        /* ==================================================
           FORMATO DE MONEDA ABREVIADA
        ================================================== */

        formatCurrencyShort(
            value,
            configuredDecimals = null
        ) {

            const absoluteValue =
                Math.abs(value);


            let divisor = 1;

            let abbreviation = "";


            if (
                absoluteValue >= 1000000000
            ) {

                divisor = 1000000000;

                abbreviation = " B";

            } else if (
                absoluteValue >= 1000000
            ) {

                divisor = 1000000;

                abbreviation = " M";

            } else if (
                absoluteValue >= 1000
            ) {

                divisor = 1000;

                abbreviation = " K";

            }


            const reducedValue =
                value / divisor;


            /*
             * Cuando no se especifican decimales:
             *
             * - cantidades abreviadas usan uno;
             * - cantidades normales usan cero.
             */
            const decimals =
                configuredDecimals !== null &&
                configuredDecimals !== undefined
                    ? configuredDecimals
                    : abbreviation
                        ? 1
                        : 0;


            const formattedValue =
                reducedValue.toLocaleString(
                    "es-MX",
                    {

                        minimumFractionDigits:
                            decimals,

                        maximumFractionDigits:
                            decimals

                    }
                );


            return (
                "$" +
                formattedValue +
                abbreviation
            );

        },


        /* ==================================================
           FUNCIÓN DE ACELERACIÓN
        ================================================== */

        easeOutCubic(progress) {

            return (

                1 -

                Math.pow(
                    1 - progress,
                    3
                )

            );

        },


        /* ==================================================
           CONTROL DE REQUEST ANIMATION FRAME
        ================================================== */

        setAnimationFrame(
            element,
            frameId
        ) {

            this.state.animationFrames.set(

                element,

                frameId

            );


            return frameId;

        },


        clearAnimationFrame(element) {

            const frameId =
                this.state.animationFrames.get(
                    element
                );


            if (
                frameId !== undefined
            ) {

                cancelAnimationFrame(
                    frameId
                );


                this.state.animationFrames.delete(
                    element
                );

            }

        },


        /* ==================================================
           CONTROL DE TEMPORIZADORES
        ================================================== */

        setElementTimeout(
            element,
            timeoutId
        ) {

            this.state.timeouts.set(

                element,

                timeoutId

            );


            return timeoutId;

        },


        clearElementTimeout(element) {

            const timeoutId =
                this.state.timeouts.get(
                    element
                );


            if (
                timeoutId !== undefined
            ) {

                clearTimeout(
                    timeoutId
                );


                this.state.timeouts.delete(
                    element
                );

            }

        },


        /* ==================================================
           EVENTO DE FINALIZACIÓN
        ================================================== */

        emitComplete(
            element,
            detail = {}
        ) {

            element.dispatchEvent(

                new CustomEvent(
                    "neoanimations:complete",
                    {

                        bubbles: true,

                        detail: {

                            element,

                            ...detail

                        }

                    }
                )

            );


            this.log(
                "Animación completada.",
                detail,
                element
            );

        },

        /* ==================================================
        MOTOR DE ANIMACIONES VISUALES
        ================================================== */

        animateProperty(
            element,
            type,
            rawValue,
            options = {}
        ) {

            /*
             * Convierte el valor recibido desde HTML.
             */
            const numericValue =
                this.getNumber(
                    rawValue,
                    NaN
                );


            if (!Number.isFinite(numericValue)) {

                this.warn(
                    `La animación "${type}" no contiene ` +
                    "un valor numérico válido.",
                    element
                );

                return this;

            }


            /*
             * Obtiene la definición visual correspondiente.
             */
            const definition =
                this.getPropertyDefinition(
                    type,
                    numericValue,
                    element
                );


            if (!definition) {

                this.warn(
                    `No existe una definición para la ` +
                    `animación "${type}".`,
                    element
                );

                return this;

            }


            const immediate =
                Boolean(options.immediate) ||
                this.state.reducedMotion;


            /*
             * Duración individual.
             *
             * Ejemplo:
             *
             * data-neo-duration="1400"
             */
            const duration = immediate
                ? 0
                : Math.max(
                    this.getNumber(
                        element.dataset.neoDuration,
                        this.config.duration
                    ),
                    0
                );


            /*
             * Retraso individual.
             *
             * Ejemplo:
             *
             * data-neo-delay="200"
             */
            const delay = immediate
                ? 0
                : Math.max(
                    this.getNumber(
                        element.dataset.neoDelay,
                        this.config.delay
                    ),
                    0
                );


            /*
             * Curva individual.
             *
             * Ejemplo:
             *
             * data-neo-easing="ease-out"
             */
            const easing =
                element.dataset.neoEasing ||
                this.config.easing;


            /*
             * Cancela cualquier temporizador anterior.
             */
            this.clearElementTimeout(element);


            /*
             * Guarda los estilos originales antes de
             * modificarlos.
             */
            this.storeOriginalStyles(
                element,
                definition.property
            );


            /*
             * Elimina cualquier transición previa.
             */
            element.style.transition = "none";


            /*
             * Coloca el elemento en su estado inicial.
             */
            element.style[
                definition.property
            ] = definition.initialValue;


            /*
             * Fuerza al navegador a registrar el estado
             * inicial antes de aplicar la transición.
             */
            element.getBoundingClientRect();


            /*
             * En modo inmediato se aplica directamente
             * el estado final.
             */
            if (immediate || duration <= 0) {

                element.style[
                    definition.property
                ] = definition.finalValue;


                this.emitComplete(
                    element,
                    {

                        type,

                        value: numericValue

                    }
                );


                return this;

            }


            /*
             * Se utilizan dos frames para garantizar que
             * el navegador haya procesado el estado inicial
             * antes de iniciar la animación.
             */
            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    const transition =
                        `${definition.property} ` +
                        `${duration}ms ` +
                        `${easing} ` +
                        `${delay}ms`;


                    element.style.transition =
                        transition;


                    element.style[
                        definition.property
                    ] = definition.finalValue;


                    /*
                     * El evento se considera completado una
                     * vez transcurridos duración y retraso.
                     */
                    const timeoutId =
                        window.setTimeout(
                            () => {

                                this.state.timeouts.delete(
                                    element
                                );


                                this.emitComplete(
                                    element,
                                    {

                                        type,

                                        value:
                                            numericValue

                                    }
                                );

                            },
                            duration + delay
                        );


                    this.setElementTimeout(
                        element,
                        timeoutId
                    );

                });

            });


            return this;

        },


        /* ==================================================
           DEFINICIONES DE PROPIEDADES
        ================================================== */

        getPropertyDefinition(
            type,
            value,
            element
        ) {

            /*
             * Cada tipo devuelve:
             *
             * property:
             * propiedad CSS que será animada.
             *
             * initialValue:
             * estado inicial.
             *
             * finalValue:
             * estado final.
             */


            switch (type) {

                case "width":

                    return {

                        property: "width",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "0%"
                            ),

                        finalValue:
                            this.getValueWithUnit(
                                element,
                                value,
                                "%"
                            )

                    };


                case "height":

                    return {

                        property: "height",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "0%"
                            ),

                        finalValue:
                            this.getValueWithUnit(
                                element,
                                value,
                                "%"
                            )

                    };


                case "opacity":

                    return {

                        property: "opacity",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "0"
                            ),

                        finalValue:
                            String(value)

                    };


                case "scale":

                    return {

                        property: "transform",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "scale(0)"
                            ),

                        finalValue:
                            `scale(${value})`

                    };


                case "rotate":

                    return {

                        property: "transform",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "rotate(0deg)"
                            ),

                        finalValue:
                            `rotate(${value}deg)`

                    };


                case "translate-x":

                    return {

                        property: "transform",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "translateX(0px)"
                            ),

                        finalValue:
                            `translateX(${value}px)`

                    };


                case "translate-y":

                    return {

                        property: "transform",

                        initialValue:
                            this.getInitialValue(
                                element,
                                "translateY(0px)"
                            ),

                        finalValue:
                            `translateY(${value}px)`

                    };


                default:

                    return null;

            }

        },


        /* ==================================================
           VALOR INICIAL PERSONALIZADO
        ================================================== */

        getInitialValue(
            element,
            fallback
        ) {

            /*
             * Permite establecer manualmente el estado
             * inicial desde HTML.
             *
             * Ejemplo:
             *
             * data-neo-initial="scale(.8)"
             */
            const configuredValue =
                element.dataset.neoInitial;


            if (
                configuredValue !== undefined &&
                configuredValue !== null &&
                configuredValue !== ""
            ) {

                return configuredValue;

            }


            return fallback;

        },


        /* ==================================================
           UNIDAD PERSONALIZADA
        ================================================== */

        getValueWithUnit(
            element,
            value,
            defaultUnit
        ) {

            /*
             * Permite cambiar la unidad desde HTML.
             *
             * Ejemplos:
             *
             * data-neo-unit="px"
             * data-neo-unit="rem"
             * data-neo-unit="vw"
             */
            const configuredUnit =
                element.dataset.neoUnit;


            const unit =
                configuredUnit !== undefined &&
                configuredUnit !== null &&
                configuredUnit !== ""
                    ? configuredUnit
                    : defaultUnit;


            return `${value}${unit}`;

        },


        /* ==================================================
           GUARDAR ESTILOS ORIGINALES
        ================================================== */

        storeOriginalStyles(
            element,
            property
        ) {

            /*
             * Los estilos originales se guardan una sola vez.
             */
            if (
                element.dataset.neoOriginalTransition ===
                undefined
            ) {

                element.dataset.neoOriginalTransition =
                    element.style.transition || "";

            }


            /*
             * Como property puede contener nombres como
             * transform, width, height u opacity, guardamos
             * los valores originales en atributos internos.
             */
            const storageAttribute =
                this.getOriginalStyleAttribute(
                    property
                );


            if (
                element.dataset[
                    storageAttribute
                ] === undefined
            ) {

                element.dataset[
                    storageAttribute
                ] =
                    element.style[property] || "";

            }

        },


        /* ==================================================
           NOMBRE DEL ATRIBUTO INTERNO
        ================================================== */

        getOriginalStyleAttribute(
            property
        ) {

            const normalizedProperty =
                String(property)
                    .replace(
                        /-([a-z])/g,
                        (
                            match,
                            letter
                        ) => {

                            return letter.toUpperCase();

                        }
                    );


            return (
                "neoOriginal" +
                normalizedProperty
                    .charAt(0)
                    .toUpperCase() +
                normalizedProperty.slice(1)
            );

        },


        /* ==================================================
           RESTAURAR ESTILO ORIGINAL
        ================================================== */

        restoreOriginalStyle(
            element,
            property
        ) {

            const storageAttribute =
                this.getOriginalStyleAttribute(
                    property
                );


            const originalValue =
                element.dataset[
                    storageAttribute
                ];


            if (
                originalValue !== undefined
            ) {

                element.style[property] =
                    originalValue;


                delete element.dataset[
                    storageAttribute
                ];

            }


            if (
                element.dataset.neoOriginalTransition !==
                undefined
            ) {

                element.style.transition =
                    element.dataset
                        .neoOriginalTransition;


                delete element.dataset
                    .neoOriginalTransition;

            }

        },


        /* ==================================================
           OBTENER PROPIEDAD SEGÚN TIPO
        ================================================== */

        getPropertyByAnimationType(type) {

            const properties = {

                width: "width",

                height: "height",

                opacity: "opacity",

                scale: "transform",

                rotate: "transform",

                "translate-x": "transform",

                "translate-y": "transform"

            };


            return properties[type] || null;

        },


        /* ==================================================
           REINICIAR UN ELEMENTO
        ================================================== */

        resetElement(element) {

            if (!(element instanceof Element)) {

                return this;

            }


            const type =
                this.getAnimationType(element);


            if (!type) {

                return this;

            }


            /*
             * Detiene cualquier ejecución activa.
             */
            this.cancelElement(element);


            element.classList.remove(
                "neo-is-animated"
            );


            delete element.dataset.neoAnimated;

            delete element.dataset.neoObserved;


            /*
             * Reinicio de contadores.
             */
            if (type === "counter") {

                const initialText =
                    element.dataset.neoInitialText;


                if (
                    initialText !== undefined
                ) {

                    element.textContent =
                        initialText;

                } else {

                    element.textContent = "0";

                }


                return this;

            }


            /*
             * Reinicio de propiedades visuales.
             */
            const rawValue =
                this.getAnimationValue(
                    element,
                    type
                );


            const numericValue =
                this.getNumber(
                    rawValue,
                    0
                );


            const definition =
                this.getPropertyDefinition(
                    type,
                    numericValue,
                    element
                );


            if (!definition) {

                return this;

            }


            element.style.transition =
                "none";


            element.style[
                definition.property
            ] = definition.initialValue;


            return this;

        },


        /* ==================================================
           CANCELAR ANIMACIÓN DE UN ELEMENTO
        ================================================== */

        cancelElement(element) {

            if (!(element instanceof Element)) {

                return this;

            }


            this.clearAnimationFrame(element);

            this.clearElementTimeout(element);


            return this;

        },


        /* ==================================================
           CANCELAR TODAS LAS ANIMACIONES
        ================================================== */

        cancelAll() {

            const elements =
                this.getAnimatedElements(
                    document
                );


            elements.forEach((element) => {

                this.cancelElement(element);

            });


            return this;

        },

                /* ==================================================
           BOTONES DE REINICIO
        ================================================== */

        bindRestartButtons() {

            /*
             * Evita registrar más de una vez el mismo
             * listener global.
             */
            if (this.state.restartButtonsBound) {

                return this;

            }


            /*
             * Se utiliza delegación de eventos para que
             * también funcionen botones agregados
             * dinámicamente después de cargar la página.
             */
            this.state.restartHandler = (
                event
            ) => {

                const button =
                    event.target.closest(
                        "[data-neo-restart]"
                    );


                if (!button) {

                    return;

                }


                /*
                 * Confirma que el botón pertenece al
                 * documento actual.
                 */
                if (
                    !document.documentElement.contains(
                        button
                    )
                ) {

                    return;

                }


                event.preventDefault();


                const selector =
                    button
                        .getAttribute(
                            "data-neo-restart"
                        )
                        ?.trim();


                /*
                 * Sin selector se reinician todas las
                 * animaciones de la página.
                 *
                 * Ejemplo:
                 *
                 * <button data-neo-restart>
                 */
                if (!selector) {

                    this.restart(document);

                    return;

                }


                /*
                 * Con selector se reinicia solamente el
                 * contenedor indicado.
                 *
                 * Ejemplo:
                 *
                 * <button data-neo-restart="#dashboard">
                 */
                let target = null;


                try {

                    target =
                        document.querySelector(
                            selector
                        );

                } catch (error) {

                    this.warn(
                        `El selector de reinicio no es válido: ${selector}`,
                        error
                    );

                    return;

                }


                if (!target) {

                    this.warn(
                        `No se encontró el contenedor de reinicio: ${selector}`,
                        button
                    );

                    return;

                }


                this.restart(target);

            };


            document.addEventListener(

                "click",

                this.state.restartHandler

            );


            this.state.restartButtonsBound =
                true;


            return this;

        },


        /* ==================================================
           DESVINCULAR BOTONES DE REINICIO
        ================================================== */

        unbindRestartButtons() {

            if (
                !this.state.restartButtonsBound ||
                !this.state.restartHandler
            ) {

                return this;

            }


            document.removeEventListener(

                "click",

                this.state.restartHandler

            );


            this.state.restartHandler = null;

            this.state.restartButtonsBound =
                false;


            return this;

        },


        /* ==================================================
           DEJAR DE OBSERVAR UN ELEMENTO
        ================================================== */

        unobserveElement(element) {

            if (!(element instanceof Element)) {

                return this;

            }


            this.state.observers.forEach(
                (observer) => {

                    observer.unobserve(
                        element
                    );

                }
            );


            return this;

        },


        /* ==================================================
           DESCONECTAR OBSERVADORES
        ================================================== */

        disconnectObservers() {

            this.state.observers.forEach(
                (observer) => {

                    observer.disconnect();

                }
            );


            this.state.observers.clear();


            return this;

        },


        /* ==================================================
           REINICIAR ANIMACIONES
        ================================================== */

        restart(root = document) {

            const scope =
                this.resolveRoot(root);


            if (!scope) {

                this.warn(
                    "No se encontró el contenedor que se desea reiniciar."
                );

                return this;

            }


            const elements =
                this.getAnimatedElements(
                    scope
                );


            if (!elements.length) {

                this.log(
                    "No se encontraron animaciones para reiniciar.",
                    scope
                );

                return this;

            }


            /*
             * Detiene la observación actual para impedir
             * ejecuciones duplicadas.
             */
            elements.forEach(
                (element) => {

                    this.unobserveElement(
                        element
                    );


                    this.resetElement(
                        element
                    );

                }
            );


            /*
             * Fuerza al navegador a registrar los estados
             * iniciales antes de volver a observarlos.
             */
            if (
                scope instanceof Element
            ) {

                scope.getBoundingClientRect();

            } else {

                document.documentElement
                    .getBoundingClientRect();

            }


            /*
             * Registra nuevamente los elementos.
             */
            this.observe(
                scope,
                {

                    force: true

                }
            );


            this.log(
                "Animaciones reiniciadas.",
                scope
            );


            return this;

        },


        /* ==================================================
           RESTAURAR COMPLETAMENTE UN ELEMENTO
        ================================================== */

        restoreElement(element) {

            if (!(element instanceof Element)) {

                return this;

            }


            const type =
                this.getAnimationType(
                    element
                );


            this.cancelElement(
                element
            );


            this.unobserveElement(
                element
            );


            /*
             * Restaura el texto original de los contadores.
             */
            if (type === "counter") {

                if (
                    element.dataset.neoInitialText !==
                    undefined
                ) {

                    element.textContent =
                        element.dataset
                            .neoInitialText;


                    delete element.dataset
                        .neoInitialText;

                }

            } else if (type) {

                /*
                 * Restaura la propiedad visual modificada.
                 */
                const property =
                    this.getPropertyByAnimationType(
                        type
                    );


                if (property) {

                    this.restoreOriginalStyle(
                        element,
                        property
                    );

                }

            }


            element.classList.remove(
                "neo-is-animated"
            );


            delete element.dataset.neoAnimated;

            delete element.dataset.neoObserved;


            return this;

        },


        /* ==================================================
           DESTRUIR EL MOTOR
        ================================================== */

        destroy(root = document) {

            const scope =
                this.resolveRoot(root);


            if (!scope) {

                this.warn(
                    "No se encontró el contenedor que se desea destruir."
                );

                return this;

            }


            const elements =
                this.getAnimatedElements(
                    scope
                );


            elements.forEach(
                (element) => {

                    this.restoreElement(
                        element
                    );

                }
            );


            /*
             * Cuando se destruye el documento completo,
             * también se eliminan los observadores y el
             * listener global de botones.
             */
            if (
                scope === document ||
                scope === document.documentElement ||
                scope === document.body
            ) {

                this.disconnectObservers();

                this.unbindRestartButtons();

                this.state.initialized =
                    false;

            }


            this.log(
                "NeoAnimations fue destruido.",
                scope
            );


            return this;

        },


        /* ==================================================
           EJECUTAR MANUALMENTE UN ELEMENTO
        ================================================== */

        play(
            element,
            options = {}
        ) {

            let target = element;


            /*
             * Permite recibir directamente un selector.
             *
             * Ejemplo:
             *
             * NeoAnimations.play("#totalVentas");
             */
            if (typeof element === "string") {

                try {

                    target =
                        document.querySelector(
                            element
                        );

                } catch (error) {

                    this.warn(
                        `El selector no es válido: ${element}`,
                        error
                    );

                    return this;

                }

            }


            if (!(target instanceof Element)) {

                this.warn(
                    "No se encontró el elemento que se desea ejecutar."
                );

                return this;

            }


            this.unobserveElement(
                target
            );


            this.cancelElement(
                target
            );


            this.runAnimation(
                target,
                options
            );


            return this;

        },


        /* ==================================================
           EJECUTAR INMEDIATAMENTE
        ================================================== */

        finish(element) {

            return this.play(
                element,
                {

                    immediate: true

                }
            );

        },


        /* ==================================================
           ESTADO DEL MOTOR
        ================================================== */

        getState() {

            return {

                initialized:
                    Boolean(
                        this.state.initialized
                    ),

                reducedMotion:
                    Boolean(
                        this.state.reducedMotion
                    ),

                observers:
                    this.state.observers.size,

                animationFrames:
                    this.state.animationFrames.size,

                timeouts:
                    this.state.timeouts.size

            };

        }

    };


    /* ======================================================
       API PÚBLICA
    ====================================================== */

    /*
     * Expone el motor globalmente.
     *
     * Ejemplos:
     *
     * NeoAnimations.restart();
     *
     * NeoAnimations.restart("#dashboard");
     *
     * NeoAnimations.play("#totalVentas");
     *
     * NeoAnimations.finish("#barraPrincipal");
     *
     * NeoAnimations.destroy();
     */
    window.NeoAnimations =
        NeoAnimations;


    /* ======================================================
       INICIALIZACIÓN AUTOMÁTICA
    ====================================================== */

    const initializeNeoAnimations = () => {

        try {

            NeoAnimations.init();

        } catch (error) {

            console.error(
                "[NeoAnimations] No fue posible iniciar el motor.",
                error
            );

        }

    };


    /*
     * Si el HTML todavía está cargándose, espera al evento
     * DOMContentLoaded.
     *
     * Si el script se carga al final del body, inicia
     * inmediatamente.
     */
    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeNeoAnimations,

            {

                once: true

            }

        );

    } else {

        initializeNeoAnimations();

    }

})();