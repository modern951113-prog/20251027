/*
By Okazz
*/
let ctx;
let centerX, centerY;
let shapes = [];
let canSpawn = false;
let colors = ['#7B62A3', '#213668', '#F27DC0', '#4176DD', '#f0f0f0'];
// sidebar control
let sidebarEl;
let sidebarThreshold = 100; // 當滑鼠在最左側 100px 範圍內時顯示
// iframe overlay elements
let iframeOverlayEl;
let iframeCloseBtn;
let contentFrame;
const iframeURL = 'https://modern951113-prog.github.io/20251020/';
const iframeURL2 = 'https://hackmd.io/@v2yhlhTSTK-nIky2dL9Uqw/SyaMwmCiex';
const iframeURL3 = 'https://modern951113-prog.github.io/20251103/';

function setup() {
	//createCanvas(700, 875);//A4 size
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
	rectMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	ctx = drawingContext;
	centerX = width / 2;
	centerY = height / 2;
	canSpawn = true;

	// 取得 sidebar 元素（在 index.html 中）
	sidebarEl = document.getElementById('sidebar');
	if (sidebarEl) sidebarEl.setAttribute('aria-hidden', 'true');

	// 取得 iframe overlay 元素並綁定事件
	iframeOverlayEl = document.getElementById('iframeOverlay');
	iframeCloseBtn = document.getElementById('iframeClose');
	contentFrame = document.getElementById('contentFrame');

	if (iframeCloseBtn) {
		iframeCloseBtn.addEventListener('click', () => {
			hideIframeOverlay();
		});
	}

	// 點擊 overlay 空白處可關閉（但點擊 iframe 本身不會關閉）
	if (iframeOverlayEl) {
		iframeOverlayEl.addEventListener('click', (e) => {
			// 只有當點擊目標為 overlay 本身（不是其子元素）時才關閉
			if (e.target === iframeOverlayEl) {
				hideIframeOverlay();
			}
		});
	}

	// 點擊第一個選單項目時顯示 iframe
	let menuItem1 = document.getElementById('menuItem1');
	if (menuItem1) {
		menuItem1.addEventListener('click', (e) => {
			e.preventDefault();
			showIframeOverlay(iframeURL);
		});
	}

	// 第二個選單：第一單元講義
	let menuItem2 = document.getElementById('menuItem2');
	if (menuItem2) {
		menuItem2.addEventListener('click', (e) => {
			e.preventDefault();
			showIframeOverlay(iframeURL2);
		});
	}

	// 第三個選單：測驗系統
	let menuItem3 = document.getElementById('menuItem3');
	if (menuItem3) {
		menuItem3.addEventListener('click', (e) => {
			e.preventDefault();
			showIframeOverlay(iframeURL3);
		});
	}
}

function draw() {
	// 側邊欄互動：當滑鼠靠近畫面左側時加上 open class
	if (sidebarEl) {
		let mx = (typeof mouseX === 'number') ? mouseX : -9999;
		if (mx <= sidebarThreshold) {
			if (!sidebarEl.classList.contains('open')) {
				sidebarEl.classList.add('open');
				sidebarEl.setAttribute('aria-hidden', 'false');
			}
		} else {
			if (sidebarEl.classList.contains('open')) {
				sidebarEl.classList.remove('open');
				sidebarEl.setAttribute('aria-hidden', 'true');
			}
		}
	}

	canSpawn = true;
	background('#161617');
	for (let s of shapes) {
		s.run();
	}

	for (let i = 0; i < shapes.length; i++) {
		if (shapes[i].isDead) {
			shapes.splice(i, 1);
		}
	}

	for (let i = 0; i < shapes.length; i++) {
		let s = shapes[i];
		if ((s.y - (s.w / 2)) < 0) {
			canSpawn = false;
			break;
		}
	}
	if (canSpawn) {
		tiling(width / 2, -width / 2, width);
	}
}
function tiling(x, y, w) {
	let cellCount = 15;
	let cellSize = w / cellCount;
	for (let i = 0; i < cellCount; i++) {
		for (let j = (cellCount - 1); j > -1; j--) {
			let xx = x + i * cellSize - (w / 2) + (cellSize / 2);
			let yy = y + j * cellSize - (w / 2) + (cellSize / 2);
			shapes.push(new Shape(xx, yy, cellSize));
		}
	}
}

// 顯示 iframe overlay
function showIframeOverlay(url) {
	if (!iframeOverlayEl || !contentFrame) return;
	contentFrame.src = url;
	iframeOverlayEl.setAttribute('aria-hidden', 'false');
}

// 隱藏 iframe overlay 並清除 src
function hideIframeOverlay() {
	if (!iframeOverlayEl || !contentFrame) return;
	iframeOverlayEl.setAttribute('aria-hidden', 'true');
	// 清除 src 以停止載入/播放
	contentFrame.src = '';
}

class Shape {
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.timer = 0;
		this.phase1 = 100;
		this.phase2 = 0;

		this.start = false;
		this.yStep = height * 0.001;
		this.angle = 0;
		this.av = 0;
		this.aa = random([-1, 1]) * 0.001;
		this.currentW = w;
		this.xStep = random([-1, 1]) * width * 0.001;
		this.clr = '#000';
		this.border = random(0.2, 0.7) * height;

		this.xVel = 0;
		this.yVel = 1;
		this.xAcc = random(-1, 1) * 0.01;
		this.yAcc = random(0.01, 0.05);

		this.isDead = false;

		this.clrs = [];
		for (let i = 0; i < colors.length; i++) {
			this.clrs.push(colors[i]);
		}
		shuffle(this.clrs, true);
		this.alph = 100;

		this.colorPattern = int(random(2));
		this.number = int(random(1, 5));
		this.decrease = random(0.9, 0.5);
		this.corner = random([0, this.w]);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		this.drawPattern();
		pop();
	}

	update() {
		if (this.start) {
			this.timer++;
			this.angle += constrain(this.av, -0.1, 0.1);
			this.av += this.aa;
			this.xVel += this.xAcc;
			this.yVel += this.yAcc;
		}
		if (0 < this.timer && this.timer < this.phase1) {
			let nrm = norm(this.timer, 0, this.phase1 - 1);
			this.alph = lerp(100, 0, nrm);
		}
		this.x += this.xVel;
		this.y += this.yVel;

		if (this.y > this.border) {
			this.start = true;
		}

		if ((this.y - this.w) > height) {
			this.isDead = true;
		}
	}

	drawPattern() {
		noStroke();
		fill(this.clrs[0]);
		rect(0, 0, this.w, this.w);
		let cellSize = this.w / this.number;
		for (let i = 0; i < this.number; i++) {
			for (let j = 0; j < this.number; j++) {
				let x = (i * cellSize) - (this.w / 2) + (cellSize / 2);
				let y = (j * cellSize) - (this.w / 2) + (cellSize / 2);
				fill(this.clrs[4]);
				square(x, y, cellSize * this.decrease, this.corner);
				if (this.colorPattern == 0) {
					fill(this.clrs[int(i+j) % 3]);
				} else {
					fill(this.clrs[1]);
				}
				square(x, y, cellSize * this.decrease * 0.75, this.corner);
			}
		}
	}

	run() {
		this.show();
		this.update();
	}
}
