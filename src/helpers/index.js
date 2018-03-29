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

THREE.Object3D.prototype.getUnityWorldQuaternion = function() {
  let qua = this.getWorldQuaternion();
  return new Quaternion(qua.x, qua.y, qua.z, qua.w);
}


THREE.Object3D.prototype.setWorldPosition = function(worldPos) {
  this.worldToLocal(worldPos);
  this.position.copy(worldPos);
}

THREE.Object3D.prototype.setWorldQuaternion = function(worldQua) {

	var q = new THREE.Quaternion( -worldQua, worldQua, worldQua, -worldQua );

	//this.updateMatrixWorld();

	let rotMat = new THREE.Matrix4();
  let worldMat = this.matrixWorld.clone();

  rotMat.makeRotationFromQuaternion(worldQua);
  worldMat.premultiply( rotMat );

	//this.setRotationFromMatrix(worldMat);
	// let qua = new THREE.Quaternion().setFromRotationMatrix(worldMat);
	// this.quaternion.copy(qua);

  let euler = new THREE.Euler().setFromRotationMatrix(worldMat);

	euler.y += Math.PI; // Y is 180 degrees off
	euler.z *= -1; // flip Z

  this.rotation.copy(euler);
  return euler;
}

THREE.Object3D.prototype.setUnityWorldQuaternion = function(qua) {
  return this.setWorldQuaternion(
    new THREE.Quaternion(qua.x, qua.y, qua.z, qua.w)
  );
}


THREE.Object3D.prototype.setUnityQuaternion = function(qua) {
	let q = new THREE.Quaternion(-qua.x, qua.y, qua.z, -qua.w);
  this.quaternion.copy( q );

	this.rotation.y += Math.PI; // Y is 180 degrees off
	this.rotation.z *= -1; // flip Z


}

THREE.Object3D.prototype.getUnityQuaternion = function() {
  let qua = this.quaternion;
  return new Quaternion(qua.x, qua.y, qua.z, qua.w);
}
