# Issue #4 - Trust-First Conversion Research Brief

**Status:** RESEARCH BRIEF FOR PRODUCT OWNER / VISION ARCHITECT REVIEW  
**Date:** 2026-09-24  
**Owner:** Research Director  
**Repository issue:** [#4 - Build trust-first conversion research brief](https://github.com/PraterCo/praterco-website/issues/4)  
**Scope:** Homeowners considering selling; evidence to inform Russ and review of WO-002. This document does not change approved product decisions or authorize implementation.

## Research question

What credible evidence can help Russ make a homeowner considering a sale feel heard, understood, less overwhelmed, more confident, and comfortable continuing with Russell, while avoiding pressure, unnecessary collection, misleading human-likeness, privacy surprise, and repeated effort?

## Why it matters

Selling a home is often a consequential, multi-causal decision involving money, timing, family, identity, logistics, repairs, future housing, and uncertainty. A system can increase disclosure or continuation while making a person less informed or less comfortable. The governing test is therefore the approved Client Benefit Principle: **Does using this information help us serve the client better, and would its use be reasonable and understandable from the client's perspective?**

## 1. Executive summary

The evidence supports a trust-first direction, but it does not support a simple formula in which more conversation, more empathy language, more remembered detail, or more disclosure is always better.

The strongest cross-domain finding is that people respond to evidence of attentive, relevant use of what they said. Reflective listening and answer-linked follow-up questions can increase perceived understanding and responsiveness in human conversations. Accurate continuity can improve trust and engagement in virtual-agent studies. In one real commercial corpus, bot-to-human sessions were associated with more post-handoff turns and words than human-only chats, consistent with added restatement burden but not proof of causality or a trust effect. These findings align with approved Prater standards to acknowledge meaning, ask one useful question at a time, remember relevant context, invite correction, and preserve consented conversation context.

The important qualification is that disclosure is not a sufficient success measure. Conversational social presence can raise willingness to answer while also raising privacy concern; human-like relevance has suppressed truthful answers in at least one sensitive-question experiment; and people may disclose more to a computer precisely because they believe no human is observing. Transfer to Russell is therefore a new audience event, not merely a technical continuation. Clear, separate, affirmative consent is both an approved PRATER STANDARD and consistent with the research.

Homeowner evidence shows that seller circumstances are heterogeneous. Recent U.S. seller research found that life events, family, employment, retirement, relationship changes, timing, repairs, finances, and alternative paths frequently overlap. Sellers are not uniformly rushed, do not always buy next, and often use digital tools alongside an agent. Trustworthy first impressions, responsiveness, local knowledge, reputation, and practical help matter. Research does not establish that “feeling heard” is the single dominant agent-selection factor; trust-first behavior must lead to competent, bounded usefulness.

Conversational interfaces are not categorically superior to forms. Controlled studies report mixed outcomes: chat-like presentation can feel more original or entertaining, but can be harder to navigate and may not improve completion time, open-answer length, or data quality. For Russ, a hybrid of free text, optional structured controls, visible correction, and direct access to human continuation is the most defensible prototype hypothesis.

Privacy evidence is unusually consistent about uncertainty and lack of control. National U.S. survey evidence shows widespread concern and limited understanding of company data use. Studies of LLM-chatbot privacy find that users regard conversations as sensitive and often misunderstand retention, deletion, or secondary use. Accurate recall can help, but wrong recall is worse than forgetting, and verbatim resurfacing can feel intrusive. Memory should be selective, accurate, correctable, purpose-bound, and explained when it becomes relevant.

No Prater product dataset or representative Russ evaluation was supplied. Accordingly, this brief contains **no DATA PROVEN or RUSS PROVEN findings**. Approved Product Bible and Decision Record requirements are labeled **PRATER STANDARD**. External evidence is labeled **RESEARCH PROVEN** only within the studied populations and methods. Russ-specific extensions that have not been tested are labeled **HYPOTHESIS**.

## 2. Research methodology and source-quality standard

### Scope and protocol

The review began with the governing repository documents in the required order: Source Authority, Product Bible, DR-001, the WO-002 Product Owner addendum, revised WO-002, Research Director role, and the current design-system document. External searching then used four source families:

1. trust, disclosure, acknowledgment, and question design;
2. homeowner decision-making, pressure, and human handoff;
3. privacy, consent, memory, retained context, and AI-assisted services; and
4. mobile, accessibility, and conversational interfaces versus forms.

Research was conducted through 2026-09-24 using web search, publisher/DOI records, government and standards sites, and repository evidence. Representative query families combined terms for active listening, responsiveness, question asking, sensitive disclosure, conversational interfaces/forms, seller decisions/stress, human handoff, privacy/consent, conversational memory, AI trust, mobile use, and accessibility. Searches prioritized peer-reviewed experiments and reviews, official standards, government population research, and transparent large-scale industry studies. Secondary summaries, marketing claims, inaccessible claims without sufficient method detail, and vendor material were excluded from core findings unless they exposed a relevant primary source. Searches stopped when credible evidence covered the bounded decision question or repeated searching confirmed a clearly stated gap. This was a structured rapid review, not a preregistered systematic review; all literature-negative statements are limited to what this review located.

### Evidence labels

- **RESEARCH PROVEN:** credible external research supports the bounded claim stated. It does not imply that the finding has been proven for Russ or homeowners unless that population was studied.
- **DATA PROVEN:** reliable Prater product data supports the claim. None available for this brief.
- **RUSS PROVEN:** repeated representative Russ evaluation supports the claim. None available for this brief.
- **PRATER STANDARD:** approved Product Owner or product decision, whether or not external research proves it.
- **HYPOTHESIS:** plausible application requiring representative testing.

### Quality assessment

Each significant source was assessed for publication date, population, method, sample, causal versus descriptive design, conflicts of interest, limitations, contrary findings, and applicability. Evidence was downgraded when it relied on convenience samples, self-report, completed sellers only, non-homeowner tasks, older technology, trade-association sponsorship, or observational designs. Accessibility standards are authoritative requirements/guidance, not causal proof of trust outcomes.

### Important limitations

- Very little research directly studies homeowners contemplating a sale before they select an agent.
- Most disclosure and conversational-interface research comes from health, survey, education, e-commerce, dating, or customer-service contexts.
- NAR and Zillow evidence is directly relevant but has industry interests; NAR's 2024 survey had a 3.6% adjusted response rate, and Zillow used weighted nonprobability online samples.
- Many studies measure liking, completion, stated trust, or disclosure rather than durable trust, comprehension, regret, decision quality, or willingness to continue later.
- Evidence about exact wording, cadence, transcript transfer, retention duration, and Russell-specific behavior remains incomplete.

## 3. Evidence map

| Finding | Classification | Source, population, and method | Strength and limits | Prater applicability |
| --- | --- | --- | --- | --- |
| Reflective active listening can increase felt understanding relative to advice or minimal acknowledgment. | **RESEARCH PROVEN** (bounded) | [Weger et al., 2014](https://doi.org/10.1080/10904018.2013.813234), randomized short interactions, 115 mostly undergraduate participants and trained confederates. | Moderate causal evidence; young convenience sample, in-person, small outcome differences. | Supports testing accurate reflection before advancing; does not prove generic empathy phrases work. |
| Follow-up questions linked to what was just said can signal responsiveness and increase liking. | **RESEARCH PROVEN** (bounded) | [Huang et al., 2017](https://doi.org/10.1037/pspi0000097), three live-conversation studies including randomized dyads and speed dating; substantive conclusions survived a [2025 correction](https://doi.org/10.1037/pspi0000491). | Moderate-to-strong; social conversations, not professional advice. | Supports answer-linked follow-up; does not support maximizing question count. |
| Conversational style can raise social presence and privacy concern at the same time; providing value/information before requesting information can mitigate concern. | **RESEARCH PROVEN** (bounded) | [Adam et al., 2024](https://doi.org/10.1111/isj.12490), randomized field experiment on a real site (381 analyzed; 4,627 exposed) plus online experiment (N=182), German students. | Strong design and behavioral outcome; young, narrow matching-service context. | Supports value before sensitive/contact requests and measuring privacy concern, not just disclosure. |
| Chat-like questionnaires are not consistently better than forms. | **RESEARCH PROVEN** as a mixed conclusion | [Kim et al., 2019](https://doi.org/10.1145/3290605.3300316), [Zarouali et al., 2023](https://doi.org/10.1080/19312458.2022.2156489), and [Deveci et al., 2026](https://doi.org/10.1177/07591063261424249). | Multiple controlled studies with mixed task, quality, ease, and enjoyment outcomes; survey tasks and non-homeowners. | “Conversation beats forms” remains unsupported. Test a hybrid against a structured alternative. |
| Human-like relevance can suppress truthful disclosure on sensitive questions. | **RESEARCH PROVEN** (bounded) | [Schuetzler et al., 2018](https://doi.org/10.1016/j.dss.2018.08.011), six-condition lab experiment, 165 retained college participants. | Moderate causal evidence; alcohol questions and young sample. | Warmth and candor may diverge. Do not equate rapport or response volume with truthfulness. |
| Lower fear of human evaluation can increase disclosure to an automated interviewer. | **RESEARCH PROVEN** (bounded) | [Lucas et al., 2014](https://doi.org/10.1016/j.chb.2014.04.043), experiment with 239 adults in a health-screening simulation. | Moderate causal evidence; deceptive framing and non-real-estate task. | Transfer to Russell changes the perceived audience; explicit handoff notice and consent are essential. |
| Seller decisions are often multi-causal and life-event-driven, with varied urgency, repairs, alternatives, and next-housing paths. | **RESEARCH PROVEN** (descriptive) | [Zillow 2024 seller report](https://www.zillow.com/research/sellers-housing-trends-report-2024/), four weighted U.S. online surveys, about 9,500 responses from over 6,200 unique recent sellers; [U.S. Census 2023](https://www.census.gov/library/stories/2023/09/why-people-move.html), CPS ASEC. | Moderate-to-strong descriptive evidence; Zillow nonprobability/industry conflict; Census covers movers, not sellers. | Do not force a single motive, urgency level, or assumed next purchase. |
| Selling stress combines uncertainty, money, timing, repairs, control, belongings, and logistics. | **RESEARCH PROVEN** (descriptive) | [Ipsos/Zillow 2019](https://www.ipsos.com/sites/default/files/ct/news/documents/2019-06/zillow-house-seller-survey-pr-2019-06-25.pdf), N=1,068 U.S. adults who sold in prior three years. | Moderate; older, self-report, nonprobability, sponsor conflict. | Treat practical and emotional context as intertwined; do not assume every seller is distressed. |
| Sellers value practical competence as well as trust: timeframe, pricing, marketing, repairs, reputation, honesty, and local knowledge. | **RESEARCH PROVEN** (descriptive) | [NAR 2024 Generational Trends](https://www.nar.realtor/sites/default/files/documents/2024-home-buyers-and-sellers-generational-trends-04-03-2024.pdf), 6,817 responses to 189,750 mailed surveys; seller results conditioned on also buying. | Moderate at best due 3.6% response and trade-association interest. | Acknowledgment must lead to useful orientation. Evidence does not show listening alone dominates agent choice. |
| Bot-to-human sessions were associated with more post-handoff turns and words than human-only chats in one setting, consistent with added restatement burden. | **RESEARCH PROVEN** as an observational association | [Hewitt & Beaver, 2020](https://doi.org/10.18653/v1/2020.sigdial-1.11), 16,794 human chats and 27,674 commercial-agent chats in one financial-services company. | Moderate observational evidence; selection effects, one firm, vendor authors, no direct trust measure or causal identification. | Supports testing no-repeat continuity; does not compare the approved full-context package with or without a supplemental summary/navigation aid. |
| Accurate recall can help; wrong recall is highly damaging, and verbatim resurfacing can increase privacy concern. | **RESEARCH PROVEN** (bounded) | [Richards & Bransky, 2014](https://doi.org/10.1016/j.ijhcs.2014.01.005), multi-session virtual real-estate agent experiment; [Cox et al., 2023](https://doi.org/10.1145/3623809.3623875), three-week N=169 study with interviews. | Moderate and domain-adjacent; older agent technology and low-stakes habit context. | Prefer accurate, selective, paraphrased, confirmable memory; uncertainty is safer than confident wrong recall. |
| People are concerned about company data use and often feel low understanding/control. | **RESEARCH PROVEN** (population attitudes) | [Pew Research Center, 2023](https://www.pewresearch.org/internet/2023/10/18/how-americans-view-data-privacy/), nationally weighted probability panel, 5,101 U.S. adults. | Strong survey; attitudes, not observed homeowner behavior. | Explain audience, purpose, retention, and control in plain language at relevant moments. |
| LLM-chatbot conversations are widely considered sensitive; informed consent, anonymization, and PII removal improve perceived appropriateness. | **RESEARCH PROVEN** (stated judgments) | [Tran et al., 2025](https://doi.org/10.1609/aies.v8i3.36735), survey and factorial vignettes with 300 U.S. ChatGPT users. | Moderate-to-strong; online users and hypothetical judgments. | “Better service” alone may not justify reuse; procedural safeguards and control matter. |
| Consent rates are strongly shaped by interface structure and nudging. | **RESEARCH PROVEN** (cookie context) | [Utz et al., 2019](https://arxiv.org/abs/1909.02638), three field experiments with over 80,000 visitors; [Nouwens et al., 2020](https://arxiv.org/abs/2001.02479), 680-site audit plus controlled experiment. | Strong/moderate causal evidence; cookies and European legal context. | A click is not evidence of comfort if refusal is harder or framing steers agreement. |
| AI trust is context-dependent; meaningful rationales can reduce uncertainty, while disclosure or machine framing can lower perceived empathy/competence in some settings. | **RESEARCH PROVEN** as a mixed conclusion | [Shin, 2021](https://academic.oup.com/jcmc/article/26/6/384/6367958), N=491 experiment; [Luo et al., 2019](https://doi.org/10.1287/mksc.2019.1192), field data from over 6,200 outbound sales customers; [Longoni et al., 2019](https://doi.org/10.1093/jcr/ucz013), nine medical-AI experiments. | Strong program but different high-stakes and sales contexts, some pre-LLM. | Disclose truthfully and explain capabilities/limits; frame Russ as support with human recourse, not a replacement. Do not promise that transparency increases conversion. |
| Accessibility requires robust operation, reflow, readable/resizable content, keyboard access, adequate target size, understandable errors, non-disruptive status announcements, and sufficient time. | **PRATER STANDARD** reinforced by authoritative standards | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Status Messages guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages), and [Natural Language Interface Accessibility User Requirements](https://www.w3.org/TR/naur/). | Authoritative standards/guidance, not a causal trust study; WCAG does not cover every user need. | Accessibility is a release requirement and trust condition. Test with disabled users; avoid over-chatty announcements and time pressure. |

## 4. Trust and disclosure findings

Unless explicitly identified as a **PRATER STANDARD**, the Russ-specific applications in Sections 4–10 are recommendations or **HYPOTHESES** requiring representative evaluation.

### What the research supports

1. **Specific responsiveness matters more than generic warmth.** Reflective paraphrase and relevant elaboration can increase felt understanding. Follow-up questions work partly because they show that the listener used the prior answer. The requirement to acknowledge meaning is a **PRATER STANDARD**; using a concise reflective paraphrase without exaggerating certainty or emotion is a **HYPOTHESIS** for Russ. This mechanism is also consistent with diary evidence linking disclosure, perceived responsiveness, and interpersonal intimacy, although intimacy is not the same as professional trust ([Laurenceau et al., 1998](https://doi.org/10.1037/0022-3514.74.5.1238)).

2. **Disclosure depends on perceived judgment and audience.** Automated interaction can reduce evaluation fear, but a human-like or apparently monitored interaction can change candor. Treating disclosure volume as proof of trust would be unsupported. A review of conversational-technology disclosure studies likewise found heterogeneous results by sensitivity, embodiment, rapport, and perceived judgment ([Papneja & Yadav, 2024](https://doi.org/10.1007/s00779-024-01823-7)).

3. **Question rationale can matter.** A 2026 randomized healthcare-chatbot experiment with 556 analyzed U.S. adults found that question-specific explanations improved perceived informational fairness and relevance and indirectly reduced privacy concern, although the direct effect on disclosure was not statistically significant ([Papneja & Devaraj, 2026](https://doi.org/10.1002/joom.70026)). This supports testing a concise reason before consequential questions, not explaining every low-risk question.

4. **Sensitive-question order has no universally safe rule.** Seven survey experiments found more disclosure when sensitive questions preceded less sensitive ones, apparently by changing perceived intrusiveness ([Acquisti, John & Loewenstein, 2012](https://doi.org/10.1509/jmr.09.0215)). That is not a trust-first recommendation: it demonstrates that disclosure can be manipulated. The client-benefit objective is informed, comfortable relevance, not maximum answer yield.

5. **Silence is ambiguous.** Government-commissioned U.K. housing research found that only about one-third of dissatisfied sellers complained; others wanted to move on or thought complaining was not worthwhile ([UK BIS, 2017](https://assets.publishing.service.gov.uk/media/5a81cf5240f0b62302699494/buying-selling_homes-research.pdf)). Survey-methodology review evidence also distinguishes an obtained answer from a willing, truthful, low-regret disclosure ([Yan, 2021](https://doi.org/10.1146/annurev-statistics-040720-033353)). Lack of objection must not be read as trust or satisfaction.

### What the research does not establish

- The ideal length or wording of acknowledgment.
- A universal number of questions before direction should be offered.
- That deeper disclosure improves homeowner decisions.
- That an emotionally expressive response is better than a precise practical acknowledgment.
- That homeowner trust can be inferred from completion, contact sharing, or absence of complaint.

## 5. Conversation-design findings

### Helpful versus interrogative

Questions are more likely to feel responsive when they visibly follow the speaker's prior meaning. They become risky when they jump to a new agenda, request sensitive facts without a clear benefit, repeat known information, require false precision, or continue after a user asks for direction. A small conversation-analysis study of psychiatric intake found that formulations of the speaker's experience often invited elaboration, while abrupt agenda shifts after emotional disclosure created interactional tension ([Savander et al., 2024](https://doi.org/10.3389/fpsyt.2024.1352601)). Applicability to housing is a **HYPOTHESIS**, but the mechanism is relevant.

### How much information before another question

This review located no credible study establishing a universal ratio. Evidence supports adaptive reciprocity: provide a useful orientation, answer a direct question, or explain why a consequential detail matters before asking for more. In Adam et al., providing information before requesting target information reduced the privacy downside of conversational style. This supports the approved value-before-contact standard, but not a fixed cadence.

### When useful direction should be offered

Direction should be offered when it can reduce uncertainty without pretending to resolve unknown facts. For a homeowner, useful early direction is likely to be process orientation, a small set of considerations, or clarification of tradeoffs. Early numerical estimates require caution: residential real-estate research finds anchoring effects from starting prices even when the ultimate price effect is small ([Bucchianeri & Minson, 2013](https://doi.org/10.1016/j.jebo.2013.01.010)). Unsolicited price or value numbers should not be used simply to appear useful.

### Conversation versus form

The evidence is mixed. A 2026 randomized student field experiment found a chat-like questionnaire more original and entertaining but harder to navigate, with no significant difference in open-answer length or response time. A 14-day preregistered Dutch study found web surveys often performed better on answer length, enjoyment, usefulness, and security perceptions. The prototype should compare a conversational hybrid with a clear structured alternative and preserve overview, correction, back navigation, and optional quick replies.

### First impression, one primary action, progressive disclosure, and social proof

These concepts appeared in the original Issue #4 scope, but their evidence is not equally strong:

- **First impression:** Zillow's 2024 seller sample rated trustworthy and responsive first impressions highly, while older web-credibility research associates real-world identity, ease, expertise, trustworthiness, and competent presentation with perceived credibility. This supports clarity and identifiable professional responsibility, but not a specific visual treatment.
- **One primary action:** The approved design system makes this a **PRATER STANDARD**. External evidence does not prove that one visible action is universally optimal. A meta-analysis of 63 conditions from 50 choice experiments (N=5,036) found a mean choice-overload effect near zero with substantial variation ([Scheibehenne, Greifeneder & Todd, 2010](https://doi.org/10.1086/651235)). The prototype should test whether conversation remains unmistakably primary while call/text and access/help options remain discoverable.
- **Progressive disclosure:** Government service guidance recommends beginning with one thing per page because it can aid focus, mobile use, branching, and error recovery. This is established practice guidance, not direct causal proof for emotional real-estate conversation. Russ should reveal only what is useful now while preserving orientation, back/correction, and access to important privacy information.
- **Social proof:** Zillow reported that 67% of recent sellers considered agent ratings/reviews important to first impressions, and NAR found reputation was a prominent stated selection factor. These are descriptive and conflicted industry sources; they do not establish which testimonial or review presentation causes trust. Authentic, verifiable evidence of Russell's competence may help, but testimonial quantity, placement, and effect remain **HYPOTHESIS**.

## 6. Homeowner decision-making findings

### Decisions are multi-causal

Zillow's 2024 seller report found that 78% of recent sellers said at least one life event influenced the sale/move. Reported influences included family or household size, work, retirement, and relationship changes. Census population evidence separately shows housing and family reasons dominate moves but does not capture the full causal bundle. Russ should not force an answer into a single public label or assume the property is the whole problem.

### Urgency varies

In Zillow's report, 18% described short urgency, 47% medium urgency, and 35% a relaxed timeline; older sellers more often considered the sale for six months or longer. Timing is necessary context, but urgency should be asked rather than inferred.

### Selling is not a linear prelude to buying

Only 54% of Zillow respondents also bought, and simultaneous buy/sell was reported by 14%. Others rented, moved to an already owned home, or had other arrangements. Russ should ask about the next living situation only when it can improve guidance and should allow uncertainty or “not buying next.”

### Repairs, offer risk, and logistics are consequential

Seventy-two percent of Zillow respondents made at least one improvement. Among respondents with a failed offer, financing, inspection, and appraisal were frequent reported causes. The 2019 Ipsos/Zillow survey found uncertainty about price and timing, packing, failed offers, improvements, loss of control, belongings, decluttering, and coordinating another purchase among common stressors. These topics should be available to the homeowner rather than treated as a mandatory checklist.

### Practical competence is part of trust

NAR's 2024 report found sellers most often selected timeframe, competitive pricing, marketing, and repair help as the single most desired agent assistance. Reputation and honesty/trustworthiness led stated agent-selection reasons; “caring/good listener” was selected by 5% as the single most important factor. This does not contradict the Product Bible's human outcomes, but it prevents an unsupported claim that listening alone drives professional choice.

## 7. Human handoff findings

### Continuity reduces avoidable effort

In one financial-services corpus, bot-to-human sessions required more turns and words after escalation than human-only chats, and the authors inferred that human agents were not adequately using already supplied context. The study supports the problem definition behind WO-002: re-asking can impose work and signal that prior disclosure was not used. It does not determine whether Russell needs every raw message in every case.

### Handoff changes the audience

Research on computer-mediated disclosure shows that people may say more when they believe a human is not observing. Conversation analysis of 2026 customer-service handovers also found that users changed style after a human joined, becoming more detailed and sentence-complete ([de Wit et al., 2026](https://research.vu.nl/en/publications/hold-on-ill-connect-you-to-a-human-agent-recipient-design-repair-/)). Therefore, a handoff is not a neutral background event. The person should know that Russell is the recipient, what he will receive, and why.

### Timing is contextual

Customer-service datasets identify repetition, irrelevant replies, negative affect, explicit requests, and capability failures as possible escalation signals ([Liu et al., 2021](https://doi.org/10.48550/arXiv.2012.07610)). This is weak evidence for homeowners. Russ should always honor a direct human request, but automated inference of handoff readiness remains a **HYPOTHESIS**.

### Full ordered context plus supplemental summary remains unvalidated

The approved requirement to preserve and provide the full ordered conversation after consent is a **PRATER STANDARD** and is not open to replacement by a summary or selective transfer in WO-002. This review located no credible study comparing full ordered context alone with full ordered context plus a homeowner-confirmed supplemental summary or Russell-facing navigation for real-estate trust or outcome quality. WO-002 should evaluate the approved architecture for usefulness and comfort rather than describe its superiority as research proven.

## 8. Privacy, consent, memory, and retained-context findings

### Expectations and control

Pew's national survey found 81% of U.S. adults concerned about company data use, 73% feeling little or no control, and 67% saying they understand little or nothing about company use. In a 2025 study of 300 U.S. ChatGPT users, 82% rated chatbot conversations sensitive or highly sensitive; informed consent, anonymization, and PII removal improved perceived appropriateness. A 2025 survey of 211 U.K. LLM users found inaccurate beliefs about deletion and training opt-out ([Malki et al., 2025](https://doi.org/10.56553/popets-2025-0160)).

Implication: continued use does not demonstrate understanding. Explain retention, review access, human transfer, and meaningful control in direct language when each becomes relevant.

### Consent quality

Large cookie-consent field experiments show that placement, refusal friction, granularity, defaults, and framing materially change acceptance. Consent should therefore be judged by comprehension and freedom, not acceptance rate. For Russ, decline must be as understandable and usable as agree; calling or texting Russell independently should remain possible without transcript transfer, as WO-002 already requires.

### Memory and repetition

Correct recall can increase perceived intelligence, believability, and engagement. Incorrect recall is frustrating and can be worse than partial forgetting. Verbatim references can also raise privacy concern. The evidence favors:

- remembering only context with an articulated client benefit;
- distinguishing confirmed, corrected, uncertain, and expired context;
- paraphrasing and confirming when context is consequential;
- making correction easy and authoritative; and
- acknowledging uncertainty rather than inventing continuity.

These are **HYPOTHESES** for implementation details except where WO-002 already establishes them as **PRATER STANDARD**.

### Retention

This review located no evidence establishing an optimal public retention period for homeowner conversations. Retention must be a Product Owner policy decision informed by continuity benefit, user expectation, security exposure, access/deletion mechanics, and operational feasibility. Research supports bounded, purpose-specific retention and deletion/de-identification controls; it does not select a number of days.

## 9. Mobile and accessibility findings

### Mobile behavior

Zillow's 2024 seller sample reported substantial use of both desktop web (74%) and mobile web (69%), plus apps (63%); channels were complementary. Mobile should therefore preserve capability, not become a simplified lead form. Small screens, interruption, and typing effort make resume, saved drafts, clear back/correction, large targets, and optional structured replies especially important. Direct causal evidence about mobile homeowner chat behavior remains sparse.

### Accessibility requirements that materially affect trust and comprehension

WCAG 2.2 requires, among other things, keyboard operation, text resizing to 200% without loss, reflow at 320 CSS pixels, visible/non-obscured focus, sufficient contrast, programmatically associated labels and errors, redundant-entry protections, and minimum target-size treatment. W3C natural-language-interface guidance adds user needs specific to dialogue: adequate response time, alternatives to speech, clear ways to correct recognition/interpretation, predictable turn-taking, and understandable status.

For a conversational experience:

- announce new messages, errors, sending state, and completion without repeatedly reading the whole transcript;
- do not use assertive live regions for routine content or make the experience excessively “chatty” for screen-reader users;
- preserve typed input through safe timeout, interruption, and re-authentication flows;
- offer text and accessible controls rather than requiring speech, gesture, drag, or precise touch;
- keep message order and focus movement logical;
- allow users enough time without countdown pressure; and
- test with disabled participants, because WCAG conformance alone does not cover every user need.

Accessibility is an approved **PRATER STANDARD** and release requirement. Its trust impact is plausible but should not be overstated as directly measured by these standards.

## 10. AI-assisted and digitally mediated professional services

### Trust should be calibrated, not maximized

NIST's [AI Risk Management Framework 1.0](https://doi.org/10.6028/NIST.AI.100-1) treats trustworthy AI as context-dependent and multi-dimensional: validity, reliability, transparency, accountability, explainability, privacy, safety, and fairness all matter. The [OECD transparency principle](https://oecd.ai/en/dashboards/ai-principles/P7) calls for awareness of AI interaction, context-appropriate information about capabilities and limits, and routes to challenge outputs. These are authoritative frameworks, not outcome experiments.

### Human replacement creates resistance in some high-stakes services

Across nine medical-AI experiments, people resisted AI partly because they expected it to neglect their uniqueness; resistance decreased when the service was personalized or AI supported rather than replaced a human professional. This is indirect but relevant evidence for presenting Russ truthfully as Russell's digital guide with human continuation, not as an autonomous professional.

### Transparency is necessary but not a conversion tactic

Meaningful rationales can reduce uncertainty and improve trust. Yet an AI identity disclosure sharply reduced purchase behavior and perceived empathy/knowledge in a 2019 outbound-sales field setting. That conflict does not justify concealment. It establishes that truthful disclosure may carry a short-term behavioral cost and that trust, comprehension, and appropriateness should outrank conversion.

### Credibility is both relational and practical

Classic web-credibility research with more than 1,400 U.S. and European participants grouped credibility contributors around real-world feel, ease of use, expertise, trustworthiness, and tailoring, while commercial implications and amateurism reduced credibility ([Fogg et al., 2001](https://credibility.stanford.edu/pdf/p61-fogg.pdf)). The study is old and based on self-reported perception, but it supports a current principle: warmth without competence, clarity, and an identifiable real-world professional is not enough.

## 11. Implications for Russ

The following are recommendations for review, not new product decisions.

1. Keep acknowledgment evidence-based: briefly reflect the homeowner's meaning, preserve uncertainty, and allow correction. Avoid generic “I understand” language that is not followed by accurate use of context.
2. Ask the next question only when it has a clear client benefit. Make the link to what the homeowner said visible. For a sensitive or surprising question, state the reason concisely.
3. Provide bounded usefulness before asking for contact information. Useful direction can be process orientation, tradeoff clarification, or a next consideration; it need not be a prediction or valuation.
4. Treat `skip`, `not sure`, correction, and “talk to Russell” as legitimate paths, not failures.
5. Measure comfort, comprehension, correction, candor, later willingness to continue, and regret alongside disclosure and completion.
6. Use memory selectively. Prefer a paraphrased, confirmable reference over unexpected verbatim replay. When confidence is low or facts may be stale, ask rather than assert.
7. Make the change of audience explicit at handoff. Preview the recipient, purpose, and scope of the ordered conversation transfer; require separate affirmative consent. Any Russell-facing summary remains supplemental to the ordered conversation and is not presented as the visitor's private/internal profile.
8. Preserve an independent call/text path when transfer consent is declined.
9. Present Russ truthfully as a bounded digital extension/guide with named human responsibility and clear professional limits.
10. Within the primary conversation, provide accessible optional quick replies and controls that reduce effort without constraining free text. A separate form-like comparator belongs in research evaluation, not in the approved product path.

## 12. Implications specifically for WO-002

### Requirements supported or reinforced

- **PRATER STANDARD:** acknowledgment before advancing is consistent with active-listening and responsiveness research.
- **PRATER STANDARD:** one useful question at a time is consistent with focus and mobile/accessibility guidance, but the exact cadence is not research proven.
- **PRATER STANDARD:** value before contact is consistent with reciprocity/informational-fairness evidence.
- **PRATER STANDARD:** retained context and correction support are consistent with recall and continuity evidence.
- **PRATER STANDARD:** separate affirmative handoff consent is consistent with audience-effect and consent-design evidence.
- **PRATER STANDARD:** ordered context plus optional summary is approved. Research supports preserving continuity but does not prove this package is optimal.
- **PRATER STANDARD:** full keyboard/mobile/accessibility behavior and safe recovery are necessary and should include conversational-specific announcement testing.

### Recommended evaluation evidence for WO-002 review

1. Representative homeowners can identify what Russ understood, correct it, and see corrections govern later responses.
2. Participants can explain, in their own words, what is retained during private testing and what Russell will receive at handoff.
3. Declining context transfer is easy and does not block independent call/text continuation.
4. Russell can continue without asking for information already supplied, while still checking stale, uncertain, or conflicting facts.
5. The experience remains usable at 320 CSS pixels, 200% text enlargement, keyboard only, screen reader, reduced motion, interruption/resume, and timeout/re-authentication.
6. Evaluation separates disclosure quantity from felt pressure, comprehension, perceived accuracy, usefulness, trust calibration, and comfort continuing.

### WO-002 cautions

- Do not describe full transcript transfer, a 90-day prototype retention default, or any exact conversation cadence as externally proven.
- Do not use AI/persona disclosure as a persuasive flourish; evaluate whether people accurately understand the identity and limits.
- Do not infer readiness from length, sentiment, contact sharing, or absence of objection.
- Do not automate handoff merely because negative affect or repetition is detected; offer control and test the cue.
- Do not expose internal profiles, scores, unknowns, or summaries; that boundary is governed by approved product decisions.

## 13. Ten strongest evidence-backed findings

1. **RESEARCH PROVEN:** Accurate reflective listening and answer-linked follow-up can improve perceived responsiveness in human conversation, within non-homeowner samples.
2. **RESEARCH PROVEN:** Disclosure is audience-dependent; reduced belief in human observation can increase sensitive disclosure.
3. **RESEARCH PROVEN:** Conversational style can simultaneously increase social presence and privacy concern; value before a request can mitigate concern.
4. **RESEARCH PROVEN:** Chat-like interfaces do not consistently outperform forms on ease, completion, answer quality, or satisfaction.
5. **RESEARCH PROVEN:** Recent seller evidence shows heterogeneous life events, urgency, repairs, alternative plans, and next-housing paths.
6. **RESEARCH PROVEN:** Recent seller surveys identify practical help, reputation, honesty/trustworthiness, responsiveness, and local knowledge among selection and first-impression priorities; listening alone was not dominant in forced-choice data.
7. **RESEARCH PROVEN:** In one commercial service corpus, bot-to-human sessions were associated with more post-handoff turns and words than human-only chats, consistent with but not proving restatement burden.
8. **RESEARCH PROVEN:** In virtual-agent and short longitudinal studies, correct recall improved agent perceptions, while wrong recall caused frustration and verbatim recall raised privacy concern; homeowner generalization remains untested.
9. **RESEARCH PROVEN:** People commonly report low understanding and control over company data use; chatbot users regard conversations as sensitive.
10. **RESEARCH PROVEN:** Consent behavior is highly sensitive to interface framing and friction; acceptance rate is not a sufficient measure of informed willingness.

## 14. Five assumptions the Prater Framework should NOT currently make

1. **“Conversation is inherently better than a form.”** Evidence is mixed and context-dependent.
2. **“More disclosure means more trust or a better client experience.”** Disclosure can result from reduced caution, social pressure, anchoring, or misunderstood audience.
3. **“More human-like behavior always improves candor and trust.”** Human-like relevance can increase privacy concern or socially desirable responding.
4. **“Remembering more detail always helps.”** Wrong or verbatim recall can be worse than forgetting; relevance, accuracy, and expectation matter.
5. **“If a homeowner told Russ, they expect Russell to receive it.”** Audience belief changes disclosure; handoff requires a clear new consent event.

## 15. Five hypotheses worth testing in the private prototype

1. **HYPOTHESIS:** A concise, editable reflection followed by one answer-linked question will increase felt understanding and reduce pressure compared with a question-only flow.
2. **HYPOTHESIS:** A one-sentence client-benefit rationale before a consequential question will improve perceived fairness and informed willingness without increasing regret.
3. **HYPOTHESIS:** A hybrid of free text, optional structured controls, and visible back/correction will outperform pure chat and a conventional multi-field form on comprehension, comfort, and mobile task success.
4. **HYPOTHESIS:** Paraphrased and confirmable memory will preserve continuity with less privacy concern than verbatim recall; explicit uncertainty will outperform confidently wrong recall.
5. **HYPOTHESIS:** A preview-and-approve handoff that explains recipient, scope, purpose, and alternatives will produce better comprehension and comfort than a generic “connect” prompt, while allowing Russell to continue without re-asking.

## 16. Research gaps

- This review located no direct causal study comparing chat, form, and hybrid guidance for homeowners considering a sale.
- No representative homeowner study tests reflective acknowledgment, question cadence, or information-before-question balance.
- Pre-listing considerers and people who disengage are underrepresented; most real-estate surveys cover completed transactions.
- This review located no credible study determining a safe number of consecutive questions or ideal acknowledgment length.
- This review located no direct study comparing full ordered context alone with full ordered context plus a confirmed summary or navigation aid for handoff to a named real-estate advisor.
- This review located no evidence determining the optimal retention period or exact memory fields for homeowner conversations.
- Limited evidence addresses shared devices, joint owners, family decision rights, or third-party information disclosed by one household member.
- Sparse subgroup evidence covers distressed sale, foreclosure, divorce, probate, bereavement, disability, limited English proficiency, low literacy, rural access, and housing insecurity.
- Little research measures delayed regret, later trust, or decision quality after an apparently successful conversational disclosure.
- This review located no direct evidence about mobile behavior in emotionally consequential homeowner conversations.
- This review located no homeowner-specific evidence on expectations for downstream use, retention, or human access to information shared with a digital guide.
- Little direct research measures felt pressure in real-estate conversations before a homeowner selects an agent.
- No DATA PROVEN or RUSS PROVEN evidence yet connects prototype behavior to the five human success criteria.

## 17. Product Owner questions

No new Product Owner decision is required to complete this research brief or to preserve the approved private-prototype direction. The evidence does not overturn any approved Product Bible or DR-001 decision.

The following already-deferred public-launch decisions remain genuine Product Owner decisions because research cannot select them:

1. What public retention duration, deletion/de-identification cadence, and documented exceptions are acceptable?
2. What public visitor access, correction, deletion, and export controls will be promised?
3. What client-facing promises and permitted uses will govern access, analytics, provider processing, backup persistence, and incident disclosure? Engineering should select and document the controls that satisfy those approved policies and risk tolerances.

The Product Owner need not decide exact wording, acknowledgment length, or question count now; those should be tested through the Russ Behavior Lead and Quality Director under the Russell Test.

**Future decision trigger:** after prototype evidence exists, the Product Owner may need to decide whether user-selectable per-message or per-topic handoff controls should become a product standard. This is not a present implementation assumption.

## 18. Recommended future research

1. Conduct moderated foundational interviews with a purposive sample of homeowners considering but not yet committed to selling, including people who chose not to contact an agent.
2. Oversample contexts likely to expose trust failures: divorce, probate/bereavement, financial strain, urgent relocation, major repairs, disability, older adults, limited English proficiency, and shared decision-making.
3. Run the five prototype experiments above with comprehension, pressure, correction, usefulness, trust calibration, delayed comfort, and willingness-to-continue measures.
4. Within the approved full-context architecture, compare full ordered context alone with full ordered context plus a homeowner-confirmed supplemental summary or Russell-facing navigation. Full ordered context remains available to Russell after consent in every condition.
5. Observe Russell using consented handoff packages and measure whether context reduces repetition, improves his understanding, and creates any new privacy or information-overload risk.
6. Run accessibility research with screen-reader, keyboard-only, low-vision, motor, cognitive, and speech-input users on real mobile devices; automated scanning is insufficient.
7. Establish a small longitudinal private-testing cohort to study resume, stale context, correction, forgetting, and handoff after time has passed.
8. Compare the approved conversational path with an appropriate research-only structured comparator to test comprehension, comfort, usefulness, and mobile task success without silently adding a second product path.
9. Create an evidence plan before public launch that defines which measures could become DATA PROVEN and which scenarios must become RUSS PROVEN.

## Sources

### Trust, disclosure, and conversation

- Acquisti, A., John, L. K., & Loewenstein, G. (2012). [The impact of relative standards on the propensity to disclose](https://doi.org/10.1509/jmr.09.0215).
- Adam, M. et al. (2024). [From web forms to chatbots: The roles of consistency and reciprocity for user information disclosure](https://doi.org/10.1111/isj.12490).
- Huang, K. et al. (2017). [It doesn't hurt to ask: Question-asking increases liking](https://doi.org/10.1037/pspi0000097); [2025 correction](https://doi.org/10.1037/pspi0000491).
- Laurenceau, J.-P., Barrett, L. F., & Pietromonaco, P. R. (1998). [Intimacy as an interpersonal process](https://doi.org/10.1037/0022-3514.74.5.1238).
- Lucas, G. M. et al. (2014). [It's only a computer: Virtual humans increase willingness to disclose](https://doi.org/10.1016/j.chb.2014.04.043).
- Papneja, H., & Devaraj, S. (2026). [Question-specific explanations, informational fairness, and chatbot disclosure](https://doi.org/10.1002/joom.70026).
- Papneja, H., & Yadav, R. S. (2024). [Review of self-disclosure to conversational technologies](https://doi.org/10.1007/s00779-024-01823-7).
- Savander, E. et al. (2024). [Disclosure sequences and formulations in psychiatric intake](https://doi.org/10.3389/fpsyt.2024.1352601).
- Schuetzler, R. M. et al. (2018). [The influence of conversational agents on socially desirable responding](https://doi.org/10.1016/j.dss.2018.08.011).
- Weger, H. et al. (2014). [The relative effectiveness of active listening in initial interactions](https://doi.org/10.1080/10904018.2013.813234).
- Yan, T. (2021). [Consequences of asking sensitive questions in surveys](https://doi.org/10.1146/annurev-statistics-040720-033353).

### Interfaces, mobile, and accessibility

- Deveci, C. C., Fuchs, M., & Metzler, A. (2026). [Experimental comparison of a chatbot-like questionnaire with a traditional web questionnaire](https://doi.org/10.1177/07591063261424249).
- GOV.UK Service Manual. [Structuring forms](https://www.gov.uk/service-manual/design/form-structure) (accessed 2026-09-24).
- Kim, S., Lee, J., & Gweon, G. (2019). [Comparing data from chatbot and web surveys](https://doi.org/10.1145/3290605.3300316).
- Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). [Can there ever be too many options? A meta-analytic review of choice overload](https://doi.org/10.1086/651235).
- W3C. (2023). [Web Content Accessibility Guidelines 2.2, W3C Recommendation](https://www.w3.org/TR/WCAG22/) (accessed 2026-09-24).
- W3C. [Understanding status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) (accessed 2026-09-24).
- W3C. (2022). [Natural Language Interface Accessibility User Requirements](https://www.w3.org/TR/naur/).
- Zarouali, B. et al. (2023). [Longitudinal comparison of chatbot and web survey experience](https://doi.org/10.1080/19312458.2022.2156489).

### Homeowner decisions and handoff

- Bucchianeri, G. W., & Minson, J. A. (2013). [A homeowner's dilemma: Anchoring in residential real estate transactions](https://doi.org/10.1016/j.jebo.2013.01.010).
- Hewitt, T., & Beaver, I. (2020). [Users' communication styles before and after handoff](https://doi.org/10.18653/v1/2020.sigdial-1.11).
- Ipsos for Zillow. (2019). [House seller stress survey](https://www.ipsos.com/sites/default/files/ct/news/documents/2019-06/zillow-house-seller-survey-pr-2019-06-25.pdf).
- Liu, Z. et al. (2021). [Time to transfer: Predicting and evaluating machine-human chatting handoff](https://doi.org/10.48550/arXiv.2012.07610).
- National Association of REALTORS. (2024). [Home Buyers and Sellers Generational Trends](https://www.nar.realtor/sites/default/files/documents/2024-home-buyers-and-sellers-generational-trends-04-03-2024.pdf).
- U.S. Census Bureau. (2023). [Why people move](https://www.census.gov/library/stories/2023/09/why-people-move.html).
- U.K. Department for Business, Innovation & Skills. (2017; fieldwork 2015). [Research on buying and selling homes](https://assets.publishing.service.gov.uk/media/5a81cf5240f0b62302699494/buying-selling_homes-research.pdf).
- Zillow. (2024). [Consumer Housing Trends Report: Sellers](https://www.zillow.com/research/sellers-housing-trends-report-2024/).

### Privacy, memory, consent, and AI-assisted services

- Cox, S. R., Lee, S. W., & Ooi, W. T. (2023). [Comparing how a chatbot references prior-session utterances](https://doi.org/10.1145/3623809.3623875).
- de Wit, J. et al. (2026). [Hold on, I'll connect you to a human agent: Recipient design and repair across chatbot-to-human handovers](https://research.vu.nl/en/publications/hold-on-ill-connect-you-to-a-human-agent-recipient-design-repair-/).
- Longoni, C., Bonezzi, A., & Morewedge, C. K. (2019). [Resistance to medical artificial intelligence](https://doi.org/10.1093/jcr/ucz013).
- Luo, X. et al. (2019). [Machines versus humans: AI chatbot disclosure and customer purchases](https://doi.org/10.1287/mksc.2019.1192).
- Malki, M. et al. (2025). [Hoovered up as a data point: Privacy perceptions and behaviors in LLM use](https://doi.org/10.56553/popets-2025-0160).
- NIST. (2023). [Artificial Intelligence Risk Management Framework 1.0](https://doi.org/10.6028/NIST.AI.100-1).
- Nouwens, M. et al. (2020). [Dark patterns after the GDPR](https://arxiv.org/abs/2001.02479).
- OECD. [AI principle: Transparency and explainability](https://oecd.ai/en/dashboards/ai-principles/P7) (accessed 2026-09-24).
- Pew Research Center. (2023). [How Americans view data privacy](https://www.pewresearch.org/internet/2023/10/18/how-americans-view-data-privacy/).
- Richards, D., & Bransky, K. (2014). [ForgetMeNot: Expectations for virtual-agent recall and forgetting](https://doi.org/10.1016/j.ijhcs.2014.01.005).
- Shin, D. (2021). [Agency locus, transparency, social cues, and trust in AI](https://academic.oup.com/jcmc/article/26/6/384/6367958).
- Tran, D. A. et al. (2025). [Privacy norms around LLM-based chatbots](https://doi.org/10.1609/aies.v8i3.36735).
- Utz, C. et al. (2019). [(Un)informed consent: GDPR consent notices in the field](https://arxiv.org/abs/1909.02638).

### Credibility

- Fogg, B. J. et al. (2001). [What makes Web sites credible? A report on a large quantitative study](https://credibility.stanford.edu/pdf/p61-fogg.pdf).

## Classification summary

- **RESEARCH PROVEN:** the bounded external findings identified above.
- **DATA PROVEN:** none; no valid Prater product dataset was provided.
- **RUSS PROVEN:** none; representative Russ evaluation has not yet been completed.
- **PRATER STANDARD:** the approved Product Bible, DR-001, and WO-002 requirements explicitly identified above.
- **HYPOTHESIS:** all unvalidated Russ-specific applications and the five prototype tests in Section 15.
