import Footstep from './IKSolverVRFootstep';
import V3Tools from '../tools/V3Tools';
import QuaTools from '../tools/QuaTools';
import { InterpolationMode, Interp } from '../tools/Interp';
import AnimationCurve from '../tools/AnimationCurve';

class Random {
  static range(a, b) {
    return Math.floor((Math.random() * b) + a);
  }

  static get value() {
    return Math.random();
  }
}

/// Hybrid %IK solver designed for mapping a character to a VR headset and 2 hand controllers
export default class Locomotion {

	constructor() {

			/// Used for blending in/out of procedural locomotion.
			this.weight = 1;

			/// Tries to maintain this distance between the legs.
			this.footDistance = 0.3;

			/// Makes a step only if step target position is at least this far from the current footstep or the foot does not reach the current footstep anymore or footstep angle is past the 'Angle Threshold'.
			this.stepThreshold = 0.4;

			/// Makes a step only if step target position is at least 'Step Threshold' far from the current footstep or the foot does not reach the current footstep anymore or footstep angle is past this value.
			this.angleThreshold = 60;

			/// Multiplies angle of the center of mass - center of pressure vector. Larger value makes the character step sooner if losing balance.
			this.comAngleMlp = 1;

			/// Maximum magnitude of head/hand target velocity used in prediction.
			this.maxVelocity = 0.4;

			/// The amount of head/hand target velocity prediction.
			this.velocityFactor = 0.4;

			/// How much can a leg be extended before it is forced to step to another position? 1 means fully stretched.
			this.maxLegStretch = 1;

			/// The speed of lerping the root of the character towards the horizontal mid-point of the footsteps.
			this.rootSpeed = 20;

			/// The speed of steps
			this.stepSpeed = 3;

			/// The height of the foot by normalized step progress (0 - 1).
			this.stepHeight = new AnimationCurve();

			/// The height offset of the heel by normalized step progress (0 - 1).
			this.heelHeight = new AnimationCurve();

			/// Rotates the foot while the leg is not stepping to relax the twist rotation of the leg if ideal rotation is past this angle.
			this.relaxLegTwistMinAngle = 20;

			/// The speed of rotating the foot while the leg is not stepping to relax the twist rotation of the leg.
			this.relaxLegTwistSpeed = 400;

			/// Interpolation mode of the step.
			this.stepInterpolation = InterpolationMode.InOutSine;

			/// Offset for the approximated center of mass.
			this.offset = new Vector3();

			this.blockingEnabled = false;
			this.blockingLayers = -1;
			this.raycastRadius = 0.2;
			this.raycastHeight = 0.2;

			/// Called when the left foot has finished a step.
			this.onLeftFootstep = ()=>{};

			/// Called when the right foot has finished a step
			this.onRightFootstep = ()=>{};

			/// Gets the approximated center of mass.
			this.centerOfMass = new Vector3();

			this.footsteps = [];
			this.lastComPosition = new Vector3();
			this.comVelocity = new Vector3();
			this.leftFootIndex = 0;
			this.rightFootIndex = 0;
	}



	initiate(/*Vector3[]*/positions, /*Quaternion[]*/rotations, /*bool*/hasToes) {
		this.leftFootIndex = hasToes ? 17 : 16;
		this.rightFootIndex = hasToes ? 21 : 20;

		this.footsteps = [
			new Footstep(rotations[0], positions[this.leftFootIndex], rotations[this.leftFootIndex], Vector3.left.multiplyScalar(this.footDistance) ),
			new Footstep(rotations[0], positions[this.rightFootIndex], rotations[this.rightFootIndex], Vector3.right.multiplyScalar(this.footDistance) )
		];
	}



	reset(positions, rotations) {
		this.lastComPosition = positions[1].clone().lerp(positions[5], 0.25).add( rotations[0].clone().multiplyVector3(this.offset) );
		this.comVelocity = Vector3.zero;

		this.footsteps[0].reset(rotations[0], positions[this.leftFootIndex], rotations[this.leftFootIndex]);
		this.footsteps[1].reset(rotations[0], positions[this.rightFootIndex], rotations[this.rightFootIndex]);
	}




