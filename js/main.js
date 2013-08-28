$(document).ready(function() {

  function initRepository(size) {
    var material = new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('img/index.png')
    });
    var repository = new THREE.Mesh(
      new THREE.SphereGeometry(parseInt(size), 20, 20),
      material
    );
    repository.position = {
      x : 0,
      y : 0,
      z : 1000
    }
    return repository;
  }

  function initContributors(data, scene) {
    var contributors = [];
    for(var i = 0; i < data.planets.length; i++){
      var planet = data.planets[i],
          color = Math.random() * 0xffffff,
          radius = planet['size'] * 0.3,
          rail_radius = planet.distance * 900 + 1000,
          speed = planet.speed,
          contributor = new Contributor(planet.name, scene, radius, rail_radius,
                  speed, color, planet.email);
      contributors.push(contributor);
    }
    return contributors;
  }

  function initLight() {
    var light = new THREE.DirectionalLight(0xffffff, 2.25);
    light.position.set(200, 450, 500);

    light.castShadow = true;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    light.shadowMapDarkness = 0.95;

    light.shadowCascade = true;
    light.shadowCascadeCount = 3;
    light.shadowCascadeNearZ = [-1.000, 0.995, 0.998];
    light.shadowCascadeFarZ  = [0.995, 0.998, 1.000];
    light.shadowCascadeWidth = [1024, 1024, 1024];
    light.shadowCascadeHeight = [1024, 1024, 1024];

    return light;
  }

  var scene = new THREE.Scene();
  var clock = new THREE.Clock();

  var data = CODE.code["2013-07-24"]
  var starSize = data.star[0]['size'];
  var repository = initRepository(starSize);
  var contributors = initContributors(data, scene);
  var light = initLight();
  var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000, 50, 50),
    new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true})
  );

  scene.add(repository);
  scene.add(plane);
  scene.add(light);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
  camera.position.z = 8000;

  // Controls
  cameraControls = new THREE.TrackballControls(camera, renderer.domElement);

  function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);

    for(var i = 0; i < contributors.length; i++){
      contributors[i].update();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function onMouseMove(event){
    var projector = new THREE.Projector();
    var vector = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    projector.unprojectVector(vector, camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub( camera.position ).normalize());
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      var mesh = intersects[0].object;
      if(!mesh.is_contributor)
        return;
      mesh.model.highlight();
    }
  }

  function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  $(window).bind("resize", onWindowResize);
  $(window).bind("mousemove", onMouseMove);

  animate();
});
