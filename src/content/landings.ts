/* Landing pages, one per plan. Built-in text, used until edited in the Studio
   (Landing pages). Facts here must match the plan's booking settings. */
import type { LandingPage } from "./types";

export const defaultLandings: LandingPage[] = [
  {
    plan: "dining",
    slug: "counselling-for-public-figures",
    readMore: { label: "Mental health in the public eye: pressure, privacy and getting help discreetly", href: "/blog/mental-health-for-public-figures" },
    title: "Private counselling for public figures in Bangalore",
    sub: "Discreet one-to-one counselling and coaching for celebrities, HNIs and business leaders, over dinner at a luxury hotel.",
    seoTitle: "Counselling for Celebrities & HNIs in Bangalore",
    seoDescription:
      "Discreet, confidential counselling and executive coaching for celebrities, HNIs and public figures in Bangalore, held over a private dinner at a luxury hotel.",
    intro: [
      "When your name is known, asking for help carries a cost most people never think about: being seen walking into a clinic, a waiting room, an appointment that could be talked about. BearingMind removes that cost. Your session takes place over a quiet dinner at a luxury hotel in Bangalore, in a setting that looks like any other business evening.",
      "The work itself is serious and structured. Sessions use Cognitive Behavioural Therapy (CBT) tools to help you notice the thought patterns that drive pressure, test them, and build habits that hold when the stakes are high.",
    ],
    sections: [
      {
        heading: "Who it is for",
        body: [
          "Celebrities, high-net-worth individuals, founders, senior executives and others in public life who want a confidential space to think clearly. You may book for yourself, or as a couple.",
        ],
        points: [
          "Pressure, scrutiny and decision fatigue",
          "Stress, burnout and sleep",
          "Relationships under the strain of public life",
          "Business-family harmony and succession",
          "Vision setting and personal direction",
        ],
      },
      {
        heading: "How a private evening works",
        body: [
          "Evenings begin at 7:30 PM, Monday to Friday, with dinner included: 90 minutes for one person, or 120 minutes for a couple. You choose an evening online and complete a short, confidential intake form so the conversation can start where it matters. The hotel is shared privately once your reservation is confirmed.",
          "Progress is goal-led: in the first session we agree two or three clear goals and how to measure them, and we review progress together by the fourth.",
        ],
      },
      {
        heading: "Discretion, built in",
        body: [
          "You may book under any name you are comfortable with. We never confirm to anyone that you are a client without your written permission, and a confidentiality agreement is available before we meet. Your details are handled in line with India's Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        heading: "Your counsellor",
        body: [
          "Sessions are led by M H Sharieff, PhD, Chief Counselling Psychologist, who has mentored senior executives at a multinational since 2017. He holds a PhD in Human Resources, a Master's in Counselling Psychology and a Diploma in Community Mental Health from NIMHANS, and is a member of the American Psychological Association.",
        ],
      },
    ],
    faq: [
      {
        question: "Where do the sessions take place?",
        answer: "Over dinner at a luxury hotel in Bangalore. The venue is shared privately once your reservation is confirmed.",
      },
      {
        question: "Can my spouse join?",
        answer: "Yes. You can reserve the evening for one person (90 minutes) or as a couple (120 minutes).",
      },
      {
        question: "Can I sign a confidentiality agreement?",
        answer: "Yes. Tick the box when booking, or ask on phone or WhatsApp, and it is arranged before you meet.",
      },
      {
        question: "Is this therapy or coaching?",
        answer:
          "It is non-clinical counselling and coaching using CBT tools. It does not involve diagnosis or medication; where needed, we work alongside your doctor or psychiatrist.",
      },
    ],
  },
  {
    plan: "professional",
    slug: "counselling-for-working-professionals",
    readMore: { label: "Online counselling for working professionals: does it work, and how to choose", href: "/blog/online-counselling-for-working-professionals" },
    title: "Online counselling for working professionals",
    sub: "CBT-based sessions on Google Meet for stress, burnout and direction at work, at times that fit around your job.",
    seoTitle: "Online Counselling for Working Professionals in India",
    seoDescription:
      "Confidential online CBT counselling on Google Meet for working professionals: stress, burnout, work-life balance, office politics and career direction.",
    intro: [
      "Most professionals who come to BearingMind are doing well on paper. They are also tired, stretched, and running on habits that worked five years ago but no longer do. Online sessions give you a focused hour to change that, without leaving your desk or your home.",
      "Sessions are held on Google Meet from 4 to 5 PM or 5 to 6 PM, Monday to Friday, so you can join from anywhere in Bangalore or anywhere in India.",
    ],
    sections: [
      {
        heading: "What we work on",
        body: ["Cognitive Behavioural Therapy gives you practical tools: noticing unhelpful thought patterns, testing them, and building habits that hold under pressure."],
        points: [
          "Stress management and burnout",
          "Work-life balance",
          "Office politics and workplace bullying",
          "Peak daily performance and focus",
          "Anxiety, low mood and sleep",
          "Career direction and vision setting",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Choose a time online and pay in advance. Before your first session you fill in a short, confidential intake form, so the hour is well spent. Your Google Meet link arrives with your confirmation.",
          "Sessions are goal-led. Progress is measured with brief, standard questionnaires at the first and fourth sessions, so you can see the change yourself.",
        ],
      },
      {
        heading: "Your employer will not know",
        body: [
          "We never confirm to anyone that you are a client without your written permission, including when your organisation arranges the sessions. Everything you share is handled in line with India's Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        heading: "From anywhere in India",
        body: [
          "Because sessions are online, professionals join from across Bangalore, from Whitefield and Electronic City to Koramangala and Indiranagar, and from other cities including Mumbai, Delhi NCR, Hyderabad, Chennai and Pune. Sessions are in English, Kannada or Hindi, with working Tamil.",
        ],
      },
      {
        heading: "Your counsellor",
        body: [
          "Sessions are led by M H Sharieff, PhD, Chief Counselling Psychologist, who has mentored senior executives at a multinational since 2017. He holds a PhD in Human Resources, a Master's in Counselling Psychology and a Diploma in Community Mental Health from NIMHANS, and is a member of the American Psychological Association.",
        ],
      },
    ],
    faq: [
      {
        question: "Is online counselling as effective as meeting in person?",
        answer: "Research shows online CBT works about as well as face-to-face CBT for anxiety and depression (Carlbring et al., 2018).",
      },
      {
        question: "How many sessions will I need?",
        answer: "Many people see clear progress within four sessions, when we review it together. Some choose to continue from there.",
      },
      {
        question: "Can I join from outside Bangalore?",
        answer: "Yes. Sessions are on Google Meet, so you can join from anywhere.",
      },
      {
        question: "What if I need to cancel?",
        answer: "Your session is rescheduled to a later date of your choice.",
      },
    ],
  },
  {
    plan: "homemaker",
    slug: "counselling-for-homemakers",
    readMore: { label: "Stress and mental health for homemakers: the invisible load, and what helps", href: "/blog/stress-and-mental-health-for-homemakers" },
    title: "Counselling for homemakers in Bangalore and online",
    sub: "A calm, confidential hour set aside just for you, online or face-to-face, on Saturday afternoons.",
    seoTitle: "Counselling for Homemakers in Bangalore & Online",
    seoDescription:
      "Confidential CBT counselling for homemakers: stress, anxiety, relationships, family pressure and time for yourself. Online or in person in Bangalore, Saturdays.",
    intro: [
      "Running a home means carrying everyone else's needs, often with little time or space for your own. Counselling gives you an hour that belongs to you: to slow down, make sense of what you are feeling, and find practical ways forward.",
      "Sessions are held on Saturday afternoons, at 2, 3 or 4 PM. You choose whether to meet online on Google Meet or in person in Bangalore.",
    ],
    sections: [
      {
        heading: "What we work on",
        body: ["Sessions use Cognitive Behavioural Therapy (CBT): simple, practical tools to understand unhelpful thought patterns and build habits that help."],
        points: [
          "Stress and feeling overwhelmed",
          "Anxiety, low mood and sleep",
          "Relationships with your spouse and family",
          "Family pressures and expectations",
          "Building confidence and resilience",
          "Time and direction for yourself",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Choose a Saturday time online and pay in advance. A short, confidential form before your first session helps us start where it matters to you. If you choose to meet in person, the venue is shared on confirmation; if online, your Google Meet link arrives by email.",
          "In the first session we agree two or three goals together, and we review progress by the fourth session.",
        ],
      },
      {
        heading: "Private and judgement-free",
        body: [
          "What you share stays between us. We do not confirm to anyone, including family, that you are a client without your written permission. You may book under any name you prefer.",
        ],
      },
      {
        heading: "Your counsellor",
        body: [
          "Sessions are led by M H Sharieff, PhD, Chief Counselling Psychologist, who has mentored senior executives at a multinational since 2017. He holds a PhD in Human Resources, a Master's in Counselling Psychology and a Diploma in Community Mental Health from NIMHANS, and is a member of the American Psychological Association.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I have sessions in Kannada or Hindi?",
        answer: "Yes. Sessions are in English, Kannada or Hindi, with working Tamil.",
      },
      {
        question: "Should I choose online or in person?",
        answer: "Whichever feels easier. Online sessions save travel time; in-person sessions give you a change of setting. You choose when booking.",
      },
      {
        question: "Will my family know I am attending?",
        answer: "No. We never confirm to anyone that you are a client without your written permission.",
      },
      {
        question: "How many sessions will I need?",
        answer: "Many people see clear progress within four sessions, when we review it together. Some choose to continue from there.",
      },
    ],
  },
  {
    plan: "children",
    slug: "child-counselling-bangalore",
    readMore: { label: "Does my child need counselling? Signs parents should not ignore", href: "/blog/does-my-child-need-counselling" },
    title: "Child counselling with parents in Bangalore",
    sub: "Counselling for children, together with a parent or guardian, with our associate consultant specialised in children's counselling.",
    seoTitle: "Child Counselling with Parents in Bangalore",
    seoDescription:
      "Counselling for children with a parent or guardian, by a consultant specialised in children's counselling. Online or in person in Bangalore, Sunday mornings.",
    intro: [
      "Children rarely say \"I need help\". It shows instead in worry, anger, withdrawal, sleep, school or screens. Counselling gives your child a safe space to be understood, and gives you, as a parent, practical ways to support them at home.",
      "Sessions are led by a BearingMind associate consultant who specialises in children's counselling, with a parent or guardian taking part. They are held on Sunday mornings at 8, 9 or 10 AM, online or in person in Bangalore.",
    ],
    sections: [
      {
        heading: "When families come to us",
        body: ["Every child is different. Parents often reach out when they notice changes such as:"],
        points: [
          "Worry, fears or stress about school",
          "Anger, tantrums or changes in behaviour",
          "Low mood or withdrawing from friends",
          "Sleep difficulties",
          "Too much screen or social media time",
          "Family changes and adjusting to them",
        ],
      },
      {
        heading: "Parents are part of it",
        body: [
          "A parent or guardian makes the booking and takes part in sessions. You learn what your child is going through and how to respond in ways that help, so progress continues between sessions.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Choose a Sunday time online and pay in advance. If you meet in person, our associate consultant shares the venue with you on confirmation; online sessions are on Google Meet.",
          "Our work is non-clinical and does not involve diagnosis or medication. Where a child needs clinical care, we work alongside your paediatrician or psychiatrist, or refer you to one.",
        ],
      },
    ],
    faq: [
      {
        question: "Who will my child meet?",
        answer: "A BearingMind associate consultant who specialises in children's counselling. BearingMind stays involved throughout.",
      },
      {
        question: "Does a parent need to attend?",
        answer: "Yes. A parent or guardian makes the booking and takes part in the sessions.",
      },
      {
        question: "Can sessions be online?",
        answer: "Yes. You choose online on Google Meet or in person in Bangalore when booking.",
      },
      {
        question: "Do you also work with teenagers?",
        answer: "Yes, through BearingMind associates who specialise in children and adolescents.",
      },
    ],
  },
];
