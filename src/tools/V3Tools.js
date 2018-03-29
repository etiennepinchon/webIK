
// DEBUG: OK

// Helper methods for dealing with 3-dimensional vectors.
export default class V3Tools {

	// OK
	// Unity: (39.4, 28.4, 38.4)
	// Web: {x: 39.4, y: 28.4, z: 38.4}

	// Optimized Vector3.Lerp
	static lerp(/*Vector3*/fromVector, /*Vector3*/toVector, /*float*/weight) {
		if (weight <= 0) return fromVector;
		if (weight >= 1) return toVector;
		return fromVector.clone().lerp(toVector, weight);
	}

	// OK
	// Unity: (37.0, 30.0, 41.4)
	// Web: {x: 36.960386043743945, y: 30.034676887134143, z: 41.39484073067173}

	/// Optimized Vector3.Slerp
	static slerp(/*Vector3*/fromVector, /*Vector3*/toVector, /*float*/weight) {
		if (weight <= 0) return fromVector;
		if (weight >= 1) return toVector;
		return fromVector.clone().slerp(toVector, weight);
	}


	// OK
	// Unity: (16.0, 9.9, 13.0)
	// Web: {x: 16.03932993445011, y: 9.870356882738529, z: 12.95484340859432}

	/// Returns vector projection on axis multiplied by weight.
	static extractVertical(/*Vector3*/v, /*Vector3*/verticalAxis, /*float*/weight) {
		if (weight === 0) return Vector3.zero;
		return v.projectOnVector(verticalAxis).clone().multiplyScalar(weight);
	}


	// OK
	// Unity: (-9.0, 4.1, 8.0)
	// Web:  {x: -9.039329934450107, y: 4.12964311726147, z: 8.045156591405677}

	/// Returns vector projected to a plane and multiplied by weight.
	static extractHorizontal(/*Vector3*/v, /*Vector3*/normal, /*float*/weight) {
		if (weight === 0) return Vector3.zero;

		let tangent = v.clone();
		normal.orthoNormalize(tangent);
		return v.projectOnVector(tangent).clone().multiplyScalar(weight);
	}


	// OK
	// Unity: (10.0, 20.0, 30.0)
	// Web: {x: 10, y: 20, z: 30}

	/// Clamps the direction to clampWeight from normalDirection, clampSmoothing is the number of sine smoothing iterations applied on the result.
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


	// OK
	// Unity: (10.0, 20.0, 30.0)
	// Web:  {x: 10, y: 20, z: 30}

	/// Clamps the direction to clampWeight from normalDirection, clampSmoothing is the number of sine smoothing iterations applied on the result.
	static clampDirectionWithValue(/*Vector3*/direction, /*Vector3*/normalDirection, /*float*/clampWeight, /*int*/clampSmoothing, /*out float*/clampValue) {
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


	// OK
	// Unity: (9.6, 19.8, 29.7)
	// Web: {x: 9.630110731838379, y: 19.772375834977463, z: 29.701243283407923}

	/// Get the intersection point of line and plane
	static lineToPlane(/*Vector3*/origin, /*Vector3*/direction, /*Vector3*/planeNormal, /*Vector3*/planePoint) {
		let dot = planePoint.clone().sub(origin).dot(planeNormal);
		let normalDot = direction.clone().dot(planeNormal);

		if (normalDot === 0) return Vector3.zero;

		let dist = dot / normalDot;
		return origin.clone().add( direction.clone().normalize().multiplyScalar(dist) );
	}


	// OK
	// Unity: (18.5, 37.1, 51.3)
	// Web: {x: 18.53333333333334, y: 37.06666666666667, z: 51.333333333333336}

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
