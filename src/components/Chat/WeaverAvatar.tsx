import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const ANIMATIONS: Record<number, number> = {
    1: 7,
    2: 9,
    3: 5,
    4: 10,
    5: 8
};

// Generates a random walk sequence from 1 to max with forward bias
const generateSequence = (max: number): number[] => {
    const seq: number[] = [1];
    let current = 1;
    let steps = 0;
    // Safety limit to prevent overly long animations
    const limit = max * 4;

    while (current < max && steps < limit) {
        steps++;
        const rand = Math.random();

        if (current === 1) {
            // Must go forward from start
            current++;
        } else if (current >= max) {
            break;
        } else {
            // 70% chance to move forward, 30% backward
            // This creates the "yo-yo" effect: 1->2->3->2->3->4...
            if (rand > 0.3) {
                current++;
            } else {
                current--;
            }
        }
        seq.push(current);
    }

    // Ensure we reach the end
    while (current < max) {
        current++;
        seq.push(current);
    }

    return seq;
};

const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0px); }
`;

const Container = styled.div<{ $size: number; $isIdle: boolean }>`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    position: relative;
    /* Only float when idle to avoid conflict with transitions */
    ${props => props.$isIdle && css`animation: ${float} 6s ease-in-out infinite;`}
    cursor: pointer;
    user-select: none;
    transition: transform 1s ease; /* Even smoother transition when animation starts/stops */
`;

const SpriteLayer = styled.img<{ $visible: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.8s ease-in-out; /* Even slower, smoother blending */
    opacity: ${props => props.$visible ? 1 : 0};
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
`;

interface WeaverAvatarProps {
    size?: number;
    floating?: boolean;
    onClick?: () => void;
}

const WeaverAvatar: React.FC<WeaverAvatarProps> = ({ size = 60, onClick }) => {
    // Two slots for cross-fading
    const [imgA, setImgA] = useState('/weaver/animacao1/p1.png');
    const [imgB, setImgB] = useState('/weaver/animacao1/p1.png');
    const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
    const activeSlotRef = useRef<'A' | 'B'>('A');

    const [isIdle, setIsIdle] = useState(true);
    const isMounted = useRef(true);

    // Preload images
    useEffect(() => {
        const preload = () => {
            Object.entries(ANIMATIONS).forEach(([animStr, count]) => {
                const animId = parseInt(animStr);
                for (let i = 1; i <= count; i++) {
                    const img = new Image();
                    img.src = `/weaver/animacao${animId}/p${i}.png`;
                }
            });
        };
        preload();

        return () => { isMounted.current = false; };
    }, []);

    const switchFrame = (newSrc: string) => {
        const current = activeSlotRef.current;
        const next = current === 'A' ? 'B' : 'A';

        if (next === 'A') setImgA(newSrc);
        else setImgB(newSrc);

        setActiveSlot(next);
        activeSlotRef.current = next;
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const playSequence = async () => {
            if (!isMounted.current) return;

            // Start Animation phase
            setIsIdle(false);

            // Pick random animation
            const animId = Math.floor(Math.random() * 5) + 1;
            const count = ANIMATIONS[animId];

            // Generate stochastic path (yo-yo effect)
            const sequence = generateSequence(count);

            // Play frames
            // Very slow frame duration for gentle morphing
            const frameDuration = 1000;

            for (const frame of sequence) {
                if (!isMounted.current) return;
                const src = `/weaver/animacao${animId}/p${frame}.png`;
                switchFrame(src);
                await new Promise(r => setTimeout(r, frameDuration));
            }

            // Return to Idle state (anim1 p1 is neutral)
            if (isMounted.current) {
                switchFrame('/weaver/animacao1/p1.png');
                // Allow transition to finish before starting float
                await new Promise(r => setTimeout(r, 1000));
                setIsIdle(true);
            }

            // Schedule next animation (random interval)
            if (isMounted.current) {
                const nextDelay = 4000 + Math.random() * 3000;
                timer = setTimeout(playSequence, nextDelay);
            }
        };

        // Initial start delay
        timer = setTimeout(playSequence, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Container $size={size} $isIdle={isIdle} onClick={onClick}>
            <SpriteLayer src={imgA} $visible={activeSlot === 'A'} draggable={false} alt="" />
            <SpriteLayer src={imgB} $visible={activeSlot === 'B'} draggable={false} alt="" />
        </Container>
    );
};

export default WeaverAvatar;
