import BodyPart from './IKSolverVRBodyPart';
import V3Tools from '../tools/V3Tools';
import QuaTools from '../tools/QuaTools';
import { InterpolationMode, Interp } from '../tools/Interp';
import { PositionOffset, RotationOffset, VirtualBone } from './IKSolverVRUtilities';

export default class Leg extends BodyPart {

	get thigh() { return this.bones[0]; }
	get calf() { return this.bones[1]; }
	get foot() { return this.bones[2]; }
	get toes() { return this.bones[3]; }
	get lastBone() { return this.bones[this.bones.length - 1]; }

	constructor() {
		super();

		/// The toe/foot target.
		this.target;

		/// The knee will be bent towards this Transform if 'Bend Goal Weight' > 0.
		this.bendGoal;

		/// Positional weight of the toe/foot target.
		this.positionWeight = 0;

		/// Rotational weight of the toe/foot target.
		this.rotationWeight = 0;

		/// If greater than 0, will bend the knee towards the 'Bend Goal' Transform.
		this.bendGoalWeight = 0;

		/// Angular offset of the knee bending direction.
		this.swivelOffset = -180;// rane -180/180

		/// Target position of the toe/foot. Will be overwritten if target is assigned.
		this.IKPosition = new Vector3();

		/// Target rotation of the toe/foot. Will be overwritten if target is assigned.
		this.IKRotation = Quaternion.identity;

		/// Position offset of the toe/foot. Will be applied on top of target position and reset to Vector3.zero after each update.
		this.footPositionOffset = new Vector3();

		/// Position offset of the heel. Will be reset to Vector3.zero after each update.
		this.heelPositionOffset = new Vector3();

		/// Rotation offset of the toe/foot. Will be reset to Quaternion.identity after each update.
		this.footRotationOffset = new Quaternion();

		/// The length of the leg (calculated in last read).
		this.currentMag = 0;

		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.hasToes = false;
		this.thighRelativeToPelvis = new Vector3();

		this.footPosition = new Vector3();
		this.footRotation = Quaternion.identity;
		this.bendNormal = new Vector3();
		this.calfRelToThigh = Quaternion.identity;

    this.warned = false;
	}




	onRead(/*Vector3[]*/positions, /*Quaternion[]*/rotations, /*bool*/hasChest, /*bool*/hasNeck, /*bool*/hasShoulders, /*bool*/hasToes, /*int*/rootIndex, /*int*/index) {
		let thighPos = positions[index].clone();
		let thighRot = rotations[index].clone();
		let calfPos = positions[index + 1].clone();
		let calfRot = rotations[index + 1].clone();
		let footPos = positions[index + 2].clone();
		let footRot = rotations[index + 2].clone();
		let toePos = positions[index + 3].clone();
		let toeRot = rotations[index + 3].clone();

		if (!this.initiated) {
			this.hasToes = hasToes;
			this.bones = new Array(hasToes? 4: 3);

			if (this.hasToes) {
				this.bones[0] = new VirtualBone(thighPos, thighRot);
				this.bones[1] = new VirtualBone(calfPos, calfRot);
				this.bones[2] = new VirtualBone(footPos, footRot);
				this.bones[3] = new VirtualBone(toePos, toeRot);

				this.IKPosition = toePos;
				this.IKRotation = toeRot;
			}
			else {
				this.bones[0] = new VirtualBone(thighPos, thighRot);
				this.bones[1] = new VirtualBone(calfPos, calfRot);
				this.bones[2] = new VirtualBone(footPos, footRot);

				this.IKPosition = footPos;
				this.IKRotation = footRot;
			}

			this.rotation = this.IKRotation.clone();
		}

		if (hasToes) {
			this.bones[0].read(thighPos, thighRot);
			this.bones[1].read(calfPos, calfRot);
			this.bones[2].read(footPos, footRot);
			this.bones[3].read(toePos, toeRot);
		} else {
			this.bones[0].read(thighPos, thighRot);
			this.bones[1].read(calfPos, calfRot);
			this.bones[2].read(footPos, footRot);
		}
	}




	preSolve() {
		window._scene.updateMatrixWorld();

		if (this.target) {
			this.IKPosition = this.target.getWorldPosition();
			this.IKRotation = this.target.getUnityWorldQuaternion();
		}
    else if (!this.warned) {
      this.warned = true;
      console.warn('No leg target');
    }

		this.footPosition = this.foot.solverPosition.clone();
		this.footRotation = this.foot.solverRotation.clone();

		this.position = this.lastBone.solverPosition.clone();
		this.rotation = this.lastBone.solverRotation.clone();

		if (this.rotationWeight > 0) {
			this.applyRotationOffset(QuaTools.fromToRotation(this.rotation.clone(), this.IKRotation.clone()), this.rotationWeight);
		}

		if (this.positionWeight > 0) {
			this.applyPositionOffset(this.IKPosition.clone().sub( this.position ), this.positionWeight);
		}

		this.thighRelativeToPelvis = this.rootRotation.clone().inverse().multiplyVector3(  this.thigh.solverPosition.clone().sub( this.rootPosition) );
		this.calfRelToThigh = this.thigh.solverRotation.clone().inverse().multiply( this.calf.solverRotation );

		// Calculate bend plane normal
		this.bendNormal = this.calf.solverPosition.clone().sub(this.thigh.solverPosition).cross(this.foot.solverPosition.clone().sub(this.calf.solverPosition));
  }




