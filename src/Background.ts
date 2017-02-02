import {action, computed, observable, autorun} from 'mobx'

import {ATTR_PARALLAX_ELEMENT} from './Constants'
import {appendStyleSheet} from './StyleSheet'
import {ParallaxElement} from './ParallaxElement'

export interface State {
    scale: number
    translateX: number
    translateY: number
    translateZ: number
}

export const initialState: State = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    translateZ: 0
}

export interface Background {
    readonly width: number
    readonly height: number
    
    update (patch: Partial<State>)
}

class StyleBackground implements Background {
    @observable state: State = observable(initialState)
    style: CSSStyleDeclaration
    readonly width: number
    readonly height: number
    
    constructor (style: CSSStyleDeclaration, width: number, height: number) {
        this.style = style
        this.width = width
        this.height = height

        Object.assign(style, {
            position: 'absolute',
            left: '0',
            top: '0',
            transformOrigin: '0 0 0',
            pointerEvents: 'none'
        })
        autorun(() => {
            this.style.transform = `
                translateX(${this.state.translateX}px)
                translateY(${this.state.translateY}px)
                translateZ(${this.state.translateZ}px)
                scale(${this.state.scale}, ${this.state.scale})`
        })
    }

    @action
    update (patch: Partial<State>) {
        Object.assign(this.state, patch)
    }
}

abstract class ScaleBackground implements Background {
    background: Background
    abstract readonly scale: number

    constructor (background: Background) {
        this.background = background
    }

    @action
    update (patch: Partial<State>) {
        if (patch.scale != null) {
            patch.scale *= this.scale
        }
        this.background.update(patch)
    }

    @computed get height (): number {
        return this.background.height * this.scale
    }
    @computed get width (): number {
        return this.background.width * this.scale
    }
}

export class CoverElement extends ScaleBackground {
    element: ParallaxElement
    velocityScale: number
    
    constructor (background: Background, element: ParallaxElement, velocityScale: number) {
        super(background)
        this.element = element
        this.velocityScale = velocityScale
    }

    @computed get scale (): number {
        return Math.max(this.minimalHeight / this.element.height, this.minimalWidth / this.element.width)
    }

    @computed get minimalHeight (): number {
        const { height: viewportHeight } = this.element.viewport
        const { height: elementHeight } = this.element

        const coverElementTop = this.velocityScale > 0
            ? elementHeight + (this.velocityScale - 1) * (viewportHeight + elementHeight)
            : elementHeight + (1 - this.velocityScale) * (viewportHeight - elementHeight)

        const coverWindowTop = viewportHeight + this.velocityScale * (viewportHeight - elementHeight)

        return Math.max(coverElementTop, coverWindowTop)
    }

    @computed get minimalWidth (): number {
        return this.element.width
    }

}

export class Translate {

}

export type CreateBackground = (el: ParallaxElement, image: HTMLImageElement, velocityScale: number) => Background

export const pseudoBefore: CreateBackground = (el: ParallaxElement, image: HTMLImageElement) => {
    const rule = `[${ATTR_PARALLAX_ELEMENT}="${el.id}"]::before {
        content: '';
        width: ${image.naturalWidth}px;
        height: ${image.naturalHeight}px;
        background-image: url(${image.src});
        background-size: 100% 100%;
    }`

    const index = styleSheet.insertRule(rule, 0)

    const style = (styleSheet.cssRules[index] as CSSStyleRule).style

    return new StyleBackground(style, image.naturalWidth, image.naturalHeight)
}

export const insertImg: CreateBackground = (el: ParallaxElement, image: HTMLImageElement) => {
    const img = document.createElement('img')

    img.height = image.naturalHeight
    img.width = image.naturalWidth
    img.src = image.src

    el.element.insertBefore(img, el.element.firstElementChild)
    return new StyleBackground(img.style, image.naturalWidth, image.naturalHeight)
}

const styleSheet: CSSStyleSheet = appendStyleSheet()