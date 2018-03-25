
/// The most basic element type in the %IK chain that all other types extend from.
export default class Point {

  constructor() {
    /// The transform.
    this.transform;

    /// The weight of this bone in the solver.
    this.weight = 1;

    /// Virtual position in the %IK solver.
    this.solverPosition = new Vector3();

    /// Virtual rotation in the %IK solver.
    this.solverRotation = Quaternion.identity;

    /// The default local position of the Transform.
    this.defaultLocalPosition = new Vector3();

    /// The default local rotation of the Transform.
    this.defaultLocalRotation = Quaternion.identity;
  }

  /// Stores the default local state of the point.
  storeDefaultLocalState() {
    this.defaultLocalPosition = this.transform.position;
    this.defaultLocalRotation = this.transform.rotation;
  }

  /// Fixes the transform to it's default local state.
  fixTransform() {
    if (this.transform.position != this.defaultLocalPosition) transform.position = this.defaultLocalPosition;
    if (this.transform.rotation != this.defaultLocalRotation) transform.rotation = this.defaultLocalRotation;
  }

  /// Updates the solverPosition (in world space).
  updateSolverPosition() {
    this.solverPosition = this.transform.position;
  }

  /// Updates the solverPosition (in local space).
  updateSolverLocalPosition() {
    this.solverPosition = this.transform.localPosition;
  }

  /// Updates the solverPosition/Rotation (in world space).
  updateSolverState() {
    this.solverPosition = this.transform.position;
    this.solverRotation = this.transform.rotation;
  }

  /// Updates the solverPosition/Rotation (in local space).
  updateSolverLocalState() {
    this.solverPosition = this.transform.position;
    this.solverRotation = this.transform.rotation;
  }
}
