const BASE = 'http://localhost:5173'

const MOCK_USER = {
  uid: 'test-user-123',
  id: 'test-user-123',
  displayName: 'Usuario Test',
  email: 'test@example.com',
  user_metadata: { full_name: 'Usuario Test' },
}

async function mockAuth(page) {
  // Inject mock user BEFORE any page scripts run
  await page.addInitScript(user => {
    // Set the mock user early so AuthContext can pick it up
    window.__PW_MOCK_USER__ = user
    // Also set for any other checks
    localStorage.setItem('test_auth_user', JSON.stringify(user))
  }, MOCK_USER)
  
  // Navigate to the page AFTER setting the init script
  // The init script will run on every navigation
}

async function takeScreenshot(page, name) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
}

async function checkPageLoad(page, path, name) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const hasContent = await page.evaluate(() => document.body.innerText.length > 50)
  const hasError = await page.evaluate(() =>
    document.querySelector('[role="alert"]') !== null ||
    document.body.innerText.includes('Cannot read properties') ||
    document.body.innerText.includes('undefined is not')
  )
  return { name, path, ok: hasContent && !hasError }
}

export { BASE, MOCK_USER, mockAuth, takeScreenshot, checkPageLoad }
