import BodyPart from './IKSolverVRBodyPart';
import { InterpolationMode, Interp } from '../tools/Interp';
import { PositionOffset, RotationOffset, VirtualBone } from './IKSolverVRUtilities';
import V3Tools from '../tools/V3Tools';
import QuaTools from '../tools/QuaTools';


/// Spine solver for IKSolverVR.
export default class Spine extends BodyPart {



	get pelvis() { return this.bones[this.pelvisIndex]; }
	get firstSpineBone() { return this.bones[this.spineIndex]; }
	get chest() {
		if (this.hasChest) return this.bones[this.chestIndex];
		return this.bones[this.spineIndex];
	}
	get neck() { return this.bones[this.neckIndex]; }
	get head() { return this.bones[this.headIndex]; }



	constructor(headTarget) {
		super();

		/// The head target.
		this.headTarget = headTarget;

		/// The pelvis target, useful with seated rigs.
		this.pelvisTarget;

		/// Positional weight of the head target.
		this.positionWeight = 1;

		/// Rotational weight of the head target.
		this.rotationWeight = 1;

		/// Positional weight of the pelvis target.
		this.pelvisPositionWeight = 0;

		/// Rotational weight of the pelvis target.
		this.pelvisRotationWeight = 0;

		/// If chestGoalWeight is greater than 0, the chest will be turned towards this Transform.
		this.chestGoal;

		/// Rotational weight of the chest target.
		this.chestGoalWeight = 0;

		/// Minimum height of the head from the root of the character.
		this.minHeadHeight = 0.8;

		/// Determines how much the body will follow the position of the head.
		this.bodyPosStiffness = 0.55;

		/// Determines how much the body will follow the rotation of the head.
		this.bodyRotStiffness = 0.1;

		/// Determines how much the chest will rotate to the rotation of the head.
		this.neckStiffness = 0.2;

		/// Clamps chest rotation.
		this.chestClampWeight = 0.5;

		/// Clamps head rotation.
		this.headClampWeight = 0.6;

		/// How much will the pelvis maintain it's animated position?
		this.maintainPelvisPosition = 0.2;

		/// Will automatically rotate the root of the character if the head target has turned past this angle.
		this.maxRootAngle = 25;

		/// Target position of the head. Will be overwritten if target is assigned.
		this.IKPositionHead = new Vector3();

		/// Target rotation of the head. Will be overwritten if target is assigned.
		this.IKRotationHead = Quaternion.identity;

		/// Target position of the pelvis. Will be overwritten if target is assigned.
		this.IKPositionPelvis = new Vector3();

		/// Target rotation of the pelvis. Will be overwritten if target is assigned.
		this.IKRotationPelvis = Quaternion.identity;

		/// The goal position for the chest. If chestGoalWeight > 0, the chest will be turned towards this position.
		this.goalPositionChest = new Vector3();

		/// Position offset of the pelvis. Will be applied on top of pelvis target position and reset to Vector3.zero after each update.
		this.pelvisPositionOffset = new Vector3();

		/// Position offset of the chest. Will be reset to Vector3.zero after each update.
		this.chestPositionOffset = new Vector3();

		/// Position offset of the head. Will be applied on top of head target position and reset to Vector3.zero after each update.
		this.headPositionOffset = new Vector3();

		/// Rotation offset of the pelvis. Will be reset to Quaternion.identity after each update.
		this.pelvisRotationOffset = Quaternion.identity;

		/// Rotation offset of the chest. Will be reset to Quaternion.identity after each update.
		this.chestRotationOffset = Quaternion.identity;

		/// Rotation offset of the head. Will be applied on top of head target rotation and reset to Quaternion.identity after each update.
		this.headRotationOffset = Quaternion.identity;

		this.faceDirection = new Vector3();
		this.locomotionHeadPositionOffset = new Vector3();
		this.headPosition = new Vector3();

		this.headRotation = Quaternion.identity;
		this.anchorRelativeToHead = Quaternion.identity;
		this.elvisRelativeRotation = Quaternion.identity;
		this.chestRelativeRotation = Quaternion.identity;
		this.headDeltaPosition = new Vector3();
		this.pelvisDeltaRotation = Quaternion.identity;
		this.chestTargetRotation = Quaternion.identity;
		this.pelvisIndex = 0, this.spineIndex = 1, this.chestIndex = -1, this.neckIndex = -1, this.headIndex = -1;
		this.length = 0;
		this.hasChest = false;
		this.hasNeck = false;
		this.headHeight = 0;
		this.sizeMlp = 0;
		this.chestForward = new Vector3();
	}




