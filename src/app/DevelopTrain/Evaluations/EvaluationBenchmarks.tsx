import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Label,
  MenuToggle,
  PageSection,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, FilterIcon } from '@patternfly/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface BenchmarkCard {
  id: string;
  title: string;
  benchmarkName: string;
  category: 'Safety' | 'Capability' | 'Quality';
  description: string;
  longDescription?: string;
  tags: string[];
  link?: string;
  useCase: string;
  metric: string;
  metrics?: string[];
}

export const benchmarks: BenchmarkCard[] = [
  // Open LLM Leaderboard v2
  {
    id: 'ifeval',
    title: 'Instruction following',
    benchmarkName: 'IFEval',
    category: 'Capability',
    description: 'Tests a model\'s ability to follow explicit formatting instructions like "include keyword x" or "use format y." Focuses on adherence to instructions rather than content quality.',
    longDescription: 'IFEval (Instruction Following Evaluation) tests whether language models can precisely follow explicit formatting and structural instructions like "write exactly 3 paragraphs" or "include keyword x twice." Unlike traditional benchmarks focused on content quality, IFEval emphasizes instruction adherence.\n\nThe benchmark is crucial for real-world applications requiring specific formatting - report generation, form filling, and structured data extraction. It tests various instruction types including keyword constraints, length requirements, format specifications, and combinatorial instructions.',
    tags: ['Instructions', 'Formatting', 'General'],
    link: 'https://arxiv.org/abs/2311.07911',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Instruction adherence', 'Format compliance']
  },
  {
    id: 'bbh',
    title: 'Complex reasoning',
    benchmarkName: 'Big-bench hard',
    category: 'Capability',
    description: '23 challenging tasks from BIG-Bench where language models previously didn\'t outperform average human raters. Tests multi-step reasoning capabilities (3-shot, multiple choice).',
    longDescription: 'BIG-Bench Hard (BBH) is a collection of 23 challenging tasks from BIG-Bench where earlier language models failed to surpass average human performance. It evaluates multi-step reasoning across logical deduction, algorithmic reasoning, linguistic understanding, and world knowledge using a 3-shot, multiple-choice format.\n\nTasks include causal judgment, formal fallacy identification, geometric reasoning, object counting, temporal sequences, and tracking shuffled objects. Success on BBH indicates a model can handle complex reasoning tasks requiring systematic thinking and information synthesis.',
    tags: ['Reasoning', 'Multi-step', 'General'],
    link: 'https://arxiv.org/abs/2210.09261',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Algorithmic tasks', 'Linguistic tasks', 'Mathematical tasks', 'Common sense reasoning', 'World knowledge']
  },
  {
    id: 'gpqa',
    title: 'Expert-level Q&A',
    benchmarkName: 'GPQA',
    category: 'Capability',
    description: '448 expert-written questions in biology, physics, and chemistry. Designed to be extremely difficult - even PhD experts achieve only 65% accuracy (0-shot, multiple choice).',
    longDescription: 'GPQA (Graduate-Level Google-Proof Q&A) consists of 448 expert-written questions in biology, physics, and chemistry designed to be "Google-proof" - they cannot be easily answered by searching the internet. Questions require deep domain expertise and advanced scientific reasoning.\n\nTo illustrate the difficulty: PhD-level domain experts achieve only 65% accuracy, while skilled non-experts score around 34%. The 0-shot format tests raw knowledge without examples, making GPQA an excellent measure of expert-level scientific reasoning for advanced research and educational applications.',
    tags: ['Science', 'Expert-level', 'General'],
    link: 'https://arxiv.org/abs/2311.12022',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Overall score', 'Physics domain', 'Chemistry domain', 'Biology domain']
  },
  {
    id: 'mmlu-pro',
    title: 'Multidomain knowledge',
    benchmarkName: 'MMLU-Pro',
    category: 'Capability',
    description: 'Enhanced version of MMLU with 10 answer choices instead of 4, expert-reviewed to reduce noise, and more challenging questions (5-shot, multiple choice).',
    longDescription: 'MMLU-Pro is an enhanced version of MMLU designed to address score saturation in modern models. It increases difficulty by expanding answer choices from 4 to 10 options (reducing guessing probability from 25% to 10%), expert-reviewing questions, and incorporating more challenging items requiring deeper reasoning.\n\nThe benchmark maintains comprehensive coverage across STEM, humanities, social sciences, and professional domains with higher cognitive demands. Using a 5-shot format, MMLU-Pro better distinguishes between model capability levels and tracks continued progress in broad knowledge understanding.',
    tags: ['Knowledge', 'Multi-domain', 'General'],
    link: 'https://arxiv.org/abs/2406.01574',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['STEM knowledge', 'Humanities', 'Social sciences', 'Other domains']
  },
  {
    id: 'musr',
    title: 'Long-context reasoning',
    benchmarkName: 'MuSR',
    category: 'Capability',
    description: 'Complex ~1,000-word problems including murder mysteries, object placement, and team allocation. Tests reasoning with long-range context parsing (0-shot, multiple choice).',
    longDescription: 'MuSR (Multistep Soft Reasoning) presents complex problems averaging ~1,000 words that require tracking information across long contexts. Problems include murder mysteries, object placement puzzles, and team allocation scenarios that demand careful attention to details spread throughout the text.\n\nThe benchmark tests whether models can maintain context over long passages and perform multi-step deduction. Success indicates strong long-context understanding and reasoning capabilities essential for complex document analysis and narrative comprehension.',
    tags: ['Reasoning', 'Context', 'General'],
    link: 'https://arxiv.org/abs/2310.16049',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Context understanding', 'Multi-step deduction']
  },
  {
    id: 'math-lvl-5',
    title: 'Advanced math',
    benchmarkName: 'Math-lvl-5',
    category: 'Capability',
    description: 'Advanced mathematical reasoning tasks (4-shot, generative, Minerva version).',
    longDescription: 'Math-lvl-5 contains the most difficult problems from the MATH dataset, requiring advanced mathematical reasoning at the competition level. Problems span algebra, calculus, number theory, and geometry, demanding multi-step solutions and sophisticated problem-solving strategies.\n\nThe 4-shot generative format requires models to produce complete solutions, not just select answers. This benchmark is extremely challenging and tests whether models can handle graduate-level mathematical reasoning essential for STEM education and research applications.',
    tags: ['Math', 'Reasoning', 'General'],
    link: 'https://arxiv.org/abs/2206.14858',
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Problem solving', 'Calculation accuracy', 'Algebraic reasoning', 'Proof validation']
  },
  // Safety and Fairness
  {
    id: 'truthfulqa-mc1',
    title: 'Truthfulness testing',
    benchmarkName: 'TruthfulQA: Measuring How Models Mimic Human Falsehoods',
    category: 'Safety',
    description: 'Tests whether models give truthful answers to questions where humans often answer incorrectly due to misconceptions. Questions cover health, law, conspiracies, and fiction vs. reality.',
    longDescription: 'TruthfulQA measures whether language models generate truthful answers on topics where humans frequently answer incorrectly due to misconceptions. The 817 questions span 38 categories including health, law, conspiracy theories, myths, and stereotypes, targeting questions where the "common" answer is actually false.\n\nThis is critical because models trained on internet text may replicate human falsehoods. The benchmark tests whether models can overcome potentially misleading training data to provide factually correct responses - essential for reliable deployment in educational, medical, legal, and informational applications.',
    tags: ['Truthfulness', 'Factuality', 'Safety'],
    link: 'https://arxiv.org/abs/2109.07958',
    useCase: 'Safety Testing',
    metric: 'Accuracy',
    metrics: ['Truthfulness', 'Informativeness']
  },
  {
    id: 'toxigen',
    title: 'Toxicity detection',
    benchmarkName: 'ToxiGen: Toxic Language Generation',
    category: 'Safety',
    description: 'Measures a model\'s propensity to generate toxic or hateful content, particularly implicit hate speech targeting marginalized groups (13 minority groups).',
    longDescription: 'ToxiGen evaluates whether language models generate toxic or hateful content, focusing on implicit hate speech that may be subtle yet harmful. The benchmark covers 13 minority groups and tests whether models produce biased or discriminatory language when prompted.\n\nUnlike explicit toxicity that\'s easy to detect, ToxiGen targets implicit bias that can appear in seemingly neutral text. This is critical for ensuring AI systems don\'t perpetuate harm in real-world applications like content generation and chatbots.',
    tags: ['Toxicity', 'Hate speech', 'Safety'],
    link: 'https://arxiv.org/abs/2203.09509',
    useCase: 'Safety Testing',
    metric: 'Toxicity Rate',
    metrics: ['Non-toxicity rate']
  },
  {
    id: 'winogender',
    title: 'Gender bias',
    benchmarkName: 'Winogender Schemas',
    category: 'Safety',
    description: 'Evaluates gender bias in pronoun resolution using sentences with occupations and gender-ambiguous pronouns to test stereotypical associations.',
    longDescription: 'Winogender Schemas tests gender bias through pronoun resolution tasks involving occupations. Sentences present scenarios where pronouns could refer to people in various professions, testing whether models rely on gender stereotypes (e.g., assuming "nurse" is female or "engineer" is male).\n\nThe benchmark measures both accuracy in resolving pronouns and the degree of gender bias exhibited. This is essential for ensuring AI systems don\'t perpetuate occupational stereotypes in applications like resume screening or content generation.',
    tags: ['Bias', 'Gender', 'Fairness'],
    link: 'https://arxiv.org/abs/1804.09301',
    useCase: 'Safety Testing',
    metric: 'Bias Score',
    metrics: ['Pronoun resolution accuracy', 'Gender bias score']
  },
  {
    id: 'crows-pairs',
    title: 'Stereotype bias',
    benchmarkName: 'CrowS-Pairs English',
    category: 'Safety',
    description: 'Measures stereotypical biases across 9 categories including race, gender, sexual orientation, religion, age, nationality, disability, physical appearance, and socioeconomic status.',
    longDescription: 'CrowS-Pairs evaluates stereotypical biases through sentence pairs where one reinforces a stereotype and one violates it. The benchmark covers 9 bias categories: race/ethnicity, gender, sexual orientation, religion, age, nationality, disability, physical appearance, and socioeconomic status.\n\nModels are tested on whether they prefer stereotypical sentences over anti-stereotypical ones, revealing implicit biases. This comprehensive assessment is crucial for identifying harmful stereotypes across multiple dimensions of identity before deployment in real-world applications.',
    tags: ['Bias', 'Stereotypes', 'Fairness'],
    link: 'https://arxiv.org/abs/2010.00133',
    useCase: 'Safety Testing',
    metric: 'Bias Score',
    metrics: ['Race/ethnicity bias', 'Gender bias', 'Religion bias', 'Age bias', 'Socioeconomic bias']
  },
  {
    id: 'bbq',
    title: 'Social bias',
    benchmarkName: 'BBQ',
    category: 'Safety',
    description: 'Tests social biases in question answering contexts with both ambiguous and disambiguated contexts, measuring whether models make biased assumptions.',
    longDescription: 'The Bias Benchmark for QA (BBQ) evaluates social biases in question answering through paired questions: ambiguous contexts (testing if models default to stereotypes) and disambiguated contexts (testing if models overcome biases when given facts). It covers 11 bias categories including age, gender identity, race/ethnicity, religion, and socioeconomic status.\n\nBBQ measures both accuracy and the tendency to make biased assumptions when information is incomplete - crucial for identifying harmful biases in AI systems deployed in high-stakes domains like hiring, lending, and healthcare.',
    tags: ['Bias', 'QA', 'Fairness'],
    link: 'https://arxiv.org/abs/2110.08193',
    useCase: 'Safety Testing',
    metric: 'Bias Score',
    metrics: ['Ambiguous context accuracy', 'Disambiguated context accuracy', 'Bias differential score']
  },
  {
    id: 'ethics-cm',
    title: 'Moral judgment',
    benchmarkName: 'ETHICS',
    category: 'Safety',
    description: 'Tests whether models can make basic moral judgments about everyday scenarios - distinguishing right from wrong in common situations.',
    longDescription: 'The ETHICS benchmark evaluates whether language models can make sound moral judgments about everyday scenarios, distinguishing ethically appropriate from inappropriate actions. It covers multiple ethical frameworks including commonsense morality, justice, deontology, virtue ethics, and utilitarianism.\n\nThe benchmark tests whether models can reason about moral principles and apply them to realistic situations - essential for AI systems that may need to navigate ethical considerations in applications like content moderation, advice-giving, or decision support.',
    tags: ['Ethics', 'Morality', 'Safety'],
    link: 'https://arxiv.org/abs/2008.02275',
    useCase: 'Safety Testing',
    metric: 'Accuracy',
    metrics: ['Moral judgment accuracy', 'Ethical consistency']
  },
  // Telco Benchmarks
  {
    id: 'teleyaml',
    title: 'Telco configuration',
    benchmarkName: 'TeleYAML',
    category: 'Capability',
    description: 'Translates operator intents into standards-aligned YAML configurations. Focus: 5G Core functions, subscriber provisioning, network slicing. Current Performance: <30% for top models.',
    longDescription: 'TeleYAML evaluates language models\' ability to translate operator intents into standards-compliant YAML configurations for 5G networks. Models must generate configurations for Core network functions (AMF, SMF, UPF), subscriber provisioning, and network slicing while understanding both natural language intent and complex 3GPP technical requirements.\n\nThe challenge lies in high precision requirements - small errors cause network failures or security vulnerabilities. Current state-of-the-art models achieve less than 30% accuracy. Success indicates readiness to assist in network automation and configuration management.',
    tags: ['Telco', '5G', 'Configuration'],
    link: 'https://arxiv.org/abs/2409.16314',
    useCase: 'Telco',
    metric: 'Accuracy',
    metrics: ['Technical knowledge', 'Problem diagnosis', 'Solution accuracy']
  },
  {
    id: 'telelogs',
    title: 'Network troubleshooting',
    benchmarkName: 'TeleLogs',
    category: 'Capability',
    description: 'Root-Cause Analysis (RCA) on 5G network data. Focus: Fault detection, diagnosis, real-time fixes. Top Score: 80.00 (GPT-5).',
    longDescription: 'TeleLogs evaluates root-cause analysis capabilities on 5G network log data. Models must analyze network logs to detect faults, diagnose problems, and recommend real-time fixes. This requires understanding network architecture, protocol behavior, and failure patterns.\n\nThe benchmark tests critical skills for network operations - identifying issues from symptom patterns and suggesting appropriate remediation. Strong performance indicates readiness to assist network engineers in troubleshooting and maintaining telecom infrastructure.',
    tags: ['Telco', 'Troubleshooting', 'RCA'],
    link: 'https://arxiv.org/abs/2409.16314',
    useCase: 'Telco',
    metric: 'Accuracy',
    metrics: ['Fault detection', 'Root-cause diagnosis', 'Solution recommendation']
  },
  {
    id: 'telemath',
    title: 'Telco math',
    benchmarkName: 'TeleMath',
    category: 'Capability',
    description: 'Quantitative engineering calculations for telecom-specific mathematical problem-solving under network constraints.',
    longDescription: 'TeleMath tests quantitative engineering calculations specific to telecommunications, including signal strength calculations, capacity planning, frequency allocation, and network optimization problems. Models must apply mathematical reasoning within telecom-specific constraints and formulas.\n\nThe benchmark evaluates whether models can handle the specialized mathematics required for network engineering - essential for network planning, optimization, and engineering decision support in telecommunications operations.',
    tags: ['Telco', 'Math', 'Engineering'],
    link: 'https://arxiv.org/abs/2409.16314',
    useCase: 'Telco',
    metric: 'Accuracy',
    metrics: ['Calculation accuracy', 'Engineering reasoning', 'Constraint satisfaction']
  },
  {
    id: '3gpp-tsg',
    title: 'Telco standards',
    benchmarkName: '3GPP-TSG',
    category: 'Capability',
    description: 'Understanding 3GPP technical documentation. Focus: Classifying and interpreting telecom standards from 3GPP/ETSI/ITU.',
    longDescription: '3GPP-TSG evaluates understanding of telecommunications technical standards from organizations like 3GPP, ETSI, and ITU. Models must interpret complex technical specifications, classify standards documents, and understand regulatory requirements for network protocols and interfaces.\n\nThis benchmark tests whether models can navigate the intricate standards landscape essential for telecom development - critical for ensuring compliance, interoperability, and proper implementation of network technologies.',
    tags: ['Telco', 'Standards', '3GPP'],
    link: 'https://arxiv.org/abs/2409.16314',
    useCase: 'Telco',
    metric: 'Accuracy',
    metrics: ['Standards comprehension', 'Document classification', 'Compliance understanding']
  },
  {
    id: 'teleqna',
    title: 'Telco knowledge',
    benchmarkName: 'TeleQnA',
    category: 'Capability',
    description: 'Telecom domain knowledge assessment with multiple-choice questions on standards, research, and technical topics. Top Score: 82.51 (GPT-5).',
    longDescription: 'TeleQnA assesses comprehensive telecommunications domain knowledge through multiple-choice questions covering standards, research papers, and technical topics. Questions span network architecture, protocols, radio access technologies, core networks, and emerging telecom trends.\n\nThe benchmark tests broad telecom expertise required for technical roles in the industry - from understanding foundational concepts to staying current with latest developments. It measures readiness to support telecom professionals in technical decision-making and knowledge work.',
    tags: ['Telco', 'QA', 'Domain'],
    link: 'https://arxiv.org/abs/2409.16314',
    useCase: 'Telco',
    metric: 'Accuracy',
    metrics: ['Standards knowledge', 'Technical understanding', 'Protocol expertise']
  },
  // Healthcare
  {
    id: 'medqa',
    title: 'Medical licensing',
    benchmarkName: 'MedQA',
    category: 'Capability',
    description: 'Medical licensing exam questions covering pathology, pharmacology, clinical reasoning.',
    longDescription: 'MedQA is derived from the United States Medical Licensing Examination (USMLE), containing multiple-choice questions covering basic sciences, pathology, pharmacology, and clinical reasoning across all medical specialties. Questions present complex clinical scenarios requiring integration of concepts, differential diagnosis, and treatment planning.\n\nThe benchmark is challenging because it requires applying medical knowledge to realistic patient scenarios and reasoning through diagnostic decisions - not just factual recall. Success indicates a model\'s potential utility in medical education, clinical decision support, and research applications.',
    tags: ['Healthcare', 'Medical', 'USMLE'],
    link: 'https://arxiv.org/abs/2009.13081',
    useCase: 'Healthcare',
    metric: 'Accuracy',
    metrics: ['Clinical knowledge', 'Diagnostic reasoning', 'Evidence-based practice']
  },
  {
    id: 'medmcqa',
    title: 'Medical knowledge',
    benchmarkName: 'MedMCQA',
    category: 'Capability',
    description: 'Indian medical entrance exam questions for medical knowledge assessment.',
    longDescription: 'MedMCQA consists of questions from Indian medical entrance examinations, covering diverse medical topics including anatomy, physiology, biochemistry, pathology, pharmacology, and clinical subjects. The dataset tests comprehensive medical knowledge required for medical school admission.\n\nQuestions assess both factual knowledge and application of medical concepts. The benchmark provides an alternative perspective on medical knowledge assessment, complementing USMLE-based evaluations with different regional medical education standards.',
    tags: ['Healthcare', 'Medical', 'QA'],
    link: 'https://arxiv.org/abs/2203.14371',
    useCase: 'Healthcare',
    metric: 'Accuracy',
    metrics: ['Medical knowledge', 'Concept application', 'Clinical reasoning']
  },
  {
    id: 'pubmedqa',
    title: 'Biomedical literature',
    benchmarkName: 'PubMedQA',
    category: 'Capability',
    description: 'Biomedical literature comprehension and question answering from PubMed abstracts.',
    longDescription: 'PubMedQA evaluates biomedical literature comprehension through question answering based on PubMed research abstracts. Models must read scientific abstracts and answer questions about study findings, methodologies, and conclusions, testing both reading comprehension and biomedical knowledge.\n\nThis benchmark is crucial for assessing models\' ability to process scientific literature - essential for research assistance, literature review, and evidence synthesis in medical and life sciences research.',
    tags: ['Healthcare', 'Biomedical', 'QA'],
    link: 'https://arxiv.org/abs/1909.06146',
    useCase: 'Healthcare',
    metric: 'Accuracy',
    metrics: ['Literature comprehension', 'Scientific reasoning', 'Evidence interpretation']
  },
  // Software Engineering
  {
    id: 'humaneval',
    title: 'Code generation',
    benchmarkName: 'HumanEval',
    category: 'Capability',
    description: '164 Python programming problems testing function completion and code generation.',
    longDescription: 'HumanEval consists of 164 hand-written Python programming problems testing fundamental skills including string manipulation, list processing, and algorithmic thinking. Each problem has unit tests to verify correctness - generated code must be functionally correct, not just syntactically valid.\n\nThis mirrors real-world programming where code must work correctly. The benchmark covers various difficulty levels and has become a standard for comparing code generation models. Strong performance indicates utility in code completion tools, programming assistants, and educational applications.',
    tags: ['Code', 'Programming', 'Python'],
    metrics: ['Syntactic correctness', 'Functional correctness', 'Code efficiency', 'Edge case handling'],
    link: 'https://arxiv.org/abs/2107.03374',
    useCase: 'Software Engineering',
    metric: 'Pass@k'
  },
  {
    id: 'mbpp',
    title: 'Python programming',
    benchmarkName: 'MBPP',
    category: 'Capability',
    description: '974 Python programming tasks for basic to intermediate programming challenges.',
    longDescription: 'MBPP (Mostly Basic Programming Problems) contains 974 Python programming tasks ranging from basic to intermediate difficulty. Each problem includes a task description, code solution, and test cases. The benchmark focuses on entry-level programming skills more accessible than HumanEval.\n\nMBPP tests fundamental programming abilities including basic algorithms, data structures, and problem-solving - essential for evaluating code generation models across broader skill ranges and educational applications for novice programmers.',
    tags: ['Code', 'Programming', 'Python'],
    link: 'https://arxiv.org/abs/2108.07732',
    useCase: 'Software Engineering',
    metric: 'Pass@k',
    metrics: ['Basic programming', 'Algorithm implementation', 'Problem solving']
  },
  {
    id: 'apps',
    title: 'Algorithmic problem solving',
    benchmarkName: 'APPS',
    category: 'Capability',
    description: '10,000 programming problems from coding competitions testing algorithmic problem-solving.',
    tags: ['Code', 'Algorithms', 'Competition'],
    link: 'https://arxiv.org/abs/2105.09938',
    useCase: 'Software Engineering',
    metric: 'Pass@k',
    metrics: ['Problem solving', 'Algorithmic reasoning', 'Code correctness']
  },
  {
    id: 'ds-1000',
    title: 'Data science code',
    benchmarkName: 'DS-1000',
    category: 'Capability',
    description: 'Data science code generation for NumPy, Pandas, PyTorch, and other data science libraries.',
    tags: ['Code', 'Data Science', 'Python'],
    link: 'https://arxiv.org/abs/2211.11501',
    useCase: 'Software Engineering',
    metric: 'Pass@k',
    metrics: ['Library usage', 'Data manipulation', 'API correctness']
  },
  {
    id: 'swe-bench',
    title: 'Software engineering',
    benchmarkName: 'SWE-bench',
    category: 'Capability',
    description: 'Real-world software engineering tasks from GitHub issues requiring bug fixes and feature implementation.',
    tags: ['Code', 'Engineering', 'GitHub'],
    link: 'https://arxiv.org/abs/2310.06770',
    useCase: 'Software Engineering',
    metric: 'Pass@k',
    metrics: ['Bug fixing', 'Feature implementation', 'Code comprehension']
  },
  // EU AI Act / Multilingual
  {
    id: 'xquad',
    title: 'Cross-lingual Q&A',
    benchmarkName: 'XQuAD',
    category: 'Capability',
    description: 'Cross-lingual question answering in 11 languages testing comprehension and reasoning.',
    tags: ['Multilingual', 'QA', 'Cross-lingual'],
    link: 'https://arxiv.org/abs/1910.11856',
    useCase: 'Multilingual',
    metric: 'F1 Score',
    metrics: ['Answer accuracy', 'Cross-lingual transfer', 'Reading comprehension']
  },
  {
    id: 'xnli',
    title: 'Cross-lingual inference',
    benchmarkName: 'XNLI',
    category: 'Capability',
    description: 'Cross-lingual natural language inference in 15 languages.',
    tags: ['Multilingual', 'NLI', 'Cross-lingual'],
    link: 'https://arxiv.org/abs/1809.05053',
    useCase: 'Multilingual',
    metric: 'Accuracy',
    metrics: ['Entailment detection', 'Cross-lingual consistency', 'Inference accuracy']
  },
  // Toxicity & Risk
  {
    id: 'hhh',
    title: 'Ethical alignment',
    benchmarkName: 'HHH',
    category: 'Safety',
    description: 'Tests alignment with ethical values in different interaction scenarios.',
    tags: ['Safety', 'Ethics', 'Alignment'],
    link: 'https://arxiv.org/abs/2204.05862',
    useCase: 'Safety Testing',
    metric: 'Accuracy',
    metrics: ['Helpfulness', 'Honesty', 'Harmlessness']
  },
  {
    id: 'advbench',
    title: 'Adversarial robustness',
    benchmarkName: 'AdvBench',
    category: 'Safety',
    description: 'Tests resistance to adversarial inputs and jailbreaking attempts.',
    tags: ['Safety', 'Adversarial', 'Jailbreak'],
    link: 'https://arxiv.org/abs/2307.15043',
    useCase: 'Safety Testing',
    metric: 'Attack Success Rate',
    metrics: ['Attack resistance', 'Jailbreak prevention', 'Output safety']
  },
  {
    id: 'realtoxicityprompts',
    title: 'Toxicity risk',
    benchmarkName: 'Real Toxicity Prompts',
    category: 'Safety',
    description: 'Assesses responses to naturally occurring text prompts that might lead to toxic outputs.',
    tags: ['Safety', 'Toxicity', 'Prompts'],
    link: 'https://arxiv.org/abs/2009.11462',
    useCase: 'Safety Testing',
    metric: 'Toxicity Rate',
    metrics: ['Toxicity probability', 'Prompt sensitivity', 'Content safety']
  },
  {
    id: 'donotanswer',
    title: 'Harmful request refusal',
    benchmarkName: 'Do Not Answer Dataset',
    category: 'Safety',
    description: 'Tests ability to recognize and refuse harmful, unethical, or dangerous requests.',
    tags: ['Safety', 'Refusal', 'Ethics'],
    link: 'https://arxiv.org/abs/2308.13387',
    useCase: 'Safety Testing',
    metric: 'Refusal Rate',
    metrics: ['Refusal accuracy', 'Harm detection', 'Response appropriateness']
  },
  // Quality benchmarks
  {
    id: 'hellaswag',
    title: 'Commonsense reasoning',
    benchmarkName: 'HellaSwag: Can a Machine Really Finish Your Sentence?',
    category: 'Quality',
    description: 'Tests commonsense reasoning about the physical world.',
    tags: ['Common sense', 'Reasoning', 'NLI'],
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Sentence completion', 'Physical reasoning', 'Commonsense inference']
  },
  {
    id: 'winogrande',
    title: 'Pronoun resolution',
    benchmarkName: 'WinoGrande: An Adversarial Winograd Schema Challenge',
    category: 'Quality',
    description: 'Tests commonsense reasoning through pronoun resolution problems.',
    tags: ['Common sense', 'Reasoning', 'NLI'],
    useCase: 'General LLM',
    metric: 'Accuracy',
    metrics: ['Pronoun resolution', 'Contextual reasoning', 'Disambiguation accuracy']
  },
];

