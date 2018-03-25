import V3Tools from './tools/V3Tools';
import QuaTools from './tools/QuaTools';
import { InterpolationMode, Interp } from './Interp';

export default class Footstep {

	get isStepping() { return this.stepProgress < 1; }

	constructor (rootRotation, footPosition, footRotation, characterSpaceOffset) {

		this.stepSpeed = 3;
		this.characterSpaceOffset = new Vector3();

		this.position = new Vector3();
		this.rotation = Quaternion.identity;
		this.stepToRootRot = Quaternion.identity;
		this.isSupportLeg = false;

		this.stepProgress = 0;
		this.stepFrom = new Vector3();
		this.stepTo = new Vector3();
		this.stepFromRot = Quaternion.identity;
		this.stepToRot = Quaternion.identity;
		this.footRelativeToRoot = Quaternion.identity;
		this.supportLegW = 0;
		this.supportLegWV = 0;

		this.characterSpaceOffset = characterSpaceOffset;
		this.reset(rootRotation, footPosition, footRotation);
	}

	reset(rootRotation, footPosition, footRotation) {
		this.position = footPosition;
		this.rotation = footRotation;
		this.stepFrom = this.position;
		this.stepTo = this.position;
		this.stepFromRot = this.rotation;
		this.stepToRot = this.rotation;
		this.stepToRootRot = rootRotation;
		this.stepProgress = 1;
		this.footRelativeToRoot = rootRotation.clone().inverse().multiply( this.rotation );
	}

	stepToFn(p, rootRotation) {
		this.stepFrom = this.position;
		this.stepTo = p;
		this.stepFromRot = this.rotation;
		this.stepToRootRot = rootRotation;
		this.stepToRot = rootRotation.clone().multiply( this.footRelativeToRoot );
		this.stepProgress = 0;
	}

	updateStepping(p, rootRotation, speed) {
		this.stepTo = this.stepTo.lerp (p, Time.deltaTime * speed);
		this.stepToRot = Quaternion.Lerp (this.stepToRot, rootRotation.clone().multiply( this.footRelativeToRoot ), Time.deltaTime * speed);

		this.stepToRootRot = this.stepToRot.clone().multiply( this.footRelativeToRoot.clone().inverse() );
	}

	updateStanding(rootRotation, minAngle, speed) {
		if (speed <= 0 || minAngle >= 180) return;

		let r = rootRotation.clone().multiply( this.footRelativeToRoot.clone() );

		let angle = Quaternion.Angle (this.rotation.clone(), r);

		if (angle > minAngle){
			this.rotation = this.rotation.clone().slerp(r, Math.min(Time.deltaTime * speed * (1 - this.supportLegW), angle -minAngle));
		}
	}

	update(interpolation, onStep) {
		let supportLegWTarget = this.isSupportLeg ? 1 : 0;

		this.supportLegW = Math.smoothDamp(this.supportLegW, supportLegWTarget, this.supportLegWV, 0.2);

		if (!this.isStepping) return;

		this.stepProgress = Math.moveTowards(this.stepProgress, 1, Time.deltaTime * this.stepSpeed);

		if (this.stepProgress >= 1) onStep();

		let stepProgressSmooth = Interp.float(this.stepProgress, interpolation);

		this.position = this.stepFrom.lerp(this.stepTo, stepProgressSmooth);
		this.rotation = this.stepFromRot.lerp(this.stepToRot, stepProgressSmooth);
	}
}
