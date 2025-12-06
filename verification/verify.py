import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_default_timeout(60000)

    try:
        print("Navigating to app...")
        page.goto("http://localhost:3000/aplicacao")

        # Wait for page load
        page.wait_for_load_state("networkidle")

        print("Page loaded.")

        # Select Project
        selector_btn = page.get_by_text("Nenhum projeto selecionado")
        if selector_btn.count() > 0:
            print("Clicking project selector...")
            selector_btn.click()
            page.wait_for_timeout(1000)

            # Now click "Projeto de Teste" in the dropdown
            project_link = page.get_by_text("Projeto de Teste")
            if project_link.count() > 0:
                print("Selecting 'Projeto de Teste'...")
                project_link.click()
                page.wait_for_timeout(2000)
            else:
                 print("Project 'Projeto de Teste' NOT found in dropdown.")
        else:
             print("'Nenhum projeto selecionado' button not found. checking if already selected.")
             if page.get_by_text("Projeto de Teste").count() > 0:
                  print("Project already selected.")

        # Try to find "Domínios" (Tree Node)
        # Using exact=True might be safer or get_by_title
        dominios_node = page.get_by_text("Domínios")
        if dominios_node.count() > 0:
             print("Found Domínios node. Expanding...")
             dominios_node.first.click()
             page.wait_for_timeout(2000)
        else:
             print("Domínios node not found. Dumping html...")
             # print(page.content())

        # Click "example.com"
        target_node = page.get_by_text("example.com")
        if target_node.count() > 0:
            print("Found example.com. Clicking...")
            target_node.first.click()
            page.wait_for_timeout(2000)
        else:
            print("example.com not found.")

        # Now Check Inspector
        print("Checking Inspector...")

        # Verify "Busca de IPs"
        busca_ips = page.get_by_text("Busca de IPs")
        if busca_ips.count() > 0:
             print("SUCCESS: Found 'Busca de IPs'.")
        else:
             print("FAILURE: 'Busca de IPs' not found.")

        # Verify absence of "Resolução e DNS"
        dns_group = page.get_by_text("Resolução e DNS")
        if dns_group.count() == 0:
             print("SUCCESS: 'Resolução e DNS' is gone.")
        else:
             print("FAILURE: 'Resolução e DNS' is still present.")

        # Take final screenshot
        os.makedirs("/home/jules/verification", exist_ok=True)
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Final screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="/home/jules/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
