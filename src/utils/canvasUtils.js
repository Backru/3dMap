// Canvas工具函数
export function addRoundRectSupport() {
  // 为不支持roundRect的浏览器添加polyfill
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
      if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius }
      } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
        for (let side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side]
        }
      }
      
      this.beginPath()
      this.moveTo(x + radius.tl, y)
      this.lineTo(x + width - radius.tr, y)
      this.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
      this.lineTo(x + width, y + height - radius.br)
      this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
      this.lineTo(x + radius.bl, y + height)
      this.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
      this.lineTo(x, y + radius.tl)
      this.quadraticCurveTo(x, y, x + radius.tl, y)
      this.closePath()
    }
  }
}

// 创建渐变文字
export function drawGradientText(context, text, x, y, gradient) {
  const oldFillStyle = context.fillStyle
  context.fillStyle = gradient
  context.fillText(text, x, y)
  context.fillStyle = oldFillStyle
}

// 创建发光效果
export function drawGlowText(context, text, x, y, color, blur = 10) {
  const oldShadowColor = context.shadowColor
  const oldShadowBlur = context.shadowBlur
  
  context.shadowColor = color
  context.shadowBlur = blur
  context.fillText(text, x, y)
  
  context.shadowColor = oldShadowColor
  context.shadowBlur = oldShadowBlur
}