	onRead(/*Vector3[]*/positions, /*Quaternion[]*/rotations, /*bool*/hasChest, /*bool*/hasNeck, /*bool*/hasShoulders, /*bool*/hasToes, /*int*/rootIndex, /*int*/index) {
		let pelvisPos = positions[index].clone();
		let pelvisRot = rotations[index].clone();
		let spinePos = positions[index + 1].clone();
		let spineRot = rotations[index + 1].clone();
		let chestPos = positions[index + 2].clone();
		let chestRot = rotations[index + 2].clone();
		let neckPos = positions[index + 3].clone();
		let neckRot = rotations[index + 3].clone();
		let headPos = positions[index + 4].clone();
		let headRot = rotations[index + 4].clone();

		if (!hasChest) {
			chestPos = spinePos.clone();
			chestRot = spineRot.clone();
		}

		if (!this.initiated) {
			this.hasChest = hasChest;
			this.hasNeck = hasNeck;
			this.headHeight = V3Tools.extractVertical(headPos.clone().sub(positions[0]), rotations[0].clone().multiplyVector3(Vector3.up), 1).length();

			let boneCount = 3;
			if (hasChest) boneCount++;
			if (hasNeck) boneCount++;
			this.bones = new Array(boneCount);

			this.chestIndex = hasChest ? 2 : 1;

			this.neckIndex = 1;
			if (hasChest) this.neckIndex++;
			if (hasNeck) this.neckIndex++;

			this.headIndex = 2;
			if (hasChest) this.headIndex++;
			if (hasNeck) this.headIndex++;

			this.bones[0] = new VirtualBone(pelvisPos, pelvisRot);
			this.bones[1] = new VirtualBone(spinePos, spineRot);
			if (hasChest) this.bones[this.chestIndex] = new VirtualBone(chestPos, chestRot);
			if (hasNeck) this.bones[this.neckIndex] = new VirtualBone(neckPos, neckRot);
			this.bones[this.headIndex] = new VirtualBone(headPos, headRot);

			this.pelvisRotationOffset = Quaternion.identity;
			this.chestRotationOffset = Quaternion.identity;
			this.headRotationOffset = Quaternion.identity;

			this.anchorRelativeToHead = headRot.clone().inverse().multiply(rotations[0]);

			// Forward and up axes
			this.pelvisRelativeRotation = headRot.clone().inverse().multiply( pelvisRot );
			this.chestRelativeRotation = headRot.clone().inverse().multiply( chestRot );

			this.chestForward = chestRot.clone().inverse().multiply( rotations[0].clone().multiplyVector3(Vector3.forward) );

			this.faceDirection = rotations[0].clone().multiplyVector3( Vector3.forward );

			this.IKPositionHead = headPos.clone();
			this.IKRotationHead = headRot.clone();
			this.IKPositionPelvis = pelvisPos.clone();
			this.IKRotationPelvis = pelvisRot.clone();
			this.goalPositionChest = chestPos.clone().add( rotations[0].clone().multiplyVector3( Vector3.forward ) );
		}

		this.bones[0].read(pelvisPos, pelvisRot);
		this.bones[1].read(spinePos, spineRot);
		if (hasChest) this.bones[this.chestIndex].read(chestPos, chestRot);
		if (hasNeck) this.bones[this.neckIndex].read(neckPos, neckRot);
		this.bones[this.headIndex].read(headPos, headRot);

		let spineLength = pelvisPos.distanceTo(headPos);
		this.sizeMlp = spineLength / 0.7;
	}



