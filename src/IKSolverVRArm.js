import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';
import { InterpolationMode, Interp } from './Interp';
import { PositionOffset, RotationOffset, VirtualBone } from './IKSolverVRUtilities';
import BodyPart from './IKSolverVRBodyPart';

export const ShoulderRotationMode = {
	YawPitch: 0,
	FromTo: 1
};

/// 4-segmented analytic arm chain.
export default class Arm extends BodyPart {

	get shoulder() { return this.bones[0]; }
	get upperArm() { return this.bones[1]; }
	get forearm() { return this.bones[2]; }
	get hand() { return this.bones[3]; }


	constructor(armTarget) {
		super();

		/// The hand target.
		this.target = armTarget;

		/// The elbow will be bent towards this Transform if 'Bend Goal Weight' > 0.
		this.bendGoal;

		/// Positional weight of the hand target.
		this.positionWeight = 1;

		/// Rotational weight of the hand target.
		this.rotationWeight = 1;

		/// Different techniques for shoulder bone rotation.
		this.shoulderRotationMode = ShoulderRotationMode.YawPitch;

		/// The weight of shoulder rotation
		this.shoulderRotationWeight = 1;

		/// If greater than 0, will bend the elbow towards the 'Bend Goal' Transform.
		this.bendGoalWeight = 0;

		/// Angular offset of the elbow bending direction.
		this.swivelOffset = -180;

		/// Local axis of the hand bone that points from the wrist towards the palm. Used for defining hand bone orientation.
		this.wristToPalmAxis = Vector3.zero;

		/// Local axis of the hand bone that points from the palm towards the thumb. Used for defining hand bone orientation.
		this.palmToThumbAxis = Vector3.zero;

		/// Target position of the hand. Will be overwritten if target is assigned.
		this.IKPosition = Vector3.zero;

		/// Target rotation of the hand. Will be overwritten if target is assigned.
		this.IKRotation = Quaternion.identity;

		/// The bending direction of the limb. Will be used if bendGoalWeight is greater than 0. Will be overwritten if bendGoal is assigned.
		this.bendDirection = Vector3.back;

		/// Position offset of the hand. Will be applied on top of hand target position and reset to Vector3.zero after each update.
		this.handPositionOffset = Vector3.zero;

		// Gets the target position of the hand.
		this.position = Vector3.zero;

		// Gets the target rotation of the hand
		this.rotation = Quaternion.identity;

		this.hasShoulder = false;

		this.chestForwardAxis = Vector3.zero;
		this.chestUpAxis = Vector3.zero;
		this.chestRotation = Quaternion.identity;
		this.chestForward = Vector3.zero;
		this.chestUp = Vector3.zero;
		this.forearmRelToUpperArm = Quaternion.identity;

		this.yawOffsetAngle = 45;
		this.pitchOffsetAngle = -30;

    this.warned = false;
	}

	onRead(positions, rotations, hasChest, hasNeck, hasShoulders, hasToes, rootIndex, index) {
		let shoulderPosition = positions[index];
		let shoulderRotation = rotations[index];
		let upperArmPosition = positions[index + 1];
		let upperArmRotation = rotations[index + 1];
		let forearmPosition = positions[index + 2];
		let forearmRotation = rotations[index + 2];
		let handPosition = positions[index + 3];
		let handRotation = rotations[index + 3];

		if (!this.initiated) {
			this.IKPosition = handPosition;
			this.IKRotation = handRotation;
			this.rotation = this.IKRotation.clone();

			this.hasShoulder = hasShoulders;

			this.bones = new Array(this.hasShoulder? 4: 3);

			if (this.hasShoulder) {
				this.bones[0] = new VirtualBone(shoulderPosition, shoulderRotation);
				this.bones[1] = new VirtualBone(upperArmPosition, upperArmRotation);
				this.bones[2] = new VirtualBone(forearmPosition, forearmRotation);
				this.bones[3] = new VirtualBone(handPosition, handRotation);
			} else {
				this.bones[0] = new VirtualBone(upperArmPosition, upperArmRotation);
				this.bones[1] = new VirtualBone(forearmPosition, forearmRotation);
				this.bones[2] = new VirtualBone(handPosition, handRotation);
			}

			this.chestForwardAxis = this.rootRotation.clone().inverse().multiply( rotations[0].clone().multiply( Vector3.forward) );
			this.chestUpAxis = this.rootRotation.clone().inverse().multiply( rotations[0].clone().multiply( Vector3.up ) );
		}

		if (this.hasShoulder) {
			this.bones[0].read(shoulderPosition, shoulderRotation);
			this.bones[1].read(upperArmPosition, upperArmRotation);
			this.bones[2].read(forearmPosition, forearmRotation);
			this.bones[3].read(handPosition, handRotation);
		} else {
			this.bones[0].read(upperArmPosition, upperArmRotation);
			this.bones[1].read(forearmPosition, forearmRotation);
			this.bones[2].read(handPosition, handRotation);
		}
	}

