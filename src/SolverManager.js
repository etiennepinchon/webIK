export default class SolverManager {

	constructor(options={}) {
		if (options.transform) this.transform = options.transform;

		// The updating frequency
		this.timeStep = 0;
		this.lastTime = 0;

		// If true, will fix all the Transforms used by the solver to their default local states in each Update.
		//this.fixTransforms = true;

		this.updateFrame;
		this.componentInitiated;
	}

	init() {
		if (this.componentInitiated) return;
		this.initSolver();
		this.componentInitiated = true;
	}

	play() {
		this.init();
	}

	tick() {
		//if (this.fixTransforms)
		this.fixTransforms();
		this.updateFrame = true;
	}

	tock(time) {
		this.updateFrame = false;

		if (this.timeStep == 0) this.updateSolver();
		else {
			if (time >= this.lastTime + this.timeStep) {
				this.updateSolver();
				this.lastTime = time;
			}
		}
	}

}