	// TODO: check rotation is not world
	preSolve() {
		window._scene.updateMatrixWorld();

		if (this.headTarget) {
			this.IKPositionHead = this.headTarget.getWorldPosition();
			this.IKRotationHead = this.headTarget.getUnityWorldQuaternion();
		}

		if (this.chestGoal) {
			this.goalPositionChest = this.chestGoal.getWorldPosition();
		}

		if (this.pelvisTarget) {
			this.IKPositionPelvis = this.pelvisTarget.getWorldPosition();
			this.IKRotationPelvis = this.pelvisTarget.getUnityWorldQuaternion();
		}

		this.headPosition = V3Tools.lerp(this.head.solverPosition, this.IKPositionHead, this.positionWeight);
		this.headRotation = QuaTools.lerp(this.head.solverRotation, this.IKRotationHead, this.rotationWeight);
	}




	applyOffsets() {
		this.headPosition.add( this.headPositionOffset );

		let rootUp = this.rootRotation.clone().multiplyVector3( Vector3.up );
		if (rootUp.equals(Vector3.up)) {
			this.headPosition.setY( Math.max(this.rootPosition.y + this.minHeadHeight, this.headPosition.y) );
		}
		else {
			let toHead = this.headPosition.clone().sub( this.rootPosition );
			let hor = V3Tools.extractHorizontal(toHead, rootUp, 1);
			let ver = toHead.clone().sub( hor );
			let dot = ver.clone().dot(rootUp);
			if (dot > 0) {
				if (ver.length() < this.minHeadHeight) ver = ver.normalize().clone().multiplyScalar( this.minHeadHeight);
			}
			else {
				ver = ver.normalize().negate().multiplyScalar( this.minHeadHeight );
			}

			this.headPosition = this.rootPosition.clone().add(hor).add(ver);
		}

		this.headRotation = this.headRotationOffset.clone().multiply( this.headRotation );


		this.headDeltaPosition = this.headPosition.clone().sub( this.head.solverPosition );
		this.pelvisDeltaRotation = QuaTools.fromToRotation(this.pelvis.solverRotation, this.headRotation.clone().multiply( this.pelvisRelativeRotation) );

		this.anchorRotation = this.headRotation.clone().multiply( this.anchorRelativeToHead );
	}




	calculateChestTargetRotation(/*VirtualBone*/rootBone, /*Arm[]*/arms) {
		this.chestTargetRotation = this.headRotation.clone().multiply( this.chestRelativeRotation);

		// Use hands to adjust c
		this.adjustChestByHands(this.chestTargetRotation, arms);

		this.faceDirection = this.anchorRotation.clone().multiplyVector3(Vector3.right).cross(rootBone.readRotation.clone().multiplyVector3(Vector3.up) ).add( this.anchorRotation.clone().multiplyVector3( Vector3.forward) );
	}




