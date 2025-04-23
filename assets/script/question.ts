const { ccclass, property } = cc._decorator;
import { getRandomQuestions } from "./questionManager";
import { getUserDetails } from "./userManager";
import { getAllUserDetails } from "./api";


@ccclass
export default class question extends cc.Component {
  @property(cc.Label)
  question_label: cc.Label = null;

  @property([cc.Node])
  options: cc.Node[] = [];

  @property(cc.Node)
  btn_close: cc.Node = null;

  @property(cc.Node)
  btn_back: cc.Node = null;

  @property(cc.Node)
  btn_next: cc.Node = null;

  @property(cc.Node)
  btn_submit: cc.Node = null;
  @property(cc.Node)
  toast: cc.Node = null;
  skinType="bg";
  unlockSkinIndex=0;//设置默认解锁的皮肤，默认是第一个皮肤

  private currentOptions: string[] = [];
  private correctAnswer: string = "";
  private currentIndex: number = 0;
  private questions = [];
  private userAnswers: number[] = []; // 学生选择的答案下标（-1 表示未答）

  protected onLoad(): void {
    this.questions = getRandomQuestions(5);
    this.currentIndex = 0;
    this.userAnswers = Array(this.questions.length).fill(-1);
    this.setQuestionDataFromCurrent();

    this.btn_next.on(
      cc.Node.EventType.TOUCH_END,
      () => {
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
          this.setQuestionDataFromCurrent();
        }
      },this);
    this.btn_submit.on(
        cc.Node.EventType.TOUCH_END,
        () => {
           // 最后一题，进行检查
           let allCorrect = true;
           for (let i = 0; i < this.questions.length; i++) {
             const correctLetter = this.questions[i].answer;
             const selectedIndex = this.userAnswers[i];
             if (selectedIndex === -1 || this.questions[i].options[selectedIndex].charAt(0) !== correctLetter) {
               allCorrect = false;
               this.showToast("❌ wrong answer, try again");
               break;
             }
           }
           if (allCorrect) {
            console.log("如果所有题目正确，先获取一次最新的信息");
            getAllUserDetails();      
            let user=getUserDetails();//拿到当前的用户数据
            let updated;
            let field;
            if(this.skinType=="fish"){
                updated = [...user.unlocked_fish_skins];
                field="unlocked_fish_skins";
            }else if(this.skinType=="bg"){
                updated = [...user.unlocked_backgrounds];
                field="unlocked_backgrounds";
            }
            updated[this.unlockSkinIndex] = true;
             fetch("/api/update_profile", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 field: field,
                 value: updated
               })
             });
            //重新获取一次用户数据，这样就可以直接使用皮肤了
             getAllUserDetails();
             this.showToast("✅ Perfect, unlock skin!");
             //刷新当前皮肤选择的透明度
             let content= this.node.parent.getChildByName('scrollView').getChildByName('view').getChildByName('content')
             if(this.skinType=="fish"){
                let skinFishNode=content.getChildByName('node_skin_2').children;
                skinFishNode[this.unlockSkinIndex].opacity=255;
             }else if(this.skinType=="bg"){
                let skinBgNode=content.getChildByName('node_skin_1').children;
                skinBgNode[this.unlockSkinIndex].opacity=255;
            }
             this.scheduleOnce(() => {
                this.node.removeFromParent();
                this.node.destroy();
              }, 1);
           } else {
            this.showToast("❌ wrong answer, try again");
           }
        },this);
    this.btn_back.on(
      cc.Node.EventType.TOUCH_END,
      () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.setQuestionDataFromCurrent();
        }
      },
      this
    );

    this.btn_close.on(
      cc.Node.EventType.TOUCH_END,
      () => {
        this.node.removeFromParent();
        this.node.destroy();
      },
      this
    );
  }

  private setQuestionDataFromCurrent() {
    const q = this.questions[this.currentIndex];
    this.setQuestionData(q.description, q.options, q.answer);

    this.btn_back.active = this.currentIndex > 0;
    this.btn_next.active = this.currentIndex < this.questions.length - 1;
    this.btn_submit.active=this.currentIndex >= this.questions.length - 1;
  }

  public setQuestionData(description: string, options: string[], answer: string) {
    this.question_label.string = description;
    this.currentOptions = options;
    this.correctAnswer = answer;

    for (let i = 0; i < this.options.length; i++) {
      const label = this.options[i]
        .getChildByName("answer_label")
        .getComponent(cc.Label);
      if (label) {
        label.string = options[i];
      }

      this.options[i].off(cc.Node.EventType.TOUCH_END);
      this.options[i].on(
        cc.Node.EventType.TOUCH_END,
        () => this.onOptionSelected(i),
        this
      );

      const selectedIndex = this.userAnswers[this.currentIndex];
      if (selectedIndex === i) {
        const isCorrect = options[i].charAt(0) === answer;
        this.options[i].color = isCorrect ? cc.Color.GREEN : cc.Color.BLACK;
      } else {
        this.options[i].color = cc.Color.WHITE;
      }
    }
  }

  private onOptionSelected(index: number) {
    this.userAnswers[this.currentIndex] = index;
    const isCorrect = this.currentOptions[index].charAt(0) === this.correctAnswer;

    for (let i = 0; i < this.options.length; i++) {
      if (i === index) {
        this.options[i].color = isCorrect ? cc.Color.GREEN : cc.Color.BLACK;
      } else {
        this.options[i].color = cc.Color.WHITE;
      }
    }
  }
  showToast(message: string) {
    const label = this.toast.getChildByName("label").getComponent(cc.Label);
    label.string = message;

    // 初始状态
    this.toast.opacity = 255;
    this.toast.setPosition(0, -200); // 

    cc.tween(this.toast)
      .to(0.5, { position: cc.v3(0, 50, 0) })      // 向上飘
      .delay(0.8)                                 // 停留一会
      .to(0.5, { opacity: 0 })                    // 渐隐
      .start();
}
}
