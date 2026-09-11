export type Locale='en'|'zh-CN';

const STORAGE_KEY='chromasecret.locale';
let locale:Locale='en';
let observer:MutationObserver|null=null;
let applying=false;
const textOriginal=new WeakMap<Text,string>();
const attrOriginal=new WeakMap<Element,Map<string,string>>();

const zh:Record<string,string>={
  'Welcome':'欢迎','Display':'显示器','Vision':'色觉','Personalize':'个性化','Create':'生成','Verify':'验证',
  'A different way to see.':'另一种看见方式。','Set the scene.':'先把观察条件设好。','Map your perception.':'描绘你的色彩感知。','Let your eyes lead.':'让你的眼睛来决定。','Write between the colors.':'把文字写进色彩之间。','Put it to the test.':'真正测试它。',
  'Begin here':'从这里开始','Perceptual setup':'感知校准','Exploratory assessment':'探索性色觉评估','Differential calibration':'差异可见性校准','Message studio':'秘密消息工作台','Blinded verification':'盲法验证',
  'A PERSONAL PERCEPTION EXPERIMENT':'个性化视觉感知实验','A different':'另一种','way to':'看见','see.':'方式。','Some messages live':'有些信息藏在','between the colors.':'色彩之间。',
  "We'll learn how you see color on this screen, then search for patterns that are easier for you to see than for people with typical color vision.":'我们会先了解你在这块屏幕上如何感知颜色，再搜索对你更容易辨认、而对典型色觉观察者更难看清的视觉模式。',
  'Start calibration  ↗':'开始校准  ↗','Explore the demo':'直接体验演示','No account. No uploads. Your responses stay here.':'无需账号，不上传数据。你的回答只保存在本机。',
  'One image. Different perceptions.':'同一张图，不同的感知。','SPECIMEN 001':'样本 001','Procedural camouflage / unvalidated':'程序生成的视觉伪装 / 尚未验证',
  'An advantage.':'追求优势。','Not a guarantee.':'不是保证。',
  "We're testing a perceptual effect, not making an unbreakable secret. People and displays vary. Invisibility to every other viewer cannot be guaranteed.":'我们测试的是一种感知优势，而不是无法破解的秘密。人与显示器都存在差异，因此无法保证所有其他观察者都完全看不见。',
  'BEFORE YOU BEGIN':'开始之前','Use this device throughout. Choose steady, moderate room lighting and 100% browser zoom. Turn off Night Light, Eye Comfort, HDR and accessibility color filters. Keep brightness fixed.':'整个实验请使用同一设备。保持稳定、适中的环境光，并将浏览器缩放设为 100%。关闭夜间模式、护眼模式、HDR 和辅助功能中的颜色滤镜，并保持屏幕亮度不变。',
  'This is device-specific perceptual setup, not hardware colorimetry or a clinical vision test.':'这是针对当前设备的感知校准，不是硬件色度测量，也不是临床色觉检查。',
  'THE EXPERIMENT':'实验流程','Prepare your screen':'准备屏幕','Learn your responses':'学习你的实际反应','Find a personal signal':'寻找个体化信号','Test with another viewer':'用另一位观察者验证',
  'YOUR SESSION':'你的流程','CURRENT PROFILE':'当前档案','Exploration mode':'探索模式','Display not yet checked':'尚未检查显示器',
  'The science ↗':'科学原理 ↗','Local by design':'本地优先设计','Local data & privacy ↗':'本地数据与隐私 ↗','Chromasecret home':'Chromasecret 首页','Local data and privacy':'本地数据与隐私',
  'Viewing conditions':'观察条件','Black level':'黑位','White level':'白位','Midtone match':'中间调匹配','Channel response':'通道响应','Gamut sanity':'色域合理性检查','Your display profile':'你的显示器感知档案',
  'This setup records what you can distinguish here. It cannot measure screen spectra, physical luminance or an ICC profile.':'这一步记录你在当前屏幕和环境下实际能区分什么。它无法测量显示器光谱、物理亮度或 ICC 色彩配置。',
  'Display name':'显示器名称','Built-in':'内置屏幕','External':'外接显示器','Room lighting':'环境光','Moderate / steady':'适中 / 稳定','Dim':'偏暗','Bright / glare':'偏亮 / 有眩光','Brightness setting, if known':'屏幕亮度（若知道）','e.g. 50%, kept fixed':'例如 50%，之后保持不变',
  'Browser zoom is 100%. Brightness will stay fixed.':'浏览器缩放为 100%，并会保持屏幕亮度不变。','Night Light, Eye Comfort, HDR and color filters are off.':'夜间模式、护眼模式、HDR 和颜色滤镜均已关闭。','Continue  →':'继续  →',
  'Check the darkest detail.':'检查最暗部细节。','Find the first visible step.':'找到第一个刚好可见的色阶。','Against black, which is the darkest numbered patch you can just distinguish? Adjust the screen itself first if needed, then select a patch. Labels remain outside the test area.':'在黑色背景上，选择你刚好能够分辨的最暗编号色块。如有需要请先调整屏幕本身，编号标签不会放进测试区域。',
  'I cannot distinguish any of these patches.':'这些色块我都分辨不出来。','First visible code:':'最先可见的代码值：','Not a black-level measurement in cd/m²':'这不是以 cd/m² 测量的黑位',
  'Check the brightest detail.':'检查最亮部细节。','Against white, select the closest-to-white patch that is still distinguishable. Reduce excessive display contrast if the light patches merge.':'在白色背景上，选择仍然能够分辨、但最接近白色的色块。如果亮部色块融合，请降低过高的显示器对比度。','Last visible code:':'最后可辨认的代码值：',
  'Let the two halves blend.':'让左右两半在视觉上融合。','Move back until the tiny checkerboard on the left fuses. Adjust the solid patch on the right to match its average brightness. Don\'t match the individual bright pixels.':'向后坐，直到左侧细小棋盘格融合成均匀区域。调整右侧实色色块，使其平均亮度与左侧匹配，不要去匹配单个亮像素。','50% pixel dither':'50% 像素抖动','Solid patch':'实色色块','Solid patch level':'实色色块等级',
  'Record match':'记录匹配','Repeat the midpoint match three times.':'重复三次中间调匹配。','Your eyes are part of this measurement. A channel match does not identify physical RGB gains, especially with color-vision differences.':'你的视觉本身就是这个测量的一部分。尤其在存在色觉差异时，通道匹配不能被解释为显示器真实的 RGB 增益。','Record channel match':'记录通道匹配','Red channel':'红色通道','Green channel':'绿色通道','Blue channel':'蓝色通道',
  'Check for obvious merging.':'检查是否出现明显融合。','Look for separate steps in each row. A merged row may reflect the display, your perception, or both. This cannot certify your screen\'s gamut.':'观察每一行是否仍有清晰分开的色阶。色阶融合可能来自显示器、你的感知，或两者共同作用。这不能用于认证显示器色域。','Save perceptual profile':'保存感知档案',
  'DISPLAY PERCEPTUAL PROFILE':'显示器感知档案','Gamma-like estimate':'近似 Gamma 估计','Setup quality':'校准质量','Self-reported, not instrument verified':'基于用户操作，未经仪器验证','Visible code range':'可见代码范围','8-bit codes, not measured luminance':'8 位代码值，并非实测亮度','Keep brightness and lighting unchanged':'保持亮度与环境光不变',
  'This estimate assumes a pure-power display response and a successful dither match. We retain nominal sRGB color math instead of silently applying an uncertain display correction. Recalibrate after a display or environment change.':'该估计假设显示器近似符合幂函数响应，并且抖动匹配成功。应用会保留标准 sRGB 数学，而不会悄悄套用不可靠的显示器修正。更换屏幕或环境后请重新校准。','Restart perceptual setup':'重新进行感知校准','Continue to vision assessment  →':'进入色觉评估  →',
  'Which side contains a square?':'哪一侧包含方形？','Locate the square, not a particular color.':'寻找方形，而不是寻找某一种颜色。','In each field of dots, a square appears on the left or the right. Your responses adjust the next color difference. Several chromatic directions and easy catch trials help distinguish patterns from chance.':'每个点阵中，方形会出现在左侧或右侧。你的回答会调节下一次试验的色差。多个色彩方向和简单的检查试验用于帮助区分真实感知与随机猜测。',
  'Randomized sides. Interleaved adaptive directions. Occasional easy trials.':'左右位置随机、多个自适应色彩方向交错进行，并穿插容易的检查试验。','Fine spatial pattern, not flashing light. Stop if uncomfortable.':'这是细小空间图案，不是闪烁刺激。如感到不适，请停止。','Trial count':'试验数量','36 / initial estimate':'36 / 初步估计','72 / more evidence':'72 / 更多证据','Begin assessment':'开始评估','Use a labeled demo model':'使用已标注的演示模型',
  '←  Left':'←  左','Right  →':'右  →','Cannot tell':'无法判断','Choose a side even when uncertain. “Cannot tell” is recorded as an incorrect response, not discarded.':'即使不确定也尽量选择一侧。“无法判断”会被记录为一次未正确识别的回答，而不是被丢弃。',
  'YOUR EXPLORATORY PROFILE':'你的探索性色觉档案','Best-fit family':'最佳拟合类型','Competing models may overlap':'不同模型可能互相重叠','Severity parameter':'程度参数','Model-conditional, not clinical':'依赖模型的参数，不是临床严重度','Easy catch trials':'简单检查试验','Checks task engagement':'用于检查任务参与度','Blue-yellow (exploratory)':'蓝黄方向（探索性）','Not resolved':'未能确定',' / at range limit':' / 已到范围边界',
  'Nothing here is copied from a clinical test. The result is an approximate, screen-specific model with uncertainty.':'这里没有复制任何临床色觉测试图版。结果只是一个带有不确定性的、针对当前屏幕的近似模型。','The numeric severity is a coordinate in the simulator, not a percentage of vision lost. Protan/deutan separation may remain uncertain. The next stage learns directly from your responses, rather than treating this label as your identity.':'数值程度只是模拟器中的一个参数坐标，不代表“损失了多少百分比的色觉”。Protan 与 deutan 的区分可能仍然不确定。下一阶段会直接学习你的实际回答，而不会把一个分类标签当作你的全部特征。','Add 36 more trials':'再增加 36 次试验','Personalize the camouflage  →':'个性化视觉伪装  →','Assess my vision →':'开始评估我的色觉 →',
  'A response, not a label.':'看实际反应，而不是只看标签。','Do not look for a known word.':'不要寻找你预先知道的词。','The simulation proposes a starting point. Your actual recognition responses decide where the search goes next.':'模拟模型只提供起点。真正决定下一步搜索方向的是你的实际识别回答。','Identify unfamiliar characters in the color field. Do not worry about getting them wrong. Wrong answers, uncertainty and blank trials are useful evidence.':'识别色彩图案中陌生的字符。不用担心答错，错误回答、不确定和空白试验本身都是有价值的数据。','The next field explores a new candidate or refines parameters near patterns you could identify. Some trials intentionally contain no symbol.':'下一张图会探索新的候选模式，或在你较容易识别的参数附近继续细化。有些试验会故意不包含任何字符。',
  'What do you see?':'你看到了什么？','Type the symbol or text':'输入你看到的字符或文字','Nothing / cannot tell':'什么都没看到 / 无法判断','Record response →':'记录回答 →','One response closer.':'又多了一条你的真实数据。','We need your eyes, not a preset.':'我们需要的是你的眼睛，而不是预设色板。','Searching candidates…':'正在搜索候选模式…','Next blinded candidate  →':'下一张盲测候选图  →','Start blind calibration':'开始盲法校准','Open message studio':'打开消息工作台','Aim for at least 12 responses. More trials improve local empirical coverage, not diagnostic validity.':'建议至少完成 12 次回答。更多试验只能提高当前屏幕上的经验覆盖度，并不会使它变成临床诊断。','How does the search learn?':'搜索如何学习？','Candidate signal strength, distractor amplitude, residual noise, geometry and equal-luminance constraints are varied continuously. A distance-weighted success estimate from your past responses updates candidate ranking. Every fourth trial explores outside the current favorite.':'系统会连续调节信号强度、干扰幅度、残余噪声、几何结构以及等亮度约束。过去回答会通过距离加权的成功估计更新候选排名。每四次试验会主动探索当前最佳区域之外的参数。','Your empirical thresholds':'你的经验感知阈值','responses':'次回答','Continue to create  →':'进入消息生成  →','Using the explicitly labeled deutan demo prior.':'正在使用明确标注的 deutan 演示先验。','Using your measured response profile.':'正在使用你的实测回答档案。',
  'A personal visibility experiment. Not encryption. Start with a short word and validate it with someone who doesn\'t know the message.':'这是个人化的可见性实验，不是加密。先从短词开始，并让一个事先不知道答案的人进行验证。','Your message':'你的消息','English + Unicode. Font support depends on this device. Short, thick glyphs work best.':'支持英文和 Unicode。字体支持取决于当前设备。短而粗的字符通常效果最好。','Pattern':'图案','Auto / optimizer choice':'自动 / 由优化器选择','Dot field':'圆点阵列','Voronoi mosaic':'Voronoi 马赛克','Multi-scale noise':'多尺度彩色噪声','Microdot stippling':'微点描绘','Camouflage strength':'伪装强度','Visibility balance':'可见性平衡','Target advantage':'偏向目标用户','Amplitude':'幅度','Low':'低','Balanced':'平衡','Strong':'强','Extreme':'极强','Invert':'反转策略','Generate secret message':'生成秘密消息','Generate another':'重新生成',
  'Target-model separation':'目标模型分离度','Heuristic index, not % readable':'启发式指标，不是可读率 %','Typical pooling separation':'典型观察者池化分离度','Unvalidated attention-limited proxy':'未经验证的注意力受限代理指标','Model difference':'模型差异','Target minus typical pooling':'目标模型减典型池化模型','Not measured':'未测量',
  'Original / typical-display input':'原始图 / 典型显示输入','Target-model transform':'目标色觉模型变换','Grayscale separation':'灰度分离度','Nominal CIE Y after quantization':'量化后的名义 CIE Y','Edge-energy separation':'边缘能量分离度','Local gradient proxy':'局部梯度代理指标','Coarse grayscale':'粗尺度灰度','Spatial pooling / scale attack':'空间池化 / 缩放攻击','Oracle color decoder':'已知掩码颜色解码器','Mask-informed covariance-normalized index':'利用掩码信息的协方差归一化指标','Not secure against filters':'无法抵抗滤镜攻击',
  'A low value in one diagnostic does not rule out a better decoder. Perceptual model indices and adversarial indices are not calibrated to one shared human performance scale.':'某个诊断指标较低，并不意味着不存在更好的解码方式。感知模型指标与对抗指标也没有被校准到统一的人类表现尺度。','The CVD-filter attack reaches':'CVD 滤镜攻击可达到',', the target-model index itself. Strongest RGB-channel index:':'，也就是目标模型本身的指标。最强 RGB 单通道指标：','. An informed observer may recover the message.':'。了解原理的观察者可能恢复出消息。','Return to Original to audit the actual canvas.':'切回“原始图”后才能审计实际画布。','Actual-raster diagnostics':'实际栅格图诊断','Foreground/background separation after 8-bit rendering. These know the glyph mask. Lower is less evidence for that particular attack, not a security certification.':'这些指标在 8 位渲染后计算前景/背景分离度，并且已知字符掩码。数值越低只代表该特定攻击下证据越弱，不等于安全认证。','The text is dense relative to the pattern. Use fewer characters, more lines or a finer pattern. Missing glyphs depend on installed fonts.':'文字相对图案过于密集。请减少字符、增加换行或使用更细的图案。缺失字符取决于设备已安装字体。',
  'Inspect for leaks':'检查信息泄漏','Original':'原始图','Grayscale / CIE Y':'灰度 / CIE Y','Saturation × 2':'饱和度 × 2','Contrast × 2':'对比度 × 2','CVD-filter attack / target':'CVD 滤镜攻击 / 目标模型','Open research views':'打开研究视图','Close research views':'关闭研究视图','Fullscreen ⤢':'全屏 ⤢','Export size':'导出尺寸','Phone / 1080 × 1440':'手机 / 1080 × 1440','Square / 1080 × 1080':'方形 / 1080 × 1080','Desktop / 1600 × 1000':'桌面 / 1600 × 1000','Custom dimensions':'自定义尺寸','Width':'宽度','Height':'高度','Download PNG':'下载 PNG','Copy image':'复制图片','Share image':'分享图片','Images contain no added plaintext metadata. The pixels themselves still carry the signal.':'导出的图片不会额外写入明文元数据，但像素本身仍然承载信息。','Simulations approximate appearance, not recognition.':'这些模拟只近似视觉外观，并不等同于真实识别表现。','Strong deutan simulation. This is not your measured profile.':'强 deutan 模拟。这不是你的实测档案。','Verify with blinded trials  →':'用盲法试验验证  →',
  'Knowing the message changes what you look for. Honest verification uses unfamiliar random strings and fresh seeds, including blank controls.':'事先知道消息会改变你的搜索方式。严谨的验证会使用陌生的随机字符串、新随机种子，并加入空白对照。','SAME PLATES. DIFFERENT PEOPLE.':'同一组图，不同的人。','Can the advantage survive':'这种优势能否经受','a second pair of eyes?':'另一双眼睛的检验？','The target and control participant see the same ten plates on this device, in different orders. Ask a different person who reports typical color vision to complete the control sequence. Don\'t tell them any answers.':'目标参与者与对照参与者会在同一设备上看到相同的 10 张图，但顺序不同。请找一位自述具有典型色觉、且不知道答案的人完成对照序列。','Test target participant':'测试目标参与者','Resume target test':'继续目标参与者测试','Test a typical-vision control':'测试典型色觉对照','Resume control test':'继续对照测试','Start a new battery with the current encoding':'使用当前编码开始一组新试验','recorded responses':'已记录回答','8 strings + 2 blanks per person':'每人 8 个字符串 + 2 个空白',
  'Target participant':'目标参与者','Typical-vision control':'典型色觉对照','blinded trial':'盲测试验','Type exactly what you see. Some fields contain no text. The answer is not shown before or after the trial.':'请准确输入你看到的内容。有些图中没有文字，答案在试验前后都不会显示。','Confidence':'信心程度','Recognition confidence':'识别信心','Self-paced. The browser records response time. Only software brightness/contrast changes are tested; hardware changes are not measured.':'按自己的节奏完成。浏览器会记录反应时间。这里只测试软件层面的亮度和对比度变化，不测量硬件变化。',
  'Personal readability':'目标参与者可读率','Requires blinded target responses':'需要目标参与者的盲测回答','Control readability':'对照可读率','Requires a real second participant':'需要真实的第二位参与者','Observed difference':'观测差异','Do not substitute the simulation here':'这里不能用模拟结果代替真实人类回答','Both observers':'两位观察者','correctly read':'正确识别','The model already admits a filter attack: a typical viewer can apply the target simulation. Even a successful two-person demonstration would show a viewing-task advantage, not secure steganography.':'模型本身已经承认滤镜攻击：典型色觉观察者可以主动应用目标色觉模拟。即使两人实验成功，也只能说明存在观看任务上的优势，而不是安全的隐写术。',
  'Robustness by condition':'不同扰动条件下的稳健性','Pixel perturbation':'像素扰动','Target exact matches':'目标参与者精确匹配','Control exact matches':'对照精确匹配','50% resample':'50% 重采样','JPEG quality 42%':'JPEG 质量 42%','Not tested':'未测试','False recognition on blank plates: target':'空白图上的误识别：目标','control':'对照','These are separate from text accuracy.':'这些数据与文字识别准确率分开统计。','Few observations per condition. This battery cannot establish reliable robustness or population-level secrecy. Fresh batteries are needed to replicate an effect.':'每种扰动条件下的样本很少。这组试验无法证明可靠的稳健性或群体层面的隐蔽性，需要新的独立试验来复现结果。','Check my authored message (unblinded; excluded from accuracy)':'检查我自己写的消息（非盲测，不计入准确率）','You already know this message. This check can catch gross rendering failures, but cannot provide an unbiased readability percentage.':'你已经知道这条消息，因此这里只能发现明显的渲染失败，不能提供无偏的可读率。','Unblinded message response':'非盲测消息回答','Compare text':'比较文字',
  'THE SCIENCE, WITH ITS LIMITS':'科学原理，以及它的边界','Camouflage, not':'这是伪装，不是','exclusive information.':'排他性信息。','Strong chromatic variation can interfere with visual grouping. Under some color-confusion mappings, that variation collapses while a weaker signal survives. This is a plausible route to a task-dependent visibility advantage.':'强烈的颜色变化会干扰视觉分组。在某些色觉混淆映射下，这些变化可能被压缩，而较弱的结构信号仍然保留。这为产生与任务相关的可见性优势提供了一条合理路径。','A typical viewer still receives all the image information and can apply a color-vision simulation. We never equate a favorable simulation with real human performance or cryptographic secrecy.':'典型色觉观察者仍然获得图像中的全部信息，也可以主动应用色觉模拟。我们不会把有利的模拟结果等同于真实人类表现，更不会把它称为密码学意义上的保密。','Four separate claims':'四个必须分开的概念','Diagnosis:':'临床诊断：','not supplied.':'本应用不提供。','Web phenotype:':'网页端色觉表型估计：','tentative model fit.':'只是暂定的模型拟合。','Hardware calibration:':'硬件校准：','requires instrumentation.':'需要仪器。','Perceptual setup:':'感知校准：','user-assisted, approximate and device-specific.':'由用户参与、近似且与设备相关。','What the MVP implements':'MVP 实际实现的内容','Nominal linear sRGB, XYZ/D65, CIELAB/D65 and OKLab conversions; Machado simulation tables; repeated adaptive color discrimination; empirically updated candidate search; actual-raster leakage checks; and paired blinded participant trials.':'标准线性 sRGB、XYZ/D65、CIELAB/D65 与 OKLab 转换；Machado 色觉模拟表；重复自适应颜色辨别试验；由经验回答更新的候选搜索；实际栅格图泄漏检查；以及成对的参与者盲测试验。','All separation indices are unvalidated proxies. Severity is a simulator parameter. Only recorded human answers produce recognition percentages, with uncertainty intervals.':'所有“分离度”指标都只是未经验证的代理量。程度值是模拟器参数。只有真实记录的人类回答才会产生识别百分比，并附带不确定区间。','Primary reading':'主要参考文献','External references open only when clicked. Full assumptions and failure cases are documented in docs/FEASIBILITY.md.':'外部参考文献只会在你点击时打开。完整假设与失败情形记录在 docs/FEASIBILITY.md。','Close scientific notes':'关闭科学说明','Scientific basis':'科学依据',
  'LOCAL BY DESIGN':'本地优先设计','Your screen.':'你的屏幕。','Your data.':'你的数据。','No account, backend, analytics, external fonts or upload endpoints. Test responses and profiles are saved in this browser\'s local storage. Your authored message remains in memory and is not saved in the profile.':'无需账号、后端、分析追踪、外部字体或上传接口。测试回答和档案保存在当前浏览器的本地存储中。你自己输入的秘密消息只保留在内存中，不会写入档案。','Shared-device users and browser extensions may access local data. This is not encrypted storage. Exports contain pixels, not added plaintext metadata.':'共用设备上的其他用户和浏览器扩展可能访问这些本地数据。这不是加密存储。导出文件包含图像像素，但不会额外加入明文元数据。','assessment responses':'色觉评估回答','optimization responses':'优化回答','verification responses':'验证回答','Export research JSON':'导出研究 JSON','Erase local data':'清除本地数据','The JSON includes randomized trial answers and response history, but not your authored secret message. Moving this profile to another display does not preserve calibration.':'JSON 包含随机试验答案与回答历史，但不包含你自己输入的秘密消息。把这个档案移到另一块屏幕并不能保留原来的校准有效性。','Close privacy panel':'关闭隐私面板',
  'Your screen signature has changed. Recheck display setup before trusting the saved profile. Matching signatures still cannot identify a physical monitor uniquely.':'检测到屏幕特征发生变化。继续信任已保存档案前，请重新检查显示器设置。即使特征一致，也不能唯一识别一块物理显示器。','Browser storage is unavailable. This session works in memory, but your profile will not survive a reload.':'浏览器本地存储不可用。本次实验仍可在内存中运行，但刷新页面后档案会丢失。','Dismiss notice':'关闭提示','Experimental. Not diagnostic. Never a secrecy guarantee.':'实验性质。非诊断工具，也不提供保密保证。','chromasecret / a perception laboratory':'chromasecret / 感知实验室','The experiment stopped safely.':'实验已安全停止。','Reset local profile and reload':'重置本地档案并重新加载',
  'Response recorded. The next candidate uses your accumulated responses.':'回答已记录。下一候选图会使用你累积的真实回答。','New candidate generated. A model advantage is not evidence that another person cannot read it.':'已生成新候选图。模型上的优势并不能证明其他人看不出来。','File sharing is unavailable here. PNG exported instead.':'当前环境不支持直接分享文件，已改为导出 PNG。','Image copied.':'图片已复制。','Clean image exported. Revalidate on the receiving display; no plaintext metadata is added.':'已导出干净的图片。请在接收端屏幕上重新验证；不会额外写入明文元数据。','Fullscreen is unavailable in this browser. Use the largest comfortable view.':'当前浏览器不支持全屏，请使用尽可能大且舒适的显示尺寸。','New blinded battery prepared. It uses unfamiliar random strings, not your known message.':'已准备新的盲测序列。它使用陌生的随机字符串，而不是你已知的消息。','Click Erase local data again to confirm.':'请再次点击“清除本地数据”以确认。','Local profile erased.':'本地档案已清除。',
  'empirical trials':'经验试验','EXPERIMENTAL · V0.1':'实验版 · V0.1','Keep the conditions constant.':'保持观察条件稳定。','Display contrast and room light affect this result':'显示器对比度与环境光都会影响结果','Back':'返回',
  'Independent gray match 1 of 3. Repetition estimates consistency.':'第 1 / 3 次独立灰度匹配。重复测量用于估计一致性。','A within-channel consistency check only. This does not estimate relative physical RGB power.':'这只是同一颜色通道内的一致性检查，不能估计 RGB 通道的相对物理功率。',
  'The steps are distinct':'色阶清晰可分','Some merge / uncertain':'部分融合 / 不确定','Saved for this browser and current screen signature.':'已保存到当前浏览器，并关联当前屏幕特征。','Reasonable':'良好','Limited':'有限','Conditions':'环境稳定性','Steady':'稳定','Recheck':'建议复查','Inspect setup details':'查看校准细节','yes':'是','no':'否','unknown':'未知',
  'Direction':'方向','Evidence':'证据','Instruction schematic only. Actual trials use randomly colored dots and no outline cues.':'此处仅为任务示意。正式试验使用随机彩色圆点，不会提供轮廓提示。','BLINDED CANDIDATE':'盲测候选','blank controls':'空白对照','Target and typical model indices are intentionally not shown during blinded trials. These are speculative color-separation proxies, not recognition percentages. Fresh verification stimuli are held out.':'盲测试验期间会刻意隐藏目标模型与典型模型指标。这些只是推测性的颜色分离代理指标，不是识别百分比。验证阶段会保留全新的刺激用于测试。',
  'DEMO MODEL':'演示模型','A short word or phrase':'一个短词或短语','Searching…':'正在搜索…','Generate color field  ↗':'生成色彩场  ↗','Export PNG':'导出 PNG','ORIGINAL FIELD':'原始色彩场','CVD-FILTER ATTACK / TARGET SIMULATION':'CVD 滤镜攻击 / 目标模拟','Seed':'随机种子','dots':'圆点','mosaic':'马赛克','noise':'噪声','microdots':'微点','Nominal equal-Y':'名义等亮度 Y','Relaxed luminance constraint':'放宽亮度约束',
  'Look through the assumptions.':'查看模型假设。','Protan approximation':'Protan 近似','Deutan approximation':'Deutan 近似','Tritan approximation':'Tritan 近似','Grayscale':'灰度',
  'Exact match':'完全匹配','Not an exact match':'并非完全匹配','Character similarity':'字符相似度','Unblinded; excluded from recognition statistics.':'非盲测，不计入识别统计。'
};

