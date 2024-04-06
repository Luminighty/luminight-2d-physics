import { IVector2 } from "../utils/vector"

export type ColliderId = number

export enum ColliderMode {
	Static,
	Dynamic
}

export interface Collider<Shape> {
	uuid: ColliderId,
	shape: Shape,
	offset: IVector2,
	layers: number,
	mode: ColliderMode,
	enabled: boolean
}


export type CollisionEvent = Partial<ICollisionEvent> & Partial<CollisionOffsetEvent>

interface ICollisionEvent {
	isCollided: boolean
}

interface CollisionOffsetEvent {
	offset: IVector2,
	deltaOffset: IVector2,
}
