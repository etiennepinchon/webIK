import IKSolver from './IKSolver';
import Spine from './IKSolverVRSpine';
import Arm from './IKSolverVRArm';
import Leg from './IKSolverVRLeg';
import Locomotion from './IKSolverVRLocomotion';
import {
  PositionOffset,
  RotationOffset,
  VirtualBone
} from './IKSolverVRUtilities';
import AxisTools from './AxisTools';
import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';
import Keyframe from './Keyframe';
import AnimationCurve from './AnimationCurve';

// Hybrid %IK solver designed for mapping a character to a VR headset and 2 hand controllers
export default class IKSolverVR extends IKSolver {

  constructor(options={}) {
    super();

		/// If true, will keep the toes planted even if head target is out of reach.
		this.plantFeet = true;

		/// Gets the root bone.
		this.rootBone = null;

		/// The spine solver.
		this.spine = new Spine(options.headTarget);

		/// The left arm solver.
		this.leftArm = new Arm(options.leftHandTarget);

		/// The right arm solver.
		this.rightArm = new Arm(options.rightHandTarget);

		/// The left leg solver.
		this.leftLeg = new Leg();

		/// The right leg solver.
		this.rightLeg = new Leg();

		/// The procedural locomotion solver.
		this.locomotion = new Locomotion();

		this.legs = [];
		this.arms = [];
		this.headPosition = Vector3.zero;
		this.headDeltaPosition = Vector3.zero;
		this.raycastOriginPelvis = Vector3.zero;
		this.lastOffset = Vector3.zero;
		this.debugPos1 = Vector3.zero;
		this.debugPos2 = Vector3.zero;
		this.debugPos3 = Vector3.zero;
		this.debugPos4 = Vector3.zero;

    // Private
    this.solverTransforms = [];
    this.hasChest = false, this.hasNeck = false, this.hasShoulders = false, this.hasToes = false;
    this.readPositions = [];
    this.readRotations = [];
    this.solvedPositions = new Array(2);
    this.solvedRotations = new Array(22);
    this.defaultPelvisLocalPosition = new Vector3();
    this.defaultLocalRotations = new Array(21);

    this.rootV = new Vector3();
    this.rootVelocity = new Vector3();
    this.bodyOffset = new Vector3();
    this.supportLegIndex = 0;
  }




  setToReferences(references) {
  	if (!references.isFilled) {
  		console.error("Invalid references, one or more Transforms are missing.");
  		return;
  	}

  	this.solverTransforms = references.getTransforms();

  	this.hasChest = this.solverTransforms [3] != undefined;
  	this.hasNeck = this.solverTransforms[4] != undefined;
  	this.hasShoulders = this.solverTransforms[6] != undefined && this.solverTransforms[10] != undefined;
  	this.hasToes = this.solverTransforms[17] != undefined && this.solverTransforms[21] != undefined;

  	this.readPositions = new Array(this.solverTransforms.length);
  	this.readRotations = new Array(this.solverTransforms.length);

  	this.defaultAnimationCurves();
  	this.guessHandOrientations(references, true);
  }




  // Guesses the hand bones orientations ('Wrist To Palm Axis' and "Palm To Thumb Axis" of the arms) based on the provided references. if onlyIfZero is true, will only guess an orientation axis if it is Vector3.zero.
	guessHandOrientations(/*References*/references, /*bool*/onlyIfZero) {
		if (!references.isFilled) {
			console.error("VRIK References are not filled in, can not guess hand orientations. Right-click on VRIK header and slect 'Guess Hand Orientations' when you have filled in the References.");
			return;
		}

		if (this.leftArm.wristToPalmAxis.equals(Vector3.zero) || !onlyIfZero) {
			this.leftArm.wristToPalmAxis = this.guessWristToPalmAxis(references.leftHand, references.leftForearm);
		}

		if (this.leftArm.palmToThumbAxis.equals(Vector3.zero) || !onlyIfZero) {
			this.leftArm.palmToThumbAxis = this.guessPalmToThumbAxis(references.leftHand, references.leftForearm);
		}

		if (this.rightArm.wristToPalmAxis.equals(Vector3.zero) || !onlyIfZero) {
			this.rightArm.wristToPalmAxis = this.guessWristToPalmAxis(references.rightHand, references.rightForearm);
		}

		if (this.rightArm.palmToThumbAxis.equals(Vector3.zero) || !onlyIfZero) {
			this.rightArm.palmToThumbAxis = this.guessPalmToThumbAxis(references.rightHand, references.rightForearm);
		}
	}




