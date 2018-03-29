
// DEBUG: OK

/// The Cartesian axes.
export const Axis = {
	X: 0,
	Y: 1,
	Z: 2
};


/// Contains tools for working with Axes that have no positive/negative directions.
export default class AxisTools {

	// OK
	// Unity: (1.0, 0.0, 0.0)
	// Web: {x: 1, y: 0, z: 0}

	/// Converts an Axis to Vector3.
	static toVector3(/*Axis*/axis) {
		if (axis === Axis.X) return Vector3.right;
		if (axis === Axis.Y) return Vector3.up;
		return Vector3.forward;
	}


	// OK
	// Unity: Z
	// Web: Z

	/// Converts a Vector3 to Axis.
	static toAxis(/*Vector3*/v) {
		let absX = Math.abs(v.x);
		let absY = Math.abs(v.y);
		let absZ = Math.abs(v.z);

		let d = Axis.X;
		if (absY > absX && absY > absZ) d = Axis.Y;
		if (absZ > absX && absZ > absY) d = Axis.Z;
		return d;
	}


	// OK
	// Unity: X
	// Web: X

	/// Returns the Axis of the Transform towards a world space position.
	// @TODO_CHECK: check this transform t....
	static getAxisToPoint(/*Transform*/t, /*Vector3*/worldPosition) {
		let/*Vector3*/ axis = AxisTools.getAxisVectorToPoint(t, worldPosition);
		if (axis.length() == Vector3.right.length()) return Axis.X;
		if (axis.length() == Vector3.up.length()) return Axis.Y;
		return Axis.Z;
	}

	// OK
	// Unity: X
	// Web: X

	/// Returns the Axis of the Transform towards a world space direction.
	// @TODO_CHECK: check this transform t....
	static getAxisToDirection(/*Transform*/t, /*Vector3*/direction) {
		let axis = AxisTools.getAxisVectorToDirection(t, direction);
		if (axis.length() == Vector3.right.length()) return Axis.X;
		if (axis.length() == Vector3.up.length()) return Axis.Y;
		return Axis.Z;
	}

	// OK
	// Unity: (1.0, 0.0, 0.0)
	// Web: {x: 1, y: 0, z: 0}

	/// Returns the local axis of the Transform towards a world space position.
	static getAxisVectorToPoint(/*Transform*/t, /*Vector3*/worldPosition) {
		return AxisTools.getAxisVectorToDirection(t, worldPosition.clone().sub(t.position) );
	}

	// OK
	// Unity: (1.0, 0.0, 0.0)
	// Web: {x: 1, y: 0, z: 0}

	// OK
	// Unity:
	// tRight: (0.8, 0.6, 0.0)
	// tUp: (-0.5, 0.6, 0.6)
	// tForward: (0.4, -0.5, 0.8)
	// Web:
	// tRight: {x: 0.8, y: 0.6000000000000001, z: -2.7755575615628914e-17}
	// tUp: {x: -0.48000000000000004, y: 0.64, z: 0.6000000000000001}
	// tForward: {x: 0.36, y: -0.48000000000000004, z: 0.8}

	/// Returns the local axis of the Transform that aligns the most with a direction.
	static getAxisVectorToDirection(/*Transform*/t, /*Vector3*/direction) {
		direction = direction.normalize();
		let axis = Vector3.right;

		let qua = t.getUnityQuaternion();
		let tRight = qua.clone().multiplyVector3( Vector3.right );
		let tUp = qua.clone().multiplyVector3( Vector3.up );
		let tForward = qua.clone().multiplyVector3( Vector3.forward );

		let dotX = Math.abs(tRight.normalize().dot(direction));
		let dotY = Math.abs(tUp.normalize().dot(direction));
		if (dotY > dotX) axis = Vector3.up;
		let dotZ = Math.abs(tForward.normalize().dot(direction));
		if (dotZ > dotX && dotZ > dotY) axis = Vector3.forward;

		return axis;
	}
}