	solve(/*VirtualBone*/rootBone, /*Leg[]*/legs, /*Arm[]*/arms) {
		this.calculateChestTargetRotation(rootBone, arms);

		// Root rotation
		if (this.maxRootAngle < 180) {
			let faceDirLocal = rootBone.solverRotation.clone().inverse().multiplyVector3( this.faceDirection );
			let angle = Math.degrees( Math.atan2(faceDirLocal.x, faceDirLocal.z) );

			let rotation = 0;
			let maxAngle = 25;

			if (angle > maxAngle) {
				rotation = angle - maxAngle;
			}
			if (angle < -maxAngle) {
				rotation = angle + maxAngle;
			}

			rootBone.solverRotation = Quaternion.angleAxis( rotation, rootBone.readRotation.clone().multiplyVector3( Vector3.up ) ).multiply(rootBone.solverRotation);
		}

		let animatedPelvisPos = this.pelvis.solverPosition.clone();

		// Translate pelvis to make the head's position & rotation match with the head target
		this.translatePelvis(legs, this.headDeltaPosition, this.pelvisDeltaRotation);

		// Solve a FABRIK pass to squash/stretch the spine
		VirtualBone.solveFABRIK(this.bones, this.pelvis.solverPosition.clone().lerp(animatedPelvisPos, this.maintainPelvisPosition).add(this.pelvisPositionOffset).sub(this.chestPositionOffset), this.headPosition.clone().sub(this.chestPositionOffset), 1, 1, 1, this.mag);

		// Bend the spine to look towards chest target rotation
		this.bendWithOffset(this.bones, this.pelvisIndex, this.chestIndex, this.chestTargetRotation, this.chestRotationOffset, this.chestClampWeight, false, this.neckStiffness);

		if (this.chestGoalWeight > 0) {

      if (this.bones[this.chestIndex].solverRotation.w == undefined) {
        console.error('corrupt data this.bones[this.chestIndex].solverRotation')
        throw new Error()
      }

			let from = this.bones[this.chestIndex].solverRotation.clone().multiplyVector3(this.chestForward);
			let to = goalPositionChest.clone().sub( this.bones[this.chestIndex].solverPosition);
			let c = Quaternion.fromToRotation(from, to).multiply( this.bones[this.chestIndex].solverRotation );
			this.bendWithOffset(this.bones, this.pelvisIndex, this.chestIndex, c, this.chestRotationOffset, this.chestClampWeight, false, this.chestGoalWeight);
		}

		this.inverseTranslateToHead(legs, false, false, Vector3.zero, 1);

		VirtualBone.solveFABRIK(this.bones, this.pelvis.solverPosition.clone().lerp(animatedPelvisPos, this.maintainPelvisPosition).add( this.pelvisPositionOffset ).sub( this.chestPositionOffset ), this.headPosition.clone().sub( this.chestPositionOffset ), 1, 1, 1, this.mag);

		this.bend(this.bones, this.neckIndex, this.headIndex, this.headRotation, this.headClampWeight, true, 1);

		this.solvePelvis ();
	}




	solvePelvis() {
		// Pelvis target
		if (this.pelvisPositionWeight > 0) {
			let headSolverRotation = this.head.solverRotation.clone();

			let delta = ((this.IKPositionPelvis.clone().add(this.pelvisPositionOffset)).sub(pelvis.solverPosition)).multiplyScalar(this.pelvisPositionWeight);
			for (let bone of this.bones) bone.solverPosition += delta;

			let bendNormal = this.anchorRotation.clone().multiplyVector3( Vector3.right );

			if (this.hasChest && this.hasNeck) {
				VirtualBone.solveTrigonometric(this.bones, this.pelvisIndex, this.spineIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 0.6);
				VirtualBone.solveTrigonometric(this.bones, this.spineIndex, this.chestIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 0.6);
				VirtualBone.solveTrigonometric(this.bones, this.chestIndex, this.neckIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 1);
			}
      else if (this.hasChest && !this.hasNeck) {
				VirtualBone.solveTrigonometric(this.bones, this.pelvisIndex, this.spineIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 0.75);
				VirtualBone.solveTrigonometric(this.bones, this.spineIndex, this.chestIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 1);
			}
      else if (!this.hasChest && this.hasNeck) {
				VirtualBone.solveTrigonometric(this.bones, this.pelvisIndex, this.spineIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 0.75);
				VirtualBone.solveTrigonometric(this.bones, this.spineIndex, this.neckIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight * 1);
			}
      else if (!this.hasNeck && !this.hasChest) {
				VirtualBone.solveTrigonometric(this.bones, this.pelvisIndex, this.spineIndex, this.headIndex, this.headPosition, this.bendNormal, this.pelvisPositionWeight);
			}

			this.head.solverRotation = this.headSolverRotation.clone();
		}
	}



