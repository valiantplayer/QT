import question from "./question";
import {getUserDetails} from "./userManager";
cc.Class({
    extends: cc.Component,
    properties: {
        question: {
            default: null,
            type: cc.Prefab
        },
        nodeReady: {
            default: null,
            type: cc.Node
        },
        nodePlaying: {
            default: null,
            type: cc.Node
        },
        nodeOver: {
            default: null,
            type: cc.Node
        },
        nodeSkin: {
            default: null,
            type: cc.Node
        },
        nodeLevels: {
            default: null,
            type: cc.Node
        },
        nodeSetting: {
            default: null,
            type: cc.Node
        },
        nodeBtnPlaying: {//Playing界面的按钮节点
            default: null,
            type: cc.Node
        },
        pre_block_test: {
            default: null,
            type: cc.Prefab
        },
        blockParent: {
            default: null,
            type: cc.Node
        },
        pre_block: {
            default: null,
            type: cc.Prefab
        },
        pre_btnLevel: {
            default: null,
            type: cc.Prefab
        },
        spa_block: {
            default: [],
            type: [cc.SpriteAtlas]
        },
        spf_block: {
            default: [],
            type: [cc.SpriteFrame]
        },
        autio_btn: {
            default: null,
            type: cc.AudioClip
        },
        audio_bg: {
            default: [],
            type: [cc.AudioClip]
        }
    },
    onLoad() {
        
        this.btnStr=["101","102","103","104","105","106","107","108",
            "109","110"]
        this.fishStr=["201","202","203","204","205","206","207","208",
                "209","210","211","212","213","214","215","216","217"]
        this.canEffect = true//是否可以播放音效
        this.canMusic = true//是否可以播放音乐
        this.maxLevel = 10
        this.gameType = 0//0:gameReady 1:gamePlaying 2:gameOver
        this.timeScore = 0
        this.socreCurr = 0//当前的分数
        this.blockPool = new cc.NodePool()//block块的对象池
        window.game = this//设置全局
        this.i_skin = 0//游戏场景皮肤类型（0-9）
        this.block_skin = 1//英雄块的皮肤类型（1-24）
        this.i_level = 1//第几关的数据
        this.nodeReady.active = true
        this.nodePlaying.active = false
        this.nodeOver.active = false
        this.nodeSkin.active = false
        this.nodeLevels.active = false
        this.nodeSetting.active = false
        this.f_jiange = 2
        this.block_WH = 110
        this.initBtnPos()
        this.setBlockParent()
        //this.addBlock_test()
        for (let i = 0; i < gameData.arr_blockType[this.i_level - 1].length; i++) {
            this.addBlock(gameData.arr_blockType[this.i_level - 1][i], gameData.arr_blockPos[this.i_level - 1][i], i)
        }
        this.getArrBlock()
        this.refreshLevel()
        this.nodeSkin.active = false
        this.skinContent = this.nodeSkin.getChildByName('scrollView').getChildByName('view').getChildByName('content')
        this.skinContent.height = 1420
        this.skinContent.getChildByName('node_skin_1').active = true
        this.skinContent.getChildByName('node_skin_2').active = false
        this.xuanZhongSkin_1(0)
        this.xuanZhongSkin_2(0)

        this.levelContent = this.nodeLevels.getChildByName('pageView').getChildByName('view').getChildByName('content')
        this.addBtnLevel()
        if (this.canMusic) {
            this.audioBg = cc.audioEngine.play(this.audio_bg[0], true, 1)
        }

    },

    //刷新关卡数据的显示
    refreshLevel: function () {
        let mask=this.nodePlaying.getChildByName('mask')
        mask.getChildByName('spLevel').getChildByName('labelLevel').getComponent(cc.Label).string = this.i_level
        this.nodeOver.getChildByName('spLevel').getChildByName('labelLevel').getComponent(cc.Label).string = this.i_level - 1
    },

    //刷新分数数据的显示
    refreshScore: function () {
        var i_fen = Math.floor(this.socreCurr / 60)
        var i_miao = this.socreCurr % 60
        if (i_miao < 10) {
            i_miao = '0' + i_miao
        }
        this.nodeOver.getChildByName('currentScore').getComponent(cc.Label).string = '当前分数：' + i_fen + ':' + i_miao

        var i_bestScore = cc.sys.localStorage.getItem('i_bestScore_' + this.i_level)
        if (i_bestScore) {
            if (i_bestScore > this.socreCurr) {
                i_bestScore = this.socreCurr
                cc.sys.localStorage.setItem('i_bestScore_' + this.i_level, i_bestScore)
            }
        } else {
            i_bestScore = this.socreCurr
            cc.sys.localStorage.setItem('i_bestScore_' + this.i_level, i_bestScore)
        }

        var i_fen_best = Math.floor(i_bestScore / 60)
        var i_miao_best = i_bestScore % 60
        if (i_miao_best < 10) {
            i_miao_best = '0' + i_miao_best
        }

        this.nodeOver.getChildByName('bestScore').getComponent(cc.Label).string = '最佳分数：' + i_fen_best + ':' + i_miao_best

    },

    //游戏结束
    gameOver: function () {
        this.gameType = 2
        this.i_level++//第几关的数据
        if (this.i_level > this.maxLevel) {
            this.i_level = this.maxLevel
        }
        this.refreshLevel()
        this.nodeOver.active = true
        this.nodePlaying.active = false
        this.nodeReady.active = false
        this.refreshScore()
    },

    initArr: function () {
        this.arrBlock = []
        for (let i = 0; i < 6; i++) {
            this.arrBlock[i] = []
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                this.arrBlock[i][j] = 0
            }
        }
    },

    //所有block块在父节点的显示情况
    getArrBlock: function () {
        this.initArr()
        var children = this.blockParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                this.arrBlock[js_block.yy][js_block.xx] = 1
                if (js_block.blockType == '1_2') {
                    this.arrBlock[js_block.yy + 1][js_block.xx] = 1
                } else if (js_block.blockType == '1_3') {
                    this.arrBlock[js_block.yy + 1][js_block.xx] = 1
                    this.arrBlock[js_block.yy + 2][js_block.xx] = 1
                } else if (js_block.blockType == '2_1') {
                    this.arrBlock[js_block.yy][js_block.xx + 1] = 1
                } else if (js_block.blockType == '3_1') {
                    this.arrBlock[js_block.yy][js_block.xx + 1] = 1
                    this.arrBlock[js_block.yy][js_block.xx + 2] = 1
                }
            }
        }

        this.logArrBlock()
    },

    logArrBlock: function () {
        for (let i = 5; i >= 0; i--) {
            // cc.log(this.arrBlock[i])
        }
    },

    addBlock_test: function () {
        var pos_begin = cc.v2(-this.blockParent.width / 2, -this.blockParent.height / 2)
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                var node = cc.instantiate(this.pre_block_test)
                node.parent = this.blockParent
                node.width = this.block_WH
                node.height = this.block_WH
                node.getChildByName('labelXY').getComponent(cc.Label).string = '(' + i + ',' + j + ')'
                node.setPosition(cc.v2(pos_begin.x + this.block_WH * j + this.f_jiange * j + this.block_WH / 2 + this.f_jiange,
                    pos_begin.y + this.block_WH * i + this.f_jiange * i + this.block_WH / 2 + this.f_jiange))
            }
        }
    },

    addBtnLevel: function () {
        var i_level = 1
        var children = this.levelContent.children
        for (let i = 0; i < children.length; i++) {
            var jiange = 160
            for (let j = 0; j < 7; j++) {//有多少行
                for (let k = 0; k < 4; k++) {//有多少列
                    var btnLevel = cc.instantiate(this.pre_btnLevel)
                    btnLevel.parent = children[i]
                    //var pos_begin = cc.v2(-children[i].width/2+btnLevel.width/2+90,children[i].height/2-btnLevel.height/2)
                    var pos_begin = cc.v2(-jiange / 2 * 3, children[i].height / 2 - btnLevel.height / 2 - 20)
                    var pos_1 = cc.v2(pos_begin.x + k * jiange, pos_begin.y + j * (-140))
                    btnLevel.setPosition(pos_1)
                    var js_btnLevel = btnLevel.getComponent('btnLevel')
                    if (js_btnLevel) {
                        js_btnLevel.init(i_level)
                        i_level++
                    }
                }
            }
        }
    },

    //改变block块的皮肤
    chengBlocks: function (num) {
        this.i_skin = num
        var children = this.blockParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                if (js_block.blockType == '1_2') {
                    children[i].getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x2_nor')
                    children[i].getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x2_click')
                } if (js_block.blockType == '1_3') {
                    children[i].getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x3_nor')
                    children[i].getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x3_click')
                } if (js_block.blockType == '2_1') {
                    if (js_block.blockNum == 0) {
                        children[i].getComponent(cc.Sprite).spriteFrame = this.spf_block[this.block_skin]
                        continue
                    }
                    children[i].getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('2x1_nor')
                    children[i].getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('2x1_click')
                } if (js_block.blockType == '3_1') {
                    children[i].getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('3x1_nor')
                    children[i].getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('3x1_click')
                }
            }
        }
    },

    chengBlockHero: function (num) {
        this.block_skin = num
        var children = this.blockParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                if (js_block.blockType == '2_1') {
                    if (js_block.blockNum == 0) {
                        children[i].getComponent(cc.Sprite).spriteFrame = this.spf_block[this.block_skin]
                        return
                    }
                }
            }
        }
    },

    //回收Block块到对象池
    onBlockKilled: function (block) {
        this.blockPool.put(block)
    },

    //添加block块
    addBlock: function (str_blockType, pos_block, i_block) {
        var node = null
        if (this.blockPool.size() > 0) {
            node = this.blockPool.get()
        } else {
            node = cc.instantiate(this.pre_block)
        }

        node.parent = this.blockParent
        var posParent = cc.v2(pos_block.x * (this.block_WH + this.f_jiange), pos_block.y * (this.block_WH + this.f_jiange))
        node.setPosition(this.getPosZXJ(posParent))
        var js_node = node.getComponent('block')
        js_node.init(str_blockType, i_block)
        if (str_blockType == '1_2') {
            node.width = 108
            node.height = 220
            node.getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x2_nor')
            node.getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x2_click')

        } else if (str_blockType == '1_3') {
            node.width = 108
            node.height = 332
            node.getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x3_nor')
            node.getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('1x3_click')
        } else if (str_blockType == '2_1') {
            node.width = 220
            node.height = 108
            if (i_block == 0) {
                node.getComponent(cc.Sprite).spriteFrame = this.spf_block[this.block_skin]
                node.getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spf_block[0]
                return
            }
            node.getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('2x1_nor')
            node.getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('2x1_click')
        } else if (str_blockType == '3_1') {
            node.width = 332
            node.height = 108
            node.getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('3x1_nor')
            node.getChildByName('click').getComponent(cc.Sprite).spriteFrame = this.spa_block[this.i_skin].getSpriteFrame('3x1_click')
        }
    },

    //以左下角为基准点
    getPosZXJ: function (posParent) {
        var posBegin = cc.v2(-this.blockParent.width / 2 + this.f_jiange, -this.blockParent.width / 2 + this.f_jiange)
        var posZXJ = cc.v2(posBegin.x + posParent.x, posParent.y + posBegin.y)
        return posZXJ
    },

    //开始哪一个关卡
    playLevel: function (num) {
        if (num > this.maxLevel) {
            num = this.maxLevel
        }
        this.i_level = num
        this.nodeLevels.active = false
        this.nodeOver.active = false
        this.nodePlaying.active = true
        this.nodeReady.active = false

        this.gameType = 1
        this.socreCurr = 0
        this.timeScore = 0
        var children = this.blockParent.children
        for (let i = children.length - 1; i >= 0; i--) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                this.onBlockKilled(children[i])
            }
        }
        for (let i = 0; i < gameData.arr_blockType[this.i_level - 1].length; i++) {
            this.addBlock(gameData.arr_blockType[this.i_level - 1][i], gameData.arr_blockPos[this.i_level - 1][i], i)
        }
        this.getArrBlock()

        this.refreshLevel()
    },

    clickBtn: function (sender, str) {
        cc.log(str)
        if (game.canEffect) {
            cc.audioEngine.play(this.autio_btn, false, 1);
        }
        if (str == 'btnPlay_ready') {//Ready界面的play按钮
            this.nodeReady.active = false
            this.nodePlaying.active = true
            this.nodeOver.active = false
            this.gameType = 1
            this.socreCurr = 0
            this.timeScore = 0

            var children = this.blockParent.children
            for (let i = children.length - 1; i >= 0; i--) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    this.onBlockKilled(children[i])
                }
            }

            for (let i = 0; i < gameData.arr_blockType[this.i_level - 1].length; i++) {
                this.addBlock(gameData.arr_blockType[this.i_level - 1][i], gameData.arr_blockPos[this.i_level - 1][i], i)
            }
            this.getArrBlock()


        } else if (str == 'btnSkin_ready') {//Ready界面的skin按钮
            this.nodeSkin.active = true
            this.nodePlaying.active = false
            this.nodeReady.active = false
            this.nodeOver.active = false
            this.refreshSkin();
        } else if (str == 'btnSetting_ready') {//Ready界面的setting按钮
            this.nodeSetting.active = true
        } else if (str == 'btnHome_playing') {//Playing界面的home按钮
            this.nodeReady.active = true
            this.nodePlaying.active = false
        } else if (str == 'btnMenu_playing') {//Playing界面的Menu按钮
            this.actMenu('btnMenu_playing')
        } else if (str == 'btnSetting_playiny') {//playing界面的设置按钮
            this.nodeSetting.active = true
        } else if (str == 'btnMenuClose_playing') {//Playing界面的MenuClose按钮
            this.actMenu('btnMenuClose_playing')
        } else if (str == 'btnSkin_playiny') {//Playing界面的皮肤按钮
            this.nodeSkin.active = true
            this.nodePlaying.active = false
            this.nodeReady.active = false
            this.nodeOver.active = false
        } else if (str == 'btnLevels_playiny') {//Playing界面的关卡按钮
            this.nodeLevels.active = true
            this.nodeSkin.active = false
            this.nodePlaying.active = false
            this.nodeReady.active = false
            this.nodeOver.active = false
        } else if (str == 'btnMenuReplay_playing') {//playing界面的刷新
            var children = this.blockParent.children
            var i_num = 0
            for (let i = 0; i < children.length; i++) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    var pos_block_arr = gameData.arr_blockPos[this.i_level - 1][i_num]
                    i_num++
                    var posParent = cc.v2(pos_block_arr.x * (this.block_WH + this.f_jiange), pos_block_arr.y * (this.block_WH + this.f_jiange))
                    children[i].setPosition(this.getPosZXJ(posParent))
                    js_block.refreshArr()
                }
            }
            this.getArrBlock()
        } else if (str == 'btnMenuHint_playing') {//playing界面的提示
            var children = this.blockParent.children
            var i_num = 0
            for (let i = 0; i < children.length; i++) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    var pos_block_arr = gameData.arr_blockPos_TiShi[this.i_level - 1][i_num]
                    i_num++
                    var posParent = cc.v2(pos_block_arr.x * (this.block_WH + this.f_jiange), pos_block_arr.y * (this.block_WH + this.f_jiange))
                    children[i].setPosition(this.getPosZXJ(posParent))
                    js_block.refreshArr()
                }
            }
            this.getArrBlock()
        } else if (str == 'btnSkin_over') {
            this.nodeSkin.active = true
            this.nodePlaying.active = false
            this.nodeReady.active = false
            this.nodeOver.active = false
        } else if (str == 'btnLevels_over') {//over界面的关卡按钮
            this.nodeLevels.active = true
            this.nodeSkin.active = false
            this.nodePlaying.active = false
            this.nodeReady.active = false
            this.nodeOver.active = false
        } else if (str == 'btn_rePlay_over') {//over界面的刷新
            this.gameType = 1
            this.socreCurr = 0
            this.timeScore = 0
            var children = this.blockParent.children
            var i_num = 0
            this.i_level--
            this.refreshLevel()
            for (let i = 0; i < children.length; i++) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    var pos_block_arr = gameData.arr_blockPos[this.i_level - 1][i_num]
                    i_num++
                    var posParent = cc.v2(pos_block_arr.x * (this.block_WH + this.f_jiange), pos_block_arr.y * (this.block_WH + this.f_jiange))
                    children[i].setPosition(this.getPosZXJ(posParent))
                    js_block.refreshArr()
                }
            }
            this.getArrBlock()
            this.nodeOver.active = false
            this.nodePlaying.active = true
            this.nodeReady.active = false
        } else if (str == 'btn_nextPlay') {//over界面的下一关
            this.gameType = 1
            this.socreCurr = 0
            this.timeScore = 0
            var children = this.blockParent.children
            for (let i = children.length - 1; i >= 0; i--) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    this.onBlockKilled(children[i])
                }
            }
            this.nodeOver.active = false
            this.nodePlaying.active = true
            this.nodeReady.active = false

            for (let i = 0; i < gameData.arr_blockType[this.i_level - 1].length; i++) {
                this.addBlock(gameData.arr_blockType[this.i_level - 1][i], gameData.arr_blockPos[this.i_level - 1][i], i)
            }
            this.getArrBlock()
        } else if (str == 'toggle1') {//选中的是绚丽主题
            this.skinContent.height = 1420
            this.skinContent.getChildByName('node_skin_1').active = true
            this.skinContent.getChildByName('node_skin_2').active = false
            this.refreshSkin();
        } else if (str == 'toggle2') {//选中的是五彩鱼衣
            this.skinContent.height = 2400
            this.skinContent.getChildByName('node_skin_1').active = false
            this.skinContent.getChildByName('node_skin_2').active = true
            this.refreshSkin();
        } else if (str == 'btnBack_skin') {//皮肤界面的返回按钮
            this.nodeSkin.active = false
            if (this.gameType == 0) {
                this.nodeReady.active = true
            } else if (this.gameType == 1) {
                this.nodePlaying.active = true
            } else if (this.gameType == 2) {
                this.nodeOver.active = true
            }
        } else if (str == this.btnStr[0] || str == this.btnStr[1]  || str == this.btnStr[2]  || str == this.btnStr[3] || str == this.btnStr[4] 
            || str == this.btnStr[5]  || str == this.btnStr[6]  || str == this.btnStr[7]  || str ==this.btnStr[8] || str == this.btnStr[9] ) {//选中的是主题皮肤
            // unlocked_backgrounds
            // unlocked_fish_skins
            let bg_skin=getUserDetails().unlocked_backgrounds;
            for(let i=0;i<=9;i++){
                if(str == this.btnStr[i]){
                    if(bg_skin[i]){//点了某个皮肤然后是true才开始换皮
                        var i_skin = parseInt(str)
                        common.changeSkin(i_skin - 101)
                        this.xuanZhongSkin_1(i_skin - 101)
                        if (i_skin - 101 == 7) {//下雨天背景音乐
                            if (this.canMusic) {
                            cc.audioEngine.stop(this.audioBg)
                            this.audioBg = cc.audioEngine.play(this.audio_bg[2], true, 1)
                        }
                        } else if (i_skin - 101 == 3 || i_skin - 101 == 6) {//秋天背景音乐
                            if (this.canMusic) {
                            cc.audioEngine.stop(this.audioBg)
                            this.audioBg = cc.audioEngine.play(this.audio_bg[1], true, 1)
                        }
                        } else if (i_skin - 101 == 2) {//春天背景音乐
                            if (this.canMusic) {
                            cc.audioEngine.stop(this.audioBg)
                            this.audioBg = cc.audioEngine.play(this.audio_bg[3], true, 1)
                        }
                        } else if (i_skin - 101 == 4) {//冬天背景音乐
                            if (this.canMusic) {
                                cc.audioEngine.stop(this.audioBg)
                                this.audioBg = cc.audioEngine.play(this.audio_bg[4], true, 1)
                            }
                        } else {
                            if (this.canMusic) {
                                cc.audioEngine.stop(this.audioBg)
                                this.audioBg = cc.audioEngine.play(this.audio_bg[0], true, 1)
                            }
                        }
                    }else{
                        //开始答题
                        const questionNode = cc.instantiate(this.question);
                        //选中了某个皮肤
                        questionNode.getComponent(question).skinType="bg";
                        questionNode.getComponent(question).unlockSkinIndex=i;
                        this.nodeSkin.addChild(questionNode);
                    }
                }
            }
            
        } else if (str == this.fishStr[0] || str == this.fishStr[1] || str ==this.fishStr[2] || str == this.fishStr[3] || str == this.fishStr[4]
            || str == this.fishStr[5] || str == this.fishStr[6] || str == this.fishStr[7]|| str == this.fishStr[8] || str == this.fishStr[9]
            || str == this.fishStr[10] || str ==this.fishStr[11]|| str ==this.fishStr[12]|| str == this.fishStr[13] || str == this.fishStr[14]|| str ==this.fishStr[15] || str == this.fishStr[16]) {
                //选中的是鱼衣皮肤
                // unlocked_fish_skins
            let fish_skin=getUserDetails().unlocked_fish_skins;
            // let fish_skin=[false,false,false,false,false,
            //     false,false,false,false,false]
            for(let i=0;i<17;i++){
                if(str == this.fishStr[i]){
                    if(fish_skin[i]){//点了某个皮肤然后是true才开始换皮
                        var i_skin = parseInt(str)
                        this.xuanZhongSkin_2(i_skin - 201)
                        this.chengBlockHero(i_skin - 201 + 1)
                    }else{
                         //开始答题
                         const questionNode = cc.instantiate(this.question);
                         //选中了某个皮肤
                         questionNode.getComponent(question).unlockSkinIndex=i;
                         questionNode.getComponent(question).skinType="fish";
                         this.nodeSkin.addChild(questionNode);
                    }
                }
            }
            
        } else if (str == 'btnHome_level') {//关卡界面的home按钮
            this.nodeLevels.active = false
            this.nodeSkin.active = false
            this.nodePlaying.active = false
            this.nodeReady.active = true
            this.nodeOver.active = false
        } else if (str == 'btnSetting_level') {
            this.nodeSetting.active = true
        } else if (str == 'btnClose_setting') {
            this.nodeSetting.active = false
        } else if (str == 'btnMusicOff_setting') {
            this.canMusic = true
            cc.audioEngine.resume(this.audioBg)
            this.nodeSetting.getChildByName('bg').getChildByName('btnMusicOn_setting').active = true
            this.nodeSetting.getChildByName('bg').getChildByName('btnMusicOff_setting').active = false
        } else if (str == 'btnMusicOn_setting') {
            this.canMusic = false
            cc.audioEngine.pause(this.audioBg)
            this.nodeSetting.getChildByName('bg').getChildByName('btnMusicOn_setting').active = false
            this.nodeSetting.getChildByName('bg').getChildByName('btnMusicOff_setting').active = true
        } else if (str == 'btnSoundOff_setting') {
            this.canEffect = true
            this.nodeSetting.getChildByName('bg').getChildByName('btnSoundOn_setting').active = true
            this.nodeSetting.getChildByName('bg').getChildByName('btnSoundOff_setting').active = false
        } else if (str == 'btnSoundOn_setting') {
            this.canEffect = false
            this.nodeSetting.getChildByName('bg').getChildByName('btnSoundOn_setting').active = false
            this.nodeSetting.getChildByName('bg').getChildByName('btnSoundOff_setting').active = true
        }
    },

    //选中主题皮肤中的哪一个
    xuanZhongSkin_1: function (num) {
        var children = this.skinContent.getChildByName('node_skin_1').children
        for (let i = 0; i < children.length; i++) {
            if (i == num) {
                children[i].getChildByName('sp').active = true
            } else {
                children[i].getChildByName('sp').active = false
            }
        }
    },

    //选中鱼衣皮肤中的哪一个
    xuanZhongSkin_2: function (num) {
        var children = this.skinContent.getChildByName('node_skin_2').children
        for (let i = 0; i < children.length; i++) {
            if (i == num) {
                children[i].getChildByName('sp_2').active = true
                children[i].getChildByName('sp_1').active = false
            } else {
                children[i].getChildByName('sp_2').active = false
                children[i].getChildByName('sp_1').active = true
            }
        }
    },

    //初始化按钮的坐标
    initBtnPos: function () {
        var nodeMenu = this.nodeBtnPlaying.getChildByName('btnMenu_playing')
        var pos_btnMenu = cc.v2(nodeMenu.x, nodeMenu.y)
        // this.nodeBtnPlaying.getChildByName('btnHome_playing').setPosition(cc.v2(pos_btnMenu.x, pos_btnMenu.y))
        // this.nodeBtnPlaying.getChildByName('btnLevels_playiny').setPosition(cc.v2(pos_btnMenu.x, pos_btnMenu.y))
        // this.nodeBtnPlaying.getChildByName('btnSkin_playiny').setPosition(cc.v2(pos_btnMenu.x, pos_btnMenu.y))
        // this.nodeBtnPlaying.getChildByName('btnSetting_playiny').setPosition(cc.v2(pos_btnMenu.x, pos_btnMenu.y))
        this.nodeBtnPlaying.getChildByName('btnMenuClose_playing').active = false
        this.nodeBtnPlaying.getChildByName('btnMenuHint_playing').active = true
        this.nodeBtnPlaying.getChildByName('btnMenuReplay_playing').active = true
        this.nodeBtnPlaying.getChildByName('btnMenu_playing').active = true

        this.nodeBtnPlaying.getChildByName('btnHome_playing').active = false
        this.nodeBtnPlaying.getChildByName('btnLevels_playiny').active = false
        this.nodeBtnPlaying.getChildByName('btnSkin_playiny').active = false
        this.nodeBtnPlaying.getChildByName('btnSetting_playiny').active = false
    },

    actMenu: function (str) {
        var nodeMenu = this.nodeBtnPlaying.getChildByName('btnMenu_playing')
        var pos_btnMenu = cc.v2(nodeMenu.x, nodeMenu.y)
        var x_jianGe = Math.abs(nodeMenu.x) / 2 //相邻按钮直接的间隔

        if (str == 'btnMenu_playing') {
            this.nodeBtnPlaying.getChildByName('btnHome_playing').active = true
            this.nodeBtnPlaying.getChildByName('btnLevels_playiny').active = true
            this.nodeBtnPlaying.getChildByName('btnSkin_playiny').active = true
            this.nodeBtnPlaying.getChildByName('btnSetting_playiny').active = true

            this.nodeBtnPlaying.getChildByName('btnHome_playing').runAction(cc.moveTo(0.1, cc.v2(pos_btnMenu.x + x_jianGe, pos_btnMenu.y)))
            this.nodeBtnPlaying.getChildByName('btnLevels_playiny').runAction(cc.moveTo(0.14, cc.v2(pos_btnMenu.x + x_jianGe * 2, pos_btnMenu.y)))
            this.nodeBtnPlaying.getChildByName('btnSkin_playiny').runAction(cc.moveTo(0.16, cc.v2(pos_btnMenu.x + x_jianGe * 3, pos_btnMenu.y)))
            this.nodeBtnPlaying.getChildByName('btnSetting_playiny').runAction(cc.moveTo(0.17, cc.v2(pos_btnMenu.x + x_jianGe * 4, pos_btnMenu.y)))
            this.nodeBtnPlaying.getChildByName('btnMenuClose_playing').active = true

            this.nodeBtnPlaying.getChildByName('btnMenuHint_playing').active = false
            this.nodeBtnPlaying.getChildByName('btnMenuReplay_playing').active = false
            nodeMenu.active = false
        } else if (str == 'btnMenuClose_playing') {

            this.nodeBtnPlaying.getChildByName('btnMenuClose_playing').active = false
            nodeMenu.active = true
            var act_1 = cc.moveTo(0.1, cc.v2(pos_btnMenu.x, pos_btnMenu.y))
            var act_2 = cc.callFunc(function () {
                this.nodeBtnPlaying.getChildByName('btnHome_playing').active = false
            }.bind(this))

            var act_3 = cc.moveTo(0.14, cc.v2(pos_btnMenu.x, pos_btnMenu.y))
            var act_4 = cc.callFunc(function () {
                this.nodeBtnPlaying.getChildByName('btnLevels_playiny').active = false
            }.bind(this))

            var act_5 = cc.moveTo(0.16, cc.v2(pos_btnMenu.x, pos_btnMenu.y))
            var act_6 = cc.callFunc(function () {
                this.nodeBtnPlaying.getChildByName('btnSkin_playiny').active = false
            }.bind(this))

            var act_7 = cc.moveTo(0.17, cc.v2(pos_btnMenu.x, pos_btnMenu.y))
            var act_8 = cc.callFunc(function () {
                this.nodeBtnPlaying.getChildByName('btnSetting_playiny').active = false
                this.nodeBtnPlaying.getChildByName('btnMenuHint_playing').active = true
                this.nodeBtnPlaying.getChildByName('btnMenuReplay_playing').active = true
            }.bind(this))

            this.nodeBtnPlaying.getChildByName('btnHome_playing').runAction(cc.sequence(act_1, act_2))
            this.nodeBtnPlaying.getChildByName('btnLevels_playiny').runAction(cc.sequence(act_3, act_4))
            this.nodeBtnPlaying.getChildByName('btnSkin_playiny').runAction(cc.sequence(act_5, act_6))
            this.nodeBtnPlaying.getChildByName('btnSetting_playiny').runAction(cc.sequence(act_7, act_8))
        }



    },

    setBlockParent: function () {
        this.blockParent.width = this.block_WH * 6 + this.f_jiange * 7
        this.blockParent.height = this.block_WH * 6 + this.f_jiange * 7

        // this.blockParent.scale = 0.95 * (this.FBL.width / 720)
        this.blockParent.scale = 0.95

        var i_num = 10

        var sp_shang = this.blockParent.getChildByName('sp_shang')
        sp_shang.width = this.blockParent.width + i_num
        sp_shang.y = this.blockParent.height / 2 + i_num / 2

        var sp_xia = this.blockParent.getChildByName('sp_xia')
        sp_xia.width = this.blockParent.width + i_num
        sp_xia.y = -this.blockParent.height / 2 - i_num / 2

        var sp_zuo = this.blockParent.getChildByName('sp_zuo')
        sp_zuo.height = this.blockParent.height + i_num
        sp_zuo.x = -this.blockParent.width / 2 - i_num / 2

        var sp_you_shang = this.blockParent.getChildByName('sp_you_shang')
        sp_you_shang.height = this.block_WH * 2 + this.f_jiange * 2
        sp_you_shang.x = this.blockParent.width / 2 + i_num / 2
        sp_you_shang.y = this.blockParent.height / 2 + i_num / 2

        var sp_you_xia = this.blockParent.getChildByName('sp_you_xia')
        sp_you_xia.height = this.block_WH * 3 + this.f_jiange * 3
        sp_you_xia.x = this.blockParent.width / 2 + i_num / 2
        sp_you_xia.y = -this.blockParent.height / 2 - i_num / 2

        var sp_you_shang_1 = this.blockParent.getChildByName('sp_you_shang_1')
        sp_you_shang_1.width = this.block_WH * 2 + this.f_jiange * 2
        sp_you_shang_1.x = this.blockParent.width / 2 + i_num / 2
        sp_you_shang_1.y = sp_you_shang.y - sp_you_shang.height

        var sp_you_xia_1 = this.blockParent.getChildByName('sp_you_xia_1')
        sp_you_xia_1.width = this.block_WH * 2 + this.f_jiange * 2
        sp_you_xia_1.x = this.blockParent.width / 2 + i_num / 2
        sp_you_xia_1.y = sp_you_xia.y + sp_you_xia.height


        //------------------------------------------------------------

        var sp_shang_1 = this.blockParent.getChildByName('sp_shang_1')
        sp_shang_1.width = this.blockParent.width + i_num * 6
        sp_shang_1.y = this.blockParent.height / 2 + i_num * 3

        var sp_xia_1 = this.blockParent.getChildByName('sp_xia_1')
        sp_xia_1.width = this.blockParent.width + i_num * 6
        sp_xia_1.y = -this.blockParent.height / 2 - i_num * 3

        var sp_zuo_1 = this.blockParent.getChildByName('sp_zuo_1')
        sp_zuo_1.height = this.blockParent.height + i_num * 6
        sp_zuo_1.x = -this.blockParent.width / 2 - i_num * 3

        var sp_you_shang_11 = this.blockParent.getChildByName('sp_you_shang_11')
        sp_you_shang_11.height = this.block_WH * 2 + this.f_jiange * 2
        sp_you_shang_11.x = this.blockParent.width / 2 + i_num * 3
        sp_you_shang_11.y = this.blockParent.height / 2 + i_num * 3

        var sp_you_xia_11 = this.blockParent.getChildByName('sp_you_xia_11')
        sp_you_xia_11.height = this.block_WH * 3 + this.f_jiange * 3
        sp_you_xia_11.x = this.blockParent.width / 2 + i_num * 3
        sp_you_xia_11.y = -this.blockParent.height / 2 - i_num * 3

        var sp_you_shang_1_11 = this.blockParent.getChildByName('sp_you_shang_1_11')
        sp_you_shang_1_11.width = this.block_WH * 2 + this.f_jiange * 2
        sp_you_shang_1_11.x = this.blockParent.width / 2 + i_num * 3
        sp_you_shang_1_11.y = sp_you_shang_11.y - sp_you_shang_11.height

        var sp_you_xia_1_11 = this.blockParent.getChildByName('sp_you_xia_1_11')
        sp_you_xia_1_11.width = this.block_WH * 2 + this.f_jiange * 2
        sp_you_xia_1_11.x = this.blockParent.width / 2 + i_num * 3
        sp_you_xia_1_11.y = sp_you_xia_11.y + sp_you_xia_11.height
    },

    update(dt) {
        if (this.gameType == 1) {//游戏中
            this.timeScore++
            if (this.timeScore >= 60) {//每秒钟执行一次
                this.timeScore = 0
                this.socreCurr++
            }
        }
    },
    //刷新皮肤界面
    refreshSkin:function(){
        let bg_skin=getUserDetails().unlocked_backgrounds;
        let fish_skin=getUserDetails().unlocked_fish_skins;
            // let bg_skin=[true,false,false,false,false,
            //     false,false,false,false,false]
            // let fish_skin=[true,false,false,false,false,
            //     false,false,false,false,false,
            //     false,false,false,false,false,false,false]
            let skinBgNode=this.skinContent.getChildByName('node_skin_1').children;
            let skinFishNode=this.skinContent.getChildByName('node_skin_2').children;
            for(let i=0;i<skinBgNode.length;i++){
                if(bg_skin[i]){
                    skinBgNode[i].opacity=255;
                }else{
                    skinBgNode[i].opacity=170;
            }
            for(let i=0;i<skinFishNode.length;i++){
                if(fish_skin[i]){
                    skinFishNode[i].opacity=255;
                }else{
                    skinFishNode[i].opacity=150;
            }
            }
        }
    },
});
