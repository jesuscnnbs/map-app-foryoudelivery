export default async function run(page) {
  const theme = await page.evaluate(() => {
    const header = document.querySelector('header')
    const logo = document.querySelector('header img')
    return {
      headerBg: header ? getComputedStyle(header).backgroundColor : null,
      headerText: header ? getComputedStyle(header).color : null,
      logoSrc: logo ? logo.getAttribute('src') : null,
    }
  })

  await page.setInputFiles('input[type=file]', '/tmp/test-ruta.xlsx')
  await page.getByText('Selecciona la ruta').waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: /^1\b/ }).first().click()
  await page.waitForSelector('.leaflet-container', { timeout: 15000 })
  await page.waitForTimeout(2000)

  const readView = () =>
    page.evaluate(() => {
      const pane = document.querySelector('.leaflet-map-pane')
      return pane ? pane.style.transform : null
    })

  const before = await readView()
  const marker = page.locator('.stop-marker').filter({ hasText: '2' }).first()
  await marker.click()
  await page.waitForTimeout(1200)
  const after = await readView()

  const active = await page.evaluate(
    () => document.querySelectorAll('.stop-marker--active').length,
  )

  return {
    theme,
    viewUnchanged: before === after,
    before,
    after,
    active,
  }
}
