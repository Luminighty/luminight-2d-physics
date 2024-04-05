import { IVector2, Vector2 } from "../utils/vector";
import { Collider, ColliderId, ColliderMode } from "./collider";
import { CollisionStrategy } from "./strategy";


export class PhysicsServer<Shape> {
	colliders: Collider<Shape>[] = []
	colliderMap: Record<ColliderId, Collider<Shape>> = {}
	events = {}

	constructor(
		private strategy: CollisionStrategy<Shape>,
	) {
		strategy.server = this
	}

	find(uuid: number) {
		return this.colliderMap[uuid]
	}

	add(
		uuid: ColliderId,
		shape: Shape, 
		offset: IVector2,
		mode = ColliderMode.Dynamic,
		layers = 0,
		enabled = true
	) {
		const collider = {
			uuid, shape, offset, 
			mode, layers, enabled
		}
		this.colliders.push(collider)
		this.colliderMap[uuid] = collider
	}

	remove(uuid: ColliderId) {
		const index = this.colliders.findIndex((collider) => collider.uuid === uuid)
		if (index < 0)
			return
		this.colliders.splice(index, 1)
		delete this.colliderMap[uuid]
	}

	updateOffset(uuid: number, offset: IVector2) {
		const collider = this.find(uuid)
		if (!collider)
			return
		collider.offset = offset
		this.checkCollision(collider)
	}

	updateEnabled(uuid: number, enabled: boolean) {
		const collider = this.find(uuid)
		if (!collider)
			return
		collider.enabled = enabled
	}

	checkCollision(collider: Collider<Shape>) {
		if (collider.mode === ColliderMode.Static)
			return
		if (!collider.enabled)
			return
		this.strategy.checkCollision(
			collider,
			this.colliders.filter(CollisionFilter(collider))
		)
	}

	applyCollision(collider: Collider<Shape>, offset: IVector2) {
		collider.offset = Vector2.sub(collider.offset, offset)
		this.addEvent(collider.uuid, "offset", collider.offset)
		this.addEvent(collider.uuid, "isCollided", true)
	}

	private addEvent(uuid: ColliderId, key: string, value: unknown) {
		if (!this.events[uuid])
			this.events[uuid] = {}
		this.events[uuid][key] = value
	}

	clearEvents() {
		this.events = {}
	}
}

function CollisionFilter<Shape>(self: Collider<Shape>) {
	return (other: Collider<Shape>) => other.enabled && other !== self
}
