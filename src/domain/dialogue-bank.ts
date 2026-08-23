/**
 * Authored exchange pairs used by the scene composer. Every pair carries both
 * English and Arabic so composed scenes keep full subtitles. Levels tag which
 * CEFR bands may draw on the pair; kinds drive recipe coherence.
 */
import type { CEFRLevel } from "./learner";

export interface ExchangePair {
  kind: PairKind;
  levels: CEFRLevel[];
  a: { text: string; ar: string };
  b: { text: string; ar: string };
}

export type PairKind =
  | "greet"
  | "name"
  | "origin"
  | "request"
  | "price"
  | "help"
  | "problem"
  | "clarify"
  | "thanks"
  | "suggest"
  | "opinion"
  | "rebut";

export const EXCHANGE_PAIRS: ExchangePair[] = [
  // Greetings
  { kind: "greet", levels: ["Pre-A1", "A1", "A2"], a: { text: "Good morning! How are you today?", ar: "صباح الخير! كيف حالك اليوم؟" }, b: { text: "I'm very well, thank you. And you?", ar: "أنا بخير جداً، شكراً. وأنت؟" } },
  { kind: "greet", levels: ["Pre-A1", "A1"], a: { text: "Hello! Nice to see you.", ar: "مرحباً! سعيد برؤيتك." }, b: { text: "Nice to see you too!", ar: "وأنا سعيد برؤيتك أيضاً!" } },
  { kind: "greet", levels: ["Pre-A1", "A1", "A2"], a: { text: "Hi there! Lovely weather today.", ar: "أهلاً! الطقس جميل اليوم." }, b: { text: "Yes, really sunny. Perfect for a walk.", ar: "نعم، مشمس حقاً. مثالي لنزهة." } },
  { kind: "greet", levels: ["A2", "B1"], a: { text: "Afternoon! Busy day so far?", ar: "مساء الخير! هل يومك مزدحم حتى الآن؟" }, b: { text: "Pretty busy, but manageable. How's yours going?", ar: "مزدحم تماماً لكنه قابل للإدارة. وكيف يسير يومك؟" } },
  { kind: "greet", levels: ["B1", "B2", "C1", "C2"], a: { text: "Good to see you again — it's been a while.", ar: "سعيد برؤيتك مجدداً — لقد مضى وقت طويل." }, b: { text: "Far too long! We should catch up properly.", ar: "وقت طويل جداً! يجب أن نتعاشر كما ينبغي." } },
  // Name
  { kind: "name", levels: ["Pre-A1", "A1"], a: { text: "Sorry, what's your name again?", ar: "عفواً، ما اسمك مرة أخرى؟" }, b: { text: "It's Nour. N-O-U-R.", ar: "اسمي نور." } },
  { kind: "name", levels: ["Pre-A1", "A1", "A2"], a: { text: "I don't think we've met. I'm Kareem.", ar: "لا أظن أننا التقينا. أنا كريم." }, b: { text: "Hello Kareem, I'm Hana. Welcome!", ar: "مرحباً كريم، أنا هناء. أهلاً بك!" } },
  { kind: "name", levels: ["A2", "B1"], a: { text: "You must be the new colleague — I'm Samir.", ar: "لا بد أنك الزميل الجديد — أنا سمير." }, b: { text: "That's right, Reem. Great to join the team.", ar: "صحيح، ريم. سعيدة بالانضمام للفريق." } },
  // Origin
  { kind: "origin", levels: ["Pre-A1", "A1", "A2"], a: { text: "Where are you from originally?", ar: "من أين أنت في الأصل؟" }, b: { text: "From Tunisia, but I grew up in Lyon.", ar: "من تونس، لكنني نشأت في ليون." } },
  { kind: "origin", levels: ["A1", "A2"], a: { text: "Is this your first visit to London?", ar: "هل هذه زيارتك الأولى للندن؟" }, b: { text: "Yes — and I love it already.", ar: "نعم — وقد أحببتها بالفعل." } },
  { kind: "origin", levels: ["A2", "B1"], a: { text: "How long have you lived here?", ar: "منذ متى وأنت تسكن هنا؟" }, b: { text: "About three years now. Time flies.", ar: "نحو ثلاث سنوات الآن. الأيام تطير." } },
  // Request
  { kind: "request", levels: ["Pre-A1", "A1"], a: { text: "Can I have a tea and a cake, please?", ar: "ممكن شاي وقطعة كيك، من فضلك؟" }, b: { text: "Of course. Anything else for you?", ar: "بالطبع. أي شيء آخر؟" } },
  { kind: "request", levels: ["A1", "A2"], a: { text: "Could I get these two books, please?", ar: "ممكن هذين الكتابين، من فضلك؟" }, b: { text: "Sure — that's nine pounds altogether.", ar: "بالتأكيد — تسعة جنيهات للمجموع." } },
  { kind: "request", levels: ["A2", "B1"], a: { text: "Would you mind helping me carry this?", ar: "هل تمانع مساعدتي في حمل هذا؟" }, b: { text: "Not at all — where shall I put it?", ar: "إطلاقاً — أين أضعه؟" } },
  { kind: "request", levels: ["B1", "B2"], a: { text: "I was wondering if you could review my draft when you have a moment.", ar: "كنت أتساءل إن كان بإمكانك مراجعة مسودتي عندما يتوفر لديك وقت." }, b: { text: "Happy to — send it over and I'll look this afternoon.", ar: "بكل سرور — أرسلها وسأطالعها بعد الظهر." } },
  { kind: "request", levels: ["Pre-A1", "A1", "A2"], a: { text: "Two tickets to the city centre, please.", ar: "تذكرتان إلى وسط المدينة، من فضلك." }, b: { text: "Single or return?", ar: "ذهاب فقط أم ذهاب وعودة؟" } },
  // Price
  { kind: "price", levels: ["Pre-A1", "A1", "A2"], a: { text: "How much is that altogether?", ar: "كم المبلغ الإجمالي؟" }, b: { text: "Seven pounds twenty, please.", ar: "سبعة جنيهات وعشرون، من فضلك." } },
  { kind: "price", levels: ["A1", "A2"], a: { text: "Do you take card?", ar: "هل تقبلون البطاقة؟" }, b: { text: "We do — contactless is fine.", ar: "نعم — الدفع اللاصئ مناسب." } },
  { kind: "price", levels: ["A2", "B1"], a: { text: "That seems a bit expensive. Any discount?", ar: "يبدو ذلك غالياً بعض الشيء. هل من خصم؟" }, b: { text: "I can do ten per cent off for you today.", ar: "أستطيع منحك عشرة بالمئة خصماً اليوم." } },
  // Help
  { kind: "help", levels: ["Pre-A1", "A1", "A2"], a: { text: "Excuse me, where is the bus stop?", ar: "عفواً، أين موقف الحافلة؟" }, b: { text: "Go straight on — it's next to the bank.", ar: "امضِ مستقيماً — إنه بجوار البنك." } },
  { kind: "help", levels: ["A1", "A2"], a: { text: "Could you tell me when we reach the museum?", ar: "هل تخبرني عندما نصل إلى المتحف؟" }, b: { text: "No problem — it's three stops from here.", ar: "لا مشكلة — إنه على ثلاث محطات من هنا." } },
  { kind: "help", levels: ["A2", "B1"], a: { text: "I'm a bit lost, to be honest.", ar: "لقد ضللت الطريق قليلاً، بصراحة." }, b: { text: "No worries — where are you trying to get to?", ar: "لا بأس — إلى أين تحاول الوصول؟" } },
  { kind: "help", levels: ["B1", "B2"], a: { text: "Could you point me towards the quickest way to platform two?", ar: "هل تدلني على أسرع طريق إلى الرصيف الثاني؟" }, b: { text: "Take the stairs here, then it's immediately on your left.", ar: "خذ السلم هنا، وستجده فوراً على يسارك." } },
  // Problem
  { kind: "problem", levels: ["A1", "A2"], a: { text: "Excuse me, this shirt has a hole in it.", ar: "عفواً، هذا القميص فيه ثقب." }, b: { text: "I'm so sorry — would you like a new one?", ar: "أعتذر بشدة — هل تريد واحداً جديداً؟" } },
  { kind: "problem", levels: ["A2", "B1"], a: { text: "I'm afraid my order hasn't arrived yet.", ar: "أخشى أن طلبي لم يصل بعد." }, b: { text: "Let me check that for you straight away.", ar: "دعني أتحقق من ذلك لك فوراً." } },
  { kind: "problem", levels: ["B1", "B2"], a: { text: "There seems to be a mistake on this invoice.", ar: "يبدو أن هناك خطأ في هذه الفاتورة." }, b: { text: "Apologies — I'll issue a corrected version today.", ar: "أعتذر — سأصدر نسخة مصححة اليوم." } },
  { kind: "problem", levels: ["A1", "A2", "B1"], a: { text: "I haven't been feeling well since yesterday.", ar: "لا أشعر بأحوال جيدة منذ أمس." }, b: { text: "You should rest — shall I bring anything?", ar: "عليك بالراحة — هل أحضر لك شيئاً؟" } },
  // Clarify
  { kind: "clarify", levels: ["Pre-A1", "A1", "A2"], a: { text: "Sorry, could you say that again, please?", ar: "عفواً، هل تعيد قول ذلك من فضلك؟" }, b: { text: "Of course — I said the class starts at six.", ar: "بالطبع — قلت إن الحصة تبدأ السادسة." } },
  { kind: "clarify", levels: ["A2", "B1"], a: { text: "Just to check — did you mean Thursday or Tuesday?", ar: "للتأكد — قلت الخميس أم الثلاثاء؟" }, b: { text: "Thursday, definitely.", ar: "الخميس، بالتأكيد." } },
  { kind: "clarify", levels: ["B1", "B2", "C1"], a: { text: "I'm not sure I follow — could you unpack that last point?", ar: "لست متأكداً أنني فهمت — هل توضح نقطتك الأخيرة؟" }, b: { text: "Sure — in short, the savings depend on timing.", ar: "بالتأكيد — باختصار، الوفورات تعتمد على التوقيت." } },
  // Thanks
  { kind: "thanks", levels: ["Pre-A1", "A1"], a: { text: "Thank you very much for your help!", ar: "شكراً جزيلاً على مساعدتك!" }, b: { text: "You're welcome. Have a nice day!", ar: "على الرحب والسعة. نهارك سعيد!" } },
  { kind: "thanks", levels: ["A2", "B1"], a: { text: "Thanks a lot — you've been really helpful.", ar: "شكراً جزيلاً — لقد ساعدتني حقاً." }, b: { text: "My pleasure. Come back any time.", ar: "هذا واجبي. عد متى شئت." } },
  { kind: "thanks", levels: ["B1", "B2", "C1"], a: { text: "I really appreciate you sorting this out so quickly.", ar: "أقدّر حقاً حصولك على حل بهذه السرعة." }, b: { text: "Not at all — that's what we're here for.", ar: "هذا واجبي — لهذا نحن هنا." } },
  { kind: "thanks", levels: ["Pre-A1", "A1", "A2"], a: { text: "That's everything, thanks. See you soon!", ar: "هذا كل شيء، شكراً. أراك قريباً!" }, b: { text: "See you! Take care.", ar: "أراك! اعتنِ بنفسك." } },
  // Suggest
  { kind: "suggest", levels: ["A2", "B1"], a: { text: "Shall we meet at the café instead?", ar: "هل نلتقي في المقهى بدلاً من ذلك؟" }, b: { text: "Works for me — what time suits you?", ar: "يناسبني — أي وقت يناسبك؟" } },
  { kind: "suggest", levels: ["B1", "B2"], a: { text: "Why don't we split the work into two phases?", ar: "لمَ لا نقسم العمل إلى مرحلتين؟" }, b: { text: "That could actually solve our staffing problem.", ar: "قد يحل ذلك فعلاً مشكلة الكوادر لدينا." } },
  { kind: "suggest", levels: ["B1", "B2", "C1"], a: { text: "How about we park this and revisit after the data comes in?", ar: "ما رأيك أن نؤجل هذا ونعود إليه بعد ورود البيانات؟" }, b: { text: "Sensible — deciding now would be premature.", ar: "قرار حكيم — اتخاذه الآن سيكون مبكراً." } },
  { kind: "suggest", levels: ["A2", "B1"], a: { text: "Let's grab lunch before it gets crowded.", ar: "لنتناول الغداء قبل أن يزدحم المكان." }, b: { text: "Good idea — I know a quiet place nearby.", ar: "فكرة جيدة — أعرف مكاناً هادئاً قريباً." } },
  // Opinion
  { kind: "opinion", levels: ["B1", "B2"], a: { text: "In my view, remote work suits our team well.", ar: "برأيي، العمل عن بعد يناسب فريقنا جيداً." }, b: { text: "I'd partly agree — though collaboration suffers on Fridays.", ar: "أوافق جزئياً — مع أن التعاون يتأثر أيام الجمعة." } },
  { kind: "opinion", levels: ["B1", "B2", "C1"], a: { text: "Personally, I'd argue the plan needs more research.", ar: "شخصياً، سأجادل بأن الخطة تحتاج بحثاً أكثر." }, b: { text: "That's fair — what evidence would convince you?", ar: "كلام عادل — ما الدليل الذي سيقنعك؟" } },
  { kind: "opinion", levels: ["B2", "C1", "C2"], a: { text: "The evidence points firmly towards early investment.", ar: "تشير الأدلة بحزم نحو الاستثمار المبكر." }, b: { text: "Up to a point — but early isn't always cheap.", ar: "إلى حد ما — لكن المبكر ليس دائماً الأرخص." } },
  // Rebut
  { kind: "rebut", levels: ["B2", "C1", "C2"], a: { text: "I see the appeal, but the numbers don't support that yet.", ar: "أرى جاذبيته، لكن الأرقام لا تدعم ذلك بعد." }, b: { text: "Fair challenge — let me show you the quarterly figures.", ar: "اعتراض وجيه — دعني أريك أرقام الربع." } },
  { kind: "rebut", levels: ["B2", "C1", "C2"], a: { text: "With respect, that comparison misses the scale question.", ar: "بكل احترام، تلك المقارنة تغفل سؤال الحجم." }, b: { text: "A fair point — perhaps we should separate the two cases.", ar: "وجهة نظر صحيحة — فلنفصل الحالتين ربما." } },
  { kind: "rebut", levels: ["B1", "B2"], a: { text: "I'm not sure that would work in practice.", ar: "لست متأكداً أن ذلك سينفع عملياً." }, b: { text: "Neither am I — that's why a small trial makes sense.", ar: "أنا أيضاً — لهذا فإن تجربة صغيرة منطقية." } },
];