  // Set default values for the animation curves if they have no keys.
	defaultAnimationCurves() {
		if (this.locomotion.stepHeight === null) this.locomotion.stepHeight = new AnimationCurve();
		if (this.locomotion.heelHeight === null) this.locomotion.heelHeight = new AnimationCurve();

		if (this.locomotion.stepHeight.keys.length == 0) {
			this.locomotion.stepHeight.keys = this.getSineKeyframes(0.03);
		}

		if (this.locomotion.heelHeight.keys.length == 0) {
			this.locomotion.heelHeight.keys = this.getSineKeyframes(0.03);
		}
	}




  /// Adds position offset to a body part. Position offsets add to the targets in VRIK.
	addPositionOffset(/*PositionOffset*/positionOffset, /*Vector3*/value) {
		switch(positionOffset) {
  		case PositionOffset.Pelvis: this.spine.pelvisPositionOffset.add(value); return;
  		case PositionOffset.Chest: this.spine.chestPositionOffset.add(value); return;
  		case PositionOffset.Head: this.spine.headPositionOffset.add(value); return;
  		case PositionOffset.LeftHand: this.leftArm.handPositionOffset.add(value); return;
  		case PositionOffset.RightHand: this.rightArm.handPositionOffset.add(value); return;
  		case PositionOffset.LeftFoot: this.leftLeg.footPositionOffset.add(value); return;
  		case PositionOffset.RightFoot: this.rightLeg.footPositionOffset.add(value); return;
  		case PositionOffset.LeftHeel: this.leftLeg.heelPositionOffset.add(value); return;
  		case PositionOffset.RightHeel: this.rightLeg.heelPositionOffset.add(value); return;
		}
	}




	// Adds rotation offset to a body part. Rotation offsets add to the targets in VRIK
  // @TODO_CHECK WARNING WITH THE EULER METHODS....
	addRotationOffset(/*RotationOffset*/rotationOffset, /*Vector3*/value) {
		this.addRotationOffsetFromQuaternion(rotationOffset, new THREE.Euler(value.x, value.y, value.z/*, 'YXZ'*/) );
	}




	// Adds rotation offset to a body part. Rotation offsets add to the targets in VRIK
	addRotationOffsetFromQuaternion(/*RotationOffset*/rotationOffset, /*Quaternion*/value) {
		switch(rotationOffset) {
  		case RotationOffset.Pelvis: this.spine.pelvisRotationOffset = value.multiplyVector3(this.spine.pelvisRotationOffset); return;
  		case RotationOffset.Chest: this.spine.chestRotationOffset = value.multiplyVector3(this.spine.chestRotationOffset); return;
  		case RotationOffset.Head: this.spine.headRotationOffset = value.multiplyVector3(this.spine.headRotationOffset); return;
		}
	}




  // Call this in each Update if your avatar is standing on a moving platform
	addPlatformMotion(/*Vector3*/deltaPosition, /*Quaternion*/deltaRotation, /*Vector3*/platformPivot) {
		this.locomotion.addDeltaPosition(deltaPosition);
		this.raycastOriginPelvis.add(deltaPosition);

		this.locomotion.addDeltaRotation(deltaRotation, platformPivot);
		this.spine.faceDirection = deltaRotation.clone().multiplyVector3(spine.faceDirection);
	}




