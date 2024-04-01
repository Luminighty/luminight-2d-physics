import { IVector2, Vector2 } from "../utils/vector";
import { IdGenerator } from "../utils/id";
import { Collider, ColliderId, ColliderMode } from "./collider";
import { CollisionStrategy } from "./strategy";


export class PhysicsServer<Shape> {
	colliders: Collider<Shape>[] = []
	events = {}
	nextId = IdGenerator()

	constructor(
		private strategy: CollisionStrategy<Shape>,
	) {
		strategy.server = this
	}

	find(uuid: number) {
		return this.colliders.find((collider) => collider.uuid === uuid)
	}

	add(
		shape: Shape, 
		offset: IVector2,
		mode = ColliderMode.Dynamic,
		layers = 0,
		enabled = true
	): ColliderId {
		const uuid = this.nextId()

		this.colliders.push({
			uuid, shape, offset, 
			mode, layers, enabled
		})
		return uuid
	}

	remove(uuid: ColliderId) {
		const index = this.colliders.findIndex((collider) => collider.uuid === uuid)
		if (index < 0)
			return
		this.colliders.splice(index, 1)
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
		if (!this.events[collider.uuid])
			this.events[collider.uuid] = {}
		this.events[collider.uuid]["offset"] = collider.offset
	}

	clearEvents() {
		this.events = {}
	}
}

function CollisionFilter<Shape>(self: Collider<Shape>) {
	return (other: Collider<Shape>) => other.enabled && other !== self
}