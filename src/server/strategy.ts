import { IVector2 } from "../utils/vector";
import { Collider } from "./collider";
import { PhysicsServer } from "./server";

export interface CollisionStrategy<Shape> {
	server: PhysicsServer<Shape>
	checkCollision(collider: Collider<Shape>, others: Collider<Shape>[])
}
