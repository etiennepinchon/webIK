import Keyframe from './Keyframe';
import AnimationCurve from './AnimationCurve';
import Utils from './helpers/Utils';

const radToDeg = (180.0 / Math.PI);
const degToRad = (Math.PI / 180.0);

THREE.Quaternion.prototype.multiplyVector3 = function(vec) {
  if (vec.w) throw new Error('NO.. multiplyVector3 on a quaternion..')
  let num = this.x * 2;
  let num2 = this.y * 2;
  let num3 = this.z * 2;
  let num4 = this.x * num;
  let num5 = this.y * num2;
  let num6 = this.z * num3;
  let num7 = this.x * num2;
  let num8 = this.x * num3;
  let num9 = this.y * num3;
  let num10 = this.w * num;
  let num11 = this.w * num2;
  let num12 = this.w * num3;
  let result = new Vector3();
  result.x = (1 - (num5 + num6)) * vec.x + (num7 - num12) * vec.y + (num8 + num11) * vec.z;
  result.y = (num7 + num12) * vec.x + (1 - (num4 + num6)) * vec.y + (num9 - num10) * vec.z;
  result.z = (num8 - num11) * vec.x + (num9 + num10) * vec.y + (1 - (num4 + num5)) * vec.z;
  return result;
}


// .getWorldPosition ( target : Vector3 ) : Vector3
// target — the result will be copied into this Vector3.
//
// Returns a vector representing the position of the object in world space.
// # .getWorldQuaternion ( target : Quaternion ) : Quaternion
// target — the result will be copied into this Quaternion.
//
// Returns a quaternion representing the rotation of the object in world space.

export default class Test {

  constructor() {
    //this.slerpV3();

    // setTimeout(()=>{
    //
    //   let x = new THREE.Object3D();
    //   x.position.set(-20, -50, 80);
    //   window._scene.add(x);
    //
    //   console.time('a');
    //   window._scene.updateMatrixWorld();
    //   for (var i = 0; i < 100; i++) {
    //     Utils.getWorldPos(x);
    //   }
    //   console.timeEnd('a')
    //
    // }, 100)


    this.worldRotation();
  }

  quaToRot() {
    let a = Utils.rotToQua(new Vector3(45, 30, 0));
    let b = Utils.quaToRot(a);
    console.log(b);
  }




  clampVectorLength() {
    const a = new Vector3(35, 12, 16);
    const b = a.clone().clampLength(-Infinity, 10);
    console.log( a.length(),  b.length())
  }



  worldRotation() {
    setTimeout(()=>{
      let x = new THREE.Object3D();
      x.position.set(-20, -50, 80);
      window._scene.add(x);

      let a = new THREE.Object3D();
      a.position.set(10, 20, 0);
      a.rotation.set(10/radToDeg, 10/radToDeg, 0);
      x.add(a);

      let b = new THREE.Object3D();
      b.position.set(-30, -90, 10);
      b.rotation.set(22/radToDeg,32/radToDeg,42/radToDeg);
      a.add(b);

      //window._scene.updateMatrixWorld();

      console.time('a');
      //b.parent.updateMatrixWorld();
      console.timeEnd('a');

      //b.setWorldPosition(new Vector3(10, 20, 30))
      b.setWorldQuaternion( new THREE.Quaternion(0.4, 0.2, 0.3, 0.9) )
      console.log(b.position, b.quaternion)

      console.log(b.getWorldPosition())
      console.log(b.getWorldQuaternion())

      //console.log( b.setWorldPosition() )


      //let rotate = new THREE.Euler().setFromRotationMatrix(b.matrixWorld);


      //
      // // console.log( Utils.getWorldPos(b) )
      // // Utils.setWorldPos(b, new Vector3(39, -30, -54)); // 0, 10, 5
      // // console.log(b.position,  Utils.getWorldPos(b) )
      // //
      // //b.rotation.order = 'YXZ'
      //
      // let euler = new THREE.Euler().setFromQuaternion(b.quaternion).reorder('YXZ')
      // let c = new Vector3(euler.x, euler.y, euler.z)//.multiplyScalar(radToDeg);
      //
      //
      // //object.updateMatrixWorld();
      // let rotate = new THREE.Euler().setFromRotationMatrix(b.matrixWorld);
      // //b.rotation.set(rotate)
      //
      // console.log(b.quaternion, rotate)
      //




      //
      // // (0.3, 0.2, 0.3, 0.9)
      // let euler = new THREE.Euler().setFromQuaternion(target)//.reorder('YXZ')
      //
      // const degToRad = (Math.PI / 180.0);
      // let c = new Vector3(euler.x, euler.y, euler.z)/.divideScalar(degToRad);
      //
      // console.log( b.quaternion, b.rotation, c, b.rotation.clone(), new THREE.Quaternion().setFromEuler( new THREE.Euler(b.rotation.x, b.rotation.y, b.rotation.z, 'YXZ'), false ) )
      //



      //object.position.copy(position);



    }, 100);

  }

