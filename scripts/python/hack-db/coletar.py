import argparse
import json
import sys
import cfscrape
from bs4 import BeautifulSoup

def coletar(dominio: str, paginas: int):
    raspador = cfscrape.create_scraper()
    alvo = dominio.lower()
    espelhos = []
    for indice in range(1, paginas + 1):
        resposta = raspador.get(f"https://hack-db.org/archive/{indice}", timeout=60)
        sopa = BeautifulSoup(resposta.text, "html.parser")
        tabela = sopa.find("table", class_=lambda valor: valor and "table-centered" in valor)
        corpo = tabela.tbody if tabela else None
        if not corpo:
            break
        for linha in corpo.find_all("tr"):
            celula_url = linha.find("td", class_="td_url")
            link = celula_url.find("a") if celula_url else None
            destino = (link.text or "").strip().lower() if link else ""
            if alvo not in destino:
                continue
            href = link.get("href") if link else None
            if not href:
                continue
            espelho = f"https://hack-db.org/{href.lstrip('/')}"
            if espelho not in espelhos:
                espelhos.append(espelho)
    return espelhos

def principal():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dominio", required=True)
    parser.add_argument("--paginas", type=int, default=10)
    args = parser.parse_args()
    try:
        paginas = args.paginas if args.paginas and args.paginas > 0 else 10
        resultado = coletar(args.dominio, paginas)
        sys.stdout.write(json.dumps(resultado))
    except Exception as erro:
        sys.stderr.write(str(erro))
        sys.exit(1)

if __name__ == "__main__":
    principal()
