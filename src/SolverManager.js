export default class SolverManager {

	constructor(options={}) {
		if (options.transform) this.transform = options.transform;

		// If true, will fix all the Transforms used by the solver to their default local states in each Update.
		//this.fixTransforms = true;

		this.skipSolverUpdate = false;
		this.animator = null;
		this.updateFrame = false;
		this.componentInitiated = false;
	}




	init() {
		if (this.componentInitiated) return;
		this.initSolver();
		this.componentInitiated = true;
	}




	play() {
		this.init();
	}



	// Should be fixed tick
	tick() {
		if (this.skipSolverUpdate) return;
		if (!this.animatePhysics) this.updateFrame = true;
		this.updateFrame = true;
		this.fixTransforms();
	}




	tock(time) {
		if (this.skipSolverUpdate) return;
		if (!this.updateFrame) return;
		this.updateFrame = false;

		this.updateSolver();
	}



	initiateSolver() {}
	updateSolver() {}
	fixTransforms() {}

}
