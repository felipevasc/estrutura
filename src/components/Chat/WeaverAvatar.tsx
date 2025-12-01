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
    const limit = max * 4;

    while (current < max && steps < limit) {
        steps++;
        const rand = Math.random();

        if (current === 1) {
            current++;
        } else if (current >= max) {
            break;
        } else {
            // yo-yo effect
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
    /* Only float when idle */
    ${props => props.$isIdle && css`animation: ${float} 6s ease-in-out infinite;`}
    cursor: pointer;
    user-select: none;
    transition: transform 1s ease;
`;

// Back layer: Always opaque, z-index 1
const BackLayer = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 1;
    opacity: 1;
`;

// Front layer: Fades in/out, z-index 2
const FrontLayer = styled.img<{ $visible: boolean; $instant: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 2;
    transition: opacity ${props => props.$instant ? '0s' : '0.8s'} ease-in-out;
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: none; /* Let clicks pass to container */
`;

interface WeaverAvatarProps {
    size?: number;
    onClick?: () => void;
}

const WeaverAvatar: React.FC<WeaverAvatarProps> = ({ size = 60, onClick }) => {
    // Layering state
    const [currentSrc, setCurrentSrc] = useState('/weaver/animacao1/p1.png');
    const [nextSrc, setNextSrc] = useState('/weaver/animacao1/p1.png');
    const [frontVisible, setFrontVisible] = useState(false);
    const [frontInstant, setFrontInstant] = useState(true);

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

    // Helper to perform the smooth transition
    // Returns a promise that resolves when the frame hold time is over
    const transitionToFrame = async (src: string) => {
        if (!isMounted.current) return;

        // 1. Prepare Front Layer
        setNextSrc(src);
        setFrontInstant(false); // Enable transition
        setFrontVisible(true);  // Start Fade In

        // 2. Wait for Fade In (0.8s)
        await new Promise(r => setTimeout(r, 800));

        if (!isMounted.current) return;

        // 3. Commit to Back Layer (Instant)
        setCurrentSrc(src);

        // 4. Hide Front Layer (Instant)
        setFrontInstant(true);
        setFrontVisible(false);

        // 5. Hold remainder of frame time (total 1000ms -> wait 200ms)
        await new Promise(r => setTimeout(r, 200));
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const playSequence = async () => {
            if (!isMounted.current) return;

            setIsIdle(false);

            const animId = Math.floor(Math.random() * 5) + 1;
            const count = ANIMATIONS[animId];
            const sequence = generateSequence(count);

            for (const frame of sequence) {
                if (!isMounted.current) return;
                const src = `/weaver/animacao${animId}/p${frame}.png`;
                await transitionToFrame(src);
            }

            // Return to Idle
            if (isMounted.current) {
                await transitionToFrame('/weaver/animacao1/p1.png');
                setIsIdle(true);
            }

            // Schedule next
            if (isMounted.current) {
                const nextDelay = 4000 + Math.random() * 3000;
                timer = setTimeout(playSequence, nextDelay);
            }
        };

        timer = setTimeout(playSequence, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Container $size={size} $isIdle={isIdle} onClick={onClick}>
            <BackLayer src={currentSrc} draggable={false} alt="" />
            <FrontLayer
                src={nextSrc}
                $visible={frontVisible}
                $instant={frontInstant}
                draggable={false}
                alt=""
            />
        </Container>
    );
};

export default WeaverAvatar;
