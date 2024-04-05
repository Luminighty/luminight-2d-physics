import {describe, expect, test} from '@jest/globals';
import { ColliderMode, CollisionStrategy, PhysicsServer } from "../src";
export interface Rect {
	w: number, h: number
}

export class DummyStrategy implements CollisionStrategy<Rect> {
	constructor(
		private _checkCollision: Function
	) {
	}
	server!: PhysicsServer<Rect>;

	checkCollision(...args) {
		this._checkCollision(...args)
	}
}

test("server colliders", () => {
	const server = new PhysicsServer(new DummyStrategy(() => {}))

	server.add(0, {w: 16, h: 16}, {x: 5, y: 5})
	server.add(1, {w: 8, h: 8}, {x: 10, y: 10})

	expect(server.find(0)).toStrictEqual({
		uuid: 0,
		shape: {w: 16, h: 16},
		offset: {x: 5, y: 5},
		layers: 0,
		mode: ColliderMode.Dynamic,
		enabled: true
	})

	expect(server.find(1)).toStrictEqual({
		uuid: 1,
		shape: {w: 8, h: 8},
		offset: {x: 10, y: 10},
		layers: 0,
		mode: ColliderMode.Dynamic,
		enabled: true
	})

	server.remove(0)
	expect(server.find(0)).toBe(undefined)
})