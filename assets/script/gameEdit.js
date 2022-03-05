
cc.Class({
    extends: cc.Component,

    properties: {
        blockParent: {
            default: null,
            type: cc.Node
        },
        pre_block: {
            default: null,
            type: cc.Prefab
        },
        spf_block: {
            default: [],
            type: [cc.SpriteFrame]
        }
    },


    onLoad() {

    },

    btnClick: function (sender, str) {
        cc.log(str)
        if (str == '1_2' || str == '1_3' || str == '2_1' || str == '3_1') {
            this.addBlock(str)
        } else if (str == 'logArr') {
            this.logArr()
        } else if (str == 'cleanBlocks') {
            var children = this.blockParent.children

            for (let i = children.length - 1; i >= 0; i--) {
                var js_block = children[i].getComponent('block')
                if (js_block) {
                    children[i].removeFromParent()
                }
            }
        }
    },

    addBlock: function (str) {
        var node = cc.instantiate(this.pre_block)
        node.parent = this.blockParent
        var js_node = node.getComponent('block')
        js_node.init(str)
        if (str == '1_2') {
            node.width = 108
            node.height = 220
            node.getComponent(cc.Sprite).spriteFrame = this.spf_block[0]

        } else if (str == '1_3') {
            node.width = 108
            node.height = 332
            node.getComponent(cc.Sprite).spriteFrame = this.spf_block[1]
        } else if (str == '2_1') {
            node.width = 220
            node.height = 108
            node.getComponent(cc.Sprite).spriteFrame = this.spf_block[2]
        } else if (str == '3_1') {
            node.width = 332
            node.height = 108
            node.getComponent(cc.Sprite).spriteFrame = this.spf_block[3]
        }

    },

    logArr: function () {
        var arr_pos = []
        var arr_blockType = []
        var children = this.blockParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                arr_blockType.push(js_block.blockType)
                arr_pos.push('cc.v2(' + js_block.xx + ',' + js_block.yy + ')')
            }
        }
        cc.log(arr_blockType)
        cc.log(arr_pos.toString())
    }

    // update (dt) {},
});
