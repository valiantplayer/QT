cc.Class({
    extends: cc.Component,

    properties: {
        bg: {
            default: null,
            type: cc.Sprite
        },
        bg_1: {
            default: [],
            type: [cc.SpriteFrame]
        },
        node_arr: {
            default: [],
            type: [cc.Node]
        },
        node_shuiBoWen: {//水波纹
            default: null,
            type: cc.Node
        },
        node_fish: {//游动的鱼儿
            default: null,
            type: cc.Node
        },
        particle_arr: {
            default: [],
            type: [cc.ParticleSystem]
        },
        autio_shui: {
            default: null,
            type: cc.AudioClip
        }


    },

    onLoad() {


        window.common = this
        this.playShuiBoWen()
        this.playFish()

        this.timeShuiBoWen = 0 //水波纹时间
        this.timeRandomShuiBoWen = 300 + Math.random() * 600 //5~15秒之间的随机数

        this.timeFish = 0 //鱼儿游动时间
        this.timeRandomFish = 480 + Math.random() * 800 //8~18秒之间的随机数

        this.pos_begin = cc.v2(0, 0)

        this.allParticleHide()//隐藏所有粒子特效
        this.allNodeHide()//隐藏所有场景周边
        this.node_arr[0].active = true

    },

    //数组里场景粒子特效都隐藏
    allParticleHide: function () {
        for (let i = 0; i < this.particle_arr.length; i++) {
            this.particle_arr[i].node.active = false
        }
    },

    //数组里场景周边荷叶都隐藏
    allNodeHide: function () {
        for (let i = 0; i < this.node_arr.length; i++) {
            this.node_arr[i].active = false
        }
    },

    //播放水波纹动画
    playShuiBoWen: function () {
        var x_random = Math.random() * 720 - 360
        var y_random = Math.random() * 1280 - 640
        // cc.log("x_random:",x_random)
        // cc.log("y_random:",y_random)
        //this.node_shuiBoWen.setPosition(cc.v2(x_random,y_random))
        this.node_shuiBoWen.x = x_random
        this.node_shuiBoWen.y = y_random

        this.node_shuiBoWen.getComponent(cc.Animation).play('shuiBoWen')

        if (game.canEffect) {
            cc.audioEngine.play(this.autio_shui, false, 1);
        }
    },

    //鱼儿游动
    playFish: function () {
        this.node_fish.stopAllActions()
        var children = this.node_fish.children
        for (let i = 0; i < children.length; i++) {
            children[i].active = false
        }
        var i_random = Math.floor(Math.random() * 3)
        children[i_random].active = true

        var arr_act = []
        var f_time = 5
        var i_random = Math.floor(Math.random() * 4)//0,1,2,3
        if (i_random == 0) {
            f_time = 5
            arr_act = [cc.v2(420, 568), cc.v2(-70, 345), cc.v2(-460, 650)]//5
        } else if (i_random == 1) {
            f_time = 7
            arr_act = [cc.v2(-300, 650), cc.v2(166, 46), cc.v2(-180, -828)]//7
        } else if (i_random == 2) {
            f_time = 3.5
            arr_act = [cc.v2(450, 40), cc.v2(-170, -780)]//3.5
        } else if (i_random == 3) {
            f_time = 8
            arr_act = [cc.v2(-500, -227), cc.v2(100, -747), cc.v2(300, 730)]//8
        }
        var act_1 = cc.cardinalSplineTo(f_time, arr_act, 0)
        this.node_fish.runAction(act_1)
    },

    start() {
        cc.log('start')
    },

    changeSkin: function (num) {
        this.allNodeHide()
        this.allParticleHide()

        cc.log('数组角标：' + num)
        game.chengBlocks(num)
        this.node_arr[num].active = true
        this.bg.spriteFrame = this.bg_1[num]

        if (num == 0 || num == 5) {
            return
        } else if (num == 7) {
            this.particle_arr[0].node.active = true
        }
        this.particle_arr[num].node.active = true
    },

    btnCallBack: function (sender, str) {
        this.allNodeHide()
        this.allParticleHide()
        cc.log(str)
        var num = Math.floor(Math.random() * 10)
        cc.log('数组角标：' + num)
        game.i_skin = num
        game.chengBlocks()
        this.node_arr[num].active = true
        this.bg.spriteFrame = this.bg_1[num]

        if (num == 0 || num == 5) {
            return
        } else if (num == 7) {
            this.particle_arr[0].node.active = true
        }
        this.particle_arr[num].node.active = true
    },

    update(dt) {//大概1秒执行60次 1/60 = 0.016
        this.timeShuiBoWen++
        if (this.timeShuiBoWen > this.timeRandomShuiBoWen) {
            this.timeShuiBoWen = 0
            this.timeRandomShuiBoWen = 300 + Math.random() * 600 //5~15秒之间的随机数
            this.playShuiBoWen()
        }

        this.timeFish++
        if (this.timeFish > this.timeRandomFish) {
            this.timeFish = 0
            this.timeRandomFish = 500 + Math.random() * 300 //8~13秒之间的随机数
            this.playFish()
        }

        //this.pos_end = this.node_fish.getPosition()
        this.pos_end = cc.v2(this.node_fish.x, this.node_fish.y)
        {//通过这两个点，算出角度，鱼儿旋转这个角度
            if (this.pos_begin.x != this.pos_end.x && this.pos_begin.y != this.pos_end.y) {
                var angleFish = this.getAngle(this.pos_begin, this.pos_end)
                //cc.log('鱼儿旋转角度：'+angleFish)
                this.node_fish.angle = -angleFish
            }
        }
        this.pos_begin = this.pos_end

    },

    getAngle: function (start, end) {
        var x = end.x - start.x
        var y = end.y - start.y
        var hypotenuse = Math.sqrt(x * x + y * y)

        var cos = x / hypotenuse
        var radian = Math.acos(cos)

        //求出弧度
        var angle = 180 / (Math.PI / radian)
        //用弧度算出角度
        if (y < 0) {
            angle = 0 - angle
        } else if (y == 0 && x < 0) {
            angle = 180
        }
        return 90 - angle
    },
});
