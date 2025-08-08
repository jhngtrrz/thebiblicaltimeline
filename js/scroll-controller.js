// scroll-controller.js - Reemplazo moderno ligero de Scroller/Animate
// Características soportadas:
// - Scroll programático con inercia básica (física simple)
// - Scroll horizontal y vertical opcional
// - Callbacks en cada frame (left, top)
// - Métodos: scrollTo(x,y,animate), scrollBy(dx,dy,animate)
// - Manejo de pointer/touch externo (doPointerStart/Move/End)
// - Zoom soportado (zoomTo / zoomBy y pinch simple)

export class ScrollController {
    constructor(callback, options = {}) {
        this.cb = callback;
        this.options = Object.assign({
            scrollingX: true,
            scrollingY: true,
            animating: true,
            bouncing: true,
            speedMultiplier: 1,
            animationDuration: 300,
            friction: 0.95,
            minVelocity: 0.15
        }, options);
        this.viewportWidth = 0; this.viewportHeight = 0;
        this.contentWidth = 0; this.contentHeight = 0;
        this.left = 0; this.top = 0;
        this.maxLeft = 0; this.maxTop = 0;
        this.__isDown = false;
        this.__lastX = 0; this.__lastY = 0; this.__vx = 0; this.__vy = 0;
        this.__raf = null;
        // Zoom
        this.zoom = 1;
        this.minZoom = options.minZoom || 0.5;
        this.maxZoom = options.maxZoom || 3;
        this.__isPinching = false;
        this.__startDist = 0;
        this.__startZoom = 1;
    }
    setDimensions(viewW, viewH, contentW, contentH) {
        this.viewportWidth = viewW; this.viewportHeight = viewH;
        this.contentWidth = contentW; this.contentHeight = contentH;
        this.maxLeft = Math.max(0, contentW - viewW);
        this.maxTop = Math.max(0, contentH - viewH);
        this._clamp();
        this._publish();
    }
    _clamp() {
        this.left = Math.min(this.maxLeft, Math.max(0, this.left));
        this.top = Math.min(this.maxTop, Math.max(0, this.top));
    }
    _publish() { if (this.cb) this.cb(this.left, this.top, this.zoom); }
    scrollTo(x, y, animate = true) {
        if (!this.options.scrollingX) x = this.left;
        if (!this.options.scrollingY) y = this.top;
        x = Math.min(this.maxLeft, Math.max(0, x));
        y = Math.min(this.maxTop, Math.max(0, y));
        if (!animate || !this.options.animating) {
            this.left = x; this.top = y; this._publish(); return;
        }
        const startX = this.left, startY = this.top;
        const dx = x - startX, dy = y - startY;
        const dur = this.options.animationDuration;
        const t0 = performance.now();
        const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = now => {
            const t = Math.min(1, (now - t0) / dur);
            this.left = startX + dx * ease(t);
            this.top = startY + dy * ease(t);
            this._publish();
            if (t < 1) this.__raf = requestAnimationFrame(step);
        };
        if (this.__raf) cancelAnimationFrame(this.__raf);
        this.__raf = requestAnimationFrame(step);
    }
    scrollBy(dx, dy, animate = true) { this.scrollTo(this.left + dx, this.top + dy, animate); }
    // Pointer API (similar a viejo Scroller pero simplificado)
    doPointerStart(points) {
        if (this.__raf) { cancelAnimationFrame(this.__raf); this.__raf = null; }
        if (points.length === 2) {
            // inicio pinch
            this.__isPinching = true;
            this.__startDist = this._distance(points[0], points[1]);
            this.__startZoom = this.zoom;
            return;
        }
        const p = points[0];
        this.__isDown = true;
        this.__lastX = p.pageX; this.__lastY = p.pageY;
        this.__vx = 0; this.__vy = 0;
    }
    doPointerMove(points) {
        if (this.__isPinching && points.length === 2) {
            const dist = this._distance(points[0], points[1]);
            const ratio = dist / (this.__startDist || dist);
            this.zoomTo(this.__startZoom * ratio, { animate: false, focalX: (points[0].pageX + points[1].pageX) / 2, focalY: (points[0].pageY + points[1].pageY) / 2 });
            return;
        }
        if (!this.__isDown) return;
        const p = points[0];
        let dx = p.pageX - this.__lastX;
        let dy = p.pageY - this.__lastY;
        this.__lastX = p.pageX; this.__lastY = p.pageY;
        if (!this.options.scrollingX) dx = 0;
        if (!this.options.scrollingY) dy = 0;
        this.left -= dx; this.top -= dy; // arrastre natural (inverso)
        this._clamp();
        // velocidad (simple derivada)
        this.__vx = (this.__vx * 0.8) + (-dx);
        this.__vy = (this.__vy * 0.8) + (-dy);
        this._publish();
    }
    doPointerEnd() {
        if (this.__isPinching) { this.__isPinching = false; return; }
        if (!this.__isDown) { return; }
        this.__isDown = false;
        // Inercia
        const step = () => {
            this.__vx *= this.options.friction;
            this.__vy *= this.options.friction;
            if (Math.abs(this.__vx) < this.options.minVelocity && Math.abs(this.__vy) < this.options.minVelocity) { this.__raf = null; return; }
            this.left += this.__vx; this.top += this.__vy;
            // rebote simple
            if (this.options.bouncing) {
                if (this.left < 0) { this.left = 0; this.__vx *= -0.4; }
                if (this.left > this.maxLeft) { this.left = this.maxLeft; this.__vx *= -0.4; }
                if (this.top < 0) { this.top = 0; this.__vy *= -0.4; }
                if (this.top > this.maxTop) { this.top = this.maxTop; this.__vy *= -0.4; }
            } else {
                this._clamp();
            }
            this._publish();
            this.__raf = requestAnimationFrame(step);
        };
        this.__raf = requestAnimationFrame(step);
    }
    // Utilidades de zoom
    zoomTo(z, { animate = true, focalX = null, focalY = null } = {}) {
        const target = Math.min(this.maxZoom, Math.max(this.minZoom, z));
        if (target === this.zoom) { return; }
        // ajustar offsets manteniendo punto focal (si dado)
        if (focalX != null && focalY != null) {
            const relX = (this.left + focalX) / (this.contentWidth * this.zoom);
            const relY = (this.top + focalY) / (this.contentHeight * this.zoom);
            const newContentW = this.contentWidth * target;
            const newContentH = this.contentHeight * target;
            const newLeft = relX * newContentW - focalX;
            const newTop = relY * newContentH - focalY;
            this.left = newLeft; this.top = newTop;
        }
        const start = this.zoom; const diff = target - start;
        if (!animate) { this.zoom = target; this._clamp(); this._publish(); return; }
        const dur = this.options.animationDuration;
        const t0 = performance.now();
        const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = now => {
            const t = Math.min(1, (now - t0) / dur);
            this.zoom = start + diff * ease(t);
            this._clamp(); this._publish();
            if (t < 1) this.__raf = requestAnimationFrame(step);
        };
        if (this.__raf) cancelAnimationFrame(this.__raf);
        this.__raf = requestAnimationFrame(step);
    }
    zoomBy(delta, opts = {}) { this.zoomTo(this.zoom * delta, opts); }
    _distance(p1, p2) { const dx = p2.pageX - p1.pageX; const dy = p2.pageY - p1.pageY; return Math.hypot(dx, dy); }
}

export default ScrollController;
