const SIZE = 15, CELL = 35, OFFSET = 20;
const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');


let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
let isGameOver = false;
canvas.width = canvas.height = (SIZE - 1) * CELL + OFFSET * 2;


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#5d3a1a";
    for (let i = 0; i < SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(OFFSET + i * CELL, OFFSET); ctx.lineTo(OFFSET + i * CELL, canvas.height - OFFSET); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(OFFSET, OFFSET + i * CELL); ctx.lineTo(canvas.width - OFFSET, OFFSET + i * CELL); ctx.stroke();
    }
}


// 🤖 AI 核心：這就是「萬用破解」，直接把 AI 邏輯寫進去
function getScore(x, y, p) {
    let score = 0;
    const dirs = [[1,0], [0,1], [1,1], [1,-1]];
    for (let [dx, dy] of dirs) {
        let count = 0, space = 0;
        for (let s of [-1, 1]) {
            for (let i = 1; i < 5; i++) {
                let nx = x + dx * i * s, ny = y + dy * i * s;
                if (nx>=0 && nx<SIZE && ny>=0 && ny<SIZE) {
                    if (board[nx][ny] === p) count++;
                    else { if(board[nx][ny] === 0) space++; break; }
                } else break;
            }
        }
        if (count >= 4) score += 10000;
        else if (count === 3 && space === 2) score += 1000;
        else if (count === 3 && space === 1) score += 500;
        else if (count === 2 && space === 2) score += 100;
    }
    return score;
}


// 👁️ 視覺化：畫出 AI 的「思考熱點」
function drawHeatmap() {
    drawGrid();
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) {
                let pScore = getScore(i, j, 1);
                let aScore = getScore(i, j, 2);
                let total = pScore + aScore;
                if (total > 0) {
                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(total/1000, 0.5)})`;
                    ctx.fillRect(OFFSET + i * CELL - 15, OFFSET + j * CELL - 15, 30, 30);
                }
            } else {
                drawStone(i, j, board[i][j]);
            }
        }
    }
}


function drawStone(i, j, p) {
    ctx.beginPath();
    ctx.arc(OFFSET + i * CELL, OFFSET + j * CELL, 14, 0, Math.PI * 2);
    ctx.fillStyle = p === 1 ? "#000" : "#fff";
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.stroke();
}


canvas.onclick = (e) => {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const i = Math.round((e.clientX - rect.left - OFFSET) / CELL);
    const j = Math.round((e.clientY - rect.top - OFFSET) / CELL);
    if (board[i]?.[j] !== 0) return;


    board[i][j] = 1;
    if (checkWin(i, j, 1)) { statusText.innerText = "玩家勝出"; isGameOver = true; }
    else {
        aiTurn();
    }
    drawHeatmap();
};


function aiTurn() {
    let maxScore = -1, move = null;
    let nodeCount = 0;
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) {
                nodeCount++;
                let s = Math.max(getScore(i, j, 1) * 2.2, getScore(i, j, 2)); // 防禦倍率
                if (s > maxScore) { maxScore = s; move = {i, j}; }
            }
        }
    }
    if (move) {
        board[move.i][move.j] = 2;
        document.getElementById('bestScore').innerText = maxScore;
        document.getElementById('nodes').innerText = nodeCount;
        if (checkWin(move.i, move.j, 2)) { statusText.innerText = "AI 勝利"; isGameOver = true; }
    }
}


function checkWin(i, j, p) {
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];
    for(let [dx,dy] of dirs){
        let c=1;
        for(let s=1;s<5;s++) if(board[i+dx*s]?.[j+dy*s]===p) c++; else break;
        for(let s=1;s<5;s++) if(board[i-dx*s]?.[j-dy*s]===p) c++; else break;
        if(c>=5) return true;
    }
    return false;
}


document.getElementById('resetBtn').onclick = () => {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    isGameOver = false;
    drawHeatmap();
};


drawHeatmap();

