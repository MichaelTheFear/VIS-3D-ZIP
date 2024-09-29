import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        # Launch the browser (set headless=False if you want to see the browser action)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        # Navigate to your website
        page.goto("http://localhost:5173/")  # Replace with your actual website URL

        # Wait for 1 minute to allow the page to load completely
        print("Waiting for 1:30 minute to let the page load completely...")
        time.sleep(90)

        # Loop until the input value becomes empty
        while True:
            # Wait for the input element to be available
            input_selector = 'input[aria-labelledby="lil-gui-name-1"]'
            page.wait_for_selector(input_selector)
            input_element = page.query_selector(input_selector)
            input_value = input_element.input_value()
            
            # Break the loop if the input value is empty
            if not input_value or input_value == '.':
                print("Input value is empty. Exiting loop.")
                break
            
            # Take a screenshot and save it with the input value as the filename
            screenshot_filename = f"../photos/basic/{input_value}.png"
            page.screenshot(path=screenshot_filename)
            print(f"Screenshot saved as {screenshot_filename}")
            
            # Click the button with id="lil-gui-name-2"
            button_selector = '#lil-gui-name-2'
            page.click(button_selector)
            
            # Wait for the input value to change after clicking the button
            page.wait_for_function(
                """(oldValue) => {
                    const input = document.querySelector('input[aria-labelledby="lil-gui-name-1"]');
                    return input && input.value !== oldValue;
                }""",
                arg=input_value,
                timeout=10000  # Adjust the timeout if necessary
            )
        
        # Close the browser context and browser
        context.close()
        browser.close()
        print("Process completed.")

if __name__ == '__main__':
    main()
