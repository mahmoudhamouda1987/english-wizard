import type { MaterialExercise, LessonMaterials } from "./lesson-materials";

export interface ProfessionalMaterialEntry {
  lessonId: string;
  vocab: Array<{ word: string; ar: string; pos: string; en: string }>;
  exercises: MaterialExercise[];
}

function ex(q: string, choices: string[], answer: number): MaterialExercise {
  return { q, choices, answer };
}

export const PROFESSIONAL_MATERIALS: ProfessionalMaterialEntry[] = [
  // ── Lesson 01: Professional Email Writing ──────────────────────────────
  {
    lessonId: "pro-lesson-01-professional-emails",
    vocab: [
      { word: "subject line", ar: "سطر الموضوع", pos: "noun", en: "The title of an email" },
      { word: "follow up", ar: "تتبع", pos: "verb", en: "To check on something after initial contact" },
      { word: "attachment", ar: "مرفق", pos: "noun", en: "A file sent with an email" },
      { word: "cc", ar: "نسخة", pos: "verb", en: "To send a copy to someone" },
      { word: "regards", ar: "تحيات", pos: "noun", en: "A polite closing for emails" },
      { word: "inquiry", ar: "استفسار", pos: "noun", en: "A request for information" },
      { word: "deadline", ar: "موعد نهائي", pos: "noun", en: "The latest time something must be done" },
      { word: "brief", ar: "موجز", pos: "noun", en: "A short summary of information" },
      { word: "approval", ar: "موافقة", pos: "noun", en: "Official agreement or permission" },
      { word: "reminder", ar: "تذكير", pos: "noun", en: "A message that reminds someone of something" },
      { word: "proposed", ar: "مقترح", pos: "adjective", en: "Suggested for consideration" },
      { word: "clarification", ar: "توضيح", pos: "noun", en: "Making something clearer" },
      { word: "appreciate", ar: "أقدر", pos: "verb", en: "To be grateful for" },
      { word: "promptly", ar: "فوراً", pos: "adverb", en: "Without delay" },
    ],
    exercises: [
      ex("Which is the best subject line for a project update email?", ["Update", "PROJECT UPDATE: Q2 Results and Next Steps", "Hello", "Important"], 1),
      ex("What does 'CC' mean in an email?", ["Carbon copy — send a copy to someone", "Create change", "Close conversation", "Confirm contact"], 0),
      ex("'I would appreciate your prompt response' is more formal than:", ["Reply fast", "Do it now", "Send it quick", "Hurry up"], 0),
      ex("Which closing is most appropriate for a professional email?", ["Bye!", "Cheers mate", "Kind regards", "Talk soon"], 2),
    ],
  },

  // ── Lesson 02: Business Meetings ──────────────────────────────────────
  {
    lessonId: "pro-lesson-02-business-meetings",
    vocab: [
      { word: "agenda", ar: "جدول أعمال", pos: "noun", en: "A list of items to be discussed" },
      { word: "minutes", ar: "محاضر", pos: "noun", en: "Written record of a meeting" },
      { word: "action point", ar: "نقطة إجراء", pos: "noun", en: "A task assigned during a meeting" },
      { word: "quorum", ar: "نصيب", pos: "noun", en: "Minimum number needed to hold a valid meeting" },
      { word: "adjourn", ar: "تأجيل", pos: "verb", en: "To temporarily stop a meeting" },
      { word: "consensus", ar: "إجماع", pos: "noun", en: "General agreement among participants" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone with an interest in the outcome" },
      { word: "feasibility", ar: "جدوى", pos: "noun", en: "Whether something can be done" },
      { word: "proposal", ar: "اقتراح", pos: "noun", en: "A formal suggestion or plan" },
      { word: "prioritise", ar: "أولوية", pos: "verb", en: "To decide what is most important" },
      { word: "allocate", ar: "تخصيص", pos: "verb", en: "To assign resources to a task" },
      { word: "deadline", ar: "موعد نهائي", pos: "noun", en: "The latest time to complete something" },
      { word: "delegate", ar: "تفويض", pos: "verb", en: "To give responsibility to someone else" },
      { word: "overview", ar: "نظرة عامة", pos: "noun", en: "A general summary" },
    ],
    exercises: [
      ex("What is an 'agenda'?", ["A type of meeting room", "A list of items to discuss", "A financial report", "A type of contract"], 1),
      ex("'I see your point, but...' is used to:", ["Agree strongly", "Disagree politely", "End the meeting", "Introduce yourself"], 1),
      ex("What are 'action points'?", ["Points of discussion", "Tasks assigned to people", "Voting results", "Budget items"], 1),
      ex("'Let us move on to the next item' signals:", ["The meeting is over", "A transition to a new topic", "A vote is needed", "Someone is angry"], 1),
    ],
  },

  // ── Lesson 03: Telephone and Video Calls ──────────────────────────────
  {
    lessonId: "pro-lesson-03-telephone-calls",
    vocab: [
      { word: "hold", ar: "انتظار", pos: "verb", en: "To ask someone to wait on the phone" },
      { word: "transfer", ar: "تحويل", pos: "verb", en: "To connect a caller to another person" },
      { word: "availability", ar: "توفر", pos: "noun", en: "Whether someone is free to talk" },
      { word: "connection", ar: "اتصال", pos: "noun", en: "The quality of the phone or video link" },
      { word: "voicemail", ar: "رسالة صوتية", pos: "noun", en: "A recorded phone message" },
      { word: "callback", ar: "إعادة اتصال", pos: "noun", en: "A return phone call" },
      { word: "speaking", ar: "تحدث", pos: "verb", en: "The person currently talking on the phone" },
      { word: "interruption", ar: "انقطاع", pos: "noun", en: "Something that stops the call temporarily" },
      { word: "confirm", ar: "تأكيد", pos: "verb", en: "To verify that something is correct" },
      { word: "schedule", ar: "جدول", pos: "noun", en: "A plan of events and times" },
      { word: "dialling", ar: "الإتصال", pos: "verb", en: "Making a phone call" },
      { word: "signal", ar: "إشارة", pos: "noun", en: "The strength of the phone connection" },
      { word: "brief", ar: "موجز", pos: "adjective", en: "Short in duration" },
      { word: "appreciate", ar: "أقدر", pos: "verb", en: "To be thankful for" },
    ],
    exercises: [
      ex("How do you answer a business phone call?", ["Who is this?", "Hello", "Good morning, [Company Name]. How may I help you?", "What do you want?"], 2),
      ex("'I am calling from...' is used to:", ["End a call", "Introduce yourself and your company", "Ask for a discount", "Complain about service"], 1),
      ex("What does 'One moment please' mean?", ["The call is over", "Please wait briefly", "I disagree", "Transfer the call"], 1),
      ex("When someone is unavailable, you should:", ["Hang up immediately", "Offer to take a message", "Call again in one minute", "Leave a bad review"], 1),
    ],
  },

  // ── Lesson 04: Describing Your Job ────────────────────────────────────
  {
    lessonId: "pro-lesson-04-describing-your-job",
    vocab: [
      { word: "department", ar: "قسم", pos: "noun", en: "A section of a company" },
      { word: "responsibilities", ar: "مسؤوليات", pos: "noun", en: "The tasks you are in charge of" },
      { word: "colleague", ar: "زميل", pos: "noun", en: "A person you work with" },
      { word: "senior", ar: "كبير", pos: "adjective", en: "Higher in rank or position" },
      { word: "junior", ar: "صغرى", pos: "adjective", en: "Lower in rank or position" },
      { word: "role", ar: "دور", pos: "noun", en: "Your position and responsibilities" },
      { word: "industry", ar: "صناعة", pos: "noun", en: "The sector of business you work in" },
      { word: "team", ar: "فريق", pos: "noun", en: "A group of people working together" },
      { word: "project", ar: "مشروع", pos: "noun", en: "A planned piece of work with a goal" },
      { word: "experience", ar: "خبرة", pos: "noun", en: "Knowledge gained from doing things" },
      { word: "qualification", ar: "مؤهل", pos: "noun", en: "A certificate or degree you have earned" },
      { word: "progression", ar: "تطور", pos: "noun", en: "Moving forward in your career" },
      { word: "mentor", ar: "مرشد", pos: "noun", en: "An experienced person who guides you" },
      { word: "skillset", ar: "مجموعة المهارات", pos: "noun", en: "The range of abilities you have" },
    ],
    exercises: [
      ex("Which is the best way to describe your job?", ["I work", "I am a [job title] in the [department] at [company]", "I do stuff", "I am employed"], 1),
      ex("'What do you do on a typical day?' asks about:", ["Your salary", "Your daily tasks and routines", "Your holiday plans", "Your family"], 1),
      ex("'Stay in touch' means:", ["Stop communicating", "Keep in contact", "Change your phone", "Move office"], 1),
      ex("What is a 'colleague'?", ["A client", "A person you work with", "Your boss", "A competitor"], 1),
    ],
  },

  // ── Lesson 05: Business Travel ────────────────────────────────────────
  {
    lessonId: "pro-lesson-05-business-travel",
    vocab: [
      { word: "reservation", ar: "حجز", pos: "noun", en: "A booking made in advance" },
      { word: "itinerary", ar: "جدول سفر", pos: "noun", en: "A detailed plan of a trip" },
      { word: "check-in", ar: "تسجيل الدخول", pos: "noun", en: "The process of arriving at a hotel" },
      { word: "checkout", ar: "المغادرة", pos: "noun", en: "The process of leaving a hotel" },
      { word: "layover", ar: "توقف", pos: "noun", en: "A break between flights" },
      { word: "boarding pass", ar: "بطاقة الصعود", pos: "noun", en: "A document that allows you to board a plane" },
      { word: "reimbursement", ar: "سداد", pos: "noun", en: "Getting money back for expenses paid" },
      { word: "per diem", ar: "مبلغ يومي", pos: "noun", en: "A daily allowance for expenses" },
      { word: "accommodation", ar: "سكن", pos: "noun", en: "A place to stay" },
      { word: "taxi", ar: "سيارة أجرة", pos: "noun", en: "A car you pay to ride in" },
      { word: "terminal", ar: "محطة", pos: "noun", en: "A building at an airport" },
      { word: "delay", ar: "تأخير", pos: "noun", en: "Something that makes you later than planned" },
      { word: "expenses", ar: "نفقات", pos: "noun", en: "Money spent for business purposes" },
      { word: "receipt", ar: "إيصال", pos: "noun", en: "Proof of payment" },
    ],
    exercises: [
      ex("At a hotel, 'under the name' means:", ["Using someone else's name", "The reservation is registered to that name", "Writing your name on the wall", "Changing your name"], 1),
      ex("What is an 'itinerary'?", ["A type of ticket", "A detailed plan of a trip", "A hotel room type", "A passport"], 1),
      ex("'Checkout' is the process of:", ["Entering a hotel", "Leaving a hotel and returning the room", "Checking your email", "Booking a room"], 1),
      ex("What is a 'boarding pass'?", ["A passport", "A document to board a plane", "A hotel key", "A taxi receipt"], 1),
    ],
  },

  // ── Lesson 06: Scheduling ─────────────────────────────────────────────
  {
    lessonId: "pro-lesson-06-scheduling",
    vocab: [
      { word: "calendar", ar: "تقويم", pos: "noun", en: "A tool that shows dates and events" },
      { word: "availability", ar: "توفر", pos: "noun", en: "Whether you are free at a certain time" },
      { word: "slot", ar: "فترة", pos: "noun", en: "A period of time available for a meeting" },
      { word: "reschedule", ar: "إعادة جدولة", pos: "verb", en: "To change the time of a meeting" },
      { word: "convenient", ar: "مناسب", pos: "adjective", en: "Fitting well with your plans" },
      { word: "propose", ar: "يقترح", pos: "verb", en: "To suggest a time or plan" },
      { word: "confirm", ar: "تأكيد", pos: "verb", en: "To agree that something is correct" },
      { word: "decline", ar: "رفض", pos: "verb", en: "To say no politely" },
      { word: "attend", ar: "حضور", pos: "verb", en: "To go to a meeting or event" },
      { word: "invite", ar: "دعوة", pos: "noun", en: "A request to go to an event" },
      { word: "by", ar: "بحلول", pos: "preposition", en: "Before a certain time" },
      { word: "beforehand", ar: "مسبقاً", pos: "adverb", en: "In advance, before the event" },
      { word: "arrange", ar: "ترتيب", pos: "verb", en: "To organize something" },
      { word: "flexible", ar: "مرن", pos: "adjective", en: "Able to change easily" },
    ],
    exercises: [
      ex("'Do you have time this week?' is asking about:", ["Your schedule", "Your hobbies", "Your family", "Your health"], 0),
      ex("What does 'reschedule' mean?", ["Cancel forever", "Change the time of a meeting", "Attend early", "Invite more people"], 1),
      ex("'Thursday at ten works for me' means:", ["I disagree with Thursday", "Thursday at 10 is convenient for me", "Thursday is too expensive", "Thursday is cancelled"], 1),
      ex("What is a 'calendar invite'?", ["A birthday card", "A digital meeting invitation", "A type of email", "A holiday request"], 1),
    ],
  },

  // ── Lesson 07: Business Documents ─────────────────────────────────────
  {
    lessonId: "pro-lesson-07-basic-documents",
    vocab: [
      { word: "invoice", ar: "فاتورة", pos: "noun", en: "A bill requesting payment" },
      { word: "purchase order", ar: "طلب شراء", pos: "noun", en: "A document ordering goods from a supplier" },
      { word: "receipt", ar: "إيصال", pos: "noun", en: "Proof that payment was made" },
      { word: "memo", ar: "مذكرة", pos: "noun", en: "A short written message within a company" },
      { word: "discrepancy", ar: "اختلاف", pos: "noun", en: "A difference between what was expected" },
      { word: "vendor", ar: "مورد", pos: "noun", en: "A company that sells goods or services" },
      { word: "terms", ar: "شروط", pos: "noun", en: "The conditions of an agreement" },
      { word: "total", ar: "المجموع", pos: "noun", en: "The final amount" },
      { word: "quantity", ar: "كمية", pos: "noun", en: "How many items there are" },
      { word: "flag", ar: "إشارة", pos: "verb", en: "To highlight an issue" },
      { word: "accounts", ar: "حسابات", pos: "noun", en: "Financial records of a company" },
      { word: "payment", ar: "دفع", pos: "noun", en: "The act of giving money" },
      { word: "supplier", ar: "مورد", pos: "noun", en: "A person or company that provides goods" },
      { word: "overdue", ar: "متاخر", pos: "adjective", en: "Past the deadline for payment" },
    ],
    exercises: [
      ex("What is an 'invoice'?", ["A type of contract", "A bill requesting payment", "A job application", "A tax form"], 1),
      ex("'Flag this' means to:", ["Ignore the problem", "Highlight or raise the issue", "Pay immediately", "Destroy the document"], 1),
      ex("What is a 'purchase order'?", ["A receipt", "A document ordering goods from a supplier", "A bank statement", "A business card"], 1),
      ex("What does 'discrepancy' mean?", ["Agreement", "A difference between expected and actual", "A discount", "A new product"], 1),
    ],
  },

  // ── Lesson 08: Report Writing ─────────────────────────────────────────
  {
    lessonId: "pro-lesson-08-report-writing",
    vocab: [
      { word: "executive summary", ar: "ملخص تنفيذي", pos: "noun", en: "A brief overview at the start of a report" },
      { word: "findings", ar: "نتائج", pos: "noun", en: "What you discovered in your research" },
      { word: "recommendations", ar: "توصيات", pos: "noun", en: "Suggestions for action based on findings" },
      { word: "methodology", ar: "منهجية", pos: "noun", en: "The method used to gather data" },
      { word: "conclusion", ar: "استنتاج", pos: "noun", en: "A final judgment based on evidence" },
      { word: "data", ar: "بيانات", pos: "noun", en: "Facts and statistics used for analysis" },
      { word: "analysis", ar: "تحليل", pos: "noun", en: "Detailed examination of information" },
      { word: "benchmark", ar: "معيار", pos: "noun", en: "A standard for comparison" },
      { word: "revise", ar: "مراجعة", pos: "verb", en: "To review and make changes" },
      { word: "evidence", ar: "دليل", pos: "noun", en: "Information that supports a conclusion" },
      { word: "draft", ar: "مسودة", pos: "noun", en: "An early version of a document" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone affected by the report's outcomes" },
      { word: "actionable", ar: "قابل للتنفيذ", pos: "adjective", en: "Something that can be done practically" },
      { word: "comprehensive", ar: "شامل", pos: "adjective", en: "Covering all important points" },
    ],
    exercises: [
      ex("What comes first in a standard business report?", ["Recommendations", "Executive summary", "Appendix", "Conclusion"], 1),
      ex("Why should recommendations be specific?", ["To make the report longer", "So they can be measured and acted on", "To impress the reader", "Because the boss likes details"], 1),
      ex("What is an 'executive summary'?", ["A detailed analysis", "A brief overview at the start", "The final page", "A type of chart"], 1),
      ex("What does 'benchmark' mean?", ["A type of report", "A standard for comparison", "A type of meeting", "A financial term"], 1),
    ],
  },

  // ── Lesson 09: Presentations ──────────────────────────────────────────
  {
    lessonId: "pro-lesson-09-presentations",
    vocab: [
      { word: "slide", ar: "شريحة", pos: "noun", en: "A page shown during a presentation" },
      { word: "handout", ar: "منشور", pos: "noun", en: "A paper given to the audience" },
      { word: "visual aid", ar: "وسيلة بصرية", pos: "noun", en: "An image or chart used to support a point" },
      { word: "signpost", ar: "إشارة اتجاه", pos: "verb", en: "To indicate the structure of a talk" },
      { word: "engage", ar: "تفاعل", pos: "verb", en: "To keep the audience interested" },
      { word: "keynote", ar: "الكلمة الرئيسية", pos: "noun", en: "The main speech at an event" },
      { word: "Q&A", ar: "أسئلة وإجابات", pos: "noun", en: "Question and answer session" },
      { word: "body language", ar: "لغة الجسد", pos: "noun", en: "Communication through gestures and posture" },
      { word: "rehearse", ar: "تدرّب", pos: "verb", en: "To practise before presenting" },
      { word: "transition", ar: "انتقال", pos: "noun", en: "Moving from one section to another" },
      { word: "audience", ar: "جمهور", pos: "noun", en: "The people watching a presentation" },
      { word: "structure", ar: "هيكل", pos: "noun", en: "The organisation of content" },
      { word: "conclusion", ar: "خاتمة", pos: "noun", en: "The final part of a presentation" },
      { word: "confident", ar: "واثق", pos: "adjective", en: "Feeling sure of yourself" },
    ],
    exercises: [
      ex("What does 'walk you through' mean?", ["Give a tour", "Explain step by step", "Skip the details", "Run quickly"], 1),
      ex("Why should you signpost the structure of a presentation?", ["To fill time", "To help the audience follow", "Because you forgot", "To show your slides"], 1),
      ex("'As you can see' is used to:", ["Hide information", "Direct attention to a visual aid", "Ask a question", "End the presentation"], 1),
      ex("What is a 'Q&A'?", ["A type of slide", "A question and answer session", "A report", "A budget item"], 1),
    ],
  },

  // ── Lesson 10: Negotiations ──────────────────────────────────────────
  {
    lessonId: "pro-lesson-10-negotiations",
    vocab: [
      { word: "offer", ar: "عرض", pos: "noun", en: "A proposal of terms or price" },
      { word: "counter-offer", ar: "عرض مضاد", pos: "noun", en: "A different proposal in response" },
      { word: "concession", ar: "تنازل", pos: "noun", en: "Something you give up to reach agreement" },
      { word: "leverage", ar: "نفوذ", pos: "noun", en: "An advantage you can use" },
      { word: "agreement", ar: "اتفاق", pos: "noun", en: "A mutual decision" },
      { word: "deadline", ar: "موعد نهائي", pos: "noun", en: "The last time to make a decision" },
      { word: "compromise", ar: "تسوية", pos: "noun", en: "A solution where both sides give something" },
      { word: "terms", ar: "شروط", pos: "noun", en: "The conditions of a deal" },
      { word: "budget", ar: "ميزانية", pos: "noun", en: "The amount of money available" },
      { word: "proposal", ar: "اقتراح", pos: "noun", en: "A formal suggestion" },
      { word: "rejection", ar: "رفض", pos: "noun", en: "Saying no to an offer" },
      { word: "negotiate", ar: "تفاوض", pos: "verb", en: "To discuss terms to reach agreement" },
      { word: "strategy", ar: "استراتيجية", pos: "noun", en: "A plan to achieve a goal" },
      { word: "relationship", ar: "علاقة", pos: "noun", en: "Connection between people or companies" },
    ],
    exercises: [
      ex("What does 'above our budget' mean?", ["We have extra money", "The price is too high for us", "We want to spend more", "The budget is increasing"], 1),
      ex("'How about' in a negotiation introduces:", ["A complaint", "A counter-offer", "A cancellation", "A threat"], 1),
      ex("'We have a deal' means:", ["We will meet again", "The negotiation is successful", "We disagree", "The meeting is over"], 1),
      ex("What is a 'concession'?", ["A type of contract", "Something you give up to reach agreement", "A type of meeting", "A financial report"], 1),
    ],
  },

  // ── Lesson 11: Job Interviews ─────────────────────────────────────────
  {
    lessonId: "pro-lesson-11-job-interviews",
    vocab: [
      { word: "interview", ar: "مقابلة", pos: "noun", en: "A formal meeting to assess a candidate" },
      { word: "candidate", ar: "مرشح", pos: "noun", en: "A person applying for a job" },
      { word: "experience", ar: "خبرة", pos: "noun", en: "Knowledge gained from past work" },
      { word: "qualification", ar: "مؤهل", pos: "noun", en: "A certificate or degree earned" },
      { word: "strength", ar: "نقطة قوة", pos: "noun", en: "A positive quality or skill" },
      { word: "weakness", ar: "نقطة ضعف", pos: "noun", en: "An area that needs improvement" },
      { word: "behavioural", ar: "سلوكي", pos: "adjective", en: "Relating to how someone acts" },
      { word: "competency", ar: "كفاءة", pos: "noun", en: "The ability to do something well" },
      { word: "salary", ar: "راتب", pos: "noun", en: "The money you earn from a job" },
      { word: "benefits", ar: "مزايا", pos: "noun", en: "Extra advantages beyond salary" },
      { word: "growth", ar: "نمو", pos: "noun", en: "Career development and progress" },
      { word: "teamwork", ar: "عمل جماعي", pos: "noun", en: "Working effectively with others" },
      { word: "initiative", ar: "مبادرة", pos: "noun", en: "The ability to act independently" },
      { word: "reference", ar: "توصية", pos: "noun", en: "A recommendation from a previous employer" },
    ],
    exercises: [
      ex("What is the STAR method?", ["A type of interview", "A way to structure answers", "A hiring tool", "A rating system"], 1),
      ex("The 'S' in STAR stands for:", ["Skill", "Salary", "Situation", "Strength"], 2),
      ex("Why do interviewers ask behavioral questions?", ["To waste time", "To see how you handled real situations", "Because they are curious", "To test your typing"], 1),
      ex("What should you do when asked about a weakness?", ["Say you have none", "Be honest and show how you are improving it", "Lie about it", "Blame someone else"], 1),
    ],
  },

  // ── Lesson 12: Customer Service ───────────────────────────────────────
  {
    lessonId: "pro-lesson-12-customer-service",
    vocab: [
      { word: "complaint", ar: "شكوى", pos: "noun", en: "An expression of dissatisfaction" },
      { word: "resolve", ar: "حل", pos: "verb", en: "To find a solution" },
      { word: "empathy", ar: "تعاطف", pos: "noun", en: "Understanding someone's feelings" },
      { word: "escalate", ar: "تصعيد", pos: "verb", en: "To raise to a higher level of support" },
      { word: "refund", ar: "استرداد", pos: "noun", en: "Money returned to a customer" },
      { word: "replacement", ar: "بديل", pos: "noun", en: "Something given instead of the original" },
      { word: "apologise", ar: "اعتذار", pos: "verb", en: "To say you are sorry" },
      { word: "satisfaction", ar: "رضا", pos: "noun", en: "The feeling of being pleased" },
      { word: "feedback", ar: "تعليقات", pos: "noun", en: "Opinions about a product or service" },
      { word: "response time", ar: "وقت الاستجابة", pos: "noun", en: "How long it takes to reply" },
      { word: "issue", ar: "مشكلة", pos: "noun", en: "A problem that needs to be fixed" },
      { word: "delay", ar: "تأخير", pos: "noun", en: "Something that makes you wait longer" },
      { word: "guarantee", ar: "ضمان", pos: "noun", en: "A promise that something will work" },
      { word: "priority", ar: "أولوية", pos: "noun", en: "Something more important than other things" },
    ],
    exercises: [
      ex("What should you do first when a customer complains?", ["Argue back", "Validate their feelings", "Offer a refund", "Blame someone"], 1),
      ex("'Escalate' in customer service means:", ["Ignore the problem", "Raise to a higher level of support", "Make it worse", "Close the ticket"], 1),
      ex("'I completely understand your frustration' is used to:", ["Dismiss the complaint", "Show empathy and validate feelings", "End the call", "Offer a discount"], 1),
      ex("What is a 'guarantee'?", ["A complaint", "A promise that something will work or be replaced", "A type of meeting", "A tax form"], 1),
    ],
  },

  // ── Lesson 13: Marketing and Sales ────────────────────────────────────
  {
    lessonId: "pro-lesson-13-marketing-sales",
    vocab: [
      { word: "target audience", ar: "الجمهور المستهدف", pos: "noun", en: "The group of people you want to reach" },
      { word: "call to action", ar: "دعوة للعمل", pos: "noun", en: "A prompt telling the reader what to do next" },
      { word: "value proposition", ar: "عرض القيمة", pos: "noun", en: "Why your product is worth buying" },
      { word: "conversion", ar: "تحويل", pos: "noun", en: "When a visitor becomes a customer" },
      { word: "engagement", ar: "تفاعل", pos: "noun", en: "How much people interact with content" },
      { word: "brand", ar: "علامة تجارية", pos: "noun", en: "The identity of a company or product" },
      { word: "campaign", ar: "حملة", pos: "noun", en: "A planned series of marketing activities" },
      { word: "copy", ar: "نص", pos: "noun", en: "Written text used in advertising" },
      { word: "testimonial", ar: "شهادة", pos: "noun", en: "A customer's positive review" },
      { word: "social proof", ar: "إثبات اجتماعي", pos: "noun", en: "Evidence that other people trust the product" },
      { word: "landing page", ar: "صفحة هبوط", pos: "noun", en: "A web page designed to get sign-ups or sales" },
      { word: "traffic", ar: "زيارات", pos: "noun", en: "The number of visitors to a website" },
      { word: "bounce rate", ar: "معدل الارتداد", pos: "noun", en: "The percentage of visitors who leave quickly" },
      { word: "roi", ar: "عائد الاستثمار", pos: "noun", en: "Return on investment — profit vs cost" },
    ],
    exercises: [
      ex("Why is 'Learn more' a weak call to action?", ["It is too long", "It is too passive and generic", "It is confusing", "It is rude"], 1),
      ex("What is 'social proof'?", ["A government certification", "Evidence from other customers' experiences", "A sales technique", "A type of ad"], 1),
      ex("A good value proposition should include:", ["A specific benefit", "A long story", "Technical jargon", "A complaint"], 0),
      ex("What is a 'landing page'?", ["A homepage", "A page designed to get sign-ups or sales", "A blog post", "An email"], 1),
    ],
  },

  // ── Lesson 14: Project Management ─────────────────────────────────────
  {
    lessonId: "pro-lesson-14-project-communication",
    vocab: [
      { word: "milestone", ar: "مرحلة", pos: "noun", en: "An important point or achievement in a project" },
      { word: "blocker", ar: "معيق", pos: "noun", en: "Something stopping progress" },
      { word: "scope", ar: "نطاق", pos: "noun", en: "The boundaries of what a project includes" },
      { word: "timeline", ar: "جدول زمني", pos: "noun", en: "A schedule showing when things will happen" },
      { word: "deliverable", ar: "مخرج", pos: "noun", en: "A tangible result that must be produced" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone affected by or interested in the project" },
      { word: "status update", ar: "تحديث حالة", pos: "noun", en: "A report on current progress" },
      { word: "rag status", ar: "حالة rag", pos: "noun", en: "Red/Amber/Green indicator of project health" },
      { word: "risk", ar: "مخاطر", pos: "noun", en: "Something that could go wrong" },
      { word: "contingency", ar: "احتياطي", pos: "noun", en: "A backup plan if things go wrong" },
      { word: "resource", ar: "مورد", pos: "noun", en: "People, money, or equipment needed" },
      { word: "rework", ar: "إعادة عمل", pos: "noun", en: "Doing work again due to changes" },
      { word: "approval", ar: "موافقة", pos: "noun", en: "Official permission to proceed" },
      { word: "deadline", ar: "موعد نهائي", pos: "noun", en: "The final date to complete something" },
    ],
    exercises: [
      ex("What does RAG status stand for?", ["Report, Analyse, Guide", "Red, Amber, Green", "Risk, Assessment, Growth", "Review, Approve, Go"], 1),
      ex("What four things should a good status update include?", ["Issue, impact, action, timeline", "Name, date, signature, subject", "Price, quantity, delivery, payment", "Team, budget, scope, risk"], 0),
      ex("What is a 'blocker'?", ["A type of meeting", "Something stopping progress", "A project goal", "A team member"], 1),
      ex("What is a 'deliverable'?", ["A type of email", "A tangible result that must be produced", "A meeting room", "A financial report"], 1),
    ],
  },

  // ── Lesson 15: Persuasion and Influence ────────────────────────────────
  {
    lessonId: "pro-lesson-15-persuasion",
    vocab: [
      { word: "rhetoric", ar: "بلاغة", pos: "noun", en: "The art of effective persuasive speaking" },
      { word: "convince", ar: "إقناع", pos: "verb", en: "To make someone believe something" },
      { word: "argument", ar: "حجة", pos: "noun", en: "A reason given to support a position" },
      { word: "evidence", ar: "دليل", pos: "noun", en: "Facts that support a claim" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone with an interest in the outcome" },
      { word: "consensus", ar: "إجماع", pos: "noun", en: "General agreement" },
      { word: "resistance", ar: "مقاومة", pos: "noun", en: "Opposition to a change or idea" },
      { word: "framing", ar: "إطار", pos: "noun", en: "How you present information to influence perception" },
      { word: "objection", ar: "اعتراض", pos: "noun", en: "A reason against something" },
      { word: "credibility", ar: "مصداقية", pos: "noun", en: "The quality of being trusted" },
      { word: "perspective", ar: "منظور", pos: "noun", en: "A particular way of seeing things" },
      { word: "compelling", ar: "مقنع", pos: "adjective", en: "Very convincing and interesting" },
      { word: "sceptical", ar: "متشكك", pos: "adjective", en: "Not easily convinced" },
      { word: "motivation", ar: "دافع", pos: "noun", en: "The reason for doing something" },
    ],
    exercises: [
      ex("Why does the strategist 'lead with' the market gap data?", ["It is the longest point", "It is the most compelling evidence", "It is the cheapest data", "It is the easiest to understand"], 1),
      ex("What is 'framing'?", ["A type of picture", "How you present information to influence perception", "A construction technique", "A meeting format"], 1),
      ex("What is a 'sceptical' board?", ["An excited board", "A board that doubts and needs convincing", "A quiet board", "A board that agrees easily"], 1),
      ex("'Credibility' means:", ["Being the loudest", "Being trusted and believed", "Being the oldest", "Being the most expensive"], 1),
    ],
  },

  // ── Lesson 16: Conflict Resolution ────────────────────────────────────
  {
    lessonId: "pro-lesson-16-conflict-resolution",
    vocab: [
      { word: "mediation", ar: "وساطة", pos: "noun", en: "Helping two sides reach agreement" },
      { word: "dispute", ar: "نزاع", pos: "noun", en: "A disagreement between people" },
      { word: "tension", ar: "توتر", pos: "noun", en: "Mental or emotional strain" },
      { word: "reframe", ar: "إعادة صياغة", pos: "verb", en: "To present an issue in a new, neutral way" },
      { word: "active listening", ar: "الاستماع النشط", pos: "noun", en: "Listening carefully to understand, not just to reply" },
      { word: "neutral", ar: "محايد", pos: "adjective", en: "Not taking sides" },
      { word: "resolution", ar: "حل", pos: "noun", en: "A solution to a problem" },
      { word: "perspective", ar: "منظور", pos: "noun", en: "A way of seeing a situation" },
      { word: "empathy", ar: "تعاطف", pos: "noun", en: "Understanding someone else's feelings" },
      { word: "de-escalate", ar: "خفض التوتر", pos: "verb", en: "To reduce the intensity of a conflict" },
      { word: "consensus", ar: "إجماع", pos: "noun", en: "General agreement" },
      { word: "boundary", ar: "حد", pos: "noun", en: "A limit of acceptable behaviour" },
      { word: "outcome", ar: "نتيجة", pos: "noun", en: "The result of a discussion" },
      { word: "process", ar: "عملية", pos: "noun", en: "A series of steps to achieve something" },
    ],
    exercises: [
      ex("What does 'reframe' mean in conflict resolution?", ["Ignore the issue", "Restate in neutral, constructive language", "Assign blame", "End the discussion"], 1),
      ex("'Hear both sides' is important because:", ["It takes more time", "Both parties need to feel heard", "It is a rule", "It makes the mediator look smart"], 1),
      ex("What is 'active listening'?", ["Listening to music while working", "Listening carefully to understand, not just reply", "Listening from another room", "Listening to complaints only"], 1),
      ex("A 'change freeze' is:", ["A period when no changes are allowed", "A type of meeting", "A financial term", "A holiday period"], 0),
    ],
  },

  // ── Lesson 17: Cross-Cultural Communication ───────────────────────────
  {
    lessonId: "pro-lesson-17-cross-cultural",
    vocab: [
      { word: "high-context", ar: "سياق عالي", pos: "adjective", en: "Communication that relies on implicit meaning" },
      { word: "low-context", ar: "سياق منخفض", pos: "adjective", en: "Communication that is direct and explicit" },
      { word: "hierarchy", ar: "تسلسل هرمي", pos: "noun", en: "A system of ranking by authority" },
      { word: "directness", ar: "مباشرة", pos: "noun", en: "Being straightforward in communication" },
      { word: "implied", ar: "ضمني", pos: "adjective", en: "Suggested but not directly stated" },
      { word: "cultural", ar: "ثقافي", pos: "adjective", en: "Relating to the customs of a group" },
      { word: "norms", ar: "معايير", pos: "noun", en: "Standard behaviours in a society" },
      { word: "diversity", ar: "تنمية", pos: "noun", en: "The inclusion of different types of people" },
      { word: "rapport", ar: "علاقة ودية", pos: "noun", en: "A good understanding and connection" },
      { word: "stereotype", ar: "قالب نمطي", pos: "noun", en: "An oversimplified belief about a group" },
      { word: "nonverbal", ar: "لا verbal", pos: "adjective", en: "Communication without words" },
      { word: "adapt", ar: "تكييف", pos: "verb", en: "To change your approach to fit the situation" },
      { word: "sensitive", ar: "حساس", pos: "adjective", en: "Needing careful handling" },
      { word: "implicit", ar: "ضمني", pos: "adjective", en: "Implied but not directly expressed" },
    ],
    exercises: [
      ex("In Japanese business culture, 'that would be difficult' often means:", ["They need more time", "It means no", "They agree enthusiastically", "They want to discuss further"], 1),
      ex("What is the difference between high-context and low-context cultures?", ["High-context is louder", "High-context relies on implicit communication; low-context is direct", "Low-context uses more body language", "There is no difference"], 1),
      ex("'Read between the lines' means:", ["Read quickly", "Understand the implied meaning", "Skip sections", "Read out loud"], 1),
      ex("Why should you adapt your communication style?", ["To show off", "To be effective across different cultures", "Because the rules say so", "To avoid work"], 1),
    ],
  },

  // ── Lesson 18: Financial and Legal English ────────────────────────────
  {
    lessonId: "pro-lesson-18-financial-legal",
    vocab: [
      { word: "liability", ar: "مسؤولية", pos: "noun", en: "Legal responsibility for something" },
      { word: "clause", ar: "بند", pos: "noun", en: "A section of a legal document" },
      { word: "contract", ar: "عقد", pos: "noun", en: "A legally binding agreement" },
      { word: "damages", ar: "أضرار", pos: "noun", en: "Money claimed for loss or injury" },
      { word: "termination", ar: "إنهاء", pos: "noun", en: "Ending a contract or agreement" },
      { word: "penalty", ar: "غرامة", pos: "noun", en: "A punishment for breaking rules" },
      { word: "compliance", ar: "امتثال", pos: "noun", en: "Following laws and regulations" },
      { word: "jurisdiction", ar: "اختصاص", pos: "noun", en: "The authority of a court to hear a case" },
      { word: "arbitration", ar: "تحكيم", pos: "noun", en: "Settling a dispute outside of court" },
      { word: "force majeure", ar: "قوة قاهرة", pos: "noun", en: "Unforeseeable events preventing fulfilment" },
      { word: "breach", ar: "خرق", pos: "noun", en: "Breaking the terms of a contract" },
      { word: "confidentiality", ar: "سرية", pos: "noun", en: "Keeping information private" },
      { word: "revenue", ar: "إيرادات", pos: "noun", en: "Income from business activities" },
      { word: "forecast", ar: "تنبؤ", pos: "noun", en: "A prediction of future performance" },
    ],
    exercises: [
      ex("What does 'limitation of liability' do?", ["Increases potential damages", "Caps the amount one party can claim", "Eliminates all responsibility", "Extends the contract"], 1),
      ex("What is a 'force majeure' clause?", ["A penalty clause", "A clause covering unforeseeable events", "A payment clause", "A confidentiality clause"], 1),
      ex("What is 'arbitration'?", ["Going to court", "Settling a dispute outside of court", "Signing a contract", "Paying a penalty"], 1),
      ex("'Breach' of contract means:", ["Following all rules", "Breaking the terms of the agreement", "Renewing the contract", "Celebrating a deal"], 1),
    ],
  },

  // ── Lesson 19: Technical Communication ────────────────────────────────
  {
    lessonId: "pro-lesson-19-technical-communication",
    vocab: [
      { word: "documentation", ar: "توثيق", pos: "noun", en: "Written material explaining how to use something" },
      { word: "jargon", ar: "مصطلحات تقنية", pos: "noun", en: "Specialist language that non-experts may not understand" },
      { word: "specification", ar: "مواصفات", pos: "noun", en: "Detailed description of requirements" },
      { word: "troubleshooting", ar: "استكشاف الأخطاء", pos: "noun", en: "Finding and fixing problems" },
      { word: "interface", ar: "واجهة", pos: "noun", en: "A point where two systems meet" },
      { word: "algorithm", ar: "خوارزمية", pos: "noun", en: "A step-by-step procedure for solving a problem" },
      { word: "deployment", ar: "نشر", pos: "noun", en: "Making software available for use" },
      { word: "integration", ar: "تكامل", pos: "noun", en: "Combining different systems to work together" },
      { word: "latency", ar: "زمن الاستجابة", pos: "noun", en: "The delay before data transfer begins" },
      { word: "iteration", ar: "تكرار", pos: "noun", en: "A version or cycle of development" },
      { word: "dependency", ar: "تبعية", pos: "noun", en: "Something one component relies on" },
      { word: "scalability", ar: "قابلية التوسع", pos: "noun", en: "The ability to handle growing demand" },
      { word: "validation", ar: "تحقق", pos: "noun", en: "Checking that something meets requirements" },
      { word: "deprecated", ar: "متقادم", pos: "adjective", en: "No longer recommended for use" },
    ],
    exercises: [
      ex("Why should technical writers avoid jargon?", ["It makes documents longer", "It confuses non-expert readers", "It is outdated", "It is illegal"], 1),
      ex("What should good API documentation include?", ["Only the code", "Prerequisites, installation, configuration, and examples", "Just a README", "Marketing content"], 1),
      ex("What is 'troubleshooting'?", ["Creating new software", "Finding and fixing problems", "Installing updates", "Writing code"], 1),
      ex("'Deprecated' means:", ["Popular", "No longer recommended for use", "Very new", "Expensive"], 1),
    ],
  },

  // ── Lesson 20: Media and Public Relations ──────────────────────────────
  {
    lessonId: "pro-lesson-20-media-pr",
    vocab: [
      { word: "press release", ar: "بيان صحفي", pos: "noun", en: "An official statement sent to the media" },
      { word: "spokesperson", ar: "ناطق", pos: "noun", en: "A person who speaks for an organisation" },
      { word: "media", ar: "وسائل الإعلام", pos: "noun", en: "TV, radio, newspapers, and online news" },
      { word: "interview", ar: "مقابلة", pos: "noun", en: "A formal conversation for media" },
      { word: "headline", ar: "عنوان رئيسي", pos: "noun", en: "The main title of a news story" },
      { word: "narrative", ar: "سرد", pos: "noun", en: "The main story or message" },
      { word: "coverage", ar: "تغطية", pos: "noun", en: "How much the media reports on something" },
      { word: "reputation", ar: "سمعة", pos: "noun", en: "What people think about an organisation" },
      { word: "crisis", ar: "أزمة", pos: "noun", en: "A serious situation requiring immediate action" },
      { word: "holding statement", ar: "بيان مؤقت", pos: "noun", en: "A temporary statement while more information is gathered" },
      { word: "bridging", ar: "تقليب", pos: "noun", en: "A media technique to redirect difficult questions" },
      { word: "key message", ar: "رسالة رئيسية", pos: "noun", en: "The most important point to communicate" },
      { word: "attribution", ar: "إسناد", pos: "noun", en: "Identifying who is responsible" },
      { word: "embargo", ar: "حظر نشر", pos: "noun", en: "A request not to publish until a certain time" },
    ],
    exercises: [
      ex("What should the spokesperson say about the product recall?", ["Deny everything", "Acknowledge, explain actions, and focus on safety", "Blame the supplier", "Refuse to comment"], 1),
      ex("What is 'bridging' in media interviews?", ["Building a connection", "Redirecting difficult questions to key messages", "Ending the interview", "Asking your own questions"], 1),
      ex("What is a 'holding statement'?", ["The final statement", "A temporary statement while gathering more information", "A press release", "A legal document"], 1),
      ex("Why is 'attribution' important in crisis communication?", ["It makes the statement longer", "To avoid blaming the wrong person", "It is a legal requirement", "To identify the source of information"], 1),
    ],
  },

  // ── Lesson 21: Leadership Communication ────────────────────────────────
  {
    lessonId: "pro-lesson-21-leadership",
    vocab: [
      { word: "vision", ar: "رؤية", pos: "noun", en: "A clear picture of the future" },
      { word: "transparency", ar: "شفافية", pos: "noun", en: "Being open and honest" },
      { word: "feedback", ar: "تعليقات", pos: "noun", en: "Information about performance" },
      { word: "town hall", ar: "اجتماع عام", pos: "noun", en: "A meeting for the whole company" },
      { word: "one-to-one", ar: "محادثة فردية", pos: "noun", en: "A private meeting between two people" },
      { word: "morale", ar: "معنويات", pos: "noun", en: "The confidence and enthusiasm of a group" },
      { word: "delegation", ar: "تفويض", pos: "noun", en: "Assigning tasks to others" },
      { word: "authority", ar: "سلطة", pos: "noun", en: "The power to make decisions" },
      { word: "accountability", ar: "مساءلة", pos: "noun", en: "Being responsible for outcomes" },
      { word: "constructive", ar: "بناء", pos: "adjective", en: "Helping to improve, not just criticising" },
      { word: "initiative", ar: "مبادرة", pos: "noun", en: "The ability to act on your own" },
      { word: "influence", ar: "تأثير", pos: "noun", en: "The ability to affect others' decisions" },
      { word: "rhetoric", ar: "بلاغة", pos: "noun", en: "The art of effective persuasive speaking" },
      { word: "vulnerability", ar: "ضعف", pos: "noun", en: "Being open about challenges to build trust" },
    ],
    exercises: [
      ex("Why does the CEO share both positive and negative information?", ["To fill time", "To build trust through transparency", "To make people worried", "Because she forgot the good news"], 1),
      ex("What is a 'town hall'?", ["A building", "A meeting for the whole company", "A type of office", "A training session"], 1),
      ex("'Accountability' means:", ["Blaming others", "Being responsible for outcomes", "Avoiding work", "Being the boss"], 1),
      ex("Why is 'vulnerability' important for leaders?", ["It shows weakness", "It builds trust by being open about challenges", "It is required by law", "It makes them popular"], 1),
    ],
  },

  // ── Lesson 22: Strategic Business Writing ──────────────────────────────
  {
    lessonId: "pro-lesson-22-strategic-writing",
    vocab: [
      { word: "strategy", ar: "استراتيجية", pos: "noun", en: "A long-term plan to achieve a goal" },
      { word: "competitive landscape", ar: "المشهد التنافسي", pos: "noun", en: "The position of your company relative to rivals" },
      { word: "market share", ar: "حصة سوقية", pos: "noun", en: "The percentage of the market you control" },
      { word: "KPI", ar: "مؤشر أداء رئيسي", pos: "noun", en: "Key Performance Indicator — a measurable goal" },
      { word: "ROI", ar: "عائد الاستثمار", pos: "noun", en: "Return on Investment" },
      { word: "projection", ar: "توقعات", pos: "noun", en: "A forecast of future performance" },
      { word: "scenario", ar: "سيناريو", pos: "noun", en: "A possible future situation" },
      { word: "risk assessment", ar: "تقييم المخاطر", pos: "noun", en: "Identifying and analysing potential problems" },
      { word: "mitigation", ar: "تخفيف", pos: "noun", en: "Reducing the impact of risks" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone affected by strategic decisions" },
      { word: "pillar", ar: "ركيزة", pos: "noun", en: "A main supporting part of a plan" },
      { word: "roadmap", ar: "خارطة طريق", pos: "noun", en: "A plan showing steps to reach a goal" },
      { word: "feasibility", ar: "جدوى", pos: "noun", en: "Whether something can realistically be done" },
      { word: "contingency", ar: "احتياطي", pos: "noun", en: "A backup plan if the main plan fails" },
    ],
    exercises: [
      ex("Why does the CEO want three financial scenarios?", ["To make the document longer", "To show rigorous analysis", "Because she cannot decide", "To confuse the readers"], 1),
      ex("What does 'mitigation strategies' mean?", ["Ways to increase risk", "Plans to reduce the impact of risks", "Strategies to avoid work", "Plans to blame others"], 1),
      ex("What is a 'KPI'?", ["A type of contract", "A Key Performance Indicator — a measurable goal", "A meeting format", "A budget category"], 1),
      ex("What is a 'competitive landscape'?", ["A garden", "The position of your company relative to rivals", "A type of report", "A team meeting"], 1),
    ],
  },

  // ── Lesson 23: Executive Presentations ─────────────────────────────────
  {
    lessonId: "pro-lesson-23-executive-presentations",
    vocab: [
      { word: "boardroom", ar: "غرفة مجلس الإدارة", pos: "noun", en: "A room where board meetings are held" },
      { word: "forecast", ar: "تنبؤ", pos: "noun", en: "A prediction of future performance" },
      { word: "assumption", ar: "افتراض", pos: "noun", en: "Something believed to be true without proof" },
      { word: "exposure", ar: "تعرض", pos: "noun", en: "The extent to which you are affected by a risk" },
      { word: "hedging", ar: "تحوط", pos: "noun", en: "A strategy to reduce financial risk" },
      { word: "downside", ar: "الجانب السلبي", pos: "noun", en: "The potential negative outcome" },
      { word: "upside", ar: "الجانب الإيجابي", pos: "noun", en: "The potential positive outcome" },
      { word: "break-even", ar: "نقطة التعادل", pos: "noun", en: "When revenue equals costs" },
      { word: "valuation", ar: "تقييم", pos: "noun", en: "The estimated worth of something" },
      { word: "liquidity", ar: "سيولة", pos: "noun", en: "How easily assets can be converted to cash" },
      { word: "capital", ar: "رأس مال", pos: "noun", en: "Money or assets used for investment" },
      { word: "dividend", ar: "أرباح", pos: "noun", en: "A share of profits paid to shareholders" },
      { word: "revenue stream", ar: "مصدر إيرادات", pos: "noun", en: "A source of income" },
      { word: "margin", ar: "هامش", pos: "noun", en: "The difference between cost and selling price" },
    ],
    exercises: [
      ex("Why does the CFO quantify the currency risk in terms of break-even timing?", ["To confuse the board", "To make the impact concrete and actionable", "To show off knowledge", "Because the board asked"], 1),
      ex("What is a 'rolling forward contract'?", ["A contract that moves", "A financial instrument to manage currency exposure", "A temporary contract", "A contract with no end date"], 1),
      ex("'Downside' and 'upside' refer to:", ["Floor and ceiling", "Potential losses and gains", "Beginning and end", "Good and bad people"], 1),
      ex("What is 'liquidity'?", ["A type of drink", "How easily assets can be converted to cash", "The speed of a meeting", "A type of report"], 1),
    ],
  },

  // ── Lesson 24: Crisis Communication ────────────────────────────────────
  {
    lessonId: "pro-lesson-24-crisis-communication",
    vocab: [
      { word: "crisis", ar: "أزمة", pos: "noun", en: "A serious situation requiring immediate action" },
      { word: "transparency", ar: "شفافية", pos: "noun", en: "Being open and honest about the situation" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Anyone affected by the crisis" },
      { word: "statement", ar: "بيان", pos: "noun", en: "An official public message" },
      { word: "investigation", ar: "تحقيق", pos: "noun", en: "A formal examination of what happened" },
      { word: "attribution", ar: "إسناد", pos: "noun", en: "Identifying who is responsible" },
      { word: "compromised", ar: "مختراق", pos: "adjective", en: "Accessed or damaged without permission" },
      { word: "unauthorised", ar: "غير مصرح", pos: "adjective", en: "Without official permission" },
      { word: "helpline", ar: "خط مساعدة", pos: "noun", en: "A phone number for people to get help" },
      { word: "remediation", ar: "معالجة", pos: "noun", en: "Steps taken to fix the problem" },
      { word: "disclosure", ar: "إفصاح", pos: "noun", en: "Revealing information that was hidden" },
      { word: "erode", ar: "تآكل", pos: "verb", en: "To gradually destroy trust or confidence" },
      { word: "comms", ar: "اتصالات", pos: "noun", en: "Short for communications" },
      { word: "holding statement", ar: "بيان مؤقت", pos: "noun", en: "A temporary statement while gathering facts" },
    ],
    exercises: [
      ex("What are the four parts of a crisis statement?", ["Blame, deny, threaten, ignore", "Acknowledge, explain, action, support", "Deny, delay, deflect, dismiss", "Apologise, resign, compensate, forget"], 1),
      ex("Why not speculate about the attacker?", ["To protect the attacker", "Attribution must be confirmed by law enforcement", "Because it is not important", "Because the attacker is a client"], 1),
      ex("What is 'erode' in the context of trust?", ["Build quickly", "Gradually destroy", "Ignore completely", "Measure accurately"], 1),
      ex("Why should employees hear about a crisis before the public?", ["To make them scared", "To ensure they are not blindsided and can answer questions", "Because it is faster", "Because the CEO likes them"], 1),
    ],
  },

  // ── Lesson 25: Change Management ───────────────────────────────────────
  {
    lessonId: "pro-lesson-25-change-management",
    vocab: [
      { word: "restructure", ar: "إعادة هيكلة", pos: "verb", en: "Toorganise a company differently" },
      { word: "redundancy", ar: "فائض وظيفي", pos: "noun", en: "A job that is no longer needed" },
      { word: "redeployment", ar: "إعادة توظيف", pos: "noun", en: "Moving employees to different roles" },
      { word: "transition", ar: "انتقال", pos: "noun", en: "The process of changing from one state to another" },
      { word: "morale", ar: "معنويات", pos: "noun", en: "The confidence and enthusiasm of a group" },
      { word: "change management", ar: "إدارة التغيير", pos: "noun", en: "The process of guiding organisational change" },
      { word: "resistance", ar: "مقاومة", pos: "noun", en: "Opposition to change" },
      { word: "communication plan", ar: "خطة اتصال", pos: "noun", en: "A plan for sharing information about change" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Anyone affected by the change" },
      { word: "unsettling", ar: "مقلق", pos: "adjective", en: "Making you feel nervous or worried" },
      { word: "transparency", ar: "شفافية", pos: "noun", en: "Being open and honest" },
      { word: "reassurance", ar: "طمأنة", pos: "noun", en: "Telling someone not to worry" },
      { word: "coaching", ar: "توجيه", pos: "noun", en: "Training and guidance for improvement" },
      { word: "workshop", ar: "ورشة عمل", pos: "noun", en: "A meeting for training or discussion" },
    ],
    exercises: [
      ex("Why does the HR Director address redundancies directly?", ["She enjoys bad news", "Avoiding it would erode trust", "She wants to scare people", "Legal requirements"], 1),
      ex("What is 'redeployment'?", ["Firing employees", "Moving employees to different roles", "Hiring new people", "Closing the company"], 1),
      ex("Why is 'morale' important during change?", ["It does not matter", "Low morale reduces productivity and increases turnover", "It is a legal requirement", "Only the CEO cares"], 1),
      ex("What is a 'communication plan'?", ["An email template", "A plan for sharing information about change", "A social media strategy", "A meeting agenda"], 1),
    ],
  },

  // ── Lesson 26: Mergers and Acquisitions ────────────────────────────────
  {
    lessonId: "pro-lesson-26-ma-language",
    vocab: [
      { word: "due diligence", ar: "العناية الواجبة", pos: "noun", en: "Investigation before acquiring a company" },
      { word: "acquisition", ar: "استحواذ", pos: "noun", en: "Buying another company" },
      { word: "valuation", ar: "تقييم", pos: "noun", en: "Estimating the worth of a company" },
      { word: "IP", ar: "ملكية فكرية", pos: "noun", en: "Intellectual Property" },
      { word: "material", ar: "جوهري", pos: "adjective", en: "Significant enough to affect a decision" },
      { word: "concentration risk", ar: "مخاطر التركيز", pos: "noun", en: "Depending too heavily on one source" },
      { word: "earn-out", ar: "أرباح مربوطة", pos: "noun", en: "Part of the payment tied to future performance" },
      { word: "representation", ar: "تمثيل", pos: "noun", en: "A formal statement of fact in a contract" },
      { word: "warranty", ar: "ضمان", pos: "noun", en: "A promise that something is true" },
      { word: "term sheet", ar: "ورقة شروط", pos: "noun", en: "A non-binding agreement outlining key terms" },
      { word: "synergy", ar: "nergy تآزر", pos: "noun", en: "Extra value created by combining two companies" },
      { word: "dilution", ar: " تخفيف", pos: "noun", en: "Reduction in ownership percentage" },
      { word: "indemnity", ar: "تعويض", pos: "noun", en: "Protection against loss or damage" },
      { word: "contingency", ar: "شريطة", pos: "noun", en: "A condition that must be met for a deal to proceed" },
    ],
    exercises: [
      ex("What is 'due diligence'?", ["A type of contract", "The investigation before acquiring a company", "A financial audit", "A tax calculation"], 1),
      ex("What is 'concentration risk'?", ["Too many products", "Depending too heavily on one source", "Spreading resources too thin", "Having too many offices"], 1),
      ex("What is an 'earn-out'?", ["A type of salary", "Part of the payment tied to future performance", "A legal penalty", "A type of meeting"], 1),
      ex("What is a 'term sheet'?", ["A final contract", "A non-binding agreement outlining key terms", "A tax form", "A job offer"], 1),
    ],
  },

  // ── Lesson 27: Corporate Governance ────────────────────────────────────
  {
    lessonId: "pro-lesson-27-corporate-governance",
    vocab: [
      { word: "minutes", ar: "محاضر", pos: "noun", en: "Official written record of a meeting" },
      { word: "resolution", ar: "قرار", pos: "noun", en: "An official decision made by a group" },
      { word: "quorum", ar: "نصيب", pos: "noun", en: "Minimum number needed for a valid vote" },
      { word: "abstain", ar: "امتناع", pos: "verb", en: "To choose not to vote" },
      { word: "dissenting", ar: "معارض", pos: "adjective", en: "Expressing disagreement" },
      { word: "conflict of interest", ar: "تضارب مصالح", pos: "noun", en: "When personal interests clash with duties" },
      { word: "fiduciary", ar: "أمين", pos: "adjective", en: "Held in trust for another" },
      { word: "compliance", ar: "امتثال", pos: "noun", en: "Following laws and regulations" },
      { word: "board", ar: "مجلس", pos: "noun", en: "A group that governs an organisation" },
      { word: "chair", ar: "رئيس", pos: "noun", en: "The person who leads a board meeting" },
      { word: "secretary", ar: "سكرتير", pos: "noun", en: "The person responsible for official records" },
      { word: "register", ar: "سجل", pos: "noun", en: "An official record or list" },
      { word: "verbatim", ar: "حرفياً", pos: "adverb", en: "Word for word, exactly as spoken" },
      { word: "close of business", ar: "نهاية العمل", pos: "noun", en: "The end of the working day" },
    ],
    exercises: [
      ex("Why are board minutes legally important?", ["They are published publicly", "They can be used as legal evidence", "They are required by tax law", "They are needed for marketing"], 1),
      ex("What must board minutes record about resolutions?", ["Only the outcome", "The proposer, seconder, and any dissenting votes", "The time spent discussing", "The room where held"], 1),
      ex("What is a 'conflict of interest'?", ["A disagreement between companies", "When personal interests clash with professional duties", "A type of contract", "A meeting format"], 1),
      ex("What does 'abstain' mean?", ["To vote yes", "To vote no", "To choose not to vote", "To leave the meeting"], 2),
    ],
  },

  // ── Lesson 28: Thought Leadership ──────────────────────────────────────
  {
    lessonId: "pro-lesson-28-thought-leadership",
    vocab: [
      { word: "thought leadership", ar: "ريادة الفكر", pos: "noun", en: "Being recognised as an authority in a field" },
      { word: "hook", ar: "خطاف", pos: "noun", en: "An opening that grabs attention" },
      { word: "provocative", ar: "استفزازي", pos: "adjective", en: "Causing people to think or react" },
      { word: "framework", ar: "إطار", pos: "noun", en: "A structure for understanding or doing something" },
      { word: "original", ar: "أصيل", pos: "adjective", en: "New and not copied from others" },
      { word: "insight", ar: "رؤى", pos: "noun", en: "A deep understanding of something" },
      { word: "narrative", ar: "سرد", pos: "noun", en: "A story or account of events" },
      { word: "keynote", ar: "كلمة رئيسية", pos: "noun", en: "The main speech at a conference" },
      { word: "commentary", ar: "تعليق", pos: "noun", en: "A set of observations or opinions" },
      { word: "industry", ar: "صناعة", pos: "noun", en: "A sector of business activity" },
      { word: "authority", ar: "سلطة", pos: "noun", en: "The power or right to give orders" },
      { word: "memorable", ar: "جذاب", pos: "adjective", en: "Worth remembering" },
      { word: "call to action", ar: "دعوة للعمل", pos: "noun", en: "A prompt telling readers what to do next" },
      { word: "stakeholder", ar: "طرف ذي مصلحة", pos: "noun", en: "Someone with an interest in the topic" },
    ],
    exercises: [
      ex("What is a 'hook' in writing?", ["A fishing tool", "An opening technique to grab attention", "A conclusion", "A citation"], 1),
      ex("Why is a statistic effective in thought leadership?", ["It makes the article longer", "It creates authority and urgency", "It is required by editors", "It fills space"], 1),
      ex("What makes thought leadership different from regular writing?", ["It is longer", "It offers original thinking, not just reporting", "It uses more jargon", "It is always online"], 1),
      ex("Why should articles end with a 'call to action'?", ["To fill space", "To inspire readers to do something", "Because editors require it", "To make the article longer"], 1),
    ],
  },
];

export function materialsForProfessionalLesson(lessonId: string): ProfessionalMaterialEntry | undefined {
  return PROFESSIONAL_MATERIALS.find((m) => m.lessonId === lessonId);
}
