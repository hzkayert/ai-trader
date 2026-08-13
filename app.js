// ==========================================
// AI TRADER - STAGE 2
// REAL MARKET DATA READY
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

// IMPORTANT:
//
// Do NOT put a private market-data API key here.
//
// Later we will create a backend such as:
//
// https://your-backend.example.com/api/market
//
// That backend will safely contact the
// market-data provider.
//
// For now this URL is intentionally empty.

const MARKET_API_URL = "";


// How often the website asks for new data.

const MARKET_REFRESH_MS = 15000;


// ==========================================
// STATE
// ==========================================

const state = {

    running: false,

    price: null,

    bid: null,

    ask: null,

    previousPrice: null,

    balance: 10000,

    equity: 10000,

    dailyPL: 0,

    trade: null,

    marketOnline: false,

    timer: null

};


// ==========================================
// HELPER
// ==========================================

function $(id) {

    return document.getElementById(id);

}


// ==========================================
// PRICE FORMAT
// ==========================================

function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--";
    }

    return Number(value).toFixed(5);
}


// ==========================================
// CONNECTION STATUS
// ==========================================

function setMarketStatus(
    online,
    message
) {

    state.marketOnline = online;


    const dot =
        $("connectionDot");

    const text =
        $("connectionText");

    const badge =
        $("dataBadge");

    const dataMessage =
        $("dataMessage");


    if (dot) {

        dot.className =
            online
                ? "dot online"
                : "dot offline";
    }


    if (text) {

        text.textContent =
            online
                ? "Market Online"
                : "Market Offline";
    }


    if (badge) {

        badge.textContent =
            online
                ? "ONLINE"
                : "OFFLINE";

        badge.className =
            online
                ? "badge online"
                : "badge neutral";
    }


    if (dataMessage) {

        dataMessage.textContent =
            message;
    }

}


// ==========================================
// DISPLAY MARKET DATA
// ==========================================

function updateMarketDisplay() {

    const price =
        $("price");

    const priceChange =
        $("priceChange");

    const bid =
        $("bid");

    const ask =
        $("ask");

    const lastUpdate =
        $("lastUpdate");


    if (price) {

        price.textContent =
            formatPrice(state.price);
    }


    if (bid) {

        bid.textContent =
            formatPrice(state.bid);
    }


    if (ask) {

        ask.textContent =
            formatPrice(state.ask);
    }


    if (state.price !== null) {

        if (
            state.previousPrice !== null
        ) {

            const change =
                (
                    (
                        state.price -
                        state.previousPrice
                    ) /
                    state.previousPrice
                ) * 100;


            if (priceChange) {

                priceChange.textContent =
                    (
                        change >= 0
                            ? "+"
                            : ""
                    ) +
                    change.toFixed(3) +
                    "%";
            }

        }


        if (lastUpdate) {

            lastUpdate.textContent =
                new Date()
                    .toLocaleTimeString();
        }
    }

}


// ==========================================
// GET MARKET DATA
// ==========================================