	addDeltaRotation(/*Quaternion*/delta, /*Vector3*/pivot) {
		let /*Vector3*/toLastComPosition = this.lastComPosition.clone().sub(pivot);
		this.lastComPosition = pivot.clone().add(delta.clone().multiplyVector3(toLastComPosition) );

		for (let f of this.footsteps) {
			f.rotation = delta.clone().multiply(f.rotation);
			f.stepFromRot = delta.clone().multiply(f.stepFromRot);
			f.stepToRot = delta.clone().multiply(f.stepToRot);
			f.stepToRootRot = delta.clone().multiply(f.stepToRootRot);

			let /*Vector3*/toF = f.position.clone().sub(pivot);
			f.position = pivot.clone().add( delta.clone().multiplyVector3( toF ) );

			let /*Vector3*/toStepFrom = f.stepFrom.clone().sub(pivot);
			f.stepFrom = pivot.clone().add( delta.clone().multiplyVector3( toStepFrom) );

			let /*Vector3*/toStepTo = f.stepTo.clone().sub(pivot);
			f.stepTo = pivot.clone().add( delta.clone().multiplyVector3( toStepTo) );
		}
	}




	addDeltaPosition(/*Vector3*/delta) {
		this.lastComPosition.add(delta);

		for (let f of this.footsteps) {
			f.position.add(delta);
			f.stepFrom.add(delta);
			f.stepTo.add(delta);
		}
	}



