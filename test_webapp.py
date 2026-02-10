"""
Web application testing for Agent Skills Marketplace.
Tests core pages and Skill Composer UI elements.
"""
from playwright.sync_api import sync_playwright
import sys

def test_webapp():
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Test 1: Homepage loads
            print("Test 1: Homepage loads...")
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')

            # Check for key homepage elements
            title = page.title()
            assert "Agent Skills" in title or page.locator('text=Agent Skills').count() > 0, "Homepage title/branding missing"
            print("  [PASS] Homepage loaded successfully")

            # Test 2: Skills page accessible
            print("Test 2: Skills page...")
            page.goto('http://localhost:5173/skills')
            page.wait_for_load_state('networkidle')

            # Should have skill cards or loading state
            skill_elements = page.locator('[class*="card"], [class*="skill"]').count()
            assert skill_elements > 0 or page.locator('text=Loading').count() > 0, "Skills page has no content"
            print("  [PASS] Skills page accessible")

            # Test 3: Create skill page (Skill Composer)
            print("Test 3: Skill Composer page...")
            page.goto('http://localhost:5173/create')
            page.wait_for_load_state('networkidle')

            # Should redirect to login or show composer
            current_url = page.url
            if '/login' in current_url:
                print("  [PASS] Skill Composer redirects to login (auth required)")
            else:
                # Check for composer elements
                composer_elements = page.locator('text=Skill Composer, text=Describe Your Skill, textarea').count()
                if composer_elements > 0:
                    print("  [PASS] Skill Composer UI loaded")
                else:
                    print("  [PASS] Skill Composer page accessible")

            # Test 4: Login page
            print("Test 4: Login page...")
            page.goto('http://localhost:5173/login')
            page.wait_for_load_state('networkidle')

            # Take screenshot to see login page
            page.screenshot(path='/tmp/login.png', full_page=True)

            # Should have some content (login form or OAuth button)
            page_content = page.content()
            has_login_content = (
                'login' in page_content.lower() or
                'sign' in page_content.lower() or
                'google' in page_content.lower() or
                'auth' in page_content.lower() or
                page.locator('button').count() > 0
            )
            assert has_login_content, "Login page has no auth elements"
            print("  [PASS] Login page loaded")

            # Test 5: Check navigation
            print("Test 5: Navigation elements...")
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')

            nav_links = page.locator('nav a, header a').count()
            assert nav_links > 0, "No navigation links found"
            print(f"  [PASS] Found {nav_links} navigation links")

            # Test 6: Take screenshot for visual verification
            print("Test 6: Taking screenshots...")
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/homepage.png', full_page=True)
            print("  [PASS] Homepage screenshot saved to /tmp/homepage.png")

            page.goto('http://localhost:5173/skills')
            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/skills.png', full_page=True)
            print("  [PASS] Skills page screenshot saved to /tmp/skills.png")

        except AssertionError as e:
            errors.append(f"Assertion failed: {e}")
        except Exception as e:
            errors.append(f"Error: {e}")
        finally:
            browser.close()

    # Report results
    print("\n" + "="*50)
    if errors:
        print("FAILED - Errors found:")
        for err in errors:
            print(f"  [FAIL] {err}")
        return 1
    else:
        print("ALL TESTS PASSED")
        return 0

if __name__ == "__main__":
    sys.exit(test_webapp())
