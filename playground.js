// webassembly setup

const memory = new WebAssembly.Memory({
    initial: 4,
    maximum: 4,
});

const imports = {
    env: {
        memory: memory,
    },
};

let result = await WebAssembly.instantiateStreaming(fetch("zf.wasm"), imports);

const buf = new Uint8Array(memory.buffer);
const start = result.instance.exports.bufPtr();

function copyStr(str, offset, max) {
    str = str.substring(0, max);
    const encoded = new TextEncoder().encode(str);
    for (let i = 0; i < encoded.length; i++) {
        buf[offset + i] = encoded[i];
    }
}

function rankToken(str, filename, token, caseSensitive, strictPath) {
    copyStr(str, start, 512);
    if (filename) {
        copyStr(filename, start + 512, 512);
    }
    copyStr(token, start + 1024, 64);
    return result.instance.exports.rankToken(str.length, filename.length, token.length, caseSensitive ? 1 : 0, strictPath ? 1 : 0);
}

// application logic

const lines = [
    { rank: 0, str: "CHANGELOG.md" },
    { rank: 0, str: "LICENSE" },
    { rank: 0, str: "README.md" },
    { rank: 0, str: "build.zig" },
    { rank: 0, str: "build.zig.zon" },
    { rank: 0, str: "complete/_zf" },
    { rank: 0, str: "complete/zf" },
    { rank: 0, str: "complete/zf.fish" },
    { rank: 0, str: "doc/lib.md" },
    { rank: 0, str: "doc/zf.1" },
    { rank: 0, str: "doc/zf.md" },
    { rank: 0, str: "files.txt" },
    { rank: 0, str: "makefile" },
    { rank: 0, str: "src/EditBuffer.zig" },
    { rank: 0, str: "src/Loop.zig" },
    { rank: 0, str: "src/Previewer.zig" },
    { rank: 0, str: "src/array_toggle_set.zig" },
    { rank: 0, str: "src/clib.zig" },
    { rank: 0, str: "src/filter.zig" },
    { rank: 0, str: "src/lib.zig" },
    { rank: 0, str: "src/loop.c" },
    { rank: 0, str: "src/main.zig" },
    { rank: 0, str: "src/opts.zig" },
    { rank: 0, str: "src/term.zig" },
    { rank: 0, str: "src/ui.zig" },
];

const queryNode = document.getElementById("query");
const display = document.getElementById("display");

queryNode.addEventListener("keyup", run);

function run() {
    // clear contents
    display.innerHTML = '';

    let query = queryNode.value.trim();

    // early exit if there is no query
    if (query === '') {
        return show(lines.slice(0, 10));
    }

    // smartcase only enables case sensitivity when at least one letter in the query is uppercase
    const case_sensitive = /[A-Z]/.test(query);

    const tokens = tokenize(query);

    // rank lines one token at a time
    const ranked = lines.filter(line => {
        const filename = line.str.split(/[\\/]/).pop();

        line.rank = 0.0;
        for (const token of tokens) {
            const r = rankToken(line.str, filename, token, case_sensitive, token.includes("/"));
            if (r === -1) {
                return false;
            }

            line.rank += r;
        }

        return true;
    }).sort((a, b) => a.rank > b.rank).slice(0, 10);

    show(ranked)
}

function show(lines) {
    for (let i = 0; i < 10; i++) {
        const li = document.createElement("li");
        // use a non-breaking space to maintain height of the "terminal"
        li.textContent = lines[i]?.str || "\u00A0";
        display.appendChild(li);
    }
}

function tokenize(query) {
    return query.trim().split(/[ ]+/);
}

run();
