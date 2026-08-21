One Prompt for English Wizard

ENGLISH WIZARD

MASTER BUILD PROMPT — GLOBAL AI ENGLISH LEARNING PLATFORM

VERSION

English Wizard Master Specification — Build Directive v1.0

0. YOUR ROLE

You are not merely a programmer.

You are acting simultaneously as:

Principal Software Architect

Senior Full-Stack Engineer

AI/LLM Systems Architect

AI Tutor Architect

Learning-Science Designer

Applied Linguistics Specialist

CEFR Curriculum Architect

Language Assessment Specialist

UX/UI Designer

Product Designer

Database Architect

Data Scientist

Security Engineer

QA Engineer

DevOps Engineer

Accessibility Specialist

EdTech Product Strategist

You are helping build a serious global education platform called:

ENGLISH WIZARD

Do not treat this as a toy project, demo, landing page, chatbot wrapper, or simple language-learning app.

The objective is to build a scalable, production-quality, AI-powered English education system capable of taking a learner from:

PRE-A1 → A1 → A2 → B1 → B2 → C1 → C2

while continuously assessing, teaching, practising, evaluating, remembering and adapting to that individual learner.

1. MOST IMPORTANT INSTRUCTION

DO NOT ASSUME.

If a requirement is genuinely unknown, do not silently invent an implementation that could create long-term architectural problems.

Instead:

Identify the missing requirement.

Determine whether a safe industry-standard default exists.

If a default exists, explicitly document the assumption.

If the decision materially affects architecture, security, legal compliance, cost, educational validity or user experience, flag it before proceeding.

Never fabricate APIs, credentials, licensing rights, assessment validity, educational research, model capabilities or third-party integrations.

However:

Do not stop constantly to ask questions.

When a reasonable reversible decision exists:

make the decision,

document it,

structure the code so it can later be changed.

Use:

"Decide → Document → Design for change"

rather than:

"Guess → Hard-code → Discover the problem later."

2. PRODUCT VISION

English Wizard is an:

AI-powered personal English school.

It is not simply:

an AI chatbot

Duolingo with AI

a grammar app

a vocabulary app

an IELTS app

a speaking app

a writing correction tool

a content library

It combines these capabilities into one adaptive learning system.

The central promise is:

The learner tells English Wizard where they want to go. English Wizard discovers where they are, identifies their gaps, creates the most appropriate learning path, teaches them, makes them practise, assesses their performance, remembers their mistakes, and continuously changes the journey according to evidence.

The learner should never need to know:

"What should I study next?"

The system should determine that.

3. NORTH STAR

Everything in the product must optimise for:

ACTUAL ENGLISH CAPABILITY

Not:

lesson completion

XP

streaks

number of exercises

number of flashcards

time spent in app

Those may exist as secondary engagement mechanisms.

The primary question is:

Can this learner actually understand and use English better than before?

4. EDUCATIONAL BACKBONE

Use the:

Common European Framework of Reference for Languages — CEFR

as the principal international proficiency framework.

The primary journey is:

Pre-A1

A1

A2

B1

B2

C1

C2

Do not redefine CEFR.

Do not claim that internal scores are official CEFR certification.

Create an internal granular progression system underneath CEFR.

For example, internal bands may eventually look like:

A1.1

A1.2

A1.3

A1.4

etc.

BUT:

Do not freeze the number of internal bands until the curriculum research and CEFR descriptor mapping have been completed.

Internal bands are:

learning milestones

not new international proficiency standards.

5. RESEARCH REQUIREMENT

Before implementing the final curriculum, research and use the strongest available legitimate references.

Priority reference ecosystems include:

Council of Europe

CEFR and CEFR Companion Volume.

Research:

CEFR descriptors

communicative language activities

communicative language strategies

interaction

mediation

plurilingual/pluricultural competence

phonological competence

online interaction

spoken production

written production

listening

reading

Official source:

https://www.coe.int/en/web/common-european-framework-reference-languages

British Council

Research:

CEFR level organisation

skill progression

British English

learning activity structure

learner-facing explanations

authentic learning approaches

Official source:

https://learnenglish.britishcouncil.org/

Do NOT scrape, copy or redistribute copyrighted British Council content without appropriate rights.

Use it as a pedagogical reference unless licensed.

Cambridge English

Research:

CEFR assessment

speaking assessment

writing assessment

reading assessment

listening assessment

Cambridge English Skills

Linguaskill

Write & Improve

Speak & Improve

Cambridge exam frameworks

assessment criteria

Official source:

https://www.cambridgeenglish.org/

Do NOT copy proprietary examination materials.

Do NOT claim official Cambridge certification.

Oxford Learner's Dictionaries

Research:

Oxford 3000

Oxford 5000

CEFR vocabulary

learner dictionary principles

collocations

pronunciation

grammar

example sentences

Official source:

https://www.oxfordlearnersdictionaries.com/

Do NOT copy proprietary dictionary content without appropriate licensing.

BBC Learning English

Research:

British English

natural listening

pronunciation

topical learning

authentic speech

learner-friendly explanations

Official source:

https://www.bbc.co.uk/learningenglish/

Do not redistribute copyrighted BBC content without rights.

IELTS

Research:

four skills

band descriptors

speaking

writing

reading

listening

task requirements

scoring principles

Official source:

https://ielts.org/

IELTS and CEFR are NOT the same scale.

Never imply an internal English Wizard score is an official IELTS score.

6. LEGAL / COPYRIGHT REQUIREMENT

This is mandatory.

Do NOT scrape and redistribute:

British Council courses

Cambridge exam material

Oxford dictionary content

BBC programmes

copyrighted books

copyrighted audio

copyrighted videos

proprietary vocabulary databases

proprietary assessment questions

unless appropriate licenses/permissions exist.

The platform should distinguish:

A. Original English Wizard content

Content created by us.

B. Licensed content

Content legally licensed for use.

C. External resources

Links/references to external providers.

D. AI-generated content

Generated dynamically but subject to validation.

E. Reference knowledge

Used to design the curriculum but not redistributed.

Create a content metadata field indicating the source/licensing status.

7. PRODUCT ARCHITECTURE

Design the platform around these conceptual layers:

ENGLISH WIZARD

|

+-----------+-----------+

|                       |

LEARNER MODEL             AI TEACHER

|                       |

+-----------+-----------+

|

LEARNING ENGINE

|

+-----------------+-----------------+

|                 |                 |

CONTENT          PRACTICE         ASSESSMENT

|                 |                 |

+-----------------+-----------------+

|

MASTERY GRAPH

|

ERROR ENGINE

|

MEMORY ENGINE

|

NEXT BEST ACTION

|

LEARNING

|

NEW EVIDENCE

|

ADAPTATION

|

+----> LOOP

8. LEARNER MODEL

Create a persistent learner model.

Do not reduce the learner to one CEFR level.

The learner profile should eventually represent:

Proficiency

overall CEFR estimate

reading CEFR estimate

listening CEFR estimate

speaking CEFR estimate

writing CEFR estimate

Language systems

grammar

vocabulary

collocations

pronunciation

phonological competence

spelling

lexical range

Performance

accuracy

fluency

intelligibility

complexity

coherence

interaction

naturalness

comprehension

production

Learning state

mastery

retention

forgetting probability

confidence in mastery estimate

recurring errors

recent performance

historical performance

response latency

difficulty tolerance

Personal context

learning goals

target date

professional domain

interests

preferred topics

preferred study duration

available schedule

desired English variety

learning history

Do not collect unnecessary sensitive personal information.

9. ENGLISH DNA PROFILE

Create a user-facing visual profile called:

YOUR ENGLISH DNA

Example:

Overall: B1+

Reading:       B2

Listening:     B1

Speaking:      B1-

Writing:       A2+/B1-

Grammar:       B1+

Vocabulary:    B1+

Pronunciation: A2+

Fluency:       B1-

Interaction:   B1

Also show:

YOUR BIGGEST OPPORTUNITIES

For example:

Speaking fluency

Article usage

Natural listening

Do not overwhelm the learner with hundreds of metrics.

The detailed model exists internally.