export interface SettingOption { label: string; emoji: string }
export const SCENE_SETTINGS: SettingOption[] = [
  { label: "on a rainy high street", emoji: "🌧️" },
  { label: "in a friendly corner café", emoji: "☕" },
  { label: "at the local market", emoji: "🧺" },
  { label: "outside the train station", emoji: "🚉" },
  { label: "in a quiet bookshop", emoji: "📚" },
  { label: "at the pharmacy counter", emoji: "💊" },
  { label: "in the office kitchen", emoji: "🍽️" },
  { label: "at the bus stop", emoji: "🚌" },
  { label: "in a hospital waiting room", emoji: "🏥" },
  { label: "at the hotel reception", emoji: "🏨" },
  { label: "in the school corridor", emoji: "🏫" },
  { label: "on a video call", emoji: "💻" },
  { label: "at the airport gate", emoji: "✈️" },
  { label: "in a community centre", emoji: "🏘️" },
  { label: "by the office printer", emoji: "🖨️" },
  { label: "in the supermarket queue", emoji: "🛒" },
  { label: "at a friend's front door", emoji: "🚪" },
  { label: "in the staff meeting room", emoji: "🧑‍💼" },
];

export const CHARACTER_DUOS: Array<{ a: { name: string; emoji: string }; b: { name: string; emoji: string } }> = [
  { a: { name: "Omar", emoji: "🧑" }, b: { name: "Grace", emoji: "👵" } },
  { a: { name: "Lina", emoji: "👩" }, b: { name: "Tom", emoji: "🧑" } },
  { a: { name: "Yusuf", emoji: "👨" }, b: { name: "Priya", emoji: "👩‍💼" } },
  { a: { name: "Sara", emoji: "👩‍🎓" }, b: { name: "Dan", emoji: "🧔" } },
  { a: { name: "Adam", emoji: "🧑‍💼" }, b: { name: "Maya", emoji: "👩‍💻" } },
  { a: { name: "Rana", emoji: "👩‍⚕️" }, b: { name: "Jack", emoji: "👷" } },
  { a: { name: "Hana", emoji: "👩‍🔬" }, b: { name: "Ben", emoji: "🧑‍🍳" } },
  { a: { name: "Tariq", emoji: "👨‍🔧" }, b: { name: "Chloe", emoji: "👩‍🏫" } },
];
