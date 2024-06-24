import {describe, expect, test} from '@jest/globals';
import { ColliderMode, CollisionStrategy, PhysicsServer } from "../src";
import { IVector2 } from '../src/utils/vector';
export interface Rect {
	w: number, h: number
}

export class DummyStrategy implements CollisionStrategy<Rect> {
	public collisionResult?: IVector2
	public onCheckCollision?: Function
	server!: PhysicsServer<Rect>;
	
	constructor() {}

	checkCollision(self, other) {
		this.onCheckCollision?.(self, other)
		if (this.collisionResult)
			this.server.applyCollision(self, {...this.collisionResult})
	}
}

test("server colliders", () => {
	const server = new PhysicsServer(new DummyStrategy())

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

test("server events", () => {
	const dummy = new DummyStrategy()
	const onCheckCollisionFn = jest.fn()
	dummy.onCheckCollision = onCheckCollisionFn
	const server = new PhysicsServer(dummy)

	const colA = server.add(0, {w: 16, h: 16}, {x: 5, y: 5})
	const colB = server.add(1, {w: 8, h: 8}, {x: 10, y: 10})

	server.checkCollision(colA)
	expect(onCheckCollisionFn).toHaveBeenCalledWith(colA, [colB])
	expect(server.events).toStrictEqual({})
	
	dummy.collisionResult = { x: 3, y: 2 }
	server.checkCollision(colB)
	expect(onCheckCollisionFn).toHaveBeenCalledWith(colB, [colA])
	expect(onCheckCollisionFn).toBeCalledTimes(2)
	expect(server.events).toStrictEqual({
		'1': {
			offset: {x: 7, y: 8},
			deltaOffset: {x: 3, y: 2},
			isCollided: true 
		}
	})

	server.clearEvents()
	expect(server.events).toStrictEqual({})
})