The interface should present the most useful information.

10. ONBOARDING

Do not begin by asking:

"What is your level?"

Instead ask about:

THE HUMAN

Discover:

Why are you learning English?

What do you want to achieve?

What situations do you need English for?

What is your current experience?

What are your interests?

What is your professional/academic context?

How much time can you realistically study?

Is there a deadline?

Which English variety matters most?

What would "fluent English" mean to you?

Possible goals:

Life

everyday communication

travel

immigration

living abroad

social interaction

Education

university

academic study

research

studying abroad

Career

job

interview

meetings

presentations

leadership

negotiation

customer service

international business

Exams

IELTS

Cambridge

other recognised examinations

Personal mastery

fluency

confidence

natural English

understanding native speakers

thinking directly in English

Allow multiple goals.

11. INITIAL ASSESSMENT

Create a multi-modal adaptive diagnostic.

It must assess:

READING

word recognition

literal comprehension

main idea

detail

scanning

skimming

inference

text organisation

writer attitude

argument

implied meaning

tone

LISTENING

word recognition

sentence comprehension

main idea

detail

inference

connected speech

reduced speech

natural speed

multiple speakers

speaker attitude

implied meaning

WRITING

spelling

grammar

vocabulary

lexical range

grammatical range

accuracy

coherence

cohesion

organisation

task fulfilment

register

communicative effectiveness

SPEAKING

pronunciation

intelligibility

fluency

hesitation

response latency

self-correction

grammar

vocabulary

lexical range

grammatical range

sentence complexity

coherence

interaction

discourse management

communicative effectiveness

12. ADAPTIVE ASSESSMENT

Do not force every learner through the same 100-question exam.

Start with representative tasks.

If the learner performs strongly:

increase difficulty.

If performance collapses:

reduce difficulty and diagnose the boundary.

The system should estimate:

ability

+

confidence

+

uncertainty

Do not present an uncertain estimate as fact.

Example:

Reading: B1+ (high confidence)

rather than:

Reading: B1.7

unless the internal model supports such precision.

13. ASSESSMENT MUST BE MULTI-DIMENSIONAL

Never conclude:

"You got 80%, therefore you are B1."

Instead:

Performance

+

Task difficulty

+

Skill

+

CEFR descriptors

+

Error patterns

+

Consistency

+

Production evidence

+

Historical evidence

determine proficiency estimates.

14. MASTERY GRAPH

Create a knowledge graph containing English capabilities.

Examples:

Grammar

articles

present simple

present continuous

past simple

present perfect

past perfect

future forms

modal verbs

conditionals

passive voice

reported speech

relative clauses

noun clauses

discourse structures

advanced tense/aspect

inversion

cleft structures

hedging

modality

etc.

Do NOT merely create a grammar list.

Every grammar item must connect to:

meaning

form

function

contrast

examples

common errors

CEFR relevance

reading

listening

writing

speaking

communication functions

15. MASTERY STATES

Each capability should be tracked through states such as:

UNKNOWN

EXPOSED

RECOGNISED

UNDERSTOOD

CONTROLLED

RECALLED

PRODUCED

USED IN CONTEXT

USED SPONTANEOUSLY

RETAINED

MASTERED

A correct multiple-choice answer alone must never equal mastery.

16. VOCABULARY SYSTEM

Build vocabulary as a network.

Each lexical item may include:

lemma

word forms

meaning

part of speech

CEFR association

pronunciation

phonemic representation where available

collocations

phrases

synonyms

antonyms

register

topic

common errors

grammar behaviour

usage context

receptive knowledge

productive knowledge

The system must distinguish:

Recognition

"I understand this word."

from:

Production

"I can retrieve and use this word."

17. TEACH CHUNKS

Prioritise useful language chunks.

Examples:

depend on

be responsible for

It depends on...

I would argue that...

One of the main reasons is...

Do not teach only isolated vocabulary.

18. GRAMMAR TEACHING

Grammar must be taught through communication.

Never design the entire platform as:

Rule

→

Exercise

→

Next rule

Instead:

Experience

→

Notice

→

Understand

→

Practise

→

Produce

→

Receive feedback

→

Retry

→

Transfer

→

Review

19. FOUR-SKILL INTEGRATION

Reading, listening, speaking and writing must interact.

Example:

READ ARTICLE

↓

LISTEN TO DISCUSSION

↓

ANSWER COMPREHENSION

↓

DISCUSS TOPIC

↓

WRITE SUMMARY

↓

DEFEND AN OPINION

A single learning experience can train multiple capabilities.

20. SPEAKING ENGINE

Build an AI speaking environment.

It must support:

free conversation

role play

guided conversation

pronunciation practice

storytelling

discussion

debate

interview

presentation

negotiation

problem solving

exam simulation

The AI must react dynamically.

Do not create only scripted branching dialogues.

If the learner says something unexpected, the AI should respond appropriately.

21. SPEAKING FEEDBACK

After speaking, evaluate:

intelligibility

pronunciation

fluency

hesitation

grammar

vocabulary

lexical diversity

grammatical range

coherence

interaction

response latency

self-correction

register

naturalness

Feedback must be constructive.

Never overwhelm beginners with twenty corrections.

Prioritise the most important interventions.

22. WRITING ENGINE

Support:

sentence writing

paragraph writing

messages

emails

descriptions

narratives

opinion essays

reports

academic writing

professional writing

advanced argumentative writing

The writing engine must evaluate:

task fulfilment

grammar

vocabulary

spelling

cohesion

coherence

organisation

register

accuracy

complexity

naturalness

23. REVISION LOOP

When the learner makes an important writing mistake:

Do not only correct it.

Use:

IDENTIFY

↓

EXPLAIN

↓

SHOW CORRECTION

↓

ASK LEARNER TO TRY AGAIN

↓

TEST TRANSFER

↓

STORE ERROR

24. "SAY IT BETTER"

Implement a system that can transform learner production into multiple levels:

Learner version

Corrected version

Natural version

Advanced version

Professional/academic version where appropriate

Explain the meaningful differences.

Do not imply that the most advanced version is always better.

The goal is:

appropriate English

not unnecessarily complicated English.

25. LISTENING LAB

Create a progression:

CLEAR SPEECH

↓

NORMAL SPEED

↓

NATURAL SPEED

↓

CONNECTED SPEECH

↓

REDUCED SPEECH

↓

MULTIPLE SPEAKERS

↓

ACCENT VARIATION

↓

NOISE

↓

IMPLICIT MEANING

↓

NATIVE-LEVEL COMPREHENSION

Diagnose why the learner failed.

Possible causes:

vocabulary

grammar

speed

pronunciation reduction

connected speech

accent

inference

attention

memory

context

26. ENGLISH EAR SYSTEM

Teach learners to decode real speech.

Examples:

want to

going to

did you

have to

got to

could you

would you

The platform must distinguish:

What learners may hear

from:

What they should write in formal English.

Do not teach informal pronunciation as formal spelling.

27. READING ENGINE

Progress from:

WORD

↓

SENTENCE

↓

SHORT TEXT

↓

PARAGRAPH

↓

CONNECTED TEXT

↓

MULTI-PARAGRAPH TEXT

↓

ARGUMENT

↓

COMPLEX TEXT

↓

SPECIALIST TEXT

↓

NUANCED TEXT

Assess:

explicit meaning

detail

inference

tone

attitude

argument

structure

purpose

implication

nuance

28. COMMUNICATION FUNCTIONS

Build a capability framework covering:

Foundation

greeting

introducing

asking

answering

requesting

thanking

apologising

describing

identifying

Intermediate

explaining

comparing

narrating

giving opinions

agreeing

disagreeing

suggesting

recommending

clarifying

Upper-intermediate

negotiating

persuading

summarising

evaluating

speculating

handling disagreement

managing meetings

defending an argument

Advanced

hedging

qualifying claims

managing ambiguity

interpreting implication

rhetorical persuasion

adapting register

synthesising information

nuanced disagreement

29. MEDIATION

Include CEFR-style mediation activities.

Examples:

read something and explain it

listen and summarise

simplify complex information

relay instructions

synthesise multiple sources