  worldPosition() {
    setTimeout(()=>{

      let x = new THREE.Object3D();
      x.position.set(-20, -50, 80);
      window._scene.add(x);

      let a = new THREE.Object3D();
      a.position.set(10, 20, 0);
      x.add(a);

      let b = new THREE.Object3D();
      b.position.set(-30, -90, 10);
      a.add(b);

      console.log( Utils.getWorldPos(b) )
      Utils.setWorldPos(b, new Vector3(39, -30, -54)); // 0, 10, 5
      console.log(b.position,  Utils.getWorldPos(b) )

    }, 100);
  }




  worldPositionRotation() {
    setTimeout(()=>{
      let a = new THREE.Object3D();
      //a.position.set(100, 200, 300);
      a.rotation.set(10, 20, 30);
      window._scene.add(a);

      let b = new THREE.Object3D();
      //b.position.set(12, 20, 30);
      //b.rotation.set(30, 60, 20);
      a.add(b);

      window._scene.updateMatrixWorld();


      let v = new Vector3();
      //b.getWorldPosition(v);
      //
      // var v1 = new THREE.Vector3();
      // var worldQuaternion = new THREE.Quaternion();
      // a.getWorldQuaternion( worldQuaternion );
      // v1.copy( a.up ).applyQuaternion( worldQuaternion );


      var target = new THREE.Euler();
      var quaternion = new THREE.Quaternion();
      b.getWorldQuaternion(quaternion)
      target.setFromQuaternion( quaternion, b.rotation.order, false );

      let t = new Vector3();
      a.getWorldDirection(t)
      //worldRot.reorder("ZYX");

      //var bRot = new THREE.Euler().setFromQuaternion(b.getWorldQuaternion())

      console.log(t,  target, b.rotation )
    }, 100)

  }



  // THREEJS test

  convertRotation() {
    let a = new THREE.Object3D();
    a.rotation.set(10, 20, 30);

    // Convert THREEJS rotation to Unity quaternion
    let qua = Quaternion.euler(a.rotation.x, a.rotation.y, a.rotation.z);

    // Get transform.forward
    //qua.clone().multiplyVector3( Vector3.forward )

    // Convert back to euler rotation :)
    console.log( Quaternion.toEulerRad(qua) );
  }




  // Animation test

  // OK
  createAnimationCurve() {
    let a = new AnimationCurve([
      new Keyframe(0, 0, 0, 0),
      new Keyframe(1, 0.2, 0, 0)
    ]);

    console.log(a.evaluate(0.5));
  }




  // Math tests

  // Test OK
  // Output both: => 90
  deltaAngle() {
    console.log( Math.deltaAngle(1080,90) );
  }

  // OK
  // Output unity: 89.96136
  // Output web: 89.96136638173678
  smoothDamp() {
    console.log( Math.smoothDamp( 10, 90, 0, 0.3, Infinity, 14) );
  }

  // OK
  // Output unity: 10.15
  // Output web: 10.15
  moveTowards() {
    console.log( Math.moveTowards(10, 18, 0.15) );
  }





  // Vector3 tests

  // OK
  orthoNormalize() {
    const a = new Vector3(35, 12, 16);
    const b = new Vector3(22, 32, 42);

    a.orthoNormalize(b)

    console.log( a, b );
  }


  // Test: OK
  // Output unity: => (29.5, 20.4, 26.9)
  // Output web: => {x: 29.54, y: 20.4, z: 26.92}
  // The parameter t is clamped to the range [0, 1].
  // When t = 0 returns a. When t = 1 returns b.
  // When t = 0.5 returns the point midway between a and b.
  lerpV3() {
    const a = new Vector3(35, 12, 16);
    const b = new Vector3(22, 32, 42);

    console.log( a.lerp(b, 0.42) );
  }

  // Test: OK
  // Output unity: (33.2, 20.4, 27.0)
  // Output web:  {x: 33.19615173398555, y: 20.42314226418747, z: 26.98439516966527}
  // The parameter t is clamped to the range [0, 1].
  slerpV3() {
    const a = new Vector3(35, 12, 16);
    const b = new Vector3(22, 32, 42);

    console.log( a.slerp(b, 0.42) );
  }


  // Test: OK
  // Output unity: (12.3, 17.9, 23.4)
  // Output web: {x: 12.277506112469437, y: 17.858190709046454, z: 23.43887530562347}
  projectOnVector() {
    const a = new Vector3(35, 12, 16);
    const b = new Vector3(22, 32, 42);

    console.log( a.projectOnVector(b) );
  }








  // Quaternion tests



