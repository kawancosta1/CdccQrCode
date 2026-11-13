import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Crosshair, ExternalLink, Footprints, RotateCcw, Square, X } from "lucide-react";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import { useAccessibility } from "../../context/accessibilityStore";
import { useSiteConfig } from "../../context/siteConfigStore";
import {
  buildSmoothedPathPoints,
  findRoomPath,
  resolveShelfPercentPoint,
  ROOM_ENTRANCE_POINT,
  type Point2D,
} from "../../domain/roomPathfinding";
import { getMarkerOverrides } from "../../services/mappingService";
import type { DynamicMarkerOverride } from "../../types/content";
import { RoomMap } from "../RoomMap";
import {
  createShelfLabelSprite,
  getShelfSummary,
  toWorldXZ,
  WORLD_SPAN,
  type SelectedShelfInfo,
} from "./shelfSummary";
import style from "./style.module.css";

interface LibraryMap3DProps {
  roomId: RoomId;
  shelves: string[];
  className?: string;
}

interface CameraGoal {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/**
 * Visualizador 3D interativo da sala com Three.js:
 * - Planta 2D real texturizada no piso
 * - Paredes perimetrais e lombadas coloridas na face frontal das estantes
 * - Roteamento inteligente A* pelos corredores (40x40) com origem dinâmica (?origem=)
 * - Clique em qualquer estante via Raycaster + foco suave de câmera
 */
export function LibraryMap3D({ roomId, shelves, className }: LibraryMap3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraGoalRef = useRef<CameraGoal | null>(null);
  const walkthroughStateRef = useRef<{ active: boolean; t: number }>({ active: false, t: 0 });

  const { reducedMotion } = useAccessibility();
  const { getImageSrc } = useSiteConfig();
  const [webglFailed, setWebglFailed] = useState(false);
  const [overrides, setOverrides] = useState<DynamicMarkerOverride[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<SelectedShelfInfo | null>(null);
  const [isWalking, setIsWalking] = useState(false);

  const room = ROOM_CONFIG[roomId];
  const defaultEntrance = ROOM_ENTRANCE_POINT[roomId];
  const floorMapUrl = getImageSrc(`mapa_sala_${roomId}`, room.mapSrc);

  useEffect(() => {
    let active = true;
    getMarkerOverrides()
      .then((list) => {
        if (active) setOverrides(list.filter((o) => o.roomId === roomId));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [roomId]);

  const shelfNodes = useMemo(() => {
    const activeSet = new Set(shelves.map((s) => s.toUpperCase()));
    const keys = Array.from(new Set([...room.shelfNumbers.map(String), ...shelves]));
    const nodes: Array<{ key: string; point: Point2D; isTarget: boolean }> = [];

    for (const key of keys) {
      const override = overrides.find(
        (o) => o.shelfKey.toUpperCase() === key.toUpperCase(),
      );
      const pos = override
        ? { top: override.top, left: override.left, right: undefined }
        : room.shelfMarkers[key];
      const pt = pos ? resolveShelfPercentPoint(pos) : null;
      if (!pt) continue;
      nodes.push({
        key,
        point: pt,
        isTarget: activeSet.has(key.toUpperCase()),
      });
    }
    return nodes;
  }, [overrides, room.shelfMarkers, room.shelfNumbers, shelves]);

  // Suporte a origem dinâmica por QR Code (?origem=<estante> na query ou no hash)
  const originPoint = useMemo(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes("?")
        ? window.location.hash.slice(window.location.hash.indexOf("?"))
        : "";
      const hashParams = new URLSearchParams(hashQuery);
      const originParam = (searchParams.get("origem") ?? hashParams.get("origem"))
        ?.trim()
        .toUpperCase();
      if (originParam) {
        const originShelf = shelfNodes.find((n) => n.key.toUpperCase() === originParam);
        if (originShelf) {
          return {
            x: originShelf.point.x,
            y: originShelf.point.y,
            label: `Estante ${originShelf.key}`,
          };
        }
      }
    }
    return defaultEntrance;
  }, [defaultEntrance, shelfNodes]);

  const targetNode = useMemo(
    () => shelfNodes.find((n) => n.isTarget) ?? null,
    [shelfNodes],
  );

  const routeWaypoints = useMemo(() => {
    if (!targetNode) return [];
    const obstacles = shelfNodes
      .filter((n) => n.key !== targetNode.key && n.point.x !== originPoint.x && n.point.y !== originPoint.y)
      .map((n) => n.point);
    const raw = findRoomPath(originPoint, targetNode.point, obstacles);
    return buildSmoothedPathPoints(raw, 2.2);
  }, [originPoint, shelfNodes, targetNode]);

  const moveCameraTo = (pos: THREE.Vector3, target: THREE.Vector3) => {
    if (reducedMotion) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (camera && controls) {
        camera.position.copy(pos);
        controls.target.copy(target);
        controls.update();
      }
      return;
    }
    cameraGoalRef.current = { position: pos, target };
  };

  const handleResetCamera = () => {
    walkthroughStateRef.current = { active: false, t: 0 };
    setIsWalking(false);
    moveCameraTo(new THREE.Vector3(0, 14.5, 14.5), new THREE.Vector3(0, 0, 0));
  };

  const handleFocusTarget = () => {
    if (!targetNode) return;
    walkthroughStateRef.current = { active: false, t: 0 };
    setIsWalking(false);
    const { x, z } = toWorldXZ(targetNode.point);
    moveCameraTo(
      new THREE.Vector3(x + 2.5, 6.2, z + 6.4),
      new THREE.Vector3(x, 0.8, z),
    );
  };

  const handleToggleWalkthrough = () => {
    if (routeWaypoints.length < 2 || reducedMotion) return;
    if (walkthroughStateRef.current.active) {
      walkthroughStateRef.current = { active: false, t: 0 };
      setIsWalking(false);
      return;
    }
    cameraGoalRef.current = null;
    walkthroughStateRef.current = { active: true, t: 0 };
    setIsWalking(true);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return;
    }

    const width = Math.max(300, host.clientWidth);
    const height = Math.max(260, host.clientHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.innerHTML = "";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4efe6");
    scene.fog = new THREE.Fog("#f4efe6", 26, 46);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 14.5, 14.5);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 5.5;
    controls.maxDistance = 28;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Iluminação editorial quente
    const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xd6cbb8, 1.18);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff6e5, 1.05);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