explain information to another person

30. WORLDS

Create conceptual learning worlds:

WORLD 0

First English — Pre-A1

WORLD 1

Survival — A1

WORLD 2

Everyday Life — A2

WORLD 3

Independent English — B1

WORLD 4

Professional English — B2

WORLD 5

Advanced English — C1

WORLD 6

Mastery — C2

The actual curriculum remains adaptive.

31. MISSIONS

Replace repetitive lesson structures with meaningful missions.

Examples:

Pre-A1/A1

introduce yourself

order food

ask for directions

buy something

A2

return an item

make an appointment

describe a problem

arrange a meeting

B1

solve a travel problem

discuss plans

explain an experience

give advice

B2

lead a meeting

negotiate

give a presentation

defend a proposal

C1

analyse a complex issue

evaluate evidence

persuade an audience

synthesise information

C2

interpret nuanced arguments

debate complex issues

adapt rhetoric to an audience

communicate sophisticated ideas precisely

32. BOSS MISSIONS

Periodic integrated challenges.

A Boss Mission combines several skills.

Example:

B1 TRAVEL BOSS

The learner must:

listen to an announcement

ask for information

solve a problem

speak to hotel staff

write a message

explain the situation

Assessment happens across all tasks.

33. C2 ENDGAME

Do not define C2 simply as:

more grammar.

C2 should involve:

nuance

register

rhetoric

ambiguity

irony

implicit meaning

persuasion

sophisticated argument

stylistic flexibility

precise vocabulary

complex discourse

cultural/pragmatic competence

The ultimate simulation can be:

LIVE IN ENGLISH

A simulated day involving:

reading

listening

conversation

phone call

meeting

writing

analysis

explanation

debate

decision-making

34. PERSONALISATION

Personalise:

topics

examples

scenarios

difficulty

task type

review timing

skill weighting

explanations

professional context

interests

goals

Do NOT personalise educational requirements arbitrarily.

Personalisation must serve learning.

35. INTEREST ENGINE

The system should learn topics the learner cares about.

Examples:

technology

business

sport

travel

science

entertainment

history

finance

education

politics where appropriate and safely handled

professional topics

Use learner interests to improve engagement.

But progressively expose learners to unfamiliar topics at higher levels.

36. AI TEACHER

The central AI personality is:

THE WIZARD

It should feel like a world-class private English teacher.

Characteristics:

intelligent

encouraging

patient

challenging

precise

curious

supportive

never patronising

not excessively childish

occasionally playful

culturally aware

37. AI TEACHER MEMORY

The Wizard should remember:

goals

interests

recurring errors

vocabulary

pronunciation difficulties

previous conversations

previous performance

achievements

weaknesses

strengths

current curriculum position

recent learning

forgotten material

target date

Do not store unnecessary personal data.

Implement appropriate privacy controls.

38. AI TEACHER MODES

The same teacher can operate in different modes:

Teacher

Explains.

Conversation Partner

Talks naturally.

Speaking Coach

Analyses spoken production.

Writing Coach

Reviews writing.

Examiner

Assesses.

Learning Strategist

Determines what to practise next.

Career English Coach

Simulates professional situations.

Game Master

Runs missions and challenges.

All remain part of:

THE WIZARD

39. TEACHING ADAPTATION

The Wizard should know when to:

explain

simplify

give another example

challenge

slow down

speed up

correct

not correct

review

move on

Examples:

"You already know this."

"Let's make it easier."

"You understand it when reading, but you're struggling to produce it."

"You've demonstrated mastery. Let's move forward."

40. "I DON'T UNDERSTAND"

Implement a universal:

I DON'T UNDERSTAND

button.

The Wizard should diagnose whether the problem is:

vocabulary

grammar

pronunciation

cultural reference

task complexity

unclear explanation

reading difficulty

listening difficulty

Then respond accordingly.

41. "EXPLAIN DIFFERENTLY"

Provide options such as:

explain simply

explain deeply

give examples

compare with another concept

show British usage

show natural spoken usage

show written usage

give a visual explanation where appropriate

42. THINKING IN ENGLISH

Do not simply tell learners:

"Stop translating."

Train them progressively:

Native-language concept → English

↓

Image → English

↓

Situation → English

↓

English question → English answer

↓

Spontaneous English

Gradually reduce translation dependence.

43. ERROR INTELLIGENCE

Every meaningful recurring error becomes part of the learner's model.

Example:

ERROR:

"I am agree."

CATEGORY:

Verb/adjective confusion.

OCCURRENCES:

7

CONFIDENCE:

94%

STATUS:

Recurring.

INTERVENTION:

Contrast "agree" and "be in agreement".

NEXT PRACTICE:

Speaking retrieval.

REVIEW:

48 hours.

Do not punish mistakes.

Turn mistakes into personalised teaching opportunities.

44. MEMORY ENGINE

Use evidence-based principles such as:

retrieval practice

spaced practice

interleaving

varied contexts

productive recall

delayed review

Do not create a simple flashcard-only system.

A word/concept should eventually appear in:

reading

listening

speaking

writing

spontaneous use

45. MASTERY VS COMPLETION

Never equate:

Lesson completed

with:

Skill mastered.

A learner may complete an activity while mastery remains low.

Display:

Activity performance: 87%

Estimated mastery: 61%

if the evidence supports that distinction.

46. NEXT BEST ACTION ENGINE

After every meaningful learning event:

NEW EVIDENCE

↓

UPDATE LEARNER MODEL

↓

UPDATE MASTERY

↓

UPDATE ERROR PROFILE

↓

CHECK GOAL

↓

CHECK RETENTION

↓

CHECK DIFFICULTY

↓

SELECT NEXT BEST ACTIVITY

The learner's next activity should be selected based on evidence.

47. THE DAILY EXPERIENCE

The default experience should be simple.

Example:

TODAY'S MISSION

Book a hotel room in London.

Then:

Listen

Understand

Learn

Speak

Write

Review

The complexity should exist behind the interface.

The learner should not be confronted with a huge curriculum tree.

48. SESSION TYPES

Provide:

Quick Quest

5–10 minutes

Standard Journey

15–25 minutes

Deep Study

30–60 minutes

Boss Mission

20–45 minutes

These are starting targets, not rigid requirements.

49. GAMIFICATION

Gamification must reinforce meaningful learning.

Do not make XP the primary goal.

Good achievements:

First 10-minute conversation

First successful job interview

First 1,000 words used productively

First B1 Boss Mission

First successful presentation

Demonstrated C1 speaking capability

Bad design:

endless points for clicking multiple choice

meaningless streak pressure

rewards disconnected from learning

50. PROGRESS DASHBOARD

The learner should immediately understand:

Where am I?

Where am I going?

What is holding me back?

What should I do today?

Am I improving?

Display:

overall proficiency

skill profile

top strengths

top weaknesses

current goals

progress over time

recent achievements

next recommended action

51. ENGLISH CAPABILITY MODEL

Eventually provide a broader capability representation:

COMPREHENSION

↓

RESPONSE

↓

COMMUNICATION

↓

EXPLANATION

↓

ARGUMENT

↓

PERSUASION

↓

ADAPTATION

↓

SOPHISTICATED ENGLISH

52. CEFR / IELTS / CAMBRIDGE DISTINCTION

Maintain separate systems.

CEFR

Primary learning framework.

IELTS

External exam pathway.

Cambridge

External examination pathway.

Never claim:

English Wizard score = official IELTS score.

Use language such as:

estimated IELTS readiness

where statistically and pedagogically justified.

53. CURRICULUM DATA MODEL

Design curriculum as structured data, not hard-coded screens.

Each learning objective should have fields such as:

objective_id

title

cefr_level

internal_band

skill

subskill

description

prerequisites

grammar_targets

vocabulary_targets

collocations

pronunciation_targets

communication_functions

reading_requirements

listening_requirements

speaking_requirements

writing_requirements

mediation_requirements

common_errors

diagnostic_tasks

practice_tasks

production_tasks

mission

mastery_threshold

retention_requirement

review_schedule

content_sources

licensing_status

version

The exact schema may evolve.

