"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { getRecentAchievements, LiveAchievement } from '@/lib/actions/achievements';

interface DisplayAchievement {
    text: string;
    pos: [number, number, number];
    color: string;
}

// Fallback achievements for when there's no real data
const fallbackAchievements: DisplayAchievement[] = [
    { text: "Scientific Paper 📄", pos: [-3, 2, -2], color: "#ef4444" },
    { text: "Volunteering ❤️", pos: [3, 1, -1], color: "#10b981" },
    { text: "Hackathon Win 🏆", pos: [-2, -2, 0], color: "#f59e0b" },
    { text: "Art Exhibition 🎨", pos: [2, -1, -3], color: "#8b5cf6" },
    { text: "Sports Gold 🥇", pos: [0, 3, -5], color: "#3b82f6" },
    { text: "Dean's List ⭐", pos: [-4, 0, -4], color: "#eab308" },
];

// Predefined positions for floating achievements
const positions: [number, number, number][] = [
    [-3, 2, -2], [3, 1, -1], [-2, -2, 0], [2, -1, -3],
    [0, 3, -5], [-4, 0, -4], [4, -2, -2], [1, 4, -3],
    [-1, -3, -1], [2, 2, -4], [-3, -1, -5], [3, -3, 0],
];

function FloatingAchievement({ position, text, color }: { position: [number, number, number], text: string, color: string }) {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Text
                position={position}
                fontSize={0.35}
                color={color}
                anchorX="center"
                anchorY="middle"
                maxWidth={4}
            >
                {text}
                <meshStandardMaterial emissive={color} emissiveIntensity={2} toneMapped={false} />
            </Text>
        </Float>
    );
}

function DataParticles({ count = 100 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            particle.mx += (state.mouse.x * 1000 - particle.mx) * 0.01;
            particle.my += (state.mouse.y * 1000 - 1 - particle.my) * 0.01;

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            if (mesh.current) {
                mesh.current.setMatrixAt(i, dummy.matrix);
            }
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <>
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial
                    color="#3b82f6"
                    roughness={0.5}
                    metalness={0.5}
                    emissive="#1d4ed8"
                    emissiveIntensity={0.5}
                />
            </instancedMesh>
        </>
    );
}

export default function DataWall() {
    const [achievements, setAchievements] = useState<DisplayAchievement[]>(fallbackAchievements);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isLive, setIsLive] = useState(false);

    // Fetch real achievements and poll for updates
    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const { achievements: realAchievements, colors, emojis } = await getRecentAchievements(12);

                if (realAchievements.length > 0) {
                    const displayAchievements: DisplayAchievement[] = realAchievements.map((ach, index) => {
                        const emoji = emojis[ach.category] || '⭐';
                        const color = colors[ach.category] || '#3b82f6';
                        const pos = positions[index % positions.length];

                        return {
                            text: `${ach.title} ${emoji}`,
                            pos,
                            color,
                        };
                    });

                    setAchievements(displayAchievements);
                    setIsLive(true);
                }
                setLastUpdate(new Date());
            } catch (error) {
                console.error('Failed to fetch achievements:', error);
                // Keep using fallback/current achievements
            }
        };

        // Initial fetch
        fetchAchievements();

        // Poll every 20 seconds
        const interval = setInterval(fetchAchievements, 20000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-[400px] md:h-[600px] relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900">
            <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    {isLive ? 'Live Achievement Feed' : 'Achievement Feed'}
                </h3>
                <p className="text-white/60 text-xs mt-1">
                    {isLive ? `${achievements.length} approved achievements` : 'Loading real data...'}
                </p>
            </div>

            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <fog attach="fog" args={['#0f172a', 5, 20]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="blue" intensity={1} />

                <DataParticles count={150} />

                {achievements.map((ach, i) => (
                    <FloatingAchievement
                        key={`${ach.text}-${i}`}
                        position={ach.pos}
                        text={ach.text}
                        color={ach.color}
                    />
                ))}

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} noise={0.2} color="#60a5fa" />
            </Canvas>
        </div>
    );
}
