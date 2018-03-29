import QuaTools from '../tools/QuaTools';

export default class QuaToolsTest {

  static run() {
    console.log('\n\nRunning QuaToolsTest\n');
    QuaToolsTest.lerp();
    QuaToolsTest.slerp();
    QuaToolsTest.linearBlend();
    QuaToolsTest.sphericalBlend();
    QuaToolsTest.fromToAroundAxis();
    QuaToolsTest.rotationToLocalSpace();
    QuaToolsTest.fromToRotation();
    QuaToolsTest.getAxis();
    QuaToolsTest.clampRotation();
    QuaToolsTest.clampAngle();
    QuaToolsTest.matchRotation();
  }




  static lerp() {
    let fromRotation = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let toRotation = new Quaternion(0.2, 0.15, 0.35, 0.88);
    let weight = 0.7;
    let result = QuaTools.lerp(fromRotation, toRotation, weight);
    console.log( 'lerp: ', result );
    return result;
  }




  static slerp() {
    let fromRotation = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let toRotation = new Quaternion(0.2, 0.15, 0.35, 0.88);
    let weight = 0.7;
    let result = QuaTools.slerp(fromRotation, toRotation, weight);
    console.log( 'slerp: ', result );
    return result;
  }




  static linearBlend() {
    let q = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let weight = 0.7;
    let result = QuaTools.linearBlend(q, weight);
    console.log( 'linearBlend: ', result );
    return result;
  }




  static sphericalBlend() {
    let q = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let weight = 0.7;
    let result = QuaTools.sphericalBlend(q, weight);
    console.log( 'sphericalBlend: ', result );
    return result;
  }




  static fromToAroundAxis() {
    let fromDirection = new Vector3(10, 20, 30);
    let toDirection = new Vector3(52, 32, 42);
    let axis = new Vector3(4, 2, 2);
    let result = QuaTools.fromToAroundAxis(fromDirection, toDirection, axis);
    console.log( 'fromToAroundAxis: ', result );
    return result;
  }




  static rotationToLocalSpace() {
    let space = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let rotation = new Quaternion(0.2, 0.15, 0.35, 0.88);
    let result = QuaTools.rotationToLocalSpace(space, rotation);
    console.log( 'rotationToLocalSpace: ', result );
    return result;
  }




  static fromToRotation() {
    let from = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let to = new Quaternion(0.2, 0.15, 0.35, 0.88);
    let result = QuaTools.fromToRotation(from, to);
    console.log( 'fromToRotation: ', result );
    return result;
  }




  static getAxis() {
    let v = new Vector3(52, 32, 42);
    let result = QuaTools.getAxis(v);
    console.log( 'getAxis: ', result );
    return result;
  }




  static clampRotation() {
    let rotation = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let clampWeight = 0.4;
    let clampSmoothing = 2;
    let result = QuaTools.clampRotation(rotation, clampWeight, clampSmoothing);
    console.log( 'clampRotation: ', result );
    return result;
  }




  static clampAngle() {
    let angle = 42;
    let clampWeight = 0.4;
    let clampSmoothing = 2;
    let result = QuaTools.clampAngle(angle, clampWeight, clampSmoothing);
    console.log( 'clampAngle: ', result );
    return result;
  }




  static matchRotation() {
    let targetRotation = new Quaternion(0.3, 0.1, 0.3, 0.9);
    let targetforwardAxis = new Vector3(52, 32, 42);
    let targetUpAxis = new Vector3(0, 3, 0);
    let forwardAxis = new Vector3(0, 0, 2);
    let upAxis = new Vector3(0, 5, 2);
    let result = QuaTools.matchRotation(targetRotation, targetforwardAxis, targetUpAxis, forwardAxis, upAxis);
    console.log( 'matchRotation: ', result );
    return result;
  }


}
