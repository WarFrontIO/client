import {PrioritizedEventHandlerRegistry} from "./PrioritizedEventHandlerRegistry";

/**
 * Manages interactions with the user.
 * This includes click, drag, scroll and hover events.
 *
 * All these events only apply to the topmost element at the given position.
 * @see PrioritizedEventHandlerRegistry
 *
 * @see ClickEventListener
 * @see DragEventListener
 * @see ScrollEventListener
 * @see HoverEventListener
 */
class InteractionManager {
	/** Registry for click event listeners. */
	click: PrioritizedEventHandlerRegistry<ClickEventListener> = new PrioritizedEventHandlerRegistry();
	/** Registry for drag event listeners. */
	drag: PrioritizedEventHandlerRegistry<DragEventListener> = new PrioritizedEventHandlerRegistry();
	/** Registry for scroll event listeners. */
	scroll: PrioritizedEventHandlerRegistry<ScrollEventListener> = new PrioritizedEventHandlerRegistry();
	/** Registry for multi-touch event listeners. */
	multitouch: PrioritizedEventHandlerRegistry<MultiTouchEventListener> = new PrioritizedEventHandlerRegistry();
	/** Registry for hover event listeners. */
	hover: PrioritizedEventHandlerRegistry<HoverEventListener> = new PrioritizedEventHandlerRegistry();
	dragTimeout: NodeJS.Timeout | null = null;
	pressX: number = 0;
	pressY: number = 0;
	touchPoints: Map<number, { x: number, y: number }> = new Map();

	constructor() {
		document.addEventListener("pointerdown", this.onPointerDown);
		document.addEventListener("pointerup", this.onPointerUp);
		document.addEventListener("pointerout", this.onPointerUp);
		document.addEventListener("pointerleave", this.onPointerUp);
		document.addEventListener("pointercancel", this.onPointerUp);
		document.addEventListener("pointermove", this.onHover);
		document.addEventListener("wheel", this.onScroll, {passive: false});
	}

	private onPointerDown(this: void, event: PointerEvent) {
		interactionManager.touchPoints.set(event.pointerId, {x: event.x, y: event.y});
		if (interactionManager.touchPoints.size > 1) return;
		interactionManager.pressX = event.x;
		interactionManager.pressY = event.y;
		interactionManager.dragTimeout = setTimeout(() => {
			interactionManager.dragTimeout = null;
			interactionManager.drag.choose(event.x, event.y);
			interactionManager.drag.call(l => l.onDragStart(event.x, event.y));
		}, 1000);
	}

	private onPointerUp(this: void, event: PointerEvent) {
		interactionManager.touchPoints.delete(event.pointerId);
		if (interactionManager.touchPoints.size > 0) {
			if (interactionManager.touchPoints.size === 1) {
				const point = interactionManager.touchPoints.values().next().value as { x: number, y: number };
				interactionManager.pressX = point.x;
				interactionManager.pressY = point.y;
			}
			return;
		}
		if (interactionManager.dragTimeout) {
			clearTimeout(interactionManager.dragTimeout);
			interactionManager.dragTimeout = null;
			interactionManager.click.choose(event.x, event.y);
			interactionManager.click.call(l => l.onClick(event.x, event.y));
		} else {
			interactionManager.drag.call(l => l.onDragEnd(event.x, event.y));
			interactionManager.drag.reset();
		}
	}

	private onHover(this: void, event: PointerEvent) {
		if (interactionManager.dragTimeout) {
			if (Math.abs(event.x - interactionManager.pressX) + Math.abs(event.y - interactionManager.pressY) < 10) return;
			clearTimeout(interactionManager.dragTimeout);
			interactionManager.dragTimeout = null;
			interactionManager.drag.choose(interactionManager.pressX, interactionManager.pressY);
			interactionManager.drag.call(l => l.onDragStart(interactionManager.pressX, interactionManager.pressY));
		}
		if (interactionManager.touchPoints.size > 1) {
			interactionManager.checkMobileGesture(event);
			return;
		}
		interactionManager.drag.call(l => l.onDragMove(event.x, event.y, event.x - interactionManager.pressX, event.y - interactionManager.pressY));
		interactionManager.pressX = event.x;
		interactionManager.pressY = event.y;
		interactionManager.hover.choose(event.x, event.y);
		interactionManager.hover.call(l => l.onHover(event.x, event.y));
	}

	private onScroll(this: void, event: WheelEvent) {
		let delta = event.deltaY;
		if (event.ctrlKey) {
			event.preventDefault();
			delta *= 7;
		}
		interactionManager.scroll.choose(event.x, event.y);
		interactionManager.scroll.call(l => l.onScroll(event.x, event.y, delta));
	}

