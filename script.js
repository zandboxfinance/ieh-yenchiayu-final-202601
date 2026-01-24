// ======================
// 🔑 前端 Gemini API Key
// ======================
const API_KEY = 'AIzaSyBI1i1CYKUAxgYet1vmcP-gl4B27yqDYFM';


// ====== DOM ======
const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');


const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');


// ====== 棋盤設定 ======
const SIZE = 15;
const CELL = 30;
const OFFSET = 15;
const CANVAS_SIZE = OFFSET * 2 + CELL * (SIZE - 1);


canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;


let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
let isUserTurn = true;
let isGameOver = false;


// ====== 畫格子 ======
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8b4513';
  for (let i = 0; i < SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(OFFSET + i * CELL, OFFSET);
    ctx.lineTo(OFFSET + i * CELL, CANVAS_SIZE - OFFSET);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(OFFSET, OFFSET + i * CELL);
    ctx.lineTo(CANVAS_SIZE - OFFSET, OFFSET + i * CELL);
    ctx.stroke();
  }
}


// ====== 下棋 ======
function placeStone(i, j, black) {
  ctx.beginPath();
  ctx.arc(OFFSET + i * CELL, OFFSET + j * CELL, 13, 0, Math.PI * 2);
  ctx.fillStyle = black ? '#000' : '#fff';
  ctx.fill();
  ctx.stroke();
}


// ====== 勝負判斷 ======
function checkWin(i, j, c) {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (const [dx, dy] of dirs) {
    let n = 1;
    for (let s = 1; s < 5; s++)
      if (board[i + dx * s]?.[j + dy * s] === c) n++;
      else break;
    for (let s = 1; s < 5; s++)
      if (board[i - dx * s]?.[j - dy * s] === c) n++;
      else break;
    if (n >= 5) return true;
  }
  return false;
}


// ====== 初始化遊戲 ======
function initGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  isUserTurn = true;
  isGameOver = false;
  drawGrid();
  statusText.innerText = '你的回合（黑子）';
}
restartBtn.onclick = initGame;


// ====== 計算連線數 ======
function countLine(i, j, dx, dy, color) {
  let count = 0;
  for (let s = 1; s < 5; s++) {
    if (board[i + dx * s]?.[j + dy * s] === color) count++;
    else break;
  }
  for (let s = 1; s < 5; s++) {
    if (board[i - dx * s]?.[j - dy * s] === color) count++;
    else break;
  }
  return count;
}


// ====== AI 下棋策略（防守連3/進攻連3+中文提示）=====
function aiMove() {
  if (isGameOver) return;


  let bestScore = -Infinity;
  let bestMove = null;
  let message = '我在思考下一步…';


  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== 0) continue;
      let score = 0;


      // AI 自己
      board[i][j] = 2;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ]) {
        const c = countLine(i, j, dx, dy, 2);
        if (c >= 4) {
          score += 1000;
          message = '我在這裡完成連五！';
        } else if (c === 3) score += 50;
      }


      // 玩家
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ]) {
        const c = countLine(i, j, dx, dy, 1);
        if (c >= 4) {
          score += 900;
          message = '小心，你快連五了，我要阻止！';
        } else if (c === 3) {
          score += 100;
          message = '小心，你有三顆連在一起，我要堵住！';
        }
      }


      board[i][j] = 0;


      if (score > bestScore) {
        bestScore = score;
        bestMove = { i, j };
      }
    }
  }


  if (!bestMove) {
    let center = Math.floor(SIZE / 2);
    bestMove = { i: center, j: center };
    if (board[center][center] !== 0) {
      outer: for (let r = 0; r < SIZE; r++) {
        for (let x = center - r; x <= center + r; x++) {
          for (let y = center - r; y <= center + r; y++) {
            if (x >= 0 && x < SIZE && y >= 0 && y < SIZE && board[x][y] === 0) {
              bestMove = { i: x, j: y };
              break outer;
            }
          }
        }
      }
    }
    message = '我在中心附近下棋，穩住局面！';
  }


  placeStone(bestMove.i, bestMove.j, false);
  board[bestMove.i][bestMove.j] = 2;


  if (checkWin(bestMove.i, bestMove.j, 2)) {
    statusText.innerText = 'AI 贏了 😢';
    addMessage('AI：' + message, 'ai');
    isGameOver = true;
    return;
  }


  addMessage('AI：' + message, 'ai');
  isUserTurn = true;
  statusText.innerText = '你的回合（黑子）';
}


// ====== 玩家下棋 ======
canvas.onclick = (e) => {
  if (!isUserTurn || isGameOver) return;
  const x = e.offsetX - OFFSET;
  const y = e.offsetY - OFFSET;
  const i = Math.round(x / CELL);
  const j = Math.round(y / CELL);
  if (i < 0 || i >= SIZE || j < 0 || j >= SIZE || board[i][j] !== 0) return;


  placeStone(i, j, true);
  board[i][j] = 1;


  if (checkWin(i, j, 1)) {
    statusText.innerText = '你獲勝 🎉';
    addMessage('AI：你贏了！太棒了 🎊', 'ai');
    isGameOver = true;
    return;
  }


  isUserTurn = false;
  statusText.innerText = 'AI 思考中...';
  setTimeout(aiMove, 300);
};


// ====== 聊天室功能（中文回覆）=====
function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}


async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  userInput.value = '';


  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' +
        API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: '請用繁體中文回答：' + text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 60 },
        }),
      },
    );
    const data = await res.json();
    const reply =
      data.candidates?.[0].content?.parts[0].text || 'AI 暫時無回應';
    addMessage(reply, 'ai');
  } catch (err) {
    addMessage('⚠️ AI 無法回應', 'error');
  }
}


sendBtn.onclick = sendMessage;
userInput.onkeydown = (e) => {
  if (e.key === 'Enter') sendMessage();
};


// ====== 初始訊息 ======
addMessage('AI：你好！我可以陪你下五子棋，也可以聊天 😊', 'ai');
drawGrid();