const patterns:Array<[RegExp,(m:RegExpMatchArray)=>string]>=[
  [/^(\d+) empirical trials$/,m=>`${m[1]} 次经验试验`],
  [/^(\d+) assessment responses$/,m=>`${m[1]} 条色觉评估回答`],
  [/^(\d+) optimization responses$/,m=>`${m[1]} 条优化回答`],
  [/^(\d+) verification responses$/,m=>`${m[1]} 条验证回答`],
  [/^(\d+) recorded responses$/,m=>`${m[1]} 条已记录回答`],
  [/^(\d+) responses$/,m=>`${m[1]} 次回答`],
  [/^Trial (\d+) \/ (\d+)$/,m=>`试验 ${m[1]} / ${m[2]}`],
  [/^(Target participant|Typical-vision control) \/ blinded trial$/,m=>`${m[1]==='Target participant'?'目标参与者':'典型色觉对照'} / 盲测试验`],
  [/^False recognition on blank plates: target (\d+)\/(\d+); control (\d+)\/(\d+)\. These are separate from text accuracy\.$/,m=>`空白图误识别：目标 ${m[1]}/${m[2]}；对照 ${m[3]}/${m[4]}。该指标与文字识别准确率分开统计。`],
  [/^Search failed: (.*)\. No result was fabricated\.$/,m=>`搜索失败：${m[1]}。应用没有伪造结果。`],
  [/^Generation failed: (.*)$/,m=>`生成失败：${m[1]}`],
  [/^(0\d|\d+) \/ (Begin here|Perceptual setup|Exploratory assessment|Differential calibration|Message studio|Blinded verification)$/,m=>{const labels:Record<string,string>={'Begin here':'从这里开始','Perceptual setup':'感知校准','Exploratory assessment':'探索性色觉评估','Differential calibration':'差异可见性校准','Message studio':'秘密消息工作台','Blinded verification':'盲法验证'};return `${m[1]} / ${labels[m[2]]}`;}],
  [/^Record match (\d+) \/ 3$/,m=>`记录匹配 ${m[1]} / 3`],
  [/^Independent gray match (\d+) of 3\. Repetition estimates consistency\.$/,m=>`第 ${m[1]} / 3 次独立灰度匹配。重复测量用于估计一致性。`],
  [/^Match the (red|green|blue) channel\.$/,m=>`匹配${m[1]==='red'?'红色':m[1]==='green'?'绿色':'蓝色'}通道。`],
  [/^Estimated from (\d+) responses on this display\. Not a clinical diagnosis\.$/,m=>`根据当前显示器上的 ${m[1]} 次回答估计。不是临床诊断。`],
  [/^(protan|deutan|tritan)-like axis$/,m=>`${m[1]}-like 方向`],
  [/^(\d+) trials \/ (\d+) reversals( \/ at range limit)?$/,m=>`${m[1]} 次试验 / ${m[2]} 次反转${m[3]?' / 已到范围边界':''}`],
  [/^BLINDED CANDIDATE (\d+)$/,m=>`盲测候选 ${m[1]}`],
  [/^The CVD-filter attack reaches (.+), the target-model index itself\. Strongest RGB-channel index: (.+)\. An informed observer may recover the message\.$/,m=>`CVD 滤镜攻击可达到 ${m[1]}，也就是目标模型本身的指标。最强 RGB 单通道指标为 ${m[2]}。了解原理的观察者可能恢复出消息。`],
  [/^(ORIGINAL|GRAYSCALE|RED|GREEN|BLUE|SATURATION|CONTRAST) VIEW$/,m=>`${({'ORIGINAL':'原始','GRAYSCALE':'灰度','RED':'红通道','GREEN':'绿通道','BLUE':'蓝通道','SATURATION':'饱和度','CONTRAST':'对比度'} as Record<string,string>)[m[1]]}视图`],
  [/^Gray-match range: (.+)$/,m=>`灰度匹配范围：${m[1]}`],
  [/^Conditional 95% range (.+)$/,m=>`条件 95% 范围 ${m[1]}`],
  [/^(\d+) exact matches · 95% interval (.+)$/,m=>`${m[1]} 次精确匹配 · 95% 区间 ${m[2]}`],
  [/^(\d+) matched text plates; descriptive, not population-level$/,m=>`${m[1]} 张配对文字图；仅为描述性结果，不能推广到总体`],
  [/^(\d+) \/ (\d+)$/,m=>`${m[1]} / ${m[2]}`],
];