	preSolve() {
		if (this.target) {
			this.IKPosition = this.target.position.clone();
			this.IKRotation = this.target.quaternion.clone();
		}
    else if (!this.warned) {
      this.warned = true;
      console.warn('no arm target')
    }

		this.position = V3Tools.lerp(this.hand.solverPosition, this.IKPosition, this.positionWeight);
		this.rotation = QuaTools.lerp(this.hand.solverRotation, this.IKRotation, this.rotationWeight);

		this.shoulder.axis = this.shoulder.axis.normalize();
		this.forearmRelToUpperArm = this.upperArm.solverRotation.clone().inverse().multiply( this.forearm.solverRotation );
	}

	applyOffsets() {
		this.position.add( this.handPositionOffset );
	}

	solve(isLeft) {
		this.chestRotation = Quaternion.LookRotation(this.rootRotation.clone().multiply( this.chestForwardAxis), this.rootRotation.clone().multiply(this.chestUpAxis) );
		this.chestForward = this.chestRotation.clone().multiply( Vector3.forward );
		this.chestUp = this.chestRotation.clone().multiply( Vector3.up );

		//Debug.DrawRay (Vector3.up * 2f, chestForward);
		//Debug.DrawRay (Vector3.up * 2f, chestUp);

		// TODO Weight for shoulder rotation
		if (this.hasShoulder && this.shoulderRotationWeight > 0) {
			switch(this.shoulderRotationMode) {
			case ShoulderRotationMode.YawPitch:
				let sDir = this.position.clone().sub( this.shoulder.solverPosition );
				sDir = sDir.clone().normalize();

				// Shoulder Yaw
				let yOA = isLeft ? this.yawOffsetAngle : -this.yawOffsetAngle;
				let yawOffset = new Quaternion().setFromAxisAngle(this.chestUp, (isLeft? -90: 90) + yOA);
				let workingSpace = yawOffset.clone().multiply( this.chestRotation );

				//Debug.DrawRay(Vector3.up * 2f, workingSpace * Vector3.forward);
				//Debug.DrawRay(Vector3.up * 2f, workingSpace * Vector3.up);

				let sDirWorking = workingSpace.clone().inverse().multiply( sDir );

				//Debug.DrawRay(Vector3.up * 2f, sDirWorking);

				let yaw = Math.degrees( Math.atan2( sDirWorking.x, sDirWorking.z ) );

				let dotY = sDirWorking.clone().dot(Vector3.up);
				dotY = 1 - Math.abs(dotY);
				yaw *= dotY;

				yaw -= yOA;
				yaw = this.damperValue(yaw, -45 - yOA, 45 - yOA, 0.7); // back, forward

				let f = this.shoulder.solverRotation.clone().multiply( this.shoulder.axis );
				let t = workingSpace.clone().multiply( new Quaternion().setFromAxisAngle(Vector3.up, yaw).multiply(Vector3.forward) );
				let yawRotation = Quaternion.FromToRotation(f, t);

				//Debug.DrawRay(Vector3.up * 2f, f, Color.red);
				//Debug.DrawRay(Vector3.up * 2f, t, Color.green);

				//Debug.DrawRay(Vector3.up * 2f, yawRotation * Vector3.forward, Color.blue);
				//Debug.DrawRay(Vector3.up * 2f, yawRotation * Vector3.up, Color.green);
				//Debug.DrawRay(Vector3.up * 2f, yawRotation * Vector3.right, Color.red);

				// Shoulder Pitch
				let pitchOffset = new Quaternion().setFromAxisAngle(this.chestUp, isLeft? -90: 90);
				workingSpace = pitchOffset.clone().multiply( this.chestRotation );//Quaternion
				workingSpace = new Quaternion().setFromAxisAngle(this.chestForward, isLeft? this.pitchOffsetAngle: - this.pitchOffsetAngle).multiply(workingSpace);



				//Debug.DrawRay(Vector3.up * 2f, workingSpace * Vector3.forward);
				//Debug.DrawRay(Vector3.up * 2f, workingSpace * Vector3.up);

				sDir = this.position.clone().sub( this.shoulder.solverPosition.clone().add( this.chestRotation.clone().multiply( (isLeft ? Vector3.right : Vector3.left) ).multiplyScalar(this.mag) )  );
				sDirWorking = workingSpace.clone().inverse().multiply( sDir );

				//Debug.DrawRay(Vector3.up * 2f, sDirWorking);

				let pitch = Math.degrees( Math.atan2(sDirWorking.y, sDirWorking.z) );

				pitch -= this.pitchOffsetAngle;
				pitch = this.damperValue(pitch, -45 - this.pitchOffsetAngle, 45 - this.pitchOffsetAngle);
				let pitchRotation = new Quaternion().setFromAxisAngle(workingSpace.clone().multiply( Vector3.right ), -pitch);

				//Debug.DrawRay(Vector3.up * 2f, pitchRotation * Vector3.forward, Color.green);
				//Debug.DrawRay(Vector3.up * 2f, pitchRotation * Vector3.up, Color.green);

				// Rotate bones
				let sR = pitchRotation.clone().multiply( yawRotation );
				if (this.shoulderRotationWeight * this.positionWeight < 1)
					sR = Quaternion.identity.lerp(sR, this.shoulderRotationWeight * this.positionWeight);

        console.log(this.bones[0].solverRotation)

    		VirtualBone.rotateBy(this.bones, sR);

        if (this.bones[0].solverRotation.w == undefined|| isNaN(this.bones[0].solverRotation.w)) {
          console.error('corrupt data bones[0].solverRotation.w')
          throw new Error()
        }

				// Solve trigonometric
				VirtualBone.solveTrigonometric(this.bones, 1, 2, 3, this.position, this.getBendNormal( this.position.clone().sub( this.upperArm.solverPosition) ), this.positionWeight);

				let p = Math.clamp(pitch * 2 * this.positionWeight, 0, 180);
				this.shoulder.solverRotation = new Quaternion().setFromAxisAngle(this.shoulder.solverRotation.clone().multiply( (isLeft? this.shoulder.axis: this.shoulder.axis.negate() ) ), p).multiply( this.shoulder.solverRotation );
				this.upperArm.solverRotation = new Quaternion().setFromAxisAngle(this.upperArm.solverRotation.clone().multiply( (isLeft? this.upperArm.axis: this.upperArm.axis.negate() ) ), p).multiply( this.upperArm.solverRotation );

				// Additional pass to reach with the shoulders
				//IKSolverTrigonometric.SolveVirtual(bones, 0, 1, 3, position, Vector3.Cross(upperArm.solverPosition - shoulder.solverPosition, hand.solverPosition - shoulder.solverPosition), pW * 1f);
			break;
			case ShoulderRotationMode.FromTo:
				let shoulderRotation = this.shoulder.solverRotation;

				let r = Quaternion.FromToRotation(this.upperArm.solverPosition.clone().sub( this.shoulder.solverPosition).normalize().add( this.chestForward), this.position.clone().sub( this.shoulder.solverPosition ) );
				r = Quaternion.identity.slerp(r, 0.5 * this.shoulderRotationWeight * this.positionWeight);
				VirtualBone.rotateBy(this.bones, r);

				VirtualBone.solveTrigonometric(this.bones, 0, 2, 3, this.position, this.forearm.solverPosition.clone().sub( this.shoulder.solverPosition ).cross( this.hand.solverPosition.clone().sub( this.shoulder.solverPosition) ), 0.5 * this.shoulderRotationWeight * this.positionWeight);
				VirtualBone.solveTrigonometric(this.bones, 1, 2, 3, this.position, this.getBendNormal(this.position.clone().sub(upperArm.solverPosition) ), this.positionWeight);

				// Twist shoulder and upper arm bones when holding hands up
				let q = Quaternion.LookRotation(this.chestUp, this.chestForward).clone().inverse();
				let vBefore = q.clone().multiply( this.shoulderRotation.clone().multiply( this.shoulder.axis) );
				let vAfter = q.clone().multiply( this.shoulder.solverRotation.clone().multiply( this.shoulder.axis) );
				let angleBefore = Math.degrees( Math.atan2(vBefore.x, vBefore.z) );
				let angleAfter = Math.degrees( Math.atan2(vAfter.x, vAfter.z) );
				let pitchAngle = Math.deltaAngle(angleBefore, angleAfter);
				if (isLeft) pitchAngle = -pitchAngle;
				pitchAngle = Math.clamp(pitchAngle * 2 * positionWeight, 0, 180);

				this.shoulder.solverRotation = new Quaternion().setFromAxisAngle(this.shoulder.solverRotation.clone().multiply( (isLeft? this.shoulder.axis: this.shoulder.axis.negate() ) ), pitchAngle).multiply( this.shoulder.solverRotation );
				this.upperArm.solverRotation = new Quaternion().setFromAxisAngle(this.upperArm.solverRotation.clone().multiply( (isLeft? this.upperArm.axis: this.upperArm.axis.negate() ) ), pitchAngle).multiply( this.upperArm.solverRotation );
			break;
			}
		}
		else {
			// Solve arm trigonometric
			VirtualBone.solveTrigonometric(this.bones, 1, 2, 3, this.position, this.getBendNormal(this.position - this.upperArm.solverPosition), this.positionWeight);
		}

		// Fix forearm twist relative to upper arm
		let forearmFixed = this.upperArm.solverRotation.clone().multiply( this.forearmRelToUpperArm );
		let fromTo = Quaternion.FromToRotation(forearmFixed.clone().multiply( this.forearm.axis), this.hand.solverPosition.clone().sub(this.forearm.solverPosition));
    this.rotateTo(this.forearm, fromTo.clone().multiply( forearmFixed), this.positionWeight);

		// Set hand rotation
		if (this.rotationWeight >= 1) {
			this.hand.solverRotation = this.rotation.clone();
		}
    else if (this.rotationWeight > 0) {
			this.hand.solverRotation = this.hand.solverRotation.clone().lerp(this.rotation, this.rotationWeight);
		}
	}

