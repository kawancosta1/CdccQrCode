import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCcw } from "lucide-react";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import { useAccessibility } from "../../context/accessibilityStore";
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
import style from "./style.module.css";

interface LibraryMap3DProps {
  roomId: RoomId;
  shelves: string[];
  className?: string;
}

const WORLD_SPAN = 18; // Mapa mapeado em [-9, +9] no eixo X e Z

function toWorldXZ(pt: Point2D): { x: number; z: number } {
  return {
    x: ((pt.x - 50) / 100) * WORLD_SPAN,
    z: ((pt.y - 50) / 100) * WORLD_SPAN,
  };
}

function createShelfLabelSprite(text: string, isTarget: boolean): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = isTarget ? "#b45309" : "#2c2218";
    ctx.beginPath();
    ctx.roundRect(12, 8, 104, 48, 14);
    ctx.fill();

    ctx.strokeStyle = isTarget ? "#fef3c7" : "#e7decb";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#faf7f2";
    ctx.font = "700 26px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 33);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.35, 0.68, 1);
  return sprite;
}

/**
 * Visualizador 3D interativo da sala com Three.js e roteamento inteligente A* pelos corredores.
 */
export function LibraryMap3D({ roomId, shelves, className }: LibraryMap3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { reducedMotion } = useAccessibility();
  const [webglFailed, setWebglFailed] = useState(false);
  const [overrides, setOverrides] = useState<DynamicMarkerOverride[]>([]);

  const room = ROOM_CONFIG[roomId];
  const entrance = ROOM_ENTRANCE_POINT[roomId];

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

  const targetNode = useMemo(
    () => shelfNodes.find((n) => n.isTarget) ?? null,
    [shelfNodes],
  );

  const routeWaypoints = useMemo(() => {
    if (!targetNode) return [];
    const obstacles = shelfNodes
      .filter((n) => n.key !== targetNode.key)
      .map((n) => n.point);
    const raw = findRoomPath(entrance, targetNode.point, obstacles);
    return buildSmoothedPathPoints(raw, 2.5);
  }, [entrance, shelfNodes, targetNode]);

  const handleResetCamera = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(0, 14.5, 14.5);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
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
    scene.fog = new THREE.Fog("#f4efe6", 24, 42);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 14.5, 14.5);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 7;
    controls.maxDistance = 28;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Iluminação editorial quente
    const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xd6cbb8, 1.15);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff6e5, 1.05);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    // Piso da sala + grade de corredores
    const floorGeo = new THREE.PlaneGeometry(WORLD_SPAN + 2.4, WORLD_SPAN + 2.4);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xeae2d3,
      roughness: 0.92,
      metalness: 0.02,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    disposableGeometries.push(floorGeo);
    disposableMaterials.push(floorMat);

    const grid = new THREE.GridHelper(WORLD_SPAN + 1, 20, 0xcbc0ac, 0xded5c5);
    grid.position.y = 0.01;
    scene.add(grid);

    // Moldura de perímetro da sala
    const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(WORLD_SPAN + 2, 0.2, WORLD_SPAN + 2));
    const borderMat = new THREE.LineBasicMaterial({ color: 0x9c8b75 });
    const borderWire = new THREE.LineSegments(borderGeo, borderMat);
    borderWire.position.y = 0.1;
    scene.add(borderWire);
    disposableGeometries.push(borderGeo);
    disposableMaterials.push(borderMat);

    // Estantes 3D
    const shelfGeo = new THREE.BoxGeometry(1.18, 1.45, 0.72);
    const shelfCapGeo = new THREE.BoxGeometry(1.26, 0.1, 0.78);
    const normalMat = new THREE.MeshStandardMaterial({ color: 0x7a5c43, roughness: 0.78 });
    const normalCapMat = new THREE.MeshStandardMaterial({ color: 0x5c4330, roughness: 0.7 });
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x92400e,
      emissiveIntensity: 0.45,
      roughness: 0.45,
    });
    const targetCapMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
    disposableGeometries.push(shelfGeo, shelfCapGeo);
    disposableMaterials.push(normalMat, normalCapMat, targetMat, targetCapMat);

    let targetSpotlightRing: THREE.Mesh | null = null;
    let targetBeacon: THREE.Mesh | null = null;

    for (const node of shelfNodes) {
      const { x, z } = toWorldXZ(node.point);
      const body = new THREE.Mesh(shelfGeo, node.isTarget ? targetMat : normalMat);
      body.position.set(x, 0.725, z);
      body.castShadow = true;
      body.receiveShadow = true;
      scene.add(body);

      const cap = new THREE.Mesh(shelfCapGeo, node.isTarget ? targetCapMat : normalCapMat);
      cap.position.set(x, 1.5, z);
      scene.add(cap);

      const label = createShelfLabelSprite(node.key, node.isTarget);
      label.position.set(x, node.isTarget ? 2.45 : 2.05, z);
      scene.add(label);
      if (label.material.map) {
        disposableMaterials.push(label.material);
      }

      if (node.isTarget) {
        const ringGeo = new THREE.RingGeometry(0.9, 1.25, 32);
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

    // Origem ("Você está aqui") na entrada da sala
    const originXZ = toWorldXZ(entrance);
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

    const originSprite = createShelfLabelSprite("Você está aqui", false);
    originSprite.scale.set(2.2, 0.62, 1);
    originSprite.position.set(originXZ.x, 1.05, originXZ.z);
    scene.add(originSprite);
    disposableMaterials.push(originSprite.material);

    // Rota A* suavizada com CatmullRomCurve3 + setas animadas
    let routeCurve: THREE.CatmullRomCurve3 | null = null;
    const chevrons: Array<{ mesh: THREE.Mesh; offset: number }> = [];

    if (routeWaypoints.length >= 2) {
      const vecPoints = routeWaypoints.map((pt) => {
        const { x, z } = toWorldXZ(pt);
        return new THREE.Vector3(x, 0.1, z);
      });
      routeCurve = new THREE.CatmullRomCurve3(vecPoints, false, "centripetal", 0.2);

      const tubeGeo = new THREE.TubeGeometry(routeCurve, 72, 0.11, 8, false);
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
    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

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
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      controls.dispose();
      for (const geo of disposableGeometries) geo.dispose();
      for (const mat of disposableMaterials) mat.dispose();
      renderer.dispose();
      host.innerHTML = "";
    };
  }, [entrance, reducedMotion, routeWaypoints, shelfNodes]);

  if (webglFailed) {
    return <RoomMap roomId={roomId} shelves={shelves} />;
  }

  return (
    <div className={`${style.wrapper3d} ${className ?? ""}`} role="region" aria-label={`Mapa 3D interativo da ${room.label}`}>
      <div className={style.hudTop}>
        <span className={style.badge3d}>
          <span className={style.badgeDot} aria-hidden="true" />
          Mapa 3D • {room.label}
        </span>
        <button
          type="button"
          className={style.resetCamBtn}
          onClick={handleResetCamera}
          aria-label="Centralizar câmera do mapa 3D"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Centralizar
        </button>
      </div>

      <div ref={hostRef} className={style.canvasHost} />

      <div className={style.hudBottom}>
        <div className={style.legendPill}>
          <span className={style.legendItem}>
            <span className={style.originSwatch} aria-hidden="true" />
            Você está aqui
          </span>
          {shelves.length > 0 && (
            <span className={style.legendItem}>
              <span className={style.targetSwatch} aria-hidden="true" />
              Estante {shelves.join(", ")}
            </span>
          )}
        </div>
        <span className={style.hintText}>Arraste para girar • Pinça/scroll para zoom</span>
      </div>
    </div>
  );
}
