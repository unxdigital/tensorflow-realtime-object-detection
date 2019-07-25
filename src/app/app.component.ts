import { Component, OnInit, HostListener } from '@angular/core';
import * as generate from 'string-to-color';
import * as color from 'color';

// import COCO-SSD model as cocoSSD
import * as cocoSSD from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TF-ObjectDetection';
  private video: HTMLVideoElement;
  public innerWidth: any;
  public innerHeight: any;
  public loadingModel: boolean;
  public colorScheme: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.video.width = this.innerWidth;
    this.video.height = this.innerHeight;
  }

  ngOnInit() {
    this.loadingModel = true;
    this.video = <HTMLVideoElement>document.getElementById('vid');
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.video.width = this.innerWidth;
    this.video.height = this.innerHeight;
    this.webcam_init();
  }

  public async predictWithCocoModel() {
    // const model = await cocoSSD.load('mobilenet_v2');
    // const model = await cocoSSD.load('mobilenet_v1');
    const model = await cocoSSD.load('lite_mobilenet_v2');
    this.detectFrame(this.video, model, true);
    this.loadingModel = false;
    console.log('model loaded');
  }

  webcam_init() {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: {
            ideal: 1920
          },
          height: {
            ideal: 1080
          }
        }
      })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          this.video.play();
          this.predictWithCocoModel();
        };
      });
  }


  detectFrame = (video, model, first_time) => {
    model.detect(video).then(predictions => {

      this.renderPredictions(predictions);

      requestAnimationFrame(() => {
        this.detectFrame(video, model, false);
      });
    });
  }


  renderPredictions(predictions) {

    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = this.innerWidth;
    canvas.height = this.innerHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Font options.
    const font = '22px "Quicksand"';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.drawImage(this.video, 0, 0, this.innerWidth, this.innerHeight);

    predictions.forEach(prediction => {

      // keep predictions with at less 0.7 accurrate
      /* const accurrate = 0.7;
      if (prediction.score < accurrate) {
        return;
      } */

      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      // Define color by object class + some number to generate different colors
      this.colorScheme = generate(prediction.class + ctx.measureText(prediction.class).width);

      // Draw the bounding box.
      this.roundRect(ctx, x, y, width, height, 5, true, true, color(this.colorScheme).alpha(0.1));
      ctx.lineWidth = 3;

      // Draw the label background.
      ctx.fillStyle = color(this.colorScheme).alpha(0.8);
      const textWidth = ctx.measureText(prediction.class).width + ctx.measureText(prediction.score.toFixed(3)).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 2, textHeight + 2);


      // Draw the center of the box
      ctx.fillRect(x + width / 2, y + height / 2, 5, 5);
    });

    predictions.forEach(prediction => {

      // keep predictions with at less 0.7 accurrate
      /* const accurrate = 0.7;
      if (prediction.score < accurrate) {
        return;
      } */

      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = '#FFFFFF';
      // console.log(prediction);
      ctx.fillText(prediction.class + ' ' + Math.round(prediction.score * 100) / 100, x, y);
    });

  }

  /**
  * Draws a rounded rectangle using the current state of the canvas.
  * If you omit the last three params, it will draw a rectangle
  * outline with a 5 pixel border radius
  * @param {CanvasRenderingContext2D} ctx
  * @param {Number} x The top left x coordinate
  * @param {Number} y The top left y coordinate
  * @param {Number} width The width of the rectangle
  * @param {Number} height The height of the rectangle
  * @param {Number} [radius = 5] The corner radius; It can also be an object
  *                 to specify different radii for corners
  * @param {Number} [radius.tl = 0] Top left
  * @param {Number} [radius.tr = 0] Top right
  * @param {Number} [radius.br = 0] Bottom right
  * @param {Number} [radius.bl = 0] Bottom left
  * @param {Boolean} [fill = false] Whether to fill the rectangle.
  * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
  */
  roundRect(ctx, x, y, width, height, radius?, fill?, stroke?, color?) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = color;
      ctx.stroke();
    }

  }
}