async function fetchMarketData() {

    // No backend configured yet.

    if (!MARKET_API_URL) {

        setMarketStatus(
            false,
            "Backend not configured yet. " +
            "The next step is connecting a secure market-data backend."
        );

        return;
    }


    try {

        const response =
            await fetch(
                MARKET_API_URL,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        /*
         Expected backend response:

         {
             "symbol": "EUR/USD",
             "price": 1.10025,
             "bid": 1.10024,
             "ask": 1.10026
         }
        */


        if (
            typeof data.price !==
            "number"
        ) {

            throw new Error(
                "Invalid price returned by backend."
            );
        }


        state.previousPrice =
            state.price;

        state.price =
            Number(data.price);


        state.bid =
            data.bid !== undefined
                ? Number(data.bid)
                : state.price;


        state.ask =
            data.ask !== undefined
                ? Number(data.ask)
                : state.price;


        setMarketStatus(
            true,
            "Live EUR/USD market data connected."
        );


        updateMarketDisplay();


        addLog(
            "MARKET",
            "DATA UPDATED",
            "EUR/USD price: " +
            formatPrice(state.price)
        );


        // Update an existing demo position.

        updateTradePL();

    }


    catch (error) {

        console.error(
            "Market data error:",
            error
        );


        setMarketStatus(
            false,
            "Unable to reach the market-data backend."
        );

    }

}


// ==========================================
// TRADE P/L
// ==========================================

function calculateTradePL() {

    if (
        !state.trade ||
        state.price === null
    ) {

        return 0;
    }


    const difference =
        state.price -
        state.trade.entry;


    const direction =
        state.trade.type === "BUY"
            ? 1
            : -1;


    return (
        difference *
        direction *
        100000 *
        state.trade.lot
    );

}


// ==========================================
// UPDATE TRADE P/L
// ==========================================

function updateTradePL() {

    if (!state.trade) {

        return;
    }


    const pl =
        calculateTradePL();


    state.equity =
        state.balance + pl;


    const tradePL =
        $("tradePL");


    if (tradePL) {

        tradePL.textContent =
            (
                pl >= 0
                    ? "+"
                    : ""
            ) +
            "$" +
            pl.toFixed(2);
    }


    updateAccountDisplay();

}


// ==========================================
// ACCOUNT DISPLAY
// ==========================================

function updateAccountDisplay() {

    if ($("balance")) {

        $("balance").textContent =
            "$" +
            state.balance.toFixed(2);
    }


    if ($("equity")) {

        $("equity").textContent =
            "$" +
            state.equity.toFixed(2);
    }


    if ($("dailyPL")) {

        $("dailyPL").textContent =
            "$" +
            state.dailyPL.toFixed(2);
    }


    if ($("openTrades")) {

        $("openTrades").textContent =
            state.trade
                ? "1"
                : "0";
    }

}


// ==========================================
// AI DISPLAY
// ==========================================

function updateAIStatus() {

    const aiStatus =
        $("aiStatus");

    const indicator =
        $("statusIndicator");

    const startBtn =
        $("startBtn");

    const stopBtn =
        $("stopBtn");


    if (aiStatus) {

        aiStatus.textContent =
            state.running
                ? "RUNNING"
                : "STOPPED";
    }


    if (indicator) {

        indicator.className =
            state.running
                ? "status-indicator running"
                : "status-indicator stopped";
    }


    if (startBtn) {

        startBtn.disabled =
            state.running;
    }


    if (stopBtn) {

        stopBtn.disabled =
            !state.running;
    }

}


// ==========================================
// ADD LOG
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
        document.createElement(
            "div"
        );


    item.className =
        "log";


    item.innerHTML = `

        <div class="log-time">

            ${new Date()
                .toLocaleTimeString()}

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
// START AI
// ==========================================

function startAI() {

    if (state.running) {

        return;
    }


    state.running =
        true;


    if ($("reason")) {

        $("reason").textContent =
            "AI is running. " +
            "Waiting for market data.";
    }


    addLog(
        "SYSTEM",
        "AI STARTED",
        "AI monitoring started."
    );


    updateAIStatus();


    fetchMarketData();


    state.timer =
        setInterval(
            fetchMarketData,
            MARKET_REFRESH_MS
        );

}


// ==========================================
// STOP AI
// ==========================================

function stopAI() {

    state.running =
        false;


    if (state.timer) {

        clearInterval(
            state.timer
        );

        state.timer =
            null;
    }


    if ($("reason")) {

        $("reason").textContent =
            "AI trader is currently stopped.";
    }


    addLog(
        "SYSTEM",
        "AI STOPPED",
        "AI monitoring stopped."
    );


    updateAIStatus();

}


// ==========================================
// OPEN DEMO TRADE
// ==========================================

function openDemoTrade(type) {

    if (
        !state.marketOnline ||
        state.price === null
    ) {

        addLog(
            "AI",
            "NO TRADE",
            "Real market price is not available."
        );

        return;
    }


    if (state.trade) {

        return;
    }


    const maxLot =
        Number(
            $("maxLot")
                ? $("maxLot").value
                : 0.10
        );


    const lot =
        Math.min(
            0.01,
            maxLot
        );


    state.trade = {

        type: type,

        entry: state.price,

        lot: lot

    };


    addLog(
        "AI",
        type,
        "Demo position opened at " +
        formatPrice(
            state.price
        )
    );


    updateTradeDisplay();

}


// ==========================================
// CLOSE DEMO TRADE
// ==========================================

function closeDemoTrade(
    reason
) {

    if (!state.trade) {

        return;
    }


    const pl =
        calculateTradePL();


    state.balance +=
        pl;


    state.dailyPL +=
        pl;


    state.equity =
        state.balance;


    addLog(
        "AI",
        "CLOSE",
        reason +
        " Result: " +
        (
            pl >= 0
                ? "+"
                : ""
        ) +
        "$" +
        pl.toFixed(2)
    );


    state.trade =
        null;


    if ($("decision")) {

        $("decision").textContent =
            "WAIT";
    }


    if ($("confidence")) {

        $("confidence").textContent =
            "0%";
    }


    updateTradeDisplay();

    updateAccountDisplay();

}


// ==========================================
// TRADE DISPLAY
// ==========================================

function updateTradeDisplay() {

    const noTrade =
        $("noTrade");

    const details =
        $("tradeDetails");

    const closeButton =
        $("closeTradeBtn");

    const status =
        $("tradeStatus");


    if (!state.trade) {

        if (noTrade)
            noTrade.classList.remove(
                "hidden"
            );

        if (details)
            details.classList.add(
                "hidden"
            );

        if (closeButton)
            closeButton.classList.add(
                "hidden"
            );

        if (status) {

            status.textContent =
                "NO TRADE";

            status.className =
                "badge neutral";
        }

        return;
    }


    if (noTrade)
        noTrade.classList.add(
            "hidden"
        );


    if (details)
        details.classList.remove(
            "hidden"
        );


    if (closeButton)
        closeButton.classList.remove(
            "hidden"
        );


    if ($("tradeType"))
        $("tradeType").textContent =
            state.trade.type;


    if ($("entryPrice"))
        $("entryPrice").textContent =
            formatPrice(
                state.trade.entry
            );


    if ($("lotSize"))
        $("lotSize").textContent =
            state.trade.lot.toFixed(2);


    if ($("tradePL"))
        $("tradePL").textContent =
            (
                calculateTradePL() >= 0
                    ? "+"
                    : ""
            ) +
            "$" +
            calculateTradePL()
                .toFixed(2);


    if (status) {

        status.textContent =
            state.trade.type;

        status.className =
            "badge " +
            state.trade.type
                .toLowerCase();
    }

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const startBtn =
            $("startBtn");


        const stopBtn =
            $("stopBtn");


        const closeTradeBtn =
            $("closeTradeBtn");


        const refreshBtn =
            $("refreshMarketBtn");


        const clearLog =
            $("clearLog");


        if (startBtn) {

            startBtn.addEventListener(
                "click",
                startAI
            );
        }


        if (stopBtn) {

            stopBtn.addEventListener(
                "click",
                stopAI
            );
        }


        if (closeTradeBtn) {

            closeTradeBtn.addEventListener(
                "click",
                function () {

                    closeDemoTrade(
                        "Trade manually closed."
                    );

                }
            );
        }


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                fetchMarketData
            );
        }


        if (clearLog) {

            clearLog.addEventListener(
                "click",
                function () {

                    const logs =
                        $("logs");


                    if (logs) {

                        logs.innerHTML = `

                            <div class="log empty-log">

                                No decisions yet.

                            </div>

                        `;
                    }

                }
            );
        }


        updateAIStatus();

        updateMarketDisplay();

        updateTradeDisplay();

        updateAccountDisplay();


        setMarketStatus(
            false,
            "Backend not configured yet."
        );

    }
);
