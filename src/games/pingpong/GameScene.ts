/// <reference path="./Viewport.ts"/>
/// <reference path="./Physic.ts"/>
/// <reference path="./Ball.ts"/>
/// <reference path="./Lyric.ts"/>
/// <reference path="./StarterPopup.ts"/>
/// <reference path="./Constant.ts"/>
/// <reference path="./PlatformManager.ts"/>
/// <reference path="../../core/scenes/BaseScene.ts"/>
/// <reference path="../../core/resources/Style.ts"/>
/// <reference path="../../core/resources/Share.ts"/>
/// <reference path="../../core/resources/Storage.ts"/>

module PingPong {
  
  var Storage = Resource.Storage;
  var Share = Resource.Share;
  
  export class GameScene extends Scene.BaseScene {
    
    protected physic: Physic;
    protected viewport: Viewport;
    protected starter: StarterPopup;
    protected ball: Ball;
    protected platformManager: PlatformManager;
    protected gameActive: boolean;
    protected lyric: Lyric;
    protected nbGame: number;
    protected record: number;
    
    constructor(physic: Physic) {
      super('GameScene');  
      this.physic = physic;
      this.gameActive = false;
      
      this.nbGame = Storage.get(Constant.NB_GAME) || 0;
      this.record = Storage.get(Constant.RECORD) || 0;
    }
    
    create(): void {
      var bg = new PIXI.Graphics();
      bg.beginFill(0xfae337);
      bg.drawRect(0, 0, this.Share.get('width'), this.Share.get('height'));
      bg.endFill();
      
      this.addChild(bg);
      
      this.viewport = new Viewport();
      this.addChild(this.viewport);
    }
    
    logic(): void {
      
      // The ball cannot be add on create
      // as a stage.addChild will be done on this.physic.addBody
      // Conclusion: the background will hide the background.       
      this.ball = new Ball(this.physic);
      this.ball.onLost = this.endGame.bind(this);
      this.ball.onBump = (pos) => {
        this.lyric.next(pos);
      };
      
      this.physic.addBody(this.ball.getBody());
      
      this.platformManager = new PlatformManager(this.physic);
      this.platformManager.onBuild = this.startGame.bind(this);
      
      this.starter = new StarterPopup();
      this.starter.open();
      
      this.viewport.onStep = (step) => {
        if(step > 0) {
          this.physic.incrGravity();  
        }
      };

      this.physic.addUpdate(() => {
        this.viewport.update();
        this.ball.update();
      });
    }
    
    private startGame() {
      if(this.gameActive) {
        return;
      }
              
      this.gameActive = true;
      
      this.lyric = new Lyric();
      this.platformManager.start();
      this.ball.start();
      this.viewport.start();
      
      this.starter.close();
    }
    
    private endGame() {
      if(!this.gameActive) {
        return;
      }
      
      this.physic.reset();
      
      this.gameActive = false;
      
      this.platformManager.stop();
      this.ball.stop();
      this.viewport.stop();
      
      this.nbGame++;
      Storage.set(Constant.NB_GAME, this.nbGame);
      
      if(!this.record || this.record < this.viewport.getScore()) {
        Storage.set(Constant.RECORD, this.viewport.getScore());      
      }
      
      this.starter = new StarterPopup(this.viewport.getScore());
      this.starter.open();
    }
     
  }
}