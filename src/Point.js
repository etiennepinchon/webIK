import Utils from './helpers/Utils';

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
    this.defaultLocalPosition = this.transform.position.clone();

    let rot = this.transform.quaternion.clone()
    this.defaultLocalRotation = new Quaternion(rot.x, rot.y, rot.z, rot.w);
  }




  /// Fixes the transform to it's default local state.
  // @TODO_CHECK: setFromQuaternion might be a failure point
  fixTransform() {
    if (!this.transform.position.equals(this.defaultLocalPosition))
      transform.position.copy( this.defaultLocalPosition );

    let rot = this.transform.quaternion;
    rot= new Quaternion(rot.x, rot.y, rot.z, rot.w);
    if (!Quaternion.equals(rot, this.defaultLocalRotation))
      transform.rotation.setFromQuaternion( this.defaultLocalRotation );
  }




  /// Updates the solverPosition (in world space).
  updateSolverPosition() {
    window._scene.updateMatrixWorld();
    this.solverPosition = this.transform.getWorldPosition();
  }




  /// Updates the solverPosition (in local space).
  updateSolverLocalPosition() {
    this.solverPosition = this.transform.position.clone();
  }




  /// Updates the solverPosition/Rotation (in world space).
  updateSolverState() {
    window._scene.updateMatrixWorld();
    this.solverPosition = this.transform.getWorldPosition();
    let rot = this.transform.getWorldQuaternion();
    this.solverRotation = new Quaternion(rot.x, rot.y, rot.z, rot.w);
  }




  /// Updates the solverPosition/Rotation (in local space).
  updateSolverLocalState() {
    this.solverPosition = this.transform.position.clone();
    let rot = this.transform.quaternion;
    this.solverRotation = new Quaternion(rot.x, rot.y, rot.z, rot.w);
  }
}
