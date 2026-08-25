import type { LearningScene, SceneQuizItem } from "./scenes-types";

type ProfessionalScene = LearningScene & { lessonId: string };

const quiz = (items: Array<{ q: string; choices: string[]; answer: number }>): SceneQuizItem[] =>
  items.map((item, i) => ({ id: `pq-${i}`, ...item }));

export const PROFESSIONAL_SCENES: ProfessionalScene[] = [
  // ── Lesson 01: Professional Email Writing ──────────────────────────────
  {
    id: "pro-scene-01a",
    lessonId: "pro-lesson-01-professional-emails",
    title: "Writing a Follow-Up Email",
    levels: ["B1"],
    topics: ["professional-emails", "business-writing"],
    setting: "at a desk after a client meeting",
    prop: "✉️",
    palette: ["#1e3a5f", "#4a90d9"],
    characters: { a: { name: "Sarah", emoji: "👩‍💼" }, b: { name: "James", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Hi James, I wanted to follow up on our meeting this morning about the new project timeline.", ar: "مرحبا جيمس، أردت التتبع بشأن اجتماعنا هذا الصباح حول الجدول الزمني للمشروع الجديد.", note: "'Follow up on' is a key email phrasal verb." },
      { speaker: "b", text: "Thanks Sarah. Could you summarise the key points in an email so the team has everything in writing?", ar: "شكرا ساره. هل يمكنك تلخيص النقاط الرئيسية في بريد إلكتروني حتى يكون لدى الفريق كل شيء مكتوباً؟" },
      { speaker: "a", text: "Of course. I will use a clear subject line and bullet points to make it easy to read.", ar: "بالطبع. سأستخدم سطر موضوع واضح ونقاط متعددة لتسهيل القراءة.", note: "Professional emails use clear subject lines and structured formatting." },
      { speaker: "b", text: "Great. Also, please CC the project sponsor so they stay informed.", ar: "ممتاز. أيضاً، يرجى نسخ كوبية لممول المشروع حتى يبقى على اطلاع.", note: "'CC' means carbon copy — send a copy to someone." },
      { speaker: "a", text: "Will do. I will send it by end of day and include a deadline for feedback.", ar: "سأفعل. سأرسله بحلول نهاية اليوم وأدرج موعداً نهائياً للتعليقات.", note: "'By end of day' is standard business English for 'before today finishes'." },
    ],
    quiz: quiz([
      { q: "What is the purpose of Sarah's email?", choices: ["To complain about the meeting", "To follow up and summarise key points", "To cancel the project", "To ask for a salary increase"], answer: 1 },
      { q: "Why does James ask Sarah to CC the project sponsor?", choices: ["To save time", "To keep the sponsor informed", "To avoid the meeting", "To change the deadline"], answer: 1 },
    ]),
  },
  {
    id: "pro-scene-01b",
    lessonId: "pro-lesson-01-professional-emails",
    title: "Writing a Polite Request Email",
    levels: ["B1"],
    topics: ["professional-emails", "requests"],
    setting: "in an open-plan office",
    prop: "💼",
    palette: ["#2d4a3e", "#5cb85c"],
    characters: { a: { name: "Aisha", emoji: "👩‍🔬" }, b: { name: "Tom", emoji: "👨‍🏫" } },
    lines: [
      { speaker: "a", text: "Tom, how do I ask a supplier for a price list without sounding too direct?", ar: "توم، كيف أسأل مورداً عن قائمة أسعار دون أن أبدو صريحاً جداً؟", note: "In business English, politeness markers are essential in requests." },
      { speaker: "b", text: "Start with 'I hope this email finds you well' and then use 'I was wondering if you could...'", ar: "ابدأ بـ 'أتمنى أن يجدك هذا البريد بخير' ثم استخدم 'تساءلت عما إذا كان بإمكانك...'" },
      { speaker: "a", text: "So I should say 'I was wondering if you could send me your updated price list?'", ar: "إذن يجب أن أقول 'تساءلت عما إذا كان بإمكانك إرسال قائمة أسعارك المحدّثة؟'" },
      { speaker: "b", text: "Exactly. And close with 'I would appreciate your help' and 'Kind regards'.", ar: "بالضبط. وأختم بـ 'سأكون ممتن لمساعدتك' و'مع أطيب التحيات'.", note: "'I would appreciate' is more formal and polite than 'please send'." },
      { speaker: "a", text: "Perfect. I will also mention the deadline so they know it is time-sensitive.", ar: "ممتاز. سأذكر أيضاً الموعد النهائي حتى يعرفوا أن الطلب ملح.", note: "'Time-sensitive' means something needs to be done within a specific time." },
    ],
    quiz: quiz([
      { q: "What phrase does Tom suggest for making polite requests?", choices: ["Send me the list now", "I was wondering if you could...", "Give me the prices", "I need your price list"], answer: 1 },
      { q: "What does 'time-sensitive' mean?", choices: ["Very expensive", "Needs to be done within a specific time", "Sensitive to weather", "Available only at certain times"], answer: 1 },
    ]),
  },

  // ── Lesson 02: Business Meetings ──────────────────────────────────────
  {
    id: "pro-scene-02a",
    lessonId: "pro-lesson-02-business-meetings",
    title: "Opening a Team Meeting",
    levels: ["B1"],
    topics: ["business-meetings", "team-communication"],
    setting: "in a conference room with a whiteboard",
    prop: "📊",
    palette: ["#4a1942", "#9b59b6"],
    characters: { a: { name: "Maria", emoji: "👩‍💼" }, b: { name: "David", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Good morning everyone. Let us get started. The agenda for today covers three items.", ar: "صباح الخير جميعاً. لنبدأ. جدول أعمال اليوم يغطي ثلاث نقاط.", note: "'Let us get started' is a common meeting opener." },
      { speaker: "b", text: "Before we begin, could I add a quick point about the client feedback?", ar: "قبل أن نبدأ، هل يمكنني إضافة ملاحظة سريعة حول ملاحظات العميل؟", note: "'Could I add' is a polite way to request to speak." },
      { speaker: "a", text: "Of course. I will add it as item four. Now, the first topic is the quarterly sales report.", ar: "بالطبع. سأضيفها كنقطة الرابعة. الآن، الموضوع الأول هو تقرير المبيعات الفصلي." },
      { speaker: "b", text: "Thank you. I have the numbers ready. Sales are up twelve percent compared to last quarter.", ar: "شكراً. لدي الأرقام جاهزة. المبيعات ارتفعت اثني عشر بالمئة مقارنة بالربع السابق.", note: "'Up twelve percent' means an increase of 12%." },
      { speaker: "a", text: "Excellent. Let us move on to the next item. Any questions before we proceed?", ar: "ممتاز. لننتقل إلى النقطة التالية. أي أسئلة قبل أن نمضي قدماً؟", note: "'Let us move on' signals transitioning to the next topic." },
    ],
    quiz: quiz([
      { q: "What does 'Let us get started' mean?", choices: ["Let us leave", "Let us begin the meeting", "Let us cancel", "Let us argue"], answer: 1 },
      { q: "What does David want to do before the meeting starts?", choices: ["Leave early", "Add a point about client feedback", "Cancel the meeting", "Change the agenda"], answer: 1 },
    ]),
  },
  {
    id: "pro-scene-02b",
    lessonId: "pro-lesson-02-business-meetings",
    title: "Agreeing and Disagreeing Politely",
    levels: ["B1"],
    topics: ["business-meetings", "opinions"],
    setting: "around a meeting table",
    prop: "🤝",
    palette: ["#1a5276", "#5dade2"],
    characters: { a: { name: "Fatima", emoji: "👩‍🏫" }, b: { name: "Chris", emoji: "👨‍🔧" } },
    lines: [
      { speaker: "a", text: "I think we should launch the product in March. The market research supports it.", ar: "أعتقد أن يجب أن نطلق المنتج في مارس. البحث市場ي يدعم ذلك.", note: "'I think' introduces your opinion politely." },
      { speaker: "b", text: "I see your point, but I am not sure March is the best time. What about April?", ar: "أرى وجهة نظرك، لكنني لست متأكداً أن مارس هو الأفضل. ما رأيك في أبريل؟", note: "'I see your point, but...' is a polite way to disagree." },
      { speaker: "a", text: "That is a fair point. What concerns do you have about March?", ar: "هذه ملاحظة عادلة. ما هي مخاوفك بشأن مارس؟", note: "'That is a fair point' acknowledges the other person's view." },
      { speaker: "b", text: "Mainly the supply chain. We might not have enough stock ready by then.", ar: " chủ yếu سلسلة التوريد. قد لا لدينا مخزون كافٍ جاهز بحلول ذلك الوقت.", note: "'Supply chain' refers to the process of making and delivering products." },
      { speaker: "a", text: "Okay, let us agree on April then. I will update the project timeline.", ar: "حسناً، لنتفق على أبريل إذن. سأحدّث الجدول الزمني للمشروع.", note: "'Let us agree on' is used to reach consensus in meetings." },
    ],
    quiz: quiz([
      { q: "How does Chris disagree with Fatima politely?", choices: ["He says she is wrong", "He says 'I see your point, but...'", "He walks out", "He ignores her"], answer: 1 },
      { q: "Why does Chris prefer April over March?", choices: ["He likes April better", "The supply chain might not be ready", "March is too cold", "He has a holiday in March"], answer: 1 },
    ]),
  },

  // ── Lesson 03: Telephone and Video Calls ──────────────────────────────
  {
    id: "pro-scene-03a",
    lessonId: "pro-lesson-03-telephone-calls",
    title: "Answering a Business Call",
    levels: ["B1"],
    topics: ["telephone-calls", "customer-service"],
    setting: "at a reception desk",
    prop: "📞",
    palette: ["#6c3483", "#af7ac5"],
    characters: { a: { name: "Reception", emoji: "👩‍💼" }, b: { name: "Caller", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Good morning, Greenwood Solutions. How may I help you?", ar: "صباح الخير، حلول غرينوود. كيف يمكنني مساعدتك؟", note: "Business calls start with the company name and an offer to help." },
      { speaker: "b", text: "Hello, I am calling from TechVentures. I would like to speak to Mr. Williams about our contract.", ar: "مرحباً، أتصل من تك فين처ز. أريد التحدث مع وليامز بشأن عقدنا.", note: "'I am calling from' introduces who you are and your company." },
      { speaker: "a", text: "One moment please. Let me check if he is available.", ar: "لحظة من فضلك. دعني أتحقق مما إذا كان متاحاً.", note: "'One moment please' is a standard hold phrase." },
      { speaker: "a", text: "I am sorry, he is in a meeting at the moment. Can I take a message?", ar: "أنا آسفة، هو في اجتماع في هذه اللحظة. هل يمكنني ترك رسالة؟", note: "'At the moment' means 'right now'." },
      { speaker: "b", text: "Yes please. Could you ask him to call me back? My number is 07700 900 123.", ar: "نعم من فضلك. هل يمكنك طلبه للاتصال بي؟ رقمي هو 07700 900 123." },
      { speaker: "a", text: "Certainly. I will ask him to return your call. Is there anything else?", ar: "بالتأكيد. سأطلب منه إعادة اتصالك. هل هناك شيء آخر؟", note: "'Return your call' means to call you back." },
    ],
    quiz: quiz([
      { q: "Why can Mr. Williams not answer the call?", choices: ["He is on holiday", "He is in a meeting", "He is ill", "He is busy"], answer: 1 },
      { q: "What does 'return your call' mean?", choices: ["Send an email", "Call you back", "Ignore the call", "Change the number"], answer: 1 },
    ]),
  },

  // ── Lesson 04: Describing Your Job ────────────────────────────────────
  {
    id: "pro-scene-04a",
    lessonId: "pro-lesson-04-describing-your-job",
    title: "At a Networking Event",
    levels: ["B1"],
    topics: ["describing-job", "networking"],
    setting: "at a professional networking event with name badges",
    prop: "🏷️",
    palette: ["#1b4f72", "#5499c7"],
    characters: { a: { name: "Lena", emoji: "👩‍💻" }, b: { name: "Omar", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Hi, I am Lena. I work in the marketing department at BlueSky Media.", ar: "مرحبا، أنا لينا. أعمل في قسم التسويق في بلوسكاي ميديا.", note: "'I work in' + department is natural for describing where you work." },
      { speaker: "b", text: "Nice to meet you, Lena. I am Omar. I am a software engineer at DataCore.", ar: "تشرفت بلقائك لينا. أنا عمر. أنا مهندس برمجيات في داتا كور." },
      { speaker: "a", text: "That sounds interesting. What do you do on a typical day?", ar: "يبدو مثيراً للاهتمام. ماذا تفعل في يوم عادي؟", note: "'What do you do on a typical day?' is a natural networking question." },
      { speaker: "b", text: "I mainly work on building data pipelines and fixing bugs. We are a team of eight engineers.", ar: "أعمل بشكل أساسي على بناء خطوط البيانات وإصلاح الأخطاء. نحن فريق من ثمانية مهندسين.", note: "'Data pipelines' is a common tech term for data processing workflows." },
      { speaker: "a", text: "We should stay in touch. I might need help with data analytics for our campaigns.", ar: "يجب أن نبقى على تواصل. قد أحتاج مساعدة في تحليل البيانات لحملاتنا.", note: "'Stay in touch' is a standard networking closing phrase." },
    ],
    quiz: quiz([
      { q: "What does Lena do?", choices: ["She is a software engineer", "She works in marketing", "She is a data analyst", "She runs a company"], answer: 1 },
      { q: "What does 'stay in touch' mean?", choices: ["Stop talking", "Keep contact", "Leave now", "Change jobs"], answer: 1 },
    ]),
  },

  // ── Lesson 05: Business Travel ────────────────────────────────────────
  {
    id: "pro-scene-05a",
    lessonId: "pro-lesson-05-business-travel",
    title: "Booking a Hotel Room",
    levels: ["B1"],
    topics: ["business-travel", "accommodation"],
    setting: "at a hotel reception desk",
    prop: "🏨",
    palette: ["#784212", "#d4ac0d"],
    characters: { a: { name: "Guest", emoji: "👩‍💼" }, b: { name: "Receptionist", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Hello, I have a reservation under the name Clarke. I am here for the technology conference.", ar: "مرحبا، لدي حجز باسم كلارك. أنا هنا لمؤتمر التكنولوجيا.", note: "'Under the name' is used when checking into hotels." },
      { speaker: "b", text: "Welcome, Ms. Clarke. We have a business suite ready for you on the fifth floor.", ar: "مرحباً بك سيدية كلارك. لدينا جناح أعمال جاهز لك في الطابق الخامس." },
      { speaker: "a", text: "Thank you. Could you confirm the checkout time? I have an early flight on Friday.", ar: "شكراً. هل يمكنك تأكيد وقت المغادرة؟ لدي رحلة باكرة يوم الجمعة.", note: "'Confirm the checkout time' is standard when checking into a hotel." },
      { speaker: "b", text: "Checkout is at 11 AM. We can arrange an early checkout at 6 AM if needed.", ar: "المغادرة الساعة 11 صباحاً. يمكننا ترتيب مغادرة باكرة الساعة 6 صباحاً إذا لزم الأمر." },
      { speaker: "a", text: "That would be perfect. Could you also book a taxi to the airport for Friday morning?", ar: "سيكون مثالياً. هل يمكنك أيضاً حجز تاكسي للمطار يوم الجمعة صباحاً؟" },
    ],
    quiz: quiz([
      { q: "Why is Ms. Clarke staying at the hotel?", choices: ["For a holiday", "For a technology conference", "For a job interview", "To visit family"], answer: 1 },
      { q: "What time is the standard checkout?", choices: ["6 AM", "9 AM", "11 AM", "2 PM"], answer: 2 },
    ]),
  },

  // ── Lesson 06: Scheduling and Appointments ────────────────────────────
  {
    id: "pro-scene-06a",
    lessonId: "pro-lesson-06-scheduling",
    title: "Arranging a Meeting",
    levels: ["B1"],
    topics: ["scheduling", "appointments"],
    setting: "in an office corridor",
    prop: "📅",
    palette: ["#1a5276", "#48c9b0"],
    characters: { a: { name: "Nadia", emoji: "👩‍💼" }, b: { name: "Paul", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Paul, do you have time this week to discuss the budget proposal?", ar: "بول، هل لديك وقت هذا الأسبوع لمناقشة اقتراح الميزانية؟", note: "'Do you have time' is a natural way to ask about availability." },
      { speaker: "b", text: "Let me check my calendar. I am free on Wednesday afternoon, but Thursday morning would be better.", ar: "دعني أتحقق من تقويمي. أنا متاح يوم الأربعاء بعد الظهر، لكن صباح الخميس سيكون أفضل.", note: "'Let me check my calendar' is a standard response to scheduling requests." },
      { speaker: "a", text: "Thursday at ten works for me. Should we book a meeting room?", ar: "الخميس الساعة عشرة يناسبني. هل يجب أن نحجز غرفة اجتماعات؟" },
      { speaker: "b", text: "Yes, the glass room on the third floor is usually free. I will send you a calendar invite.", ar: "نعم، الزجاجية في الطابق الثالث عادة فارغة. سأرسل لك دعوة تقويم.", note: "'Calendar invite' is a standard way to send meeting invitations." },
      { speaker: "a", text: "Great. Please include the agenda so I can prepare the financial data beforehand.", ar: "ممتاز. يرجى تضمين جدول الأعمال حتى أتمكن من إعداد البيانات المالية مسبقاً.", note: "'Beforehand' means 'in advance' or 'before the meeting'." },
    ],
    quiz: quiz([
      { q: "When do Nadia and Paul agree to meet?", choices: ["Wednesday afternoon", "Thursday morning at 10", "Friday afternoon", "Monday morning"], answer: 1 },
      { q: "What does 'beforehand' mean?", choices: ["After the meeting", "During the meeting", "In advance", "At the same time"], answer: 2 },
    ]),
  },

  // ── Lesson 07: Understanding Business Documents ───────────────────────
  {
    id: "pro-scene-07a",
    lessonId: "pro-lesson-07-basic-documents",
    title: "Reading an Invoice",
    levels: ["B1"],
    topics: ["business-documents", "invoices"],
    setting: "at a desk reviewing paperwork",
    prop: "📄",
    palette: ["#4a235a", "#7d3c98"],
    characters: { a: { name: "Helen", emoji: "👩‍💼" }, b: { name: "Raj", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Raj, I received an invoice from the printing company but something looks wrong.", ar: "راج، تلقيت فاتورة من شركة الطباعة لكن شيئاً يبدو خاطئاً.", note: "'Invoice' is a bill requesting payment for goods or services." },
      { speaker: "b", text: "Let me take a look. Check the purchase order number and compare it with what we ordered.", ar: "دعني ألقي نظرة. تحقق من رقم طلب الشراء وقارنه بما طلبناه.", note: "'Purchase order' is a document sent to a supplier to buy goods." },
      { speaker: "a", text: "The quantity is wrong. They charged us for five hundred copies but we only ordered three hundred.", ar: "الكمية خاطئة. فاتورونا لمئة نسخة لكننا طلبنا ثلاثمئة نسخة فقط.", note: "'Charged us for' means they asked us to pay for." },
      { speaker: "b", text: "We need to flag this before making payment. Send them an email with the correct purchase order.", ar: "نحتاج إلى الإشارة إلى هذا قبل الدفع. أرسل لهم بريداً إلكترونياً مع طلب الشراء الصحيح.", note: "'Flag this' means to highlight or raise the issue." },
      { speaker: "a", text: "I will also note the discrepancy in our accounts so the finance team is aware.", ar: "سأدون أيضاً الاختلاف في حساباتنا حتى يكون فريق المالية على اطلاع.", note: "'Discrepancy' means a difference between what was expected and what happened." },
    ],
    quiz: quiz([
      { q: "What is wrong with the invoice?", choices: ["The price is too high", "The quantity is wrong", "The date is incorrect", "The company name is wrong"], answer: 1 },
      { q: "What does 'flag this' mean?", choices: ["Ignore the problem", "Highlight the issue", "Pay immediately", "Cancel the order"], answer: 1 },
    ]),
  },

  // ── Lesson 08: Report Writing ─────────────────────────────────────────
  {
    id: "pro-scene-08a",
    lessonId: "pro-lesson-08-report-writing",
    title: "Structuring a Business Report",
    levels: ["B2"],
    topics: ["report-writing", "business-reports"],
    setting: "in a meeting room discussing a draft report",
    prop: "📊",
    palette: ["#1b2631", "#5d6d7e"],
    characters: { a: { name: "Claire", emoji: "👩‍💼" }, b: { name: "Marco", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Marco, I have drafted the quarterly performance report. Could you review the executive summary?", ar: "مارك، كتبت مسودة تقرير الأداء الفصلي. هل يمكنك مراجعة الملخص التنفيذي؟", note: "'Executive summary' is a brief overview at the start of a report." },
      { speaker: "b", text: "Sure. The structure looks good — summary, introduction, findings, recommendations. But the findings need more data.", ar: "بالطبع. البنية تبدو جيدة — ملخص، مقدمة، نتائج، توصيات. لكن النتائج تحتاج مزيداً من البيانات.", note: "Reports typically follow: summary → introduction → findings → conclusions → recommendations." },
      { speaker: "a", text: "You are right. I will add the sales figures from Q1 and Q2 to support the analysis.", ar: "أنت محق. سأضيف أرقام المبيعات من الربع الأول والثاني لدعم التحليل.", note: "'Support the analysis' means to provide evidence for your conclusions." },
      { speaker: "b", text: "Also, the recommendations should be specific. Instead of 'improve efficiency', say 'reduce processing time by fifteen percent'.", ar: "أيضاً، يجب أن تكون التوصيات محددة. بدلاً من 'تحسين الكفاءة'، قل 'تقليل وقت المعالجة بنسبة خمسة عشر بالمئة'.", note: "Good recommendations are specific and measurable." },
      { speaker: "a", text: "Understood. I will revise it and send the updated version by tomorrow morning.", ar: "مفهوم. سأراجعها وأرسل النسخة المحدّثة بحلول صباح الغد.", note: "'Revise' means to review and make changes." },
    ],
    quiz: quiz([
      { q: "What does Marco say the findings need?", choices: ["More pages", "More data", "More colours", "More authors"], answer: 1 },
      { q: "Why should recommendations be specific?", choices: ["To make the report longer", "So they can be measured and acted on", "To impress the reader", "Because the boss likes details"], answer: 1 },
    ]),
  },

  // ── Lesson 09: Presentations ──────────────────────────────────────────
  {
    id: "pro-scene-09a",
    lessonId: "pro-lesson-09-presentations",
    title: "Opening a Presentation",
    levels: ["B2"],
    topics: ["presentations", "public-speaking"],
    setting: "at the front of a meeting room with slides",
    prop: "📽️",
    palette: ["#0e4d6e", "#2e86c1"],
    characters: { a: { name: "Sophie", emoji: "👩‍🏫" }, b: { name: "Attendee", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Good afternoon everyone. Thank you for joining. Today I will walk you through our 2026 marketing strategy.", ar: "مساء الخير جميعاً. شكراً لانضمامكم. اليوم سأمركم ب的战略ية التسويقية لعام 2026.", note: "'Walk you through' means to explain something step by step." },
      { speaker: "a", text: "I have divided the presentation into three sections: current performance, challenges, and our proposed approach.", ar: "قسمت العرض إلى ثلاثة أقسام: الأداء الحالي، التحديات، والمنهج المقترح.", note: "Signposting the structure helps the audience follow your logic." },
      { speaker: "b", text: "Could you briefly explain what you mean by proposed approach?", ar: "هل يمكنك شرح موجز ل.meaning ما تعنيه بالمنهج المقترح؟", note: "'Briefly' is used to ask for a short explanation." },
      { speaker: "a", text: "Of course. By proposed approach, I mean the new channels and budget allocation we are recommending.", ar: "بالطبع. بالمنهج المقترح أعني القنوات الجديدة وتوزيع الميزانية الذي نوصي به.", note: "'Budget allocation' refers to how money is divided across areas." },
      { speaker: "a", text: "Let us look at the first slide. As you can see, our organic reach has grown by eighteen percent.", ar: "لننظر إلى الشريحة الأولى. كما ترون، نمو وصولنا العضوي بنسبة ثمانية عشر بالمئة.", note: "'As you can see' directs attention to a visual aid." },
    ],
    quiz: quiz([
      { q: "What does 'walk you through' mean?", choices: ["Give a tour", "Explain step by step", "Skip the details", "Run quickly"], answer: 1 },
      { q: "Why does Sophie signpost the presentation structure?", choices: ["To fill time", "To help the audience follow", "Because she forgot", "To show her slides"], answer: 1 },
    ]),
  },

  // ── Lesson 10: Negotiations ──────────────────────────────────────────
  {
    id: "pro-scene-10a",
    lessonId: "pro-lesson-10-negotiations",
    title: "Price Negotiation",
    levels: ["B2"],
    topics: ["negotiations", "sales"],
    setting: "across a negotiation table",
    prop: "🤝",
    palette: ["#7b241c", "#cb4335"],
    characters: { a: { name: "Emma", emoji: "👩‍💼" }, b: { name: "Hiroshi", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "We appreciate the offer, but the unit price of forty-five dollars is above our budget.", ar: "نقدّر العرض، لكن سعر الوحدة خمسة وأربعون دولاراً يتجاوز ميزانيتنا.", note: "'Above our budget' is a diplomatic way to say something is too expensive." },
      { speaker: "b", text: "I understand. What price did you have in mind? We are open to discussion.", ar: "أفهم. ما هو السعر الذي تفكر فيه؟ نحن مناقشة مفتوحة.", note: "'What did you have in mind' invites the other party to make an offer." },
      { speaker: "a", text: "We could agree to thirty-eight dollars if you commit to a minimum order of two thousand units.", ar: "يمكننا الاتفاق على ثمانية وثلاثين دولاراً إذا التزمتم بحد أدنى للطلب ألفي وحدة.", note: "'Commit to' means to agree to do something formally." },
      { speaker: "b", text: "Thirty-eight is quite low for us. How about forty-one with the same minimum?", ar: "ثمانية وثلاثون منخفض جداً لدينا. ما رأيك في واحد وأربعين مع نفس الحد الأدنى؟", note: "'How about' introduces a counter-offer." },
      { speaker: "a", text: "Let me speak to my manager. If we can agree on forty, we have a deal.", ar: "دعني أتحدث مع مديري. إذا نتفق على أربعين، لدينا صفقة.", note: "'We have a deal' means the negotiation is successfully concluded." },
    ],
    quiz: quiz([
      { q: "What is Emma's concern about the original offer?", choices: ["The quality is poor", "The price is above budget", "The delivery is too slow", "The quantity is too small"], answer: 1 },
      { q: "What does 'How about' introduce in a negotiation?", choices: ["A complaint", "A counter-offer", "A cancellation", "A threat"], answer: 1 },
    ]),
  },

  // ── Lesson 11: Job Interviews ─────────────────────────────────────────
  {
    id: "pro-scene-11a",
    lessonId: "pro-lesson-11-job-interviews",
    title: "Answering Behavioral Questions",
    levels: ["B2"],
    topics: ["job-interviews", "career"],
    setting: "in an interview room with two interviewers",
    prop: "🎤",
    palette: ["#1a3c5e", "#3498db"],
    characters: { a: { name: "Interviewer", emoji: "👩‍💼" }, b: { name: "Candidate", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Tell me about a time you had to deal with a difficult colleague. How did you handle it?", ar: "أخبرني عن وقت اضطرت للتعامل مع زميل صعب. كيف تعاملت معه؟", note: "Behavioral questions ask for specific past examples." },
      { speaker: "b", text: "In my previous role, a colleague consistently missed deadlines which affected the whole team.", ar: "في وظيفتي السابقة، كان زميل يفوت المواعيد النهائية بشكل متكرر مما أثر على الفريق بأكمله.", note: "Start with the Situation — set the context briefly." },
      { speaker: "b", text: "I arranged a private conversation and asked what was causing the delays. It turned out they were overwhelmed with another project.", ar: "رتبت محادثة خاصة وسألت ما الذي تسبب في التأخيرات. تبين أنهم كانوا مثقلين بمشروع آخر.", note: "Then describe the Action — what you specifically did." },
      { speaker: "a", text: "And what was the result?", ar: "وما كان النتيجة؟" },
      { speaker: "b", text: "We redistributed some tasks and I mentored them on time management. They improved within two weeks, and our team hit the deadline.", ar: "أعدنا توزيع بعض المهام وقلدتهم على إدارة الوقت. تحسنوا خلال أسبوعين، وحقق الفريق الموعد النهائي.", note: "End with the Result — show the positive outcome." },
    ],
    quiz: quiz([
      { q: "What is the STAR method?", choices: ["A type of interview", "A way to structure answers", "A hiring tool", "A rating system"], answer: 1 },
      { q: "What was the result of the candidate's action?", choices: ["The colleague left", "The team missed the deadline", "The colleague improved and the deadline was met", "Nothing changed"], answer: 2 },
    ]),
  },

  // ── Lesson 12: Customer Service ───────────────────────────────────────
  {
    id: "pro-scene-12a",
    lessonId: "pro-lesson-12-customer-service",
    title: "Handling a Complaint",
    levels: ["B2"],
    topics: ["customer-service", "complaints"],
    setting: "on a customer service call",
    prop: "🎧",
    palette: ["#0b5345", "#1abc9c"],
    characters: { a: { name: "Agent", emoji: "👩‍💼" }, b: { name: "Customer", emoji: "👨‍💼" } },
    lines: [
      { speaker: "b", text: "I am really frustrated. I ordered the laptop two weeks ago and it still has not arrived.", ar: "أنا منزعج حقاً. طلبت الحاسوب قبل أسبوعين ولم يصل بعد.", note: "Customers often express emotions first before explaining the issue." },
      { speaker: "a", text: "I completely understand your frustration, and I sincerely apologise for the delay. Let me look into this for you right away.", ar: "أتفهم إحباطك تماماً، وأعتذر بصدق عن التأخير. دعني أتحقق من هذا لك فوراً.", note: "'I completely understand' validates the customer's feelings." },
      { speaker: "a", text: "I can see your order was dispatched on the tenth but the courier has had a service disruption.", ar: "أرى أن طلبك أُرسل في العاشر لكن شركة التوصيل عانت من اضطراب في الخدمة." },
      { speaker: "b", text: "That is not acceptable. I need it for a presentation on Monday.", ar: "هذا غير مقبول. أحتاجه لعرض تقديمي يوم الاثنين." },
      { speaker: "a", text: "I will escalate this with our priority shipping team and guarantee delivery by Friday. I will also apply a fifteen percent discount to your order.", ar: "سأ escalated هذا مع فريق الشحن ذات الأولوية وأضمن التوصيل بحلول الجمعة. سأطبق أيضاً خصم خمسة عشر بالمئة على طلبك.", note: "'Escalate' means to raise the issue to a higher level of support." },
    ],
    quiz: quiz([
      { q: "What does the agent do first when the customer complains?", choices: ["Argue back", "Validate the customer's feelings", "Offer a refund", "Blame the courier"], answer: 1 },
      { q: "What does 'escalate' mean in customer service?", choices: ["Ignore the problem", "Raise to a higher level of support", "Make it worse", "Close the ticket"], answer: 1 },
    ]),
  },

  // ── Lesson 13: Marketing and Sales ────────────────────────────────────
  {
    id: "pro-scene-13a",
    lessonId: "pro-lesson-13-marketing-sales",
    title: "Writing Marketing Copy",
    levels: ["B2"],
    topics: ["marketing", "copywriting"],
    setting: "in a creative team meeting",
    prop: "📝",
    palette: ["#7d3c98", "#d2b4de"],
    characters: { a: { name: "Zara", emoji: "👩‍🎨" }, b: { name: "Ben", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "The landing page copy needs a stronger call to action. 'Learn more' is too passive.", ar: "نص الصفحة المقصودة يحتاج دعوة للعمل أقوى. 'اعرف المزيد' سلبية جداً.", note: "'Call to action' (CTA) prompts the reader to do something specific." },
      { speaker: "b", text: "Agreed. What about 'Start your free trial today — no credit card required'?", ar: "متفق. ما رأيك في 'ابدأ تجربتك المجانية اليوم — لا حاجة لبطاقة ائتمان'؟" },
      { speaker: "a", text: "That is much better. It creates urgency and removes a barrier. We should also highlight the value proposition.", ar: "أفضل بكثير. تخلق إلحاحاً وتزيل عائقاً. يجب أن نسلط أيضاً على عرض القيمة.", note: "'Value proposition' explains why a product is worth buying." },
      { speaker: "b", text: "For the value proposition, I suggest: 'Save ten hours a week with automated reporting.'", ar: "عرض القيمة، أقترح: 'وفّر عشر ساعات أسبوعياً مع التقارير الآلية.'", note: "Good value propositions include a specific benefit." },
      { speaker: "a", text: "Perfect. And the social proof section needs customer testimonials with real results.", ar: "ممتاز. وقسم الإثبات الاجتماعي يحتاج شهادات العملاء مع نتائج حقيقية.", note: "'Social proof' uses other people's experiences to build trust." },
    ],
    quiz: quiz([
      { q: "Why is 'Learn more' considered weak?", choices: ["It is too long", "It is too passive and generic", "It is confusing", "It is rude"], answer: 1 },
      { q: "What is 'social proof'?", choices: ["A government certification", "Evidence from other customers' experiences", "A sales technique", "A type of advertisement"], answer: 1 },
    ]),
  },

  // ── Lesson 14: Project Management ─────────────────────────────────────
  {
    id: "pro-scene-14a",
    lessonId: "pro-lesson-14-project-communication",
    title: "Writing a Status Update",
    levels: ["B2"],
    topics: ["project-management", "status-updates"],
    setting: "at a desk writing a project email",
    prop: "📋",
    palette: ["#1c2833", "#566573"],
    characters: { a: { name: "Amy", emoji: "👩‍💼" }, b: { name: "Derek", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Derek, I need to write a project status update for the steering committee. What should I include?", ar: "ديريك، أكتب تحديث حالة للمشروع للجنة التوجيهية. ماذا يجب أن أدرج؟", note: "'Steering committee' is a group that oversees a project." },
      { speaker: "b", text: "Start with a RAG status — red, amber, or green — for overall health. Then list completed items and blockers.", ar: "ابدأ بحالة RAG — أحمر، برتقالي، أو أخضر — للحالة العامة. ثم ا列出 العناصر المكتملة والمعوقات.", note: "'RAG status' (Red/Amber/Green) is a quick way to show project health." },
      { speaker: "a", text: "The project is amber because we have a supplier delay. Should I mention that?", ar: "المشروع برتقالي لدينا تأخير من المورد. هل يجب أن أذكر ذلك؟" },
      { speaker: "b", text: "Yes, and include the impact, what you are doing about it, and when you expect resolution.", ar: "نعم، وادخل الأثر، وما الذي تفعله بخصوصه، ومتى تتوقع الحل.", note: "A good status update includes the issue, impact, action, and timeline." },
      { speaker: "a", text: "Got it. I will write: 'Supplier delay impacting UI components — escalated to procurement, resolution expected by Wednesday.'", ar: "فهمت. سأكتب: 'تأخير المورد يؤثر على مكونات واجهة المستخدم — تم تصعيده إلى المشتريات، الحل المتوقع بحلول الأربعاء.'", note: "Status updates should be concise and actionable." },
    ],
    quiz: quiz([
      { q: "What does RAG status stand for?", choices: ["Report, Analyse, Guide", "Red, Amber, Green", "Risk, Assessment, Growth", "Review, Approve, Go"], answer: 1 },
      { q: "What four things should a good status update include?", choices: ["Issue, impact, action, timeline", "Name, date, signature, subject", "Price, quantity, delivery, payment", "Team, budget, scope, risk"], answer: 0 },
    ]),
  },

  // ── Lesson 15: Persuasion and Influence ────────────────────────────────
  {
    id: "pro-scene-15a",
    lessonId: "pro-lesson-15-persuasion",
    title: "Persuading the Board",
    levels: ["C1"],
    topics: ["persuasion", "influence"],
    setting: "in a boardroom presenting to executives",
    prop: "🎯",
    palette: ["#1b2631", "#2c3e50"],
    characters: { a: { name: "Director", emoji: "👩‍💼" }, b: { name: "Manager", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "The board is sceptical about the new product line. They need convincing evidence, not just enthusiasm.", ar: "مجلس الإدارة متشكك بشأن خط المنتجات الجديدة. يحتاجون أدلة مقنعة وليس مجرد حماس.", note: "'Sceptical' means doubtful or not easily convinced." },
      { speaker: "b", text: "I will lead with the market gap data. We identified a forty percent underserved segment.", ar: "سأبدأ ببيانات الفراغ السوق. حددنا شريحاً غير مخدوم بنسبة أربعين بالمئة.", note: "'Lead with' means to start with the most important point." },
      { speaker: "a", text: "Good. But the CFO will ask about ROI. You need a clear financial projection.", ar: "جيد. لكن المدير المالي سيسأل عن العائد على الاستثمار. تحتاج توقعات مالية واضحة.", note: "'ROI' (Return on Investment) measures profit relative to cost." },
      { speaker: "b", text: "I have prepared three scenarios: conservative, moderate, and optimistic. Even the conservative model shows break-even within eighteen months.", ar: "أعددت ثلاث سيناريوهات: محافظة، معتدلة، ومتفائلة. حتى النموذج المحافظ يظهر التعادل خلال ثمانية عشر شهراً.", note: "'Break-even' is when revenue equals costs — no profit or loss." },
      { speaker: "a", text: "One more thing — anticipate the objection about resource allocation. Have a plan ready.", ar: "شيء واحد آخر — توقع اعتراض تخصيص الموارد. أعد خطة جاهزة.", note: "'Anticipate objections' means to prepare answers before questions are asked." },
    ],
    quiz: quiz([
      { q: "Why does the Director say to 'lead with' the market gap data?", choices: ["It is the longest point", "It is the most compelling evidence", "It is the cheapest data", "It is the easiest to understand"], answer: 1 },
      { q: "What does 'break-even' mean?", choices: ["Maximum profit", "Revenue equals costs", "The project fails", "The company goes bankrupt"], answer: 1 },
    ]),
  },

  // ── Lesson 16: Conflict Resolution ────────────────────────────────────
  {
    id: "pro-scene-16a",
    lessonId: "pro-lesson-16-conflict-resolution",
    title: "Mediating a Team Dispute",
    levels: ["C1"],
    topics: ["conflict-resolution", "mediation"],
    setting: "in a neutral meeting room",
    prop: "⚖️",
    palette: ["#4a235a", "#8e44ad"],
    characters: { a: { name: "Mediator", emoji: "👩‍⚖️" }, b: { name: "Team Lead", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "I understand there is tension between the design and development teams about the project timeline. Let us hear both sides.", ar: "أفهم أن هناك توتراً بين فريق التصميم وفريق التطوير بشأن الجدول الزمني للمشروع. لنسمع الطرفين.", note: "'Hear both sides' is essential in conflict resolution." },
      { speaker: "b", text: "The issue is that design keeps changing requirements after development has started. It causes rework.", ar: "المشكلة أن التصميم يستمر في تغيير المتطلبات بعد بدء التطوير. يسبب إعادة العمل.", note: "'Rework' means doing work again because of changes." },
      { speaker: "a", text: "I hear your concern. Let me reframe that — the challenge is managing scope changes without disrupting delivery. Is that fair?", ar: "أسمع مخاوفك. دعني أعيد صياغة ذلك — التحدي هو إدارة تغييرات النطاق دون إرباك التسليم. هل هذا عادل؟", note: "'Reframe' restates an issue in neutral, constructive language." },
      { speaker: "b", text: "Yes, that captures it. We need a change request process so changes go through proper review.", ar: "نعم، هذا يلتقطها. نحتاج عملية طلب تغيير حتى تمر التغييرات بمراجعة مناسبة.", note: "'Change request process' is a formal way to manage scope changes." },
      { speaker: "a", text: "Let us agree on a change freeze two weeks before the deadline. Any changes after that require board approval.", ar: "لنتفق على تجميد تغييرات قبل أسبوعين من الموعد النهائي. أي تغييرات بعد ذلك تتطلب موافقة المجلس.", note: "'Change freeze' is a period when no changes are allowed." },
    ],
    quiz: quiz([
      { q: "What does 'reframe' mean in conflict resolution?", choices: ["Ignore the issue", "Restate the issue in neutral language", "Assign blame", "End the discussion"], answer: 1 },
      { q: "What solution does the mediator propose?", choices: ["Fire someone", "Implement a change freeze before deadlines", "Cancel the project", "Move the team to a different office"], answer: 1 },
    ]),
  },

  // ── Lesson 17: Cross-Cultural Communication ───────────────────────────
  {
    id: "pro-scene-17a",
    lessonId: "pro-lesson-17-cross-cultural",
    title: "Working with International Teams",
    levels: ["C1"],
    topics: ["cross-cultural", "international-business"],
    setting: "in a video call with participants from different countries",
    prop: "🌍",
    palette: ["#0e6655", "#1abc9c"],
    characters: { a: { name: "Akiko", emoji: "👩‍💼" }, b: { name: "Marcus", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Marcus, I noticed that our Japanese partners rarely say 'no' directly. How should I interpret that?", ar: "مارك، لاحظت أن شركاءنا اليابانيين نادراً ما يقولون 'لا' مباشرة. كيف يجب أن أفسر ذلك؟", note: "In high-context cultures, direct disagreement is often avoided." },
      { speaker: "b", text: "Good observation. In Japan, a phrase like 'that would be difficult' often means no. Silence can also signal disagreement.", ar: "ملاحظة جيدة. في اليابان، عبارة 'هذا سيكون صعباً' تعني غالباً لا. الصمت يمكن أن يشير أيضاً إلى الاختلاف.", note: "'High-context' cultures rely on implicit communication and context." },
      { speaker: "a", text: "So I should read between the lines rather than taking everything at face value?", ar: "إذن يجب أن أقرأ بين السطور بدلاً من أخذ كل شيء كما هو ظاهر؟", note: "'Read between the lines' means to understand the implied meaning." },
      { speaker: "b", text: "Exactly. And when working with German or Dutch colleagues, they tend to be more direct. Do not mistake directness for rudeness.", ar: "بالضبط. عند العمل مع زملاء ألمان أو هولنديين، يميلون إلى التصريح أكثر. لا تخلط بين التصريح والوقاحة.", note: "Low-context cultures value direct, explicit communication." },
      { speaker: "a", text: "So the key is adapting my communication style to each culture while remaining respectful.", ar: "إذن المفتاح هو تكييف أسلوب تواصلي مع كل ثقافة مع الاحتفاظ بالاحترام." },
    ],
    quiz: quiz([
      { q: "What does 'that would be difficult' often mean in Japanese business culture?", choices: ["They need more time", "It means no", "They agree enthusiastically", "They want to discuss further"], answer: 1 },
      { q: "What is the difference between high-context and low-context cultures?", choices: ["High-context is louder", "High-context relies on implicit communication, low-context is more direct", "Low-context uses more body language", "There is no difference"], answer: 1 },
    ]),
  },

  // ── Lesson 18: Financial and Legal English ────────────────────────────
  {
    id: "pro-scene-18a",
    lessonId: "pro-lesson-18-financial-legal",
    title: "Reading a Contract Clause",
    levels: ["C1"],
    topics: ["financial-legal", "contracts"],
    setting: "in a legal review meeting",
    prop: "⚖️",
    palette: ["#1a237e", "#3f51b5"],
    characters: { a: { name: "Lawyer", emoji: "👩‍⚖️" }, b: { name: "CFO", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Clause 4.2 contains a limitation of liability that caps damages at the contract value. This is standard but worth noting.", ar: "البند 4.2 يحتوي على تقييد للمسؤولية يحدد الأضرار بقيمة العقد. هذا قياسي لكن يستحق الملاحظة.", note: "'Limitation of liability' restricts how much one party can claim in damages." },
      { speaker: "b", text: "What about the termination clause? I want to ensure we can exit if they fail to deliver.", ar: "ماذا عن بند الإنهاء؟ أريد التأكد من أنه يمكننا الخروج إذا فشلوا في التسليم.", note: "'Termination clause' defines how and when a contract can be ended." },
      { speaker: "a", text: "Clause 7 allows termination with thirty days written notice. But there is a penalty for early termination — five percent of remaining value.", ar: "البند 7 يسمح بالإنهاء بإشعار كتابي قبل ثلاثين يوماً. لكن هناك غرامة للإنهاء المبكر — خمسة بالمئة من القيمة المتبقية.", note: "'Written notice' means formal written notification." },
      { speaker: "b", text: "That penalty is steep. Can we negotiate it down to two percent?", ar: "هذه الغرامة عالية. هل يمكننا التفاوض لخفضها إلى اثنين بالمئة؟", note: "'Steep' here means excessively high." },
      { speaker: "a", text: "We can try. I would also recommend adding a force majeure clause to protect against unforeseeable circumstances.", ar: "يمكننا المحاولة. أوصي أيضاً بإضافة بند قوة قاهرة لحماية ضد ظروف غير متوقعة.", note: "'Force majeure' covers events like natural disasters that prevent contract fulfilment." },
    ],
    quiz: quiz([
      { q: "What does 'limitation of liability' do?", choices: ["Increases potential damages", "Caps the amount one party can claim", "Eliminates all responsibility", "Extends the contract duration"], answer: 1 },
      { q: "What is a 'force majeure' clause?", choices: ["A penalty clause", "A clause covering unforeseeable events", "A payment clause", "A confidentiality clause"], answer: 1 },
    ]),
  },

  // ── Lesson 19: Technical Communication ────────────────────────────────
  {
    id: "pro-scene-19a",
    lessonId: "pro-lesson-19-technical-communication",
    title: "Writing a User Guide",
    levels: ["C1"],
    topics: ["technical-communication", "documentation"],
    setting: "at a desk writing technical documentation",
    prop: "📚",
    palette: ["#1c2833", "#85929e"],
    characters: { a: { name: "Dev", emoji: "👩‍💻" }, b: { name: "Tech Writer", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "The API documentation is confusing. Users keep asking basic setup questions that should be answered in the guide.", ar: "توثيق واجهة برمجة التطبيقات مربك. المستخدمون يطرحون أسئلة أساسية يجب أن تُجاب في الدليل.", note: "'API documentation' explains how to use a software interface." },
      { speaker: "b", text: "Let me restructure it. I will start with prerequisites, then step-by-step installation, then configuration.", ar: "دعني أعيد هيكلتها. سأبدأ بالمتطلبات المسبقة ثم خطوة بخطوة التثبيت ثم التكوين.", note: "Technical documents should follow a logical progression." },
      { speaker: "a", text: "Good idea. Also, avoid jargon like 'instantiate' and 'serialise'. Use plain language.", ar: "فكرة جيدة. أيضاً، تجنب المصطلحات التقنية مثل 'instansiate' و'serialise'. استخدم لغة واضحة.", note: "'Jargon' is specialist language that non-experts may not understand." },
      { speaker: "b", text: "You are right. I will change 'instantiate the object' to 'create a new instance' and add a code example.", ar: "أنت محق. سأغير 'instansiate the object' إلى 'create a new instance' وأضيف مثالاً برمجياً.", note: "Code examples make technical documentation much clearer." },
      { speaker: "a", text: "And add a troubleshooting section at the end. The most common errors should have clear solutions.", ar: "وأضف قسم استكشاف الأخطاء في النهاية. أكثر الأخطاء شيوعاً يجب أن يكون لها حلول واضحة.", note: "Troubleshooting sections reduce support requests significantly." },
    ],
    quiz: quiz([
      { q: "Why should technical writers avoid jargon?", choices: ["It makes documents longer", "It confuses non-expert readers", "It is outdated", "It is illegal"], answer: 1 },
      { q: "What should good API documentation include?", choices: ["Only the code", "Prerequisites, installation steps, configuration, and examples", "Just a README", "Marketing content"], answer: 1 },
    ]),
  },

  // ── Lesson 20: Media and Public Relations ──────────────────────────────
  {
    id: "pro-scene-20a",
    lessonId: "pro-lesson-20-media-pr",
    title: "Preparing for a Media Interview",
    levels: ["C1"],
    topics: ["media-pr", "public-relations"],
    setting: "in a press room before an interview",
    prop: "🎙️",
    palette: ["#6c3483", "#bb8fce"],
    characters: { a: { name: "Spokesperson", emoji: "👩‍💼" }, b: { name: "PR Advisor", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "I am nervous about the interview. What if they ask about the product recall?", ar: "أنا متوترة بشأن المقابلة. ماذا لو سألوا عن استدعاء المنتج؟", note: "'Product recall' is when a company asks customers to return a defective product." },
      { speaker: "b", text: "Stay on message. Acknowledge the issue, explain what you are doing, and focus on customer safety.", ar: "التزم بالرسالة. اعترف بالمشكلة، اشرح ما تفعله، وركز على سلامة العملاء.", note: "'Stay on message' means to keep returning to your key points." },
      { speaker: "a", text: "So I should say: 'We identified a quality issue, we have stopped production, and we are implementing new checks'?", ar: "إذن يجب أن أقول: 'حددنا مشكلة في الجودة، أوقفنا الإنتاج، ونطبق فحوصات جديدة'؟" },
      { speaker: "b", text: "Exactly. Do not speculate or blame suppliers. Keep it factual and empathetic.", ar: "بالضبط. لا تتكهن أو ألقي اللوم على المورود. ابقِ الحقيقة والتعاطف.", note: "In crisis PR, never speculate or assign blame publicly." },
      { speaker: "a", text: "What if they ask a question I cannot answer?", ar: "ماذا لو سألوا سؤالاً لا أستطيع الإجابة عليه؟" },
      { speaker: "b", text: "Use bridging: 'I cannot comment on that specifically, but what I can tell you is...' and redirect to your key message.", ar: "استخدم التقليد: 'لا أستطيع التعليق على ذلك تحديداً، لكن ما يمكنني قوله هو...' وأعد توجيه الرسالة الرئيسية.", note: "'Bridging' is a media technique to redirect difficult questions." },
    ],
    quiz: quiz([
      { q: "What should the spokesperson do when asked about the product recall?", choices: ["Deny everything", "Acknowledge, explain actions, and focus on safety", "Blame the supplier", "Refuse to comment"], answer: 1 },
      { q: "What is 'bridging' in media interviews?", choices: ["Building a connection", "Redirecting difficult questions to key messages", "Ending the interview", "Asking your own questions"], answer: 1 },
    ]),
  },

  // ── Lesson 21: Leadership Communication ────────────────────────────────
  {
    id: "pro-scene-21a",
    lessonId: "pro-lesson-21-leadership",
    title: "Delivering a Team Town Hall",
    levels: ["C1"],
    topics: ["leadership", "town-hall"],
    setting: "on stage in front of the entire company",
    prop: "🏛️",
    palette: ["#1b4f72", "#2980b9"],
    characters: { a: { name: "CEO", emoji: "👩‍💼" }, b: { name: "Employee", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "Thank you all for being here. I want to share our progress, be honest about our challenges, and outline where we are heading.", ar: "شكراً لكم جميعاً لوجودكم هنا. أريد مشاركة تقدمنا، وكون صادقاً بشأن تحدياتنا، وتحديد اتجاهنا.", note: "Town halls work best when leaders are transparent and specific." },
      { speaker: "a", text: "This quarter, we grew revenue by twenty-two percent, but I must be transparent — we also missed our hiring targets.", ar: "هذا الربع، نمينا الإيرادات بنسبة اثنين وعشرين بالمئة، لكن يجب أن أكون صريحاً — أضفنا أيضاً أهداف التوظيف.", note: "Sharing both good and bad news builds trust." },
      { speaker: "b", text: "What is the plan to address the talent shortage?", ar: "ما هي الخطة لمعالجة نقص الكفاءات؟", note: "'Talent shortage' means difficulty finding qualified people to hire." },
      { speaker: "a", text: "We are investing in three areas: internal development programmes, a revised recruitment process, and flexible working options.", ar: "نستثمر في ثلاث مجالات: برامج التطوير الداخلي، عملية توظيف منقحة، وخيارات عمل مرنة.", note: "Leaders should provide specific, actionable responses." },
      { speaker: "a", text: "I want to be clear: our people are our greatest asset, and we will act with urgency to support every team.", ar: "أريد أن أكون واضحاً: أناسنا هم أعظم أصولنا، وسنتصرف بإلحاح لدعم كل فريق.", note: "Closing with a commitment reinforces the key message." },
    ],
    quiz: quiz([
      { q: "Why does the CEO share both positive and negative information?", choices: ["To fill time", "To build trust through transparency", "To make people worried", "Because she forgot the good news"], answer: 1 },
      { q: "What are the three areas of investment the CEO mentions?", choices: ["Marketing, sales, and IT", "Internal development, recruitment, and flexible working", "New offices, travel, and events", "Training, bonuses, and equipment"], answer: 1 },
    ]),
  },

  // ── Lesson 22: Strategic Business Writing ──────────────────────────────
  {
    id: "pro-scene-22a",
    lessonId: "pro-lesson-22-strategic-writing",
    title: "Drafting a Strategic Proposal",
    levels: ["C2"],
    topics: ["strategic-writing", "executive"],
    setting: "in an executive office reviewing a document",
    prop: "📜",
    palette: ["#17202a", "#2c3e50"],
    characters: { a: { name: "CEO", emoji: "👩‍💼" }, b: { name: "Strategist", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "The board wants a three-year strategic plan. This needs to be airtight — every claim backed by data.", ar: "مجلس الإدارة يريد خطة استراتيجية ثلاثية. هذا يجب أن يكون محكماً — كل ادعاء مدعوم ببيانات.", note: "'Airtight' means complete, with no weaknesses or gaps." },
      { speaker: "b", text: "I have structured it as: vision, market analysis, strategic pillars, financial projections, and risk assessment.", ar: "هيكلتها كالتالي: رؤية، تحليل السوق، الركائز الاستراتيجية، التوقعات المالية، وتقييم المخاطر.", note: "Strategic documents need a clear, logical structure." },
      { speaker: "a", text: "The financial projections need three scenarios. The board will challenge any optimistic assumptions.", ar: "التوقعات المالية تحتاج ثلاث سيناريوهات. مجلس الإدارة سيتحدى أي افتراضات متفائلة.", note: "Multiple scenarios demonstrate rigorous thinking." },
      { speaker: "b", text: "Agreed. I have also included a competitive landscape section showing where we outperform and where we lag.", ar: "متفق. أدرجت أيضاً قسم المشهد التنافسي يظهر حيث نتفوق و حيث نتخلف.", note: "'Competitive landscape' maps your position relative to rivals." },
      { speaker: "a", text: "The risk section is critical. Be explicit about what could go wrong and our mitigation strategies.", ar: "قسم المخاطر حرج. كن صريحاً بشأن ما قد يخطئ واستراتيجيات التخفيف لدينا.", note: "'Mitigation strategies' are plans to reduce the impact of risks." },
    ],
    quiz: quiz([
      { q: "Why does the CEO want three financial scenarios?", choices: ["To make the document longer", "To show the board rigorous analysis", "Because she cannot decide", "To confuse the readers"], answer: 1 },
      { q: "What does 'mitigation strategies' mean?", choices: ["Ways to increase risk", "Plans to reduce the impact of risks", "Strategies to avoid work", "Plans to blame others"], answer: 1 },
    ]),
  },

  // ── Lesson 23: Executive Presentations ─────────────────────────────────
  {
    id: "pro-scene-23a",
    lessonId: "pro-lesson-23-executive-presentations",
    title: "Presenting to the Board",
    levels: ["C2"],
    topics: ["executive-presentations", "boardroom"],
    setting: "in a boardroom with directors around a table",
    prop: "🏛️",
    palette: ["#1a237e", "#5c6bc0"],
    characters: { a: { name: "CFO", emoji: "👩‍💼" }, b: { name: "Board Chair", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "The three-year forecast shows a path to profitability by Q3 2027. Allow me to walk you through the key assumptions.", ar: "التنبؤات الثلاثية تظهر نحو الربحية بحلول الربع الثالث 2027. اسمحوا لي أشرح الافتراضات الرئيسية.", note: "Executive presentations must be concise and assumption-driven." },
      { speaker: "b", text: "Before you continue — what is the single biggest risk to this forecast?", ar: "قبل أن تكملي — ما هو أكبر مخاطرة واحدة لهذا التنبؤ؟", note: "Board members often ask for the biggest risk upfront." },
      { speaker: "a", text: "Currency fluctuation. Sixty percent of our costs are in USD while revenue is primarily in EUR. A ten percent shift would delay break-even by two quarters.", ar: "تقلبات العملات. ستون بالمئة من تكاليمنا بالدولار بينما الإيرادات أساساً باليورو. تحول عشر بالمئة سيؤخر التعادل بquarterين.", note: "Quantify risks in terms the board can understand." },
      { speaker: "b", text: "What hedging strategy are you proposing?", ar: "ما هي استراتيجية التحوط التي تقترحها؟", note: "'Hedging' is a financial strategy to reduce currency risk." },
      { speaker: "a", text: "A rolling forward contract covering seventy percent of our exposure for the next eighteen months. This limits downside while preserving upside potential.", ar: "عقد前瞻性 طويل يغطي سبعين بالمئة من تعرضنا للثمانية عشر شهراً接下来. هذا يحد من الخسارة مع الحفاظ على إمكانية الربح.", note: "'Downside' and 'upside' refer to potential losses and gains." },
    ],
    quiz: quiz([
      { q: "Why does the CFO quantify the currency risk in terms of break-even timing?", choices: ["To confuse the board", "To make the impact concrete and actionable", "To show off financial knowledge", "Because the board asked for it"], answer: 1 },
      { q: "What is a 'rolling forward contract'?", choices: ["A contract that moves locations", "A financial instrument to manage currency exposure", "A temporary employment contract", "A contract with no end date"], answer: 1 },
    ]),
  },

  // ── Lesson 24: Crisis Communication ────────────────────────────────────
  {
    id: "pro-scene-24a",
    lessonId: "pro-lesson-24-crisis-communication",
    title: "Managing a Data Breach Announcement",
    levels: ["C2"],
    topics: ["crisis-communication", "data-breach"],
    setting: "in an emergency operations centre",
    prop: "🚨",
    palette: ["#922b21", "#e74c3c"],
    characters: { a: { name: "Comms Director", emoji: "👩‍💼" }, b: { name: "CTO", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "We need to issue a public statement within the hour. Transparency is non-negotiable here.", ar: "نحتاج إلى إ بيان عام خلال ساعة. الشفافية غير قابلة للتفاوض هنا.", note: "In a crisis, speed and transparency are critical." },
      { speaker: "b", text: "The investigation confirms approximately fifty thousand records were accessed. No financial data was compromised.", ar: "التحقيق يؤكد أن نحو خمسين ألف سجل تم الوصول إليها. لا بيانات مالية تم اختراقها.", note: "Be specific about what happened — vague statements erode trust." },
      { speaker: "a", text: "The statement should: acknowledge the incident, explain what data was affected, outline what we are doing, and provide a helpline.", ar: "البيان يجب أن: يعترف بالحادث، يشرح البيانات المتضررة، يoutline ما نفعله، ويوفر خط مساعدة.", note: "A crisis statement has four parts: acknowledge, explain, action, support." },
      { speaker: "b", text: "Should we mention the attacker? We believe it was a sophisticated external threat.", ar: "هل نذكر المهاجم؟ نعتقد أنه كان تهديداً خارجياً متقدماً.", note: "Avoid speculation about attackers unless confirmed." },
      { speaker: "a", text: "Do not speculate on attribution. Say 'unauthorised third party' until law enforcement confirms. We also need internal communication before the public statement.", ar: "لا تتكهن بشأن الإسناد. قل 'طرف ثالث غير مصرح له' حتى يؤكد/licenses للإنفاذ. نحتاج أيضاً تواصلاً داخلياً قبل البيان العام.", note: "Employees should hear about a crisis before the public does." },
    ],
    quiz: quiz([
      { q: "What are the four parts of a crisis statement?", choices: ["Blame, deny, threaten, ignore", "Acknowledge, explain, action, support", "Deny, delay, deflect, dismiss", "Apologise, resign, compensate, forget"], answer: 1 },
      { q: "Why does the Comms Director say not to speculate about the attacker?", choices: ["To protect the attacker", "Because attribution must be confirmed by law enforcement", "Because it is not important", "Because the attacker is a client"], answer: 1 },
    ]),
  },

  // ── Lesson 25: Change Management ───────────────────────────────────────
  {
    id: "pro-scene-25a",
    lessonId: "pro-lesson-25-change-management",
    title: "Announcing Organisational Restructuring",
    levels: ["C2"],
    topics: ["change-management", "restructuring"],
    setting: "in an all-hands meeting room",
    prop: "🔄",
    palette: ["#1b4332", "#2d6a4f"],
    characters: { a: { name: "HR Director", emoji: "👩‍💼" }, b: { name: "Team Member", emoji: "👨‍💻" } },
    lines: [
      { speaker: "a", text: "I know change can be unsettling. I want to explain openly why we are restructuring and what it means for each of you.", ar: "أعلم أن التغيير قد يكون مقلقاً. أريد أن أشرح بصراحة لماذا نعيد الهيكلة وماذا يعني لكل منكم.", note: "Acknowledging emotions builds trust during change." },
      { speaker: "b", text: "Will there be redundancies? That is what everyone is worried about.", ar: "هل سيكون هناك فائضوظائف؟ هذا ما يقلق الجميع.", note: "Address the hardest question first — do not avoid it." },
      { speaker: "a", text: "Some roles will change and some may be affected. No decisions are final yet, and we are committed to redeployment before any other measures.", ar: "بعض الأدوار ستتغير وقد تتأثر بعضها. لا قرارات نهائية بعد، وملتزمون بإعادة التوظيف قبل أي إجراءات أخرى.", note: "'Redeployment' means moving employees to different roles instead of laying them off." },
      { speaker: "a", text: "We are also creating a support programme with career coaching, skills workshops, and a dedicated helpline.", ar: "ننشئ أيضاً برنامج دعم مع التوجيه المهني، وورش عمل المهارات، وخط مساعدة مخصص.", note: "Providing support structures shows genuine care for employees." },
      { speaker: "b", text: "I appreciate the transparency. Can we get more details in writing by Friday?", ar: "أقدر الشفافية. هل يمكننا الحصول على مزيد من التفاصيل كتابياً بحلول الجمعة؟" },
      { speaker: "a", text: "Yes. A detailed FAQ and individual consultation schedules will be sent by Thursday.", ar: "نعم. أسئلة مrequent شائعة مفصلة ومواعيد استشارات فردية ستُرسل بحلول الخميس.", note: "Written follow-up ensures everyone has the same information." },
    ],
    quiz: quiz([
      { q: "Why does the HR Director address redundancies directly?", choices: ["She enjoys bad news", "Avoiding it would erode trust", "She wants to scare people", "Legal requirements"], answer: 1 },
      { q: "What is 'redeployment'?", choices: ["Firing employees", "Moving employees to different roles", "Hiring new people", "Closing the company"], answer: 1 },
    ]),
  },

  // ── Lesson 26: Mergers and Acquisitions ────────────────────────────────
  {
    id: "pro-scene-26a",
    lessonId: "pro-lesson-26-ma-language",
    title: "Due Diligence Discussion",
    levels: ["C2"],
    topics: ["mergers-acquisitions", "due-diligence"],
    setting: "in a law firm conference room",
    prop: "🔍",
    palette: ["#4a148c", "#7b1fa2"],
    characters: { a: { name: "Acquisitions Lead", emoji: "👩‍💼" }, b: { name: "Legal Counsel", emoji: "👨‍⚖️" } },
    lines: [
      { speaker: "a", text: "The due diligence report flagged three material risks. I need to understand the exposure before we proceed.", ar: "تقرير العناية الواجبة أشار إلى ثلاث مخاطرة جوهرية. أحتاج فهم التعرض قبل المضي قدماً.", note: "'Due diligence' is the investigation process before acquiring a company." },
      { speaker: "b", text: "The first is an unresolved IP dispute worth up to twelve million. The second is a pending regulatory investigation in Brazil.", ar: "الأول هو نزاع ملكية فكرية لم يحسم بقيمة تصل إلى اثني عشر مليوناً. الثاني là تحقيق تنظيمي معلق في البرازيل.", note: "'Material risks' are risks significant enough to affect the deal." },
      { speaker: "a", text: "What about the third?", ar: "ماذا عن الثالث؟" },
      { speaker: "b", text: "The third is a concentration risk — forty percent of revenue comes from a single client. If they leave, valuation drops significantly.", ar: "الثالث هو مخاطرة التركيز — أربعين بالمئة من الإيرادات تأتي من عميل واحد. إذا غادر، ينخفض التقييم بشكل ملحوظ.", note: "'Concentration risk' means depending too heavily on one source." },
      { speaker: "a", text: "We should negotiate an earn-out clause tied to client retention and request representations and warranties on the IP dispute.", ar: "يجب أن نتفق على بند أرباح مربوطة بالاحتفاظ بالعميل ونطلب تمثيلات وضمانات بشأن نزاع الملكية الفكرية.", note: "'Earn-out' ties part of the payment to future performance. 'Representations and warranties' are legal assurances." },
    ],
    quiz: quiz([
      { q: "What is 'due diligence'?", choices: ["A type of contract", "The investigation before acquiring a company", "A financial audit", "A tax calculation"], answer: 1 },
      { q: "What is 'concentration risk'?", choices: ["Too many products", "Depending too heavily on one source", "Spreading resources too thin", "Having too many offices"], answer: 1 },
    ]),
  },

  // ── Lesson 27: Corporate Governance ────────────────────────────────────
  {
    id: "pro-scene-27a",
    lessonId: "pro-lesson-27-corporate-governance",
    title: "Writing Board Minutes",
    levels: ["C2"],
    topics: ["corporate-governance", "board-minutes"],
    setting: "in a boardroom after a meeting",
    prop: "📝",
    palette: ["#212f3d", "#34495e"],
    characters: { a: { name: "Company Secretary", emoji: "👩‍💼" }, b: { name: "Board Chair", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "I have drafted the minutes from today's board meeting. Shall I read through the key resolutions?", ar: "كتبت مسودة محاضر اجتماع المجلس اليوم. هل تريد أن أقرأ القرارات الرئيسية؟", note: "'Minutes' are the official written record of a meeting." },
      { speaker: "b", text: "Yes, but ensure the language is precise. Board minutes can be used as legal evidence.", ar: "نعم، لكن تأكدي من أن اللغة دقيقة. محاضر المجلس يمكن أن تُستخدم كدليل قانوني.", note: "Board minutes must be factually accurate because they have legal standing." },
      { speaker: "a", text: "Resolution one: The board approved the acquisition of Meridian Ltd, subject to final regulatory clearance.", ar: "القرار الأول: وافق المجلس على الاستحواذ على ميريديان المحدودة، شريطة الحصول على موافقة تنظيمية نهائية.", note: "Resolutions should be recorded verbatim with any conditions." },
      { speaker: "b", text: "Good. Make sure to record who proposed and who seconded each resolution, and note any dissenting votes.", ar: "جيد. تأكدي من تسجيل من اقترح و من seconded كل قرار، ودلي أي أصوات معارضة.", note: "Minutes must record proposers, seconders, and dissenting votes." },
      { speaker: "a", text: "I have noted that Director Williams abstained from the acquisition vote due to a conflict of interest. Should I add more detail?", ar: "دونت أن المدير ويليامز امتنع عن التصويت بسبب تضارب في المصالح. هل يجب أن أضيف تفاصيل أكثر؟" },
      { speaker: "b", text: "That is sufficient. The conflict of interest register was already updated. Send the draft for review by close of business tomorrow.", ar: "هذا كافٍ. سجل تضارب المصالح تم تحديثه بالفعل. أرسل المسودة للمراجعة بحلول نهاية العمل غداً.", note: "'Close of business' means the end of the working day." },
    ],
    quiz: quiz([
      { q: "Why are board minutes legally important?", choices: ["They are published publicly", "They can be used as legal evidence", "They are required by tax law", "They are needed for marketing"], answer: 1 },
      { q: "What must board minutes record about resolutions?", choices: ["Only the outcome", "The proposer, seconder, and any dissenting votes", "The time spent discussing", "The room where the meeting was held"], answer: 1 },
    ]),
  },

  // ── Lesson 28: Thought Leadership ──────────────────────────────────────
  {
    id: "pro-scene-28a",
    lessonId: "pro-lesson-28-thought-leadership",
    title: "Writing an Industry Article",
    levels: ["C2"],
    topics: ["thought-leadership", "industry-voice"],
    setting: "at a desk writing for a professional publication",
    prop: "✍️",
    palette: ["#1a1a2e", "#16213e"],
    characters: { a: { name: "Editor", emoji: "👩‍💼" }, b: { name: "Author", emoji: "👨‍💼" } },
    lines: [
      { speaker: "a", text: "Your draft on AI governance is strong, but the opening needs a hook. Start with a provocative question or a striking statistic.", ar: "مسودتك حول حوكمة الذكاء الاصطناعي قوية، لكن المقدمة تحتاج خطافاً. ابدأ بسؤال استفزازي أو إحصائية صادمة.", note: "'Hook' is an opening technique to grab the reader's attention immediately." },
      { speaker: "b", text: "How about: 'By 2028, eighty percent of enterprise decisions will be influenced by AI — yet fewer than ten percent of boards have an AI governance framework'?", ar: "ما رأيك في: 'بحلول 2028، ثمانون بالمئة من قرارات المؤسسات ستتأثر بالذكاء الاصطناعي — لكن أقل من عشرة بالمئة من المجالس لديها إطار حوكمة للذكاء الاصطناعي'؟", note: "Statistics create authority and urgency in thought leadership." },
      { speaker: "a", text: "Excellent. Now, the body needs your original analysis, not just a summary of what others have written.", ar: "ممتاز. الآن، المتن يحتاج تحليلك الأصيل، ليس مجرد ملخص لما كتبه الآخرون.", note: "Thought leadership requires original thinking, not just reporting." },
      { speaker: "b", text: "I will add my framework for responsible AI adoption — the three-pillar model I developed from working with five enterprise clients.", ar: "سأضيف إطاري للتبني المسؤول للذكاء الاصطناعي — النموذج الثلاثي الأعمدة الذي طورته من العمل مع خمسة عملاء مؤسسات.", note: "Original frameworks and models are the core of thought leadership." },
      { speaker: "a", text: "Perfect. And close with a call to action — what should readers do next? This is what makes the article memorable.", ar: "ممتاز. وأختم بدعوة للعمل — ماذا يجب أن يفعل القراء بعد هذا؟ هذا ما يجعل المقال لا يُنسى.", note: "Thought leadership articles should inspire action, not just inform." },
    ],
    quiz: quiz([
      { q: "What is a 'hook' in writing?", choices: ["A fishing tool", "An opening technique to grab attention", "A conclusion", "A type of citation"], answer: 1 },
      { q: "Why is a statistic effective in thought leadership?", choices: ["It makes the article longer", "It creates authority and urgency", "It is required by editors", "It fills space"], answer: 1 },
    ]),
  },
];

export function scenesForProfessionalLesson(lessonId: string): ProfessionalScene[] {
  return PROFESSIONAL_SCENES.filter((s) => s.lessonId === lessonId);
}

export function allProfessionalSceneIds(): string[] {
  return PROFESSIONAL_SCENES.map((s) => s.id);
}
