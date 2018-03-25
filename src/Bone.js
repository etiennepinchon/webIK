import Point from './Point';

/// %Bone type of element in the %IK chain. Used in the case of skeletal Transform hierarchies.
export default class Bone extends Point {

  /// Gets the rotation limit component from the Transform if there is any.
  get rotationLimit(){
    if (!this.isLimited) return null;
    if (this._rotationLimit == null) this._rotationLimit = this.transform.rotationLimit;
    this.isLimited = this._rotationLimit != null;
    return this._rotationLimit;
  }

  set rotationLimit(value){
    this._rotationLimit = value;
    this.isLimited = value != null;
  }

  /*
   * Swings the Transform's axis towards the swing target
   * */
  swing(swingTarget, weight = 1) {
    if (weight <= 0) return;

    let r = Quaternion.FromToRotation(this.transform.rotation.clone().multiply(axis), swingTarget.clone().sub(this.transform.position) );

    if (weight >= 1) {
      this.transform.rotation.set( r.clone().multiply(this.transform.rotation) );
      return;
    }

    this.transform.rotation.set( Quaternion.identity.lerp(r, weight).multiply( this.transform.rotation ) );
  }

  static solverSwing(bones, index, swingTarget, weight = 1) {
    if (weight <= 0) return;

    let r = Quaternion.FromToRotation(bones[index].solverRotation.clone().multiply( bones[index].axis ), swingTarget.clone().sub(bones[index].solverPosition));

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

  /*
   * Swings the Transform's axis towards the swing target on the XY plane only
   * */
  swing2D(swingTarget, weight = 1) {
    if (weight <= 0) return;

    let from = this.transform.rotation.clone().multiply(axis);
    let to = swingTarget.clone().sub(transform.position);

    let angleFrom = Math.degrees(Math.atan2(from.x, from.y));
    let angleTo = Math.degrees(Math.atan2(to.x, to.y));

    this.transform.rotation.set(
      new Quaternion().setFromAxisAngle(
        Vector3.back, Math.deltaAngle(angleFrom, angleTo) * weight)
        .multiply(this.transform.rotation));
  }

  /*
   * Moves the bone to the solver position
   * */
  setToSolverPosition() {
    this.transform.position.set(this.solverPosition);
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

    this._rotationLimit;//RotationLimit
    this.isLimited = true;
  }

}