54. CONTENT MODEL

Separate:

Curriculum

from:

Content

from:

Activities

from:

Assessment

from:

Learner performance

Do not put educational logic directly into frontend components.

55. AI-GENERATED CONTENT

AI can dynamically generate:

examples

conversations

questions

exercises

scenarios

explanations

role-play

personalised reading passages

But AI-generated material must be controlled.

Implement validators for:

target CEFR

grammar

vocabulary

answer validity

ambiguity

inappropriate content

factual claims

difficulty

learning objective alignment

56. CONTENT QUALITY SYSTEM

Every generated or imported activity should have:

learning_objective

target_level

target_skill

difficulty

expected_answer

acceptable_answers

common_errors

assessment_rubric

source

licensing_status

quality_status

version

57. ASSESSMENT RUBRICS

Build formal rubrics for:

Speaking

pronunciation

intelligibility

fluency

vocabulary

grammar

coherence

interaction

Writing

task fulfilment

organisation

coherence

cohesion

vocabulary

grammar

accuracy

register

Reading

comprehension

inference

detail

interpretation

Listening

comprehension

detail

inference

natural speech processing

The rubrics should be mapped to CEFR descriptors where appropriate.

58. ASSESSMENT CONFIDENCE

Every assessment estimate should internally include confidence.

Example:

Speaking: B1

Confidence:

High

Evidence:

8 tasks

Consistency:

Strong

Avoid false precision.

59. ACCESSIBILITY

Design for:

keyboard navigation

screen readers

captions

transcripts

adjustable text

colour accessibility

audio controls

reduced motion

mobile accessibility

Do not make visual gamification necessary for learning.

60. MOBILE-FIRST

The platform must work extremely well on:

Android

iOS

desktop

tablet

The architecture should allow a web application and future native/mobile clients to use the same backend.

61. GLOBAL PRODUCT

The platform must support:

international users

multiple first languages

multiple time zones

international date formats

localisation

multiple currencies

multiple payment systems

regional legal requirements

Do not hard-code Egypt, UK, USA or any single country into the core architecture.

62. ENGLISH VARIETY

The primary reference identity should be:

British English

because this project specifically uses British references.

However:

Do not teach British English as if American, Australian, Canadian or other standard varieties are "wrong."

Teach:

British usage

international comprehension

variation

register

context

Where relevant, explain differences.

63. SECURITY

Implement production-grade security.

At minimum consider:

authentication

authorisation

session management

secure password handling

OAuth where appropriate

API key protection

server-side secrets

rate limiting

input validation

output validation

prompt injection protection

data isolation

secure file handling

encryption

audit logging

abuse prevention

Never expose:

model API keys

payment secrets

database credentials

private service credentials

to the frontend.

64. AI SECURITY

Treat learner-generated text/audio as untrusted input.

Protect against:

prompt injection

malicious uploaded files

malicious URLs

model manipulation

tool abuse

data leakage

cross-user context leakage

The AI teacher must never reveal another learner's data.

65. PRIVACY

Design privacy into the architecture.

Learners should be able to understand:

what data is stored

why it is stored

how it is used

what is used for personalisation

what is used for assessment

Provide appropriate:

data deletion

account deletion

export

privacy controls

Do not retain unnecessary audio/video data indefinitely.

66. VOICE DATA

Speaking and listening features may involve sensitive user-generated data.

Design:

consent

retention controls

deletion

processing transparency

secure storage

provider data policies

Do not assume an AI API provider can use learner voice recordings however we want.

Verify provider terms.

67. AI MODEL ARCHITECTURE

Do not hard-code the entire system around one AI vendor.

Create an abstraction layer for:

LLM provider

and potentially:

Speech-to-text provider

Text-to-speech provider

Pronunciation analysis provider

Embedding provider

This allows providers to be changed later.

68. MODEL ROUTING

Different tasks may require different models.

For example:

Fast/simple model

classification

simple explanations

exercise generation

Strong reasoning model

complex writing feedback

advanced teaching

curriculum reasoning

Speech model

transcription

pronunciation

Embedding model

semantic search

content retrieval

Do not use the most expensive model for every request.

69. AI COST CONTROL

Build:

caching

model routing

token budgets

prompt compression

reusable content

asynchronous processing

batching where appropriate

usage monitoring

Every AI request should have a reason.

70. RAG / KNOWLEDGE SYSTEM

If external reference material is legally available for use, use a controlled knowledge layer.

Possible architecture:

CURRICULUM KNOWLEDGE

+

LICENSED CONTENT

+

ORIGINAL CONTENT

+

REFERENCE MATERIAL

↓

KNOWLEDGE INDEX

↓

RETRIEVAL

↓

AI TEACHER

Never allow arbitrary internet retrieval to become the unverified source of truth for assessment.

71. DATABASE

Use a proper relational database for core entities.

Potential core entities:

users

profiles

goals

assessments

assessment_attempts

skills

cefr_levels

bands

learning_objectives

curriculum_nodes

grammar_items

vocabulary_items

collocations

activities

missions

boss_missions

content

content_sources

licensing

learner_mastery

learner_errors

learner_vocab

learning_sessions

attempts

speaking_attempts

writing_attempts

listening_attempts

reading_attempts

reviews

recommendations

achievements

subscriptions

usage

audit_logs

Do not assume these exact table names.

Design the schema properly after requirements analysis.

72. EVENT-BASED LEARNING DATA

Every meaningful learner interaction should potentially generate an event.

Examples:

lesson_started

exercise_answered

exercise_failed

exercise_mastered

word_recalled

word_forgotten

speaking_started

speaking_completed

writing_submitted

writing_revised

listening_attempted

mission_completed

assessment_completed

goal_changed

These events feed the learner model.

73. ANALYTICS

Measure learning, not vanity metrics.

Important metrics:

Learning

mastery improvement

retention

error reduction

speaking fluency

writing accuracy

listening comprehension

reading comprehension

Engagement

sessions

session frequency

completion

return rate

Product

activation

retention

subscription conversion

churn

cost per learner

Do not optimise engagement at the expense of learning.

74. A/B TESTING

Build experimentation capability eventually.

Potential experiments:

explanation style

activity type

session length

motivation mechanics

interface

mission format

But educational experiments must not intentionally degrade learning.

75. UX PRINCIPLE

The interface should feel:

Simple for the learner.

while:

Extremely sophisticated underneath.

The learner should mostly see:

Where am I?

What should I do?

Why am I doing it?

How am I improving?

76. CORE HOME SCREEN

Possible structure:

Good morning.

Your goal:

B2 Professional English

Current:

B1+

Today's focus:

Speaking fluency

Why?

You understand B2-level material but hesitate during spontaneous speaking.

TODAY'S MISSION

[Start Mission]

Progress

[View English DNA]

Ask Wizard

[Talk to your teacher]

77. AI CHAT

Do not make a generic ChatGPT clone.

The chat must understand:

learner level

curriculum

current goals

previous mistakes

mastery

current lesson

learning history

The learner can still ask anything about English.

But the AI always knows that it is:

their English teacher.

78. TEACHER MEMORY EXAMPLE

If a learner repeatedly struggles with articles:

The AI should eventually say:

"I noticed you've been leaving out 'the' in situations where English normally requires it. Let's work on that today."

Not:

"Here's a random article lesson."

79. RECOMMENDATION EXPLANABILITY

When practical, Wizard should be able to explain:

"I chose this activity because..."

Example:

"You have demonstrated strong understanding of conditionals in reading, but you still hesitate when producing them in conversation."

This builds trust.

80. NO SHAME DESIGN

Never tell learners:

"You're bad at English."

Instead:

"This is currently your weakest area."

The product must make mistakes psychologically safe.

81. BEGINNER DESIGN

Pre-A1 and A1 users may have almost no English.

Do not assume:

they can read instructions

they understand English explanations

they know grammar terminology

Support explanations through the learner's known language when necessary.

Gradually increase English immersion.

82. ADVANCED DESIGN

At C1/C2:

Do not infantilise the learner.

Use intellectually interesting material.

The learner should feel like an intelligent adult becoming more capable in English.

