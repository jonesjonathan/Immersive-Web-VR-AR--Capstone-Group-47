import * as THREE from 'three';
import XrScene from './xr-scene';
import TriggerMesh from '../trigger';

const settings = {
  global: {
    lights: {
      ambient: true
    }
  },
  room: {
    textures: {
      enabled: false
    },
    lights: {
      point: true
    }
  }
};

export default class HomeScene extends XrScene {
  /**
   *
   * @param {THREE.Renderer} renderer
   * @param {THREE.Camera} camera
   */
  constructor(renderer, camera) {
    super(renderer, camera);
    // Basic lighting
    if (settings.global.lights.ambient) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);
    }

    if (settings.room.lights.point) {
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      pointLight.position.set(0, 0, 0);
      this.scene.add(pointLight);
    }

    // Generate room geometry
    this.length = 24;
    this.width = 24;
    this.height = 16;
    const roomGeometry = new THREE.BoxGeometry(this.length, this.height, this.width);

    let roomMaterials;
    // Set material to default if textures are not enabled
    roomMaterials = new THREE.MeshPhongMaterial({
      color: 0x003050,
      side: THREE.BackSide
    });

    // Generate room mesh using geometry and materials
    const room = new THREE.Mesh(roomGeometry, roomMaterials);

    if (room) {
      room.receiveShadow = true;
      room.castShadow = true;
      this.scene.add(room);
    } else {
      console.error('Error creating room mesh.');
    }

    this.createDoors();
    this._boxTest();
    this._addEventListener(window, 'mousedown', this.onClick);
  }

  onAssetsLoaded(cache) {
    super.onAssetsLoaded(cache);
    return cache;
  }

  animate() {
    const box = this.triggers.getObjectByName('testBox001');
    box.rotateX(0.01);
    box.rotateY(0.01);
    box.rotateZ(0.03);
  }

  createDoors() {
    const doorHeight = 12;
    const doorWidth = 7;
    const doorLength = 1;
    const geometry = new THREE.BoxGeometry(doorLength, doorHeight, doorWidth);
    const fallingMaterial = new THREE.MeshPhongMaterial({
      color: 0x402f00
    });
    const fallingDoor = new TriggerMesh(geometry, fallingMaterial);
    fallingDoor.name = 'fallingDoor';
    fallingDoor.position.set(
      (doorLength / 2) - (this.length / 2),
      (doorHeight / 2) - (this.height / 2),
      0
    );

    fallingDoor.addFunction('changeRoom', this.changeRoom);

    fallingDoor.hover = function () {
      if (!this.isSelected) {
        this.material.color.set(0xFF0000);
      }
    };

    fallingDoor.select = function () {
      this.functions.changeRoom('/kinematics');
    };

    fallingDoor.exit = function () {
      this.material.color.set(0x402f00);
    };

    this.triggers.add(fallingDoor);

    const planetsMaterial = new THREE.MeshPhongMaterial({
      color: '#402f00'
    });
    const planetsDoor = new TriggerMesh(geometry, planetsMaterial);
    planetsDoor.name = 'planetsDoor';
    planetsDoor.position.set(
      (this.length / 2) - (doorLength / 2),
      (doorHeight / 2) - (this.height / 2),
      0
    );

    planetsDoor.addFunction('changeRoom', this.changeRoom);

    planetsDoor.hover = function () {
      if (!this.isSelected) {
        this.material.color.set(0xFF0000);
      }
    };

    planetsDoor.select = function () {
      this.functions.changeRoom('/planets');
    };

    planetsDoor.exit = function () {
      this.material.color.set(0x402f00);
    };

    this.triggers.add(planetsDoor);

    const pendulumMaterial = new THREE.MeshPhongMaterial({
      color: 0x402f00
    });
    const pendulumDoor = new TriggerMesh(geometry, pendulumMaterial);
    pendulumDoor.rotateY(Math.PI / 2);
    pendulumDoor.name = 'pendulumDoor';
    pendulumDoor.position.set(
      0,
      (doorHeight / 2) - (this.height / 2),
      (doorLength / 2) - (this.length / 2)
    );

    pendulumDoor.addFunction('changeRoom', this.changeRoom);

    pendulumDoor.hover = function () {
      if (!this.isSelected) {
        this.material.color.set(0xFF0000);
      }
    };

    pendulumDoor.select = function () {
      this.functions.changeRoom('/pendulums');
    };

    pendulumDoor.exit = function () {
      this.material.color.set(0x402f00);
    };

    this.triggers.add(pendulumDoor);

    const laserMaterial = new THREE.MeshPhongMaterial({
      color: 0x402f00
    });
    const laserDoor = new TriggerMesh(geometry, laserMaterial);
    laserDoor.rotateY(Math.PI / 2);
    laserDoor.name = 'laserDoor';
    laserDoor.position.set(
      0,
      (doorHeight / 2) - (this.height / 2),
      (this.length / 2) - (doorLength / 2)
    );
    this.triggers.add(laserDoor);
  }

  _boxTest() {
    console.log('In box test');
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true
    });

    if (!geometry) console.log('Failed to generate geometry');
    if (!material) console.log('Failed to generate material');

    const box = new TriggerMesh(geometry, material);
    if (!box) console.log('Failed to create box mesh');

    const externalFunc = (args) => {
      console.log(args);
      console.log(this);
    };

    box.addFunction('externalFunc', externalFunc);

    box.hover = function (intersection) {
      if (this.debug) console.log(intersection);
      if (!this.isSelected) {
        this.material.color.set(0xFF0000);
      }
    };

    box.select = function (intersection) {
      if (this.debug) console.log(intersection);
      this.material.color.set(0x00FF00);

      // Functions call example
      this.functions.externalFunc(intersection);
    };

    box.release = function (intersection) {
      if (this.debug) console.log(intersection);
      this.material.color.set(0x0000FF);
    };

    box.exit = function (intersection) {
      if (this.debug) console.log(intersection);
      this.material.color.set(0xFFFFFF);
    };


    box.name = 'testBox001';
    box.position.set(-1, 0, -5);

    this.triggers.add(box);

    const box2 = box.clone();
    box2.position.set(1, 0, -5);

    this.triggers.add(box2);

    if (!this.scene.getObjectByName('testBox001')) {
      console.log('Box not found in scene');
    }
  }
}
