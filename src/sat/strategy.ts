import { IVector2, Vector2 } from "../utils/vector";
import { Collider } from "../server/collider";
import { CollisionStrategy } from "../server/strategy";
import { PhysicsServer } from "../server";

export type Polygon = IVector2[];
type Edge = IVector2;

export class SATStrategy implements CollisionStrategy<Polygon> {
	server!: PhysicsServer<Polygon>;
	MAXIMUM_ITERATIONS = 16;

	checkCollision(collider: Collider<Polygon>, others: Collider<Polygon>[]) {
		let iterations = 0;
		while(this.collisionStep(collider, others) !== 0 && iterations < this.MAXIMUM_ITERATIONS)
			iterations++;
	}

	collisionStep(collider: Collider<Polygon>, others: Collider<Polygon>[]) {
		const currentColliders: Array<Collider<Polygon>> = [];
		
		let mostSignificant: IVector2 | null = null;
		let mostSignificantLength = 0;

		const polygon = toWorldPolygon(collider.shape, collider.offset)

		for (const other of others) {
			const otherPolygon = toWorldPolygon(other.shape, other.offset)
			const pushVector = SAT(polygon, otherPolygon);
			if (!pushVector)
				continue;
			currentColliders.push(other);
			const length = Vector2.dot(pushVector, pushVector);
			if (mostSignificantLength < length) {
				mostSignificant = pushVector;
				mostSignificantLength = length;
			}
		}
		if (mostSignificant) {
			this.server.applyCollision(collider, mostSignificant);
		}
		return currentColliders.length
	}

}


function toWorldPolygon(polygon: Polygon, offset: IVector2): Polygon {
	return polygon.map((v) => Vector2.add(v, offset))
}
/**
 * Separating Axis Theorem
 */
function SAT(left: Polygon, right: Polygon) {
	const orthogonals = [...toEdges(left), ...toEdges(right)].map(Vector2.orthogonal);
	const pushVectors: IVector2[] = [];

	for (const orthogonal of orthogonals) {
		const pv = isSeparatingAxis(orthogonal, left, right);
		if (!pv)
			return null;
		pushVectors.push(pv);
	}

	let minValue = Vector2.dot(pushVectors[0], pushVectors[0]);
	let minIndex = 0;
	for (let i = 1; i < pushVectors.length; i++) {
		const value = Vector2.dot(pushVectors[i], pushVectors[i]);
		if (value < minValue) {
			minIndex = i;
			minValue = value;
		}
	}

	const minPushVector = pushVectors[minIndex];
	const displacement = centerDisplacement(left, right);

	if ( Vector2.dot(displacement, minPushVector) > 0)
		return Vector2.neg(minPushVector);
	return minPushVector;
}

function centerDisplacement(left: Polygon, right: Polygon) {
	const c1 = {
		x: left.reduce((acc, curr) => acc + curr.x, 0) / left.length,
		y: left.reduce((acc, curr) => acc + curr.y, 0) / left.length,
	}	
	const c2 = {
		x: right.reduce((acc, curr) => acc + curr.x, 0) / left.length,
		y: right.reduce((acc, curr) => acc + curr.y, 0) / left.length,
	}
	return Vector2.sub(c1, c2);
}

function toEdges(polygon: Polygon) {
	const edges: Edge[] = [];
	const length = polygon.length;
	for (let i = 0; i < length; i++) {
		edges[i] = Vector2.sub(polygon[(i + 1) % length], polygon[i]);
	}
	return edges;
}


function isSeparatingAxis(orthogonal: IVector2, left: Polygon, right: Polygon) {
	let min1 = Number.MAX_SAFE_INTEGER;
	let min2 = Number.MAX_SAFE_INTEGER;
	let max1 = Number.MIN_SAFE_INTEGER;
	let max2 = Number.MIN_SAFE_INTEGER;

	for (const vector of left) {
		const product = Vector2.dot(vector, orthogonal);
		min1 = Math.min(min1, product);
		max1 = Math.max(max1, product);
	}

	for (const vector of right) {
		const product = Vector2.dot(vector, orthogonal);
		min2 = Math.min(min2, product);
		max2 = Math.max(max2, product);
	}

	if (max1 >= min2 && max2 >= min1) {
		const distance = Math.min(max2 - min1, max1 - min2)
		const DoVSqr = distance / Vector2.dot(orthogonal, orthogonal) + 1e-10
		const pv = Vector2.scalar(DoVSqr, orthogonal);
		return pv;
	}
	return null;
}