  // Test OK
  // Outpur unity: (29.8, 10.9, 29.9)
  // Ouput web: {x: 29.830000000000002, y: 10.939999999999998, z: 29.94}
  multiplyQuaWithVector3() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Vector3(22, 32, 42);
    console.log( a.multiplyVector3(b) );
  }


  // Test OK
  // Ouput unity: =>
  // angle: 138.8288
  // axis: (0.8, 0.4, 0.4)
  // Output web: =>
  // angle: 138.82880534572357
  // axis: {x: 0.8164965809277259, y: 0.40824829046386296, z: 0.40824829046386296}
  toAngleAxis() {
    const a = new Quaternion(.2, .10, .1, .092);
    console.log(a.toAngleAxis())
  }

  // Test OK
  // Ouput unity: (-0.1, 0.5, 0.1, 0.8)
  // Output web: =>  {x: -0.12667275591175206, y: 0.5343205382230671, z: 0.0813737199537705, w: 0.8317655276841057}
  setLookRotation() {
    const a = new Vector3(35, 12, 16);
    console.log( new Quaternion().setLookRotation(a) );
  }


  // Test OK
  // Ouput unity: (0.0, -0.3, 0.2, 0.9)
  // Output web: => {x: -0.0018326748290413432, y: -0.2561163073585285, z: 0.19609620670742434, w: 0.9465449572645569}
  setFromToRotation() {
    const a = new Vector3(35, 12, 16);
    const b = new Vector3(22, 32, 42);

    console.log( new Quaternion().setFromToRotation(a, b) );
  }


  // Test OK
  // Output web: => 0.5678908345800273
  length() {
    const a = new Quaternion(.5, .10, .15, .20);
    console.log(a.length());
  }

  // Test OK
  // Output unity: => 0.309
  // Output web: => 0.30900000000000005
  dot() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log(a.dot(b));
  }

  // Test OK (small inaccuracy on the web.. )
  // Output unity: => (0.4, 0.2, 0.1, 0.9)
  // {x: 0.42503652679580517, y: 0.15109311037061723, z: 0.13969134227676283, w: 0.8814766881664016}
  euler() {
    console.log( Quaternion.euler(45, 33, 32) );
  }


  // Test OK
  // Output unity: => (-0.3, 0.2, 0.0, 0.9)
  // Ouput web: => {x: -0.2746567483172059, y: 0.15385645171776968, z: 0.04457065446637163, w: 0.9481061752931873}
  lookRotation() {
    let a = new Vector3(5, 10, 15);
    console.log( Quaternion.lookRotation(a) );
  }

  // Test OK
  // Output unity: => (0.5, 0.0, -0.2, 0.9)
  // Output web: =>  {x: 0.4529010706053633, y: 0, z: -0.1607068315051289, w: 0.8769572022351478}
  fromToRotation() {
    let a = new Vector3(11, 21, 31);
    console.log( Quaternion.fromToRotation(Vector3.up, a) );
  }

  // Test OK
  // Ouput unity: => (0.5, 0.1, 0.2, 0.2)
  // Output web: => {x: 0.500525479928413, y: 0.10238431285989641, z: 0.1530809873606677, w: 0.203777661861439}
  rotateTowards() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log( Quaternion.rotateTowards(a, b, 0.9) );
  }

  // Test OK
  // Ouput unity: => (0.3, 0.3, 0.4, 0.5)
  // Output web: =>  {x: 0.27519862078728924, y: 0.3176242311246034, z: 0.41935275821578644, w: 0.5210812853069696}
  slerp() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log( a.slerp(b, 0.9) );
  }

  // Test OK
  // Ouput unity: => (0.3, 0.4, 0.5, 0.7)
  // Output web: => {x: 0.34838007294638385, y: 0.4020875994660481, z: 0.5308680111823826, w: 0.6596484228987174}
  lerp() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log( a.lerp(b, 0.9) );
  }

  // Test OK
  // Output unity: => (0.2, 0.0, 0.1, 1.0)
  // Output web: => {x: 0.24347647686305673, y: 0.04869529537261135, z: 0.07304294305891701, w: 0.9659258262890683}
  angleAxis() {
    const a = new Vector3(.5, .10, .15);
    console.log( Quaternion.angleAxis(30, a) );
  }

  // Test OK
  // Output unity: => 144.0021
  // Output web: => 144.0020476241247
  angle() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log(Quaternion.angle(a, b));
  }

  // Test OK
  // Output web: => {x: 0.8804509063256238, y: 0.17609018126512477, z: 0.26413527189768715, w: 0.35218036253024954}
  normalize() {
    const a = new Quaternion(.5, .10, .15, .20);
    console.log(a.normalize());
  }

  // Test OK
  inverse() {
    const a = new Quaternion(.5, .410, .15, .20);
    console.log(a.inverse());
  }

  // Test OK
  // Output web: => {x: 0.28, y: -0.22, z: -0.27, w: -0.32}
  sub() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log(a.sub(b));
  }

  // Test OK
  // Output unity: => (0.3, -0.1, 0.3, -0.1)
  // Output web: => {x: 0.298, y: -0.060999999999999985, z: 0.30000000000000004, w: -0.101}
  multiply() {
    const a = new Quaternion(.5, .10, .15, .20);
    const b = new Quaternion(.22, .32, .42, .52);

    console.log(a.multiply(b));
  }

}
