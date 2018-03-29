import Point from '../solvers/Point';

export default class PointTest {

  static run() {
    console.log('\n\nRunning PointTest\n');
    PointTest.storeDefaultLocalState();
    PointTest.fixTransform();
    PointTest.updateSolverPosition();
    PointTest.updateSolverLocalPosition();
    PointTest.updateSolverState();
    PointTest.updateSolverLocalState();
  }



  static storeDefaultLocalState() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.storeDefaultLocalState();

    console.log('storeDefaultLocalState: ')
    console.log(point.defaultLocalPosition);
    console.log(point.defaultLocalRotation);
  }




  static fixTransform() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.storeDefaultLocalState();
    t.position.copy(new Vector3(32, 42, 22));
    t.setUnityQuaternion(new Quaternion(0.4, 0.12, 0.32, 0.8));
    point.fixTransform();

    console.log('fixTransform: ')
    console.log(point.transform.position);
    console.log(point.transform.quaternion);
  }




  static updateSolverPosition() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.updateSolverPosition();

    console.log('updateSolverPosition: ')
    console.log(point.solverPosition);
  }




  static updateSolverLocalPosition() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.updateSolverLocalPosition();

    console.log('updateSolverLocalPosition: ')
    console.log(point.solverPosition);
  }




  static updateSolverState() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.updateSolverState();

    console.log('updateSolverState: ')
    console.log(point.solverPosition);
    console.log(point.solverRotation);
  }




  static updateSolverLocalState() {
    let a = new THREE.Object3D();
    a.position.copy(new Vector3(12, 22, 62));
    a.setUnityQuaternion(new Quaternion(0.1, 0.21, 0.1, 0.9));
    window._scene.add(a);

    let b = new THREE.Object3D();
    b.position.copy(new Vector3(-3, -2, 1));
    b.setUnityQuaternion(new Quaternion(0.1, 0.1, 0.1, 0.85));
    a.add(b);

    let t = new THREE.Object3D();
    t.position.copy(new Vector3(52, 32, 42));
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    b.add(t);

    let point = new Point(t);
    point.updateSolverLocalState();

    console.log('updateSolverLocalState: ')
    console.log(point.solverPosition);
    console.log(point.solverRotation);
  }
}
