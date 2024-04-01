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