	// @TODO_CHECK: careful about the ref
	write(/*ref Vector3[] */solvedPositions, /*ref Quaternion[]*/solvedRotations) {

    if (this.bones[0].solverRotation.w == undefined) {
      console.error('corrupt data this.bones[0].solverRotation.w')
      throw new Error()
    }

		// Pelvis
		solvedPositions[this.index] = this.bones[0].solverPosition.clone();
		solvedRotations[this.index] = this.bones[0].solverRotation.clone();

		// Spine
		solvedRotations[this.index + 1] = this.bones[1].solverRotation.clone();

		// Chest
		if (this.hasChest) {
			solvedRotations[this.index + 2] = this.bones[this.chestIndex].solverRotation.clone();
		}

		// Neck
		if (this.hasNeck) {
			solvedRotations[this.index + 3] = this.bones[this.neckIndex].solverRotation.clone();
		}

		// Head
		solvedRotations[this.index + 4] = this.bones[this.headIndex].solverRotation.clone();

		return { solvedPositions, solvedRotations };
	}




	resetOffsets() {
		// Reset offsets to zero
		this.pelvisPositionOffset = Vector3.zero;
		this.chestPositionOffset = Vector3.zero;
		this.headPositionOffset = this.locomotionHeadPositionOffset.clone();// Vector3.zero;
		this.pelvisRotationOffset = Quaternion.identity;
		this.chestRotationOffset = Quaternion.identity;
		this.headRotationOffset = Quaternion.identity;
	}



	// @TODO_CHECK: careful ref...
	adjustChestByHands(/*ref Quaternion*/ chestTargetRotation, /*Arm[]*/arms) {
		let h = this.anchorRotation.clone().inverse();

		let pLeft = h.clone().multiplyVector3(arms[0].position.clone().sub(this.headPosition)).subScalar( this.sizeMlp );
		let pRight = h.clone().multiplyVector3(arms[1].position.clone().sub(this.headPosition)).subScalar( this.sizeMlp );

		let c = Vector3.forward;
		c.setX(c.x + (pLeft.x * Math.abs(pLeft.x)) );
		c.setX(c.x + (pLeft.z * Math.abs(pLeft.z)) );
		c.setX(c.x + (pRight.x * Math.abs(pRight.x)) );
		c.setX(c.x - (pRight.z * Math.abs(pRight.z)) );
		c.setX(c.x * 5 );

		let q = Quaternion.fromToRotation(Vector3.forward, c);
		chestTargetRotation = q.clone().multiply( chestTargetRotation );

		let t = Vector3.up;
		t.setX(t.x + pLeft.y);
		t.setX(t.x - pRight.y);
		t.setX(t.x * 0.5);

		q = Quaternion.fromToRotation(Vector3.up, this.anchorRotation.clone().multiplyVector3(t) );
		chestTargetRotation = q.clone().multiply( chestTargetRotation );

		return chestTargetRotation;
	}




	// Move the pelvis so that the head would remain fixed to the anchor
	inverseTranslateToHead(/*Leg[]*/legs, /*bool*/limited, /*bool*/useCurrentLegMag, /*Vector3*/offset, /*float*/w) {
		let p = this.pelvis.solverPosition.clone().add( this.headPosition.clone().add(offset).sub(this.head.solverPosition) ).multiplyScalar(w).multiplyScalar(1 - this.pelvisPositionWeight);
		this.movePosition( (this.limited) ? this.limitPelvisPosition(legs, p, useCurrentLegMag) : p);
	}




	// Move and rotate the pelvis
	translatePelvis(/*Leg[]*/legs, /*Vector3*/deltaPosition, /*Quaternion*/deltaRotation) {
		// Rotation
		let p = this.head.solverPosition.clone();

		this.deltaRotation = QuaTools.clampRotation(deltaRotation, this.chestClampWeight, 2);

		let r = Quaternion.identity.slerp (deltaRotation, this.bodyRotStiffness);
		r = r.clone().slerp(QuaTools.fromToRotation(this.pelvis.solverRotation, this.IKRotationPelvis), this.pelvisRotationWeight);
		VirtualBone.rotateAroundPoint(this.bones, 0, this.pelvis.solverPosition, this.pelvisRotationOffset.clone().multiply(r) );

		deltaPosition.sub( this.head.solverPosition.clone().sub(p) );

		// Position
		// Move the body back when head is moving down
		let /*Vector3*/m = this.rootRotation.clone().multiplyVector3( Vector3.forward );
		m.setY(0);
		let backOffset = deltaPosition.y * 0.35 * this.headHeight;
		deltaPosition.add( m.clone().multiplyScalar( backOffset ) );

		this.movePosition( this.limitPelvisPosition(legs, this.pelvis.solverPosition.clone().add( deltaPosition.clone().multiplyScalar(this.bodyPosStiffness) ), false));
	}