  // Resets all tweens, blendings and lerps. Call this after you have teleported the character.
	reset() {
		if (!this.initiated) return;

		this.updateSolverTransforms();
		this.read(this.readPositions, this.readRotations, this.hasChest, this.hasNeck, this.hasShoulders, this.hasToes);

		this.spine.faceDirection = this.rootBone.readRotation.multiplyVector3(new Vector3(0, 0, 1));
		this.locomotion.reset(this.readPositions, this.readRotations);
		this.raycastOriginPelvis = this.spine.pelvis.readPosition.clone();
	}




	storeDefaultLocalState() {
		this.defaultPelvisLocalPosition = this.solverTransforms[1].position.clone();
		for (let i = 1; i < this.solverTransforms.length; i++) {
			if (this.solverTransforms[i]) {
        let rot = this.solverTransforms[i].quaternion.clone();
        this.defaultLocalRotations[i - 1] = new Quaternion(rot.x, rot.y, rot.z, rot.w);
      }
		}
	}




  // Reset transformations.
  // @TODO_CHECK: setFromQuaternion
	fixTransforms() {
    return
		this.solverTransforms[1].position.copy(this.defaultPelvisLocalPosition);

    for (let i = 1; i < this.solverTransforms.length; i++) {
		    if (this.solverTransforms[i]) {
          let qua = this.defaultLocalRotations[i - 1].clone()

          if (qua.w == undefined || isNaN(qua.w)) {
  					console.error('corrupt data qua')
  					throw new Error()
  				}

          this.solverTransforms[i].rotation.setFromQuaternion( new THREE.Quaternion(qua.x, qua.y, qua.z, qua.w) );
        }
		}
	}





	isValid() {
		if (!this.solverTransforms || !this.solverTransforms.length) {
			throw new Error("Trying to initiate IKSolverVR with invalid bone references.");
			return false;
		}

		if (this.leftArm.wristToPalmAxis.equals(Vector3.zero)) {
			throw new Error("Left arm 'Wrist To Palm Axis' needs to be set in VRIK. Please select the hand bone, set it to the axis that points from the wrist towards the palm. If the arrow points away from the palm, axis must be negative.");
			return false;
		}

		if (this.rightArm.wristToPalmAxis.equals(Vector3.zero)) {
			throw new Error("Right arm 'Wrist To Palm Axis' needs to be set in VRIK. Please select the hand bone, set it to the axis that points from the wrist towards the palm. If the arrow points away from the palm, axis must be negative.");
			return false;
		}

		if (this.leftArm.palmToThumbAxis.equals(Vector3.zero)) {
			throw new Error("Left arm 'Palm To Thumb Axis' needs to be set in VRIK. Please select the hand bone, set it to the axis that points from the palm towards the thumb. If the arrow points away from the thumb, axis must be negative.");
			return false;
		}

		if (this.rightArm.palmToThumbAxis.equals(Vector3.zero)) {
			throw new Error("Right arm 'Palm To Thumb Axis' needs to be set in VRIK. Please select the hand bone, set it to the axis that points from the palm towards the thumb. If the arrow points away from the thumb, axis must be negative.");
			return false;
		}

		return true;
	}




  getNormal(/*Transform[]*/transforms) {
    window._scene.updateMatrixWorld();

		const normal = new Vector3();
		const centroid = new Vector3();

		for (let i = 0; i < transforms.length; i++) {
			centroid.add(transforms[i].getWorldPosition());
		}
		centroid.divide(transforms.length);

		for (let i = 0; i < transforms.length - 1; i++) {
			normal.add( transforms[i].getWorldPosition().sub(centroid)
                    .cross( transforms[i + 1].getWorldPosition().sub(centroid) )
                    .normalize() );
		}

		return normal;
	}




  guessWristToPalmAxis(/*Transform*/hand, /*Transform*/forearm) {
    window._scene.updateMatrixWorld();

		const toForearm = forearm.getWorldPosition().sub(hand.getWorldPosition());
		let axis = AxisTools.toVector3(AxisTools.getAxisToDirection(hand, toForearm));

    let rot = hand.getWorldQuaternion();
    rot = new Quaternion(rot.x, rot.y, rot.z, rot.w);

		if (toForearm.dot(rot.multiplyVector3(axis)) > 0) axis = axis.negate();
		return axis;
	}




