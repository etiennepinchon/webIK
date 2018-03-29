
// DEBUG OK

/// The most basic element type in the %IK chain that all other types extend from.
export default class Point {

  constructor(transform) {
    /// The transform.
    this.transform;
    if (transform) this.transform = transform;

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

  // OK
  // Unity:
  // defaultLocalPosition: (52.0, 32.0, 42.0)
  // defaultLocalRotation: (0.3, 0.1, 0.3, 0.9)
  // Web:
  // defaultLocalPosition: {x: 52, y: 32, z: 42}
  // defaultLocalRotation: {x: 0.3, y: 0.1, z: 0.3, w: 0.9}

  /// Stores the default local state of the point.
  storeDefaultLocalState() {
    this.defaultLocalPosition = this.transform.position.clone();
    this.defaultLocalRotation = this.transform.getUnityQuaternion();
  }

  // OK
  // Unity:
  // transform.position: (52.0, 32.0, 42.0)
  // transform.quaternion: (0.3, 0.1, 0.3, 0.9)
  // Web:
  // transform.position: {x: 52, y: 32, z: 42}
  // transform.quaternion: {_x: 0.3, _y: 0.1, _z: 0.3, _w: 0.9 }

  /// Fixes the transform to it's default local state.
  fixTransform() {
    if (!this.transform.position.equals(this.defaultLocalPosition))
      this.transform.position.copy( this.defaultLocalPosition );

    if (!Quaternion.equals(this.transform.getUnityQuaternion(), this.defaultLocalRotation))
      this.transform.setUnityQuaternion( this.defaultLocalRotation );
  }

  // OK
  // Unity:
  // solverPosition: (68.5, 60.3, 83.4)
  // Web:
  // solverPosition: {x: 67.98258, y: 58.665400000000005, z: 86.55008}

  /// Updates the solverPosition (in world space).
  updateSolverPosition() {
    window._scene.updateMatrixWorld();
    this.solverPosition = this.transform.getWorldPosition();
  }

  // OK
  // Unity:
  // solverPosition: (52.0, 32.0, 42.0)
  // Web:
  // solverPosition: {x: 52, y: 32, z: 42}

  /// Updates the solverPosition (in local space).
  updateSolverLocalPosition() {
    this.solverPosition = this.transform.position.clone();
  }

  // OK
  // Unity:
  // solverPosition: (68.5, 60.3, 83.4)
  // solverRotation: (0.6, 0.4, 0.4, 0.6)
  // Web:
  // solverPosition: {x: 67.98258, y: 58.665400000000005, z: 86.55008}
  // solverRotation: {x: 0.5093835204935515, y: 0.3344139970726693, z: 0.359995430161906, w: 0.7013726513687125}

  /// Updates the solverPosition/Rotation (in world space).
  updateSolverState() {
    window._scene.updateMatrixWorld();
    this.solverPosition = this.transform.getWorldPosition();
    this.solverRotation = this.transform.getUnityWorldQuaternion();
  }

  // OK
  // Unity:
  // solverPosition: (52.0, 32.0, 42.0)
  // solverRotation: (0.3, 0.1, 0.3, 0.9)
  // Web:
  // solverPosition: {x: 52, y: 32, z: 42}
  // solverRotation: {x: 0.3, y: 0.1, z: 0.3, w: 0.9}

  /// Updates the solverPosition/Rotation (in local space).
  updateSolverLocalState() {
    this.solverPosition = this.transform.position.clone();
    this.solverRotation = this.transform.getUnityQuaternion();
  }
}
