import V3Tools from '../tools/V3Tools';

export default class V3ToolsTest {

  static run() {
    console.log('\n\nRunning V3ToolsTest\n');
    V3ToolsTest.lerp();
    V3ToolsTest.slerp();
    V3ToolsTest.extractVertical();
    V3ToolsTest.extractHorizontal();
    V3ToolsTest.clampDirection();
    V3ToolsTest.clampDirectionWithValue();
    V3ToolsTest.lineToPlane();
    V3ToolsTest.pointToPlane();
  }




  static lerp() {
    let fromVector = new Vector3(10, 20, 30);
    let toVector = new Vector3(52, 32, 42);
    let weight = 0.7;
    let result = V3Tools.lerp(fromVector, toVector, weight);
    console.log( 'lerp: ', result );
    return result;
  }




  static slerp() {
    let fromVector = new Vector3(10, 20, 30);
    let toVector = new Vector3(52, 32, 42);
    let weight = 0.7;
    let result = V3Tools.slerp(fromVector, toVector, weight);
    console.log( 'slerp: ', result );
    return result;
  }




  static extractVertical() {
    let v = new Vector3(10, 20, 30);
    let verticalAxis = new Vector3(52, 32, 42);
    let weight = 0.7;
    let result = V3Tools.extractVertical(v, verticalAxis, weight);
    console.log( 'extractVertical: ', result );
    return result;
  }





  static extractHorizontal() {
    let v = new Vector3(10, 20, 30);
    let normal = new Vector3(52, 32, 42);
    let weight = 0.7;
    let result = V3Tools.extractHorizontal(v, normal, weight);
    console.log( 'extractHorizontal: ', result );
    return result;
  }




  static clampDirection() {
    let direction = new Vector3(10, 20, 30);
    let normalDirection = new Vector3(52, 32, 42);
    let clampWeight = 0.7;
    let clampSmoothing = 2;
    let result = V3Tools.clampDirection(direction, normalDirection, clampWeight, clampSmoothing);
    console.log( 'clampDirection: ', result );
    return result;
  }




  static clampDirectionWithValue() {
    let direction = new Vector3(10, 20, 30);
    let normalDirection = new Vector3(52, 32, 42);
    let clampWeight = 0.7;
    let clampSmoothing = 2;
    let result = V3Tools.clampDirectionWithValue(direction, normalDirection, clampWeight, clampSmoothing);
    console.log( 'clampDirectionWithValue: ', result );
    return result;
  }




  static lineToPlane() {
    let origin = new Vector3(10, 20, 30);
    let direction = new Vector3(52, 32, 42);
    let planeNormal = new Vector3(2, 4, 5);
    let planePoint = new Vector3(2, 2, 1);
    let result = V3Tools.lineToPlane(origin, direction, planeNormal, planePoint);
    console.log( 'lineToPlane: ', result );
    return result;
  }




  static pointToPlane() {
    let point = new Vector3(10, 20, 30);
    let planePosition = new Vector3(52, 32, 42);
    let planeNormal = new Vector3(2, 4, 5);
    let result = V3Tools.pointToPlane(point, planePosition, planeNormal);
    console.log( 'pointToPlane: ', result );
    return result;
  }






}
