import BodyPart from './IKSolverVRBodyPart';
import { InterpolationMode, Interp } from './Interp';
import { PositionOffset, RotationOffset, VirtualBone } from './IKSolverVRUtilities';
import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';

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
		this.headDeltaPosition;
		this.pelvisDeltaRotation = Quaternion.identity;
		this.chestTargetRotation = Quaternion.identity;
		this.pelvisIndex = 0, this.spineIndex = 1, this.chestIndex = -1, this.neckIndex = -1, this.headIndex = -1;
		this.length;
		this.hasChest;
		this.hasNeck;
		this.headHeight;
		this.sizeMlp;
		this.chestForward;
	}

	onRead(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, rootIndex, index) {
		let pelvisPos = positions[index];
		let pelvisRot = rotations[index];
		let spinePos = positions[index + 1];
		let spineRot = rotations[index + 1];
		let chestPos = positions[index + 2];
		let chestRot = rotations[index + 2];
		let neckPos = positions[index + 3];
		let neckRot = rotations[index + 3];
		let headPos = positions[index + 4];
		let headRot = rotations[index + 4];

		if (!hasChest) {
			chestPos = spinePos;
			chestRot = spineRot;
		}

		if (!this.initiated) {
			this.hasChest = hasChest;
			this.hasNeck = hasNeck;
			this.headHeight = V3Tools.extractVertical(headPos.clone().sub(positions[0]), rotations[0].clone().multiply(Vector3.up), 1).length();

			let boneCount = 3;
			if (hasChest) boneCount++;
			if (hasNeck) boneCount++;
			this.bones = new Array(boneCount);

			this.chestIndex = hasChest? 2: 1;

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

			this.chestForward = chestRot.clone().inverse().multiply( rotations[0].clone().multiply(Vector3.forward) );

			this.faceDirection = rotations[0].clone().multiply( Vector3.forward );

			this.IKPositionHead = headPos;
			this.IKRotationHead = headRot;
			this.IKPositionPelvis = pelvisPos;
			this.IKRotationPelvis = pelvisRot;
			this.goalPositionChest = chestPos.clone().add( rotations[0].clone().multiply( Vector3.forward ) );
		}

		this.bones[0].read(pelvisPos, pelvisRot);
		this.bones[1].read(spinePos, spineRot);

		if (hasChest) this.bones[this.chestIndex].read(chestPos, chestRot);
		if (hasNeck) this.bones[this.neckIndex].read(neckPos, neckRot);
		this.bones[this.headIndex].read(headPos, headRot);

		let spineLength = pelvisPos.distanceTo (headPos);
		this.sizeMlp = spineLength / 0.7;
	}

	preSolve() {
		if (this.headTarget) {
			this.IKPositionHead = this.headTarget.position;
			this.IKRotationHead = this.headTarget.quaternion;
		}

		if (this.chestGoal) {
			this.goalPositionChest = this.chestGoal.position;
		}

		if (this.pelvisTarget) {
			this.IKPositionPelvis = this.pelvisTarget.position;
			this.IKRotationPelvis = this.pelvisTarget.quaternion;
		}

		this.headPosition = V3Tools.lerp(this.head.solverPosition, this.IKPositionHead, this.positionWeight);
		this.headRotation = QuaTools.lerp(this.head.solverRotation, this.IKRotationHead, this.rotationWeight);
	}

	applyOffsets() {
		this.headPosition.add( this.headPositionOffset );

		let rootUp = this.rootRotation.clone().multiply( Vector3.up );
		if (rootUp.length() === Vector3.up.length()) {
			this.headPosition.y = Math.max(this.rootPosition.y + this.minHeadHeight, this.headPosition.y);
		}
		else {
			let toHead = this.headPosition.clone().sub( this.rootPosition );
			let hor = V3Tools.extractHorizontal(toHead, rootUp, 1);
			let ver = toHead.clone().sub( hor );
			let dot = ver.dot(rootUp);
			if (dot > 0) {
				if (ver.length() < this.minHeadHeight) ver = ver.normalize().clone().multiply( this.minHeadHeight);
			}
			else {
				ver = ver.normalize().negate().multiply( this.minHeadHeight );
			}

			this.headPosition = this.rootPosition.clone().add(hor).add(ver);
		}

		this.headRotation = this.headRotationOffset.clone().multiply( this.headRotation );

		this.headDeltaPosition = this.headPosition.clone().sub( this.head.solverPosition );
		this.pelvisDeltaRotation = QuaTools.fromToRotation(this.pelvis.solverRotation, this.headRotation.clone().multiply( this.pelvisRelativeRotation) );

		this.anchorRotation = this.headRotation.clone().multiply( this.anchorRelativeToHead );
	}

	calculateChestTargetRotation(rootBone, arms) {
		this.chestTargetRotation = this.headRotation.clone().multiply( this.chestRelativeRotation);

		// Use hands to adjust c
		this.adjustChestByHands(this.chestTargetRotation, arms);

		this.faceDirection = this.anchorRotation.clone().multiply(Vector3.right).cross(rootBone.readRotation.clone().multiply(Vector3.up) ).add( this.anchorRotation.clone().multiply( Vector3.forward) );
	}

	solve(rootBone, legs, arms) {
		this.calculateChestTargetRotation(rootBone, arms);

		// Root rotation
		if (this.maxRootAngle < 180) {
			let faceDirLocal = rootBone.solverRotation.clone().inverse().multiply( this.faceDirection );
			let angle = Math.degrees( Math.atan2(faceDirLocal.x, faceDirLocal.z) );

			let rotation = 0;
			let maxAngle = 25;

			if (angle > maxAngle) {
				rotation = angle - maxAngle;
			}
			if (angle < -maxAngle) {
				rotation = angle + maxAngle;
			}

			rootBone.solverRotation = Quaternion.identity.setFromAxisAngle ( rootBone.readRotation.clone().multiply( Vector3.up ), rotation ).multiply(rootBone.solverRotation);
		}

		let animatedPelvisPos = this.pelvis.solverPosition;

		// Translate pelvis to make the head's position & rotation match with the head target
		this.translatePelvis(legs, this.headDeltaPosition, this.pelvisDeltaRotation);

		// Solve a FABRIK pass to squash/stretch the spine
		VirtualBone.solveFABRIK(this.bones, this.pelvis.solverPosition.clone().lerp(animatedPelvisPos, this.maintainPelvisPosition).add(this.pelvisPositionOffset).clone().sub(this.chestPositionOffset), this.headPosition.clone().sub(this.chestPositionOffset), 1, 1, 1, this.mag);

		// Bend the spine to look towards chest target rotation
		this.bendWithOffset(this.bones, this.pelvisIndex, this.chestIndex, this.chestTargetRotation, this.chestRotationOffset, this.chestClampWeight, false, this.neckStiffness);

		if (this.chestGoalWeight > 0) {

      if (this.bones[this.chestIndex].solverRotation.w == undefined) {
        console.error('corrupt data this.bones[this.chestIndex].solverRotation')
        throw new Error()
      }

			let c = Quaternion.FromToRotation(this.bones[this.chestIndex].solverRotation.clone().multiply(chestForward), goalPositionChest.clone().sub( this.bones[this.chestIndex].solverPosition)).clone().multiply( this.bones[this.chestIndex].solverRotation );
			this.bendWithOffset(this.bones, this.pelvisIndex, this.chestIndex, c, this.chestRotationOffset, this.chestClampWeight, false, this.chestGoalWeight);
		}

		this.inverseTranslateToHead(legs, false, false, Vector3.zero, 1);

		VirtualBone.solveFABRIK(this.bones, this.pelvis.solverPosition.clone().lerp(animatedPelvisPos, this.maintainPelvisPosition).clone().add( this.pelvisPositionOffset ).sub( this.chestPositionOffset ), this.headPosition.clone().sub( this.chestPositionOffset ), 1, 1, 1, this.mag);

		this.bend(this.bones, this.neckIndex, this.headIndex, this.headRotation, this.headClampWeight, true, 1);

		this.solvePelvis ();
	}

	solvePelvis() {
		// Pelvis target
		if (this.pelvisPositionWeight > 0) {
			let headSolverRotation = this.head.solverRotation;

			let delta = ((this.IKPositionPelvis.clone().add(this.pelvisPositionOffset)).sub(pelvis.solverPosition)).multiply(this.pelvisPositionWeight);
			for (let bone of this.bones) bone.solverPosition += delta;

			let bendNormal = this.anchorRotation.clone().multiply( Vector3.right );

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

			this.head.solverRotation = this.headSolverRotation;
		}
	}

	write(solvedPositions, solvedRotations) {

    if (this.bones[0].solverRotation.w == undefined) {
      console.error('corrupt data this.bones[0].solverRotation.w')
      throw new Error()
    }

		// Pelvis
		solvedPositions[this.index] = this.bones[0].solverPosition;
		solvedRotations[this.index] = this.bones[0].solverRotation;

		// Spine
		solvedRotations[this.index + 1] = this.bones[1].solverRotation;

		// Chest
		if (this.hasChest) solvedRotations[this.index + 2] = this.bones[this.chestIndex].solverRotation;

		// Neck
		if (this.hasNeck) solvedRotations[this.index + 3] = this.bones[this.neckIndex].solverRotation;

		// Head
		solvedRotations[this.index + 4] = this.bones[this.headIndex].solverRotation;
	}

	resetOffsets() {
		// Reset offsets to zero
		this.pelvisPositionOffset = Vector3.zero;
		this.chestPositionOffset = Vector3.zero;
		this.headPositionOffset = this.locomotionHeadPositionOffset;// Vector3.zero;
		this.pelvisRotationOffset = Quaternion.identity;
		this.chestRotationOffset = Quaternion.identity;
		this.headRotationOffset = Quaternion.identity;
	}

	adjustChestByHands( chestTargetRotation, arms) {
		let h = this.anchorRotation.clone().inverse();

		let pLeft = h.clone().multiply(arms[0].position.clone().sub(this.headPosition)).subScalar( this.sizeMlp );
		let pRight = h.clone().multiply(arms[1].position.clone().sub(this.headPosition)).subScalar( this.sizeMlp );

		let c = Vector3.forward;
		c.x += pLeft.x * Math.abs(pLeft.x);
		c.x += pLeft.z * Math.abs(pLeft.z);
		c.x += pRight.x * Math.abs(pRight.x);
		c.x -= pRight.z * Math.abs(pRight.z);
		c.x *= 5;

		let q = Quaternion.FromToRotation(Vector3.forward, c);
		this.chestTargetRotation = q.clone().multiply( this.chestTargetRotation );

		let t = Vector3.up;
		t.x += pLeft.y;
		t.x -= pRight.y;
		t.x *= 0.5;

		q = Quaternion.FromToRotation(Vector3.up, this.anchorRotation.clone().multiply(t) );
		this.chestTargetRotation = q.clone().multiply( chestTargetRotation );
	}

	// Move the pelvis so that the head would remain fixed to the anchor
	inverseTranslateToHead(legs, limited, useCurrentLegMag, offset, w) {
		let p = this.pelvis.solverPosition.clone().add( this.headPosition.clone().add(offset).sub(this.head.solverPosition) ).multiplyScalar(w * (1 - this.pelvisPositionWeight));
		this.movePosition( (this.limited) ? this.limitPelvisPosition(legs, p, useCurrentLegMag) : p);
	}

	// Move and rotate the pelvis
	translatePelvis(legs, deltaPosition, deltaRotation) {
		// Rotation
		let p = this.head.solverPosition;

		this.deltaRotation = QuaTools.clampRotation(deltaRotation, this.chestClampWeight, 2);

		let r = Quaternion.identity.slerp (deltaRotation, this.bodyRotStiffness);
		r = r.clone().slerp(QuaTools.fromToRotation(this.pelvis.solverRotation, this.IKRotationPelvis), this.pelvisRotationWeight);
		VirtualBone.rotateAroundPoint(this.bones, 0, this.pelvis.solverPosition, this.pelvisRotationOffset.clone().multiply(r) );

		deltaPosition.sub( this.head.solverPosition.clone().sub(p) );

		// Position
		// Move the body back when head is moving down
		let m = this.rootRotation.clone().multiply( Vector3.forward );
		m.y = 0;
		let backOffset = deltaPosition.y * 0.35 * this.headHeight;
		deltaPosition.add( m.clone().multiply( backOffset ) );

		this.movePosition( this.limitPelvisPosition(legs, this.pelvis.solverPosition.clone().add( deltaPosition).multiply( this.bodyPosStiffness), false));
	}

	// Limit the position of the pelvis so that the feet/toes would remain fixed
	limitPelvisPosition(legs, pelvisPosition, useCurrentLegMag, it = 2) {
		// Cache leg current mag
		if (useCurrentLegMag) {
			for (let leg of legs) {
				leg.currentMag = leg.thigh.solverPosition.distanceTo(leg.lastBone.solverPosition);
			}
		}

		// Solve a 3-point constraint
		for (let i = 0; i < it; i++) {
			for (let leg of legs) {
				let delta = pelvisPosition.clone().sub( this.pelvis.solverPosition );
				let wantedThighPos = leg.thigh.solverPosition.clone().add( delta );
				let toWantedThighPos = wantedThighPos.clone().sub( leg.position );
				let maxMag = useCurrentLegMag? leg.currentMag: leg.mag;
				let limitedThighPos = leg.position.clone().add( toWantedThighPos.clone().clampLength(-Infinity, maxMag) );
				pelvisPosition.add( limitedThighPos.clone().sub( wantedThighPos) );

				// TODO rotate pelvis to accommodate, rotate the spine back then
			}
		}

		return pelvisPosition;
	}

	// Bending the spine to the head effector
	bend(bones, firstIndex, lastIndex, targetRotation, /* ___ , */ clampWeight, uniformWeight, w) {
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

		let step = uniformWeight? (1 / bonesCount) : 0;

		for (let i = firstIndex; i < lastIndex + 1; i++) {
			if (!uniformWeight) step = Math.clamp( ((i - firstIndex) + 1) / bonesCount, 0, 1);
			VirtualBone.rotateAroundPoint(bones, i, bones[i].solverPosition, Quaternion.identity.slerp(r, step * w));
		}
	}

	// Bending the spine to the head effector
	bendWithOffset(bones, firstIndex, lastIndex, targetRotation, rotationOffset, clampWeight, uniformWeight, w) {
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
