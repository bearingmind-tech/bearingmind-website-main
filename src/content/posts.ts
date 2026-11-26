/* =====================================================================
   Built-in blog posts. Shown when Sanity is not connected, and copied
   into Sanity by `npm run seed`, after which they are edited in /studio.
   Every statistic is checked against the source listed with its post.
   ===================================================================== */
import type { Post } from "./types";
import { homeDefaults, siteDefaults } from "./defaults";

/* ---------- A tiny writer for Portable Text (Sanity's rich-text format) ----------
   Each string is one block:
     "## Heading"  "### Subheading"  "> Quote"  "- Bullet"  "1. Numbered"  else a paragraph.
   Inline: **bold**  and  [link text](/path or https://…)                              */
type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string };
type Block = { _type: "block"; _key: string; style: string; markDefs: MarkDef[]; children: Span[]; listItem?: "bullet" | "number"; level?: number };

function inline(text: string, key: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  const push = (t: string, marks: string[] = []) => t && children.push({ _type: "span", _key: `${key}s${n++}`, text: t, marks });
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1]) push(m[1], ["strong"]);
    else {
      const id = `${key}l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: id, href: m[3] });
      push(m[2], [id]);
    }
    last = re.lastIndex;
  }
  push(text.slice(last));
  return { children, markDefs };
}

function pt(slug: string, lines: string[]): Block[] {
  return lines.map((raw, i) => {
    const key = `${slug.slice(0, 8)}${i}`;
    let style = "normal";
    let listItem: Block["listItem"];
    let text = raw;
    if (raw.startsWith("### ")) [style, text] = ["h3", raw.slice(4)];
    else if (raw.startsWith("## ")) [style, text] = ["h2", raw.slice(3)];
    else if (raw.startsWith("> ")) [style, text] = ["blockquote", raw.slice(2)];
    else if (raw.startsWith("- ")) [listItem, text] = ["bullet", raw.slice(2)];
    else if (/^\d+\. /.test(raw)) [listItem, text] = ["number", raw.replace(/^\d+\. /, "")];
    return { _type: "block", _key: key, style, ...inline(text, key), ...(listItem ? { listItem, level: 1 } : {}) };
  });
}

const author = {
  name: siteDefaults.founder.name,
  role: homeDefaults.about.role,
  bio: homeDefaults.about.intro,
  credentials: homeDefaults.about.credentials,
};

const CRISIS =
  "If you are having thoughts of harming yourself, please do not wait for an appointment. Call **Tele-MANAS on 14416** (free, 24 hours, in Indian languages) or go to the nearest hospital.";

/* =====================================================================
   1. Burnout and CBT: individual professionals
   ===================================================================== */
const burnout: Post = {
  kind: "blog",
  slug: "cbt-for-burnout-and-stress",
  title: "Burnout and stress at work: how CBT helps you recover your footing",
  seoTitle: "CBT for Burnout and Stress: A Practical Guide",
  seoDescription:
    "What burnout is, the early signs, and five CBT techniques that help working professionals manage stress. From a counselling psychologist in Bangalore.",
  excerpt:
    "Burnout is chronic work stress that has not been managed, not a personal weakness. Cognitive Behavioural Therapy (CBT) gives you practical tools to spot the thinking and habits that keep it going, and to change them.",
  publishedAt: "2026-11-17T09:00:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "Is burnout a medical diagnosis?",
      answer:
        "No. The World Health Organization classifies burnout in ICD-11 as an occupational phenomenon, not a medical condition. It describes chronic workplace stress that has not been successfully managed, marked by exhaustion, mental distance from your job and reduced effectiveness.",
    },
    {
      question: "Can CBT help with burnout?",
      answer:
        "Yes. CBT helps you notice the thoughts and habits that keep stress going, test them, and replace them with more useful ones. A meta-analysis of workplace stress programmes found that cognitive-behavioural approaches had larger effects than other types of intervention.",
    },
    {
      question: "How many CBT sessions does it take to feel better?",
      answer:
        "It varies, but many people notice clear progress within four sessions. At BearingMind, progress is measured with short standard questionnaires at the first and fourth sessions, so you can see the change yourself.",
    },
    {
      question: "Should I see a counsellor or a doctor for burnout?",
      answer:
        "Start with a doctor if you have physical symptoms, if low mood has lasted most days for two weeks or more, or if you are having thoughts of self-harm. For stress, burnout and work–life balance, a counsellor trained in CBT is a good place to begin, and can work alongside your doctor.",
    },
  ],
  sources: [
    { title: "World Health Organization: Burn-out an \"occupational phenomenon\", ICD-11 (2019)", url: "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases" },
    { title: "Richardson & Rothstein, Effects of occupational stress management intervention programs: a meta-analysis, Journal of Occupational Health Psychology (2008)", url: "https://doi.org/10.1037/1076-8998.13.1.69" },
    { title: "Scott et al., Improving sleep quality leads to better mental health: a meta-analysis of randomised controlled trials, Sleep Medicine Reviews (2021)", url: "https://doi.org/10.1016/j.smrv.2021.101556" },
    { title: "Noetel et al., Effect of exercise for depression: systematic review and network meta-analysis, BMJ (2024)", url: "https://doi.org/10.1136/bmj-2023-075847" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
  ],
};
burnout.body = pt(burnout.slug, [
  "**The short answer:** burnout is what happens when work stress runs for months without being managed. It is not a character flaw, and it is not the same as being tired. Cognitive Behavioural Therapy (CBT) is one of the best-studied ways to deal with it, because it works on the two things that keep stress going: how you read situations, and what you then do.",
  "## What is burnout?",
  "The World Health Organization defines burnout in its International Classification of Diseases (ICD-11) as a syndrome resulting from **chronic workplace stress that has not been successfully managed**. WHO describes three dimensions:",
  "- **Exhaustion:** feeling drained, with little energy left at the end of the day or the start of the week.",
  "- **Mental distance:** cynicism or negativity about your job, or a sense of just going through the motions.",
  "- **Reduced effectiveness:** feeling that your work is no longer as good, or that it no longer matters.",
  "WHO is careful to say burnout is an **occupational phenomenon, not a medical condition**. That matters. It means the answer lies in how you work and how you handle pressure, not in a label.",
  "## Early signs that are easy to miss",
  "People who burn out are often the ones who look most capable from the outside. The early signs tend to be quiet:",
  "- Sunday evenings that feel heavy, every week.",
  "- Sleep that does not refresh you, or lying awake replaying the day.",
  "- Irritability at home over small things.",
  "- Putting off tasks you once did easily, then working late to catch up.",
  "- Needing more caffeine, screens or alcohol to switch on or switch off.",
  "- A growing feeling that nothing you do is enough.",
  "If several of these sound familiar and have lasted for weeks, it is worth acting now rather than waiting for a holiday to fix it. Holidays help for a while; the patterns usually come back with you.",
  "## How CBT helps with burnout",
  "CBT starts from a simple idea: **situations, thoughts, feelings and actions are linked**. A demanding boss is a situation. The thought \"if I say no, they will think I can't cope\" leads to anxiety, which leads to saying yes to everything, which leads to more pressure. Change one link and the chain loosens.",
  "This is not positive thinking. CBT asks you to test your thoughts against the evidence, the way you would test any assumption at work. The research supports it: a meta-analysis of workplace stress management programmes found that **cognitive-behavioural approaches produced larger effects than other kinds of intervention** (Richardson & Rothstein, 2008).",
  "## Five CBT techniques you can start this week",
  "### 1. Keep a thought record",
  "When you feel a spike of stress, write down three things: the situation, the thought that went through your mind, and how strongly you believed it (0–100%). Later, ask: what is the evidence for this thought? Against it? What would I tell a colleague who thought this? Most people find their stress thoughts are predictions, not facts.",
  "### 2. Name the thinking traps",
  "A few patterns turn up again and again in high performers:",
  "- **All-or-nothing:** \"If this presentation isn't perfect, it's a failure.\"",
  "- **Mind-reading:** \"They didn't reply, so they're unhappy with my work.\"",
  "- **Should statements:** \"I should be able to handle all of this.\"",
  "- **Catastrophising:** \"If this deal slips, my career is over.\"",
  "Simply naming the trap (\"that's mind-reading\") puts a little distance between you and the thought.",
  "### 3. Plan recovery, not just work",
  "Burnout narrows life down to work and recovering from work. Behavioural activation, a core CBT tool, reverses this on purpose: schedule two or three small activities each week that give you either a sense of **pleasure** or a sense of **mastery**, and treat them like meetings you cannot cancel.",
  "### 4. Protect sleep and movement",
  "These are not extras. A meta-analysis of randomised trials found that **improving sleep quality led to measurable improvements in depression, anxiety and stress** (Scott et al., 2021). Another found that walking, jogging, yoga and strength training each reduced symptoms of depression (Noetel et al., 2024). Start small: a fixed wake-up time, and a twenty-minute walk most days.",
  "### 5. Practise one boundary at a time",
  "Pick one specific, low-risk boundary, such as not answering non-urgent messages after 9 pm. Predict what you fear will happen, try it for two weeks, then compare the prediction with what actually happened. This is a behavioural experiment, and it is often the turning point.",
  "## When to get professional support",
  "Self-help works best for early stress. Consider working with a counsellor if:",
  "- the signs above have lasted more than a few weeks;",
  "- your sleep, relationships or performance are clearly suffering;",
  "- you have tried to change things on your own and keep slipping back.",
  "See a doctor or psychiatrist as well if low mood or loss of interest has been present most days for two weeks or more, or if you are relying on alcohol or medication to cope. Counselling and medical care work well together.",
  `> ${CRISIS}`,
  "## How we work with burnout at BearingMind",
  "Sessions are structured and goal-led. In the first session we agree on two or three clear goals. Progress is measured with brief, standard questionnaires at the **first and fourth sessions**, so you can see the change for yourself rather than take our word for it. You can read more about [our approach](/approach).",
  "For employed professionals, sessions run online on Google Meet from 4 to 5 PM or 5 to 6 PM, Monday to Friday, so they fit around your work. Senior leaders and public figures who prefer to talk away from the office can reserve a [private dinner consultation](/book/public-figures) at a luxury hotel in Bangalore. Everything you share is confidential, and we never confirm to your employer that you are a client without your written permission.",
  "Our counselling and coaching is not a substitute for clinical therapy or psychiatric treatment. If you are unsure where to start, our guide on [whether to see a counsellor, psychologist or psychiatrist](/blog/counsellor-psychologist-or-psychiatrist) may help.",
  "When you are ready, you can [book a session](/book) online.",
]);

/* =====================================================================
   2. Counsellor vs psychologist vs psychiatrist: decision question
   ===================================================================== */
const whoToSee: Post = {
  kind: "blog",
  slug: "counsellor-psychologist-or-psychiatrist",
  title: "Counsellor, psychologist or psychiatrist: who should you see?",
  seoTitle: "Counsellor, Psychologist or Psychiatrist?",
  seoDescription:
    "The difference between a counsellor, a clinical psychologist and a psychiatrist in India, and how to choose the right one for stress, anxiety or low mood.",
  excerpt:
    "Psychiatrists are medical doctors who diagnose and prescribe. Clinical psychologists assess and treat mental illness with therapy. Counsellors help with life, work and relationship difficulties. Here is how to decide where to start.",
  publishedAt: "2026-11-17T09:10:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "What is the difference between a psychologist and a psychiatrist?",
      answer:
        "A psychiatrist is a medical doctor (MBBS plus a postgraduate degree in psychiatry) who can diagnose mental illness and prescribe medication. A psychologist is not a medical doctor and does not prescribe. Psychologists use assessment and talking therapies such as CBT.",
    },
    {
      question: "Can a counsellor diagnose depression or anxiety?",
      answer:
        "No. Diagnosis is done by a psychiatrist or a clinical psychologist. A counsellor works on difficulties such as stress, relationships, work and life transitions, and refers you on if a clinical assessment is needed.",
    },
    {
      question: "Who should I see first for stress or anxiety?",
      answer:
        "For everyday stress, work pressure or relationship strain, a counsellor trained in CBT is a sensible first step. If symptoms are severe, have lasted most days for two weeks or more, or stop you functioning, see a doctor or psychiatrist first.",
    },
    {
      question: "Who regulates psychologists in India?",
      answer:
        "Under the Mental Healthcare Act, 2017, a clinical psychologist must be registered with the Rehabilitation Council of India (RCI). Other psychology and counselling professionals are covered by the National Commission for Allied and Healthcare Professions Act, 2021.",
    },
    {
      question: "Is there a free mental health helpline in India?",
      answer:
        "Yes. Tele-MANAS, run by the Government of India, offers free mental health support 24 hours a day in several Indian languages. Call 14416 or 1-800-891-4416.",
    },
  ],
  sources: [
    { title: "The Mental Healthcare Act, 2017, Government of India (definitions of clinical psychologist and psychiatrist, section 2)" },
    { title: "The National Commission for Allied and Healthcare Professions Act, 2021, Government of India" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
    { title: "Cuijpers et al., Cognitive behavior therapy vs. control conditions, other psychotherapies, pharmacotherapies and combined treatment for depression, World Psychiatry (2023)", url: "https://doi.org/10.1002/wps.21069" },
    { title: "Carlbring et al., Internet-based vs. face-to-face cognitive behavior therapy: an updated systematic review and meta-analysis, Cognitive Behaviour Therapy (2018)", url: "https://doi.org/10.1080/16506073.2017.1401115" },
  ],
};
whoToSee.body = pt(whoToSee.slug, [
  "**The short answer:** see a **psychiatrist** if you may need a diagnosis or medication, or if symptoms are severe. See a **clinical psychologist** for assessment and structured therapy for a mental health condition. See a **counsellor** for stress, work, relationship and life difficulties, where the goal is to cope better and grow. When in doubt, start with any of them: a good professional will tell you if someone else is better placed to help.",
  "## The three roles at a glance",
  "### Psychiatrist",
  "A psychiatrist is a **medical doctor** with an MBBS and a postgraduate qualification in psychiatry. Psychiatrists diagnose mental illness, **prescribe medication**, and manage conditions such as severe depression, bipolar disorder, psychosis and addiction. Appointments often focus on symptoms and treatment, and may be shorter than therapy sessions.",
  "### Clinical psychologist",
  "A clinical psychologist is trained to **assess and diagnose** mental health conditions and treat them with talking therapies. In India, the Mental Healthcare Act, 2017 requires a clinical psychologist to be **registered with the Rehabilitation Council of India (RCI)**. Clinical psychologists do not prescribe medication.",
  "### Counsellor or counselling psychologist",
  "A counsellor works with people who are functioning but struggling: stress, burnout, anxiety about work, low confidence, relationship strain, family conflict, life transitions. The work is **non-clinical**. It does not involve diagnosis or medication, and focuses on goals, skills and change. Counselling and other allied psychology professions in India come under the National Commission for Allied and Healthcare Professions Act, 2021.",
  "## Which one do you need?",
  "Ask yourself these questions, in order:",
  "1. **Are you in danger, or thinking about harming yourself?** Call Tele-MANAS on 14416 or go to a hospital now. Do not wait for an appointment.",
  "2. **Are you unable to function?** For example, you cannot get out of bed, work, eat or sleep for days at a time; you hear or see things others do not; or you are dependent on alcohol or drugs. Start with a **psychiatrist**.",
  "3. **Have low mood, worry or loss of interest been present most days for two weeks or more?** See a doctor, psychiatrist or clinical psychologist for an assessment. Therapy, medication or both may help.",
  "4. **Are you coping, but stressed, stuck or unhappy?** Work pressure, burnout, a difficult boss, conflict at home, a big decision, or wanting to perform better. A **counsellor** trained in a structured method such as CBT is a good place to start.",
  "## Can they work together?",
  "Yes, and often they should. Research shows that for depression, **CBT is about as effective as antidepressants, and combining the two works better than either alone** (Cuijpers et al., 2023). A common arrangement is a psychiatrist managing medication while a psychologist or counsellor works on thinking patterns, habits and relationships.",
  "## What about online sessions?",
  "Online sessions are a real option, not a second-best one. A systematic review found that **internet-based CBT worked about as well as face-to-face CBT** for anxiety, depression and several other difficulties (Carlbring et al., 2018). For busy professionals, a phone or video session in the evening is often what makes regular sessions possible.",
  "## Questions to ask before you book",
  "- What is your qualification, and where are you registered?",
  "- What method do you use, and is it evidence-based?",
  "- How will we know if it is working?",
  "- How is my information kept confidential, and who can see it?",
  "- What happens if you think I need a psychiatrist?",
  "A good professional will answer all of these directly.",
  `> ${CRISIS}`,
  "## Where BearingMind fits",
  "BearingMind offers **non-clinical, CBT-based counselling and coaching** for leaders, professionals, couples and families, in Bangalore and online. We do not diagnose or prescribe. For concerns such as depression, OCD or addiction, we work alongside your doctor or psychiatrist, or refer you to one. You can read more [about our chief counselling psychologist](/about) and [what we work on](/approach).",
  "Answers to the questions people ask most, from languages to confidentiality, are on our [questions page](/faq). If you are ready to start, you can [book a session](/book).",
]);

/* =====================================================================
   3. WHO guidelines for managers: organisations / HR
   ===================================================================== */
const managers: Post = {
  kind: "blog",
  slug: "mental-health-training-for-managers-who-guidelines",
  title: "Mental health at work: what WHO asks of managers, and how to put it into practice",
  seoTitle: "Mental Health Training for Managers: WHO Guide",
  seoDescription:
    "WHO recommends mental health training for managers. What the 2022 guidelines say, what training covers, and how Indian employers can put it into practice.",
  excerpt:
    "The World Health Organization recommends that organisations train managers to recognise and respond to staff in distress. Here is what the guidelines say, why it matters for performance, and a practical plan for HR and leadership teams.",
  publishedAt: "2026-11-17T09:20:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "What does WHO recommend for mental health at work?",
      answer:
        "The WHO Guidelines on Mental Health at Work (2022) make recommendations in five areas: organisational interventions to reduce risks, training for managers, training for workers, individual interventions, and support for returning to and gaining work.",
    },
    {
      question: "Why should managers be trained in mental health?",
      answer:
        "WHO recommends manager training because it helps managers recognise and respond to staff experiencing emotional distress, builds skills like open communication and active listening, and improves understanding of how job stressors affect mental health.",
    },
    {
      question: "How much does poor mental health cost employers?",
      answer:
        "WHO estimates that 12 billion working days are lost every year to depression and anxiety worldwide, at a cost of US$1 trillion per year in lost productivity.",
    },
    {
      question: "Are managers expected to act as counsellors?",
      answer:
        "No. Training teaches managers to notice signs of distress, have a supportive conversation, adjust work where reasonable, and point people to professional help. It does not ask them to diagnose or treat anyone.",
    },
  ],
  sources: [
    { title: "World Health Organization, Guidelines on mental health at work (2022)", url: "https://www.who.int/publications/i/item/9789240053052" },
    { title: "WHO and International Labour Organization, Mental health at work: policy brief (2022)", url: "https://www.who.int/publications/i/item/9789240057944" },
    { title: "World Health Organization, Mental health at work: fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work" },
    { title: "Richardson & Rothstein, Effects of occupational stress management intervention programs: a meta-analysis, Journal of Occupational Health Psychology (2008)", url: "https://doi.org/10.1037/1076-8998.13.1.69" },
  ],
};
managers.body = pt(managers.slug, [
  "**The short answer:** in 2022 the World Health Organization published its first global guidelines on mental health at work. One of its clearest recommendations is **mental health training for managers**, so they can recognise and respond to staff in distress. For employers, this is no longer a nice-to-have: it is the global standard for a healthy workplace, and it directly affects performance.",
  "## Why this matters to the business",
  "WHO's figures are hard to ignore. According to WHO:",
  "- an estimated **16% of working-age adults** had a mental disorder in 2023;",
  "- around **12 billion working days** are lost every year to depression and anxiety;",
  "- this costs the global economy about **US$1 trillion a year** in lost productivity.",
  "Most of that cost is invisible on a balance sheet. It shows up as presenteeism, slower decisions, conflict in teams, and good people leaving. WHO also lists the risks that drive it: excessive workloads, low job control, job insecurity, poor management practices, and harassment.",
  "## What the WHO guidelines recommend",
  "The WHO Guidelines on Mental Health at Work make recommendations in five areas:",
  "1. **Organisational interventions:** assess and reduce risks in how work is designed, for example flexible working arrangements and clear frameworks for dealing with violence and harassment.",
  "2. **Manager training:** help managers recognise and respond to supervisees in emotional distress.",
  "3. **Worker training:** improve mental health literacy and awareness, and reduce stigma.",
  "4. **Individual interventions:** build skills to manage stress and reduce symptoms, such as psychosocial interventions and physical activity.",
  "5. **Returning to and gaining work:** reasonable accommodations, phased returns, and support for people with mental health conditions to get into and stay in work.",
  "WHO and the International Labour Organization (ILO) followed this with a joint **policy brief** that sets out what employers, governments and workers' organisations can do to put the recommendations into practice.",
  "## What good manager training covers",
  "WHO describes manager training as building three things:",
  "- the ability to **recognise and respond** to people experiencing emotional distress;",
  "- **interpersonal skills** such as open communication and active listening;",
  "- an understanding of **how job stressors affect mental health**, and how they can be managed.",
  "In practice, a good programme teaches a manager to notice a change in someone's behaviour, start a private and respectful conversation, listen without trying to fix or diagnose, agree reasonable adjustments to work, and point the person to professional help. **Managers are not being asked to become counsellors.** They are being asked to be the first person who notices and does not look away.",
  "## A practical plan for Indian employers",
  "### Start with leadership",
  "Culture follows the people at the top. When senior leaders talk openly about pressure and recovery, and are seen to use support themselves, others follow. Leadership mentoring is often the most effective first investment.",
  "### Train managers before rolling out programmes",
  "An employee assistance helpline is of little use if line managers do not know how to talk about it. Train the people who sit closest to the problem first.",
  "### Look at the work itself",
  "Training cannot fix a workload that is impossible. Review where risks sit: unrealistic deadlines, unclear roles, after-hours expectations, and teams with high attrition.",
  "### Make confidentiality absolute",
  "People will not seek help if they believe it will reach their appraisal. Any counselling arranged by the organisation must stay confidential, with no names reported back.",
  "### Measure before and after",
  "Use short, standard questionnaires before and after an intervention, and track indicators such as absence and attrition. What gets measured gets funded.",
  "## Does training actually work?",
  "Evidence for structured, skills-based approaches is strong. A meta-analysis of workplace stress management programmes found that **cognitive-behavioural interventions had larger effects than other types of programme** (Richardson & Rothstein, 2008). That is why our workshops are built on CBT tools that people can use the next morning, rather than on awareness talks alone.",
  "## How BearingMind works with organisations",
  "We understand work from both sides of the table: the employee's state of mind, the quiet slide into burnout, and management's expectations of performance. Our programmes are built on years in industry leadership roles, an engineering degree, an MBA, a Master's in Counselling Psychology, a doctorate in Human Resources, and membership of the American Psychological Association.",
  "- Leadership and executive mentoring",
  "- Manager training: mental health at work",
  "- Workshops on stress, burnout and resilience",
  "- MHFA (Mental Health First Aid) workshops for companies",
  "Our work is in line with WHO and ILO guidance. To discuss a programme for your team, [enquire for your organisation](/organisations). For individual staff, see [our guide to CBT for burnout and stress](/blog/cbt-for-burnout-and-stress).",
]);

/* =====================================================================
   4. Public figures: pressure, privacy and getting help discreetly
   ===================================================================== */
const publicFigures: Post = {
  kind: "blog",
  slug: "mental-health-for-public-figures",
  title: "Mental health in the public eye: pressure, privacy and getting help discreetly",
  seoTitle: "Mental Health for Public Figures and HNIs",
  seoDescription:
    "Why public figures and senior leaders delay getting help, the pressures of visibility, and how to find discreet, confidential counselling.",
  excerpt:
    "Visibility brings its own pressures: constant scrutiny, few people you can speak freely with, and a real fear of being seen asking for help. Here is what helps, and how to get support without the risk.",
  publishedAt: "2026-11-25T09:00:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "Can a public figure get counselling without anyone finding out?",
      answer:
        "Yes. Look for a counsellor who lets you book under any name, offers a confidentiality agreement, and meets somewhere discreet rather than a clinic waiting room. At BearingMind, sessions for public figures take place over a private dinner at a luxury hotel in Bangalore.",
    },
    {
      question: "Is it a sign of weakness for a leader to see a counsellor?",
      answer:
        "No. Many leaders use counselling the way they use any expert advisor: to think more clearly under pressure. Asking for help early is a sign of good judgement.",
    },
    {
      question: "Can my spouse attend with me?",
      answer: "Yes. Public Figures sessions at BearingMind can be reserved for one person or as a couple.",
    },
    {
      question: "Is counselling the same as psychiatric treatment?",
      answer:
        "No. Counselling is non-clinical and does not involve diagnosis or medication. If you need clinical care, a good counsellor will work alongside your doctor or psychiatrist.",
    },
  ],
  sources: [
    { title: "World Health Organization, World mental health report: transforming mental health for all (2022)", url: "https://www.who.int/publications/i/item/9789240049338" },
    { title: "Richardson & Rothstein, Effects of occupational stress management intervention programs: a meta-analysis, Journal of Occupational Health Psychology (2008)", url: "https://doi.org/10.1037/1076-8998.13.1.69" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
  ],
};
publicFigures.body = pt(publicFigures.slug, [
  "**The short answer:** people in public life face the same mental health challenges as everyone else, plus a few that come with being visible. The biggest barrier is rarely willingness; it is the fear of being seen. Discreet, structured counselling removes that barrier.",
  "## Why people in the public eye delay getting help",
  "Mental health conditions are common. The World Health Organization estimates that **one in eight people worldwide lives with a mental disorder** (WHO, 2022). Fame, wealth and success do not change that number. What they change is the cost of asking for help:",
  "- **Being recognised** in a clinic, a waiting room or a car park.",
  "- **Reputation risk:** worry that a board, investors, sponsors or the media will read it as weakness.",
  "- **Trust:** wondering whether the person across the table will keep what you say to themselves.",
  "- **Time:** schedules that leave no room for a weekly appointment across town.",
  "So people wait. They manage with long hours, alcohol, sleep aids or simply pushing through, until the strain shows up in their health, their family or their decisions.",
  "## The pressures that come with visibility",
  "### Constant scrutiny",
  "Every decision, word and photograph can be judged by people you will never meet. Over time, many people start performing all the time, even at home, and lose the sense of where the public role ends and they begin.",
  "### Isolation at the top",
  "The higher you rise, the fewer people can speak to you as an equal. Colleagues report to you, others want something from you, and friends may not understand the pressure. Many leaders describe feeling surrounded but alone.",
  "### Decisions with heavy consequences",
  "When livelihoods, investments or reputations ride on your choices, the mind rarely switches off. Rumination at night and second-guessing by day are common, and both drain the clarity good decisions need.",
  "### Strain on relationships and family",
  "Travel, irregular hours and public attention land on spouses and children too. In business families, questions of succession and harmony add another layer.",
  "## What actually helps",
  "Cognitive Behavioural Therapy (CBT) is well suited to people who like practical tools. It works on the link between how you read a situation, how you feel, and what you then do. Research on workplace stress programmes found that **cognitive-behavioural approaches had larger effects than other types of intervention** (Richardson & Rothstein, 2008). In practice, that looks like:",
  "- **Separating facts from forecasts.** \"The deal might fall through, and everyone will say I failed\" is a forecast. Writing down the evidence for and against it turns a spiral into a plan.",
  "- **Reading criticism differently.** Not every comment needs a response, and not every critic is right. CBT helps you decide which feedback is useful, and let the rest go.",
  "- **Protecting recovery time.** Short, non-negotiable routines for sleep, movement and time with family work better than waiting for a holiday.",
  "- **A space where you are not performing.** Simply having one hour a week where you do not have to be \"on\" is, for many, the first relief.",
  "## How to choose a counsellor when privacy matters",
  "Before you book, ask:",
  "1. **Can I use any name I like?** You should not have to share more than is needed.",
  "2. **Will you sign a confidentiality agreement?** A professional will not hesitate.",
  "3. **Where do we meet?** A discreet setting matters as much as the conversation.",
  "4. **How is my data handled?** In India, personal data is protected under the Digital Personal Data Protection Act, 2023. Ask how notes are stored and who can see them.",
  "5. **What are your qualifications?** Look for formal training in counselling psychology and a clear, structured approach such as CBT.",
  "## How BearingMind works with public figures",
  "Sessions take place over a **private dinner at a luxury hotel in Bangalore**, from 7:30 PM, Monday to Friday (90 minutes, or 120 minutes for a couple), in a setting that looks like any other business evening. You may book for yourself or as a couple, under any name you prefer, and a confidentiality agreement is available before you meet. The hotel is shared privately once your reservation is confirmed.",
  "Sessions are led by M H Sharieff, PhD, Chief Counselling Psychologist, who has mentored senior executives at a multinational since 2017. Read more about [counselling for public figures](/counselling-for-public-figures), or [reserve an evening](/book/public-figures).",
  "Our counselling and coaching is not a substitute for clinical therapy or psychiatric treatment.",
  `> ${CRISIS}`,
]);

/* =====================================================================
   5. Online counselling for working professionals
   ===================================================================== */
const onlineProfessionals: Post = {
  kind: "blog",
  slug: "online-counselling-for-working-professionals",
  title: "Online counselling for working professionals: does it work, and how to choose",
  seoTitle: "Online Counselling for Professionals in India",
  seoDescription:
    "Does online counselling work as well as in person? What research says, signs you could benefit, and how to choose a counsellor in India.",
  excerpt:
    "Online counselling lets busy professionals get support without losing half a day to travel. Research shows online CBT works about as well as face-to-face CBT. Here is how to choose a counsellor and get the most from your sessions.",
  publishedAt: "2026-11-25T09:10:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "Is online counselling as effective as in-person counselling?",
      answer:
        "For many common concerns, yes. A systematic review and meta-analysis found that internet-based CBT works about as well as face-to-face CBT for anxiety and depression (Carlbring et al., 2018).",
    },
    {
      question: "Will my employer find out I am seeing a counsellor?",
      answer:
        "Not from a professional counsellor. At BearingMind, we never confirm to anyone that you are a client without your written permission, including when your organisation arranges the sessions. Using a personal device and email adds another layer of privacy.",
    },
    {
      question: "What do I need for an online session?",
      answer: "A private, quiet room, headphones, a stable internet connection, and a laptop or phone that can run Google Meet.",
    },
    {
      question: "How do I check a counsellor's qualifications in India?",
      answer:
        "Ask about their training in counselling psychology and the approach they use. Allied and healthcare professionals in India, including psychologists, are being registered under the National Commission for Allied and Healthcare Professions (NCAHP) Act, 2021.",
    },
  ],
  sources: [
    { title: "Carlbring et al., Internet-based vs. face-to-face cognitive behavior therapy: an updated systematic review and meta-analysis, Cognitive Behaviour Therapy (2018)", url: "https://doi.org/10.1080/16506073.2017.1401115" },
    { title: "World Health Organization, Mental health at work: fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work" },
    { title: "The National Commission for Allied and Healthcare Professions Act, 2021, Government of India" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
  ],
};
onlineProfessionals.body = pt(onlineProfessionals.slug, [
  "**The short answer:** yes, online counselling works. For anxiety and depression, research shows **online CBT is about as effective as face-to-face CBT** (Carlbring et al., 2018). For working professionals, it also removes the two biggest obstacles to getting help: time and being seen.",
  "## Why professionals put off getting help",
  "Most people who need support at work are not in crisis. They are functioning, often well, but running on stress. The usual reasons for waiting are practical:",
  "- A commute to an appointment can turn one hour into three.",
  "- Taking time off raises questions at work.",
  "- It never feels serious enough to justify the effort.",
  "Meanwhile, the stress compounds. The World Health Organization notes that poor working environments, including excessive workloads and job insecurity, pose a risk to mental health, and that depression and anxiety cost the global economy around a trillion US dollars a year in lost productivity.",
  "## Signs you could benefit from counselling",
  "Consider talking to someone if, for several weeks:",
  "- you dread the start of the working week;",
  "- you lie awake replaying meetings or planning the next day;",
  "- small things at home make you irritable;",
  "- you have lost the sense of direction you once had in your career;",
  "- office politics or a difficult manager are taking up more of your head than your actual work;",
  "- you need more coffee, screens or alcohol to switch on or off.",
  "None of these means something is wrong with you. They are signals that the way you are handling pressure needs an update.",
  "## Online or in person?",
  "Both work. Online sessions suit you if your schedule is tight, you travel or work from different cities, or you would rather not be seen walking into a counsellor's office. In-person sessions may suit you better if you find it hard to switch off at home or prefer a change of setting.",
  "## How to choose a counsellor",
  "1. **Training and approach.** Ask what they trained in and how they work. A structured approach such as Cognitive Behavioural Therapy (CBT) gives you practical tools, not just a place to talk.",
  "2. **Registration.** In India, allied and healthcare professionals, including psychologists, are being registered under the National Commission for Allied and Healthcare Professions (NCAHP) Act, 2021. Ask whether your counsellor is registered.",
  "3. **Confidentiality.** Ask directly: who will know I am a client? The answer should be no one, without your written permission.",
  "4. **Goals and measurement.** A good counsellor agrees clear goals with you and checks progress, rather than leaving sessions open-ended.",
  "5. **Fit.** You should feel heard, not judged. It is fine to change counsellor if the fit is wrong.",
  "## How to prepare for your first online session",
  "- **Find a private space.** A closed room where you will not be overheard matters more than a perfect background. Some people take sessions from a parked car.",
  "- **Use headphones** for privacy and better sound.",
  "- **Check your connection** and test Google Meet a few minutes before.",
  "- **Use a personal device and email** if you want to keep work systems out of it.",
  "- **Think about two or three things** you would like to be different in three months. You do not need to have it all worked out.",
  "## What happens in the first session",
  "You talk about what brings you, agree two or three clear goals, and decide how you will measure progress. There is no diagnosis and no judgement. Many people see clear progress within four sessions.",
  "## Online counselling at BearingMind",
  "Sessions for employed professionals are held online on Google Meet, from **4 to 5 PM or 5 to 6 PM, Monday to Friday**, so you can join from anywhere in Bangalore or anywhere in India. Sessions are in English, Kannada or Hindi, with working Tamil. Progress is measured with brief, standard questionnaires at the first and fourth sessions, so you can see the change yourself.",
  "Read more about [online counselling for working professionals](/counselling-for-working-professionals), our guide to [CBT for burnout and stress](/blog/cbt-for-burnout-and-stress), or [book a session](/book/employed-professionals).",
  `> ${CRISIS}`,
]);

/* =====================================================================
   6. Homemakers: stress and mental health
   ===================================================================== */
const homemakers: Post = {
  kind: "blog",
  slug: "stress-and-mental-health-for-homemakers",
  title: "Stress and mental health for homemakers: the invisible load, and what helps",
  seoTitle: "Stress and Mental Health for Homemakers",
  seoDescription:
    "Why homemakers often feel stressed, unseen and exhausted, the signs to watch for, practical CBT steps to try at home, and when counselling can help.",
  excerpt:
    "Running a home is real, demanding work, and much of it goes unseen. Here is why homemakers so often feel stretched thin, the signs to watch for, and practical steps that help.",
  publishedAt: "2026-11-25T09:20:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "Is it normal for a homemaker to feel stressed or low?",
      answer:
        "Yes, it is common. Running a home involves long hours, constant responsibility and little recognition. Feeling stressed is not a failing; it is a signal that something needs to change.",
    },
    {
      question: "Can I have counselling in Kannada or Hindi?",
      answer: "At BearingMind, yes. Sessions are in English, Kannada or Hindi, with working Tamil.",
    },
    {
      question: "Will my family know I am seeing a counsellor?",
      answer:
        "Not from us. We never confirm to anyone that you are a client without your written permission. You may also book under any name you prefer.",
    },
    {
      question: "Can I have counselling from home?",
      answer: "Yes. Homemakers sessions at BearingMind can be online on Google Meet or in person in Bangalore, on Saturday afternoons.",
    },
  ],
  sources: [
    { title: "World Health Organization, Depression: fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/depression" },
    { title: "Scott et al., Improving sleep quality leads to better mental health: a meta-analysis of randomised controlled trials, Sleep Medicine Reviews (2021)", url: "https://doi.org/10.1016/j.smrv.2021.101556" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
  ],
};
homemakers.body = pt(homemakers.slug, [
  "**The short answer:** running a home is demanding, continuous work, and much of it is invisible. Feeling stressed, tired or low is common and understandable. Small, practical changes help, and counselling can give you a space that is finally just for you.",
  "## The invisible load",
  "Cooking, cleaning and school runs are the visible part. The heavier part is often the thinking: remembering who needs what, planning meals, managing relatives, keeping the peace, worrying about children and elders. This mental load rarely stops, has no weekends and is seldom thanked.",
  "Many homemakers also carry quieter pressures:",
  "- **Little time for yourself,** and guilt when you take it.",
  "- **Isolation,** especially after moving cities or once children start school.",
  "- **Lack of recognition,** as if the work does not count because it is unpaid.",
  "- **Family expectations** from in-laws, a spouse or the wider family.",
  "- **Loss of identity,** particularly for women who left a career, or when children grow up and leave home.",
  "Depression is common worldwide, and the World Health Organization notes it is **about 50% more common among women than among men**. That is not a reason to worry, but it is a reason to take your own wellbeing as seriously as everyone else's.",
  "## Signs to watch for",
  "Consider getting support if, for a few weeks or more:",
  "- you feel tired even after rest;",
  "- you snap at people you love, then feel guilty;",
  "- you feel nobody notices what you do;",
  "- you have stopped doing things you used to enjoy;",
  "- you lie awake worrying, or wake up already exhausted;",
  "- you feel you have lost yourself in everyone else's needs.",
  "## Practical steps you can start this week",
  "These come from Cognitive Behavioural Therapy (CBT), a practical approach that looks at how thoughts, feelings and actions are linked.",
  "### 1. Catch the \"should\" thoughts",
  "\"I should be able to manage everything.\" \"A good mother never feels like this.\" Write these thoughts down when they come. Then ask: would I say this to a friend in my position? Usually the answer is no, and that is a sign the thought is too harsh.",
  "### 2. Schedule time that is yours",
  "Plan two or three small things a week that give you pleasure or a sense of achievement: a walk, a call with a friend, reading, a class. Put them on the calendar like any other commitment, and protect them.",
  "### 3. Share the load out loud",
  "Much of the mental load is invisible because it lives in one head. Write down everything you keep track of for a week, and share the list with your family. Ask for one or two specific things to be taken over, not general \"help\".",
  "### 4. Protect your sleep",
  "Sleep is often the first thing homemakers give up. A meta-analysis of randomised trials found that **improving sleep quality led to measurable improvements in depression, anxiety and stress** (Scott et al., 2021). A regular bedtime and a phone-free last half-hour are good places to start.",
  "### 5. Say it calmly, say it early",
  "Resentment builds when needs go unspoken. Try a simple pattern: \"When ___ happens, I feel ___. What would help is ___.\" It keeps conversations about the problem, not about blame.",
  "## When to talk to someone",
  "If these steps do not shift things after a few weeks, or if low mood, worry or tiredness are affecting your days, counselling can help. It is a private, judgement-free hour to understand what you are feeling and find practical ways forward. Please see a doctor as well if low mood has lasted most days for two weeks or more.",
  "## Counselling for homemakers at BearingMind",
  "Sessions are held on **Saturday afternoons at 2, 3 or 4 PM**, online on Google Meet or in person in Bangalore, in English, Kannada or Hindi, with working Tamil. What you share stays between us, and you may book under any name you prefer.",
  "Read more about [counselling for homemakers](/counselling-for-homemakers), or [book a session](/book/homemakers).",
  `> ${CRISIS}`,
]);

/* =====================================================================
   7. Children: signs a child may need counselling
   ===================================================================== */
const children: Post = {
  kind: "blog",
  slug: "does-my-child-need-counselling",
  title: "Does my child need counselling? Signs parents should not ignore",
  seoTitle: "Does My Child Need Counselling? Signs for Parents",
  seoDescription:
    "How to tell ordinary ups and downs from signs a child needs support, how to talk to your child, what child counselling with parents involves, and when to act.",
  excerpt:
    "All children have hard days. Here is how to tell ordinary ups and downs from signs that your child may need support, how to start the conversation, and what counselling with a parent involves.",
  publishedAt: "2026-11-25T09:30:00+05:30",
  author,
  body: [],
  faqs: [
    {
      question: "At what age can a child start counselling?",
      answer:
        "Children of many ages can benefit. With younger children, sessions rely more on play and on working with parents; with older children and teenagers, they talk more directly. A consultant who specialises in children will adapt to your child's age.",
    },
    {
      question: "Do parents attend child counselling sessions?",
      answer:
        "Often, yes. At BearingMind, a parent or guardian makes the booking and takes part in Children with Parents sessions, so progress continues at home.",
    },
    {
      question: "Will counselling label my child?",
      answer:
        "Counselling at BearingMind is non-clinical and does not involve diagnosis. If a child needs clinical assessment, we work alongside your paediatrician or a child psychiatrist, or refer you to one.",
    },
    {
      question: "How much screen time is too much?",
      answer:
        "There is no single safe number, but the US Surgeon General's 2023 advisory reported that adolescents who spend more than three hours a day on social media face double the risk of symptoms of depression and anxiety.",
    },
  ],
  sources: [
    { title: "World Health Organization, Mental health of adolescents: fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health" },
    { title: "US Surgeon General, Social Media and Youth Mental Health: advisory (2023)", url: "https://www.hhs.gov/surgeongeneral/reports-and-publications/youth-mental-health/social-media/index.html" },
    { title: "Tele-MANAS, Ministry of Health and Family Welfare, Government of India", url: "https://telemanas.mohfw.gov.in/" },
  ],
};
children.body = pt(children.slug, [
  "**The short answer:** every child has difficult days. It is worth seeking support when a change in mood or behaviour lasts for weeks, is more intense than usual, or gets in the way of school, friendships, sleep or family life. Acting early is easier than waiting for it to pass.",
  "## Why it is worth paying attention",
  "Mental health difficulties often begin young. The World Health Organization estimates that **one in seven 10 to 19 year-olds worldwide experiences a mental disorder**, and that half of all mental health conditions start by age 14, most of them undetected and untreated. Children rarely say \"I need help\". They show it.",
  "## Ordinary ups and downs, or something more?",
  "Three questions help separate the two:",
  "1. **How long?** A bad week is normal. A change that lasts a month or more deserves attention.",
  "2. **How strong?** Is the worry, anger or sadness much bigger than the situation calls for?",
  "3. **How much does it get in the way?** Is it affecting school, sleep, eating, friendships or family life?",
  "## Signs parents should not ignore",
  "- **Worry and fear:** stomach aches before school, refusing to go, needing constant reassurance.",
  "- **Anger and behaviour:** frequent outbursts, tantrums beyond their age, aggression, or trouble at school.",
  "- **Low mood:** seeming sad or flat, losing interest in things they loved, withdrawing from friends.",
  "- **Sleep and eating:** trouble falling asleep, nightmares, or a clear change in appetite.",
  "- **Screens:** distress when devices are taken away, or screens crowding out sleep, homework and friends. The US Surgeon General's 2023 advisory reported that **adolescents spending more than three hours a day on social media face double the risk of depression and anxiety symptoms**.",
  "- **After a big change:** a move, a new sibling, a death in the family, or parents separating can unsettle even very secure children.",
  "## How to talk to your child",
  "- **Pick a calm moment,** side by side rather than face to face: in the car, on a walk, while cooking.",
  "- **Describe, don't diagnose:** \"I've noticed you seem worried before school\" works better than \"What's wrong with you?\"",
  "- **Listen more than you advise.** Repeat back what you hear so they know you understood.",
  "- **Keep it ordinary.** \"Lots of people talk to someone when things feel hard. It helps.\"",
  "## What child counselling with parents involves",
  "Good child counselling does not happen to a child in isolation. The counsellor gets to know your child, often through conversation, play or drawing for younger children, and works with you as a parent so you understand what is going on and how to respond in ways that help. That way, progress continues between sessions, at home.",
  "Counselling is not about finding fault with parents. It is about giving your child, and you, practical tools for a difficult patch.",
  "## When to seek help urgently",
  "Contact a doctor promptly if your child talks about harming themselves, stops eating, is not sleeping for days, or seems very withdrawn or confused.",
  `> ${CRISIS}`,
  "## Children with Parents sessions at BearingMind",
  "Sessions are led by a BearingMind associate consultant who **specialises in children's counselling**, with a parent or guardian taking part. They are held on **Sunday mornings at 8, 9 or 10 AM**, online on Google Meet or in person in Bangalore. Our work is non-clinical; where a child needs clinical care, we work alongside your paediatrician or a child psychiatrist.",
  "Read more about [child counselling with parents](/child-counselling-bangalore), or [book a session](/book/children).",
]);

export const defaultPosts: Post[] = [children, homemakers, onlineProfessionals, publicFigures, managers, whoToSee, burnout];