83. PROFESSIONAL ENGLISH

Create domain pathways eventually:

Business

Technology

Education

Healthcare

Finance

Engineering

Hospitality

Customer service

Management

Sales

Academic English

These should sit on top of the core English capability system.

84. IELTS PATHWAY

Create a dedicated pathway later.

It should include:

IELTS-specific tasks

timing

writing tasks

speaking simulations

listening

reading

band-oriented feedback

But maintain the distinction:

English mastery

versus:

Exam strategy.

A learner should be able to improve English even without preparing for IELTS.

85. CAMBRIDGE PATHWAY

Similarly support relevant Cambridge pathways where appropriate.

Do not imply official certification.

86. CONTENT GENERATION PIPELINE

Build:

LEARNING OBJECTIVE

↓

ACTIVITY SPECIFICATION

↓

AI GENERATION

↓

AUTOMATED VALIDATION

↓

DIFFICULTY VALIDATION

↓

ANSWER VALIDATION

↓

CEFR ALIGNMENT CHECK

↓

SAFETY CHECK

↓

QUALITY STATUS

↓

DEPLOY

87. HUMAN REVIEW

Create tooling that allows an expert curriculum reviewer to inspect:

activities

explanations

answers

CEFR mapping

difficulty

assessment validity

Human review should be possible even when content is AI-generated.

88. ADMIN / CURRICULUM STUDIO

Build an internal admin environment eventually.

Administrators should be able to:

create curriculum nodes

edit objectives

manage vocabulary

review activities

review AI-generated content

approve/reject content

inspect learner errors

inspect assessment performance

manage content versions

manage sources/licensing

manage experiments

89. VERSIONING

Curriculum must be versioned.

Never silently change the meaning of a learning objective after thousands of learners have used it.

Maintain:

curriculum version

content version

assessment version

AI prompt version

model version

90. OBSERVABILITY

Implement production observability.

Track:

API latency

errors

AI failures

token usage

model costs

speech processing failures

database performance

queue failures

user-facing errors

Do not log sensitive learner content unnecessarily.

91. RELIABILITY

Design for:

retries

timeouts

fallbacks

graceful degradation

asynchronous jobs

queue processing

provider outages

Example:

If speech analysis temporarily fails:

Do not crash the entire lesson.

Offer:

"Speech analysis is temporarily unavailable. Your conversation has been saved."

92. OFFLINE / LOW-CONNECTIVITY

Consider mobile users with poor connections.

Eventually support:

cached lessons

downloadable audio where legally possible

offline vocabulary review

sync when connection returns

Do not make this a first MVP requirement unless architecture permits it economically.

93. PAYMENTS

Build subscription architecture separately from learning architecture.

Support eventually:

free tier

premium

potentially advanced tiers

family/student plans

institutional plans

Do not hard-code one payment provider.

94. FREE VS PREMIUM

Do not cripple the free product so severely that learners cannot experience actual educational value.

The free tier should demonstrate the magic.

Premium can unlock:

deeper AI teaching

extended speaking

advanced missions

advanced assessment

advanced pathways

higher usage

professional domains

advanced analytics

Exact pricing should be researched later.

95. GLOBAL SCALE

Design for eventual:

millions of users

international traffic

scalable storage

scalable AI inference

asynchronous processing

CDN

observability

rate limiting

cost controls

Do not prematurely build unnecessary microservices.

Start modular.

Separate services only when justified.

96. RECOMMENDED DEVELOPMENT STRATEGY

Do NOT attempt to build every feature immediately.

Build in phases.

PHASE 0 — PRODUCT RESEARCH

Deliver:

competitive landscape

educational reference map

CEFR mapping

legal/content-source analysis

technical feasibility analysis

AI provider analysis

cost model

risk register

PHASE 1 — MASTER CURRICULUM

Create:

Pre-A1 → C2 capability map

For every level:

capabilities

skills

grammar

vocabulary

pronunciation

communication functions

mediation

common errors

assessments

missions

mastery criteria

This is the intellectual foundation.

PHASE 2 — LEARNER MODEL

Build:

profile

goals

English DNA

mastery graph

error engine

memory model

progress model

PHASE 3 — DIAGNOSTIC MVP

Build:

onboarding

reading diagnostic

listening diagnostic

writing diagnostic

speaking diagnostic

results

English DNA

PHASE 4 — AI TEACHER MVP

Build:

personalised teacher

explanations

adaptive recommendations

learner memory

error tracking

PHASE 5 — CORE LEARNING LOOP

Build:

Teach

→ Practise

→ Produce

→ Feedback

→ Retry

→ Review

PHASE 6 — SPEAKING

Build:

voice interaction

transcription

speaking assessment

pronunciation feedback

conversation scenarios

PHASE 7 — WRITING

Build:

writing editor

assessment

feedback

revision

personalised error tracking

PHASE 8 — LISTENING

Build:

listening lab

transcripts

natural-speed audio

connected speech

adaptive listening

PHASE 9 — MISSIONS

Build:

worlds

missions

boss missions

integrated four-skill challenges

PHASE 10 — MEMORY

Build:

spaced retrieval

adaptive review

retention modelling

forgotten-content detection

PHASE 11 — ADVANCED PATHWAYS

Build:

IELTS

Cambridge

Business

Academic

Professional domains

PHASE 12 — GLOBAL PRODUCT

Build:

payments

localisation

mobile apps

institutional plans

analytics

scalability

97. MVP DEFINITION

The MVP should NOT attempt to contain the entire Pre-A1 → C2 universe.

The MVP should demonstrate the core magic.

Minimum viable experience:

USER

↓

ONBOARDING

↓

DIAGNOSTIC

↓

ENGLISH DNA

↓

PERSONALISED GOAL

↓

AI TEACHER

↓

PERSONALISED LESSON

↓

SPEAK

↓

WRITE

↓

FEEDBACK

↓

ERROR MEMORY

↓

NEXT RECOMMENDATION

If this loop works beautifully, expand it.

98. MVP SUCCESS CRITERION

The MVP is successful if a learner says:

"It actually understands what I need to improve."

and:

"It remembers my mistakes."

and:

"The next lesson makes sense."

and:

"I can see myself getting better."

That is more important than having hundreds of screens.

99. DO NOT BUILD THESE THINGS TOO EARLY

Avoid spending early development time on:

complex social networks

leaderboards

unnecessary avatars

excessive animations

huge admin systems

complicated marketplaces

dozens of subscription tiers

excessive gamification

meaningless achievements

First make:

THE LEARNING ENGINE

exceptional.

100. TECHNICAL DEVELOPMENT RULE

Before writing large amounts of code:

Produce:

architecture diagram

repository structure

technology decisions

database model

API design

AI provider abstraction

curriculum data model

learner model

assessment model

security model

testing strategy

Then implement incrementally.

101. CODE QUALITY

Use:

clean architecture

modular design

typed interfaces where applicable

clear naming

environment configuration

secrets management

tests

validation

logging

error handling

documentation

Do not create a giant monolithic file containing the entire platform.

102. FRONTEND QUALITY

The frontend must be:

responsive

fast

accessible

intuitive

mobile-friendly

visually distinctive

professional

calm

magical without being childish

The Wizard identity should feel premium.

103. DESIGN LANGUAGE

Visual concept:

MAGIC + EDUCATION + INTELLIGENCE

Avoid:

childish cartoon overload

cheap gamification

generic SaaS dashboard aesthetics

generic ChatGPT clone appearance

Aim for:

premium

modern

warm

intelligent

inviting

memorable

104. BRAND EXPERIENCE

The user should feel:

"I'm entering a world where English becomes understandable."

Potential terminology:

Wizard

Journey

Mission

Quest

World

Boss Mission

Spell / Power only if used tastefully

English DNA

Mastery

Next Step

Discovery

Do not overuse fantasy terminology.

The product is still serious education.

105. THE LEARNING EXPERIENCE PRINCIPLE

Every activity should have a reason.

If an activity exists, the system should know:

What capability is this training?

Why does this learner need it?

Why now?

What evidence triggered it?

How will success be measured?

What happens if the learner fails?

What happens if they master it?

