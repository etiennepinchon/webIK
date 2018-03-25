import Point from './Point';

/// %Node type of element in the %IK chain. Used in the case of mixed/non-hierarchical %IK systems
export default class Node extends Point {

  constructor(transform, weight) {
    super();
    
    /// Distance to child node.
    this.length = 0;

    /// The effector position weight.
    this.effectorPositionWeight = 0;

    /// The effector rotation weight.
    this.effectorRotationWeight = 0;

    /// Position offset.
    this.offset = new Vector3();

    if (transform) this.transform = transform;
    if (weight) this.weight = weight;
  }
}
