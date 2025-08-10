const useFerramentas = () => {
    const executeAmass = async (idDominio: number) => {

        const res = await fetch(`/api/v1/ferramentas/domain/amass`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dominio: idDominio
            }),
        });
        const data = await res.json();
        return data;
    }
    const executeSubfinder = async (idDominio: number) => {

        const res = await fetch(`/api/v1/ferramentas/domain/subfinder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dominio: idDominio
            }),
        });
        const data = await res.json();
        return data;
    }
    const executeNmap = async (idIp: number) => {
        const res = await fetch(`/api/v1/ferramentas/ip/nmap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ip: idIp
            }),
        });
        const data = await res.json();
        return data;
    }

    const executeEnum4linux = async (idIp: number) => {
        const res = await fetch(`/api/v1/ferramentas/ip/enum4linux`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ip: idIp
            }),
        });
        const data = await res.json();
        return data;
    }

    return {
        executeAmass,
        executeSubfinder,
        executeNmap,
        executeEnum4linux
    }
}

export default useFerramentas;