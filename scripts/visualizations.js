/*
    *****************
    DONE BY:-   TUMMALA KETHAN
    *****************
*/

// ------------------ Speed control ------------------
var speed = 1000;
window.inp_aspeed.addEventListener("input", vis_speed);

function vis_speed() {
    var array_speed = window.inp_aspeed.value;
    switch (parseInt(array_speed)) {
        case 1: speed = 1; break;
        case 2: speed = 10; break;
        case 3: speed = 100; break;
        case 4: speed = 1000; break;
        case 5: speed = 10000; break;
        default: speed = 1000; break;
    }

    delay_time = 10000 / (Math.floor(array_size / 10) * speed);
}

// Initial delay_time setup
var delay_time = 10000 / (Math.floor(array_size / 10) * speed);
var c_delay = 0; // Updated on every div change for visualization

// ------------------ Div update function ------------------
function div_update(cont, height, color) {
    window.setTimeout(function () {
        cont.style = "margin:0% " + margin_size + "%; width:" +
            (100 / array_size - (2 * margin_size)) + "%; height:" + height +
            "%; background-color:" + color + ";";
    }, c_delay += delay_time);
}
