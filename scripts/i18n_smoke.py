"""Real-origin bilingual smoke test. Set CHROMASECRET_URL for a deployed site.
--injected is a sandbox-only fallback: its storage is mocked and is not origin QA.
"""
import argparse
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--injected', action='store_true')
args = parser.parse_args()
url = os.environ.get('CHROMASECRET_URL', 'http://127.0.0.1:5173/')
checks = []

def check(condition, label):
    if not condition:
        raise AssertionError(label)
    checks.append(label)

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_EXECUTABLE'):
        options['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**options)
    for browser_locale, initial in [('en-US', 'en'), ('zh-CN', 'zh-CN')]:
        context = browser.new_context(locale=browser_locale, viewport={'width':1440, 'height':1000}, reduced_motion='reduce', accept_downloads=True)
        page = context.new_page()
        errors = []
        requests = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: requests.append(request.url) if request.url.startswith(('http://','https://')) else None)
        if args.injected:
            page.evaluate("Object.defineProperty(window,'localStorage',{value:{data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=String(v)},removeItem(k){delete this.data[k]}}})")
            page.set_content((ROOT/'index.html').read_text())
        else:
            response = page.goto(url, wait_until='networkidle')
            check(response is not None and response.status == 200, f'{browser_locale}: unauthenticated HTTP 200')
        expect(page.locator('html')).to_have_attribute('lang', initial)
        check(True, f'{browser_locale}: browser locale detected')
        alternate = 'zh-CN' if initial == 'en' else 'en'
        page.locator('.language-toggle').click()
        expect(page.locator('html')).to_have_attribute('lang', alternate)
        check(page.evaluate("localStorage.getItem('chromasecret.locale')") == alternate, f'{browser_locale}: locale preference written')
        if not args.injected:
            page.reload(wait_until='networkidle')
            expect(page.locator('html')).to_have_attribute('lang', alternate)
            check(True, f'{browser_locale}: native preference survives reload')
        page.locator('.language-toggle').click()
        expect(page.locator('html')).to_have_attribute('lang', initial)
        request_baseline = len(requests)
        page.get_by_role('button', name='Start calibration' if initial=='en' else '开始校准').click()
        titles = ['Set the scene.', 'Map your perception.', 'Let your eyes lead.', 'Write between the colors.', 'Put it to the test.'] if initial=='en' else ['先把观察条件设好。','描绘你的色彩感知。','让你的眼睛来决定。','把文字写进色彩之间。','真正测试它。']
        for index, title in enumerate(titles, start=1):
            page.locator('.session-nav nav button').nth(index).click()
            expect(page.locator('h1')).to_have_text(title)
            check(True, f'{browser_locale}: stage {index} title translated')
            page.set_viewport_size({'width':390,'height':844})
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'{browser_locale}: stage {index} mobile overflow absent')
            page.set_viewport_size({'width':1440,'height':1000})
        page.locator('.session-nav nav button').nth(4).click()
        authored = '私密QA7926\nhey meow'
        page.locator('textarea').fill(authored)
        page.locator('.language-toggle').click()
        expect(page.locator('html')).to_have_attribute('lang', alternate)
        expect(page.locator('textarea')).to_have_value(authored)
        page.locator('.language-toggle').click()
        expect(page.locator('textarea')).to_have_value(authored)
        check(True, f'{browser_locale}: authored Unicode preserved across switches')
        page.locator('.studio-controls button.primary').click()
        expect(page.locator('.studio-controls button.primary')).to_be_enabled(timeout=60000)
        expect(page.locator('.plate-stage canvas').first).to_be_visible()
        check(True, f'{browser_locale}: generator completed')
        check(not page.evaluate("JSON.stringify(localStorage).includes('私密QA7926')"), f'{browser_locale}: authored text excluded from storage')
        with page.expect_download() as info:
            page.get_by_role('button', name='Export PNG' if initial=='en' else '导出 PNG', exact=True).click()
        download = info.value
        target = ROOT/'test-results'/f'{browser_locale}.png'
        target.parent.mkdir(exist_ok=True)
        download.save_as(str(target))
        check(target.read_bytes().startswith(b'\x89PNG\r\n\x1a\n'), f'{browser_locale}: valid PNG export')
        check(len(requests)==request_baseline, f'{browser_locale}: no runtime network requests during interaction')
        check(not errors, f'{browser_locale}: no JavaScript errors: {errors}')
        page.set_viewport_size({'width':390,'height':844})
        page.screenshot(path=str(ROOT/'test-results'/f'{browser_locale}-mobile.png'), full_page=True)
        context.close()
    browser.close()

report = {'mode':'injected; mocked storage' if args.injected else 'real origin; native storage', 'url':None if args.injected else url, 'passed':len(checks), 'checks':checks}
(ROOT/'test-results').mkdir(exist_ok=True)
(ROOT/'test-results'/'i18n-smoke.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps(report, ensure_ascii=False, indent=2))
