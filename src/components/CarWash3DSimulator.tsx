import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Droplets, 
  RotateCw, 
  ShieldCheck, 
  Zap, 
  Palette, 
  Car, 
  RefreshCw, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface CarWash3DSimulatorProps {
  onOpenBooking?: () => void;
}

type WashState = 'dirty' | 'foaming' | 'foamed' | 'rinsing' | 'clean' | 'ceramic';

const CAR_COLORS = [
  { id: 'crimson', name: 'Crimson Red', hex: '#dc2626', metallic: 0.7, roughness: 0.2 },
  { id: 'obsidian', name: 'Obsidian Black', hex: '#0f172a', metallic: 0.8, roughness: 0.15 },
  { id: 'silver', name: 'Metallic Silver', hex: '#cbd5e1', metallic: 0.9, roughness: 0.1 },
  { id: 'blue', name: 'Quattro Blue', hex: '#2563eb', metallic: 0.75, roughness: 0.2 },
  { id: 'orange', name: 'Sunset Amber', hex: '#f97316', metallic: 0.7, roughness: 0.2 },
  { id: 'white', name: 'Pearl White', hex: '#f8fafc', metallic: 0.5, roughness: 0.25 }
];

export const CarWash3DSimulator: React.FC<CarWash3DSimulatorProps> = ({ onOpenBooking }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Interactive UI State
  const [washState, setWashState] = useState<WashState>('dirty');
  const [cleanliness, setCleanliness] = useState<number>(20);
  const [selectedColor, setSelectedColor] = useState(CAR_COLORS[0]);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepText, setCurrentStepText] = useState<string>('Vehicle arrived with heavy road dust & grime');

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const bodyMeshRef = useRef<THREE.Mesh | null>(null);
  const foamMeshRef = useRef<THREE.Mesh | null>(null);
  const dirtyMeshRef = useRef<THREE.Mesh | null>(null);
  const sparklesGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Interaction Orbit tracking
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRadiusRef = useRef<number>(7.5);
  const cameraThetaRef = useRef<number>(0.8); // horizontal angle
  const cameraPhiRef = useRef<number>(1.1);   // vertical angle

  // Update Camera Orbit from spherical coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const r = cameraRadiusRef.current;
    const theta = cameraThetaRef.current;
    const phi = cameraPhiRef.current;

    cameraRef.current.position.x = r * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = r * Math.cos(phi) + 0.5;
    cameraRef.current.position.z = r * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0.4, 0);
  }, []);

  // Initialize Three.js 3D Studio Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.08);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.6);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 45);
    mainSpot.position.set(0, 8, 4);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    // Studio neon side tubes
    const leftNeon = new THREE.PointLight(0xef4444, 25, 12);
    leftNeon.position.set(-4, 2, 2);
    scene.add(leftNeon);

    const rightNeon = new THREE.PointLight(0x3b82f6, 25, 12);
    rightNeon.position.set(4, 2, -2);
    scene.add(rightNeon);

    const topLed = new THREE.PointLight(0xffedd5, 15, 10);
    topLed.position.set(0, 4, 0);
    scene.add(topLed);

    // 5. Studio Bay Floor & Grid
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      roughness: 0.35,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Circular Studio Light Ring on Ground
    const ringGeo = new THREE.RingGeometry(3.5, 3.65, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.49;
    scene.add(ring);

    // Secondary Outer Ring
    const ringOuterGeo = new THREE.RingGeometry(4.8, 4.85, 64);
    const ringOuterMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, opacity: 0.4, transparent: true });
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    ringOuter.rotation.x = -Math.PI / 2;
    ringOuter.position.y = -0.49;
    scene.add(ringOuter);

    // 6. BUILD HIGH-TECH 3D CAR MODEL
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Body Paint Material
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedColor.hex),
      metalness: selectedColor.metallic,
      roughness: selectedColor.roughness,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    // Lower Chassis
    const lowerBodyGeo = new THREE.BoxGeometry(3.8, 0.7, 1.8);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
    lowerBody.position.y = 0.1;
    lowerBody.castShadow = true;
    bodyMeshRef.current = lowerBody;
    carGroup.add(lowerBody);

    // Cabin / Roof (curved streamline wedge)
    const cabinGeo = new THREE.BoxGeometry(2.1, 0.65, 1.45);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(-0.15, 0.65, 0);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Hood Slope Accent
    const hoodGeo = new THREE.BoxGeometry(1.2, 0.25, 1.7);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(1.4, 0.35, 0);
    hood.rotation.z = -0.15;
    carGroup.add(hood);

    // Windshield & Windows (Tinted Glass)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1
    });

    // Front Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.4, 0.7);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0.9, 0.65, 0);
    windshield.rotation.y = Math.PI / 2;
    windshield.rotation.x = -0.6;
    carGroup.add(windshield);

    // Rear Windshield
    const rearGlassGeo = new THREE.PlaneGeometry(1.4, 0.65);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(-1.2, 0.65, 0);
    rearGlass.rotation.y = -Math.PI / 2;
    rearGlass.rotation.x = -0.55;
    carGroup.add(rearGlass);

    // Side Windows
    const sideGlassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const sideGlassLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), sideGlassMat);
    sideGlassLeft.position.set(-0.15, 0.65, 0.73);
    carGroup.add(sideGlassLeft);

    const sideGlassRight = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), sideGlassMat);
    sideGlassRight.position.set(-0.15, 0.65, -0.73);
    sideGlassRight.rotation.y = Math.PI;
    carGroup.add(sideGlassRight);

    // Headlights (Glowing Xenon LEDs)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const headlightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.35), headlightMat);
    headlightLeft.position.set(1.9, 0.25, 0.6);
    carGroup.add(headlightLeft);

    const headlightRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.35), headlightMat);
    headlightRight.position.set(1.9, 0.25, -0.6);
    carGroup.add(headlightRight);

    // Taillights (Red LED Bar)
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.6), taillightMat);
    taillight.position.set(-1.9, 0.3, 0);
    carGroup.add(taillight);

    // Front Grille with Metallic Mesh
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.9 });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.9), grilleMat);
    grille.position.set(1.91, 0.05, 0);
    carGroup.add(grille);

    // 4 Sport Wheels with Rims & Brake Calipers
    const wheelPositions = [
      { x: 1.15, z: 0.92 },
      { x: 1.15, z: -0.92 },
      { x: -1.15, z: 0.92 },
      { x: -1.15, z: -0.92 }
    ];

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, -0.15, pos.z);

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.32, 16);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      wheelGroup.add(rim);

      // Red Brake Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.08), caliperMat);
      caliper.position.set(0, 0.12, pos.z > 0 ? 0.1 : -0.1);
      wheelGroup.add(caliper);

      carGroup.add(wheelGroup);
    });

    // 7. DIRTY DUST LAYER (Initial state)
    const dirtyMat = new THREE.MeshStandardMaterial({
      color: 0x78533b,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.75
    });
    const dirtyMesh = new THREE.Mesh(new THREE.BoxGeometry(3.84, 0.74, 1.84), dirtyMat);
    dirtyMesh.position.y = 0.1;
    dirtyMeshRef.current = dirtyMesh;
    carGroup.add(dirtyMesh);

    // 8. SNOW FOAM LAYER (Procedural thick bubble layer)
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.0, // starts invisible
      bumpScale: 0.05
    });
    const foamMesh = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.3, 1.9), foamMat);
    foamMesh.position.y = 0.35;
    foamMeshRef.current = foamMesh;
    carGroup.add(foamMesh);

    // 9. CERAMIC SPARKLES GROUP
    const sparklesGroup = new THREE.Group();
    sparklesGroupRef.current = sparklesGroup;
    scene.add(sparklesGroup);

    // 10. Water / Foam Particles Emitter
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystemRef.current = particleSystem;
    scene.add(particleSystem);

    // 11. Animation Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Auto Orbit when not dragging
      if (isAutoRotate && !isDraggingRef.current) {
        cameraThetaRef.current += 0.35 * delta;
        updateCameraPosition();
      }

      // Sparkle rotation if ceramic active
      if (sparklesGroupRef.current) {
        sparklesGroupRef.current.rotation.y += 0.8 * delta;
      }

      // Particle spray animation
      if (particleSystemRef.current && (particleSystemRef.current.material as THREE.PointsMaterial).opacity > 0) {
        const posAttr = particleSystemRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] -= 4.5 * delta;
          if (arr[i] < -0.4) {
            arr[i] = 3.5 + Math.random();
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [updateCameraPosition, selectedColor.hex, selectedColor.metallic, selectedColor.roughness]);

  // Color Changer
  const handleColorChange = (color: typeof CAR_COLORS[0]) => {
    setSelectedColor(color);
    if (!bodyMeshRef.current) return;
    (bodyMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(color.hex);
    (bodyMeshRef.current.material as THREE.MeshPhysicalMaterial).metalness = color.metallic;
    (bodyMeshRef.current.material as THREE.MeshPhysicalMaterial).roughness = color.roughness;
  };

  // 1. ACTION: Apply Snow Foam
  const handleApplyFoam = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setWashState('foaming');
    setCurrentStepText('pH-Neutral Snow Foam Bath Active: Softening mud & road traffic film...');

    // Activate White Foam Particles
    if (particleSystemRef.current) {
      (particleSystemRef.current.material as THREE.PointsMaterial).color.set(0xffffff);
      (particleSystemRef.current.material as THREE.PointsMaterial).opacity = 0.9;
      (particleSystemRef.current.material as THREE.PointsMaterial).size = 0.12;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      if (foamMeshRef.current) {
        (foamMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.min(progress, 0.95);
      }
      if (progress >= 1.0) {
        clearInterval(interval);
        setWashState('foamed');
        setIsSimulating(false);
        setCurrentStepText('Thick Snow Foam Dwelling: Grime lifted without scratching paint coat.');
        if (particleSystemRef.current) {
          (particleSystemRef.current.material as THREE.PointsMaterial).opacity = 0;
        }
      }
    }, 50);
  };

  // 2. ACTION: High-Pressure Water Jet Rinse
  const handleRinse = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setWashState('rinsing');
    setCurrentStepText('180-Bar Spot-Free Soft Water Jet: Blasting off foam, grime & wheel dust...');

    // Activate Water Stream Particles (Blue/Aqua)
    if (particleSystemRef.current) {
      (particleSystemRef.current.material as THREE.PointsMaterial).color.set(0x38bdf8);
      (particleSystemRef.current.material as THREE.PointsMaterial).opacity = 0.95;
      (particleSystemRef.current.material as THREE.PointsMaterial).size = 0.08;
    }

    let progress = 1.0;
    const interval = setInterval(() => {
      progress -= 0.05;
      if (foamMeshRef.current) {
        (foamMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(progress, 0.0);
      }
      if (dirtyMeshRef.current) {
        (dirtyMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(progress * 0.75, 0.0);
      }
      setCleanliness(Math.round(20 + (1.0 - progress) * 75));

      if (progress <= 0.0) {
        clearInterval(interval);
        setWashState('clean');
        setCleanliness(95);
        setIsSimulating(false);
        setCurrentStepText('Deep Clean Complete: Spot-free de-ionized rinse with zero watermarks.');
        if (particleSystemRef.current) {
          (particleSystemRef.current.material as THREE.PointsMaterial).opacity = 0;
        }
      }
    }, 50);
  };

  // 3. ACTION: Ceramic Gloss Shield
  const handleCeramicCoat = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setWashState('ceramic');
    setCurrentStepText('Graphene Ceramic Sealant Applied: 9H Hydrophobic Water-Beading Mirror Gloss!');

    if (bodyMeshRef.current) {
      const mat = bodyMeshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.clearcoat = 1.0;
      mat.clearcoatRoughness = 0.02;
      mat.roughness = 0.06;
      mat.reflectivity = 1.0;
    }

    setCleanliness(100);

    // Add Sparkles
    if (sparklesGroupRef.current && sceneRef.current) {
      sparklesGroupRef.current.clear();
      for (let i = 0; i < 24; i++) {
        const starGeo = new THREE.OctahedronGeometry(0.08, 0);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
          (Math.random() - 0.5) * 4.2,
          Math.random() * 1.6 + 0.2,
          (Math.random() - 0.5) * 2.5
        );
        sparklesGroupRef.current.add(star);
      }
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  // 4. Reset Simulator
  const handleReset = () => {
    setWashState('dirty');
    setCleanliness(20);
    setCurrentStepText('Simulator reset: Vehicle ready for next detailing cycle.');
    if (dirtyMeshRef.current) {
      (dirtyMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.75;
    }
    if (foamMeshRef.current) {
      (foamMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.0;
    }
    if (bodyMeshRef.current) {
      const mat = bodyMeshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.clearcoat = 0.8;
      mat.clearcoatRoughness = 0.1;
      mat.roughness = selectedColor.roughness;
    }
    if (sparklesGroupRef.current) {
      sparklesGroupRef.current.clear();
    }
  };

  // Drag Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraThetaRef.current -= deltaX * 0.008;
    cameraPhiRef.current = Math.max(0.4, Math.min(Math.PI / 2 - 0.1, cameraPhiRef.current - deltaY * 0.008));
    updateCameraPosition();

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <section id="simulator-3d" className="py-16 sm:py-24 bg-[#030712] text-white relative border-b border-slate-800 text-left overflow-hidden w-full font-sans select-none">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>INTERACTIVE 3D CAR WASH SIMULATOR</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Outfit'] leading-tight">
            Experience The Wash in <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">
              Interactive 360° Real-Time 3D.
            </span>
          </h2>
          
          <p className="mt-3 text-slate-400 text-xs sm:text-sm font-normal max-w-2xl mx-auto">
            Rotate the 3D car in all directions, test our thick snow foam cannons, blast off dirt with 180-bar soft water jets, and lock in ceramic mirror gloss.
          </p>
        </div>

        {/* 3D Stage + Telemetry HUD Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main 3D Canvas Box (Left 8 Cols) */}
          <div className="lg:col-span-8 relative">
            <div 
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(239,68,68,0.15)] cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Three.js Canvas Container */}
              <div ref={mountRef} className="w-full h-full" />

              {/* Floating Top Left: Real-Time Telemetry HUD */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-left shadow-lg">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Cleanliness Level</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${cleanliness}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{cleanliness}%</span>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State: <strong className="text-amber-300 uppercase">{washState}</strong></span>
                </div>
              </div>

              {/* Floating Top Right: Controls (Auto Rotate & Reset) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-md cursor-pointer ${
                    isAutoRotate 
                      ? 'bg-red-600 text-white border-red-500 shadow-red-500/30' 
                      : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Toggle 360 Auto-Rotation"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
                  <span>360° {isAutoRotate ? 'Auto' : 'Manual'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md cursor-pointer transition"
                  title="Reset Car Condition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Floating Bottom Status Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-20 px-4 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white text-xs flex items-center justify-between shadow-2xl pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-md">
                    {currentStepText}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Drag with mouse / finger to orbit
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Control Console (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Step 1: Wash Actions */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Wash Treatment Stages</span>
              </h4>

              {/* Button 1: Snow Foam */}
              <button
                onClick={handleApplyFoam}
                disabled={isSimulating}
                className="w-full p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-['Outfit']">1. Spray Snow Foam</h5>
                    <p className="text-[11px] text-slate-400">pH-Neutral Active Grime Soak</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Button 2: 180-Bar Jet Rinse */}
              <button
                onClick={handleRinse}
                disabled={isSimulating}
                className="w-full p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-['Outfit']">2. 180-Bar Jet Rinse</h5>
                    <p className="text-[11px] text-slate-400">Spotless Soft-Water Flush</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Button 3: Ceramic Polish */}
              <button
                onClick={handleCeramicCoat}
                disabled={isSimulating}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/40 hover:to-amber-600/40 border border-red-500/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-['Outfit']">3. Ceramic Gloss Shield</h5>
                    <p className="text-[11px] text-amber-200/70">Mirror Reflection & Beading</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Step 2: Car Paint Color Switcher */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-red-400" />
                  <span>3D Paint Color</span>
                </h4>
                <span className="text-xs font-bold text-white">{selectedColor.name}</span>
              </div>

              <div className="flex items-center gap-2.5 justify-between pt-1">
                {CAR_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleColorChange(col)}
                    className={`w-9 h-9 rounded-xl transition-all border-2 flex items-center justify-center cursor-pointer ${
                      selectedColor.id === col.id 
                        ? 'border-white scale-115 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                        : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {selectedColor.id === col.id && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  window.location.hash = '#booking';
                }
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Car className="w-4 h-4" />
              <span>Book This Detailing Treatment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