	applyOffsets() {
		this.applyPositionOffset(this.footPositionOffset.clone(), 1);
		this.applyRotationOffset(this.footRotationOffset.clone(), 1);

    // Heel position offset
		let fromTo = Quaternion.fromToRotation(this.footPosition.clone().sub(this.position), this.footPosition.clone().add( this.heelPositionOffset ).sub( this.position) );

		this.footPosition = this.position.clone().add( fromTo.clone().multiplyVector3( this.footPosition.clone().sub(this.position) ) );
		this.footRotation = fromTo.clone().multiply( this.footRotation );

		// Bend normal offset
		let bAngle = 0;

		if (this.bendGoal && this.bendGoalWeight > 0) {
			window._scene.updateMatrixWorld();

			let b = this.bendGoal.getWorldPosition().sub(this.thigh.solverPosition).cross( this.foot.solverPosition.clone().sub(thigh.solverPosition) );
			let l = Quaternion.lookRotation(this.bendNormal, this.thigh.solverPosition.clone().sub( foot.solverPosition ) );
			let bRelative = l.clone().inverse().multiplyVector3(b);
			bAngle = Math.degrees(Math.atan2(bRelative.x, bRelative.z)) * this.bendGoalWeight;
		}

		let sO = this.swivelOffset + bAngle;

		if (sO != 0) {
			this.bendNormal = Quaternion.angleAxis(sO, this.thigh.solverPosition.clone().sub( this.lastBone.solverPosition)).multiply(this.bendNormal);
			this.thigh.solverRotation = Quaternion.angleAxis(-sO, this.thigh.solverRotation.clone().multiplyVector3(this.thigh.axis)).multiply(this.thigh.solverRotation);
		}

	}




	// Foot position offset
	applyPositionOffset(/*Vector3*/offset, weight) {
		if (weight <= 0) return;
		offset.multiplyScalar(weight);

		// Foot position offset
		this.footPosition.add(offset);
		this.position.add(offset);
	}




	// Foot rotation offset
	applyRotationOffset(/*Quaternion*/offset, weight) {
    if (isNaN(offset.w)) {
      console.error('A22AA corrupt data offset.w', offset.w)
      throw new Error()
    }

		if (weight <= 0) return;
		if (weight < 1) {
			offset = Quaternion.identity.lerp(offset, weight);
		}

		this.footRotation = offset.clone().multiply( this.footRotation );
    this.rotation = offset.clone().multiply( this.rotation )
		this.bendNormal = offset.clone().multiplyVector3(this.bendNormal );
		this.footPosition = this.position.add( offset.clone().multiply( this.footPosition.clone().sub( this.position) ) );
  }




	solve() {
    if (this.foot.solverRotation.w == undefined || isNaN(this.foot.solverRotation.w)) {
      console.error('AAA corrupt data rotation', this.foot)
      throw new Error()
    }

		// Foot pass
		VirtualBone.solveTrigonometric(this.bones, 0, 1, 2, this.footPosition, this.bendNormal, 1);

		// Rotate foot back to where it was before the last solving
		this.rotateTo(this.foot, this.footRotation.clone());

		// Toes pass
		if (!this.hasToes) return;

		let /*Vector3*/b = this.foot.solverPosition.clone().sub(this.thigh.solverPosition).cross( this.toes.solverPosition.clone().sub(this.foot.solverPosition) );

		VirtualBone.solveTrigonometric(this.bones, 0, 2, 3, this.position, b, 1);

		// Fix calf twist relative to thigh
		let /*Quaternion*/calfRotation = this.thigh.solverRotation.clone().multiply( this.calfRelToThigh );

		let /*Quaternion*/fromTo = Quaternion.fromToRotation(calfRotation.clone().multiplyVector3( this.calf.axis ), this.foot.solverPosition.clone().sub( this.calf.solverPosition) );
		this.rotateTo(this.calf, fromTo.clone().multiply(calfRotation), 1);

		// Keep toe rotation fixed
		this.toes.solverRotation = this.rotation.clone();
	}



	// @TODO_CHECK: ref return
	write(solvedPositions, solvedRotations) {
		solvedRotations[this.index] = this.thigh.solverRotation.clone();
		solvedRotations[this.index + 1] = this.calf.solverRotation.clone();
		solvedRotations[this.index + 2] = this.foot.solverRotation.clone();
		if (this.hasToes) solvedRotations[this.index + 3] = this.toes.solverRotation.clone();

		return { solvedPositions, solvedRotations }
	}




	resetOffsets() {
		this.footPositionOffset = Vector3.zero;
		this.footRotationOffset = new Quaternion();
		this.heelPositionOffset = Vector3.zero;
	}
}
