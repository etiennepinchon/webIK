import { InterpolationMode, Interp } from './Interp';
import { PositionOffset, RotationOffset, VirtualBone } from './IKSolverVRUtilities';
import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';

/// A base class for limbs of all types.
export default class BodyPart {

	// Abstract
	onRead(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, rootIndex, index) {}
	preSolve() {}
	write(solvedPositions, solvedRotations) {}
	applyOffsets() {}
	resetOffsets() {}

	constructor() {
		this.sqrMag = 0;
		this.mag = 0;

		this.bones = [];
		this.initiated = false;
		this.rootPosition = new Vector3();
		this.rootRotation = Quaternion.identity;
		this.index = -1;
	}

	read(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, rootIndex, index) {
		this.index = index;

		this.rootPosition = positions[rootIndex];
		this.rootRotation = rotations[rootIndex];

		this.onRead(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, rootIndex, index);

		this.mag = VirtualBone.preSolve(this.bones);
		this.sqrMag = this.mag * this.mag;

		this.initiated = true;
	}

	movePosition(position) {
		let delta = position.clone().sub( this.bones[0].solverPosition );
		for (let bone of this.bones) bone.solverPosition.add(delta);
	}

	moveRotation(rotation) {

    if (this.bones[0].solverRotation.w == undefined) {
      console.error('corrupt data this.bones[0].solverRotation.w')
      throw new Error()
    }

		let delta = QuaTools.FromToRotation(this.bones[0].solverRotation, rotation);
		VirtualBone.rotateAroundPoint(this.bones, 0, this.bones[0].solverPosition, delta);
	}

	translate(position, rotation) {
		this.movePosition(position);
		this.moveRotation(rotation);
	}

	translateRoot(newRootPos, newRootRot) {
    if (this.bones[3].solverRotation.w == undefined || isNaN(this.bones[3].solverRotation.w)) {
      console.error(':) corrupt data this.bones[3].solverRotation.w')
      throw new Error()
    }

		let deltaPosition = newRootPos.clone().add(this.rootPosition);
		this.rootPosition = newRootPos;
		for (let bone of this.bones) bone.solverPosition.add( deltaPosition );

		let deltaRotation = QuaTools.fromToRotation(this.rootRotation, newRootRot);
		this.rootRotation = newRootRot;

  //  console.log( 'mc',this.bones,  this.rootRotation, newRootRot )

		VirtualBone.rotateAroundPoint(this.bones, 0, newRootPos, deltaRotation);
	}

	rotateTo(bone, rotation, weight = 1) {
		if (weight <= 0) return;

    if (bone.solverRotation.w == undefined || isNaN(bone.solverRotation.w)) {
      console.error('corrupt data bone.solverRotation')
      throw new Error()
    }
    if (rotation.w == undefined || isNaN(rotation.w)) {
      console.error('corrupt data rotation')
      throw new Error()
    }

		let q = QuaTools.fromToRotation(bone.solverRotation, rotation);

		if (weight < 1) q = Quaternion.identity.slerp(q.clone(), weight);

		for (let i = 0; i < this.bones.length; i++) {
			if (this.bones[i] == bone) {
				VirtualBone.rotateAroundPoint(this.bones, i, this.bones[i].solverPosition.clone(), q);
				return;
			}
		}
	}

	visualize(color) {
		for (let i = 0; i < bones.length - 1; i++) {
			//Debug.DrawLine(bones[i].solverPosition, bones[i + 1].solverPosition, color);
		}
	}

	visualize() {
		visualize(new THREE.Color(0xFFFFFF));
	}
}