	guessPalmToThumbAxis(/*Transform*/hand, /*Transform*/forearm) {
    window._scene.updateMatrixWorld();

		if (!hand.children.length) {
			console.warn("Hand " + hand.name + " does not have any fingers, VRIK can not guess the hand bone's orientation. Please assign 'Wrist To Palm Axis' and 'Palm To Thumb Axis' manually for both arms in VRIK settings.", hand);
			return new Vector3();
		}

		let closestSqrMag = Infinity;
		let thumbIndex = 0;

    let handPos = hand.getWorldPosition();
    let handQua = hand.getWorldQuaternion();
    handQua = new Quaternion(handQua.x, handQua.y, handQua.z, handQua.w)

    // @TODO_CHECK MAKE SURE THUMBS ARE INSIDE HANDS
		for (let i = 0; i < hand.children.length; i++) {
			let sqrMag = hand.children[i].getWorldPosition().sub(handPos).lengthSq();
			if (sqrMag < closestSqrMag) {
				closestSqrMag = sqrMag;
				thumbIndex = i;
			}
		}

    let forearmPos = forearm.getWorldPosition();

		let handNormal = handPos.clone().sub(forearmPos).cross( hand.children[thumbIndex].getWorldPosition().sub(handPos) );
		let toThumb = handNormal.cross(handPos.clone().sub(forearmPos));
		let axis = AxisTools.toVector3(AxisTools.getAxisToDirection(hand, toThumb));
		if (toThumb.dot(handQua.clone().multiplyVector3(axis)) < 0) axis = axis.negate();
		return axis;
	}




  getSineKeyframes(mag) {
		const keys = [
      new Keyframe(0, 0),
      new Keyframe(0.5, mag),
      new Keyframe(1, 0)
    ];
		return keys;
	}




	updateSolverTransforms() {
    window._scene.updateMatrixWorld();

		for (let i = 0; i < this.solverTransforms.length; i++) {
			if (this.solverTransforms[i]) {
				this.readPositions[i] = this.solverTransforms[i].getWorldPosition();
        let rot = this.solverTransforms[i].getWorldQuaternion();
				this.readRotations[i] = new Quaternion(rot.x, rot.y, rot.z, rot.w);
			}
		}
	}




	onInitiate() {
		this.updateSolverTransforms();
		this.read(this.readPositions, this.readRotations, this.hasChest, this.hasNeck, this.hasShoulders, this.hasToes);
	}




	onUpdate() {
		if (this.IKPositionWeight > 0) {
			this.updateSolverTransforms();

			this.read(this.readPositions, this.readRotations, this.hasChest, this.hasNeck, this.hasShoulders, this.hasToes);
			this.solve();
			this.write();

			this.writeTransforms();
		}
	}





  writeTransforms() {
    window._scene.updateMatrixWorld();

		for (let i = 0; i < this.solverTransforms.length; i++) {
			if (this.solverTransforms[i]) {
				if (i < 2 && /**/i != 0/**/) {
          let pos = V3Tools.lerp(this.solverTransforms[i].getWorldPosition(), this.getPosition(i), this.IKPositionWeight);
          //this.solverTransforms[i].setWorldPosition(pos);
        }

        // if (this.solverTransforms[i].quaternion.w == undefined || isNaN(this.solverTransforms[i].quaternion.w)) {
        //   console.error('corrupt data this.solverTransforms[i].quaternion')
        //   throw new Error()
        // }

        let rot = this.solverTransforms[i].getWorldQuaternion();
        rot = new Quaternion(rot.x, rot.y, rot.z, rot.w)

        let qua = QuaTools.lerp(rot, this.getRotation(i), this.IKPositionWeight);

        if (qua.w == undefined || isNaN(qua.w)) {
          console.error('corrupt data qua', rot, this.getRotation(i), this.IKPositionWeight)
          throw new Error()
        }

        // @TODO_CHECK: probably going to fail...
        if (i != 0) {

          //this.solverTransforms[i].applyQuaternion( new THREE.Quaternion(qua.x, qua.y, qua.z, qua.w) );
          this.solverTransforms[i].rotation.set(0.5, 0.5, 0.5)
          //this.solverTransforms[i].setWorldQuaternion( new THREE.Quaternion(qua.x, qua.y, qua.z, qua.w) );

        }


        // Convert unity quaternion to threejs quaternion..
        // var q = new THREE.Quaternion( -qua.x, qua.y, qua.z, -qua.w );
        // var v = new THREE.Euler();
        // v.setFromQuaternion( q );
        // v.y += Math.PI; // Y is 180 degrees off
        // v.z *= -1; // flip Z

				//this.solverTransforms[i].rotation.copy(v)//.applyQuaternion ( new Quaternion(qua.x, qua.y, qua.z, qua.w) );

			}
		}

	}