function translateZhCore(value:string):string{
  const exact=zh[value];if(exact)return exact;
  for(const [re,fn] of patterns){const m=value.match(re);if(m)return fn(m);}
  return value;
}

function translatedZh(value:string):string{
  const m=value.match(/^(\s*)([\s\S]*?)(\s*)$/);if(!m)return translateZhCore(value);
  const inner=m[2];return m[1]+translateZhCore(inner)+m[3];
}

function translated(value:string):string{return locale==='zh-CN'?translatedZh(value):value;}

function skipped(node:Node):boolean{
  const el=node.nodeType===Node.ELEMENT_NODE?node as Element:node.parentElement;
  return !!el?.closest('script,style,[data-i18n-skip="true"]');
}

function applyText(node:Text){
  if(skipped(node))return;
  const now=node.nodeValue||'';let original=textOriginal.get(node);
  if(original===undefined){original=now;textOriginal.set(node,original);}
  if(locale==='en'){if(now===translatedZh(original)&&now!==original)node.nodeValue=original;else if(now!==original)textOriginal.set(node,now);return;}
  if(now!==translatedZh(original)&&now!==original){original=now;textOriginal.set(node,original);}
  const next=translatedZh(original);if(now!==next)node.nodeValue=next;
}

const attrs=['aria-label','placeholder','title'];
function applyAttrs(el:Element){
  if(skipped(el))return;
  let map=attrOriginal.get(el);if(!map){map=new Map();attrOriginal.set(el,map);}
  for(const attr of attrs){if(!el.hasAttribute(attr))continue;const now=el.getAttribute(attr)||'';let original=map.get(attr);if(original===undefined){original=now;map.set(attr,original);}if(locale==='en'){if(now===translatedZh(original)&&now!==original)el.setAttribute(attr,original);else if(now!==original)map.set(attr,now);continue;}if(now!==translatedZh(original)&&now!==original){original=now;map.set(attr,original);}const next=translatedZh(original);if(now!==next)el.setAttribute(attr,next);}
}

