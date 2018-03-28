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
		this.position = footPosition.clone();
		this.rotation = footRotation.clone();
		this.stepFrom = this.position;
		this.stepTo = this.position;
		this.stepFromRot = this.rotation;
		this.stepToRot = this.rotation;
		this.stepToRootRot = rootRotation.clone();
		this.stepProgress = 1;
		this.footRelativeToRoot = rootRotation.clone().inverse().multiply( this.rotation );
	}




	stepToFn(/*Vector3*/p, /*Quaternion*/rootRotation) {
		this.stepFrom = this.position;
		this.stepTo = p.clone();
		this.stepFromRot = this.rotation;
		this.stepToRootRot = rootRotation.clone();
		this.stepToRot = rootRotation.clone().multiply( this.footRelativeToRoot );
		this.stepProgress = 0;
	}




	updateStepping(/*Vector3*/p, /*Quaternion*/rootRotation, /*float*/speed) {
		this.stepTo = this.stepTo.lerp (p, Time.deltaTime * speed);
		this.stepToRot = Quaternion.lerp (this.stepToRot, rootRotation.clone().multiply( this.footRelativeToRoot ), Time.deltaTime * speed);

		this.stepToRootRot = this.stepToRot.clone().multiply( this.footRelativeToRoot.clone().inverse() );
	}




	updateStanding(/*Quaternion*/rootRotation, /*float*/minAngle, /*float*/speed) {
		if (speed <= 0 || minAngle >= 180) return;

		let /*Quaternion*/r = rootRotation.clone().multiply( this.footRelativeToRoot );

		let /*float*/angle = Quaternion.angle(this.rotation, r);

		if (angle > minAngle){
			this.rotation = Quaternion.rotateTowards(this.rotation, r, Math.min(Time.deltaTime * speed * (1 - this.supportLegW), angle -minAngle));
		}
	}




	update(/*InterpolationMode*/interpolation, /*Event*/onStep) {
		let supportLegWTarget = this.isSupportLeg ? 1 : 0;

		this.supportLegW = Math.smoothDamp(this.supportLegW, supportLegWTarget, this.supportLegWV, 0.2);

		if (!this.isStepping) return;

		this.stepProgress = Math.moveTowards(this.stepProgress, 1, Time.deltaTime * this.stepSpeed);

		if (this.stepProgress >= 1) onStep();

		let stepProgressSmooth = Interp.float(this.stepProgress, interpolation);

		this.position = this.stepFrom.clone().lerp(this.stepTo, stepProgressSmooth);
		this.rotation = this.stepFromRot.clone().lerp(this.stepToRot, stepProgressSmooth);
	}
}