	private checkMobileGesture(this: void, event: PointerEvent) {
		if (interactionManager.touchPoints.size !== 2) return;
		const [oldPoint1, oldPoint2] = Array.from(interactionManager.touchPoints.values());
		interactionManager.touchPoints.set(event.pointerId, {x: event.x, y: event.y});
		const [newPoint1, newPoint2] = Array.from(interactionManager.touchPoints.values());

		const oldDistance = Math.hypot(oldPoint1.x - oldPoint2.x, oldPoint1.y - oldPoint2.y);
		const newDistance = Math.hypot(newPoint1.x - newPoint2.x, newPoint1.y - newPoint2.y);
		const zoomFactor = newDistance / oldDistance;
		const oldCenterX = (oldPoint1.x + oldPoint2.x) / 2, oldCenterY = (oldPoint1.y + oldPoint2.y) / 2;
		const newCenterX = (newPoint1.x + newPoint2.x) / 2, newCenterY = (newPoint1.y + newPoint2.y) / 2;

		interactionManager.multitouch.choose(newCenterX, newCenterY);
		interactionManager.multitouch.call(l => l.onMultiTouch(oldCenterX, oldCenterY, newCenterX, newCenterY, zoomFactor));
	}
}

/**
 * Listener for basic interactions.
 * This interface is not meant to be implemented directly.
 * Refer to the specific event listener interfaces instead.
 */
export interface BasicInteractionListener {
	/**
	 * Tests if the listener should receive events at the given position.
	 * @param x The screen x-coordinate of the event.
	 * @param y The screen y-coordinate of the event.
	 * @returns True if the listener should receive events at the given position.
	 */
	test(x: number, y: number): boolean;
}

/**
 * Listener for click events.
 *
 * Register a listener with the click registry to receive click events.
 * @see InteractionManager.click
 * @see PrioritizedEventHandlerRegistry.register
 */
export interface ClickEventListener extends BasicInteractionListener {
	/**
	 * Called when the user clicks at the given position.
	 * @param x The screen x-coordinate of the click.
	 * @param y The screen y-coordinate of the click.
	 */
	onClick(x: number, y: number): void;
}

/**
 * Listener for drag events.
 *
 * Register a listener with the drag registry to receive drag events.
 * @see InteractionManager.drag
 * @see PrioritizedEventHandlerRegistry.register
 */
export interface DragEventListener extends BasicInteractionListener {
	/**
	 * Called when the user starts dragging at the given position.
	 * @param x The screen x-coordinate of the drag start.
	 * @param y The screen y-coordinate of the drag start.
	 */
	onDragStart(x: number, y: number): void;

	/**
	 * Called when the user drags to the given position.
	 * @param x The screen x-coordinate of the drag move.
	 * @param y The screen y-coordinate of the drag move.
	 * @param dx The x-delta of the drag.
	 * @param dy The y-delta of the drag.
	 */
	onDragMove(x: number, y: number, dx: number, dy: number): void;

	/**
	 * Called when the user stops dragging at the given position.
	 * @param x The screen x-coordinate of the drag end.
	 * @param y The screen y-coordinate of the drag end.
	 */
	onDragEnd(x: number, y: number): void;
}

/**
 * Listener for scroll events.
 *
 * Register a listener with the scroll registry to receive scroll events.
 * @see InteractionManager.scroll
 * @see PrioritizedEventHandlerRegistry.register
 */
export interface ScrollEventListener extends BasicInteractionListener {
	/**
	 * Called when the user scrolls at the given position.
	 * @param x The screen x-coordinate of the scroll.
	 * @param y The screen y-coordinate of the scroll.
	 * @param delta The scroll delta.
	 */
	onScroll(x: number, y: number, delta: number): void;
}

/**
 * Listener for multi-touch events.
 *
 * Register a listener with the pinch registry to receive pinch events.
 * @see InteractionManager.pinch
 * @see PrioritizedEventHandlerRegistry.register
 */
export interface MultiTouchEventListener extends BasicInteractionListener {
	/**
	 * Called when the user interacts with multiple touch points.
	 * @param oldX The centered screen x-coordinate of the old touch points.
	 * @param oldY The centered screen y-coordinate of the old touch points.
	 * @param newX The centered screen x-coordinate of the new touch points.
	 * @param newY The centered screen y-coordinate of the new touch points.
	 * @param factor The zoom factor.
	 */
	onMultiTouch(oldX: number, oldY: number, newX: number, newY: number, factor: number): void;
}

/**
 * Listener for hover events.
 *
 * Register a listener with the hover registry to receive hover events.
 * @see InteractionManager.hover
 * @see PrioritizedEventHandlerRegistry.register
 */
export interface HoverEventListener extends BasicInteractionListener {
	/**
	 * Called when the user hovers at the given position.
	 * @param x The screen x-coordinate of the hover.
	 * @param y The screen y-coordinate of the hover.
	 */
	onHover(x: number, y: number): void;
}

export const interactionManager = new InteractionManager();