function applyTree(root:Node){
  if(root.nodeType===Node.TEXT_NODE){applyText(root as Text);return;}
  if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;
  if(root.nodeType===Node.ELEMENT_NODE)applyAttrs(root as Element);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n:Node|null=walker.nextNode();while(n){if(n.nodeType===Node.TEXT_NODE)applyText(n as Text);else applyAttrs(n as Element);n=walker.nextNode();}
}

function persist(next:Locale){try{localStorage.setItem(STORAGE_KEY,next);}catch{/* local storage is optional */}}
function loadLocale():Locale{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved==='en'||saved==='zh-CN')return saved;}catch{/* ignore */}return /^zh\b/i.test(navigator.language)?'zh-CN':'en';}

function updateChrome(){
  document.documentElement.lang=locale==='zh-CN'?'zh-CN':'en';
  document.title=locale==='zh-CN'?'Chromasecret - 个性化视觉感知实验':'Chromasecret - A personal perception experiment';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute('content',locale==='zh-CN'?'本地运行的个性化色觉伪装实验室。非临床诊断，也不提供保密保证。':'A local-only experimental laboratory for personalized color-vision camouflage. Not a diagnosis or a secrecy guarantee.');
  const button=document.querySelector<HTMLButtonElement>('.language-toggle');if(button){const label=locale==='zh-CN'?'Switch to English':'切换到简体中文',text=locale==='zh-CN'?'EN':'中文';if(button.textContent!==text)button.textContent=text;if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);if(button.title!==label)button.title=label;}
}

export function getLocale():Locale{return locale;}
export function toggleLocale(){setLocale(locale==='en'?'zh-CN':'en');}
export function setLocale(next:Locale){locale=next;persist(locale);applying=true;updateChrome();applyTree(document.body);applying=false;window.dispatchEvent(new CustomEvent('chromasecret:locale',{detail:{locale}}));}

export function initI18n(){
  locale=loadLocale();updateChrome();applyTree(document.body);
  observer?.disconnect();observer=new MutationObserver(records=>{if(applying)return;applying=true;for(const record of records){if(record.type==='characterData')applyText(record.target as Text);else if(record.type==='attributes')applyAttrs(record.target as Element);else for(const node of Array.from(record.addedNodes))applyTree(node);}updateChrome();applying=false;});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
}