    // Piso base + Planta 2D real texturizada
    const floorGeo = new THREE.PlaneGeometry(WORLD_SPAN, WORLD_SPAN);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf6f1e7,
      roughness: 0.92,
      metalness: 0.02,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    disposableGeometries.push(floorGeo);
    disposableMaterials.push(floorMat);

    let isDisposed = false;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      floorMapUrl,
      (tex) => {
        if (isDisposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        floorMat.map = tex;
        floorMat.color.setHex(0xffffff);
        floorMat.needsUpdate = true;
        disposableTextures.push(tex);
      },
      undefined,
      () => {},
    );

    // Paredes perimetrais sutis (com vão alinhado à porta real de cada sala)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xd6cbb8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.85,
    });
    disposableMaterials.push(wallMat);

    const half = WORLD_SPAN / 2;
    const wallHeight = 0.85;
    const southWalls =
      roomId === 1
        ? [
            // Porta no canto inferior direito
            { w: WORLD_SPAN * 0.72, d: 0.22, x: -half + (WORLD_SPAN * 0.72) / 2, z: half },
          ]
        : roomId === 2
          ? [
              // Porta no canto inferior esquerdo (conexão com a Sala 1)
              { w: WORLD_SPAN * 0.72, d: 0.22, x: half - (WORLD_SPAN * 0.72) / 2, z: half },
            ]
          : [
              { w: WORLD_SPAN * 0.38, d: 0.22, x: -half * 0.62, z: half },
              { w: WORLD_SPAN * 0.38, d: 0.22, x: half * 0.62, z: half },
            ];

    const wallConfigs = [
      { w: WORLD_SPAN + 0.3, d: 0.22, x: 0, z: -half }, // parede norte
      { w: 0.22, d: WORLD_SPAN, x: -half, z: 0 }, // parede oeste
      { w: 0.22, d: WORLD_SPAN, x: half, z: 0 }, // parede leste
      ...southWalls,
    ];
    for (const wc of wallConfigs) {
      const wGeo = new THREE.BoxGeometry(wc.w, wallHeight, wc.d);
      const wMesh = new THREE.Mesh(wGeo, wallMat);
      wMesh.position.set(wc.x, wallHeight / 2, wc.z);
      scene.add(wMesh);
      disposableGeometries.push(wGeo);
    }

    // Referência visual de conexão entre Sala 1 e Sala 2
    if (roomId === 1) {
      const linkSprite = createShelfLabelSprite("Sala 2 →", false, "#1e3a5f");
      linkSprite.scale.set(1.85, 0.56, 1);
      linkSprite.position.set(half + 1.2, 0.7, half - 1.2);
      scene.add(linkSprite);
      disposableMaterials.push(linkSprite.material);
      if (linkSprite.material.map) disposableTextures.push(linkSprite.material.map);
    } else if (roomId === 2) {
      const linkSprite = createShelfLabelSprite("← Sala 1", false, "#1e3a5f");
      linkSprite.scale.set(1.85, 0.56, 1);
      linkSprite.position.set(-half - 1.2, 0.7, half - 1.2);
      scene.add(linkSprite);
      disposableMaterials.push(linkSprite.material);
      if (linkSprite.material.map) disposableTextures.push(linkSprite.material.map);
    }

    // Estantes 3D proporcionais ao tamanho real no mapa 2D + livros coloridos na face frontal
    const shelfGeo = new THREE.BoxGeometry(2.25, 1.55, 1.05);
    const shelfCapGeo = new THREE.BoxGeometry(2.35, 0.12, 1.13);
    const spineGeo = new THREE.BoxGeometry(1.9, 0.34, 0.08);

    const normalMat = new THREE.MeshStandardMaterial({ color: 0x7a5c43, roughness: 0.78 });
    const normalCapMat = new THREE.MeshStandardMaterial({ color: 0x5c4330, roughness: 0.7 });
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x92400e,
      emissiveIntensity: 0.48,
      roughness: 0.42,
    });
    const targetCapMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
    const spineMatA = new THREE.MeshStandardMaterial({ color: 0x8a3354, roughness: 0.6 });
    const spineMatB = new THREE.MeshStandardMaterial({ color: 0x145399, roughness: 0.6 });
    disposableGeometries.push(shelfGeo, shelfCapGeo, spineGeo);
    disposableMaterials.push(normalMat, normalCapMat, targetMat, targetCapMat, spineMatA, spineMatB);

    const clickableMeshes: THREE.Mesh[] = [];
    let targetSpotlightRing: THREE.Mesh | null = null;
    let targetBeacon: THREE.Mesh | null = null;

    for (const node of shelfNodes) {
      const { x, z } = toWorldXZ(node.point);
      const body = new THREE.Mesh(shelfGeo, node.isTarget ? targetMat : normalMat);
      body.position.set(x, 0.775, z);
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData = { shelfKey: node.key };
      scene.add(body);
      clickableMeshes.push(body);

      const cap = new THREE.Mesh(shelfCapGeo, node.isTarget ? targetCapMat : normalCapMat);
      cap.position.set(x, 1.61, z);
      scene.add(cap);

      // Faixa frontal de livros para indicar orientação
      const spineRowTop = new THREE.Mesh(spineGeo, spineMatA);
      spineRowTop.position.set(x, 1.12, z + 0.54);
      scene.add(spineRowTop);

      const spineRowBot = new THREE.Mesh(spineGeo, spineMatB);
      spineRowBot.position.set(x, 0.54, z + 0.54);
      scene.add(spineRowBot);

      const label = createShelfLabelSprite(node.key, node.isTarget);
      label.position.set(x, node.isTarget ? 2.55 : 2.15, z);
      scene.add(label);
      disposableMaterials.push(label.material);
      if (label.material.map) disposableTextures.push(label.material.map);

      if (node.isTarget) {
        const ringGeo = new THREE.RingGeometry(1.35, 1.72, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        targetSpotlightRing = new THREE.Mesh(ringGeo, ringMat);
        targetSpotlightRing.rotation.x = -Math.PI / 2;
        targetSpotlightRing.position.set(x, 0.04, z);
        scene.add(targetSpotlightRing);
        disposableGeometries.push(ringGeo);
        disposableMaterials.push(ringMat);

        const beaconGeo = new THREE.ConeGeometry(0.32, 0.65, 16);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
        });
        targetBeacon = new THREE.Mesh(beaconGeo, beaconMat);
        targetBeacon.rotation.x = Math.PI;
        targetBeacon.position.set(x, 3.05, z);
        scene.add(targetBeacon);
        disposableGeometries.push(beaconGeo);
        disposableMaterials.push(beaconMat);

        const spotLight = new THREE.PointLight(0xf59e0b, 3.5, 8);
        spotLight.position.set(x, 3.8, z);
        scene.add(spotLight);
      }
    }

    // Origem ("Você está aqui")
    const originXZ = toWorldXZ(originPoint);
    const originCoreGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 24);
    const originCoreMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.4,
    });
    const originCore = new THREE.Mesh(originCoreGeo, originCoreMat);
    originCore.position.set(originXZ.x, 0.08, originXZ.z);
    scene.add(originCore);
    disposableGeometries.push(originCoreGeo);
    disposableMaterials.push(originCoreMat);

    const originPulseGeo = new THREE.RingGeometry(0.5, 0.72, 32);
    const originPulseMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const originPulse = new THREE.Mesh(originPulseGeo, originPulseMat);
    originPulse.rotation.x = -Math.PI / 2;
    originPulse.position.set(originXZ.x, 0.03, originXZ.z);
    scene.add(originPulse);
    disposableGeometries.push(originPulseGeo);
    disposableMaterials.push(originPulseMat);

    const originSprite = createShelfLabelSprite("Você está aqui", false, "#065f46");
    originSprite.scale.set(2.3, 0.65, 1);
    originSprite.position.set(originXZ.x, 1.1, originXZ.z);
    scene.add(originSprite);
    disposableMaterials.push(originSprite.material);
    if (originSprite.material.map) disposableTextures.push(originSprite.material.map);

    // Rota A* suavizada com CatmullRomCurve3 + setas animadas
    let routeCurve: THREE.CatmullRomCurve3 | null = null;
    const chevrons: Array<{ mesh: THREE.Mesh; offset: number }> = [];

    if (routeWaypoints.length >= 2) {
      const vecPoints = routeWaypoints.map((pt) => {
        const { x, z } = toWorldXZ(pt);
        return new THREE.Vector3(x, 0.1, z);
      });
      routeCurve = new THREE.CatmullRomCurve3(vecPoints, false, "centripetal", 0.2);

      const tubeGeo = new THREE.TubeGeometry(routeCurve, 84, 0.11, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0xb45309,
        emissiveIntensity: 0.55,
        roughness: 0.35,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
      disposableGeometries.push(tubeGeo);
      disposableMaterials.push(tubeMat);

      const chevronGeo = new THREE.ConeGeometry(0.22, 0.42, 4);
      chevronGeo.rotateX(Math.PI / 2);
      const chevronMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.7,
      });
      disposableGeometries.push(chevronGeo);
      disposableMaterials.push(chevronMat);

      const chevronCount = 6;
      for (let i = 0; i < chevronCount; i += 1) {
        const mesh = new THREE.Mesh(chevronGeo, chevronMat);
        scene.add(mesh);
        chevrons.push({ mesh, offset: i / chevronCount });
      }
    }

    // Raycaster para clicar em qualquer estante 3D
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let downPos: { x: number; y: number } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
      cameraGoalRef.current = null;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!downPos) return;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitKey = String(hits[0].object.userData?.shelfKey ?? "");
        if (hitKey) {
          setSelectedShelf(getShelfSummary(roomId, hitKey));
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const handleResize = () => {
      if (!host) return;
      const w = Math.max(300, host.clientWidth);
      const h = Math.max(260, host.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(host);

    const clock = new THREE.Clock();
    let lastTime = 0;
    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(0.05, Math.max(0.001, elapsed - lastTime));
      lastTime = elapsed;

      if (walkthroughStateRef.current.active && routeCurve && !reducedMotion) {
        walkthroughStateRef.current.t = Math.min(
          1,
          walkthroughStateRef.current.t + delta * 0.18,
        );
        const t = walkthroughStateRef.current.t;
        const pos = routeCurve.getPointAt(t);
        const lookAtPos = routeCurve.getPointAt(Math.min(1, t + 0.08));

        camera.position.lerp(new THREE.Vector3(pos.x, 1.85, pos.z), 0.14);
        controls.target.lerp(new THREE.Vector3(lookAtPos.x, 1.15, lookAtPos.z), 0.18);

        if (t >= 1) {
          walkthroughStateRef.current.active = false;
          setIsWalking(false);
        }
      } else if (cameraGoalRef.current) {
        camera.position.lerp(cameraGoalRef.current.position, 0.1);
        controls.target.lerp(cameraGoalRef.current.target, 0.1);
        if (
          camera.position.distanceTo(cameraGoalRef.current.position) < 0.08 &&
          controls.target.distanceTo(cameraGoalRef.current.target) < 0.08
        ) {
          cameraGoalRef.current = null;
        }
      }

      if (!reducedMotion) {
        const pulseScale = 1 + Math.sin(elapsed * 3.2) * 0.18;
        originPulse.scale.set(pulseScale, pulseScale, 1);

        if (targetSpotlightRing) {
          const tScale = 1 + Math.sin(elapsed * 2.8) * 0.14;
          targetSpotlightRing.scale.set(tScale, tScale, 1);
        }
        if (targetBeacon) {
          targetBeacon.position.y = 3.05 + Math.sin(elapsed * 3.0) * 0.16;
        }
      }

      if (routeCurve && chevrons.length > 0) {
        for (const item of chevrons) {
          const t = reducedMotion
            ? item.offset
            : (item.offset + elapsed * 0.22) % 1;
          const pos = routeCurve.getPointAt(t);
          const tangent = routeCurve.getTangentAt(t);
          item.mesh.position.set(pos.x, 0.2, pos.z);
          item.mesh.lookAt(pos.x + tangent.x, 0.2, pos.z + tangent.z);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      resizeObserver?.disconnect();
      controls.dispose();
      for (const geo of disposableGeometries) geo.dispose();
      for (const mat of disposableMaterials) mat.dispose();
      for (const tex of disposableTextures) tex.dispose();
      scene.clear();
      renderer.dispose();
      host.innerHTML = "";
    };
  }, [floorMapUrl, originPoint, reducedMotion, roomId, routeWaypoints, shelfNodes]);

  if (webglFailed) {
    return <RoomMap roomId={roomId} shelves={shelves} />;
  }

  return (
    <div
      className={`${style.wrapper3d} ${className ?? ""}`}
      role="region"
      aria-label={`Mapa 3D interativo da ${room.label}`}
    >
      <div className={style.hudTop}>
        <span className={style.badge3d}>
          <span className={style.badgeDot} aria-hidden="true" />
          Mapa 3D • {room.label}
        </span>

        <div className={style.hudActions}>
          {routeWaypoints.length >= 2 && !reducedMotion && (
            <button
              type="button"
              className={style.walkCamBtn}
              onClick={handleToggleWalkthrough}
              aria-pressed={isWalking}
              aria-label={isWalking ? "Parar simulação do trajeto" : "Simular trajeto em primeira pessoa"}
            >
              {isWalking ? <Square size={12} aria-hidden="true" /> : <Footprints size={13} aria-hidden="true" />}
              {isWalking ? "Parar" : "Simular trajeto"}
            </button>
          )}
          {targetNode && (
            <button
              type="button"
              className={style.focusCamBtn}
              onClick={handleFocusTarget}
              aria-label={`Focar na Estante ${targetNode.key}`}
            >
              <Crosshair size={13} aria-hidden="true" />
              Focar estante
            </button>
          )}
          <button
            type="button"
            className={style.resetCamBtn}
            onClick={handleResetCamera}
            aria-label="Visão geral do mapa 3D"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Visão geral
          </button>
        </div>
      </div>

      {selectedShelf && (
        <div className={style.shelfPopup} role="status" aria-live="polite">
          <div className={style.shelfPopupHeader}>
            <span className={style.shelfPopupTitle}>Estante {selectedShelf.key}</span>
            <button
              type="button"
              className={style.shelfPopupClose}
              onClick={() => setSelectedShelf(null)}
              aria-label="Fechar detalhes da estante"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
          <p className={style.shelfPopupMeta}>
            {selectedShelf.rangeSummary}
            {selectedShelf.codeCount > 0 ? ` (${selectedShelf.codeCount} códigos)` : ""}
          </p>
          <Link
            to={`/estantes/${room.slug}/${selectedShelf.key}`}
            className={style.shelfPopupLink}
          >
            Abrir página da estante
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>
      )}

      <div ref={hostRef} className={style.canvasHost} />

      <div className={style.hudBottom}>
        <div className={style.legendPill}>
          <span className={style.legendItem}>
            <span className={style.originSwatch} aria-hidden="true" />
            {originPoint.label}
          </span>
          {shelves.length > 0 && (
            <span className={style.legendItem}>
              <span className={style.targetSwatch} aria-hidden="true" />
              Estante {shelves.join(", ")}
            </span>
          )}
        </div>
        <span className={style.hintText}>Toque numa estante • Arraste para girar</span>
      </div>
    </div>
  );
}
