window.Vector2 = THREE.Vector2;
window.Vector3 = THREE.Vector3;
//window.Quaternion = THREE.Quaternion;

import './Math';
import './Vector3';
import Quaternion from './Quaternion';
window.Quaternion = Quaternion;


THREE.Object3D.prototype.getWorldPosition = function(target = new Vector3()) {
	this.updateMatrixWorld( true );
	return target.setFromMatrixPosition( this.matrixWorld );
}

THREE.Object3D.prototype.getWorldQuaternion = function(target = new THREE.Quaternion()) {

	const position = new Vector3();
	const scale = new Vector3();

	this.updateMatrixWorld( true );
	this.matrixWorld.decompose( position, target, scale );
	return target;
}




THREE.Object3D.prototype.setWorldPosition = function(worldPos) {
  this.worldToLocal(worldPos);
  this.position.copy(worldPos);
}

THREE.Object3D.prototype.setWorldQuaternion = function(worldQua) {
  let rotMat = new THREE.Matrix4();
  let worldMat = this.matrixWorld.clone();

  rotMat.makeRotationFromQuaternion(worldQua);
  worldMat.premultiply( rotMat );

  let euler = new THREE.Euler().setFromRotationMatrix(worldMat);
  this.rotation.copy(euler);
  return euler;
}
