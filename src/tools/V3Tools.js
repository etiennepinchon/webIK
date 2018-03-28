// Helper methods for dealing with 3-dimensional vectors.
export default class V3Tools {

	// Optimized Vector3.Lerp
	static lerp(fromVector, toVector, weight) {
		if (weight <= 0) return fromVector;
		if (weight >= 1) return toVector;
		return fromVector.clone().lerp(toVector, weight);
	}




	/// Optimized Vector3.Slerp
	static slerp(fromVector, toVector, weight) {
		if (weight <= 0) return fromVector;
		if (weight >= 1) return toVector;
		return fromVector.clone().slerp(toVector, weight);
	}




	/// Returns vector projection on axis multiplied by weight.
	static extractVertical(v, verticalAxis, weight) {
		if (weight === 0) return Vector3.zero;
		return v.projectOnVector(verticalAxis).clone().multiplyScalar(weight);
	}




	/// Returns vector projected to a plane and multiplied by weight.
	static extractHorizontal(v, normal, weight) {
		if (weight === 0) return Vector3.zero;

		let tangent = v.clone();
		normal.orthoNormalize(tangent);
		return v.projectOnVector(tangent).clone().multiplyScalar(weight);
	}




	/// Clamps the direction to clampWeight from normalDirection, clampSmoothing is the number of sine smoothing iterations applied on the result.
	// @TODO_CHECK: out changed
	static clampDirection(/*Vector3*/direction, /*Vector3*/normalDirection, /*float*/clampWeight, /*int*/clampSmoothing, /*out bool*/changed) {
		changed = false;

		if (clampWeight <= 0) return direction;

		if (clampWeight >= 1) {
			changed = true;
			return normalDirection;
		}

		// Getting the angle between direction and normalDirection
		let angle = Vector3.angle(normalDirection, direction);
		let dot = 1 - (angle / 180);

		if (dot > clampWeight) return direction;
		changed = true;

		// Clamping the target
		let targetClampMlp = (clampWeight > 0) ? Math.clamp(1 - ((clampWeight - dot) / (1 - dot)), 0, 1) : 1;

		// Calculating the clamp multiplier
		let clampMlp = (clampWeight > 0) ? Math.clamp(dot / clampWeight, 0, 1) : 1;

		// Sine smoothing iterations
		for (let i = 0; i < clampSmoothing; i++) {
			let sinF = clampMlp * Math.PI * 0.5;
			clampMlp = Math.sin(sinF);
		}

		// Slerping the direction (don't use Lerp here, it breaks it)
		return normalDirection.clone().slerp(direction, clampMlp * targetClampMlp);
	}




	/// Clamps the direction to clampWeight from normalDirection, clampSmoothing is the number of sine smoothing iterations applied on the result.
	// @TODO_CHECK: make sure we don't use this method through out the project
	static clampDirectionWithValue(direction, normalDirection, clampWeight, clampSmoothing, clampValue) {
		clampValue = 1;

		if (clampWeight <= 0) return direction;

		if (clampWeight >= 1) {
			return normalDirection;
		}

		// Getting the angle between direction and normalDirection
		let angle = Vector3.angle(normalDirection, direction);
		let dot = 1 - (angle / 180);

		if (dot > clampWeight) {
			clampValue = 0;
			return direction;
		}

		// Clamping the target
		let targetClampMlp = (clampWeight > 0) ? Math.clamp(1 - ((clampWeight - dot) / (1 - dot)), 0, 1) : 1;

		// Calculating the clamp multiplier
		let clampMlp = (clampWeight > 0) ? Math.clamp(dot / clampWeight, 0, 1) : 1;

		// Sine smoothing iterations
		for (let i = 0; i < clampSmoothing; i++) {
			let sinF = clampMlp * Math.PI * 0.5;
			clampMlp = Math.sin(sinF);
		}

		// Slerping the direction (don't use Lerp here, it breaks it)
		let slerp = clampMlp * targetClampMlp;
		clampValue = 1 - slerp;
		return normalDirection.clone().slerp(direction, slerp);
	}




	/// Get the intersection point of line and plane
	static lineToPlane(/*Vector3*/origin, /*Vector3*/direction, /*Vector3*/planeNormal, /*Vector3*/planePoint) {
		let dot = planePoint.clone().sub(origin).dot(planeNormal);
		let normalDot = direction.clone().dot(planeNormal);

		if (normalDot === 0) return Vector3.zero;

		let dist = dot / normalDot;
		return origin.clone().add( direction.clone().normalize().multiplyScalar(dist) );
	}




	/// Projects a point to a plane.
	static pointToPlane(/*Vector3*/point, /*Vector3*/planePosition, /*Vector3*/planeNormal) {
		if (planeNormal.equals(Vector3.up)) {
			return new Vector3(point.x, planePosition.y, point.z);
		}

		let tangent = point.clone().sub(planePosition);
		let normal = planeNormal.clone();
		normal.orthoNormalize(tangent);

		return planePosition.clone().add( point.clone().sub(planePosition).projectOnVector(tangent) );
	}



}
