/// <summary>
/// The base abstract class for all Rotation limits. Contains common functionality and static helper methods
/// </summary>
export default class RotationLimit {


	constructor() {
		/// The main axis of the rotation limit.
		this.axis = Vector3.forward;

		/*
		 * The default local rotation of the gameobject. By default stored in Awake.
		 * */
		this.defaultLocalRotation = Quaternion.identity;

		this.initiated = false;
		this.applicationQuit = false;
		this.defaultLocalRotationSet = false;
	}




	/// Map the zero rotation point to the current rotation
	setDefaultLocalRotation() {
		let rot = this.transform.quaternion;
    this.defaultLocalRotation = new Quaternion(rot.x, rot.y, rot.z, rot.w);
		this.defaultLocalRotationSet = true;
	}




	/// Returns the limited local rotation.
	// @TODO_CHECK: out bool
	getLimitedLocalRotation(/*Quaternion*/ localRotation, /*out bool*/ changed) {
		// Making sure the Rotation Limit is initiated
		if (!this.initiated) Awake ();

		// Subtracting defaultLocalRotation
		let rotation = defaultLocalRotation.clone().inverse().multiply( localRotation );

		let limitedRotation = this.limitRotation(rotation);
		changed = !Quaternion.equals(limitedRotation, rotation);

		if (!changed) return localRotation;

		// Apply defaultLocalRotation back on
		return this.defaultLocalRotation.clone().multiply( limitedRotation );
	}




	/// Apply the rotation limit to transform.localRotation. Returns true if the limit has changed the rotation.
	apply() {
		let changed = false;

		let rot = transform.quaternion;
		rot = new Quaternion(rot.x, rot.y, rot.z, rot.z);

		rot = this.getLimitedLocalRotation(rot, out changed);
		transform.quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.z);

		return changed;
	}




	/// Disable this instance making sure it is initiated. Use this if you intend to manually control the updating of this Rotation Limit.
	disable() {
		if (this.initiated) {
			this.enabled = false;
			return;
		}

		this.awake();
		this.enabled = false;
	}



	/*
	 * An arbitrary secondary axis that we get by simply switching the axes
	 * */
	get secondaryAxis() { return new Vector3(this.axis.y, this.axis.z, this.axis.x); }

	/*
	 * Cross product of axis and secondaryAxis
	 * */
	get crossAxis() { return this.axis.clone().cross(this.secondaryAxis); }



	limitRotation(/*Quaternion*/ rotation) {};



	/*
	 * Initiating the Rotation Limit
	 * */
	awake() {
		// Store the local rotation to map the zero rotation point to the current rotation
		if (!this.defaultLocalRotationSet) this.setDefaultLocalRotation();

		if (this.axis.equals(Vector3.zero)) console.error("Axis is Vector3.zero.");
		this.initiated = true;
	}




	/*
	 * Using LateUpdate here because you most probably want to apply the limits after animation.
	 * If you need precise control over the execution order, disable this script and call Apply() whenever you need
	 * */
	lateUpdate() {
		this.apply();
	}




	/*
	 * Logs the warning if no other warning has beed logged in this session.
	 * */
	logWarning(message) {
		console.warn(message);//transform
	}





	/*
	 * Limits rotation to a single degree of freedom (along axis)
	 * */
	static limit1DOF(/*Quaternion*/ rotation, /*Vector3*/ axis) {
		return Quaternion.fromToRotation(rotation.clone().multiplyVector3(axis), axis).multiply(rotation);
	}





	/*
	 * Applies uniform twist limit to the rotation
	 * */
	static limitTwist(/*Quaternion*/ rotation, /*Vector3*/ axis, /*Vector3*/ orthoAxis, /*float*/ twistLimit) {
		twistLimit = Math.clamp(twistLimit, 0, 180);
		if (twistLimit >= 180) return rotation;

		let normal = rotation.clone().multiplyVector3(axis);
		let orthoTangent = orthoAxis.clone();
		normal.orthoNormalize(orthoTangent);

		let rotatedOrthoTangent = rotation.clone().multiplyVector3(orthoAxis);
		normal.orthoNormalize(rotatedOrthoTangent);

		let fixedRotation = Quaternion.fromToRotation(rotatedOrthoTangent, orthoTangent).multiply(rotation);

		if (twistLimit <= 0) return fixedRotation;

		// Rotate from zero twist to free twist by the limited angle
		return Quaternion.rotateTowards(fixedRotation, rotation, twistLimit);
	}




	/*
	 * Returns the angle between two vectors on a plane with the specified normal
	 * */
	static fetOrthogonalAngle(v1, v2, normal) {
		normal.OrthoNormalize(v1);
		normal.OrthoNormalize(v2);
		return Vector3.angle(v1, v2);
	}


}
