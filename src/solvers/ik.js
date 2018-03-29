import SolverManager from './SolverManager';

export default class IK extends SolverManager {

	// Updates the solver.
	updateSolver() {
		const solver = this.getIKSolver();

		if (!solver.initiated) this.initSolver();
		if (!solver.initiated) return;

		solver.update();
	}




	// Initiates the %IK solver
	initSolver() {
		const solver = this.getIKSolver();

		if (solver.initiated) return;
		if (!this.transform) console.error("Need to set object 3D.")

		solver.initiate(this.transform);
	}




	fixTransforms() {
		const solver = this.getIKSolver();

		if (!solver.initiated) return;
		solver.fixTransforms();
	}




	getIKSolver() {}
}
