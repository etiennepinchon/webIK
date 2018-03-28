// Helper methods for dealing with Quaternions.
export default class QuaTools {


	/// Optimized Quaternion.Lerp
	static lerp(fromRotation, toRotation, weight) {
		if (weight <= 0) return fromRotation;
		if (weight >= 1) return toRotation;
		return fromRotation.clone().lerp(toRotation, weight);
	}



	/// Optimized Quaternion.Slerp
	static slerp(fromRotation, toRotation, weight) {
		if (weight <= 0) return fromRotation;
		if (weight >= 1) return toRotation;
		return fromRotation.clone().slerp(toRotation, weight);
	}




	/// Returns the rotation from identity Quaternion to "q", interpolated linearily by "weight".
	static linearBlend(q, weight) {
		if (weight <= 0) return Quaternion.identity;
		if (weight >= 1) return q;
		return Quaternion.identity.lerp(q, weight);
	}




	/// Returns the rotation from identity Quaternion to "q", interpolated spherically by "weight".
	static sphericalBlend(q, weight) {
		if (weight <= 0) return Quaternion.identity;
		if (weight >= 1) return q;
		return Quaternion.identity.slerp(q, weight);
	}




	/// Creates a FromToRotation, but makes sure it's axis remains fixed near to the Quaternion singularity point.
	/// The from to rotation around an axis.
	/// fromDirection => From direction.
	/// toDirection => To direction.
	/// axis => Should be normalized before passing into this method.
	static fromToAroundAxis(fromDirection, toDirection, axis) {
		const fromTo = Quaternion.FromToRotation(fromDirection, toDirection);

		let result = fromTo.toAngleAxis();
		let angle = result.angle;
		let freeAxis = result.axis;

		let dot = freeAxis.clone().dot(axis);
		if (dot < 0) angle = angle.clone().negate();

		return Quaternion.angleAxis(angle, axis);
	}




	/// Gets the rotation that can be used to convert a rotation from one axis space to another.
	static rotationToLocalSpace(space, rotation) {
		return space.clone().inverse().multiply(rotation).inverse();
	}




	/// Gets the Quaternion from rotation "from" to rotation "to".
	static fromToRotation(from, to) {
		if (Quaternion.equals(to, from)) return Quaternion.identity;
		return to.clone().multiply(from.clone().inverse());
	}




	/// Gets the closest direction axis to a vector. Input vector must be normalized!
	static getAxis(v) {
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




	/// Clamps the rotation similar to V3Tools.ClampDirection.
	static clampRotation(rotation, clampWeight, clampSmoothing) {
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




	/// Clamps an angular value.
	static clampAngle(angle, clampWeight, clampSmoothing) {
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




	/// Used for matching the rotations of objects that have different orientations.
	static matchRotation(/*Quaternion*/ targetRotation, /*Vector3*/targetforwardAxis, /*Vector3*/targetUpAxis, /*Vector3*/forwardAxis, /*Vector3*/upAxis) {
		let f = Quaternion.lookRotation(forwardAxis, upAxis);
		let fTarget = Quaternion.lookRotation(targetforwardAxis, targetUpAxis);

		let d = targetRotation.clone().multiply(fTarget);
		return d.clone().multiply(f.clone().inverse());
	}



}
