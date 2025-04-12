
cc.Class({
    extends: cc.Component,

    properties: {
        node_click: {
            default: null,
            type: cc.Node
        },
        audio_move: {
            default: null,
            type: cc.AudioClip
        },
        audio_win: {
            default: null,
            type: cc.AudioClip
        },
    },

    onLoad() {
        this.setTouch()
    },

    init: function (_blockType, _blockNum) {
        this.blockType = _blockType//块的类型
        this.blockNum = _blockNum//第几个块，如果blockNum == 0，第一个块，英雄块
        this.xx = this.getPosArr().x
        this.yy = this.getPosArr().y
        this.node_click.active = false
        this.node_click.width = this.node.width
        this.node_click.height = this.node.height
    },

    //刷新block的二维数组角标
    refreshArr: function () {
        this.xx = this.getPosArr().x
        this.yy = this.getPosArr().y
    },

    setTouch: function () {
        this.node.on('touchstart', function (event) {
            // cc.log('touchstart')
            this.posBlock = this.node.getPosition()
            this.getPosBlock()
            this.node_click.active = true
        }, this);
        this.node.on('touchmove', function (event) {
            var posMove = event.getDelta()
            if (this.blockType == '1_2' || this.blockType == '1_3') {//只能上下移动
                if (this.posBlock.y + posMove.y < this.posBlockMin.y - 8) return
                if (this.posBlock.y + posMove.y > this.posBlockMax.y + 8) return
                this.posBlock = cc.v2(this.posBlock.x, this.posBlock.y + posMove.y)
            } else {//只能左右移动
                if (this.posBlock.x + posMove.x < this.posBlockMin.x - 8) return
                if (this.blockNum == 0) {//英雄块
                    if (this.getBlockPos(cc.v2(4, 4)).x == this.posBlockMax.x) {
                        this.posBlock = cc.v2(this.posBlock.x + posMove.x, this.posBlock.y)
                        this.node.setPosition(this.posBlock)
                        return
                    }
                }
                if (this.posBlock.x + posMove.x > this.posBlockMax.x + 8) return
                this.posBlock = cc.v2(this.posBlock.x + posMove.x, this.posBlock.y)
            }
            this.node.setPosition(this.posBlock)
            //cc.log('touchmove')
        }, this);
        this.node.on('touchend', function (event) {
            // cc.log('touchend')
            this.touchEnd()
        }, this);
        this.node.on('touchcancel', function (event) {
            // cc.log('touchcancel')
            this.touchEnd()
        }, this);
    },

    //手离开手机屏幕的时候触发的方法
    touchEnd: function () {
        if (game.canEffect) {
            cc.audioEngine.play(this.audio_move, false, 1);
        }
        if (this.blockNum == 0) {
            if (this.pdGameOver()) {
                var act_1 = cc.moveBy(0.3, cc.v2(300, 0))
                var act_2 = cc.callFunc(function () {
                    game.gameOver()
                }, this)
                var end = cc.sequence(act_1, act_2)
                this.node.runAction(end)
                if (game.canEffect) {
                    cc.audioEngine.play(this.audio_win, false, 1);
                }
                return
            }
        }
        this.xx = this.getPosArr().x
        this.yy = this.getPosArr().y
        this.setBlockPos(cc.v2(this.xx, this.yy))
        game.getArrBlock()
        this.node_click.active = false
    },

    //判断是否游戏结束
    pdGameOver: function () {
        var posHero = this.node.getPosition()
        var posMax = this.getBlockPos(cc.v2(4, 4))
        if (posHero.x >= posMax.x) {//闯关成功
            cc.log('闯关成功')
            return true
        }
        return false
    },

    //得到所选块能移动的最小和最大位置
    getPosBlock: function () {
        var posMin = cc.v2(this.xx, this.yy)
        var posMax = cc.v2(this.xx, this.yy)
        // cc.log('min_x:' + posMin.x + ' min_y:' + posMin.y)
        // cc.log('max_x:' + posMax.x + ' max_y:' + posMax.y)

        if (this.blockType == '1_2' || this.blockType == '1_3') {
            for (let i = 1; i < 10; i++) {
                if (this.yy - i >= 0 && game.arrBlock[this.yy - i][this.xx] == 0) {
                    posMin = cc.v2(this.xx, this.yy - i)
                } else {
                    break
                }
            }
            var i_num = 1
            if (this.blockType == '1_2') {
                i_num = 1
            } else {
                i_num = 2
            }
            for (let i = 1; i < 10; i++) {
                if (this.yy + i_num + i < 6 && game.arrBlock[this.yy + i_num + i][this.xx] == 0) {
                    posMax = cc.v2(this.xx, this.yy + i_num + i - i_num)
                } else {
                    break
                }
            }
        } else {
            for (let i = 1; i < 10; i++) {
                if (this.xx - i >= 0 && game.arrBlock[this.yy][this.xx - i] == 0) {
                    posMin = cc.v2(this.xx - i, this.yy)
                } else {
                    break
                }
            }
            var i_num = 1
            if (this.blockType == '2_1') {
                i_num = 1
            } else {
                i_num = 2
            }
            for (let i = 1; i < 10; i++) {
                if (this.xx + i_num + i < 6 && game.arrBlock[this.yy][this.xx + i_num + i] == 0) {
                    posMax = cc.v2(this.xx + i_num + i - i_num, this.yy)
                } else {
                    break
                }
            }
        }
        this.posBlockMin = this.getBlockPos(posMin)
        this.posBlockMax = this.getBlockPos(posMax)
        //cc.log('min_x:'+posMin.x+' min_y:'+posMin.y)
        // cc.log('posBlockMax_x:' + this.posBlockMax.x + ' posBlockMax_y:' + this.posBlockMax.y)
    },

    //得到block块的二维数据角标
    getPosArr: function () {
        this.posBlock = this.node.getPosition()
        var posZXJ = this.getPosZuoXiaJIao(this.posBlock)
        var xx = Math.floor(posZXJ.x / (game.block_WH + game.f_jiange))
        var yy = Math.floor(posZXJ.y / (game.block_WH + game.f_jiange))
        var pos_1 = cc.v2(xx, yy)
        var pos_2 = cc.v2(xx, yy)
        if (this.blockType == '1_2' || this.blockType == '1_3') {
            pos_2.y = pos_1.y + 1
            var y_max = 0
            if (this.blockType == '1_2') {
                y_max = 4
            } else {
                y_max = 3
            }
            if (pos_1.y > y_max) {
                pos_1.y = y_max
            }
            if (pos_2.y > y_max) {
                pos_2.y = y_max
            }
            if (pos_1.y < 0) {
                pos_1.y = 0
            }
            if (pos_2.y < 0) {
                pos_2.y = 0
            }
            var pos_11 = this.getBlockPos(pos_1)
            var pos_22 = this.getBlockPos(pos_2)
            var f_11 = Math.abs(pos_11.y - this.posBlock.y)
            var f_22 = Math.abs(pos_22.y - this.posBlock.y)
            if (f_11 > f_22) {
                pos_1.x = pos_2.x
                pos_1.y = pos_2.y
            }
        } else {
            pos_2.x = pos_1.x + 1
            var x_max = 0
            if (this.blockType == '2_1') {
                x_max = 4
            } else {
                x_max = 3
            }
            if (pos_1.x > x_max) {
                pos_1.x = x_max
            }
            if (pos_2.x > x_max) {
                pos_2.x = x_max
            }
            if (pos_1.x < 0) {
                pos_1.x = 0
            }
            if (pos_2.x < 0) {
                pos_2.x = 0
            }
            var pos_11 = this.getBlockPos(pos_1)
            var pos_22 = this.getBlockPos(pos_2)
            var f_11 = Math.abs(pos_11.x - this.posBlock.x)
            var f_22 = Math.abs(pos_22.x - this.posBlock.x)
            if (f_11 > f_22) {
                pos_1.x = pos_2.x
                pos_1.y = pos_2.y
            }
        }
        return pos_1
    },

    //通过二维数组坐标，设置block块在父节点的位置
    setBlockPos: function (arr_pos) {
        var posBegin = cc.v2(game.blockParent.width / 2, game.blockParent.width / 2)
        var pos = cc.v2(arr_pos.x * (game.block_WH + game.f_jiange) - posBegin.x + game.f_jiange, arr_pos.y * (game.block_WH + game.f_jiange) - posBegin.y + game.f_jiange)
        this.node.setPosition(pos)
        // cc.log('xx:' + arr_pos.x + ' yy:' + arr_pos.y + ' pos.x:' + pos.x + ' pos.y:' + pos.y)
    },

    //通过二维数组坐标，返回在父节点的位置坐标
    getBlockPos: function (arr_pos) {
        var posBegin = cc.v2(game.blockParent.width / 2, game.blockParent.width / 2)
        var pos = cc.v2(arr_pos.x * (game.block_WH + game.f_jiange) - posBegin.x + game.f_jiange, arr_pos.y * (game.block_WH + game.f_jiange) - posBegin.y + game.f_jiange)
        return pos
    },

    //转化坐标（从父节点到左下角为基准点）
    getPosZuoXiaJIao: function (posParent) {
        var posBegin = cc.v2(game.blockParent.width / 2 + game.f_jiange, game.blockParent.width / 2 + game.f_jiange)
        var posZXJ = cc.v2(posBegin.x + posParent.x, posBegin.y + posParent.y)
        return posZXJ
    },

    update(dt) { },
});
