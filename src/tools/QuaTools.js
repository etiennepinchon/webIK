
// DEBUG: OK

// Helper methods for dealing with Quaternions.
export default class QuaTools {

	// OK
	// Unity: (0.2, 0.1, 0.3, 0.9)
	// Web: {x: 0.23380588591169035, y: 0.13714672442008705, z: 0.34038645832083286, w: 0.9003680595654704}

	/// Optimized Quaternion.Lerp
	static lerp(/*Quaternion*/fromRotation, /*Quaternion*/toRotation, /*float*/weight) {
		if (weight <= 0) return fromRotation;
		if (weight >= 1) return toRotation;
		return fromRotation.clone().lerp(toRotation, weight);
	}


	// OK
	// Unity: (0.2, 0.1, 0.3, 0.9)
	// Web:  {x: 0.2314458939174667, y: 0.13576239155608183, z: 0.33695066236793403, w: 0.8912799161932724}

	/// Optimized Quaternion.Slerp
	static slerp(/*Quaternion*/fromRotation, /*Quaternion*/toRotation,/*float*/ weight) {
		if (weight <= 0) return fromRotation;
		if (weight >= 1) return toRotation;
		return fromRotation.clone().slerp(toRotation, weight);
	}


	// OK
	// Unity: (0.2, 0.1, 0.2, 1.0)
	// Web: {x: 0.2137006139052933, y: 0.07123353796843111, z: 0.2137006139052933, w: 0.9505734470841807}

	/// Returns the rotation from identity Quaternion to "q", interpolated linearily by "weight".
	static linearBlend(/*Quaternion*/q, /*float*/weight) {
		if (weight <= 0) return Quaternion.identity;
		if (weight >= 1) return q;
		return Quaternion.identity.lerp(q, weight);
	}

	// OK
	// Unity: (0.2, 0.1, 0.2, 1.0)
	// Web: {x: 0.2137006139052933, y: 0.07123353796843111, z: 0.2137006139052933, w: 0.9505734470841807}

	/// Returns the rotation from identity Quaternion to "q", interpolated spherically by "weight".
	static sphericalBlend(/*Quaternion*/q, /*float*/weight) {
		if (weight <= 0) return Quaternion.identity;
		if (weight >= 1) return q;
		return Quaternion.identity.slerp(q, weight);
	}


	// OK
	// Unity: (0.2, 0.1, 0.1, 1.0)
	// Web: {x: 0.20595920581289096, y: 0.10297960290644548, z: 0.10297960290644548, w: 0.9676627554635886}

	/// Creates a FromToRotation, but makes sure it's axis remains fixed near to the Quaternion singularity point.
	/// The from to rotation around an axis.
	/// fromDirection => From direction.
	/// toDirection => To direction.
	/// axis => Should be normalized before passing into this method.
	static fromToAroundAxis(/*Vector3*/fromDirection, /*Vector3*/toDirection, /*Vector3*/axis) {
		const fromTo = Quaternion.fromToRotation(fromDirection, toDirection);

		let result = fromTo.toAngleAxis();
		let angle = result.angle;
		let freeAxis = result.axis;

		let dot = freeAxis.clone().dot(axis);
		if (dot < 0) angle = angle.clone().negate();

		return Quaternion.angleAxis(angle, axis);
	}


	// OK
	// Unity: (0.1, -0.1, 0.0, 1.0)
	// Web: {x: 0.07399999999999998, y: -0.092, z: -0.025999999999999995, w: 0.972}

	/// Gets the rotation that can be used to convert a rotation from one axis space to another.
	static rotationToLocalSpace(/*Quaternion*/space, /*Quaternion*/rotation) {
		return space.clone().inverse().multiply(rotation).inverse();
	}


	// OK
	// Unity: (-0.1, 0.0, 0.1, 1.0)
	// Web: {x: -0.094, y: 0.0020000000000000018, z: 0.07599999999999998, w: 0.972}

