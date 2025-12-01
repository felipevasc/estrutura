"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

const ANIMACOES: Record<number, number> = {
    1: 7,
    2: 5,
    3: 5,
    4: 10,
    5: 8
};

const gerarSequencia = (limite: number): number[] => {
    const sequencia: number[] = [1];
    let quadroAtual = 1;
    let passos = 0;
    const teto = limite * 4;

    while (quadroAtual < limite && passos < teto) {
        passos++;
        const sorteio = Math.random();

        if (quadroAtual === 1) {
            quadroAtual++;
        } else if (quadroAtual >= limite) {
            break;
        } else {
            if (sorteio > 0.3) {
                quadroAtual++;
            } else {
                quadroAtual--;
            }
        }
        sequencia.push(quadroAtual);
    }

    while (quadroAtual < limite) {
        quadroAtual++;
        sequencia.push(quadroAtual);
    }

    return sequencia;
};

const flutuar = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0px); }
`;

const Container = styled.div<{ $size: number; $isIdle: boolean }>`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    position: relative;
    ${props => props.$isIdle && css`animation: ${flutuar} 6s ease-in-out infinite;`}
    cursor: pointer;
    user-select: none;
    transition: transform 1s ease;
`;

const BackLayer = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 100%;
    border-color: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    z-index: 1;
    opacity: 1;
`;

const FrontLayer = styled.img<{ $visible: boolean; $instant: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    object-fit: contain;
    z-index: 2;
    transition: opacity ${props => props.$instant ? '0s' : '0.8s'} ease-in-out;
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: none;
`;

interface WeaverAvatarProps {
    size?: number;
    onClick?: () => void;
    ativo?: boolean;
}

const WeaverAvatar: React.FC<WeaverAvatarProps> = ({ size = 60, onClick, ativo = true }) => {
    const [currentSrc, setCurrentSrc] = useState('/weaver/animacao1/p1.png');
    const [nextSrc, setNextSrc] = useState('/weaver/animacao1/p1.png');
    const [frontVisible, setFrontVisible] = useState(false);
    const [frontInstant, setFrontInstant] = useState(true);

    const [isIdle, setIsIdle] = useState(true);
    const ativoRef = useRef(ativo);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const preload = () => {
            Object.entries(ANIMACOES).forEach(([animStr, count]) => {
                const animId = parseInt(animStr);
                for (let i = 1; i <= count; i++) {
                    const img = new Image();
                    img.src = `/weaver/animacao${animId}/p${i}.png`;
                }
            });
        };
        preload();
    }, []);

    const pararSequencia = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const transicionarParaQuadro = useCallback(async (src: string) => {
        if (!ativoRef.current) return;

        setNextSrc(src);
        setFrontInstant(false);
        setFrontVisible(true);

        await new Promise(r => setTimeout(r, 800));

        if (!ativoRef.current) return;

        setCurrentSrc(src);

        setFrontInstant(true);
        setFrontVisible(false);

        await new Promise(r => setTimeout(r, 100));
    }, []);

    const reproduzirSequencia = useCallback(async () => {
        if (!ativoRef.current) return;

        setIsIdle(false);

        const animacao = 5;
        const quadros = ANIMACOES[animacao];
        const sequencia = gerarSequencia(quadros);

        for (const quadro of sequencia) {
            if (!ativoRef.current) return;
            const src = `/weaver/animacao${animacao}/p${quadro}.png`;
            await transicionarParaQuadro(src);
        }

        if (!ativoRef.current) return;

        await transicionarParaQuadro('/weaver/animacao1/p1.png');
        setIsIdle(true);

        const atraso = 3000 + Math.random() * 3000;
        timerRef.current = setTimeout(reproduzirSequencia, atraso);
    }, [transicionarParaQuadro]);

    useEffect(() => {
        ativoRef.current = ativo;

        if (!ativo) {
            pararSequencia();
            setCurrentSrc('/weaver/animacao1/p1.png');
            setNextSrc('/weaver/animacao1/p1.png');
            setFrontVisible(false);
            setFrontInstant(true);
            setIsIdle(true);
            return;
        }

        timerRef.current = setTimeout(reproduzirSequencia, 1000);

        return () => {
            ativoRef.current = false;
            pararSequencia();
        };
    }, [ativo, pararSequencia, reproduzirSequencia]);

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
