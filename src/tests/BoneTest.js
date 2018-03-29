import Bone from '../solvers/Bone';

export default class BoneTest {

  static run() {
    console.log("\n\nRunning BoneTest\n");
    BoneTest.swing();
    BoneTest.solverSwing();
    BoneTest.swing2D();
  }



  static swing() {
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

    let swingTarget = new Vector3(50, 33, 38);

    let bone = new Bone(t, 0.2);
    bone.swing(swingTarget, 0.4);

    console.log('swing: ')
    console.log(bone.transform.quaternion);
  }




  static solverSwing() {
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

    let swingTarget = new Vector3(50, 33, 38);

    let bone = new Bone(t, 0.2);
    Bone.solverSwing([bone], 0, swingTarget, 1.4);

    console.log('solverSwing: ')
    console.log(bone.solverRotation);
  }




  static swing2D() {
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

    let swingTarget = new Vector3(50, 33, 38);

    let bone = new Bone(t, 0.2);
    bone.swing2D(swingTarget, 0.4);

    console.log('swing2D: ')

    console.log(bone.transform.getWorldQuaternion());
    console.log(bone.transform.quaternion);
  }


}