  // @TODO_CHECK: out params
	solve(/*VirtualBone*/rootBone, spine, leftLeg, rightLeg, leftArm, rightArm, supportLegIndex, leftFootPosition, rightFootPosition, leftFootRotation, rightFootRotation, leftFootOffset, rightFootOffset, leftHeelOffset, rightHeelOffset) {
		if (this.weight <= 0) {
			leftFootPosition = Vector3.zero;
			rightFootPosition = Vector3.zero;
			leftFootRotation = Quaternion.identity;
			rightFootRotation = Quaternion.identity;
			leftFootOffset = 0;
			rightFootOffset = 0;
			leftHeelOffset = 0;
			rightHeelOffset = 0;
			//console.log('need to fix out')
			return;
		}

		let rootUp = rootBone.solverRotation.clone().multiplyVector3(Vector3.up);

		let leftThighPosition = spine.pelvis.solverPosition.clone().add( spine.pelvis.solverRotation.clone().multiplyVector3( leftLeg.thighRelativeToPelvis ) );
		let rightThighPosition = spine.pelvis.solverPosition.clone().add( spine.pelvis.solverRotation.clone().multiplyVector3( rightLeg.thighRelativeToPelvis ) );

		this.footsteps[0].characterSpaceOffset = Vector3.left.multiplyScalar(this.footDistance);
		this.footsteps[1].characterSpaceOffset = Vector3.right.multiplyScalar(this.footDistance);

		let forward = spine.faceDirection;
		let forwardY = V3Tools.extractVertical(forward, rootUp, 1);
		forward.sub( forwardY );
		let forwardRotation = Quaternion.lookRotation(forward, rootUp);

		let pelvisMass = 1;
		let headMass = 1;
		let armMass = 0.2;
		let totalMass = pelvisMass + headMass + 2 * armMass;

		this.centerOfMass = Vector3.zero;
		this.centerOfMass.add( spine.pelvis.solverPosition.clone().multiply( pelvisMass ) );
		this.centerOfMass.add( spine.head.solverPosition.clone().multiply( headMass ) );
		this.centerOfMass.add( leftArm.position.clone().multiply( armMass ) );
		this.centerOfMass.add( rightArm.position.clone().multiply( armMass ) );
		this.centerOfMass.divide( totalMass );

		this.centerOfMass.add( rootBone.solverRotation.clone().multiplyVector3( this.offset ) );

		this.comVelocity = Time.deltaTime > 0 ? this.centerOfMass.clone().sub( this.lastComPosition ).divideScalar( Time.deltaTime ) : Vector3.zero;
		this.lastComPosition = this.centerOfMass;
		this.comVelocity = this.comVelocity.clone().clampLength(-Infinity, this.maxVelocity).multiplyScalar( this.velocityFactor );
		let /*Vector3*/centerOfMassV = this.centerOfMass.clone().add( this.comVelocity );

		let /*Vector3*/pelvisPositionGroundLevel = V3Tools.pointToPlane(spine.pelvis.solverPosition, rootBone.solverPosition, rootUp);
		let /*Vector3*/centerOfMassVGroundLevel = V3Tools.pointToPlane(centerOfMassV, rootBone.solverPosition, rootUp);

		let /*Vector3*/centerOfPressure = this.footsteps[0].position.clone().lerp(this.footsteps[1].position, 0.5);

		let /*Vector3*/comDir = centerOfMassV.clone().sub( centerOfPressure );
		let /*float*/comAngle = comDir.angleTo(rootBone.solverRotation.clone().multiply(Vector3.up) ) * this.comAngleMlp;

		// Set support leg
		for (let i = 0; i < this.footsteps.length; i++) {
			this.footsteps[i].isSupportLeg = supportLegIndex == i;
		}



		// Update stepTo while stepping
		for (let i = 0; i < this.footsteps.length; i++) {

			if (this.footsteps[i].isStepping) {
				let stepTo = centerOfMassVGroundLevel.clone().add( rootBone.solverRotation.clone().multiplyVector3( this.footsteps[i].characterSpaceOffset ) );

				if (!this.stepBlocked(this.footsteps[i].stepFrom, stepTo, rootBone.solverPosition)) {
					this.footsteps[i].updateStepping(stepTo, forwardRotation, 10);
				}
			}
      else {
				this.footsteps[i].updateStanding(forwardRotation, this.relaxLegTwistMinAngle, this.relaxLegTwistSpeed);
			}
		}





		// Triggering new footsteps
		if (this.canStep()) {
			let stepLegIndex = -1;
			let bestValue = -Infinity;

			for (let i = 0; i < this.footsteps.length; i++) {
				if (!this.footsteps[i].isStepping) {
					let stepTo = centerOfMassVGroundLevel.clone().add( rootBone.solverRotation.clone().multiplyVector3( this.footsteps[i].characterSpaceOffset ) );

					let legLength = i === 0 ? leftLeg.mag : rightLeg.mag;
					let thighPos = i === 0 ? leftThighPosition : rightThighPosition;

					let thighDistance = this.footsteps[i].position.clone().distanceTo(thighPos);

					let lengthStep = false;
					if (thighDistance >= legLength * this.maxLegStretch) {// * 0.95f) {
						stepTo = pelvisPositionGroundLevel.add( rootBone.solverRotation.clone().multiplyVector3( this.footsteps[i].characterSpaceOffset ) );
						lengthStep = true;
					}

					let collision = false;
					for (let n = 0; n < this.footsteps.length; n++) {
						if (n != i && !lengthStep) {
							if (this.footsteps[i].position.distanceTo(this.footsteps[n].position) < 0.25 && this.footsteps[i].position.clone().sub(stepTo).lengthSq() < this.footsteps[n].position.clone().sub(stepTo).lengthSq) {
                // ???
              }
              else collision = Locomotion.getLineSphereCollision(this.footsteps[i].position, stepTo, this.footsteps[n].position, 0.25);
							if (collision) break;
						}
					}

					let angle = Quaternion.angle(forwardRotation, this.footsteps[i].stepToRootRot);

					if (!collision || angle > this.angleThreshold) {
						let stepDistance = this.footsteps[i].position.clone().distanceTo(stepTo);
						let sT = Math.lerp(this.stepThreshold, this.stepThreshold * 0.1, comAngle * 0.015);
						if (lengthStep) sT *= 0.5;
						if (i == 0) sT *= 0.9;

						if (!this.stepBlocked(this.footsteps[i].position, stepTo, rootBone.solverPosition)) {
							if (stepDistance > sT || angle > this.angleThreshold) {
								let value = 0;

								value -= stepDistance;

								if (value > bestValue) {
									stepLegIndex = i;
									bestValue = value;
								}
							}
						}
					}
				}

			}

			if (stepLegIndex != -1) {
				let /*Vector3*/stepTo = centerOfMassVGroundLevel.clone().add( rootBone.solverRotation.clone().multiplyVector3( this.footsteps[stepLegIndex].characterSpaceOffset ) );
				this.footsteps[stepLegIndex].stepSpeed = Random.range(this.stepSpeed, this.stepSpeed * 1.5);
				this.footsteps[stepLegIndex].stepToFn(stepTo, forwardRotation);
			}
		}



		this.footsteps[0].update(this.stepInterpolation, this.onLeftFootstep);
		this.footsteps[1].update(this.stepInterpolation, this.onRightFootstep);

		leftFootPosition = this.footsteps[0].position.clone();
		rightFootPosition = this.footsteps[1].position.clone();

		leftFootPosition = V3Tools.pointToPlane(leftFootPosition, leftLeg.lastBone.readPosition, rootUp);
		rightFootPosition = V3Tools.pointToPlane(rightFootPosition, rightLeg.lastBone.readPosition, rootUp);

		leftFootOffset = this.stepHeight.evaluate(this.footsteps[0].stepProgress);
		rightFootOffset = this.stepHeight.evaluate(this.footsteps[1].stepProgress);

		leftHeelOffset = this.heelHeight.evaluate(this.footsteps[0].stepProgress);
		rightHeelOffset = this.heelHeight.evaluate(this.footsteps[1].stepProgress);

		leftFootRotation = this.footsteps[0].rotation.clone();
		rightFootRotation = this.footsteps[1].rotation.clone();

		return {
			leftFootPosition,
			rightFootPosition,
			leftFootRotation,
			rightFootRotation,
			leftFootOffset,
			rightFootOffset,
			leftHeelOffset,
			rightHeelOffset
		}
	}




