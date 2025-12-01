import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const ANIMATIONS: Record<number, number> = {
    1: 7,
    2: 9,
    3: 5,
    4: 10,
    5: 8
};

const float = keyframes`
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-8px) scale(1.02); }
    100% { transform: translateY(0px) scale(1); }
`;

const Container = styled.div<{ $size: number; $floating: boolean }>`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    ${props => props.$floating && css`animation: ${float} 4s ease-in-out infinite;`}
    cursor: pointer;
    user-select: none;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    }
`;

interface WeaverAvatarProps {
    size?: number;
    floating?: boolean;
    onClick?: () => void;
}

const WeaverAvatar: React.FC<WeaverAvatarProps> = ({ size = 60, floating = true, onClick }) => {
    const [currentAnim, setCurrentAnim] = useState(1);
    const [currentFrame, setCurrentFrame] = useState(1);

    // Preload images once on mount
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
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => {
                const maxFrames = ANIMATIONS[currentAnim];
                if (prev >= maxFrames) {
                    // Animation finished, pick next animation
                    // 70% chance to go to idle (anim 1) or keep random?
                    // Prompt says "randomly". Let's simply randomize.
                    const nextAnim = Math.floor(Math.random() * 5) + 1;
                    setCurrentAnim(nextAnim);
                    return 1;
                }
                return prev + 1;
            });
        }, 150); // 150ms per frame

        return () => clearInterval(interval);
    }, [currentAnim]);

    const src = `/weaver/animacao${currentAnim}/p${currentFrame}.png`;

    return (
        <Container $size={size} $floating={floating} onClick={onClick}>
            <img src={src} alt="Weaver AI" draggable={false} />
        </Container>
    );
};

export default WeaverAvatar;
