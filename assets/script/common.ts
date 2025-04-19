const { ccclass, property } = cc._decorator;

import { fetchQuestions, getAllUserDetails } from "./api";

@ccclass
export default class common extends cc.Component {
  @property(cc.Sprite)
  bg: cc.Sprite = null;

  @property([cc.SpriteFrame])
  bg_1: cc.SpriteFrame[] = [];

  @property([cc.Node])
  node_arr: cc.Node[] = [];

  @property(cc.Node)
  node_shuiBoWen: cc.Node = null;

  @property(cc.Node)
  node_fish: cc.Node = null;

  @property([cc.ParticleSystem])
  particle_arr: cc.ParticleSystem[] = [];

  @property(cc.AudioClip)
  autio_shui: cc.AudioClip = null;

  timeShuiBoWen: number = 0;
  timeRandomShuiBoWen: number = 0;

  timeFish: number = 0;
  timeRandomFish: number = 0;

  pos_begin: cc.Vec2 = cc.v2(0, 0);
  pos_end: cc.Vec2 = cc.v2(0, 0);

  onLoad() {
    (window as any).common = this;
    this.playShuiBoWen();
    this.playFish();
    this.getQuestions();
    this.getUserDetail();
    this.timeRandomShuiBoWen = 300 + Math.random() * 600;
    this.timeRandomFish = 480 + Math.random() * 800;
    this.allParticleHide();
    this.allNodeHide();
    this.node_arr[0].active = true;
  }

  allParticleHide() {
    this.particle_arr.forEach(p => p.node.active = false);
  }

  allNodeHide() {
    this.node_arr.forEach(n => n.active = false);
  }

  playShuiBoWen() {
    const x_random = Math.random() * 720 - 360;
    const y_random = Math.random() * 1280 - 640;
    this.node_shuiBoWen.setPosition(cc.v2(x_random, y_random));
    this.node_shuiBoWen.getComponent(cc.Animation).play('shuiBoWen');

    if ((window as any).game?.canEffect) {
      cc.audioEngine.play(this.autio_shui, false, 1);
    }
  }

  playFish() {
    this.node_fish.stopAllActions();
    const children = this.node_fish.children;
    children.forEach(c => c.active = false);

    const fishIndex = Math.floor(Math.random() * 3);
    children[fishIndex].active = true;

    const routes: cc.Vec2[][] = [
      [cc.v2(420, 568), cc.v2(-70, 345), cc.v2(-460, 650)],
      [cc.v2(-300, 650), cc.v2(166, 46), cc.v2(-180, -828)],
      [cc.v2(450, 40), cc.v2(-170, -780)],
      [cc.v2(-500, -227), cc.v2(100, -747), cc.v2(300, 730)]
    ];

    const routeIndex = Math.floor(Math.random() * routes.length);
    const duration = [5, 7, 3.5, 8][routeIndex];
    const action = cc.cardinalSplineTo(duration, routes[routeIndex], 0);

    this.node_fish.runAction(action);
  }

  start() {
    cc.log('start');
  }

  changeSkin(num: number) {
    this.allNodeHide();
    this.allParticleHide();

    cc.log('数组角标：' + num);
    (window as any).game?.chengBlocks(num);

    this.node_arr[num].active = true;
    this.bg.spriteFrame = this.bg_1[num];

    if (num === 0 || num === 5) return;
    if (num === 7) this.particle_arr[0].node.active = true;
    this.particle_arr[num].node.active = true;
  }

  btnCallBack(sender: cc.Event, str: string) {
    this.allNodeHide();
    this.allParticleHide();

    cc.log(str);
    const num = Math.floor(Math.random() * 10);
    cc.log('数组角标：' + num);

    (window as any).game.i_skin = num;
    (window as any).game.chengBlocks();

    this.node_arr[num].active = true;
    this.bg.spriteFrame = this.bg_1[num];

    if (num === 0 || num === 5) return;
    if (num === 7) this.particle_arr[0].node.active = true;
    this.particle_arr[num].node.active = true;
  }

  update(dt: number) {
    this.timeShuiBoWen++;
    if (this.timeShuiBoWen > this.timeRandomShuiBoWen) {
      this.timeShuiBoWen = 0;
      this.timeRandomShuiBoWen = 300 + Math.random() * 600;
      this.playShuiBoWen();
    }

    this.timeFish++;
    if (this.timeFish > this.timeRandomFish) {
      this.timeFish = 0;
      this.timeRandomFish = 500 + Math.random() * 300;
      this.playFish();
    }

    this.pos_end = cc.v2(this.node_fish.x, this.node_fish.y);
    if (this.pos_begin.x !== this.pos_end.x && this.pos_begin.y !== this.pos_end.y) {
      const angleFish = this.getAngle(this.pos_begin, this.pos_end);
      this.node_fish.angle = -angleFish;
    }
    this.pos_begin = this.pos_end;
  }

  getAngle(start: cc.Vec2, end: cc.Vec2): number {
    const x = end.x - start.x;
    const y = end.y - start.y;
    const hypotenuse = Math.sqrt(x * x + y * y);
    const cos = x / hypotenuse;
    const radian = Math.acos(cos);
    let angle = 180 / (Math.PI / radian);
    if (y < 0) angle = -angle;
    else if (y === 0 && x < 0) angle = 180;
    return 90 - angle;
  }
  getQuestions(){
    fetchQuestions("English", "University");
  }
  getUserDetail(){
    getAllUserDetails();
  }
}