If those questions cannot be answered:

Do not ship the activity.

106. THE "WHY AM I LEARNING THIS?" TEST

Every curriculum item should have an answer.

Example:

You are practising articles because your writing assessment shows a recurring omission pattern, especially before singular countable nouns.

This is much better than:

Lesson 38: Articles.

107. THE "CAN I USE IT?" TEST

Before marking something mastered:

Ask:

Can the learner use it spontaneously?

If not:

The system may consider it:

understood

but not:

mastered.

108. THE "TRANSFER" TEST

A learner should eventually use knowledge in an unfamiliar context.

If they learned:

"I have never been to London."

Do not only test:

"I have never ___ to London."

Later test:

Tell me about something you have never done.

This checks transfer.

109. THE "RETENTION" TEST

A learner should encounter important material later without warning.

If they still use it correctly:

increase mastery confidence.

If not:

reactivate it.

110. THE "REAL WORLD" TEST

Every level should eventually ask:

What would this learner actually need to do in real life?

Then create learning around that.

111. THE CORE PRODUCT LOOP

This is the most important system in the entire project:

LEARNER

↓

GOAL

↓

DIAGNOSTIC

↓

ENGLISH DNA

↓

MASTERY GRAPH

↓

GAP ANALYSIS

↓

NEXT BEST ACTION

↓

TEACH

↓

PRACTISE

↓

PRODUCE

↓

ASSESS

↓

ERROR ANALYSIS

↓

UPDATE MEMORY

↓

UPDATE MASTERY

↓

UPDATE LEARNER

↓

NEXT BEST ACTION

↺

112. THE MAGIC

The "magic" of English Wizard is NOT:

"We use AI."

Everyone can use AI.

The magic is:

The system continuously builds a mathematical and educational model of the learner and uses that model to determine what that learner needs next.

The longer the learner uses Wizard:

the better Wizard understands the learner.

113. COMPETITIVE DIFFERENTIATION

English Wizard should combine capabilities commonly distributed across different products:

British English resources

+

CEFR curriculum

+

Cambridge-style assessment

+

Oxford-style lexical depth

+

IELTS pathway

+

AI conversation

+

AI writing feedback

+

AI speaking feedback

+

Adaptive assessment

+

Mastery learning

+

Spaced retrieval

+

Error intelligence

+

Personalisation

+

Real-world simulation

The competitive advantage is not copying these products.

It is:

orchestrating their strongest educational principles into one learner model.

114. BUILDING RULE

When implementing a feature, ask:

Does it improve learning?

Does it improve personalisation?

Does it improve assessment?

Does it improve retention?

Does it improve user experience?

Does it create long-term technical debt?

Does it create legal risk?

Does it create AI reliability risk?

Can it scale?

If a feature fails these tests, reconsider it.

115. NO FAKE INTELLIGENCE

Never create fake progress.

Do not show:

"Your fluency increased 12%"

unless there is a defensible metric behind it.

Do not invent precision.

Do not claim:

"Your English is C1"

based on a few questions.

Use:

estimated

evidence suggests

confidence

when appropriate.

116. NO FAKE CERTIFICATION

English Wizard is not an official CEFR, IELTS or Cambridge certification provider unless appropriate accreditation/partnership is obtained.

Clearly distinguish:

Learning estimate

from:

Official examination result.

117. AI TEACHER SAFETY

The AI teacher must:

avoid giving dangerous professional advice as fact

avoid pretending to be an official examiner

avoid fabricating sources

distinguish teaching examples from factual claims

avoid exposing internal prompts

avoid revealing private learner information

resist prompt injection

not manipulate learners emotionally

not create dependency

The teacher should encourage real-world communication and independent learning.

118. DEVELOPMENT WORKFLOW

At the start of every major phase:

STEP 1

Analyse requirements.

STEP 2

Identify unknowns.

STEP 3

Research current standards.

STEP 4

Propose architecture.

STEP 5

Document decisions.

STEP 6

Implement.

STEP 7

Test.

STEP 8

Evaluate against educational objectives.

STEP 9

Fix defects.

STEP 10

Only then proceed.

119. REQUIRED DOCUMENTATION

Maintain these project documents:

/docs

PRODUCT_CONSTITUTION.md

CURRICULUM_SPECIFICATION.md

CEFR_MAPPING.md

LEARNER_MODEL.md

MASTERY_MODEL.md

ASSESSMENT_SPECIFICATION.md

AI_TEACHER_SPECIFICATION.md

CONTENT_ARCHITECTURE.md

TECHNICAL_ARCHITECTURE.md

DATABASE_SCHEMA.md

API_SPECIFICATION.md

SECURITY_MODEL.md

PRIVACY_MODEL.md

AI_PROVIDER_STRATEGY.md

COST_MODEL.md

TESTING_STRATEGY.md

DESIGN_SYSTEM.md

ROADMAP.md

DECISION_LOG.md

Use equivalent filenames if the chosen framework requires another structure.

120. DECISION LOG

Every major architectural decision must be documented:

Decision

Date

Reason

Alternatives considered

Chosen approach

Trade-offs

Reversibility

This prevents the project from becoming incoherent.

121. TESTING

Testing must include:

Unit tests

Core logic.

Integration tests

Services.

End-to-end tests

Complete learner journeys.

AI evaluation

Prompt/model outputs.

Curriculum validation

CEFR alignment and objective alignment.

Assessment reliability

Scoring consistency.

Security testing

Authentication, authorisation, prompt injection, data isolation.

Performance testing

High user volume.

122. AI EVALUATION

Do not assume the AI teacher is correct because the output sounds intelligent.

Create evaluation datasets.

Test:

explanations

corrections

CEFR difficulty

activity quality

scoring consistency

hallucination

inappropriate feedback

learner-level appropriateness

pedagogical usefulness

Track model changes.

123. HUMAN OVERSIGHT

For high-stakes assessment:

AI scores should be treated carefully.

If the platform eventually provides high-stakes certification or legally significant assessment, additional validation and human oversight may be required.

Do not launch high-stakes claims prematurely.

124. FIRST IMPLEMENTATION TASK

Do NOT immediately build the complete application.

First produce:

ENGLISH WIZARD ARCHITECTURE PACKAGE

Containing:

Product architecture

System architecture

Database architecture

AI architecture

Curriculum architecture

Learner model

Assessment model

Mastery model

Content model

Security architecture

UX architecture

MVP roadmap

Cost assumptions

Risks

Unknowns

Decisions requiring validation

Then begin implementation.

125. SECOND IMPLEMENTATION TASK

Build:

MASTER CURRICULUM RESEARCH ENGINE

Before generating the full curriculum:

Research the CEFR descriptors and relevant established educational frameworks.

Create a structured mapping:

CEFR LEVEL

↓

CAPABILITY

↓

SUB-CAPABILITY

↓

SKILL

↓

LANGUAGE RESOURCE

↓

ASSESSMENT

↓

MASTERY CRITERIA

Do not invent the curriculum solely from LLM intuition.

Use authoritative sources and linguistic research.

126. THIRD IMPLEMENTATION TASK

Build:

ENGLISH DNA DIAGNOSTIC MVP

The first usable product should be:

Landing

↓

Create account

↓

Goals

↓

Diagnostic

↓

Reading

↓

Listening

↓

Writing

↓

Speaking

↓

Results

↓

English DNA

↓

Personalised plan

127. FOURTH IMPLEMENTATION TASK

Build:

FIRST MAGIC LEARNING SESSION

After assessment, the learner should receive a genuinely personalised session.

Example:

Your reading is stronger than your speaking.

Your biggest current bottleneck is spontaneous speaking.

Today we're going to practise describing past experiences.

I've chosen this because your assessment showed repeated difficulty using past tense forms spontaneously.

Then:

Teach

↓

Listen

↓

Practise

↓

Speak

↓

Feedback

↓

Retry

↓

Mission

↓

Assessment

↓

Memory update

This is the first moment where the product should feel magical.

128. DO NOT BUILD A GENERIC CHATBOT

The AI must be curriculum-aware.

The chatbot should know:

current learner level

target level

current objective

mastery state

