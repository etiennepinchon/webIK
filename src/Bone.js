import Point from './Point';
import Utils from './helpers/Utils';


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




  /*
   * Swings the Transform's axis towards the swing target
   * */
  swing(/*Vector3*/swingTarget, /*float*/weight = 1) {
    if (weight <= 0) return;

    window._scene.updateMatrixWorld();

    let tPosition = this.transform.getWorldPosition();
    let tRotation = this.transform.getWorldQuaternion();
    tRotation = new Quaternion(tRotation.x, tRotation.y, tRotation.z, tRotation.w);

    let from = tRotation.clone().multiply(this.axis);
    let r = Quaternion.fromToRotation(from, swingTarget.clone().sub(tPosition) );

    let q;
    if (weight >= 1) {
      q = r.clone().multiply( tRotation );
      this.transform.setWorldQuaternion( new THREE.Quaternion(q.x, q.y, q.z, q.w) );
      return;
    }

    q = Quaternion.identity.lerp(r, weight).multiply( tRotation )
    this.transform.setWorldQuaternion( new THREE.Quaternion(q.x, q.y, q.z, q.w) );
  }




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




  /*
   * Swings the Transform's axis towards the swing target on the XY plane only
   * */
  swing2D(swingTarget, weight = 1) {
    if (weight <= 0) return;

    window._scene.updateMatrixWorld();

    let tPosition = this.transform.getWorldPosition();
    let tRotation = this.transform.getWorldQuaternion();
    tRotation = new Quaternion(tRotation.x, tRotation.y, tRotation.z, tRotation.w);

    let from = tRotation.clone().multiplyVector3(this.axis);
    let to = swingTarget.clone().sub(tPosition);

    let angleFrom = Math.degrees(Math.atan2(from.x, from.y));
    let angleTo = Math.degrees(Math.atan2(to.x, to.y));

    let rot = Quaternion.angleAxis( Math.deltaAngle(angleFrom, angleTo) * weight, Vector3.back ).multiply( tRotation )

    this.transform.setWorldQuaternion(new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w));
  }




  /*
   * Moves the bone to the solver position
   * */
  setToSolverPosition() {
    window._scene.updateMatrixWorld();

    this.transform.setWorldPosition(this.solverPosition);
  }

}
