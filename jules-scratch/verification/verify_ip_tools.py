import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # 1. Navigate and create a project
        page.goto("http://localhost:3000/")
        page.get_by_role("button", name="Novo Projeto").click()
        page.get_by_label("Nome do Projeto").fill("Test Project")
        page.get_by_role("button", name="Criar").click()

        # Wait for navigation to the application page
        expect(page).to_have_url(re.compile(r"/aplicacao"))

        # 2. Add an IP target
        # I'll need to figure out how to do this. I'll assume there is a form.
        # Let's assume there is a button to add a new target.
        # This part is a guess and might fail.
        page.get_by_role("button", name="Adicionar Alvo").click()
        page.get_by_label("Endereço IP").fill("127.0.0.1")
        page.get_by_role("button", name="Adicionar").click()

        # 3. Select the IP target and run Nmap
        page.get_by_role("button", name="ip").click() # Switch to IP view
        page.get_by_text("127.0.0.1").click()
        page.get_by_role("button", name="Nmap").click()

        # 4. Wait for results and take screenshot
        # The visualizer should update and show a "Portas" tab.
        expect(page.get_by_text("Portas")).to_be_visible(timeout=60000) # 60s timeout for nmap

        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
