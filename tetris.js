"use strict";
(function () {
    var RUNNING = true;
    //config
    var canvasWidth = 200, canvasHeight = canvasWidth * 20 / 10;
    var top_label_height = 25;
    var panelWidth = 100;
    var width = canvasWidth + panelWidth, height = canvasHeight + top_label_height;
    var css = '#tetris_top:hover{ cursor: pointer; }\n#tetris_top:active{ cursor: move; }';
    var style = document.createElement('style');
    function expand(parent, child, override) {
        if (override === void 0) { override = false; }
        if (!override)
            // @ts-ignore
            return Object.assign(parent, child);
        //override
        Object.getOwnPropertyNames(child).forEach(function (prop) {
            parent[prop] = child[prop];
        });
        return parent;
    }
    function getScreenSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth ||
                document.body.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight ||
                document.body.clientHeight
        };
    }
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            //@ts-ignore
            window.mozRequestAnimationFrame ||
            //@ts-ignore
            window.oRequestAnimationFrame ||
            //@ts-ignore
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
    //@ts-ignore
    if (style.styleSheet) {
        //@ts-ignore
        style.styleSheet.cssText = css;
    }
    else
        style.append(document.createTextNode(css));
    try {
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    catch (e) {
        console.error('Cannot append styles: ' + e);
    }
    var clamp = function (val, min, max) { return Math.min(max, Math.max(min, val)); };
    var box = document.createElement('div');
    expand(box.style, {
        'display': 'block',
        'width': width + 'px',
        'height': height + 'px',
        'color': '#fff',
        'background': '#37474F',
        'fontFamily': 'Arial',
        'textAlign': 'center',
        'position': 'fixed',
        'padding': '0px',
        'left': '0px', top: '0px',
        'borderRadius': '10px',
        'boxSizing': 'content-box',
        'border': '5px solid #37474F',
        'verticalAlign': 'middle',
        'boxShadow': '0px 8px 12px 0px #0004'
    }, true);
    var top_handle = document.createElement('div');
    top_handle.innerText = 'Tetris by Aktyn';
    expand(top_handle.style, {
        'width': '100%',
        'height': top_label_height + 'px',
        'margin': '0px',
        'padding': '0px 10px',
        'color': '#7f96a2',
        'fontSize': '12px',
        'textAlign': 'left',
        'boxSizing': 'border-box',
        'lineHeight': (top_label_height - 6) + 'px',
    }, true);
    top_handle.setAttribute("id", "tetris_top");
    box.appendChild(top_handle);
    var exitBtn = document.createElement('div');
    expand(exitBtn.style, {
        'float': 'right',
        'margin': '0px', padding: '0px',
        'color': '#fff8',
        'fontSize': '15px',
    }, true);
    exitBtn.innerHTML = '&times;';
    top_handle.appendChild(exitBtn);
    var container = document.createElement('div');
    expand(container.style, {
        width: "100%"
    }, true);
    box.appendChild(container);
    var canvas = document.createElement('canvas');
    expand(canvas.style, {
        'display': 'inline-block',
        'float': 'left',
        'width': canvasWidth + 'px',
        'height': canvasHeight + 'px',
        'background': '#607D8B',
    }, true);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    container.appendChild(canvas);
    var rightPanel = document.createElement('div');
    expand(rightPanel.style, {
        'width': panelWidth + "px",
        'height': canvasHeight + "px",
        'background': "#455A64",
        'float': "right",
        'display': "inline-flex",
        'flexDirection': "column",
        'justifyContent': "space-between",
        'boxSizing': 'border-box',
        'borderLeft': '2px solid #37474F',
        'alignItems': "center"
    }, true);
    container.appendChild(rightPanel);
    var next_preview = document.createElement('canvas');
    expand(next_preview.style, {
        'marginBottom': '20px',
        'width': (panelWidth - 2) + "px",
        'height': (panelWidth - 2) + "px",
        'background': "#546E7A"
    }, true);
    next_preview.width = next_preview.height = panelWidth - 2;
    rightPanel.appendChild(next_preview);
    var linesInfo = document.createElement('div');
    linesInfo.innerHTML = 'Lines<br>0';
    expand(linesInfo.style, {
        'flexGrow': '2',
        'width': "100%"
    }, true);
    rightPanel.appendChild(linesInfo);
    var levelInfo = document.createElement('div');
    levelInfo.innerHTML = 'Level<br>1';
    expand(levelInfo.style, {
        'flexGrow': '2',
        'width': "100%"
    }, true);
    rightPanel.appendChild(levelInfo);
    var btn_style = {
        'width': ((panelWidth * 0.8) | 0) + "px",
        'padding': "10px",
        'margin': "0px",
        'marginBottom': "20px",
        'color': '#fff',
        'fontSize': '15px',
        'textAlign': 'center',
        'minWidth': "0px",
        'flexGrow': '0',
        'border': "1px solid #63808d",
        'background': "none",
    };
    var pause_btn = document.createElement('button');
    pause_btn.innerText = 'PAUSE';
    expand(pause_btn.style, btn_style, true);
    rightPanel.appendChild(pause_btn);
    var game_btn = document.createElement('button');
    game_btn.innerText = 'START';
    expand(game_btn.style, btn_style, true);
    rightPanel.appendChild(game_btn);
    var grab_pos, drag_movementX = 0, drag_movementY = 0;
    var onTopHandleMousedown = function (e) { return grab_pos = e; };
    top_handle.addEventListener('mousedown', onTopHandleMousedown, false);
    var grabEvent = function (e) {
        if (grab_pos) {
            var box_rect = box.getBoundingClientRect();
            drag_movementX += e.clientX - grab_pos.clientX;
            drag_movementY -= e.clientY - grab_pos.clientY;
            setBoxTransform({
                x: e.clientX - grab_pos.clientX + box_rect.left,
                y: e.clientY - grab_pos.clientY + box_rect.top
            });
            grab_pos = e;
        }
    };
    var setBoxTransform = function (pos) {
        var box_rect = box.getBoundingClientRect();
        pos.x = clamp(pos.x, 0, getScreenSize().width - (box_rect.right - box_rect.left));
        pos.y = clamp(pos.y, 0, getScreenSize().height - (box_rect.bottom - box_rect.top));
        box.style.transform = "translate(" + pos.x + "px, " + pos.y + "px)";
    };
    //move to center of the screen
    setBoxTransform({ x: (getScreenSize().width - width) / 2, y: (getScreenSize().height - height) / 2 });
    ////////////////////////////////////////////////////////////////////////////////
    function updateDragEffect() {
        if (~~drag_movementX != 0 || ~~drag_movementY != 0) {
            // console.log(drag_movementY);
            drag_movementX = clamp(drag_movementX, -66, 66);
            drag_movementY = clamp(drag_movementY, -66, 66);
            container.style.transform = "perspective(" + getScreenSize().width + "px)\n\t\t\t\t\trotateY(" + ((drag_movementX * 0.66) | 0) + "deg)\n\t\t\t\t\trotateX(" + ((drag_movementY * 0.66) | 0) + "deg)";
            container.style.transformOrigin = "50% " + (canvasHeight / 2) + "px";
            drag_movementX *= 0.9;
            drag_movementY *= 0.9;
        }
    }
    var toHexString = function (number) { return '#' + ('000000' + number.toString(16)).substr(-6); };
    //var Game = (function() {
    var blockBorder = 1; //pixels
    var pocket_height = 4; //additional grid height
    var removingSpeed = 3;
    var TYPES = [
        {
            color: 0xcc8080, piece: [
                [[1, 1], [2, 1], [1, 2], [2, 2]]
            ],
        },
        {
            color: 0x80cc80, piece: [
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                [[1, 0], [1, 1], [1, 2], [1, 3]]
            ],
        },
        {
            color: 0x8080cc, piece: [
                [[0, 1], [1, 1], [1, 2], [2, 2]],
                [[2, 0], [2, 1], [1, 1], [1, 2]]
            ],
        },
        {
            color: 0xcccccc, piece: [
                [[0, 2], [1, 2], [1, 1], [2, 1]],
                [[1, 0], [1, 1], [2, 1], [2, 2]]
            ],
        },
        {
            color: 0xcccc80, piece: [
                [[0, 1], [0, 2], [1, 2], [2, 2]],
                [[2, 0], [2, 1], [2, 2], [1, 2]],
                [[2, 2], [0, 1], [1, 1], [2, 1]],
                [[1, 0], [1, 1], [1, 2], [2, 0]]
            ],
        },
        {
            color: 0xcc80cc, piece: [
                [[2, 1], [0, 2], [1, 2], [2, 2]],
                [[1, 0], [2, 0], [2, 1], [2, 2]],
                [[0, 2], [0, 1], [1, 1], [2, 1]],
                [[2, 2], [1, 0], [1, 1], [1, 2]]
            ],
        },
        {
            color: 0x80cccc, piece: [
                [[1, 1], [0, 2], [1, 2], [2, 2]],
                [[1, 1], [2, 0], [2, 1], [2, 2]],
                [[1, 2], [0, 1], [1, 1], [2, 1]],
                [[2, 1], [1, 0], [1, 1], [1, 2]]
            ],
        },
    ];
    var EMPTY_BLOCK = TYPES.length;
    var randType = function () { return ~~(Math.random() * TYPES.length); };
    var Game = /** @class */ (function () {
        function Game(canv, next_canv) {
            this.running = false;
            this.paused = false;
            this.step_timer = 0;
            this.steps_delay = 1000 / 60; //in milliseconds
            this.onGameOver = null;
            this.next_type_rot = 0;
            this.placed_blocks = 0;
            this.currentType = 0;
            this.currentRot = 0;
            this.currentPos = [0, 0];
            this.ctx = canv.getContext('2d', { antialias: true });
            this.next_ctx = next_canv.getContext('2d', { antialias: true });
            this.width = canv.width;
            this.height = canv.height;
            this.w = 10;
            this.h = 20;
            this.linesToClear = [];
            this.removingEffectValue = 0;
            this.previewCoords = [];
            this.ww = this.width / this.w;
            this.hh = this.height / this.h;
            this.h += pocket_height;
            this.next_type = randType();
            this.drawNext();
            this.actions = { left: false, right: false, turn: false, skip: false,
                single_left: false, single_right: false };
            this.grid = new Array(this.h);
            for (var i = 0; i < this.grid.length; i++)
                this.grid[i] = new Uint8Array(this.w).map(randType);
            this.draw();
        }
        Game.prototype.forEachBlockInMove = function (func, reverseHorizontally) {
            if (reverseHorizontally === void 0) { reverseHorizontally = false; }
            for (var y = this.grid.length - 1; y >= 0; y--) {
                if (reverseHorizontally) {
                    for (var x = this.grid[y].length - 1; x >= 0; x--) {
                        if (this.grid[y][x] & 0x80) //block in move
                            func.call(this, x, y);
                    }
                }
                else {
                    for (var x = 0; x < this.grid[y].length; x++) {
                        if (this.grid[y][x] & 0x80) //block in move
                            func.call(this, x, y);
                    }
                }
            }
        };
        Game.prototype.run = function () {
            if (this.running)
                return;
            this.steps_delay = 250; //starting delay
            this.placed_blocks = 0;
            console.log('Starting game');
            levelInfo.innerHTML = 'Level<br>1';
            linesInfo.innerHTML = 'Lines<br>0';
            pause_btn.innerHTML = 'PAUSE';
            this.running = true;
            for (var i in this.actions)
                this.actions[i] = false;
            for (var y = 0; y < this.grid.length; y++) {
                for (var x = 0; x < this.grid[y].length; x++)
                    this.grid[y][x] = EMPTY_BLOCK; //blank grid
            }
            this.pushNextPiece();
            this.draw();
        };
        Game.prototype.onCollision = function () {
            var _this = this;
            if (!this.running)
                return;
            this.forEachBlockInMove(function (x, y) {
                _this.grid[y][x] &= 0x7F;
                if (y < pocket_height && _this.running) {
                    console.log('game over');
                    if (typeof _this.onGameOver === 'function')
                        _this.onGameOver();
                    _this.running = false;
                }
            });
            if (this.running) { //checking lines
                for (var y = this.grid.length - 1; y >= 0; y--) {
                    var filled_line = true;
                    for (var x = 0; x < this.grid[y].length; x++) {
                        if ((this.grid[y][x] & 0x7F) == EMPTY_BLOCK)
                            filled_line = false;
                    }
                    if (filled_line) {
                        this.removingEffectValue = 0;
                        this.linesToClear.push(y);
                        linesInfo.innerHTML = 'Lines<br>' +
                            ((~~linesInfo.innerHTML.replace(/Lines<br>/ig, '')) + 1);
                    }
                }
                this.pushNextPiece();
            }
        };
        Game.prototype.canMove = function (dirX, dirY, apply) {
            var _this = this;
            if (apply === void 0) { apply = false; }
            if (dirY < 0)
                return false; //cannot move up
            var result = true;
            this.forEachBlockInMove(function (x, y) {
                if (y + dirY >= _this.grid.length ||
                    _this.grid[y + dirY][x + dirX] < TYPES.length ||
                    x + dirX < 0 || x + dirX >= _this.w) {
                    result = false;
                }
            });
            if (result && apply) {
                if (dirX <= 0) { //falling down or left
                    this.forEachBlockInMove(function (x, y) {
                        _this.grid[y + dirY][x + dirX] = _this.grid[y][x];
                        _this.grid[y][x] = EMPTY_BLOCK;
                    });
                }
                else { //right
                    this.forEachBlockInMove(function (x, y) {
                        _this.grid[y + dirY][x + dirX] = _this.grid[y][x];
                        _this.grid[y][x] = EMPTY_BLOCK;
                    }, true);
                }
                this.currentPos[0] += dirX;
                this.currentPos[1] += dirY;
            }
            return result;
        };
        Game.prototype.tryTurn = function () {
            var _this = this;
            var nextRot = this.currentRot == 0 ? TYPES[this.currentType].piece.length - 1 : this.currentRot - 1;
            var canBeRotated = true;
            for (var _i = 0, _a = TYPES[this.currentType].piece[nextRot]; _i < _a.length; _i++) {
                var coord = _a[_i];
                var xxx = this.currentPos[0] + coord[0];
                var yyy = this.currentPos[1] + coord[1];
                if (xxx >= 0 && xxx < this.w && yyy >= 0 && yyy < this.grid.length) {
                    if (this.grid[yyy][xxx] < TYPES.length && !(this.grid[yyy][xxx] & 0x80)) {
                        canBeRotated = false;
                    }
                }
                else
                    canBeRotated = false;
            }
            if (canBeRotated) {
                //removing current falling blocks
                this.forEachBlockInMove(function (x, y) {
                    _this.grid[y][x] = EMPTY_BLOCK;
                });
                //placing new blocks in rotated order
                this.currentRot = nextRot;
                for (var _b = 0, _c = TYPES[this.currentType].piece[this.currentRot]; _b < _c.length; _b++) {
                    var coord = _c[_b];
                    var xxx = this.currentPos[0] + coord[0];
                    var yyy = this.currentPos[1] + coord[1];
                    this.grid[yyy][xxx] = this.currentType | 0x80;
                }
            }
        };
        Game.prototype.update = function (delta) {
            if (this.paused)
                return;
            if (this.linesToClear.length) { //line removing effect
                if ((this.removingEffectValue += delta / 1000.0 * removingSpeed) >= 1.0) {
                    for (var y = this.grid.length - 1; y >= 0; y--) {
                        var how_many_lines = 0;
                        for (var i in this.linesToClear) {
                            if (this.linesToClear[i] > y)
                                how_many_lines++;
                        }
                        if (how_many_lines) {
                            for (var x = 0; x < this.grid[y].length; x++) {
                                this.grid[y + how_many_lines][x] = this.grid[y][x];
                                this.grid[y][x] = EMPTY_BLOCK;
                            }
                        }
                    }
                    this.linesToClear = [];
                    this.removingEffectValue = 0;
                }
                else
                    this.draw();
                return;
            }
            this.step_timer += Math.min(delta, this.steps_delay);
            if (this.step_timer > this.steps_delay) {
                this.step_timer -= this.steps_delay;
                if (this.actions.turn) {
                    this.tryTurn();
                    this.actions.turn = false;
                }
                var once = true, locked = false;
                do {
                    if (this.actions.left || this.actions.single_left) {
                        this.actions.single_left = false;
                        this.canMove(-1, 0, true);
                    }
                    if (this.actions.right || this.actions.single_right) {
                        this.actions.single_right = false;
                        this.canMove(1, 0, true);
                    }
                    if (!once)
                        break;
                    else
                        once = false;
                    //falling down
                    do {
                        if (!this.canMove(0, 1, true)) {
                            this.onCollision();
                            locked = true;
                            break;
                        }
                    } while (this.actions.skip);
                    this.actions.skip = false;
                } while (locked);
                //calculating preview blocks
                this.previewCoords = [];
                for (var _i = 0, _a = TYPES[this.currentType].piece[this.currentRot]; _i < _a.length; _i++) {
                    var coord = _a[_i];
                    this.previewCoords.push([
                        coord[0] + this.currentPos[0],
                        coord[1] + this.currentPos[1] - pocket_height
                    ]);
                }
                //moving preview blocks to the bottom
                var moveY = 0;
                var good = true;
                while (good) {
                    for (var _b = 0, _c = this.previewCoords; _b < _c.length; _b++) {
                        var coord = _c[_b];
                        //console.log(coord[1]+moveY+2);
                        if (coord[1] + moveY + 2 >= this.h - 1 || coord[1] + moveY + 3 < 0)
                            good = false;
                        else if (this.grid[coord[1] + moveY + 3][coord[0]] < TYPES.length)
                            good = false;
                    }
                    moveY++;
                    if (!good)
                        break;
                }
                for (var i in this.previewCoords)
                    this.previewCoords[i][1] += moveY - pocket_height + 1;
            }
            this.draw();
        };
        Game.prototype._drawBlock = function (x, y, type) {
            if (type & 0x80) //drawing moving block
                y += this.step_timer / this.steps_delay - 1;
            type &= 0x7F;
            if (type >= TYPES.length)
                return;
            if (TYPES[type] === undefined)
                console.error(type, x, y);
            y -= pocket_height;
            if (this.linesToClear.length) {
                var lines_factor = 0, scale_factor = 0;
                for (var i in this.linesToClear) {
                    if (this.linesToClear[i] > y + pocket_height)
                        lines_factor++;
                    if (this.linesToClear[i] === y + pocket_height) //updated 01.10
                        scale_factor++;
                }
                y += this.removingEffectValue * lines_factor;
                this.ctx.globalAlpha = 1 - (this.removingEffectValue * scale_factor);
            }
            else
                this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = toHexString(TYPES[type].color);
            this.ctx.fillRect(this.ww * x, this.hh * y, this.ww, this.hh);
            this.ctx.fillStyle = toHexString(TYPES[type].color - 0x202020);
            this.ctx.fillRect(this.ww * x + blockBorder, this.hh * y + blockBorder, this.ww - blockBorder * 2, this.hh - blockBorder * 2);
        };
        Game.prototype.draw = function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
            for (var y = this.grid.length - 1; y >= 0; y--) {
                for (var x = 0; x < this.grid[y].length; x++)
                    this._drawBlock(x, y, this.grid[y][x]);
            }
            //drawing preview
            for (var _i = 0, _a = this.previewCoords; _i < _a.length; _i++) {
                var coord = _a[_i];
                this.ctx.globalAlpha = 0.5;
                if (this.currentType === undefined)
                    break;
                this.ctx.fillStyle = toHexString(TYPES[this.currentType].color);
                this.ctx.fillRect(this.ww * coord[0], this.hh * coord[1], this.ww, this.hh);
                this.ctx.fillStyle = toHexString(TYPES[this.currentType].color - 0x202020);
                this.ctx.fillRect(this.ww * coord[0] + blockBorder, this.hh * coord[1] + blockBorder, this.ww - blockBorder * 2, this.hh - blockBorder * 2);
                this.ctx.globalAlpha = 1;
            }
        };
        Game.prototype.drawNext = function () {
            this.next_ctx.clearRect(0, 0, this.next_ctx.canvas.width, this.next_ctx.canvas.height);
            var minX = 3, maxX = 0;
            var minY = 3, maxY = 0;
            TYPES[this.next_type].piece[this.next_type_rot].forEach(function (p) {
                minX = Math.min(minX, p[0]);
                maxX = Math.max(maxX, p[0]);
                minY = Math.min(minY, p[1]);
                maxY = Math.max(maxY, p[1]);
            });
            var offX = 0, offY = 0;
            if (maxX - minX == 2)
                offX += 0.5;
            if (maxY - minY == 2)
                offY += 0.5;
            var scale = this.next_ctx.canvas.width / 4;
            for (var _i = 0, _a = TYPES[this.next_type].piece[this.next_type_rot]; _i < _a.length; _i++) {
                var coord = _a[_i];
                this.next_ctx.fillStyle = toHexString(TYPES[this.next_type].color);
                this.next_ctx.fillRect(scale * (coord[0] + offX), scale * (coord[1] + offY), scale, scale);
                this.next_ctx.fillStyle = toHexString(TYPES[this.next_type].color - 0x202020);
                this.next_ctx.fillRect(scale * (coord[0] + offX) + blockBorder, scale * (coord[1] + offY) + blockBorder, scale - blockBorder * 2, scale - blockBorder * 2);
            }
        };
        Game.prototype.pushNextPiece = function () {
            var x_center = this.w / 2 - 2;
            var y_top = 0;
            for (var _i = 0, _a = TYPES[this.next_type].piece[this.next_type_rot]; _i < _a.length; _i++) {
                var coord = _a[_i];
                this.grid[y_top + coord[1]][x_center + coord[0]] = this.next_type | 0x80;
            }
            this.placed_blocks++;
            if (this.placed_blocks >= 20) { //next level
                levelInfo.innerHTML = 'Level<br>' +
                    ((~~levelInfo.innerHTML.replace(/Level<br>/ig, '')) + 1);
                this.placed_blocks = 0;
                //speeding up game
                this.steps_delay *= 0.75;
            }
            //saving new block state
            this.currentType = this.next_type;
            this.currentRot = this.next_type_rot;
            this.currentPos = [x_center, y_top];
            //generate random next piece type
            this.next_type = randType();
            this.next_type_rot = ~~(Math.random() * TYPES[this.next_type].piece.length);
            this.drawNext();
        };
        Game.prototype.switchPause = function () {
            this.paused = !this.paused;
        };
        return Game;
    }());
    var game = new Game(canvas, next_preview);
    game.onGameOver = function () {
        top_handle.innerText = "GAME OVER";
        top_handle.style.textAlign = 'center';
        top_handle.appendChild(exitBtn);
    };
    var keyEvent = function (event, pressed) {
        var code = event.keyCode;
        if (code == 65 || code == 37) {
            game.actions.left = pressed;
            if (pressed)
                game.actions.single_left = true;
        }
        if (code == 68 || code == 39) {
            game.actions.right = pressed;
            if (pressed)
                game.actions.single_right = true;
        }
        if ((code == 87 || code == 38) && pressed)
            game.actions.turn = pressed;
        if ((code == 32 || code == 13) && pressed)
            game.actions.skip = pressed;
        if (code >= 37 && code <= 40) //arrow keys
            event.preventDefault();
    };
    var onkeydown = function (e) { return keyEvent(e, true); };
    var onkeyup = function (e) { return keyEvent(e, false); };
    var onGameBtnClick = function () {
        if (game_btn.innerHTML === 'START') {
            top_handle.innerText = '';
            top_handle.appendChild(exitBtn);
            game.run();
            game_btn.blur();
        }
    };
    game_btn.addEventListener('click', onGameBtnClick, false);
    var pauseBtnClick = function () {
        if (game.running) {
            game.switchPause();
            pause_btn.innerText = game.paused ? "RESUME" : "PAUSE";
            pause_btn.blur();
        }
    };
    pause_btn.addEventListener('click', pauseBtnClick, false);
    var last = 0, dt;
    var update = function (time) {
        dt = time - last;
        last = time;
        updateDragEffect();
        if (game.running)
            game.update(dt);
        if (RUNNING) {
            //@ts-ignore
            requestAnimFrame(update);
        }
        else { //closing 
            game = null;
        }
    };
    update(0);
    var onMouseUp = function () { return grab_pos = null; };
    var onGrab = function (e) { return grabEvent(e); };
    var onKeyDown = function (e) { return onkeydown(e); };
    var onKeyUp = function (e) { return onkeyup(e); };
    var onExitBtnClick = function () {
        box.remove();
        RUNNING = false;
        exitBtn.removeEventListener('click', onExitBtnClick, false);
        top_handle.removeEventListener('mousedown', onTopHandleMousedown, false);
        game_btn.removeEventListener('click', onGameBtnClick, false);
        pause_btn.removeEventListener('click', pauseBtnClick, false);
        document.body.removeEventListener('mouseup', onMouseUp, false);
        document.body.removeEventListener('mousemove', onGrab, false);
        document.body.removeEventListener('keydown', onKeyDown, false);
        document.body.removeEventListener('keyup', onKeyUp, false);
    };
    exitBtn.addEventListener('click', onExitBtnClick, false);
    var appendChild = function () {
        if (document.body) {
            document.body.addEventListener('mouseup', onMouseUp, false);
            document.body.addEventListener('mousemove', onGrab, false);
            document.body.addEventListener('keydown', onKeyDown, false);
            document.body.addEventListener('keyup', onKeyUp, false);
            document.body.appendChild(box);
        }
        else
            setTimeout(appendChild, 100);
    };
    appendChild();
})();
