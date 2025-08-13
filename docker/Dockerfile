FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN set -eux; \
    apt-get update; \
    apt-get -y full-upgrade; \
    apt-get install -y --no-install-recommends \
        kali-linux-default \
        kali-tools-top10 \
        kali-tools-information-gathering \
        kali-tools-vulnerability \
        kali-tools-web \
        kali-tools-passwords \
        kali-tools-exploitation \
        kali-tools-post-exploitation \
        nmap masscan gobuster sqlmap wfuzz nikto \
        john hashcat \
        crackmapexec impacket-scripts evil-winrm responder bloodhound-python \
        git curl wget ca-certificates \
        python3 python3-pip python3-venv pipx \
        iproute2 iputils-ping net-tools dnsutils \
        smbclient freerdp2-x11 \
        seclists wordlists \
        metasploit-framework \
        tmux vim nano \
    ; \
    python3 -m pip install --no-cache-dir --upgrade pip; \
    if [ -f /usr/share/wordlists/rockyou.txt.gz ]; then gzip -d /usr/share/wordlists/rockyou.txt.gz; fi; \
    apt-get clean; rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash kali && \
    echo "kali ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/kali && \
    chmod 0440 /etc/sudoers.d/kali

USER kali
WORKDIR /home/kali

RUN mkdir -p /home/kali/tools /data

ENTRYPOINT ["/bin/bash"]