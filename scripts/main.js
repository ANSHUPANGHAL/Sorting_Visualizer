/*
    *****************
    DONE BY:-   TUMMALA KETHAN (Modified and Fixed)
    *****************
*/

/* ------------------ Global Variables ------------------ */
var inp_as = document.getElementById('a_size'),
    array_size = parseInt(inp_as.value);
var inp_gen = document.getElementById("a_generate");
window.inp_aspeed = document.getElementById("a_speed");
var butts_algos = document.querySelectorAll(".algos button");

var div_sizes = [];
var divs = [];
var margin_size;
var cont = document.getElementById("array_container");
cont.style = "flex-direction:row";

var delay_time = 10000 / (Math.floor(array_size / 10) * 1000); // default delay
var c_delay = 0;
var speed = 1000;

var SortingModuleInstance = null; // global WASM instance

/* ------------------ Disable/Enable Buttons ------------------ */
function disable_buttons() {
    for (var i = 0; i < butts_algos.length; i++) {
        butts_algos[i].classList = [];
        butts_algos[i].classList.add("butt_locked");
        butts_algos[i].disabled = true;
    }
    inp_as.disabled = true;
    inp_gen.disabled = true;
    window.inp_aspeed.disabled = true;
}

function enable_buttons() {
    for (var i = 0; i < butts_algos.length; i++) {
        butts_algos[i].classList = [];
        butts_algos[i].classList.add("butt_unselected");
        butts_algos[i].disabled = false;
    }
    inp_as.disabled = false;
    inp_gen.disabled = false;
    window.inp_aspeed.disabled = false;
}

/* ------------------ Speed Control ------------------ */
window.inp_aspeed.addEventListener("input", function () {
    var array_speed = parseInt(window.inp_aspeed.value);
    switch (array_speed) {
        case 1: speed = 1; break;
        case 2: speed = 10; break;
        case 3: speed = 100; break;
        case 4: speed = 1000; break;
        case 5: speed = 10000; break;
        default: speed = 1000; break;
    }
    delay_time = 10000 / (Math.floor(array_size / 10) * speed);
});

/* ------------------ Array Generation ------------------ */
inp_gen.addEventListener("click", generate_array);
inp_as.addEventListener("input", update_array_size);

function generate_array() {
    cont.innerHTML = "";
    div_sizes = [];
    divs = [];

    for (var i = 0; i < array_size; i++) {
        div_sizes[i] = Math.floor(Math.random() * 0.5 * (inp_as.max - inp_as.min)) + 10;
        divs[i] = document.createElement("div");
        cont.appendChild(divs[i]);
        margin_size = 0.1;
        divs[i].style = "margin:0% " + margin_size + "%; background-color:blue; width:" +
            (100 / array_size - (2 * margin_size)) + "%; height:" + div_sizes[i] + "%;";
    }
}

function update_array_size() {
    array_size = parseInt(inp_as.value);
    generate_array();
}

/* ------------------ Div Update ------------------ */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function div_update(cont, height, color) {
    window.setTimeout(function () {
        cont.style = "margin:0% " + margin_size + "%; width:" +
            (100 / array_size - (2 * margin_size)) + "%; height:" + height +
            "%; background-color:" + color + ";";
    }, c_delay += delay_time);
}

/* ------------------ WASM Module Loader (Robust) ------------------ */
async function ensureModuleReady() {
    // Already loaded
    if (SortingModuleInstance && typeof SortingModuleInstance._malloc === "function") {
        return SortingModuleInstance;
    }

    try {
        // If SortingModule is a function (MODULARIZE)
        if (typeof SortingModule === "function") {
            const module = await SortingModule();
            SortingModuleInstance = module;
            console.log("✅ WASM module loaded (factory):", module);
            return module;
        }

        // If already an object (non-MODULARIZE)
        if (typeof SortingModule === "object") {
            SortingModuleInstance = SortingModule;
            console.log("✅ WASM module loaded (object):", SortingModuleInstance);
            return SortingModuleInstance;
        }

        throw new Error("SortingModule not found or invalid export type");
    } catch (err) {
        console.error("❌ Failed to load WASM module:", err);
        alert("Error loading WebAssembly module! Check console for details.");
        throw err;
    }
}

