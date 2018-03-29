import AxisTools from '../tools/AxisTools';

export default class AxisToolsTest {

  static run() {
    console.log('\n\nRunning AxisToolsTest\n');
    AxisToolsTest.toVector3();
    AxisToolsTest.toAxis();
    AxisToolsTest.getAxisToPoint();
    AxisToolsTest.getAxisToDirection();
    AxisToolsTest.getAxisVectorToPoint();
    AxisToolsTest.getAxisVectorToDirection();
  }




  static toVector3() {
    let axis = 0//Axis.X;
    let result = AxisTools.toVector3(axis);
    console.log( 'toVector3: ', result );
    return result;
  }




  static toAxis() {
    let v = new Vector3(10, 20, 30);
    let result = AxisTools.toAxis(v);
    console.log( 'toAxis: ', result );
    return result;
  }





  static getAxisToPoint() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let worldPosition = new Vector3(52, 32, 42);
    let result = AxisTools.getAxisToPoint(t, worldPosition);
    console.log( 'getAxisToPoint: ', result );
    return result;
  }




  static getAxisToDirection() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let worldPosition = new Vector3(52, 32, 42);
    let result = AxisTools.getAxisToDirection(t, worldPosition);
    console.log( 'getAxisToDirection: ', result );
    return result;
  }




  static getAxisVectorToPoint() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let worldPosition = new Vector3(52, 32, 42);
    let result = AxisTools.getAxisVectorToPoint(t, worldPosition);
    console.log( 'getAxisVectorToPoint: ', result );
    return result;
  }




  static getAxisVectorToDirection() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let direction = new Vector3(52, 32, 42);
    let result = AxisTools.getAxisVectorToDirection(t, direction);
    console.log( 'getAxisVectorToDirection: ', result );
    return result;
  }

}
