import { CLASS_PARALLAX_ELEMENT } from "./style";
import { createTransform } from "./transform";

export class ParallaxElement {
  constructor(element, image, options) {
    this.element = element;
    this.imageWidth = image.naturalWidth;
    this.imageHeight = image.naturalHeight;

    this.transform_ = createTransform(options);
    this.renderer = new options.renderer(element, image, options);

    this.bgRect = { x: NaN, y: NaN, z: NaN, w: NaN, h: NaN };
    this.dirty = false;

    this.disposed = false;

    this.element.classList.add(CLASS_PARALLAX_ELEMENT);
  }

  updateRect(elementRect, viewportRect) {
    if (this.disposed) return;
    const bgRect = {
      x: 0,
      y: 0,
      z: 0,
      w: this.imageWidth,
      h: this.imageHeight
    };
    this.transform_(bgRect, elementRect, viewportRect);
    if (notEqual(this.bgRect, bgRect)) {
      this.dirty = true;
      copy_(this.bgRect, bgRect);
    }
  }

  render() {
    if (this.disposed) return;
    if (!this.dirty) return;
    this.dirty = false;
    this.renderer.render(this.bgRect);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.element.classList.remove(CLASS_PARALLAX_ELEMENT);
    this.renderer.dispose();
  }
}

function notEqual(a, b) {
  return (
    a.x !== b.x || a.y !== b.y || a.z !== b.z || a.w !== b.w || a.h !== b.h
  );
}

function copy_(a, b) {
  a.x = b.x;
  a.y = b.y;
  a.z = b.z;
  a.w = b.w;
  a.h = b.h;
}
