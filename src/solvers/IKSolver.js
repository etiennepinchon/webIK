// The base abstract class for all %IK solvers
export default class IKSolver {


  constructor() {
    /// The IK position.
    this.IKPosition = new Vector3();

    /// The %IK position weight or the master weight of the solver.
    this.IKPositionWeight = 1;

    this.firstInitiation = true;
    this.root = null;
  }




  /// Determines whether this instance is valid or not.
  isValid() { return true; }




  /// Initiate the solver with specified root Transform. Use only if this %IKSolver is not a member of an %IK component.
  initiate(/*Transform*/root) {
    if (this.onPreInitiate) this.onPreInitiate();

    if (!root) console.error("Initiating IKSolver with null root Transform.");
    this.root = root;
    this.initiated = false;

    if (!this.isValid()) {
      return;
    }

    this.onInitiate();
    this.storeDefaultLocalState();
    this.initiated = true;
    this.firstInitiation = false;

    if (this.onPostInitiate) this.onPostInitiate();
  }



  /// Updates the %IK solver. Use only if this %IKSolver is not a member of an %IK component or the %IK component has been disabled and you intend to manually control the updating.
  update() {
    if (this.onPreUpdate) this.onPreUpdate();

    if (this.firstInitiation) this.initiate(this.root); // when the IK component has been disabled in Awake, this will initiate it.
    if (!this.initiated) return;

    this.onUpdate();

    if (this.onPostUpdate) this.onPostUpdate();
  }








  /// Gets the %IK position.
  getIKPosition() {
    return this.IKPosition;
  }




  /// Sets the %IK position.
  setIKPosition(position) {
    this.IKPosition = position;
  }




  /// Gets the %IK position weight.
  getIKPositionWeight() {
    return this.IKPositionWeight;
  }




  /// Sets the %IK position weight.
  setIKPositionWeight(weight) {
    this.IKPositionWeight = Math.clamp(weight, 0, 1);
  }




  /// Gets the root Transform.
  getRoot() {
    return this.root;
  }


  /// Delegates solver update events.
  updateDelegate() {}

  /// Delegates solver iteration events.
  iterationDelegate(i){}

  /// Called before initiating the solver.
  onPreInitiate(){};

  /// Called after initiating the solver.
  onPostInitiate(){};

  /// Called before updating.
  onPreUpdate(){};

  /// Called after writing the solved pose
  onPostUpdate() {}

  onInitiate() {}
  onUpdate() {}

  /// Checks if an array of objects contains any duplicates.
  static containsDuplicateBone(/*Bone[]*/bones) {
    for (let i = 0; i < bones.length; i++) {
      for (let i2 = 0; i2 < bones.length; i2++) {
        if (i != i2 && bones[i].transform === bones[i2].transform) return bones[i].transform;
      }
    }
    return;
  }




  /*
   * Make sure the bones are in valid Hierarchy
   * */
  static hierarchyIsValid(bones) {
    // for (let i = 1; i < bones.length; i++) {
    //   // If parent bone is not an ancestor of bone, the hierarchy is invalid
    //   if (!Hierarchy.IsAncestor(bones[i].transform, bones[i - 1].transform)) {
    //     return false;
    //   }
    // }
    return true;
  }




  // Calculates bone lengths and axes, returns the length of the entire chain
  static preSolveBones(bones) {
    let length = 0;

    window._scene.updateMatrixWorld();


    // @TODO: CONVERT TO C# rotation
    for (let i = 0; i < bones.length; i++) {

      bones[i].solverPosition = bones[i].transform.getWorldPosition();
      bones[i].solverRotation = bones[i].transform.getUnityWorldQuaternion();

      if (bones[i].solverRotation.w == undefined) {
        console.error('corrupt data bones[i].solverRotation')
        throw new Error()
      }

    }

    for (let i = 0; i < bones.length; i++) {
      if (i < bones.length - 1) {
        bones[i].sqrMag = (bones[i + 1].solverPosition.clone().sub(bones[i].solverPosition)).lengthSq();
        bones[i].length = Math.sqrt(bones[i].sqrMag);
        length += bones[i].length;

        let pos = bones[i + 1].solverPosition.clone().sub( bones[i].solverPosition);
        bones[i].axis = bones[i].solverRotation.clone().inverse().multiplyVector3( pos );
      } else {
        bones[i].sqrMag = 0;
        bones[i].length = 0;
      }
    }

    return length;
  }

}