errors

vocabulary

previous activity

goal

assessment evidence

A generic chat window with an LLM is NOT English Wizard.

129. DO NOT BUILD A STATIC COURSE

Avoid:

Lesson 1

Lesson 2

Lesson 3

Lesson 4

as the primary engine.

The learner path must be adaptive.

Two learners at B1 can receive completely different next activities.

130. DO NOT BUILD AN EXERCISE FACTORY

Hundreds of AI-generated exercises do not equal education.

Every exercise must be connected to:

A learning objective.

131. DO NOT OVERLOAD THE USER

The backend may have:

thousands of learning objectives

thousands of vocabulary relationships

millions of performance events

many assessment variables

The learner should see:

One clear next step.

132. FINAL PRODUCT STANDARD

Before calling any major feature complete, ask:

Would a world-class English teacher consider this genuinely useful?

If not:

Improve it.

133. FINAL NORTH STAR

English Wizard should eventually be capable of taking a complete beginner and guiding them toward sophisticated English without requiring the learner to know:

CEFR

grammar terminology

vocabulary lists

study plans

assessment theory

learning science

what to study next

The learner simply needs to show up.

The Wizard handles the complexity.

134. FINAL EXPERIENCE

A new learner says:

"I want to learn English."

Wizard says:

"Tell me about yourself."

The system discovers:

who they are.

Then:

"Let's see what you can already do."

The system discovers:

where they are.

Then:

"Where do you want to go?"

The system discovers:

their destination.

Then:

"I've created your path."

The system creates:

their personalised journey.

Every day:

"Here's what you need today."

The system teaches:

their next capability.

When they make mistakes:

"I noticed something."

The system remembers:

their error patterns.

When they improve:

"You're ready for the next challenge."

The system adapts:

their curriculum.

Eventually:

"You can do this now."

The learner has transformed.

135. THE ENGLISH WIZARD PRINCIPLE

DON'T TEACH EVERYONE THE SAME ENGLISH.

DISCOVER THE ENGLISH EACH PERSON NEEDS.

THEN BUILD THE PATH THAT GETS THEM THERE.

136. START NOW

Begin with the following sequence:

STEP 1

Analyse this specification.

STEP 2

Identify genuine unknowns and risks.

STEP 3

Research authoritative current sources.

STEP 4

Create the Architecture Package.

STEP 5

Create the Master Curriculum architecture.

STEP 6

Create the Learner Model.

STEP 7

Create the Mastery Graph architecture.

STEP 8

Create the Diagnostic architecture.

STEP 9

Create the AI Teacher architecture.

STEP 10

Create the MVP technical implementation.

STEP 11

Test the complete learner journey.

STEP 12

Do not proceed blindly into the next phase.

At the end of each major phase, report:

PHASE

STATUS

COMPLETED

- ...

IN PROGRESS

- ...

NOT COMPLETED

- ...

DECISIONS MADE

- ...

ASSUMPTIONS

- ...

RISKS

- ...

UNKNOWN REQUIREMENTS

- ...

TEST RESULTS

- ...

NEXT PHASE

- ...

Never claim something is implemented if it is only planned.

Never claim something works if it has not been tested.

Never fabricate integrations.

Never fabricate educational validity.

Never silently replace a requirement with a simpler implementation.

Build English Wizard as a serious, scalable, evidence-informed global English education platform.

END OF MASTER BUILD PROMPT

:::

One important recommendation before you paste it

Do not start generating hundreds of files immediately. your first job should be to produce the architecture/research package and repository plan.

Then we work through the generated project phase-by-phase.


# FINAL REVISION — MASTER EXECUTION CONTRACT
## English Wizard — Build, Test, Verify, Continue, and Finish Directive

**Status:** FINAL / AUTHORITATIVE  
**Supersedes:** all previous versions, interpretations, shortcuts, temporary implementation plans, and phase-by-phase instructions that conflict with this section.  
**Purpose:** This document is the single master execution contract for the entire English Wizard project.

### 137. MASTER-CONTRACT AUTHORITY

This document is the controlling specification for the project.

The builder must treat the requirements in this document as binding unless a genuinely impossible, unsafe, unlawful, or technically incompatible requirement is identified.

Do not silently downgrade a requirement because it is difficult.

Do not replace a required system with a mock, placeholder, static demo, hard-coded result, fake API response, simulated progress state, or superficial UI.

If a requirement must be changed, the change must be explicitly recorded as a decision with:
- the original requirement
- the reason it cannot be implemented as written
- the proposed replacement
- the impact
- whether the decision is reversible

A "simpler implementation" is NOT automatically an acceptable implementation.

### 138. EXECUTION MODE — DO NOT STOP AFTER EACH STAGE

The project is to be executed continuously from the current state through all defined phases.

The builder must NOT:
- stop after producing an architecture package;
- stop after creating the first screen;
- stop after implementing Lesson 1;
- stop after a successful build;
- stop after saying "ready";
- ask the user to manually test every feature one by one;
- wait for the user to discover obvious integration failures;
- declare a phase complete merely because files were generated;
- declare a feature complete merely because the UI exists.

Instead:

**PLAN → BUILD → TEST → VERIFY → FIX → RETEST → CONTINUE**

Repeat this loop automatically throughout the project.

A phase is complete only when its implementation and its acceptance criteria have been verified.

### 139. NO MANUAL TESTING BURDEN ON THE USER

The builder is responsible for performing the broadest practical automated and end-to-end testing before asking the user to test anything.

The user should be presented with a working product, not a debugging assignment.

Do not say:
> "Please click this and tell me what happens."

when the builder can test the flow itself.

Use automated tests, integration tests, browser tests, API tests, database checks, state-transition checks, and end-to-end simulations wherever technically possible.

User testing may still be valuable for subjective product feedback, but it must NOT substitute for engineering verification.

### 140. COMPLETE END-TO-END TESTING IS MANDATORY

Before declaring the MVP or any major release complete, run the complete learner journey from beginning to end.

At minimum verify:

Landing
→ account creation/authentication
→ onboarding
→ goal selection
→ diagnostic
→ reading assessment
→ listening assessment
→ writing assessment
→ speaking assessment
→ assessment processing
→ English DNA generation
→ personalised goal/path
→ personalised lesson generation/loading
→ lesson start
→ teaching
→ practice
→ production
→ speaking interaction where applicable
→ writing interaction where applicable
→ feedback
→ correction/retry
→ error recording
→ mastery update
→ learner-model update
→ recommendation update
→ lesson/session completion
→ next-best-action calculation
→ next lesson/session
→ persistence after refresh
→ persistence after logout/login
→ correct resumption of learner state.

The test must verify not merely that pages load, but that the **data and state actually flow through the entire system**.

### 141. THE "LESSON 1 LOOP" FAILURE MUST NEVER BE ACCEPTED

A particularly critical acceptance condition is progression.

The product must NOT become trapped in:
- Lesson 1 forever;
- the same lesson after refresh;
- the same lesson after logout/login;
- a circular "complete → ready → start → Lesson 1" flow;
- a generated lesson that never records completion;
- a completion event that never updates the curriculum state;
- a recommendation engine that always returns the same activity;
- a UI that says progress exists while the backend state remains unchanged.

After completing a lesson, the system must demonstrably:

1. record the completion;
2. record performance/evidence;
3. update relevant mastery;
4. update relevant error records;
5. update learner state;
6. calculate the next appropriate action;
7. persist the new state;
8. return a different or appropriately scheduled next activity;
9. restore that state after refresh/re-login.

If the next activity legitimately repeats the same objective for pedagogical reasons, the system must have evidence for that decision and must not simply reset to Lesson 1.

### 142. REAL STATE, NOT UI THEATRE

Any visible progress must be backed by real persisted state.

Do NOT hard-code:
- completed lessons;
- XP;
- mastery;
- CEFR levels;
- English DNA;
- streaks;
- recommendations;
- "next lesson";
- assessment results;
- learner history.

Do NOT display a successful completion message unless the underlying operation actually succeeded.

If a backend operation fails, the UI must not falsely report success.

Every important learner-state transition should be traceable to a persisted record or event.

