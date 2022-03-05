
cc.Class({
    extends: cc.Component,

    properties: {
        label_num: {
            default: null,
            type: cc.Label
        }
    },

    onLoad() {

    },

    init: function (num) {
        this.i_num = num
        this.label_num.string = num
    },

    clickBtn: function () {
        cc.log('选中的是第' + this.i_num + '关')
        game.playLevel(this.i_num)
    },

    start() {

    },

    // update (dt) {},
});
