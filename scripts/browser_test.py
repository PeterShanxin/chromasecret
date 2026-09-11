"""Browser workflow checks, not participant data or a perception validation.
Managed sandbox blocks navigation, so the self-contained HTML is inserted with
set_content. Storage is explicitly mocked in the main run. Nothing is exported
into the app's default profile. Test-only instrumentation exposes React state
for synthetic answer selection; production bundles have no such hook.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, struct, hashlib, time

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
RENDER="ReactDOM.render(React.createElement(App, null), document.getElementById('root'));"
INSTRUMENTED=HTML.replace(RENDER,"window.__testApp = "+RENDER)
MOCK="""<script>window.__testStore={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__testStore[k]||null,setItem:(k,v)=>window.__testStore[k]=v,removeItem:k=>delete window.__testStore[k]},configurable:true});window.__workerCount=0;const RealWorker=window.Worker;window.Worker=class extends RealWorker{constructor(...args){super(...args);window.__workerCount++}};</script>"""
checks=[]
def check(name, condition):
    if not condition: raise AssertionError(name)
    checks.append(name)
    print('PASS',name,flush=True)

def wait(page, expression):
    for _ in range(400):
        if page.evaluate(expression): return
        page.wait_for_timeout(100)
    raise TimeoutError(expression)

def settle(page):
    wait(page, "window.__testApp && !window.__testApp.state.busy")
    page.wait_for_timeout(50)

def nav(page, label):
    page.get_by_role('navigation', name='Experiment stages').get_by_role('button',name=label).click()

def state(page, expr): return page.evaluate('window.__testApp.'+expr)

def answer(page, text):
    page.get_by_label('What do you see?',exact=True).fill(text)
    page.wait_for_timeout(220)
    page.get_by_role('button',name='Record response',exact=False).click()

def chunks(data):
    assert data[:8]==b'\x89PNG\r\n\x1a\n'
    p=8;out=[]
    while p<len(data):
        n=struct.unpack('>I',data[p:p+4])[0];typ=data[p+4:p+8].decode('ascii');out.append(typ);p+=n+12
    return out

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1080},device_scale_factor=1,accept_downloads=True)
    errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    page.set_content(INSTRUMENTED.replace('<body>','<body>'+MOCK),wait_until='load')
    check('Welcome and no fabricated recognition statistics',page.get_by_text('Some messages live').count()==1 and '94%' not in page.inner_text('body'))
    (ROOT/'docs/screenshots').mkdir(exist_ok=True)
    page.screenshot(path=str(ROOT/'docs/screenshots/01-home-desktop.png'),full_page=True)
    page.get_by_role('button',name='The science').click()
    check('Science modal distinguishes calibration and diagnosis',page.get_by_role('dialog').get_by_text('Four separate claims').count()==1)
    page.keyboard.press('Escape')
    check('Modal Escape closes and restores focus',page.get_by_role('dialog').count()==0 and page.get_by_role('button',name='The science').evaluate('(e)=>e===document.activeElement'))
    page.get_by_role('button',name='Start calibration').click()
    page.get_by_label('Display name',exact=True).fill('Automated test display - not participant data')
    page.get_by_label('Night Light, Eye Comfort').check()
    page.get_by_label('Browser zoom is 100%').check()
    page.get_by_role('button',name='Continue',exact=False).click()
    page.get_by_role('button',name='Black patch 8',exact=True).click()
    page.get_by_role('button',name='Continue',exact=False).click()
    page.get_by_role('button',name='White patch 247',exact=True).click()
    page.get_by_role('button',name='Continue',exact=False).click()
    for i in range(3):
        page.get_by_role('slider',name='Solid patch level').fill('186')
        ratio=page.locator('.dither-canvas').evaluate('(c)=>[c.width,c.getBoundingClientRect().width,window.devicePixelRatio]')
        check(f'Gray match {i+1} uses device-pixel raster',abs(ratio[0]-ratio[1]*ratio[2])<=1)
        if i==0: page.screenshot(path=str(ROOT/'docs/screenshots/03-display-desktop.png'),full_page=True)
        page.get_by_role('button',name='Record match').click()
    for i in range(3):
        page.get_by_role('slider',name='Solid patch level').fill(str(185+i))
        page.get_by_role('button',name='Record channel match').click()
    page.get_by_role('button',name='The steps are distinct').click()
    page.get_by_role('button',name='Save perceptual profile').click()
    d=state(page,'state.profile.display')
    check('Seven display stages completed and stored',d['confirmed'] and len(d['midpoints'])==3 and d['channelMidpoints']==[185,186,187])
    check('Gamma-like estimate and quality bounded',2<d['gamma']<2.3 and d['quality']=='reasonable')
    page.get_by_role('button',name='Continue to vision assessment').click()
    page.get_by_role('button',name='Begin assessment').click()
    for i in range(36):
        t=state(page,'state.assessCurrent')
        # Synthetic scripted answers exercise bookkeeping. Not machine vision or a real observer.
        correct=t['axis']=='catch' or i%3!=0
        side=t['side'] if correct else 1-t['side']
        page.wait_for_timeout(210)
        page.get_by_role('button',name='Left' if side==0 else 'Right',exact=False).click()
    v=state(page,'state.profile.vision')
    check('36 assessment responses, seeds, timings retained',len(v['trials'])==36 and all(t['rt']>=180 for t in v['trials']))
    check('Three interleaved axes plus catch trials',set(t['axis'] for t in v['trials'])=={'protan','deutan','tritan','catch'})
    check('Tentative model result and interval, never diagnosis',v['source']=='measured' and v['confidence'] in ['limited','moderate'] and len(v['severityInterval'])==2)
    page.get_by_role('button',name='Personalize the camouflage').click()
    for i in range(12):
        page.get_by_role('button',name='Start blind calibration' if i==0 else 'Next blinded candidate',exact=False).click()
        settle(page)
        wait(page,'window.__testApp.state.personalActive')
        expected=state(page,'state.personalExpected')
        check(f'Blind candidate {i+1} input starts empty',page.locator('#trial-response').input_value()=='')
        answer(page,expected if i%4!=0 else 'WRONG')
    personal=state(page,'state.profile.personal')
    check('12 raw optimization responses with blank controls',len(personal)==12 and sum(t['blank'] for t in personal)==2)
    check('Empirical history preserves positive and negative responses',any(t['correct'] for t in personal) and any(not t['correct'] for t in personal))
    page.get_by_role('button',name='Open message studio').click()
    page.get_by_label('Your message',exact=True).fill('hey meow\n你好，世界')
    exports=[]
    for family in ['dots','mosaic','noise','microdots']:
        page.get_by_label('Pattern',exact=True).select_option(family)
        page.get_by_role('button',name='Generate color field').click();settle(page)
        check(f'{family} renders bilingual multiline input',state(page,'state.current.family')==family and state(page,'state.renderText')=='hey meow\n你好，世界')
        raw=page.locator('.active-plate canvas').evaluate('(c)=>c.toDataURL()')
        page.get_by_role('button',name='Invert',exact=True).click()
        page.get_by_role('button',name='Invert',exact=True).click()
        check(f'{family} seeded raster reproducibility',raw==page.locator('.active-plate canvas').evaluate('(c)=>c.toDataURL()'))
    page.get_by_label('Export size',exact=True).select_option('custom')
    page.get_by_label('Width',exact=True).fill('640');page.get_by_label('Height',exact=True).fill('400')
    # Export must always be original, even when an attack view is active.
    page.get_by_label('Inspect for leaks',exact=True).select_option('red')
    with page.expect_download() as info:page.get_by_role('button',name='Export PNG',exact=True).click()
    data=Path(info.value.path()).read_bytes()
    png_chunks=chunks(data)
    check('Export is a genuine 640x400 PNG',struct.unpack('>II',data[16:24])==(640,400))
    check('No PNG plaintext metadata chunks',not(set(png_chunks)&{'tEXt','zTXt','iTXt'}) and b'hey meow' not in data)
    # A second export from Original must match byte-for-byte.
    page.get_by_label('Inspect for leaks',exact=True).select_option('original')
    with page.expect_download() as info:page.get_by_role('button',name='Export PNG',exact=True).click()
    check('Export ignores attack-view selection',data==Path(info.value.path()).read_bytes())
    for view in ['grayscale','red','green','blue','saturation','contrast','target','original']:
        page.get_by_label('Inspect for leaks',exact=True).select_option(view)
        check(f'{view} inspection view renders',page.locator('.active-plate canvas').count()==1)
    page.get_by_role('button',name='Open research views').click()
    check('Six research simulations plus raster diagnostics',page.locator('.simulation-grid canvas').count()==6 and state(page,'state.audit') is not None)
    page.get_by_role('button',name='Fullscreen').click()
    check('Fullscreen opens or gives explicit fallback',page.evaluate('!!document.fullscreenElement') or 'Fullscreen is unavailable' in page.inner_text('body'))
    if page.evaluate('!!document.fullscreenElement'):page.evaluate('document.exitFullscreen()')
    page.get_by_role('button',name='Verify with blinded trials').click()
    check('Human verification metrics initially unmeasured',page.get_by_text('Not measured',exact=True).count()>=3)
    for role in ['target','control']:
        page.get_by_role('button',name='Test target participant' if role=='target' else 'Test a typical-vision control').click()
        for i in range(10):
            wait(page,'window.__testApp.state.verifyCurrent!==null')
            c=state(page,'state.verifyCurrent')
            # Completely synthetic scripted response fixture.
            correct=role=='target' or int(c['id'].split('-')[-1])%3==0
            answer(page,c['expected'] if correct else ('FALSE' if c['absent'] else 'WRONG'))
        wait(page,'window.__testApp.state.verifyDone')
    verified=state(page,'state.profile.verified')
    target=[x for x in verified if x['role']=='target'];control=[x for x in verified if x['role']=='control']
    check('Paired blinded battery has 20 raw responses',len(target)==len(control)==10)
    check('Control uses same plate IDs/seeds but different order',set((x['id'],x['seed']) for x in target)==set((x['id'],x['seed']) for x in control) and [x['id'] for x in target]!=[x['id'] for x in control])
    check('All seven perturbations tested on nonblank strings',set(x['condition'] for x in target if not x['absent'])=={'original','brightness+','brightness-','contrast+','contrast-','small','jpeg'})
    check('Stats count strings separately from blanks',state(page,"stats('target').n")==8 and state(page,"stats('target').absent.length")==2)
    page.get_by_role('button',name='Start a new battery').click()
    check('New battery resets displayed stats but retains raw history',state(page,"stats('target').n")==0 and len(state(page,'state.profile.verified'))==20)
    stored=page.evaluate("JSON.parse(window.__testStore['chromasecret.v1'])")
    check('Mock storage serialization excludes authored secret', '你好' not in json.dumps(stored,ensure_ascii=False) and len(stored['personal'])==12)
    check('One worker reused for optimization',page.evaluate('window.__workerCount')==1 and len(page.workers)==1)
    check('No application JavaScript errors',not errors)
    check('No network requests during local workflow',not [x for x in requests if x.startswith(('http:','https:'))])
    # Fresh demo screenshots do not display synthetic fixture performance as human results.
    fresh=browser.new_page(viewport={'width':1440,'height':1080})
    fresh.set_content(INSTRUMENTED,wait_until='load')
    fresh.get_by_role('button',name='Explore the demo').click();settle(fresh)
    fresh.get_by_label('Pattern',exact=True).select_option('dots')
    fresh.get_by_role('button',name='Generate color field').click();settle(fresh)
    fresh.screenshot(path=str(ROOT/'docs/screenshots/02-studio-desktop.png'),full_page=True)
    check('Blocked native storage degrades to memory',fresh.get_by_text('Browser storage is unavailable.',exact=False).count()==1)
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    mobile.set_content(INSTRUMENTED,wait_until='load')
    mobile.screenshot(path=str(ROOT/'docs/screenshots/04-home-mobile.png'),full_page=True)
    check('Mobile welcome has no page overflow',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    mobile.get_by_role('button',name='Start calibration').click()
    for i in range(3):mobile.get_by_role('button',name='Continue',exact=False).click()
    ratio=mobile.locator('.dither-canvas').evaluate('(c)=>[c.width,c.getBoundingClientRect().width,window.devicePixelRatio]')
    check('Mobile dither respects DPR without CSS resampling',abs(ratio[0]-ratio[1]*ratio[2])<=1)
    mobile.get_by_role('navigation',name='Experiment stages').get_by_role('button',name='Create').click()
    mobile.get_by_role('button',name='Generate color field').click();settle(mobile)
    mobile.screenshot(path=str(ROOT/'docs/screenshots/05-studio-mobile.png'),full_page=True)
    check('Mobile studio has no page overflow',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    fallback=browser.new_page(viewport={'width':1200,'height':900})
    fallback.set_content(INSTRUMENTED.replace('<body>','<body><script>window.Worker=undefined;</script>'),wait_until='load')
    fallback.get_by_role('button',name='Explore the demo').click();settle(fallback)
    check('Optimizer works when workers are unavailable',state(fallback,'state.current.seed')!=809621 and not state(fallback,'state.busy'))
    fallback.get_by_role('button',name='Copy image',exact=True).click();settle(fallback)
    check('Unavailable clipboard is reported without crashing',bool(state(fallback,'state.note')) and not state(fallback,'state.error'))
    nav(page,'Display')
    page.get_by_role('button',name='Restart perceptual setup').click()
    check('Display recalibration can restart without losing old saved profile',state(page,'state.calStep')==0 and state(page,'state.display.midpoints')==[] and state(page,'state.profile.display.confirmed'))
    page.get_by_role('button',name='Local data and privacy',exact=True).click()
    page.get_by_role('button',name='Erase local data',exact=True).click()
    page.get_by_role('button',name='Erase local data',exact=True).click()
    check('Erase clears local history and returns to fresh welcome',state(page,'state.session')==0 and not state(page,'state.profile.personal') and page.evaluate("window.__testStore['chromasecret.v1']===undefined"))
    result={'status':'passed','checks':checks,'count':len(checks),'js_errors':errors,'http_requests':0,'storage':'Mocked for main workflow; blocked-native-storage fallback tested separately. Native persistent origin storage not tested here.','vision_validation':'None. All answers were scripted synthetic fixtures, not human judgments.','png_chunks':png_chunks,'browser':browser.version}
    (ROOT/'docs/browser-results.json').write_text(json.dumps(result,indent=2))
    browser.close()
print(f'Completed {len(checks)} browser assertions.')
