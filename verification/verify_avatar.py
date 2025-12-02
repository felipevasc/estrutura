from playwright.sync_api import sync_playwright, expect
import time

def verify_avatar(page):
    print("Navigating to application...")
    page.goto("http://localhost:3000/aplicacao", timeout=60000)

    print("Waiting for page to load...")
    # Wait for the chat avatar container (WeaverAvatar uses a specific styled component structure)
    # Based on the code, it's inside the Chat component.
    # The Chat component usually has a floating button.
    # The code for WeaverAvatar has a Container styled component.
    # Let's look for an image with src containing '/weaver/'

    # Wait for the avatar to appear
    avatar_img = page.locator('img[src*="/weaver/"]').first
    print("Waiting for avatar image...")
    expect(avatar_img).to_be_visible(timeout=30000)

    # Take initial screenshot
    print("Taking initial screenshot...")
    page.screenshot(path="verification/avatar_initial.png")

    # Wait a bit to see if the image changes or if the API was called.
    # Since we added 'test_copy.gif', and the code randomizes, it might switch to it.
    # The interval in the code is random (5s initial + random).

    print("Waiting for potential transition...")
    time.sleep(10) # wait 10 seconds

    print("Taking second screenshot...")
    page.screenshot(path="verification/avatar_later.png")

    # Check if the test gif is loaded in the DOM (hidden or visible)
    # The component preloads or sets state.
    # We can check if any img src contains 'test_copy.gif'

    test_gif = page.locator('img[src*="test_copy.gif"]').first
    if test_gif.count() > 0:
        print("Found the test GIF in the DOM!")
    else:
        print("Test GIF not found in DOM yet (might be unlucky with random pick or API failed).")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        try:
            verify_avatar(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
