let timer = [0, 0, 0, 0];
let timerRunning = false;
let interval;
let theTimer = $('#timer');

// Add leading zero to numbers 9
function leadingZero(time) {
    if (time <= 9) {
        time = "0" + time;
    }
    return time;
}
//Reset Everthing
function stopTimer() {
    clearInterval(interval);
    interval = null;
    timerRunning = false;
}

// Create a Clock
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    theTimer.text(currentTime);
    timer[3]++;

    timer[0] = Math.floor((timer[3] / 100) / 60);
    timer[1] = Math.floor((timer[3] / 100) - (timer[0] * 60));
    timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));
}

// Start the timer
function startTimer() {
    timerRunning = true;
    interval = setInterval(runTimer, 10);
}