	/// Gets the Quaternion from rotation "from" to rotation "to".
	static fromToRotation(/*Quaternion*/from, /*Quaternion*/to) {
		if (Quaternion.equals(to, from)) return Quaternion.identity;
		return to.clone().multiply(from.clone().inverse());
	}


	// OK
	// Unity: (1.0, 0.0, 0.0)
	// Web:  {x: 1, y: 0, z: 0}

	/// Gets the closest direction axis to a vector. Input vector must be normalized!
	static getAxis(/*Vector3*/v) {
		let closest = Vector3.right;
		let neg = false;

		let x = v.clone().dot(Vector3.right);
		let maxAbsDot = Math.abs(x);
		if (x < 0) neg = true;

		let y = v.clone().dot(Vector3.up);
		let absDot = Math.abs(y);
		if (absDot > maxAbsDot) {
			maxAbsDot = absDot;
			closest = Vector3.up;
			neg = y < 0;
		}

		let z = v.clone().dot(Vector3.forward);
		absDot = Math.abs(z);
		if (absDot > maxAbsDot) {
			closest = Vector3.forward;
			neg = z < 0;
		}

		if (neg) closest = closest.clone().negate();
		return closest;
	}


	// OK
	// Unity: (0.3, 0.1, 0.3, 0.9)
	// Web: {x: 0.3, y: 0.1, z: 0.3, w: 0.9}

	/// Clamps the rotation similar to V3Tools.ClampDirection.
	static clampRotation(/*Quaternion*/rotation, /*float*/clampWeight, /*int*/clampSmoothing) {
		if (clampWeight >= 1) return Quaternion.identity;
		if (clampWeight <= 0) return rotation;

		let angle = Quaternion.angle(Quaternion.identity, rotation);
		let dot = 1 - (angle / 180);
		let targetClampMlp = Math.clamp(1 - ((clampWeight - dot) / (1 - dot)), 0, 1);
		let clampMlp = Math.clamp(dot / clampWeight, 0, 1);

		// Sine smoothing iterations
		for (let i = 0; i < clampSmoothing; i++) {
			let sinF = clampMlp * Math.PI * 0.5;
			clampMlp = Math.sin(sinF);
		}

		return Quaternion.identity.slerp(rotation, clampMlp * targetClampMlp);
	}


	// OK
	// Unity: 42
	// Web: 42

	/// Clamps an angular value.
	static clampAngle(/*float*/angle, /*float*/clampWeight, /*int*/clampSmoothing) {
		if (clampWeight >= 1) return 0;
		if (clampWeight <= 0) return angle;

		let dot = 1 - (Math.abs(angle) / 180);
		let targetClampMlp = Math.clamp(1 - ((clampWeight - dot) / (1 - dot)), 0, 1);
		let clampMlp = Math.clamp(dot / clampWeight, 0, 1);

		// Sine smoothing iterations
		for (let i = 0; i < clampSmoothing; i++) {
			let sinF = clampMlp * Math.PI * 0.5;
			clampMlp = Math.sin(sinF);
		}

		return Math.lerp(0, angle, clampMlp * targetClampMlp);
	}


	// OK
	// Unity: (0.0, 0.4, 0.5, 0.8)
	// Web: {x: -0.03238581793223688, y: 0.37777566874781265, z: 0.495963822978818, w: 0.7811892147202486}

	/// Used for matching the rotations of objects that have different orientations.
	static matchRotation(/*Quaternion*/ targetRotation, /*Vector3*/targetforwardAxis, /*Vector3*/targetUpAxis, /*Vector3*/forwardAxis, /*Vector3*/upAxis) {
		let f = Quaternion.lookRotation(forwardAxis, upAxis);
		let fTarget = Quaternion.lookRotation(targetforwardAxis, targetUpAxis);

		let d = targetRotation.clone().multiply(fTarget);
		return d.clone().multiply(f.clone().inverse());
	}

}
