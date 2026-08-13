const MARKET_API_URL =
    "https://ai-trader-backend-pbfh.onrender.com/api/market";

const MARKET_REFRESH_MS = 30000;

let marketTimer = null;
let lastPrice = null;
let marketOnline = false;


// ==========================================
// DOM
// ==========================================

function $(id) {
    return document.getElementById(id);
}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return "--";
    }

    return Number(value).toFixed(5);
}


// ==========================================
// STATUS
// ==========================================

function setMarketStatus(online, message) {

    marketOnline = online;

    const dot = $("connectionDot");
    const text = $("connectionText");
    const badge = $("dataBadge");
    const dataMessage = $("dataMessage");

    if (dot) {
        dot.className =
            online ? "dot online" : "dot offline";
    }

    if (text) {
        text.textContent =
            online ? "Market Online" : "Market Offline";
    }

    if (badge) {
        badge.textContent =
            online ? "ONLINE" : "OFFLINE";

        badge.className =
            online
                ? "badge online"
                : "badge neutral";
    }

    if (dataMessage) {
        dataMessage.textContent = message;
    }
}


// ==========================================
// DISPLAY PRICE
// ==========================================

function displayPrice(price) {

    const priceElement = $("price");

    if (priceElement) {
        priceElement.textContent =
            formatPrice(price);
    }

    const changeElement =
        $("priceChange");

    if (
        changeElement &&
        lastPrice !== null &&
        lastPrice !== 0
    ) {

        const change =
            ((price - lastPrice) /
                lastPrice) * 100;

        changeElement.textContent =
            (change >= 0 ? "+" : "") +
            change.toFixed(3) +
            "%";
    }

    const updateElement =
        $("lastUpdate");

    if (updateElement) {
        updateElement.textContent =
            new Date().toLocaleTimeString();
    }

    lastPrice = price;
}


// ==========================================
// FETCH MARKET
// ==========================================

async function fetchMarketData() {

    try {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                20000
            );


        const response =
            await fetch(
                MARKET_API_URL +
                "?t=" +
                Date.now(),
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store",

                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.success ||
            typeof data.price !== "number"
        ) {

            throw new Error(
                data.error ||
                "Invalid market response"
            );
        }


        displayPrice(
            data.price
        );


        if ($("bid")) {
            $("bid").textContent =
                formatPrice(
                    data.bid ||
                    data.price
                );
        }


        if ($("ask")) {
            $("ask").textContent =
                formatPrice(
                    data.ask ||
                    data.price
                );
        }


        setMarketStatus(
            true,
            "Live EUR/USD data connected."
        );


        console.log(
            "EUR/USD:",
            data.price
        );


    } catch (error) {

        console.warn(
            "Temporary market connection problem:",
            error
        );


        // IMPORTANT:
        // Don't immediately destroy the last
        // successful price.

        if (lastPrice !== null) {

            setMarketStatus(
                true,
                "Market connection temporarily interrupted. Retrying..."
            );

        } else {

            setMarketStatus(
                false,
                "Connecting to market data..."
            );
        }


        // Retry shortly instead of giving up.

        setTimeout(
            fetchMarketData,
            5000
        );
    }
}


// ==========================================
// START AI
// ==========================================

function startAI() {

    const startButton =
        $("startBtn");

    const stopButton =
        $("stopBtn");


    if (startButton) {
        startButton.disabled = true;
    }

    if (stopButton) {
        stopButton.disabled = false;
    }


    if ($("aiStatus")) {
        $("aiStatus").textContent =
            "RUNNING";
    }


    if ($("reason")) {
        $("reason").textContent =
            "AI is monitoring EUR/USD.";
    }


    addLog(
        "SYSTEM",
        "AI STARTED",
        "Market monitoring started."
    );


    // First request immediately.

    fetchMarketData();


    // Clear old timer.

    if (marketTimer) {
        clearInterval(marketTimer);
    }


    // Then every 30 seconds.

    marketTimer =
        setInterval(
            fetchMarketData,
            MARKET_REFRESH_MS
        );
}


// ==========================================
// STOP AI
// ==========================================

function stopAI() {

    if (marketTimer) {

        clearInterval(
            marketTimer
        );

        marketTimer = null;
    }


    if ($("aiStatus")) {
        $("aiStatus").textContent =
            "STOPPED";
    }


    if ($("startBtn")) {
        $("startBtn").disabled = false;
    }


    if ($("stopBtn")) {
        $("stopBtn").disabled = true;
    }


    if ($("reason")) {
        $("reason").textContent =
            "AI trader is stopped.";
    }


    addLog(
        "SYSTEM",
        "AI STOPPED",
        "Market monitoring stopped."
    );
}


// ==========================================
// LOG
// ==========================================

function addLog(
    source,
    action,
    reason
) {

    const logs =
        $("logs");

    if (!logs) {
        return;
    }


    const empty =
        logs.querySelector(
            ".empty-log"
        );

    if (empty) {
        empty.remove();
    }


    const item =
        document.createElement("div");

    item.className =
        "log";


    item.innerHTML = `
        <div class="log-time">
            ${new Date().toLocaleTimeString()}
        </div>

        <div class="log-action">
            ${source} • ${action}
        </div>

        <div class="log-reason">
            ${reason}
        </div>
    `;


    logs.prepend(item);
}


// ==========================================
// MANUAL REFRESH
// ==========================================

function manualRefresh() {

    setMarketStatus(
        false,
        "Refreshing market data..."
    );

    fetchMarketData();
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if ($("startBtn")) {

            $("startBtn")
                .addEventListener(
                    "click",
                    startAI
                );
        }


        if ($("stopBtn")) {

            $("stopBtn")
                .addEventListener(
                    "click",
                    stopAI
                );
        }


        if ($("refreshMarketBtn")) {

            $("refreshMarketBtn")
                .addEventListener(
                    "click",
                    manualRefresh
                );
        }


        if ($("clearLog")) {

            $("clearLog")
                .addEventListener(
                    "click",
                    function () {

                        if ($("logs")) {

                            $("logs").innerHTML =
                                `
                                <div class="log empty-log">
                                    No decisions yet.
                                </div>
                                `;
                        }
                    }
                );
        }


        if ($("stopBtn")) {
            $("stopBtn").disabled = true;
        }


        setMarketStatus(
            false,
            "Press START AI to connect to the market."
        );
    }
);
