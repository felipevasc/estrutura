"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

const flutuar = keyframes`
    0% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-3px) translateX(1px); }
    50% { transform: translateY(0) translateX(0px); }
    75% { transform: translateY(3px) translateX(-1px); }
    100% { transform: translateY(0px)  translateX(0px); }
`;

const Container = styled.div<{ $size: number }>`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    position: relative;
    animation: ${flutuar} 6s ease-in-out infinite;
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
    z-index: 1;
    opacity: 1;
`;

const FrontLayer = styled.img<{ $visible: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    object-fit: contain;
    z-index: 2;
    transition: opacity 1.5s ease-in-out;
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: none;
`;

interface WeaverAvatarProps {
    size?: number;
    onClick?: () => void;
    ativo?: boolean;
}

const FALLBACK_IMAGE = '/weaver/animacao1/p1.png';

const WeaverAvatar: React.FC<WeaverAvatarProps> = ({ size = 60, onClick, ativo = true }) => {
    const [gifList, setGifList] = useState<string[]>([]);
    const [currentSrc, setCurrentSrc] = useState(FALLBACK_IMAGE);
    const [nextSrc, setNextSrc] = useState(FALLBACK_IMAGE);
    const [frontVisible, setFrontVisible] = useState(false);

    const ativoRef = useRef(ativo);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Carregar a lista de GIFs disponíveis
    useEffect(() => {
        const fetchGifs = async () => {
            try {
                const response = await fetch('/api/weaver/gifs');
                if (response.ok) {
                    const data = await response.json();
                    if (data.gifs && data.gifs.length > 0) {
                        setGifList(data.gifs);
                        // Define o primeiro GIF como inicial se disponível
                        const first = data.gifs[Math.floor(Math.random() * data.gifs.length)];
                        setCurrentSrc(first);
                    }
                }
            } catch (error) {
                console.error("Failed to load GIFs:", error);
            }
        };
        fetchGifs();
    }, []);

    const pararCiclo = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const transicionarGif = useCallback(async () => {
        if (!ativoRef.current || gifList.length === 0) return;

        // Escolhe um GIF aleatório diferente do atual (se possível)
        let proximoIndex = Math.floor(Math.random() * gifList.length);
        let proximoGif = gifList[proximoIndex];

        // Evita repetir o mesmo GIF se houver mais de um
        if (gifList.length > 1 && proximoGif === currentSrc) {
            proximoIndex = (proximoIndex + 1) % gifList.length;
            proximoGif = gifList[proximoIndex];
        }

        setNextSrc(proximoGif);
        setFrontVisible(true);

        // Espera a transição visual
        await new Promise(r => setTimeout(r, 1700));

        if (!ativoRef.current) return;

        // Troca o fundo para o novo GIF e esconde a frente (reset instantâneo)
        setCurrentSrc(proximoGif);
        setFrontVisible(false); // Fica transparente, revelando o BackLayer que agora é igual

        // Define o tempo para a próxima troca (aleatório entre 10s e 20s)
        const tempoProximaTroca = 10000 + Math.random() * 10000;
        timerRef.current = setTimeout(transicionarGif, tempoProximaTroca);

    }, [gifList, currentSrc]);

    useEffect(() => {
        ativoRef.current = ativo;

        if (ativo && gifList.length > 0) {
            // Inicia o ciclo após um tempo inicial
            const tempoInicial = 5000 + Math.random() * 5000;
            timerRef.current = setTimeout(transicionarGif, tempoInicial);
        } else {
            pararCiclo();
        }

        return () => {
            ativoRef.current = false;
            pararCiclo();
        };
    }, [ativo, gifList, transicionarGif, pararCiclo]);

    return (
        <Container $size={size} onClick={onClick}>
            <BackLayer src={currentSrc} draggable={false} alt="" />
            <FrontLayer
                src={nextSrc}
                $visible={frontVisible}
                draggable={false}
                alt=""
            />
        </Container>
    );
};

export default WeaverAvatar;
