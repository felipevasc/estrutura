
import os
from playwright.sync_api import sync_playwright, expect

def verify_deface_ui(page):
    print("Navigating to application...")
    page.goto("http://localhost:3000/aplicacao", timeout=60000)

    # Handle initial modal
    print("Handling modal...")
    try:
        page.wait_for_selector(".ant-modal-content", state="visible", timeout=10000)
        page.keyboard.press("Escape")
        page.wait_for_selector(".ant-modal-content", state="hidden", timeout=5000)
        print("Modal closed via Escape.")
    except:
        print("Modal interaction issue or no modal.")
        if page.is_visible(".ant-modal-wrap"):
             print("Forcing removal of modal overlay via JS...")
             page.evaluate("document.querySelectorAll('.ant-modal-root').forEach(e => e.remove())")

    print("Navigating to CTI module...")
    page.get_by_role("button", name="CTI").click(force=True)

    # Wait for content to load
    page.wait_for_selector("text=Resultados da Verificação de Deface", timeout=30000)

    print("Verifying Tool List...")
    # Check if "Dork [Assinaturas]" button exists
    expect(page.get_by_role("button", name="Dork [Assinaturas]")).to_be_visible()

    print("Verifying Configuration Modal...")
    page.screenshot(path="verification/deface_view.png")

    # Click the setting button next to Assinaturas.
    # We select the first setting icon available which should be for the first item
    page.locator(".anticon-setting").first.click()

    # Wait for modal
    expect(page.get_by_text("Configurar Dorks: assinaturas")).to_be_visible()

    # Check if textarea contains content
    textarea = page.locator("textarea")
    # Need to wait for value to be populated
    page.wait_for_timeout(1000)
    val = textarea.input_value()
    print(f"Textarea value: {val[:20]}...")
    if "Owned by" not in val:
        raise Exception("Textarea does not contain expected value")

    print("Taking screenshot of modal...")
    page.screenshot(path="verification/deface_config_modal.png")

    print("Closing modal...")
    page.get_by_role("button", name="Cancel").click()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_deface_ui(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()
