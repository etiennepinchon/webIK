import "./fbxLoader";
import './helpers';
import VRIK from './VRIK';

if (!AFRAME) {
  throw "AFRAME has not been loaded!";
}

var ww = window.innerWidth;
var wh = window.innerHeight;

AFRAME.registerComponent('fbx-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    const data = this.data;
    if (!data.src) return;

    this.remove();
    const loader = new THREE.FBXLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, this.load.bind(this));
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'fbx', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});



import Test from './test';
//import QuaToolsTest from './tests/QuaToolsTest';
//import V3ToolsTest from './tests/V3ToolsTest';
//import AxisToolsTest from './tests/AxisToolsTest';
//import PointTest from './tests/PointTest';
//import InterpTest from './tests/InterpTest';
import BoneTest from './tests/BoneTest';


//new Test();

setTimeout(()=>{
  BoneTest.run();
}, 100)





window.Time = {};
Time.deltaTime = 0;


AFRAME.registerComponent('avatar', {
  schema: {},
  init() {
    this.el.sceneEl.addEventListener('loaded', ()=>{

      this.cameraEl = document.querySelector('[camera]');
      this.controllersEl = document.querySelectorAll('[vive-controls]');

      // For VR testing
      // this.headTarget = this.cameraEl.object3D;
      // this.leftHandTarget = this.controllersEl[0].object3D;
      // this.rightHandTarget = this.controllersEl[1].object3D;

      // To test without vr
      this.headTarget = document.querySelector('#cameraControl').object3D;
      this.leftHandTarget = document.querySelector('#leftControl').object3D;
      this.rightHandTarget = document.querySelector('#rightControl').object3D;

      console.log(this.headTarget, this.leftHandTarget, this.rightHandTarget)

      this.sceneEl = this.el.sceneEl;
      this.scene = window._scene = this.el.sceneEl.object3D;
      setTimeout(()=>this.setUp(), 0);

      // Debug tick count
      // Will stop the tick after X iteraction
      // (Useful to debug some wrong values)
      this.count = 0;
      this.maxCount = 10;
    });
  },

  update() {

  },

  tick(t, dt) {
    Time.deltaTime = dt;



    // this.count++;
    // if (this.count > this.maxCount) return;
    if (this.ik) this.ik.tick();
  },

  tock(t, dt) {
    //window._scene.updateMatrixWorld();

    //if (this.count > this.maxCount) return;
    if (this.ik) this.ik.tock();
  },

  setUp() {

    const loader = new THREE.FBXLoader();
    loader.load('/static/Idle.fbx', (model)=>{
      this.model = model;
      model.scale.set(0.01, 0.01, 0.01);
      model.position.z = -1;
      //model.position.z = -100;
      this.el.setObject3D('mesh', model);
      this.el.emit('model-loaded', {format: 'fbx', model: model});


      console.log(model.children[0])
      printBodyPartsNames(model)


      console.log(references, leftHand, rightHand)

      // Create targer
      // this.headTarget = head.clone();
      // this.leftHandTarget = leftHand.clone();
      // this.rightHandTarget = rightHand.clone();
      //
      // // Add to camera / controllers
      // this.cameraEl.object3D.add(this.headTarget);
      // this.controllersEl[0].object3D.add(this.leftHandTarget);
      // this.controllersEl[1].object3D.add(this.rightHandTarget);
      //
      // // Reset positions
      // this.headTarget.position.set(0, 0, 0);
      // this.leftHandTarget.position.set(0, 0, 0);
      // this.rightHandTarget.position.set(0, 0, 0);

      this.ik = new VRIK({
        transform: this.el.object3D,
        references: references,
        headTarget: this.headTarget,
        leftHandTarget: this.leftHandTarget,
        rightHandTarget: this.rightHandTarget
      });


    });

    const references = {
      root: this.el.object3D
    };

    let head, leftHand, rightHand;
    const printBodyPartsNames = (part)=>{

      if (part.name === "mixamorigHips") references.pelvis = part;
      else if (part.name === "mixamorigSpine") references.spine = part;
      else if (part.name === "mixamorigSpine1") references.chest = part;
      else if (part.name === "mixamorigNeck") references.neck = part;
      else if (part.name === "mixamorigHead") references.head = part;
      else if (part.name === "mixamorigLeftShoulder") references.leftShoulder = part;
      else if (part.name === "mixamorigLeftArm") references.leftUpperArm = part;
      else if (part.name === "mixamorigLeftForeArm") references.leftForearm = part;
      else if (part.name === "mixamorigLeftHand") references.leftHand = part;
      else if (part.name === "mixamorigRightShoulder") references.rightShoulder = part;
      else if (part.name === "mixamorigRightArm") references.rightUpperArm = part;
      else if (part.name === "mixamorigRightForeArm") references.rightForearm = part;
      else if (part.name === "mixamorigRightHand") references.rightHand = part;
      else if (part.name === "mixamorigLeftUpLeg") references.leftThigh = part;
      else if (part.name === "mixamorigLeftLeg") references.leftCalf = part;
      else if (part.name === "mixamorigLeftFoot") references.leftFoot = part;
      else if (part.name === "mixamorigLeftToeBase") references.leftToes = part;
      else if (part.name === "mixamorigRightUpLeg") references.rightThigh = part;
      else if (part.name === "mixamorigRightLeg") references.rightCalf = part;
      else if (part.name === "mixamorigRightFoot") references.rightFoot = part;
      else if (part.name === "mixamorigRightToeBase") references.rightToes = part;

      // mixamorigLeftHand
      // mixamorigLeftHandThumb1
      // mixamorigLeftHandIndex1
      // mixamorigLeftHandMiddle1
      // mixamorigLeftHandRing1
      // mixamorigLeftHandPinky1
      if (part.name === "mixamorigHead") head = part;
      if (part.name === "mixamorigLeftHand") leftHand = part;
      else if (part.name === "mixamorigRightHand") rightHand = part;
      if ((part.name === "mixamorigLeftHandThumb1"||
          part.name === "mixamorigLeftHandIndex1" ||
          part.name === "mixamorigLeftHandMiddle1" ||
          part.name === "mixamorigLeftHandRing1" ||
          part.name === "mixamorigLeftHandPinky1")
          && leftHand.children.indexOf(part) < 0) leftHand.children.push(part);
      if ((part.name === "mixamorigRightHandThumb1"||
          part.name === "mixamorigRightHandIndex1" ||
          part.name === "mixamorigRightHandMiddle1" ||
          part.name === "mixamorigRightHandRing1" ||
          part.name === "mixamorigRightHandPinky1")
          && rightHand.children.indexOf(part) < 0) rightHand.children.push(part);

      for (let child of part.children) {
        if (child.name !== part.name) printBodyPartsNames(child)
      }

    }




  },


});
