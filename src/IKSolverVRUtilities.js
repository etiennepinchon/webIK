import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';

export const PositionOffset = {
	Pelvis: 0,
	Chest: 1,
	Head: 2,
	LeftHand: 3,
	RightHand: 4,
	LeftFoot: 5,
	RightFoot: 6,
	LeftHeel: 7,
	RightHeel: 8
};

export const RotationOffset = {
	Pelvis: 0,
	Chest: 1,
	Head: 2,
};

export class VirtualBone {

	constructor(position, rotation) {

  	this.readPosition = new Vector3();
  	this.readRotation = Quaternion.identity;

  	this.solverPosition = new Vector3();
  	this.solverRotation = Quaternion.identity;

  	this.length = 0;
  	this.sqrMag = 0;
    this.axis = new Vector3();

		this.read(position.clone(), rotation.clone());
	}




	read(position, rotation) {
		this.readPosition = position;
		this.readRotation = rotation;
		this.solverPosition = position;
		this.solverRotation = rotation;
	}




	static swingRotation(/*VirtualBone[]*/bones, /*int*/index, /*Vector3*/swingTarget, /*float*/weight = 1) {
		if (weight <= 0) return;

		let from = bones[index].solverRotation.clone().multiplyVector3(bones[index].axis);
		let to = swingTarget.clone().sub(bones[index].solverPosition);
		let r = Quaternion.fromToRotation(from, to);
		if (weight < 1) r = Quaternion.identity.lerp(r, weight);

		for (let i = index; i < bones.length; i++) {
			if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
				console.error('pre corrupt data bones[i].solverRotation.w', bones[i].solverRotation)
				throw new Error()
			}

			bones[i].solverRotation = r.clone().multiply( bones[i].solverRotation );

			if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
				console.error('corrupt data bones[i].solverRotation.w', bones[i].solverRotation)
				throw new Error()
			}
		}
	}




	// Calculates bone lengths and axes, returns the length of the entire chain
	// TODO_CHECK ref bones
	static preSolve(/*ref VirtualBone[]*/bones) {
		let length = 0;

		for (let i = 0; i < bones.length; i++) {
			if (i < bones.length - 1) {
				bones[i].sqrMag = bones[i + 1].solverPosition.clone().sub(bones[i].solverPosition).lengthSq();
				bones[i].length = Math.sqrt(bones[i].sqrMag);
				length += bones[i].length;

				let pos = bones[i + 1].solverPosition.clone().sub(bones[i].solverPosition);
				bones[i].axis = bones[i].solverRotation.clone().inverse().multiplyVector3(pos);

				if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
					console.error('corrupt data bones[i].solverRotation.w', bones[i].solverRotation)
					throw new Error()
				}

			}
      else {
				bones[i].sqrMag = 0;
				bones[i].length = 0;
			}
		}

		return length;
	}




	static rotateAroundPoint(/*VirtualBone[]*/bones, index, point, rotation) {
		for (let i = index; i < bones.length; i++) {
			if (bones[i]) {
				let/*Vector3*/ dir = bones[i].solverPosition.clone().sub(point);
				bones[i].solverPosition = point.clone().add( rotation.clone().multiplyVector3(dir) );

				if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
					console.error('corrupt data bones[i].solverRotation.w', bones[i].solverRotation, rotation)
					throw new Error()
				}

				bones[i].solverRotation = bones[i].solverRotation.clone().multiply( rotation )

				if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
					console.error('corrupt data bones[i].solverRotation.w', bones[i].solverRotation, rotation)
					throw new Error()
				}


			}
		}
	}




	static rotateIndexBy(bones, index, rotation) {
		for (let i = index; i < bones.length; i++) {
			if (bones[i]) {
				let dir = bones[i].solverPosition.clone().sub( bones[index].solverPosition );
				bones[i].solverPosition = bones[index].solverPosition.clone().add( rotation.clone().multiplyVector3(dir) );
				bones[i].solverRotation = bones[i].solverRotation.clone().multiply( rotation );

				if (bones[i].solverRotation.w == undefined|| isNaN(bones[i].solverRotation.w)) {
					console.error('corrupt data bones[i].solverRotation.w', rotation)
					throw new Error()
				}
			}
		}
	}




	static rotateBy(bones, rotation) {
		for (let i = 0; i < bones.length; i++) {
			if (bones[i]) {
				if (i > 0) {
					let dir = bones[i].solverPosition.clone().sub( bones[0].solverPosition );
					bones[i].solverPosition = bones[0].solverPosition.clone().add( rotation.clone().multiplyVector3( dir ) );
				}

				bones[i].solverRotation = bones[i].solverRotation.clone().multiply( rotation );

				if (bones[i].solverRotation.w == undefined || isNaN(bones[i].solverRotation.w)) {
					console.error('corrupt data bones[i].solverRotation.w', i)
					throw new Error()
				}

			}
		}
	}



	static rotateTo(bones, index, rotation) {
		let q = QuaTools.fromToRotation(bones[index].solverRotation, rotation);

		this.rotateAroundPoint(bones, index, bones[index].solverPosition, q);
	}



	/// Solve the bone chain virtually using both solverPositions and SolverRotations. This will work the same as IKSolverTrigonometric.Solve.
	static solveTrigonometric(/*VirtualBone[]*/bones, /*int*/first, /*int*/second, /*int*/third, /*Vector3*/targetPosition, /*Vector3*/bendNormal, /*float*/weight) {
		if (weight <= 0) return;

		// Direction of the limb in solver
		targetPosition = bones[third].solverPosition.clone().lerp(targetPosition, weight);

		const dir = targetPosition.clone().sub( bones[first].solverPosition );

		// Distance between the first and the last transform solver positions
		const sqrMag = dir.lengthSq();
		if (sqrMag === 0) return;
		let length = Math.sqrt(sqrMag);

		let sqrMag1 = bones[second].solverPosition.clone().sub(bones[first].solverPosition).lengthSq();
		let sqrMag2 = bones[third].solverPosition.clone().sub(bones[second].solverPosition).lengthSq();

		// Get the general world space bending direction
		let bendDir = dir.clone().cross(bendNormal);

		// Get the direction to the trigonometrically solved position of the second transform
		let toBendPoint = this.getDirectionToBendPoint(dir, length, bendDir, sqrMag1, sqrMag2);

		// Position the second transform
		let q1 = Quaternion.fromToRotation(bones[second].solverPosition.clone().sub(bones[first].solverPosition), toBendPoint);
		if (weight < 1) q1 = Quaternion.identity.lerp(q1, weight);

		if (bones[first].solverRotation.w == undefined|| isNaN(bones[first].solverRotation.w)) {
			console.error('corrupt data bones[first].solverRotation.w')
			throw new Error()
		}
		if (bones[third].solverRotation.w == undefined|| isNaN(bones[third].solverRotation.w)) {
			console.error('corrupt data bones[third].solverRotation.w')
			throw new Error()
		}
		if (bones[second].solverRotation.w == undefined || isNaN(bones[second].solverRotation.w) ) {
			console.error('corrupt data bones[second].solverRotation.w')
			throw new Error()
		}

		this.rotateAroundPoint(bones, first, bones[first].solverPosition.clone(), q1.clone());

		if (bones[second].solverRotation.w == undefined || isNaN(bones[second].solverRotation.w) ) {
			console.error('corrupt data bones[second].solverRotation.w')
			throw new Error()
		}


		let q2 = Quaternion.fromToRotation(bones[third].solverPosition.clone().sub(bones[second].solverPosition), targetPosition.clone().sub(bones[second].solverPosition) );
		if (weight < 1) q2 = Quaternion.identity.lerp(q2, weight);

		if (bones[second].solverRotation.w == undefined) {
			console.error('corrupt data bones[second].solverRotation.w')
			throw new Error()
		}

		this.rotateAroundPoint(bones, second, bones[second].solverPosition.clone(), q2);
	}




	//Calculates the bend direction based on the law of cosines. NB! Magnitude of the returned vector does not equal to the length of the first bone!
	static getDirectionToBendPoint(/*Vector3*/direction, /*float*/directionMag, /*Vector3*/bendDirection, /*float*/sqrMag1, /*float*/sqrMag2) {
	  let x = ((directionMag * directionMag) + (sqrMag1 - sqrMag2)) / 2 / directionMag;
		let y = Math.sqrt(Math.clamp(sqrMag1 - x * x, 0, Infinity));

		if (direction.equals(Vector3.zero)) return Vector3.zero;
		return Quaternion.lookRotation(direction, bendDirection).multiplyVector3( new Vector3(0, y, x) );
	}




	// Solves a simple FABRIK pass for a bone hierarchy, not using rotation limits or singularity breaking here
	static solveFABRIK(/*VirtualBone[]*/bones, /*Vector3*/startPosition, /*Vector3*/targetPosition, /*float*/weight, /*float*/minNormalizedTargetDistance, /*int*/iterations, /*float*/length) {
		if (weight <= 0) return;

		if (minNormalizedTargetDistance > 0) {
			const targetDirection = targetPosition.clone().sub( startPosition );
			const targetLength = targetDirection.length();
			let max = Math.max(length * minNormalizedTargetDistance, targetLength);
			targetPosition = startPosition.clone().add( targetDirection.clone().divideScalar( targetLength ).multiplyScalar(max) );
		}

		// Iterating the solver
		for (let iteration = 0; iteration < iterations; iteration ++) {

			if (bones[bones.length - 1].solverPosition.x == undefined || isNaN(bones[bones.length - 1].solverPosition.x)) {
				console.error('pre corrupt data bones[bones.length - 1].solverPosition')
				throw new Error()
			}


			// Stage 1
			bones[bones.length - 1].solverPosition = bones[bones.length - 1].solverPosition.clone().lerp(targetPosition, weight);

			if (bones[bones.length - 1].solverPosition.x == undefined || isNaN(bones[bones.length - 1].solverPosition.x)) {
				console.error('corrupt data bones[bones.length - 1].solverPosition')
				throw new Error()
			}

			for (let i = bones.length - 2; i > -1; i--) {
				// Finding joint positions
				bones[i].solverPosition = this.solveFABRIKJoint(bones[i].solverPosition, bones[i + 1].solverPosition, bones[i].length);
			}

			// Stage 2
			bones[0].solverPosition = startPosition.clone();

			for (let i = 1; i < bones.length; i++) {
				bones[i].solverPosition = this.solveFABRIKJoint(bones[i].solverPosition, bones[i - 1].solverPosition, bones[i - 1].length);

				if (bones[i].solverPosition.x == undefined || isNaN(bones[i].solverPosition.x)) {
					console.error('corrupt data bones[bones.length - 1].solverPosition')
					throw new Error()
				}


			}
		}

		for (let i = 0; i < bones.length - 1; i++) {
			VirtualBone.swingRotation(bones, i, bones[i + 1].solverPosition);
		}
	}




	// Solves a FABRIK joint between two bones.
	static solveFABRIKJoint(pos1, pos2, length) {
		return pos2.clone().add( pos1.clone().sub(pos2).normalize().multiplyScalar(length) );
	}




	static solveCCD(/*VirtualBone[]*/bones, /*Vector3*/targetPosition, /*float*/weight, /*int*/iterations) {
		if (weight <= 0) return;

		// Iterating the solver
		for (let iteration = 0; iteration < iterations; iteration ++) {
			for (let i = bones.length - 2; i > -1; i--) {
				let toLastBone = bones[bones.length - 1].solverPosition.clone().sub( bones[i].solverPosition );
				let toTarget = targetPosition.clone().sub( bones[i].solverPosition );

				let rotation = Quaternion.fromToRotation(toLastBone, toTarget);

				if (weight >= 1) {
					//bones[i].transform.rotation = targetRotation;
					VirtualBone.rotateIndexBy(bones, i, rotation);
				} else {
					VirtualBone.rotateIndexBy(bones, i, Quaternion.identity.lerp(rotation, weight));
				}
			}
		}
	}
}
