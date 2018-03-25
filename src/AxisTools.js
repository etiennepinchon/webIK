/// The Cartesian axes.
export const Axis = {
	X: 0,
	Y: 1,
	Z: 2
};

/// Contains tools for working with Axes that have no positive/negative directions.
export default class AxisTools {

	/// Converts an Axis to Vector3.
	static toVector3(axis) {
		if (axis === Axis.X) return Vector3.right;
		if (axis === Axis.Y) return Vector3.up;
		return Vector3.forward;
	}

	/// Converts a Vector3 to Axis.
	static toAxis(v) {
		let absX = Math.abs(v.x);
		let absY = Math.abs(v.y);
		let absZ = Math.abs(v.z);

		let d = Axis.X;
		if (absY > absX && absY > absZ) d = Axis.Y;
		if (absZ > absX && absZ > absY) d = Axis.Z;
		return d;
	}

	/// Returns the Axis of the Transform towards a world space position.
	static getAxisToPoint(t, worldPosition) {
		let axis = this.getAxisVectorToPoint(t, worldPosition);
		if (axis.length() == Vector3.right.length()) return Axis.X;
		if (axis.length() == Vector3.up.length()) return Axis.Y;
		return Axis.Z;
	}

	/// Returns the Axis of the Transform towards a world space direction.
	static getAxisToDirection(t, direction) {
		let axis = this.getAxisVectorToDirection(t, direction);
		if (axis.length() == Vector3.right.length()) return Axis.X;
		if (axis.length() == Vector3.up.length()) return Axis.Y;
		return Axis.Z;
	}

	/// Returns the local axis of the Transform towards a world space position.
	static getAxisVectorToPoint(t, worldPosition) {
		return this.getAxisVectorToDirection(t, worldPosition.clone().sub( t.position) );
	}

	/// Returns the local axis of the Transform that aligns the most with a direction.
	static getAxisVectorToDirection(t, direction) {
		direction = direction.normalize();
		let axis = Vector3.right;

		let rot = t.quaternion.clone();
		let tRight = rot.multiply( Vector3.right );
		let tUp = rot.multiply( Vector3.up );
		let tFormward = rot.multiply( Vector3.forward );

		let dotX = Math.abs(tRight.normalize().dot(direction));
		let dotY = Math.abs(tUp.normalize().dot(direction));
		if (dotY > dotX) axis = Vector3.up;
		let dotZ = Math.abs(tFormward.normalize().dot(direction));
		if (dotZ > dotX && dotZ > dotY) axis = Vector3.forward;

		return axis;
	}
}
