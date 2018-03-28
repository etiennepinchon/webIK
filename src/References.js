export default class References {

  constructor(options={}) {
    if (options.root) this.root = options.root;
    if (options.pelvis) this.pelvis = options.pelvis;
    if (options.spine) this.spine = options.spine;
    if (options.chest) this.chest = options.chest; // Optional
    if (options.neck) this.neck = options.neck; // Optional
    if (options.head) this.head = options.head;
    if (options.leftShoulder) this.leftShoulder = options.leftShoulder; // Optional
    if (options.leftUpperArm) this.leftUpperArm = options.leftUpperArm;
    if (options.leftForearm) this.leftForearm = options.leftForearm;
    if (options.leftHand) this.leftHand = options.leftHand;
    if (options.rightShoulder) this.rightShoulder = options.rightShoulder; // Optional
    if (options.rightUpperArm) this.rightUpperArm = options.rightUpperArm;
    if (options.rightForearm) this.rightForearm = options.rightForearm;
    if (options.rightHand) this.rightHand = options.rightHand;
    if (options.leftThigh) this.leftThigh = options.leftThigh;
    if (options.leftCalf) this.leftCalf = options.leftCalf;
    if (options.leftFoot) this.leftFoot = options.leftFoot;
    if (options.leftToes) this.leftToes = options.leftToes; // Optional
    if (options.rightThigh) this.rightThigh = options.rightThigh;
    if (options.rightCalf) this.rightCalf = options.rightCalf;
    if (options.rightFoot) this.rightFoot = options.rightFoot;
    if (options.rightToes) this.rightToes = options.rightToes; // Optional
  }




  // Returns an array of all the Transforms in the definition.
  getTransforms() {
  	return [
  		this.root,
      this.pelvis,
      this.spine,
      this.chest,
      this.neck,
      this.head,
      this.leftShoulder,
      this.leftUpperArm,
      this.leftForearm,
      this.leftHand,
      this.rightShoulder,
      this.rightUpperArm,
      this.rightForearm,
      this.rightHand,
      this.leftThigh,
      this.leftCalf,
      this.leftFoot,
      this.leftToes,
      this.rightThigh,
      this.rightCalf,
      this.rightFoot,
      this.rightToes
  	];
  }




  // Returns true if all required Transforms have been assigned (shoulder, toe and neck bones are optional).
	get isFilled() {
		if (
			!this.root ||
			!this.pelvis ||
			!this.spine ||
			!this.head ||
			!this.leftUpperArm ||
			!this.leftForearm ||
			!this.leftHand ||
			!this.rightUpperArm ||
			!this.rightForearm ||
			!this.rightHand ||
			!this.leftThigh ||
			!this.leftCalf ||
			!this.leftFoot ||
			!this.rightThigh ||
			!this.rightCalf ||
			!this.rightFoot
		) return false;

		// Shoulder, toe and neck bones are optional
		return true;
	}




  // Returns true if none of the Transforms have been assigned.
  get isEmpty() {
		if (
			this.root ||
			this.pelvis ||
			this.spine ||
			this.head ||
			this.leftUpperArm ||
			this.leftForearm ||
			this.leftHand ||
			this.rightUpperArm ||
			this.rightForearm ||
			this.rightHand ||
			this.leftThigh ||
			this.leftCalf ||
			this.leftFoot ||
			this.rightThigh ||
			this.rightCalf ||
			this.rightFoot
		) return false;

		// Shoulder, toe and neck bones are optional
		return true;
	}
}
