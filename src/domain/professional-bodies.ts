export interface ProfessionalLessonBody {
  lessonId: string;
  explanation: string;
  examples: string[];
  commonMistakes: string[];
  tip: string;
}

export const PROFESSIONAL_BODIES: ProfessionalLessonBody[] = [
  {
    lessonId: "pro-lesson-01-professional-emails",
    explanation: "Professional emails follow a clear structure: subject line, greeting, body, and closing. The subject line should be specific and concise — it tells the reader why you are writing. The greeting matches the relationship: 'Dear Mr. Smith' for formal, 'Hi Sarah' for semi-formal. The body gets to the point quickly, using short paragraphs and bullet points. The closing should match the tone: 'Kind regards' for formal, 'Best' for semi-formal.",
    examples: [
      "Subject: Q2 Budget Review — Action Required by Friday",
      "Hi Maria, I wanted to follow up on our meeting. Could you send the updated figures by end of day? Kind regards, Tom",
      "Dear Mr. Chen, Thank you for your inquiry. Please find the proposal attached. We look forward to your feedback. Best regards, Anna",
    ],
    commonMistakes: [
      "Using vague subject lines like 'Hello' or 'Question'",
      "Writing very long paragraphs without line breaks",
      "Being too casual ('Hey!!') or too stiff ('To Whom It May Concern')",
      "Forgetting to attach files you mention in the email",
    ],
    tip: "Before sending, ask yourself: Would I understand this email if I received it? Is the purpose clear in the first sentence?",
  },
  {
    lessonId: "pro-lesson-02-business-meetings",
    explanation: "Business meetings follow a predictable pattern: opening, agenda review, discussion of each item, decisions, action points, and closing. Your role is to contribute clearly, listen actively, and avoid going off-topic. Use signposting language: 'Before we move on...', 'Could I add a point?', 'I suggest we...'. Meeting vocabulary includes agenda, minutes, action points, consensus, and quorum.",
    examples: [
      "Good morning. Let us get started. The agenda for today covers three items.",
      "I see your point, but I am not sure that is the best approach.",
      "Could we agree on a deadline for this task?",
      "Let me summarise the action points before we close.",
    ],
    commonMistakes: [
      "Interrupting others without saying 'May I interject?'",
      "Going off-topic when it is not your item",
      "Not summarising what was agreed at the end",
      "Confusing 'agenda' with 'minutes'",
    ],
    tip: "Always prepare one question or comment before a meeting. It shows engagement and helps you contribute confidently.",
  },
  {
    lessonId: "pro-lesson-03-telephone-calls",
    explanation: "Professional phone and video calls require clear, slightly slower speech than in-person conversations. Start by identifying yourself and your company. If the person is unavailable, offer to take a message with specific details. On video calls, check your audio and camera before the meeting starts. Always confirm important details at the end of the call.",
    examples: [
      "Good morning, Greenwood Solutions. How may I help you?",
      "I am calling from TechVentures. I would like to speak to Mr. Williams.",
      "One moment please. Let me check if he is available.",
      "Could you ask him to call me back? My number is 07700 900 123.",
    ],
    commonMistakes: [
      "Answering with 'Hello?' instead of identifying the company",
      "Not having a pen ready to take messages",
      "Talking too fast — phone quality means slower speech is clearer",
      "Forgetting to confirm the callback number",
    ],
    tip: "Stand up or walk slowly during video calls — it adds energy to your voice and helps you sound more confident.",
  },
  {
    lessonId: "pro-lesson-04-describing-your-job",
    explanation: "When describing your job, start with your role and company, then explain your responsibilities in simple terms. Use 'I work in [department] at [company]' or 'I am a [title]'. Describe your daily tasks using 'I mainly work on...' or 'My main responsibility is...'. For networking, ask open-ended questions: 'What do you do?', 'How did you get into this field?'.",
    examples: [
      "I am a software engineer at DataCore. I mainly work on building data pipelines.",
      "I work in the marketing department at BlueSky Media. My focus is on digital campaigns.",
      "I am a project manager. I coordinate between the design and development teams.",
    ],
    commonMistakes: [
      "Using overly technical jargon that listeners may not understand",
      "Not giving enough detail — 'I work with computers' is too vague",
      "Forgetting to ask the other person about their role",
      "Being too humble or too boastful about your achievements",
    ],
    tip: "Prepare a 30-second 'elevator pitch' about your job. Practice it until it sounds natural, not rehearsed.",
  },
  {
    lessonId: "pro-lesson-05-business-travel",
    explanation: "Business travel vocabulary includes booking, checking in, and handling changes. When booking, mention your company name for corporate rates. At the hotel, say 'I have a reservation under [name]'. For flights, know terms like boarding pass, gate, layover, and terminal. Always keep receipts for expense reimbursement.",
    examples: [
      "I have a reservation under the name Clarke. I am here for the technology conference.",
      "Could you confirm the checkout time? I have an early flight on Friday.",
      "Can you book a taxi to the airport for Friday morning?",
      "I need a receipt for my expenses, please.",
    ],
    commonMistakes: [
      "Not confirming the reservation details before travel",
      "Forgetting to ask for receipts for expenses",
      "Not checking the cancellation policy",
      "Assuming everything will work out — always have a backup plan",
    ],
    tip: "Save your hotel confirmation, flight details, and itinerary in one place on your phone. Offline access is essential when abroad.",
  },
  {
    lessonId: "pro-lesson-06-scheduling",
    explanation: "Scheduling in English uses polite requests and offers. Start with 'Do you have time this week?' or 'Could we meet about...?'. Suggest specific times: 'How about Thursday at 10?'. Confirm with 'That works for me' or 'I will send a calendar invite'. To decline, say 'I am afraid I am not available then. Could we try...?'",
    examples: [
      "Do you have time this week to discuss the budget proposal?",
      "I am free on Wednesday afternoon, but Thursday morning would be better.",
      "Thursday at ten works for me. Should we book a meeting room?",
      "Please include the agenda so I can prepare beforehand.",
    ],
    commonMistakes: [
      "Being too vague: 'Let us meet sometime' — always suggest specific times",
      "Not confirming in writing after agreeing on a time",
      "Forgetting to consider time zones for international calls",
      "Declining without offering an alternative time",
    ],
    tip: "Use shared calendars (Google Calendar, Outlook) to avoid double-booking. Always send a calendar invite after agreeing on a time.",
  },
  {
    lessonId: "pro-lesson-07-basic-documents",
    explanation: "Business documents have specific formats and vocabulary. An invoice requests payment with details like quantity, unit price, and total. A purchase order (PO) is sent to a supplier to order goods. A memo is an internal written message. Always check invoices against purchase orders to find discrepancies — differences between what was ordered and what was billed.",
    examples: [
      "I received an invoice from the printing company but the quantity is wrong.",
      "They charged us for five hundred copies but we only ordered three hundred.",
      "We need to flag this before making payment.",
      "I will note the discrepancy in our accounts.",
    ],
    commonMistakes: [
      "Paying invoices without checking them against the purchase order",
      "Not keeping copies of all business documents",
      "Using 'invoice' and 'receipt' interchangeably — they are different",
      "Ignoring small discrepancies — they can add up to significant amounts",
    ],
    tip: "Create a simple checklist for reviewing invoices: PO number matches? Quantity correct? Prices match the agreement? Tax calculated correctly?",
  },
  {
    lessonId: "pro-lesson-08-report-writing",
    explanation: "A business report follows a standard structure: title page, executive summary, introduction, findings, conclusions, and recommendations. The executive summary is the most important section — many busy executives read only this. Write it last. Findings present data and analysis. Recommendations should be specific and actionable, not vague suggestions.",
    examples: [
      "Executive Summary: Sales increased 12% in Q2 driven by the new product line.",
      "Finding: Customer retention dropped 5% due to service delays.",
      "Recommendation: Implement a new ticketing system to reduce response times by 30%.",
    ],
    commonMistakes: [
      "Writing the executive summary first instead of last",
      "Making recommendations without supporting data",
      "Using too much jargon — keep language clear",
      "Not structuring findings logically — group by theme, not chronologically",
    ],
    tip: "Before writing, decide: What does the reader need to know? What decision will they make based on this report? Focus on that.",
  },
  {
    lessonId: "pro-lesson-09-presentations",
    explanation: "A good presentation has three parts: opening (grab attention and preview), body (deliver content with clear transitions), and closing (summarise and call to action). Use signposting: 'First...', 'Moving on to...', 'Finally...'. Engage the audience with questions, eye contact, and pauses. Handle Q&A by repeating the question, giving a concise answer, and checking if that addressed the concern.",
    examples: [
      "Good afternoon. Today I will walk you through our 2026 marketing strategy.",
      "I have divided this into three sections: current performance, challenges, and our proposed approach.",
      "As you can see, our organic reach has grown by eighteen percent.",
      "That is a great question. Let me address that...",
    ],
    commonMistakes: [
      "Reading directly from slides instead of talking to the audience",
      "Not rehearsing — a rough first time shows",
      "Ignoring the audience and talking for too long without a break",
      "Ending with 'That is it' instead of a strong closing statement",
    ],
    tip: "Record yourself presenting and watch it back. You will notice filler words, pace issues, and body language problems you did not notice during the presentation.",
  },
  {
    lessonId: "pro-lesson-10-negotiations",
    explanation: "Negotiation in English uses specific phrases for making offers, counter-offers, and reaching agreement. Start by understanding the other party's position: 'What did you have in mind?'. Make concessions strategically: 'If you can do X, we could agree to Y'. Never accept the first offer — always negotiate. End with 'We have a deal' or 'Let us put that in writing'.",
    examples: [
      "The unit price of forty-five dollars is above our budget.",
      "What price did you have in mind? We are open to discussion.",
      "We could agree to thirty-eight dollars if you commit to a minimum order.",
      "Let me speak to my manager. If we can agree on forty, we have a deal.",
    ],
    commonMistakes: [
      "Accepting the first offer without negotiating",
      "Being aggressive instead of firm but respectful",
      "Not understanding your own limits before starting",
      "Failing to get the final agreement in writing",
    ],
    tip: "Before negotiating, know your BATNA (Best Alternative To a Negotiated Agreement). If the deal falls through, what is your backup? This gives you confidence.",
  },
  {
    lessonId: "pro-lesson-11-job-interviews",
    explanation: "The STAR method helps structure answers to behavioural interview questions: Situation (set the scene), Task (your responsibility), Action (what you specifically did), Result (the positive outcome). Prepare 5-6 stories from your experience that demonstrate different skills. For 'What is your weakness?', choose a real one and explain how you are improving.",
    examples: [
      "Situation: In my previous role, a colleague consistently missed deadlines.",
      "Task: I needed to address this without damaging our working relationship.",
      "Action: I arranged a private conversation and asked what was causing the delays.",
      "Result: We redistributed tasks and they improved within two weeks.",
    ],
    commonMistakes: [
      "Giving vague answers instead of specific examples",
      "Talking about 'we' when the interviewer asked about 'you'",
      "Saying 'I have no weaknesses' — everyone has them",
      "Not preparing questions to ask the interviewer",
    ],
    tip: "Write down your STAR stories before the interview. Practise saying them out loud until they sound natural, not memorised.",
  },
  {
    lessonId: "pro-lesson-12-customer-service",
    explanation: "Customer service communication follows the HEARD model: Hear (listen fully), Empathise (acknowledge feelings), Apologise (take responsibility), Resolve (fix the problem), Diagnose (find the root cause). Never argue with a customer, even if they are wrong. Use phrases like 'I understand your frustration' and 'Let me see what I can do'. Always follow up to confirm the issue is resolved.",
    examples: [
      "I completely understand your frustration, and I sincerely apologise.",
      "Let me look into this for you right away.",
      "I will escalate this with our priority shipping team.",
      "I will also apply a fifteen percent discount to your order.",
    ],
    commonMistakes: [
      "Saying 'That is not our fault' — customers do not care whose fault it is",
      "Making promises you cannot keep",
      "Not following up after resolving the issue",
      "Using jargon the customer will not understand",
    ],
    tip: "After resolving a complaint, send a brief follow-up email confirming what was done. It shows professionalism and helps if there are future disputes.",
  },
  {
    lessonId: "pro-lesson-13-marketing-sales",
    explanation: "Marketing copy uses persuasive language to drive action. A strong call to action (CTA) tells the reader exactly what to do: 'Start your free trial', 'Download the guide', 'Book a demo'. The value proposition explains why your product is worth buying in one clear sentence. Social proof (testimonials, reviews, case studies) builds trust by showing others have had success.",
    examples: [
      "Start your free trial today — no credit card required.",
      "Save ten hours a week with automated reporting.",
      "Join 5,000 companies already using our platform.",
      "See how Company X increased sales by 40% in three months.",
    ],
    commonMistakes: [
      "Writing features instead of benefits — 'Our software has AI' vs 'Save 10 hours a week'",
      "Using weak CTAs like 'Learn more' or 'Click here'",
      "Ignoring the target audience — copy should speak to their needs",
      "Making claims without evidence",
    ],
    tip: "Read your copy out loud. If it sounds like something a real person would say to a friend, it is probably good. If it sounds like corporate jargon, rewrite it.",
  },
  {
    lessonId: "pro-lesson-14-project-communication",
    explanation: "Project communication keeps everyone informed about progress, risks, and changes. Use RAG status (Red/Amber/Green) to show project health at a glance. Status updates should include: what has been completed, what is in progress, what is blocked, and what is coming next. Always include the impact of any issues and what action is being taken.",
    examples: [
      "RAG status: Amber — supplier delay impacting UI components.",
      "Completed: Design phase finished on time.",
      "Blocked: Waiting for API credentials from the vendor.",
      "Next: User testing scheduled for week 15.",
    ],
    commonMistakes: [
      "Writing status updates that are too long — keep them concise",
      "Hiding problems — if something is red, say why",
      "Not including next steps or expected resolution dates",
      "Using different formats for different stakeholders — be consistent",
    ],
    tip: "Create a standard status update template. Using the same format every time makes it easier for readers to find the information they need.",
  },
  {
    lessonId: "pro-lesson-15-persuasion",
    explanation: "Persuasion in English uses rhetorical techniques: logos (logical arguments with data), ethos (credibility and authority), and pathos (emotional appeal). Frame your message to match what the audience cares about. Address objections before they are raised. Use evidence-based arguments and clear, confident language.",
    examples: [
      "The data shows a forty percent underserved segment.",
      "Even the conservative model shows break-even within eighteen months.",
      "I understand your concern about resources. Here is our plan...",
      "Three independent studies support this approach.",
    ],
    commonMistakes: [
      "Being too emotional without data to support your case",
      "Ignoring objections instead of addressing them proactively",
      "Using too many caveats — 'maybe', 'possibly', 'I think'",
      "Not matching your message to what the audience values",
    ],
    tip: "Know your audience. What do they care about? Revenue? Risk reduction? Speed? Frame every argument in terms of what matters to them.",
  },
  {
    lessonId: "pro-lesson-16-conflict-resolution",
    explanation: "Conflict resolution uses active listening, neutral language, and reframing. Hear both sides without judgement. Use 'I hear your concern' to validate feelings. Reframe hostile statements into constructive ones: 'He is lazy' becomes 'The challenge is aligning expectations on workload'. Focus on interests (what people need) rather than positions (what people say they want).",
    examples: [
      "I understand there is tension. Let us hear both sides.",
      "Let me reframe that — the challenge is managing scope changes.",
      "Could we agree on a change freeze two weeks before the deadline?",
      "What outcome would satisfy both teams?",
    ],
    commonMistakes: [
      "Taking sides — stay neutral as a mediator",
      "Focusing on blame instead of solutions",
      "Rushing to a solution before both sides feel heard",
      "Using language like 'You are wrong' — use 'I see it differently'",
    ],
    tip: "When mediating, repeat back what each person says in neutral language. It shows you are listening and helps defuse tension.",
  },
  {
    lessonId: "pro-lesson-17-cross-cultural",
    explanation: "Cross-cultural communication requires awareness of different communication styles. High-context cultures (Japan, China, Arab countries) rely on implicit communication, body language, and context. Low-context cultures (US, Germany, Netherlands) prefer direct, explicit communication. Adapt your style: be more indirect with high-context cultures and more direct with low-context ones.",
    examples: [
      "In Japan, 'that would be difficult' often means no.",
      "With German colleagues, do not mistake directness for rudeness.",
      "Silence in some cultures signals disagreement, not agreement.",
      "Adapting your style shows respect and builds rapport.",
    ],
    commonMistakes: [
      "Assuming everyone communicates the same way you do",
      "Taking directness personally when it is a cultural norm",
      "Not researching cultural norms before international meetings",
      "Using idioms or slang that may not translate well",
    ],
    tip: "Before meeting someone from a different culture, spend 15 minutes researching basic communication norms. It shows respect and prevents misunderstandings.",
  },
  {
    lessonId: "pro-lesson-18-financial-legal",
    explanation: "Financial and legal English uses precise, formal vocabulary. A contract contains clauses — specific sections that define terms. A limitation of liability caps potential damages. A termination clause explains how to end the agreement. Force majeure covers unforeseeable events. Always read contracts carefully — one word can change the meaning significantly.",
    examples: [
      "Clause 4.2 contains a limitation of liability capping damages at the contract value.",
      "Clause 7 allows termination with thirty days written notice.",
      "I recommend adding a force majeure clause for unforeseeable circumstances.",
      "The penalty for early termination is five percent of remaining value.",
    ],
    commonMistakes: [
      "Skimming contracts instead of reading every clause",
      "Not understanding terms like 'indemnity', 'warranty', 'liability'",
      "Assuming verbal agreements are as binding as written ones",
      "Not seeking legal advice for complex contracts",
    ],
    tip: "Keep a glossary of legal and financial terms you encounter. Over time, you will build a personal reference that makes reading contracts easier.",
  },
  {
    lessonId: "pro-lesson-19-technical-communication",
    explanation: "Technical writing must be clear, accurate, and structured for the reader's level. Avoid jargon unless writing for experts. Use numbered steps for instructions, code examples for programming, and screenshots for visual guides. Structure documents logically: prerequisites → installation → configuration → usage → troubleshooting. Always test your instructions with a real user.",
    examples: [
      "Step 1: Install Node.js version 18 or higher.",
      "Step 2: Run 'npm install' in the project directory.",
      "Common error: 'Module not found' — this means the package was not installed correctly.",
      "For help, contact support@company.com or see our FAQ.",
    ],
    commonMistakes: [
      "Assuming the reader knows what you know — explain from their perspective",
      "Not including error messages and solutions in troubleshooting sections",
      "Writing walls of text without headings or bullet points",
      "Not updating documentation when the software changes",
    ],
    tip: "Ask a colleague who has never used the system to follow your documentation. Watch where they get confused — those are the sections to improve.",
  },
  {
    lessonId: "pro-lesson-20-media-pr",
    explanation: "Media communication requires preparation and discipline. A press release has a headline, dateline, lead paragraph (who, what, when, where, why), body, and quotes. When giving interviews, use bridging to redirect difficult questions: 'I cannot comment on that specifically, but what I can tell you is...'. Stay on message — repeat your key points even if asked different questions.",
    examples: [
      "I cannot comment on that specifically, but what I can tell you is...",
      "We identified a quality issue, we have stopped production, and we are implementing new checks.",
      "Our priority is customer safety, and we are taking immediate action.",
      "I will have to check on that and get back to you.",
    ],
    commonMistakes: [
      "Speculating or guessing when you do not have confirmed information",
      "Going off-message — always return to your key points",
      "Using jargon or technical language that journalists may not understand",
      "Not preparing holding statements before a crisis",
    ],
    tip: "Prepare three key messages before any media interview. Write them on a card. No matter what you are asked, find a way back to those three points.",
  },
  {
    lessonId: "pro-lesson-21-leadership",
    explanation: "Leadership communication requires clarity, transparency, and empathy. Town halls should share good and bad news — selective transparency destroys trust. One-to-one meetings should balance feedback with listening. When giving constructive feedback, use the SBI model: Situation (when and where), Behaviour (what happened), Impact (how it affected others).",
    examples: [
      "We grew revenue by twenty-two percent, but I must be honest — we missed our hiring targets.",
      "I want to be clear: our people are our greatest asset.",
      "In the meeting on Tuesday, you interrupted three times. The impact was that some team members stopped sharing ideas.",
      "What support do you need to succeed?",
    ],
    commonMistakes: [
      "Only sharing good news — people see through it and trust erodes",
      "Giving feedback that is too vague to act on",
      "Doing all the talking in one-to-ones instead of listening",
      "Not following up on commitments made during conversations",
    ],
    tip: "After every town hall or team meeting, send a brief written summary of what was discussed and decided. It ensures everyone has the same information.",
  },
  {
    lessonId: "pro-lesson-22-strategic-writing",
    explanation: "Strategic documents are read by senior leaders who need clear, data-backed analysis to make decisions. Structure: vision, market analysis, strategic pillars, financial projections, risk assessment. Use multiple financial scenarios (conservative, moderate, optimistic). Be explicit about assumptions and risks. Every claim needs evidence — opinions without data are ignored at this level.",
    examples: [
      "The three-year forecast shows a path to profitability by Q3 2027.",
      "Conservative scenario: break-even in 24 months. Moderate: 18 months. Optimistic: 12 months.",
      "The biggest risk is currency fluctuation — a 10% shift delays break-even by two quarters.",
      "Our mitigation: rolling forward contracts covering 70% of exposure.",
    ],
    commonMistakes: [
      "Making optimistic assumptions without considering risks",
      "Not backing claims with data — 'we believe' is not enough",
      "Ignoring competition in the market analysis",
      "Writing too much — executives want concise, focused documents",
    ],
    tip: "For every positive claim, ask: 'What could go wrong?' Address it proactively. Boards respect honesty more than optimism.",
  },
  {
    lessonId: "pro-lesson-23-executive-presentations",
    explanation: "Presenting to executives requires extreme conciseness. Start with the answer, then provide supporting evidence. Do not make them wait for the key message. Anticipate tough questions and prepare concise answers. Use data visualisation effectively — charts should tell a story, not just show numbers. Quantify risks in business terms they understand.",
    examples: [
      "The three-year forecast shows profitability by Q3 2027. Here are the key assumptions.",
      "The biggest risk is currency fluctuation. A 10% shift delays break-even by two quarters.",
      "I propose hedging 70% of our exposure for the next 18 months.",
      "The downside is limited to 3% margin reduction. The upside is 15% revenue growth.",
    ],
    commonMistakes: [
      "Starting with background instead of the key message",
      "Reading from slides instead of engaging with the audience",
      "Not having concise answers ready for predictable questions",
      "Using complex charts that are hard to interpret quickly",
    ],
    tip: "Executive presentations follow the 'inverted pyramid' — lead with the most important information. If they stop you at slide 2, they already have what they need.",
  },
  {
    lessonId: "pro-lesson-24-crisis-communication",
    explanation: "Crisis communication follows four principles: speed (respond quickly), transparency (be honest), empathy (acknowledge impact), and action (explain what you are doing). A crisis statement has four parts: acknowledge what happened, explain what data was affected, outline your actions, provide support (helpline, resources). Never speculate about blame. Employees should hear about a crisis before the public.",
    examples: [
      "We are aware of a data breach affecting approximately 50,000 records.",
      "No financial data was compromised. We have secured the affected systems.",
      "We are offering free credit monitoring to all affected customers.",
      "Our investigation is ongoing, and we are working with law enforcement.",
    ],
    commonMistakes: [
      "Responding too slowly — silence looks like a cover-up",
      "Being vague when people need specifics",
      "Speculating about attackers before law enforcement confirms",
      "Letting employees learn about a crisis from the news",
    ],
    tip: "Prepare a crisis communication kit before a crisis: template statements, spokesperson list, media contacts, escalation procedures. You will not have time to create these during a crisis.",
  },
  {
    lessonId: "pro-lesson-25-change-management",
    explanation: "Change management communication must be honest, empathetic, and frequent. Acknowledge that change is unsettling. Address the hardest question first — do not avoid it. Provide specific support: career coaching, workshops, helplines. Follow up with written details. Communicate the 'why' behind the change, not just the 'what'. People accept change better when they understand the reason.",
    examples: [
      "I know change can be unsettling. Let me explain openly why we are restructuring.",
      "Some roles will change. No decisions are final yet.",
      "We are creating a support programme with career coaching and skills workshops.",
      "A detailed FAQ will be sent by Thursday.",
    ],
    commonMistakes: [
      "Avoiding the hardest questions — it erodes trust faster than bad news",
      "Communicating once and assuming it is enough — repeat the message",
      "Not providing written follow-up after verbal announcements",
      "Focusing on the business case without acknowledging the human impact",
    ],
    tip: "During change, over-communicate. People need to hear the same message multiple times in different formats before it sinks in.",
  },
  {
    lessonId: "pro-lesson-26-ma-language",
    explanation: "Mergers and acquisitions use highly specific vocabulary. Due diligence is the investigation before acquiring a company. A term sheet outlines key terms (non-binding). Material risks are significant enough to affect the deal. Earn-out ties part of the payment to future performance. Representations and warranties are legal assurances about the company's condition.",
    examples: [
      "The due diligence report flagged three material risks.",
      "The first is an unresolved IP dispute worth up to twelve million.",
      "We should negotiate an earn-out clause tied to client retention.",
      "Request representations and warranties on the IP dispute.",
    ],
    commonMistakes: [
      "Not understanding the vocabulary before entering negotiations",
      "Ignoring material risks because the deal seems attractive",
      "Not getting legal advice on representations and warranties",
      "Focusing only on price and not on deal structure",
    ],
    tip: "Build a glossary of M&A terms before your first deal discussion. Having the vocabulary right gives you credibility and prevents misunderstandings.",
  },
  {
    lessonId: "pro-lesson-27-corporate-governance",
    explanation: "Corporate governance documents must be precise because they have legal standing. Board minutes record: who was present, what was discussed, who proposed and seconded each resolution, who voted for/against/abstained, and any conflicts of interest. Use verbatim language for resolutions. Minutes should be factual, not interpretive — record what was said, not what you think was meant.",
    examples: [
      "Resolution one: The board approved the acquisition of Meridian Ltd, subject to regulatory clearance.",
      "Director Williams abstained from the vote due to a conflict of interest.",
      "The conflict of interest register was updated accordingly.",
      "A detailed FAQ will be sent by Thursday.",
    ],
    commonMistakes: [
      "Recording opinions instead of facts in minutes",
      "Not recording who proposed and seconded resolutions",
      "Forgetting to note dissenting votes or abstentions",
      "Using informal language in legal documents",
    ],
    tip: "When recording minutes, focus on decisions and actions, not discussion details. The key information is: what was decided, who is responsible, and by when.",
  },
  {
    lessonId: "pro-lesson-28-thought-leadership",
    explanation: "Thought leadership establishes you as an authority in your field. It requires original thinking, not just reporting what others have said. Start with a hook (provocative question, striking statistic). Present your unique framework or model based on real experience. Support with evidence and examples. End with a call to action that inspires readers to think or act differently.",
    examples: [
      "By 2028, 80% of enterprise decisions will be influenced by AI — yet fewer than 10% of boards have an AI governance framework.",
      "My three-pillar model for responsible AI adoption comes from working with five enterprise clients.",
      "The first pillar is transparency: every AI decision must be explainable.",
      "Start by auditing one AI system in your organisation this quarter.",
    ],
    commonMistakes: [
      "Summarising others' work instead of offering original analysis",
      "Being too academic — write for a business audience, not professors",
      "Not backing claims with evidence or experience",
      "Ending without a clear call to action",
    ],
    tip: "The best thought leadership comes from real experience. Write about what you have actually done, not what you think should be done.",
  },
];

export function bodyForProfessionalLesson(lessonId: string): ProfessionalLessonBody | undefined {
  return PROFESSIONAL_BODIES.find((b) => b.lessonId === lessonId);
}