  read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes) {
		if (!this.rootBone) {
			this.rootBone = new VirtualBone(positions[0], rotations[0]);
		} else {
			this.rootBone.read(positions[0], rotations[0]);
		}

		this.spine.read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, 0, 1);
		this.leftArm.read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, hasChest? 3: 2, 6);
		this.rightArm.read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, hasChest? 3: 2, 10);
		this.leftLeg.read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, 1, 14);
		this.rightLeg.read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, 1, 18);

		for (let i = 0; i < rotations.length; i++) {
			if (i < 2) this.solvedPositions[i] = positions[i];
			this.solvedRotations[i] = rotations[i].clone();
		}

		if (!this.initiated) {
			this.legs = [ this.leftLeg, this.rightLeg ];
			this.arms = [ this.leftArm, this.rightArm ];

			this.locomotion.initiate(positions, rotations, hasToes);
			this.raycastOriginPelvis = this.spine.pelvis.readPosition.clone();
			this.spine.faceDirection = this.readRotations[0].clone().multiplyVector3(new Vector3(0, 0, 1));
		}
	}





  solve() {
			// Pre-Solving
			this.spine.preSolve();

			for (let arm of this.arms) arm.preSolve();
			for (let leg of this.legs) leg.preSolve();

			// Applying spine and arm offsets
			for (let arm of this.arms) arm.applyOffsets();
			this.spine.applyOffsets();

			// Spine
			this.spine.solve(this.rootBone, this.legs, this.arms);

			if (this.spine.pelvisPositionWeight > 0 && this.plantFeet) {
				console.warn("If VRIK 'Pelvis Position Weight' is > 0, 'Plant Feet' should be disabled to improve performance and stability.", this.root);
			}

			// Locomotion
			if (this.locomotion.weight > 0) {
				let leftFootPosition = new Vector3();
				let rightFootPosition = new Vector3();
				let leftFootRotation = new Quaternion();
				let rightFootRotation = new Quaternion();
				let leftFootOffset = 0;
				let rightFootOffset = 0;
				let leftHeelOffset = 0;
				let rightHeelOffset = 0;

				let out = this.locomotion.solve(this.rootBone, this.spine, this.leftLeg, this.rightLeg, this.leftArm, this.rightArm, this.supportLegIndex);

        leftFootPosition = out.leftFootPosition;
				rightFootPosition = out.rightFootPosition;
				leftFootRotation = out.leftFootRotation;
				rightFootRotation = out.rightFootRotation;
				leftFootOffset = out.leftFootOffset;
				rightFootOffset = out.rightFootOffset;
				leftHeelOffset = out.leftHeelOffset;
				rightHeelOffset = out.rightHeelOffset;

        // @TODO_CHECK: are we sure?
        let rootUp = this.root.quaternion.clone()
        rootUp = new Quaternion(rootUp.x, rootUp.y, rootUp.z, rootUp.w).multiplyVector3( Vector3.up );

				leftFootPosition.add(rootUp.clone().multiplyScalar(leftFootOffset));
				rightFootPosition.add(rootUp.clone().multiplyScalar(rightFootOffset));

				this.leftLeg.footPositionOffset.add( leftFootPosition.clone().sub(this.leftLeg.lastBone.solverPosition).multiplyScalar(this.IKPositionWeight).multiplyScalar(1 - this.leftLeg.positionWeight).multiplyScalar( this.locomotion.weight ));
				this.rightLeg.footPositionOffset.add( rightFootPosition.clone().sub(this.rightLeg.lastBone.solverPosition).multiplyScalar(this.IKPositionWeight).multiplyScalar(1 - this.rightLeg.positionWeight).multiplyScalar( this.locomotion.weight ));

				this.leftLeg.heelPositionOffset.add(rootUp.clone().multiplyScalar( leftHeelOffset ).multiplyScalar(this.locomotion.weight));
				this.rightLeg.heelPositionOffset.add(rootUp.clone().multiplyScalar( rightHeelOffset ).multiplyScalar(this.locomotion.weight));

				let /*Quaternion*/rotationOffsetLeft = QuaTools.fromToRotation(this.leftLeg.lastBone.solverRotation.clone(), leftFootRotation.clone());
				let /*Quaternion*/rotationOffsetRight = QuaTools.fromToRotation(this.rightLeg.lastBone.solverRotation.clone(), rightFootRotation.clone());

				rotationOffsetLeft = Quaternion.identity.lerp(rotationOffsetLeft, this.IKPositionWeight * (1 - this.leftLeg.rotationWeight) * this.locomotion.weight);
				rotationOffsetRight = Quaternion.identity.lerp(rotationOffsetRight, this.IKPositionWeight * (1 - this.rightLeg.rotationWeight) * this.locomotion.weight);

        this.leftLeg.footRotationOffset = rotationOffsetLeft.clone().multiply( this.leftLeg.footRotationOffset );
				this.rightLeg.footRotationOffset = rotationOffsetRight.clone().multiply( this.rightLeg.footRotationOffset );

				let footPositionC = this.leftLeg.position.clone().add(this.leftLeg.footPositionOffset).lerp(this.rightLeg.position.clone().add(this.rightLeg.footPositionOffset), 0.5);
				footPositionC = V3Tools.pointToPlane(footPositionC, this.rootBone.solverPosition, rootUp);

				this.rootVelocity.add( footPositionC.clone().sub(this.rootBone.solverPosition).multiplyScalar( Time.deltaTime * 10));
				let rootVelocityV = V3Tools.extractVertical(this.rootVelocity, rootUp, 1);
				this.rootVelocity.sub(rootVelocityV);

				let /*Vector3*/p = this.rootBone.solverPosition.clone().add( this.rootVelocity.clone().multiplyScalar( Time.deltaTime * 2 * this.locomotion.weight) );
				p = p.lerp(footPositionC, Time.deltaTime * this.locomotion.rootSpeed * this.locomotion.weight);
				this.rootBone.solverPosition = p;

				let bodyYOffset = leftFootOffset + rightFootOffset;
				this.bodyOffset = this.bodyOffset.lerp(rootUp.clone().multiplyScalar(bodyYOffset), Time.deltaTime * 3);
				this.bodyOffset = Vector3.zero.lerp(this.bodyOffset, this.locomotion.weight);
			}

			// Legs
			for (let leg of this.legs) {
				leg.applyOffsets();
			}

			if (!this.plantFeet) {
				this.spine.inverseTranslateToHead(legs, false, false, this.bodyOffset, 1);

				for (let leg of this.legs) {
          leg.translateRoot(this.spine.pelvis.solverPosition, this.spine.pelvis.solverRotation);
        }
				for (let leg of this.legs) {
					leg.solve();
				}
			}
      else {
				for (let i = 0; i < 2; i++) {
					this.spine.inverseTranslateToHead(this.legs, true, i == 0, this.bodyOffset, 1);

					for (let leg of this.legs) {
            leg.translateRoot(this.spine.pelvis.solverPosition.clone(), this.spine.pelvis.solverRotation.clone());
          }

					for (let leg of this.legs) {
						leg.solve();
					}

				}
			}


			// Arms
			for (let i = 0; i < this.arms.length; i++) {
				this.arms[i].translateRoot(this.spine.chest.solverPosition, this.spine.chest.solverRotation);
				this.arms[i].solve(i == 0);
			}

			// Reset offsets
			this.spine.resetOffsets();
			for (let leg of this.legs) leg.resetOffsets();
			for (let arm of this.arms) arm.resetOffsets();

			this.spine.pelvisPositionOffset.add( this.getPelvisOffset() );
			this.spine.chestPositionOffset.add( this.spine.pelvisPositionOffset );

			this.write();

			// Find the support leg
			this.supportLegIndex = -1;
			let shortestMag = Infinity;

			for (let i = 0; i < this.legs.length; i++) {
				let mag = this.legs[i].lastBone.solverPosition.clone().sub( this.legs[i].bones[0].solverPosition).lengthSq();
				if (mag < shortestMag) {
					this.supportLegIndex = i;
					shortestMag = mag;
				}
			}




      // console.log('as', this.legs[1].bones[3].solverRotation)
      // throw new Error()

		}




    getPosition(index) {
			if (index >= 2) console.error("Can only get root and pelvis positions from IKSolverVR. GetPosition index out of range.");
			return this.solvedPositions[index].clone();
		}



		getRotation(index) {
			return this.solvedRotations[index].clone();
		}




		write() {
			this.solvedPositions[0] = this.rootBone.solverPosition.clone();
			this.solvedRotations[0] = this.rootBone.solverRotation.clone();
			this.spine.write(this.solvedPositions, this.solvedRotations);

			for (let leg of this.legs) leg.write(this.solvedPositions, this.solvedRotations);
			for (let arm of this.arms) arm.write(this.solvedPositions, this.solvedRotations);
		}




		getPelvisOffset() {
			if (this.locomotion.weight <= 0) return Vector3.zero;
			if (this.locomotion.blockingLayers == -1) return Vector3.zero;

			// Origin to pelvis transform position
			let /*Vector3*/sampledOrigin = raycastOriginPelvis;
			sampledOrigin.y = this.spine.pelvis.solverPosition.y;
			let /*Vector3*/origin = this.spine.pelvis.readPosition.clone();
			origin.y = this.spine.pelvis.solverPosition.y;
			let /*Vector3*/direction = origin.clone().sub( sampledOrigin );
			//RaycastHit hit;

			//debugPos4 = sampledOrigin;

			// if (locomotion.raycastRadius <= 0) {
			// 	if (Physics.Raycast(sampledOrigin, direction, out hit, direction.magnitude * 1.1f, locomotion.blockingLayers)) {
			// 		origin = hit.point;
			// 	}
			// } else {
			// 	if (Physics.SphereCast(sampledOrigin, locomotion.raycastRadius * 1.1f, direction, out hit, direction.magnitude, locomotion.blockingLayers)) {
			// 		origin = sampledOrigin + direction.normalize() * hit.distance / 1.1f;
			// 	}
			// }

			let position = this.spine.pelvis.solverPosition.clone();
			direction = position.clone().sub( origin );

			//debugPos1 = origin;
			//debugPos2 = position;

			// if (this.locomotion.raycastRadius <= 0) {
			// 	if (Physics.Raycast(origin, direction, out hit, direction.magnitude, locomotion.blockingLayers)) {
			// 		position = hit.point;
			// 	}
      //
			// } else {
			// 	if (Physics.SphereCast(origin, locomotion.raycastRadius, direction, out hit, direction.magnitude, locomotion.blockingLayers)) {
			// 		position = origin + direction.normalized * hit.distance;
			// 	}
			// }

			this.lastOffset = this.lastOffset.lerp(Vector3.zero, Time.deltaTime * 3);
			position.add( this.lastOffset.clampLength(-Infinity, 0.75) );
			position.y = this.spine.pelvis.solverPosition.y;

			//debugPos3 = position;

			this.lastOffset = this.lastOffset.lerp(position.clone().sub(this.spine.pelvis.solverPosition), Time.deltaTime * 15);
			return this.lastOffset;
	}
}
