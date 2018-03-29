import IK from './solvers/ik';
import References from './solvers/References';
import IKSolverVR from './solvers/IKSolverVR';

export default class VRIK extends IK {

  constructor(options={}) {
    super(options);
    this.references = new References(options.references);
    this.solver = new IKSolverVR({
      headTarget: options.headTarget,
      leftHandTarget: options.leftHandTarget,
      rightHandTarget: options.rightHandTarget
    });
  }

  guessHandOrientations() {
		solver.guessHandOrientations(this.references, false);
	}

  getIKSolver() {
		return this.solver;
	}

  initSolver() {
//		if (references.isEmpty) AutoDetectReferences();
		if (this.references.isFilled) this.solver.setToReferences(this.references);
    super.initSolver();
	}

  tick() {
    super.tick();
  }

}
