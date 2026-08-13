// ================================
// AI TRADER - DEMO VERSION
// ================================

const state = {
    running: false,
    price: 1.10000,
    balance: 10000,
    equity: 10000,
    dailyPL: 0,
    trade: null,
    timer: null
};


// ================================
// HELPER
// ================================

function $(id) {
    return document.getElementById(id);
}


// ================================
// FORMAT PRICE
// ================================

function formatPrice(value) {
    return Number(value).toFixed(5);
}


// ================================
// CALCULATE TRADE PROFIT
// ================================

function calculateTradePL() {

    if (!state.trade) {
        return 0;
    }

    const difference =
        state.price - state.trade.entry;

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


// ================================
// UPDATE WEBSITE
// ================================

function updateDisplay() {

    const price = $("price");
    const balance = $("balance");
    const equity = $("equity");
    const dailyPL = $("dailyPL");
    const openTrades = $("openTrades");
    const aiStatus = $("aiStatus");
    const statusIndicator = $("statusIndicator");
    const startBtn = $("startBtn");
    const stopBtn = $("stopBtn");

    if (price) {
        price.textContent =
            formatPrice(state.price);
    }

    if (balance) {
        balance.textContent =
            "$" + state.balance.toFixed(2);
    }

    if (equity) {
        equity.textContent =
            "$" + state.equity.toFixed(2);
    }

    if (dailyPL) {
        dailyPL.textContent =
            "$" + state.dailyPL.toFixed(2);
    }

    if (openTrades) {
        openTrades.textContent =
            state.trade ? "1" : "0";
    }

    if (aiStatus) {
        aiStatus.textContent =
            state.running
                ? "RUNNING"
                : "STOPPED";
    }

    if (statusIndicator) {
        statusIndicator.className =
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


    // ============================
    // OPEN TRADE
    // ============================

    const noTrade = $("noTrade");
    const tradeDetails = $("tradeDetails");
    const closeTradeBtn = $("closeTradeBtn");
    const tradeStatus = $("tradeStatus");

    if (state.trade) {

        if (noTrade) {
            noTrade.classList.add("hidden");
        }

        if (tradeDetails) {
            tradeDetails.classList.remove("hidden");
        }

        if (closeTradeBtn) {
            closeTradeBtn.classList.remove("hidden");
        }

        if ($("tradeType")) {
            $("tradeType").textContent =
                state.trade.type;
        }

        if ($("entryPrice")) {
            $("entryPrice").textContent =
                formatPrice(state.trade.entry);
        }

        if ($("lotSize")) {
            $("lotSize").textContent =
                state.trade.lot.toFixed(2);
        }

        const pl =
            calculateTradePL();

        if ($("tradePL")) {
            $("tradePL").textContent =
                (pl >= 0 ? "+" : "") +
                "$" +
                pl.toFixed(2);
        }

        if (tradeStatus) {

            tradeStatus.textContent =
                state.trade.type;

            tradeStatus.className =
                "badge " +
                state.trade.type.toLowerCase();
        }

    } else {

        if (noTrade) {
            noTrade.classList.remove("hidden");
        }

        if (tradeDetails) {
            tradeDetails.classList.add("hidden");
        }

        if (closeTradeBtn) {
            closeTradeBtn.classList.add("hidden");
        }

        if (tradeStatus) {

            tradeStatus.textContent =
                "NO TRADE";

            tradeStatus.className =
                "badge neutral";
        }
    }
}


// ================================
// ADD LOG
// ================================

function addLog(source, action, reason) {

    const logs = $("logs");

    if (!logs) {
        return;
    }

    const empty =
        logs.querySelector(".empty-log");

    if (empty) {
        empty.remove();
    }

    const item =
        document.createElement("div");

    item.className = "log";

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


// ================================
// START AI
// ================================

function startAI() {

    if (state.running) {
        return;
    }

    state.running = true;

    const connectionText =
        $("connectionText");

    if (connectionText) {
        connectionText.textContent =
            "AI Demo Running";
    }

    addLog(
        "SYSTEM",
        "AI STARTED",
        "AI trading simulation has started."
    );

    updateDisplay();

    state.timer =
        setInterval(
            simulateAI,
            3000
        );
}


// ================================
// STOP AI
// ================================

function stopAI() {

    if (!state.running) {
        return;
    }

    state.running = false;

    if (state.timer) {

        clearInterval(
            state.timer
        );

        state.timer = null;
    }

    const connectionText =
        $("connectionText");

    if (connectionText) {
        connectionText.textContent =
            "Demo Mode";
    }

    addLog(
        "SYSTEM",
        "AI STOPPED",
        "AI trading simulation has stopped."
    );

    updateDisplay();
}


// ================================
// SIMULATE MARKET
// ================================

function simulateMarket() {

    const movement =
        (Math.random() - 0.5)
        * 0.0008;

    state.price += movement;

    if (state.price < 1.09500) {
        state.price = 1.09500;
    }

    if (state.price > 1.10500) {
        state.price = 1.10500;
    }
}


// ================================
// UPDATE AI ANALYSIS
// ================================

function updateAnalysis(decision) {

    if (decision === "BUY") {

        if ($("trend"))
            $("trend").textContent = "Bullish";

        if ($("momentum"))
            $("momentum").textContent = "Positive";

        if ($("volatility"))
            $("volatility").textContent = "Normal";

        if ($("bias"))
            $("bias").textContent = "Bullish";

    }

    else if (decision === "SELL") {

        if ($("trend"))
            $("trend").textContent = "Bearish";

        if ($("momentum"))
            $("momentum").textContent = "Negative";

        if ($("volatility"))
            $("volatility").textContent = "Normal";

        if ($("bias"))
            $("bias").textContent = "Bearish";

    }

    else {

        if ($("trend"))
            $("trend").textContent = "Neutral";

        if ($("momentum"))
            $("momentum").textContent = "Neutral";

        if ($("volatility"))
            $("volatility").textContent = "Normal";

        if ($("bias"))
            $("bias").textContent = "Neutral";
    }
}


// ================================
// SIMULATE AI
// ================================

function simulateAI() {

    simulateMarket();


    // ----------------------------
    // EXISTING TRADE
    // ----------------------------

    if (state.trade) {

        const pl =
            calculateTradePL();

        state.equity =
            state.balance + pl;


        if ($("reason")) {

            $("reason").textContent =
                "AI is monitoring the open EUR/USD position.";
        }


        if ($("decision")) {
            $("decision").textContent =
                "HOLD";
        }


        if ($("confidence")) {

            $("confidence").textContent =
                (
                    70 +
                    Math.floor(
                        Math.random() * 25
                    )
                ) + "%";
        }


        // Sometimes AI closes demo trade
        if (Math.random() < 0.12) {

            closeTrade(
                "AI decided market conditions changed."
            );
        }

    }

    // ----------------------------
    // NEW TRADE
    // ----------------------------

    else {

        const random =
            Math.random();

        let decision =
            "WAIT";

        let confidence =
            55;

        let reason =
            "Market conditions are not strong enough for a trade.";


        if (
            random > 0.70 &&
            random < 0.85
        ) {

            decision =
                "BUY";

            confidence =
                70 +
                Math.floor(
                    Math.random() * 25
                );

            reason =
                "Demo AI detected a simulated bullish setup.";
        }


        if (random >= 0.85) {

            decision =
                "SELL";

            confidence =
                70 +
                Math.floor(
                    Math.random() * 25
                );

            reason =
                "Demo AI detected a simulated bearish setup.";
        }


        if ($("decision")) {
            $("decision").textContent =
                decision;
        }

        if ($("confidence")) {
            $("confidence").textContent =
                confidence + "%";
        }

        if ($("reason")) {
            $("reason").textContent =
                reason;
        }


        updateAnalysis(
            decision
        );


        if (
            decision === "BUY" ||
            decision === "SELL"
        ) {

            openTrade(
                decision
            );

        } else {

            addLog(
                "AI",
                decision,
                reason
            );
        }
    }


    updateDisplay();
}


// ================================
// OPEN TRADE
// ================================

function openTrade(type) {

    const maxTrades =
        Number(
            $("maxTrades")
                ? $("maxTrades").value
                : 1
        );


    if (
        state.trade ||
        maxTrades < 1
    ) {

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
        "Demo trade opened at " +
        formatPrice(state.price) +
        "."
    );
}


// ================================
// CLOSE TRADE
// ================================

function closeTrade(
    reason = "Trade manually closed."
) {

    if (!state.trade) {
        return;
    }


    const pl =
        calculateTradePL();


    state.balance += pl;

    state.dailyPL += pl;

    state.equity =
        state.balance;


    addLog(
        "AI",
        "CLOSE",
        reason +
        " Result: " +
        (pl >= 0 ? "+" : "") +
        "$" +
        pl.toFixed(2)
    );


    state.trade = null;


    if ($("decision")) {
        $("decision").textContent =
            "WAIT";
    }


    if ($("confidence")) {
        $("confidence").textContent =
            "0%";
    }


    if ($("reason")) {
        $("reason").textContent =
            "Position closed. Waiting for the next setup.";
    }


    updateDisplay();
}


// ================================
// CONNECT BUTTONS
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const startBtn =
            $("startBtn");

        const stopBtn =
            $("stopBtn");

        const closeTradeBtn =
            $("closeTradeBtn");

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

                    closeTrade(
                        "Trade manually closed."
                    );

                }
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


        updateDisplay();

    }
);