### 143. ACCEPTANCE TESTS MUST TEST STATE TRANSITIONS

For every core workflow, test at least:

**Happy path**
- valid input
- successful processing
- expected result
- persistence

**Failure path**
- provider/API failure
- timeout
- malformed response
- validation failure
- database failure
- network interruption

**Recovery path**
- retry
- resume
- refresh
- re-login
- duplicate submission
- interrupted lesson

**Boundary path**
- beginner
- advanced learner
- empty/near-empty data
- unusually long input
- slow response
- unavailable AI provider

**Security path**
- unauthorised access
- cross-user data access
- prompt injection
- malicious input
- secret exposure

### 144. BROWSER / REAL-APPLICATION VERIFICATION

Where the application has a user interface, verify it in an actual browser environment.

Do not rely only on:
- static code inspection;
- unit tests;
- build success;
- screenshots;
- mocked API calls.

Verify that the deployed/running application actually:
- loads;
- authenticates;
- navigates;
- calls the correct APIs;
- receives valid responses;
- renders returned data;
- saves state;
- transitions between screens;
- survives refresh;
- reaches the next stage.

Check the browser console for errors and inspect failed network/API requests.

### 145. API / DATABASE / FRONTEND CONSISTENCY

For every critical feature, verify the complete chain:

**Frontend action**
→ **API request**
→ **server logic**
→ **database/provider operation**
→ **response**
→ **frontend state update**
→ **persistent state**
→ **subsequent recommendation/navigation**

A working frontend with a broken backend is NOT complete.

A working API with a broken frontend is NOT complete.

A database record that is never consumed by the recommendation engine is NOT complete.

### 146. AI OUTPUTS MUST BE TESTED AS SYSTEM COMPONENTS

AI output must never be assumed correct because it sounds intelligent.

Test:
- schema validity;
- required fields;
- target-level compliance;
- learning-objective alignment;
- answer correctness;
- ambiguity;
- hallucination;
- inappropriate content;
- consistency;
- learner-level appropriateness;
- deterministic handling where required;
- fallback behaviour;
- malformed model output;
- provider failure.

Every AI-dependent workflow must have a non-catastrophic failure path.

### 147. NO FAKE "READY"

The builder must never use words such as:
- READY
- COMPLETE
- DONE
- WORKING
- PRODUCTION-READY

unless the corresponding acceptance criteria have actually been verified.

"Build passed" does not mean "feature works."

"Page loads" does not mean "workflow works."

"API returns 200" does not mean "product works."

"Lesson generated" does not mean "learning loop works."

### 148. CONTINUOUS EXECUTION AFTER A SUCCESSFUL TEST

A successful test is a gate, not a stopping point.

After a phase passes:

**PASS → record result → continue to next phase automatically.**

Do not stop simply because the current phase works.

Only stop execution when:
1. the entire requested scope is complete; or
2. an unavoidable blocker requires a decision that cannot safely be made using a reversible industry-standard default.

Minor defects must be fixed autonomously.

Known non-blocking issues must be logged and the project must continue.

### 149. BLOCKER POLICY

A blocker is a genuine obstacle that prevents safe or correct continuation.

Examples:
- missing required credential that cannot be provisioned;
- unavailable external service with no safe fallback;
- contradictory requirements that materially change architecture;
- legal/licensing decision requiring the owner;
- destructive irreversible action requiring explicit approval.

The following are NOT blockers:
- normal coding errors;
- failed tests;
- broken routes;
- schema mismatches;
- UI bugs;
- state persistence bugs;
- API integration bugs;
- validation failures;
- deployment configuration mistakes;
- missing test coverage.

Those are engineering work and must be fixed.

### 150. REGRESSION REQUIREMENT

Every fix must trigger appropriate regression testing.

A fix is not complete merely because the original bug disappears.

Verify that the fix does not break:
- authentication;
- onboarding;
- diagnostics;
- curriculum selection;
- learner state;
- lessons;
- assessments;
- recommendations;
- persistence;
- other completed workflows.

Maintain a regression suite for critical user journeys.

### 151. RELEASE GATE

A release may be called complete only when all applicable gates pass:

- requirements coverage
- architecture consistency
- build
- lint/type checks where applicable
- unit tests
- integration tests
- database tests
- API tests
- AI evaluation
- curriculum validation
- security tests
- accessibility checks
- responsive/browser checks
- end-to-end learner journey
- state persistence
- refresh/re-login recovery
- error handling
- regression suite
- deployment verification
- observability verification

Any failed critical gate means the release is not complete.

### 152. SOURCE OF TRUTH AND CHANGE CONTROL

The project must maintain one authoritative requirements source.

Do not allow:
- an old prompt;
- an old README;
- an obsolete design document;
- a stale generated file;
- an earlier architecture diagram

to silently override this contract.

When requirements evolve, update the master contract and record the change.

### 153. REQUIRED PROJECT STATUS

Maintain a machine-readable and human-readable implementation status.

For every major requirement track:

- Requirement ID
- Requirement
- Implementation status
- Source/design reference
- Code location
- Test location
- Test status
- Evidence
- Known limitations
- Last verified date
- Version

Allowed statuses:

**NOT_STARTED**
**DESIGNED**
**IMPLEMENTED**
**TESTING**
**VERIFIED**
**BLOCKED**
**DEPRECATED**

"IMPLEMENTED" is not equivalent to "VERIFIED."

### 154. EVIDENCE OF COMPLETION

Every major completed feature must have evidence.

Acceptable evidence may include:
- automated test result;
- end-to-end test result;
- browser verification;
- API verification;
- database verification;
- screenshot/video evidence where appropriate;
- logs/traces;
- reproducible test command.

Do not provide invented evidence.

### 155. FINAL PROJECT AUDIT

Before declaring the project finished, perform one final audit against the entire master contract.

The audit must identify:

- requirements implemented;
- requirements verified;
- requirements intentionally deferred;
- known defects;
- known limitations;
- unresolved blockers;
- security concerns;
- educational concerns;
- cost concerns;
- technical debt;
- deployment status;
- end-to-end test status.

Then run the critical end-to-end learner journey again after the final fixes.

### 156. FINAL HANDOFF STANDARD

The final handoff must clearly distinguish:

**BUILT**
what actually exists.

**VERIFIED**
what was actually tested and passed.

**DEFERRED**
what is intentionally scheduled for a later phase.

**BLOCKED**
what cannot proceed without an external decision/resource.

**KNOWN ISSUES**
what remains and its impact.

Never present planned functionality as implemented functionality.

### 157. EXECUTION PRINCIPLE — THE USER SHOULD NOT HAVE TO BABYSIT THE BUILD

The purpose of this contract is to prevent the project from becoming a sequence of:

"build something → ask user to test → discover obvious bug → patch → ask user again."

Instead, the builder must behave like a senior engineering team:

**understand → architect → implement → test broadly → inspect failures → fix → retest → integrate → regression-test → continue.**

The user should primarily provide product direction and final subjective feedback, not perform repetitive engineering QA.

### 158. FINAL COMMAND

Start from the current repository/project state.

Read this entire master contract.

Inspect the existing implementation rather than assuming it is correct.

Identify gaps between the specification and the actual product.

Fix those gaps.

Run the complete test suite.

Run the complete end-to-end learner journey.

Verify persistence and progression.

Fix every failure that can be fixed autonomously.

Run regression tests.

Continue through all remaining phases without waiting for manual approval after each phase.

Do not stop at Lesson 1.

Do not stop at the first successful build.

Do not stop at "ready."

Do not ask the user to perform tests that can reasonably be automated or executed by the builder.

Continue until the requested project scope is genuinely implemented and verified.

At the end, provide one concise final status report containing:

- FINAL STATUS
- WHAT WAS BUILT
- WHAT WAS VERIFIED
- END-TO-END RESULT
- TEST RESULTS
- KNOWN ISSUES
- DEFERRED ITEMS
- BLOCKERS, IF ANY
- DEPLOYMENT STATUS
- NEXT ACTIONS ONLY IF SOMETHING REMAINS

**This document is the single master execution contract for English Wizard.**