/* ------------------ WASM Helpers ------------------ */
function arrayToWasm(arr) {
    if (!SortingModuleInstance) throw new Error("WASM module not initialized");
    if (typeof SortingModuleInstance._malloc !== "function") {
        console.error("WASM module missing _malloc", SortingModuleInstance);
        throw new Error("_malloc not found in module");
    }

    const n = arr.length;
    const ptr = SortingModuleInstance._malloc(n * 4); // allocate 4 bytes per int
    SortingModuleInstance.HEAP32.set(arr, ptr / 4);
    return ptr;
}

function wasmToArray(ptr, n) {
    return Array.from(new Int32Array(SortingModuleInstance.HEAP32.buffer, ptr, n));
}

/* ------------------ WASM Sorting Runner ------------------ */
async function sort_WASM(wasmFunc) {
    await ensureModuleReady();
    disable_buttons();

    const ptr = arrayToWasm(div_sizes);
    wasmFunc(ptr, array_size); // call WASM sorting function

    const sortedArray = wasmToArray(ptr, array_size);

    for (let i = 0; i < array_size; i++) {
        div_sizes[i] = sortedArray[i];
        div_update(divs[i], div_sizes[i], "green");
        await sleep(delay_time);
    }

    SortingModuleInstance._free(ptr);
    enable_buttons();
}

/* ------------------ Algorithm Wrappers ------------------ */
async function Bubble_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N^2)";
    document.getElementById("Time_Average").innerText = "Θ(N^2)";
    document.getElementById("Time_Best").innerText = "Ω(N)";
    document.getElementById("Space_Worst").innerText = "O(1)";
    await sort_WASM(SortingModuleInstance._bubble_sort); 
}

async function Insertion_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N^2)";
    document.getElementById("Time_Average").innerText = "Θ(N^2)";
    document.getElementById("Time_Best").innerText = "Ω(N)";
    document.getElementById("Space_Worst").innerText = "O(1)";
    await sort_WASM(SortingModuleInstance._insertion_sort); 
}

async function Selection_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N^2)";
    document.getElementById("Time_Average").innerText = "Θ(N^2)";
    document.getElementById("Time_Best").innerText = "Ω(N^2)";
    document.getElementById("Space_Worst").innerText = "O(1)";
    await sort_WASM(SortingModuleInstance._selection_sort); 
}

async function Merge_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N log N)";
    document.getElementById("Time_Average").innerText = "Θ(N log N)";
    document.getElementById("Time_Best").innerText = "Ω(N log N)";
    document.getElementById("Space_Worst").innerText = "O(N)";
    await sort_WASM(SortingModuleInstance._merge_sort); 
}

async function Quick_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N^2)";
    document.getElementById("Time_Average").innerText = "Θ(N log N)";
    document.getElementById("Time_Best").innerText = "Ω(N log N)";
    document.getElementById("Space_Worst").innerText = "O(log N)";
    await sort_WASM(SortingModuleInstance._quick_sort); 
}

async function Heap_WASM() { 
    document.getElementById("Time_Worst").innerText = "O(N log N)";
    document.getElementById("Time_Average").innerText = "Θ(N log N)";
    document.getElementById("Time_Best").innerText = "Ω(N log N)";
    document.getElementById("Space_Worst").innerText = "O(1)";
    await sort_WASM(SortingModuleInstance._heap_sort); 
}

/* ------------------ Run Algorithm ------------------ */
function runalgo() {
    if (!SortingModuleInstance) {
        alert("WASM module not loaded yet!");
        return;
    }
    disable_buttons();
    this.classList.add("butt_selected");

    switch (this.innerHTML) {
        case "Bubble": Bubble_WASM(); break;
        case "Insertion": Insertion_WASM(); break;
        case "Selection": Selection_WASM(); break;
        case "Merge": Merge_WASM(); break;
        case "Quick": Quick_WASM(); break;
        case "Heap": Heap_WASM(); break;
    }
}

/* ------------------ Initialize ------------------ */
window.onload = async () => {
    disable_buttons();
    try {
        await ensureModuleReady();
        generate_array();
        enable_buttons();
    } catch (err) {
        console.error("WASM init failed:", err);
    }

    for (var i = 0; i < butts_algos.length; i++) {
        butts_algos[i].addEventListener("click", runalgo);
    }
};
