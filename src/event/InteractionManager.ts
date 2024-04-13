import {PrioritizedEventHandlerRegistry} from "./PrioritizedEventHandlerRegistry";

class InteractionManager {
	click: PrioritizedEventHandlerRegistry<ClickEventListener> = new PrioritizedEventHandlerRegistry();
	drag: PrioritizedEventHandlerRegistry<DragEventListener> = new PrioritizedEventHandlerRegistry();
	scroll: PrioritizedEventHandlerRegistry<ScrollEventListener> = new PrioritizedEventHandlerRegistry();
	hover: PrioritizedEventHandlerRegistry<HoverEventListener> = new PrioritizedEventHandlerRegistry();
	dragTimeout: NodeJS.Timeout | null = null;
	pressX: number = 0;
	pressY: number = 0;

	constructor() {
		document.addEventListener("pointerdown", this.onPointerDown);
		document.addEventListener("pointerup", this.onPointerUp);
		document.addEventListener("pointermove", this.onHover);
		document.addEventListener("wheel", this.onScroll);
	}

	private onPointerDown(event: PointerEvent) {
		interactionManager.pressX = event.x;
		interactionManager.pressY = event.y;
		interactionManager.dragTimeout = setTimeout(() => {
			interactionManager.dragTimeout = null;
			interactionManager.drag.choose(event.x, event.y);
			interactionManager.drag.call(l => l.onDragStart(event.x, event.y));
		}, 1000);
	}

	private onPointerUp(event: PointerEvent) {
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

	private onHover(event: PointerEvent) {
		if (interactionManager.dragTimeout) {
			if (Math.abs(event.x - interactionManager.pressX) + Math.abs(event.y - interactionManager.pressY) < 10) return;
			clearTimeout(interactionManager.dragTimeout);
			interactionManager.dragTimeout = null;
			interactionManager.drag.choose(interactionManager.pressX, interactionManager.pressY);
			interactionManager.drag.call(l => l.onDragStart(interactionManager.pressX, interactionManager.pressY));
		}
		interactionManager.drag.call(l => l.onDragMove(event.x, event.y));
		interactionManager.hover.choose(event.x, event.y);
		interactionManager.hover.call(l => l.onHover(event.x, event.y));
	}

	private onScroll(event: WheelEvent) {
		interactionManager.scroll.choose(event.x, event.y);
		interactionManager.scroll.call(l => l.onScroll(event.x, event.y, event.deltaY));
	}
}

export interface BasicInteractionListener {
	test(x: number, y: number): boolean;
}

export interface ClickEventListener extends BasicInteractionListener {
	onClick(x: number, y: number): void;
}

export interface DragEventListener extends BasicInteractionListener {
	onDragStart(x: number, y: number): void;

	onDragMove(x: number, y: number): void;

	onDragEnd(x: number, y: number): void;
}

export interface ScrollEventListener extends BasicInteractionListener {
	onScroll(x: number, y: number, delta: number): void;
}

export interface HoverEventListener extends BasicInteractionListener {
	onHover(x: number, y: number): void;
}

export const interactionManager = new InteractionManager();