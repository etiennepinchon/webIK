import RotationLimit from '../rotationLimits/RotationLimit';

export default class RotationLimitTest {

  static run() {
    console.log('\n\nRunning RotationLimitTest\n');
    RotationLimit.setDefaultLocalRotation();
    RotationLimit.toAxis();
    RotationLimit.getAxisToPoint();
    RotationLimit.getAxisToDirection();
    RotationLimit.getAxisVectorToPoint();
    RotationLimit.getAxisVectorToDirection();
  }




  static setDefaultLocalRotation() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let instance = new RotationLimit(t);
    instance.setDefaultLocalRotation();
    console.log( 'setDefaultLocalRotation: ', instance.defaultLocalRotation );
  }




  static getLimitedLocalRotation() {
    let t = new THREE.Object3D();
    t.setUnityQuaternion(new Quaternion(0.3, 0.1, 0.3, 0.9));
    let instance = new RotationLimit(t);
    instance.setDefaultLocalRotation();
    let localRotation = new Quaternion(0.2, 0.3, 0.3, 0.85)
    let result = instance.getLimitedLocalRotation(localRotation);
    console.log( 'getLimitedLocalRotation: ', result);
  }




}
