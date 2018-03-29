import Point from './Point';

/// %Bone type of element in the %IK chain. Used in the case of skeletal Transform hierarchies.
export default class Bone extends Point {

  /// Gets the rotation limit component from the Transform if there is any.
  // @TODO: CHECK WE GET THE transform.rotationLimit
  get rotationLimit(){
    if (!this.isLimited) return null;
    if (this._rotationLimit === null) {
      this._rotationLimit = this.transform.rotationLimit;
    }
    this.isLimited = this._rotationLimit != null;
    return this._rotationLimit;
  }

  set rotationLimit(value) {
    this._rotationLimit = value;
    this.isLimited = value !== null;
  }




  constructor(transform, weight) {
    super();

    /// The length of the bone.
    this.length = 0;

    /// The sqr mag of the bone.
    this.sqrMag = 0;

    /// Local axis to target/child bone.
    this.axis = Vector3.right.negate();

    if (transform) this.transform = transform;
    if (weight) this.weight = weight;

    this._rotationLimit = null;//RotationLimit
    this.isLimited = true;
  }

  // Unity: (0.3, 0.0, 0.5, 0.8)
  // Web:  {_x: -0.64, _y: -0.36, _z: -0.66, _w: 0.11 }

  /*
   * Swings the Transform's axis towards the swing target
   * */
  swing(/*Vector3*/swingTarget, /*float*/weight = 1) {
    if (weight <= 0) return;

    window._scene.updateMatrixWorld();

    let tPosition = this.transform.getWorldPosition();
    let tRotation = this.transform.getUnityWorldQuaternion();

    let from = tRotation.clone().multiply(this.axis);
    let r = Quaternion.fromToRotation(from, swingTarget.clone().sub(tPosition) );

    if (weight >= 1) {
      this.transform.setUnityWorldQuaternion( r.clone().multiply( tRotation ) );
      return;
    }

    let q = Quaternion.identity.lerp(r, weight).multiply( tRotation )
    this.transform.setUnityWorldQuaternion( q );
  }

  // Unity: (0.3, 0.1, 0.3, 0.9)
  // Web: {x: 0, y: 0.6970850812277354, z: -0.6053633600135597, w: 0.3841973345597474}

  static solverSwing(/*Bone[]*/bones, /*int*/index, /*Vector3*/swingTarget, /*float*/weight = 1) {
    if (weight <= 0) return;

    let r = Quaternion.fromToRotation(
      bones[index].solverRotation.clone().multiplyVector3( bones[index].axis ),
      swingTarget.clone().sub(bones[index].solverPosition)
    );

    if (weight >= 1) {
      for (let i = index; i < bones.length; i++) {
        bones[i].solverRotation = r.clone().multiply(bones[i].solverRotation);
      }
      return;
    }

    for (let i = index; i < bones.length; i++) {
      bones[i].solverRotation = Quaternion.identity.lerp(r, weight).multiply( bones[i].solverRotation );
    }
  }

  // Unity: (0.3, 0.1, 0.3, 0.9)
  // Web:  {_x: -0.7299874262229405, _y: -0.45982768987280775, _z: -0.5049216638110121, _w: 0.027036393934159464 }

  /*
   * Swings the Transform's axis towards the swing target on the XY plane only
   * */
  swing2D(swingTarget, weight = 1) {
    if (weight <= 0) return;

    window._scene.updateMatrixWorld();

    let tPosition = this.transform.getWorldPosition();
    let tRotation = this.transform.getUnityWorldQuaternion();

    let from = tRotation.clone().multiplyVector3(this.axis);
    let to = swingTarget.clone().sub(tPosition);

    let angleFrom = Math.degrees(Math.atan2(from.x, from.y));
    let angleTo = Math.degrees(Math.atan2(to.x, to.y));

    let q = Quaternion.angleAxis( Math.deltaAngle(angleFrom, angleTo) * weight, Vector3.back ).multiply( tRotation );

    this.transform.setUnityWorldQuaternion(q);
  }




  /*
   * Moves the bone to the solver position
   * */
  setToSolverPosition() {
    window._scene.updateMatrixWorld();

    this.transform.setWorldPosition(this.solverPosition);
  }

}