	resetOffsets() {
		this.handPositionOffset = Vector3.zero;
	}

	write(solvedPositions, solvedRotations) {
		if (this.hasShoulder) solvedRotations[this.index] = this.shoulder.solverRotation.clone();
		solvedRotations[this.index + 1] = this.upperArm.solverRotation.clone();
		solvedRotations[this.index + 2] = this.forearm.solverRotation.clone();
		solvedRotations[this.index + 3] = this.hand.solverRotation.clone();
	}

	damperValue(value, min, max, weight = 1) {
		let range = max - min;

		if (weight < 1) {
			let mid = max - range * 0.5;
			let v = value - mid;
			v *= 0.5;
			value = mid + v;
		}

		value -= min;

		let t = Math.clamp(value / range, 0, 1);
		let tEased = Interp.float(t, InterpolationMode.InOutQuintic);
		return Math.lerp(min, max, tEased);
	}

	getBendNormal(dir) {
		if (this.bendGoal != null) this.bendDirection = this.bendGoal.position.clone().sub( this.bones[0].solverPosition );

		if (this.bendGoalWeight < 1) {
			let armDir = this.bones[0].solverRotation.clone().multiply( this.bones[0].axis );

      if (this.bones[0].solverRotation.w == undefined) {
        console.error('corrupt data this.bones[0].solverRotation', this.bones[0].solverRotation)
        throw new Error()
      }

			let f = Vector3.down;
			let t = this.chestRotation.clone().inverse().multiply( dir.normalize() ).add( Vector3.forward);
			let q = Quaternion.FromToRotation(f, t);

			let b = q.clone().multiply( Vector3.back );

			f = this.chestRotation.clone().inverse().multiply( armDir );
			t = this.chestRotation.clone().inverse().multiply( dir );
			q = Quaternion.FromToRotation(f, t);
			b = q.clone().multiply( b );

			b = this.chestRotation.clone().multiply( b );

			b.add(armDir);
			b.sub(this.rotation.clone().multiply( this.wristToPalmAxis ) );
			b.sub(this.rotation.clone().multiply( this.palmToThumbAxis ).multiplyScalar( 0.5 ) );

			if (this.bendGoalWeight > 0) {
				b = b.slerp(this.bendDirection, this.bendGoalWeight);
			}

			if (this.swivelOffset != 0) b = new Quaternion().setFromAxisAngle(dir.negate(), this.swivelOffset).multiply( b );

			return b.cross(dir);
		}

		return bendDirection.cross(dir);
	}

	visualize(bone1, bone2, bone3, color) {
		//Debug.DrawLine(bone1.solverPosition, bone2.solverPosition, color);
		//Debug.DrawLine(bone2.solverPosition, bone3.solverPosition, color);
	}
}