const getCategoryColor = (category: BenchmarkCard['category']): 'blue' | 'orangered' | 'grey' | 'teal' => {
  switch (category) {
    case 'Safety':
      return 'teal';
    case 'Capability':
      return 'blue';
    case 'Quality':
      return 'orangered';
    default:
      return 'grey';
  }
};

const EvaluationBenchmarks: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const _evaluationContext = location.state as { evaluationName?: string; endpoint?: string; offlineUri?: string } | null;
  const [filterValue, setFilterValue] = React.useState('');
  const [searchFilterAttribute, setSearchFilterAttribute] = React.useState<'Name' | 'Metric'>('Name');
  const [isSearchFilterOpen, setIsSearchFilterOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'capability' | 'quality' | 'safety'>('all');
  const [selectedBenchmark, setSelectedBenchmark] = React.useState<BenchmarkCard | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(24);
  const [expandedMetrics, setExpandedMetrics] = React.useState<Set<string>>(new Set());

  const filteredBenchmarks = benchmarks.filter((b) => {
    const matchesSearch = filterValue
      ? searchFilterAttribute === 'Name'
        ? (b.title.toLowerCase().includes(filterValue.toLowerCase()) ||
           b.benchmarkName.toLowerCase().includes(filterValue.toLowerCase()) ||
           b.description.toLowerCase().includes(filterValue.toLowerCase()))
        : (b.metric?.toLowerCase().includes(filterValue.toLowerCase()) ||
           (b.metrics?.some((m) => m.toLowerCase().includes(filterValue.toLowerCase())) ?? false))
      : true;
    const matchesCategory = categoryFilter === 'all' || b.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedBenchmarks = [...filteredBenchmarks].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );
  const paginatedBenchmarks = sortedBenchmarks.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filterValue, searchFilterAttribute, categoryFilter]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleBenchmarkClick = (benchmark: BenchmarkCard) => {
    setSelectedBenchmark(benchmark);
    setIsDrawerExpanded(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerExpanded(false);
  };

  const handleRunBenchmark = (benchmark: BenchmarkCard) => {
    setIsDrawerExpanded(false);
    navigate('/develop-train/evaluations/run', { state: { runType: 'benchmark', item: benchmark } });
  };

  const panelContent = (
    <DrawerPanelContent isResizable defaultSize="500px" minSize="400px">
      <DrawerHead>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Label color={selectedBenchmark ? getCategoryColor(selectedBenchmark.category) : 'grey'} style={{ fontSize: '12px', padding: '2px 10px' }}>
              {selectedBenchmark?.category}
            </Label>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h2" size="xl">
              {selectedBenchmark?.title}
            </Title>
          </FlexItem>
          <FlexItem>
            {selectedBenchmark?.link ? (
              <a 
                href={selectedBenchmark.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none', fontSize: '14px' }}
              >
                {selectedBenchmark?.benchmarkName} <ExternalLinkAltIcon style={{ fontSize: '12px', marginLeft: '4px' }} />
              </a>
            ) : (
              <span style={{ fontSize: '14px', color: '#6a6e73' }}>{selectedBenchmark?.benchmarkName}</span>
            )}
          </FlexItem>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={handleDrawerClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <FlexItem>
              <DescriptionList isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>
                    {(selectedBenchmark?.longDescription || selectedBenchmark?.description)?.split('\n').map((paragraph, index) => (
                      <p key={index} style={{ marginBottom: paragraph.trim() ? '12px' : '0' }}>
                        {paragraph}
                      </p>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {selectedBenchmark?.metrics && selectedBenchmark.metrics.length > 0 && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Metrics evaluated</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Flex spaceItems={{ default: 'spaceItemsXs' }} style={{ flexWrap: 'wrap', gap: '8px' }}>
                        {selectedBenchmark.metrics.map((metric, index) => (
                          <FlexItem key={index}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '2px 10px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #d2d2d2',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#6a6e73',
                              whiteSpace: 'nowrap'
                            }}>
                              {metric}
                            </span>
                          </FlexItem>
                        ))}
                      </Flex>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </FlexItem>
          </Flex>
        </div>
        <div style={{ 
          position: 'sticky', 
          bottom: 0, 
          backgroundColor: '#fff', 
          padding: '16px 0',
          borderTop: '1px solid #d2d2d2',
          marginTop: 'auto'
        }}>
          <Button 
            variant="primary" 
            onClick={() => selectedBenchmark && handleRunBenchmark(selectedBenchmark)}
          >
            Run this benchmark
          </Button>
        </div>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
    <Drawer isExpanded={isDrawerExpanded}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <PageSection hasBodyWrapper={false}>
        <Breadcrumb id="benchmarks-breadcrumb">
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations">Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations/new">New Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Benchmarks</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '8px', columnGap: 0, rowGap: 0 }}>
        <Content component={ContentVariants.h1} style={{ marginBottom: '4px' }}>Select single benchmark</Content>
        <Content component={ContentVariants.p}>
          Select a benchmark to run on your model or agent.
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '24px' }}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'nowrap' }}>
              <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Select
                        id="search-filter-attribute"
                        isOpen={isSearchFilterOpen}
                        selected={searchFilterAttribute}
                        onSelect={(_event, value) => {
                          setSearchFilterAttribute(value as 'Name' | 'Metric');
                          setIsSearchFilterOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsSearchFilterOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsSearchFilterOpen(!isSearchFilterOpen)}
                            isExpanded={isSearchFilterOpen}
                            icon={<FilterIcon />}
                            id="search-filter-toggle"
                          >
                            {searchFilterAttribute}
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="Name">Name</SelectOption>
                          <SelectOption value="Metric">Metric</SelectOption>
                        </SelectList>
                      </Select>
                    </FlexItem>
                    <FlexItem>
                      <SearchInput
                        placeholder={`Filter by ${searchFilterAttribute.toLowerCase()}`}
                        value={filterValue}
                        onChange={(_event, value) => setFilterValue(value)}
                        onClear={() => setFilterValue('')}
                        id="benchmark-search"
                        style={{ width: '250px' }}
                      />
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <ToggleGroup aria-label="Category filter">
                    <ToggleGroupItem
                      text="All"
                      buttonId="category-all"
                      isSelected={categoryFilter === 'all'}
                      onChange={() => setCategoryFilter('all')}
                    />
                    <ToggleGroupItem
                      text="Capability"
                      buttonId="category-capability"
                      isSelected={categoryFilter === 'capability'}
                      onChange={() => setCategoryFilter('capability')}
                    />
                    <ToggleGroupItem
                      text="Quality"
                      buttonId="category-quality"
                      isSelected={categoryFilter === 'quality'}
                      onChange={() => setCategoryFilter('quality')}
                    />
                    <ToggleGroupItem
                      text="Safety"
                      buttonId="category-safety"
                      isSelected={categoryFilter === 'safety'}
                      onChange={() => setCategoryFilter('safety')}
                    />
                  </ToggleGroup>
                </FlexItem>
              </Flex>
              <FlexItem>
                <Pagination
                  itemCount={filteredBenchmarks.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant="top"
                  perPageOptions={[
                    { title: '12', value: 12 },
                    { title: '24', value: 24 },
                    { title: '48', value: 48 },
                    { title: '96', value: 96 }
                  ]}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
          <Gallery hasGutter minWidths={{ default: '280px', md: '320px', lg: '300px', xl: '320px' }}>
            {paginatedBenchmarks.map((benchmark) => (
              <GalleryItem key={benchmark.id}>
                <Card
                  id={`benchmark-${benchmark.id}`}
                  style={{ 
                    height: '100%',
                    borderRadius: '16px'
                  }}
                >
                    <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Label color={getCategoryColor(benchmark.category)} style={{ fontSize: '12px', padding: '2px 10px' }}>{benchmark.category}</Label>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Content 
                          component={ContentVariants.h4} 
                          style={{ 
                            marginBottom: '4px', 
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--pf-t--global--color--brand--default)'
                          }}
                          onClick={() => handleBenchmarkClick(benchmark)}
                        >
                          {benchmark.title}
                        </Content>
                        <Content component={ContentVariants.p} style={{ color: '#151515', fontSize: '14px', marginBottom: '8px' }}>
                          {benchmark.benchmarkName}
                        </Content>
                        <Content
                          component={ContentVariants.p}
                          style={{
                            fontSize: '13px',
                            color: '#6a6e73',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                            overflow: 'hidden',
                          }}
                        >
                          {benchmark.description}
                        </Content>
                      </div>
                      {benchmark.metrics && benchmark.metrics.length > 0 && (
                        <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }} style={{ flexWrap: 'wrap', marginTop: '12px', marginBottom: '12px' }}>
                          {(expandedMetrics.has(benchmark.id) ? benchmark.metrics : benchmark.metrics.slice(0, 2)).map((metric) => (
                            <FlexItem key={metric}>
                              <span style={{ 
                                display: 'inline-block',
                                padding: '2px 10px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #d2d2d2',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#6a6e73',
                                whiteSpace: 'nowrap'
                              }}>
                                {metric}
                              </span>
                            </FlexItem>
                          ))}
                          {benchmark.metrics.length > 2 && (
                            <FlexItem>
                              <Button
                                variant="link"
                                isInline
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedMetrics((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(benchmark.id)) {
                                      next.delete(benchmark.id);
                                    } else {
                                      next.add(benchmark.id);
                                    }
                                    return next;
                                  });
                                }}
                                style={{ fontSize: '12px', marginLeft: '4px', padding: 0 }}
                                id={`metrics-toggle-${benchmark.id}`}
                              >
                                {expandedMetrics.has(benchmark.id)
                                  ? 'Show less'
                                  : `${benchmark.metrics.length - 2} more`}
                              </Button>
                            </FlexItem>
                          )}
                        </Flex>
                      )}
                      <div style={{ marginTop: '12px' }}>
                        <Button 
                          variant="secondary" 
                          id={`run-benchmark-${benchmark.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunBenchmark(benchmark);
                          }}
                        >
                          Run this benchmark
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
              </GalleryItem>
            ))}
          </Gallery>
          <FlexItem>
            <Pagination
              itemCount={filteredBenchmarks.length}
              perPage={perPage}
              page={page}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant="bottom"
              perPageOptions={[
                { title: '12', value: 12 },
                { title: '24', value: 24 },
                { title: '48', value: 48 },
                { title: '96', value: 96 }
              ]}
            />
          </FlexItem>
        </Flex>
      </PageSection>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
    </>
  );
};

export { EvaluationBenchmarks };