	get leftFootstepPosition() {
		return this.footsteps[0].position;
	}

	get rightFootstepPosition() {
		return this.footsteps[1].position;
	}

	get leftFootstepRotation() {
		return this.footsteps[0].rotation;
	}

	get rightFootstepRotation() {
		return this.footsteps[1].rotation;
	}




	stepBlocked(fromPosition, toPosition, rootPosition) {
		if (this.blockingLayers == -1 || !this.blockingEnabled) return false;

		let /*Vector3*/origin = fromPosition;
		origin.setY( rootPosition.y + this.raycastHeight + this.raycastRadius );

		let direction = toPosition.clone().sub(origin);
		direction.setY(0);

		// @TODO : add raycast...
		// THREE.Ray(origin, direction )
		// var intersects = raycaster.intersectObjects( scene.children );
		// for ( var i = 0; i < intersects.length; i++ ) {
		//
		// intersects[ i ].object.material.color.set( 0xff0000 );
		//
		// }

		return false;


		// RaycastHit hit;
		//
		// THREE.Ray(origin, direction )
		//
		// if (raycastRadius <= 0) {
		// 	return Physics.Raycast(origin, direction, out hit, direction.magnitude, blockingLayers);
		// } else {
		// 	return Physics.SphereCast(origin, raycastRadius, direction, out hit, direction.magnitude, blockingLayers);
		// }


	}




	canStep() {
		for (let f of this.footsteps) if (f.isStepping && f.stepProgress < 0.8) return false;
		return true;
	}




	static getLineSphereCollision(/*Vector3*/lineStart, /*Vector3*/lineEnd, /*Vector3*/sphereCenter, /*float*/sphereRadius) {
		let line = lineEnd.clone().sub( lineStart );
		let toSphere = sphereCenter.clone().sub( lineStart );
		let distToSphereCenter = toSphere.length();
		let d = distToSphereCenter - sphereRadius;

		if (d > line.length()) return false;

		let q = Quaternion.lookRotation(line, toSphere);

		let toSphereRotated = q.clone().inverse().multiplyVector3( toSphere );

		if (toSphereRotated.z < 0) {
			return d < 0;
		}

		return toSphereRotated.y - sphereRadius < 0;
	}
}