	// Limit the position of the pelvis so that the feet/toes would remain fixed
	limitPelvisPosition(/*Leg[]*/legs, /*Vector3*/pelvisPosition, /*bool*/useCurrentLegMag, /*int*/it = 2) {
		// Cache leg current mag
		if (useCurrentLegMag) {
			for (let leg of legs) {
				leg.currentMag = leg.thigh.solverPosition.distanceTo(leg.lastBone.solverPosition);
			}
		}

		// Solve a 3-point constraint
		for (let i = 0; i < it; i++) {
			for (let leg of legs) {
				let /*Vector3*/delta = pelvisPosition.clone().sub( this.pelvis.solverPosition );
				let /*Vector3*/wantedThighPos = leg.thigh.solverPosition.clone().add( delta );
				let /*Vector3*/toWantedThighPos = wantedThighPos.clone().sub( leg.position );
				let /*float*/maxMag = useCurrentLegMag? leg.currentMag: leg.mag;
				let /*Vector3*/limitedThighPos = leg.position.clone().add( toWantedThighPos.clone().clampLength(-Infinity, maxMag) );
				pelvisPosition.add( limitedThighPos.clone().sub( wantedThighPos) );
			}
		}

		return pelvisPosition;
	}




	// Bending the spine to the head effector
	bend(/*VirtualBone[]*/bones, /*int*/firstIndex, /*int*/lastIndex, /*Quaternion*/targetRotation, /* ___ , */ /*float*/clampWeight, /*bool*/uniformWeight, /*float*/w) {
		if (w <= 0) return;
		if (!bones.length) return;
		let bonesCount = (lastIndex + 1) - firstIndex;
		if (bonesCount < 1) return;

    if (bones[lastIndex].solverRotation.w == undefined) {
      console.error('corrupt data bones[lastIndex].solverRotation')
      throw new Error()
    }

		let r = QuaTools.fromToRotation(bones[lastIndex].solverRotation, targetRotation);
		r = QuaTools.clampRotation(r, clampWeight, 2);

		let step = uniformWeight ? (1 / bonesCount) : 0;

		for (let i = firstIndex; i < lastIndex + 1; i++) {
			if (!uniformWeight) step = Math.clamp( ((i - firstIndex) + 1) / bonesCount, 0, 1);
			VirtualBone.rotateAroundPoint(bones, i, bones[i].solverPosition, Quaternion.identity.slerp(r, step * w));
		}
	}




	// Bending the spine to the head effector
	bendWithOffset(/*VirtualBone[]*/bones, /*int*/firstIndex, /*int*/lastIndex, /*Quaternion*/targetRotation, /*Quaternion*/rotationOffset, /*float*/clampWeight, /*bool*/uniformWeight, /*float*/w) {
		if (w <= 0) return;
		if (bones.length == 0) return;
		let bonesCount = (lastIndex + 1) - firstIndex;
		if (bonesCount < 1) return;

    if (bones[lastIndex].solverRotation.w == undefined) {
      console.error('corrupt data bones[lastIndex].solverRotation')
      throw new Error()
    }

		let r = QuaTools.fromToRotation(bones[lastIndex].solverRotation, targetRotation);
		r = QuaTools.clampRotation(r, clampWeight, 2);

		let step = uniformWeight ? (1 / bonesCount) : 0;

		for (let i = firstIndex; i < lastIndex + 1; i++) {
			if (!uniformWeight) step = Math.clamp( ((i - firstIndex) + 1) / bonesCount, 0, 1);
			VirtualBone.rotateAroundPoint(bones, i, bones[i].solverPosition, Quaternion.identity.slerp(rotationOffset, step).slerp(r, step * w));
		}
	}
}
