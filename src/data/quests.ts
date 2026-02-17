// Quest content — sourced from Sara Kukovec's Learn-Claude, enriched with interactive challenges
// Challenge types: mcq, prompt-build, spot-error, prompt-battle

export type QuestType = 'learn' | 'lab' | 'challenge' | 'boss';

// === QUESTION TYPES ===

export interface MCQQuestion {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PromptBuildQuestion {
  id: string;
  type: 'prompt-build';
  question: string; // Scenario description
  components: string[]; // Shuffled prompt components to arrange
  correctOrder: number[]; // Correct indices
  explanation: string;
}

export interface SpotErrorQuestion {
  id: string;
  type: 'spot-error';
  question: string;
  prompt: string; // The bad prompt to analyze
  issues: { text: string; isIssue: boolean }[]; // Options, some are real issues
  explanation: string;
}

export interface PromptBattleQuestion {
  id: string;
  type: 'prompt-battle';
  question: string; // Scenario
  promptA: string;
  promptB: string;
  correctPrompt: 'A' | 'B';
  reasons: { text: string; isCorrect: boolean }[];
  explanation: string;
}

export type Question = MCQQuestion | PromptBuildQuestion | SpotErrorQuestion | PromptBattleQuestion;

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  xpReward: number;
  timeMinutes: number;
  questions: Question[];
  resource?: { title: string; url: string; source: string };
}

export interface SkillNode {
  id: string;
  title: string;
  emoji: string;
  description: string;
  quests: Quest[];
  position: { x: number; y: number };
  requires: string[];
  tier: 'foundations' | 'craft' | 'systems' | 'mastery';
}

export const skillNodes: SkillNode[] = [
  // === TIER 1: FOUNDATIONS ===
  {
    id: 'basics',
    title: 'Claude Basics',
    emoji: '💬',
    description: 'What Claude is, how it works, and your first conversations.',
    tier: 'foundations',
    position: { x: 50, y: 8 },
    requires: [],
    quests: [
      {
        id: 'basics-1',
        title: 'Meet Claude',
        description: 'Learn what Claude is and how it differs from other AI.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 5,
        resource: { title: 'Models Overview', url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', source: 'Anthropic Docs' },
        questions: [
          { id: 'b1q1', type: 'mcq', question: 'Which Claude model is optimized for complex reasoning?', options: ['Haiku 4.5', 'Sonnet 4.5', 'Opus 4.6', 'Claude Lite'], correctIndex: 2, explanation: 'Opus 4.6 is Anthropic\'s most capable model, built for deep reasoning and complex tasks.' },
          { id: 'b1q2', type: 'mcq', question: 'What is Constitutional AI?', options: ['A legal framework for AI companies', 'Anthropic\'s approach to making Claude helpful, harmless, and honest', 'A type of neural network architecture', 'A government regulation'], correctIndex: 1, explanation: 'Constitutional AI is Anthropic\'s technique for training Claude through a set of principles, rather than pure human feedback.' },
          { id: 'b1q3', type: 'mcq', question: 'What makes Claude different from a generic chatbot?', options: ['It can browse the internet', 'It has persistent memory, Projects, and Artifacts', 'It only works in English', 'It requires a subscription'], correctIndex: 1, explanation: 'Claude offers Projects (persistent workspaces), Memory (cross-conversation recall), and Artifacts (live interactive outputs) that go beyond basic chat.' },
          { id: 'b1q4', type: 'prompt-battle', question: 'You want Claude to summarize a research paper. Which prompt gets better results?', promptA: 'Summarize this paper.', promptB: 'Summarize this research paper in 3 sections: (1) Key findings, (2) Methodology, (3) Limitations. Use bullet points. Keep it under 300 words.', correctPrompt: 'B', reasons: [{ text: 'More specific output format', isCorrect: true }, { text: 'Includes word limit constraint', isCorrect: true }, { text: 'Uses fancier language', isCorrect: false }, { text: 'Breaks task into clear sections', isCorrect: true }], explanation: 'Specific prompts with clear structure, format requirements, and constraints consistently produce better results than vague requests.' },
        ],
      },
      {
        id: 'basics-2',
        title: 'Core Features',
        description: 'Projects, Memory, Artifacts, and Web Search.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 8,
        resource: { title: 'What Are Projects', url: 'https://support.claude.com/en/articles/9517075-what-are-projects', source: 'Claude Support' },
        questions: [
          { id: 'b2q1', type: 'mcq', question: 'What do Claude Projects allow you to do?', options: ['Run code on your computer', 'Create persistent workspaces with custom instructions and files', 'Train your own AI model', 'Share Claude with other users for free'], correctIndex: 1, explanation: 'Projects let you upload files and set custom instructions that Claude reads before every conversation in that workspace.' },
          { id: 'b2q2', type: 'mcq', question: 'What are Artifacts?', options: ['Bugs left over from training', 'Live, interactive outputs like React apps, charts, and documents', 'Saved conversation logs', 'API access tokens'], correctIndex: 1, explanation: 'Artifacts are live outputs that Claude creates inline: React apps, HTML pages, SVGs, documents, and more.' },
          { id: 'b2q3', type: 'mcq', question: 'How does Claude Memory work?', options: ['You must manually save everything', 'Claude remembers preferences across conversations automatically', 'Memory resets every 24 hours', 'It only works with Pro plans'], correctIndex: 1, explanation: 'Claude\'s Memory builds automatically, remembering your name, preferences, role, and technical level across conversations.' },
        ],
      },
      {
        id: 'basics-3',
        title: 'First Steps Challenge',
        description: 'Prove you know the basics. Pass to unlock the next tier.',
        type: 'challenge',
        xpReward: 150,
        timeMinutes: 5,
        questions: [
          { id: 'b3q1', type: 'mcq', question: 'You want Claude to always respond in bullet points with a formal tone. Where do you set this?', options: ['In every message you send', 'In a Project\'s custom instructions', 'In the URL parameters', 'You can\'t, Claude decides its own style'], correctIndex: 1, explanation: 'Project custom instructions are read before every message. They\'re the right place for persistent behavior preferences.' },
          { id: 'b3q2', type: 'mcq', question: 'What happens when Claude\'s context window fills past 50%?', options: ['Nothing, it handles it fine', 'Accuracy can start to degrade', 'Claude refuses to continue', 'It switches to a smaller model'], correctIndex: 1, explanation: 'As context fills past 50%, Claude\'s accuracy begins to degrade. This is why context management matters.' },
          { id: 'b3q3', type: 'prompt-battle', question: 'You need Claude to review your resume. Which approach is better?', promptA: 'Review my resume and tell me what to fix.', promptB: 'Review my resume for a Senior Frontend Developer role at a FAANG company. Focus on: (1) impact metrics in bullet points, (2) technical keyword coverage, (3) anything that looks junior. Be brutally honest.', correctPrompt: 'B', reasons: [{ text: 'Specifies the target role and company type', isCorrect: true }, { text: 'Defines specific review criteria', isCorrect: true }, { text: 'Is longer, so it must be better', isCorrect: false }, { text: 'Sets the tone ("brutally honest")', isCorrect: true }], explanation: 'Context (target role), specific criteria, and tone guidance give Claude the framing to provide actionable, relevant feedback instead of generic advice.' },
          { id: 'b3q4', type: 'mcq', question: 'Why might you create separate Projects for different tasks?', options: ['To avoid Claude getting confused by mixing contexts', 'Projects have file size limits', 'You can only have one conversation per Project', 'It\'s required by the Terms of Service'], correctIndex: 0, explanation: 'Separate Projects keep context clean. Claude reads all uploaded files and instructions — mixing unrelated contexts reduces quality.' },
        ],
      },
    ],
  },

  // === TIER 2: CRAFT ===
  {
    id: 'prompting',
    title: 'Prompt Engineering',
    emoji: '✍️',
    description: 'Write clear, structured instructions that get consistent results.',
    tier: 'craft',
    position: { x: 25, y: 28 },
    requires: ['basics'],
    quests: [
      {
        id: 'prompt-1',
        title: 'The Art of Prompting',
        description: 'XML tags, chain-of-thought, role prompts, and few-shot examples.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 10,
        resource: { title: 'Prompt Engineering Guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', source: 'Anthropic Docs' },
        questions: [
          { id: 'p1q1', type: 'mcq', question: 'What are XML tags used for in Claude prompts?', options: ['Making prompts look professional', 'Structuring and separating different parts of the prompt', 'Sending data to an API', 'They\'re not used in prompting'], correctIndex: 1, explanation: 'XML tags like <instructions>, <context>, <examples> help Claude understand the structure and purpose of different prompt sections.' },
          { id: 'p1q2', type: 'mcq', question: 'What is chain-of-thought prompting?', options: ['Linking multiple conversations together', 'Asking Claude to show its reasoning step by step', 'A technique to speed up responses', 'Using multiple API calls in sequence'], correctIndex: 1, explanation: 'Chain-of-thought asks Claude to reason step by step before giving a final answer, improving accuracy on complex tasks.' },
          { id: 'p1q3', type: 'mcq', question: 'What are few-shot examples in a prompt?', options: ['Short prompts with few words', 'Sample input-output pairs that show the expected format', 'Prompts that work with Haiku only', 'Random examples from the internet'], correctIndex: 1, explanation: 'Few-shot examples show Claude exactly what input and output look like, calibrating responses to match your expected format and style.' },
        ],
      },
      {
        id: 'prompt-2',
        title: 'Prompt Builder',
        description: 'Assemble prompts from components. Order matters.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 12,
        resource: { title: 'Interactive Prompt Tutorial', url: 'https://github.com/anthropics/prompt-eng-interactive-tutorial', source: 'Anthropic GitHub' },
        questions: [
          {
            id: 'p2q1', type: 'prompt-build',
            question: 'Build a prompt for Claude to extract key data from a legal contract. Arrange these components in the most effective order:',
            components: [
              '<task>Extract the following fields: parties, effective date, termination clause, payment terms, liability caps</task>',
              '<role>You are a legal document analyst with expertise in commercial contracts.</role>',
              '<format>Return a JSON object with each field as a key. Use null for missing fields.</format>',
              '<document>{{contract_text}}</document>',
              '<rules>If a clause is ambiguous, flag it with "REVIEW_NEEDED" instead of guessing.</rules>',
            ],
            correctOrder: [1, 3, 0, 4, 2],
            explanation: 'Role first (sets the lens), then context (the document), then the task, then edge-case rules, and finally the output format. This mirrors how a human expert would approach the work.'
          },
          {
            id: 'p2q2', type: 'spot-error',
            question: 'This prompt has several issues. Identify all of them:',
            prompt: 'You are a helpful AI assistant. Please analyze the following data and provide insights. Be thorough but concise. Make sure your analysis is good. Here is the data: [data goes here]. Thanks!',
            issues: [
              { text: 'No specific role or domain expertise defined', isIssue: true },
              { text: '"Be thorough but concise" is contradictory without guidance', isIssue: true },
              { text: '"Make sure your analysis is good" is vague and meaningless', isIssue: true },
              { text: 'No output format specified', isIssue: true },
              { text: 'Using "Please" is too polite', isIssue: false },
              { text: '"Thanks!" wastes tokens', isIssue: false },
            ],
            explanation: 'Vague instructions ("be good"), contradictory guidance without priorities ("thorough but concise"), generic roles, and missing output format are the real problems. Politeness is fine and doesn\'t hurt.'
          },
          {
            id: 'p2q3', type: 'prompt-battle',
            question: 'You want Claude to generate 5 blog post titles about AI in healthcare. Which prompt works better?',
            promptA: 'Give me 5 blog post titles about AI in healthcare.',
            promptB: '<role>You are a content strategist for a health-tech startup blog targeting CTOs and VPs of Engineering at hospitals.</role>\n\n<task>Generate 5 blog post titles about AI in healthcare.</task>\n\n<guidelines>\n- Mix educational and provocative angles\n- Include one data-driven title and one contrarian take\n- Avoid clichés like "revolutionizing" or "transforming"\n- Each title should be 8-12 words\n</guidelines>\n\n<examples>\nGood: "Why Your Hospital\'s AI Strategy Is Probably Backwards"\nBad: "How AI Is Revolutionizing Healthcare"\n</examples>',
            correctPrompt: 'B',
            reasons: [
              { text: 'Defines target audience and context', isCorrect: true },
              { text: 'Uses XML tags for structure', isCorrect: true },
              { text: 'Includes style constraints and anti-patterns', isCorrect: true },
              { text: 'Provides good/bad examples', isCorrect: true },
              { text: 'Is more complex so it must be better', isCorrect: false },
            ],
            explanation: 'The structured prompt defines who the audience is, what angles to cover, what to avoid, and shows examples. This produces targeted, on-brand titles instead of generic ones.'
          },
        ],
      },
      {
        id: 'prompt-3',
        title: 'Error Spotter',
        description: 'Find the flaws in real-world prompts.',
        type: 'challenge',
        xpReward: 150,
        timeMinutes: 10,
        questions: [
          {
            id: 'p3q1', type: 'spot-error',
            question: 'This API system prompt has issues. Find them all:',
            prompt: 'You are a customer service bot. Answer questions about our products. Our products include Widget Pro ($49.99), Widget Basic ($19.99), and Widget Enterprise (contact sales). Always be helpful and never say you don\'t know something. If a customer asks about a competitor, say our product is better.',
            issues: [
              { text: '"Never say you don\'t know" encourages hallucination', isIssue: true },
              { text: '"Say our product is better" without evidence is dishonest', isIssue: true },
              { text: 'No escalation path for complex issues', isIssue: true },
              { text: 'Product prices will get outdated in the prompt', isIssue: true },
              { text: 'Using "bot" instead of "assistant" is unprofessional', isIssue: false },
              { text: 'The prompt is too short', isIssue: false },
            ],
            explanation: 'The critical issues: forcing Claude to never say "I don\'t know" leads to fabricated answers. Dishonest competitor comparisons erode trust. No escalation path means complex issues get bad AI responses. Hardcoded prices will become stale.'
          },
          {
            id: 'p3q2', type: 'prompt-build',
            question: 'Build a chain-of-thought prompt for debugging a code error:',
            components: [
              '<error_message>{{error}}</error_message>',
              '<instructions>Before suggesting a fix, think through the problem step by step in <thinking> tags.</instructions>',
              '<code>{{user_code}}</code>',
              '<output_format>After your analysis, provide: (1) Root cause in one sentence, (2) The fix as a code diff, (3) How to prevent this class of bug.</output_format>',
              '<context>Language: {{language}}, Framework: {{framework}}, Runtime: {{runtime_version}}</context>',
            ],
            correctOrder: [4, 2, 0, 1, 3],
            explanation: 'Context (language/framework) first, then the code, then the error, then the instruction to think step-by-step, and finally the output format. You give Claude all the information before asking it to reason.'
          },
          {
            id: 'p3q3', type: 'mcq',
            question: 'Your prompt returns inconsistent formatting across runs. Best fix?',
            options: ['Try again until it works', 'Add 2-3 few-shot examples showing the exact output format', 'Switch to a bigger model', 'Make the prompt shorter'],
            correctIndex: 1,
            explanation: 'Few-shot examples are the most reliable way to get consistent formatting. Claude learns the pattern from concrete examples.'
          },
        ],
      },
      {
        id: 'prompt-4',
        title: 'Prompt Gauntlet',
        description: 'The ultimate prompt engineering challenge.',
        type: 'challenge',
        xpReward: 200,
        timeMinutes: 10,
        questions: [
          {
            id: 'p4q1', type: 'spot-error',
            question: 'Find all the issues in this complex prompt:',
            prompt: 'Act as a senior data scientist. I have a CSV file with customer data. Clean the data, find patterns, build a predictive model, create visualizations, write a report, and present your findings. Use Python. Make it production-ready.',
            issues: [
              { text: 'Too many tasks in one prompt without prioritization', isIssue: true },
              { text: '"Clean the data" is undefined (what counts as clean?)', isIssue: true },
              { text: '"Production-ready" is vague without specifications', isIssue: true },
              { text: 'No information about the data schema or columns', isIssue: true },
              { text: 'Should use R instead of Python', isIssue: false },
              { text: '"Act as" is a bad way to set roles', isIssue: false },
            ],
            explanation: 'This prompt asks for 6 different tasks with no prioritization, no data schema, vague quality standards, and no definition of what "clean" means. Break it into focused steps and provide specifics.'
          },
          {
            id: 'p4q2', type: 'prompt-battle',
            question: 'You need Claude to translate a technical document from English to Japanese:',
            promptA: 'Translate this document to Japanese:\n\n{{document}}',
            promptB: '<task>Translate the following technical document from English to Japanese.</task>\n\n<guidelines>\n- Preserve all technical terms in their standard Japanese equivalents (e.g., API remains API)\n- Maintain the document structure (headers, lists, code blocks)\n- Use です/ます form (formal)\n- Add translator notes in [TN: ...] for terms with no standard Japanese equivalent\n</guidelines>\n\n<document>\n{{document}}\n</document>',
            correctPrompt: 'B',
            reasons: [
              { text: 'Specifies how to handle technical terms', isCorrect: true },
              { text: 'Preserves document structure explicitly', isCorrect: true },
              { text: 'Sets formality level', isCorrect: true },
              { text: 'Handles edge cases (untranslatable terms)', isCorrect: true },
              { text: 'Uses Japanese XML tags', isCorrect: false },
            ],
            explanation: 'Technical translation needs explicit rules for terminology, formality, structure preservation, and edge cases. Without these, you get inconsistent, sometimes wrong translations.'
          },
          {
            id: 'p4q3', type: 'mcq',
            question: 'Which is the MOST important principle of prompt engineering?',
            options: [
              'Use the longest possible prompt',
              'Be specific about what you want and how you want it',
              'Always use XML tags',
              'Include at least 10 examples',
            ],
            correctIndex: 1,
            explanation: 'Specificity is the foundation. XML tags and examples are techniques for achieving specificity, but they\'re means, not the principle itself. A short, specific prompt beats a long, vague one.'
          },
        ],
      },
    ],
  },
  {
    id: 'projects-memory',
    title: 'Projects & Memory',
    emoji: '📁',
    description: 'Build persistent workspaces that remember context.',
    tier: 'craft',
    position: { x: 75, y: 28 },
    requires: ['basics'],
    quests: [
      {
        id: 'pm-1',
        title: 'Workspace Design',
        description: 'Design effective Projects with instructions and files.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 8,
        resource: { title: 'How to Use Projects', url: 'https://support.claude.com/en/articles/9517075-what-are-projects', source: 'Claude Support' },
        questions: [
          { id: 'pm1q1', type: 'mcq', question: 'When should you upload reference files to a Project vs. pasting them in chat?', options: ['Always paste in chat for freshness', 'Upload to Project when the same files are needed across multiple conversations', 'It doesn\'t matter', 'Only upload PDFs, paste everything else'], correctIndex: 1, explanation: 'Project files persist across conversations. Upload reference material that applies broadly; paste only per-conversation specifics.' },
          { id: 'pm1q2', type: 'mcq', question: 'What\'s the most impactful thing you can write in Project instructions?', options: ['Your name and job title', 'The specific role Claude should play and how to handle edge cases', 'A disclaimer about AI limitations', 'A greeting message'], correctIndex: 1, explanation: 'Clear role definition and edge-case guidance dramatically improve Claude\'s consistency and relevance.' },
          { id: 'pm1q3', type: 'prompt-battle', question: 'You\'re setting up a Project for code reviews. Which custom instruction is better?', promptA: 'You help review code. Be helpful and thorough.', promptB: 'You are a senior code reviewer focused on TypeScript/React codebases.\n\nReview priorities (in order):\n1. Security vulnerabilities (XSS, injection, auth bypasses)\n2. Logic errors and edge cases\n3. Performance issues (N+1 queries, unnecessary re-renders)\n4. Type safety (any usage, missing null checks)\n5. Style and readability (last priority)\n\nFor each issue found:\n- Severity: 🔴 critical / 🟡 warning / 🔵 nit\n- Line reference\n- What\'s wrong\n- Suggested fix (code snippet)\n\nDo NOT suggest changes that are purely stylistic unless they hurt readability.', correctPrompt: 'B', reasons: [{ text: 'Defines a specific tech stack', isCorrect: true }, { text: 'Prioritizes review criteria', isCorrect: true }, { text: 'Specifies output format with severity levels', isCorrect: true }, { text: 'Sets boundaries on what NOT to flag', isCorrect: true }, { text: 'Is longer which means it\'s better', isCorrect: false }], explanation: 'Effective Project instructions define the role, prioritize what matters, specify the output format, and set boundaries. This eliminates noise and ensures consistent, actionable reviews.' },
        ],
      },
      {
        id: 'pm-2',
        title: 'Memory Mastery',
        description: 'Understand how Claude remembers and how to shape it.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 10,
        questions: [
          { id: 'pm2q1', type: 'mcq', question: 'Claude keeps calling you by the wrong name. What should you do?', options: ['Start every message with your name', 'Go to Settings → Memory and edit or delete the incorrect entry', 'Create a new account', 'Ignore it'], correctIndex: 1, explanation: 'Memory entries can be viewed, edited, and deleted in Settings. Fix incorrect memories directly.' },
          { id: 'pm2q2', type: 'mcq', question: 'You want Claude to always use your company\'s specific terminology. Best approach?', options: ['Correct it every time in chat', 'Add a glossary to Project instructions', 'Hope it learns from context', 'Use the API instead'], correctIndex: 1, explanation: 'A glossary in Project instructions ensures consistent terminology from the first message.' },
          { id: 'pm2q3', type: 'mcq', question: 'What\'s the relationship between Project instructions and Memory?', options: ['They\'re the same thing', 'Project instructions are per-workspace; Memory is global across all conversations', 'Memory overrides Project instructions', 'Projects don\'t work with Memory enabled'], correctIndex: 1, explanation: 'Project instructions apply within a workspace. Memory persists globally. They complement each other.' },
        ],
      },
    ],
  },

  // === TIER 3: SYSTEMS ===
  {
    id: 'context-eng',
    title: 'Context Engineering',
    emoji: '🧬',
    description: 'Manage the full context window like a pro.',
    tier: 'systems',
    position: { x: 25, y: 48 },
    requires: ['prompting'],
    quests: [
      {
        id: 'ctx-1',
        title: 'The Context Window',
        description: 'Why context management is the real skill.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 12,
        resource: { title: 'Context Engineering for AI Agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', source: 'Anthropic Engineering' },
        questions: [
          { id: 'cx1q1', type: 'mcq', question: 'What\'s the difference between prompt engineering and context engineering?', options: ['They\'re the same thing', 'Prompt engineering is one instruction; context engineering manages the full state across turns, tools, and memory', 'Context engineering is for APIs only', 'Prompt engineering is newer'], correctIndex: 1, explanation: 'Prompt engineering focuses on one instruction. Context engineering manages everything in the window: history, tool results, memory, documents.' },
          { id: 'cx1q2', type: 'mcq', question: 'At what context utilization does accuracy start to degrade?', options: ['10%', '25%', '50%', '90%'], correctIndex: 2, explanation: 'Anthropic\'s research shows accuracy begins degrading past 50% context utilization. Managing what stays in the window is critical.' },
          { id: 'cx1q3', type: 'mcq', question: 'What is "just-in-time retrieval" in context engineering?', options: ['Loading everything at the start', 'Fetching only the information needed for the current step', 'Using RAG for every query', 'Caching all documents in memory'], correctIndex: 1, explanation: 'Just-in-time retrieval loads information only when needed, keeping the context window lean and focused.' },
        ],
      },
      {
        id: 'ctx-2',
        title: 'Context Architect',
        description: 'Design context strategies for real scenarios.',
        type: 'challenge',
        xpReward: 200,
        timeMinutes: 10,
        questions: [
          { id: 'cx2q1', type: 'mcq', question: 'You\'re building a coding agent that needs to work on a 50,000-line codebase. How do you handle context?', options: ['Paste the entire codebase into the prompt', 'Use tool search to load only relevant files on demand', 'Split it into 10 messages', 'Use a model with a bigger context window'], correctIndex: 1, explanation: 'Tool search loads only relevant code on demand. Pasting everything would destroy quality and hit limits.' },
          { id: 'cx2q2', type: 'mcq', question: 'Your agent has been running for 50 turns and quality is dropping. What happened?', options: ['The model is getting tired', 'Context is filling up. Use compaction to summarize earlier turns and continue fresh', 'Switch to a different model', 'Add more system prompt instructions'], correctIndex: 1, explanation: 'After many turns, context fills up. Compaction summarizes earlier conversation, freeing space for focused context.' },
          {
            id: 'cx2q3', type: 'prompt-build',
            question: 'You\'re designing a customer email processing pipeline. Arrange these context management steps:',
            components: [
              'Classify the email (intent, urgency, sentiment)',
              'Load only the relevant customer record from the database',
              'Generate a response using the customer context + classification',
              'Validate the response (tone, accuracy, compliance)',
              'Archive the interaction and update the customer record',
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: 'Classify first (cheap, determines what context to load), then fetch only relevant data (just-in-time), generate with focused context, validate before sending, then persist. Each step uses minimal context.'
          },
        ],
      },
    ],
  },
  {
    id: 'artifacts',
    title: 'Artifacts & Creation',
    emoji: '🎨',
    description: 'Create live, interactive outputs and work with files.',
    tier: 'systems',
    position: { x: 75, y: 48 },
    requires: ['projects-memory'],
    quests: [
      {
        id: 'art-1',
        title: 'Building with Artifacts',
        description: 'Create React apps, charts, documents, and more inline.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 8,
        resource: { title: 'What Are Artifacts', url: 'https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them', source: 'Claude Support' },
        questions: [
          { id: 'a1q1', type: 'mcq', question: 'What can Claude Artifacts NOT do?', options: ['Create React components', 'Run server-side code with a database', 'Generate SVG graphics', 'Build interactive HTML pages'], correctIndex: 1, explanation: 'Artifacts run client-side only. React apps, HTML, SVGs, charts, documents, yes. Server-side code with databases, no.' },
          { id: 'a1q2', type: 'mcq', question: 'How much persistent storage do Artifacts have access to?', options: ['None', '1MB', '20MB', 'Unlimited'], correctIndex: 2, explanation: 'Artifacts can use up to 20MB of persistent storage, enabling stateful applications that remember data between sessions.' },
          { id: 'a1q3', type: 'mcq', question: 'What\'s the best way to iterate on an Artifact?', options: ['Start over from scratch each time', 'Tell Claude specifically what to change', 'Edit the code manually', 'Create a new conversation'], correctIndex: 1, explanation: 'Claude can modify existing Artifacts incrementally. Be specific about what to change rather than regenerating everything.' },
          { id: 'a1q4', type: 'prompt-battle', question: 'You want Claude to build a dashboard Artifact. Which prompt?', promptA: 'Make me a dashboard.', promptB: 'Create a React Artifact: a sales dashboard with 3 cards (revenue, orders, conversion rate), a line chart showing monthly revenue for the last 12 months (use mock data), and a table of top 5 products. Use a clean dark theme. Make it responsive.', correctPrompt: 'B', reasons: [{ text: 'Specifies exact components needed', isCorrect: true }, { text: 'Mentions mock data so Claude doesn\'t ask for it', isCorrect: true }, { text: 'Includes design direction (dark theme)', isCorrect: true }, { text: 'Mentions React Artifact explicitly', isCorrect: true }, { text: 'Has more words', isCorrect: false }], explanation: 'Specific component requirements, design direction, and data guidance give Claude everything it needs to produce a complete, usable Artifact on the first try.' },
        ],
      },
    ],
  },

  // === TIER 4: MASTERY ===
  {
    id: 'api-sdk',
    title: 'API & SDK',
    emoji: '⚡',
    description: 'Integrate Claude into your applications.',
    tier: 'mastery',
    position: { x: 15, y: 68 },
    requires: ['context-eng'],
    quests: [
      {
        id: 'api-1',
        title: 'API Fundamentals',
        description: 'Authentication, messages API, streaming.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 12,
        resource: { title: 'API Course', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', source: 'Anthropic Academy' },
        questions: [
          { id: 'api1q1', type: 'mcq', question: 'What\'s the primary authentication method for the Claude API?', options: ['Username and password', 'API key in the x-api-key header', 'OAuth token only', 'No authentication needed'], correctIndex: 1, explanation: 'The Claude API uses API keys passed in the x-api-key header.' },
          { id: 'api1q2', type: 'mcq', question: 'What format does the Claude API use for messages?', options: ['Plain text only', 'A messages array with role (user/assistant) and content', 'XML only', 'JSON-RPC'], correctIndex: 1, explanation: 'The Messages API uses an array of message objects with role and content fields.' },
          { id: 'api1q3', type: 'mcq', question: 'Your API integration sometimes returns unexpected JSON structures. Best fix?', options: ['Parse it manually each time', 'Use structured outputs with a JSON schema to constrain the response', 'Add "please return valid JSON" to the prompt', 'Retry until it works'], correctIndex: 1, explanation: 'Structured outputs with a defined JSON schema guarantee the response matches your expected format.' },
        ],
      },
      {
        id: 'api-2',
        title: 'Production Patterns',
        description: 'Batch API, rate limits, cost optimization.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 12,
        resource: { title: 'Anthropic Cookbook', url: 'https://github.com/anthropics/anthropic-cookbook', source: 'Anthropic GitHub' },
        questions: [
          { id: 'api2q1', type: 'mcq', question: 'You need to classify 1,000 support tickets. Best approach?', options: ['Send them one at a time', 'Use the Batch API for bulk processing at 50% cost', 'Paste all 1,000 in one message', 'Use streaming for each'], correctIndex: 1, explanation: 'The Batch API processes large volumes asynchronously at 50% cost. Ideal for non-time-sensitive bulk work.' },
          { id: 'api2q2', type: 'prompt-battle', question: 'You\'re building a production API integration. Which error handling approach?', promptA: 'try {\n  const response = await anthropic.messages.create({...});\n  return response;\n} catch (e) {\n  console.log("Error:", e);\n  return null;\n}', promptB: 'const MAX_RETRIES = 3;\nfor (let attempt = 0; attempt < MAX_RETRIES; attempt++) {\n  try {\n    const response = await anthropic.messages.create({...});\n    return response;\n  } catch (e) {\n    if (e.status === 429) {\n      await sleep(Math.pow(2, attempt) * 1000);\n      continue;\n    }\n    if (e.status >= 500) {\n      await sleep(1000);\n      continue;\n    }\n    throw e; // Client error, don\'t retry\n  }\n}\nthrow new Error("Max retries exceeded");', correctPrompt: 'B', reasons: [{ text: 'Implements exponential backoff for rate limits', isCorrect: true }, { text: 'Differentiates between retryable and non-retryable errors', isCorrect: true }, { text: 'Has a retry limit to prevent infinite loops', isCorrect: true }, { text: 'Uses more lines of code', isCorrect: false }], explanation: 'Production code needs exponential backoff for rate limits (429), retry logic for server errors (5xx), and immediate failure for client errors (4xx). Silent failures (returning null) are dangerous.' },
        ],
      },
    ],
  },
  {
    id: 'claude-code',
    title: 'Claude Code',
    emoji: '💻',
    description: 'Agentic coding in your terminal.',
    tier: 'mastery',
    position: { x: 50, y: 62 },
    requires: ['context-eng', 'artifacts'],
    quests: [
      {
        id: 'cc-1',
        title: 'Terminal Power',
        description: 'Install Claude Code and learn the core workflow.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 10,
        resource: { title: 'Claude Code Docs', url: 'https://code.claude.com/docs/en/overview', source: 'Claude Code Docs' },
        questions: [
          { id: 'cc1q1', type: 'mcq', question: 'What is CLAUDE.md?', options: ['A markdown guide about Claude', 'A config file that gives Claude Code project-specific context and rules', 'An API documentation format', 'A commit message template'], correctIndex: 1, explanation: 'CLAUDE.md is read by Claude Code at session start. It contains project context, coding standards, and behavioral rules.' },
          { id: 'cc1q2', type: 'mcq', question: 'What can Claude Code do that chat Claude cannot?', options: ['Think harder', 'Read/write files, run terminal commands, and manage Git on your machine', 'Use a bigger context window', 'Access the internet'], correctIndex: 1, explanation: 'Claude Code operates as a terminal agent: reading codebases, writing files, running commands, executing tests, and managing Git directly on your machine.' },
          { id: 'cc1q3', type: 'prompt-battle', question: 'You want Claude Code to add a feature. Which instruction?', promptA: 'Add dark mode to the app.', promptB: 'Add dark mode to the app.\n\n1. First, read the existing theme system in src/styles/\n2. Add a ThemeProvider with localStorage persistence\n3. Add a toggle button in the header (sun/moon icon)\n4. Run the existing tests after changes\n5. Don\'t modify any test files', correctPrompt: 'B', reasons: [{ text: 'Tells Claude Code where to look first', isCorrect: true }, { text: 'Breaks the task into clear steps', isCorrect: true }, { text: 'Includes a verification step (run tests)', isCorrect: true }, { text: 'Sets boundaries (don\'t modify tests)', isCorrect: true }, { text: 'Uses numbered lists', isCorrect: false }], explanation: 'Step-by-step instructions with read-first, specific implementation details, verification, and boundaries give Claude Code a clear execution plan.' },
        ],
      },
      {
        id: 'cc-2',
        title: 'Code Mastery',
        description: 'Advanced workflows: refactoring, testing, multi-file changes.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 12,
        resource: { title: 'Best Practices', url: 'https://www.anthropic.com/engineering/claude-code-best-practices', source: 'Anthropic Engineering' },
        questions: [
          { id: 'cc2q1', type: 'mcq', question: 'You want Claude Code to refactor a module without breaking tests. Best approach?', options: ['Just say "refactor this"', 'Ask it to run tests first, then refactor, then run tests again', 'Refactor manually and ask Claude to review', 'Hope for the best'], correctIndex: 1, explanation: 'The test-refactor-test loop is the gold standard. Claude Code runs your test suite before and after changes to ensure nothing breaks.' },
          { id: 'cc2q2', type: 'mcq', question: 'Your CLAUDE.md is 500 lines long. What\'s wrong?', options: ['Nothing, more context is better', 'Too long. The entrypoint should be under 200 lines, use @imports for details', 'Claude Code can\'t read files that long', 'You need to compress it'], correctIndex: 1, explanation: 'Keep CLAUDE.md under 200 lines. Use @imports to reference additional files for detailed context.' },
          {
            id: 'cc2q3', type: 'spot-error',
            question: 'This CLAUDE.md has problems. Find them:',
            prompt: '# Project\nThis is a React project.\n\n# Rules\n- Use any libraries you want\n- Make the code look nice\n- Follow best practices\n- Be creative with solutions\n\n# Stack\nWe use React, Node, Postgres, Redis, Kafka, gRPC, GraphQL, REST, WebSockets, Docker, K8s, Terraform, AWS, and more.',
            issues: [
              { text: '"Use any libraries you want" gives too much freedom', isIssue: true },
              { text: '"Follow best practices" is meaninglessly vague', isIssue: true },
              { text: 'The stack list is too broad to be useful context', isIssue: true },
              { text: 'No file structure or architecture guidance', isIssue: true },
              { text: 'Should be written in JSON instead', isIssue: false },
              { text: 'Missing a copyright notice', isIssue: false },
            ],
            explanation: 'CLAUDE.md should be specific: which libraries are approved, what "best practices" means in this project, which parts of the stack are relevant, and where key files live.'
          },
        ],
      },
    ],
  },
  {
    id: 'tool-use',
    title: 'Tools & MCP',
    emoji: '🔌',
    description: 'Connect Claude to external tools and data sources.',
    tier: 'mastery',
    position: { x: 85, y: 68 },
    requires: ['artifacts'],
    quests: [
      {
        id: 'tools-1',
        title: 'Function Calling',
        description: 'Give Claude the ability to use external tools.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 12,
        resource: { title: 'Tool Use Overview', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', source: 'Anthropic Docs' },
        questions: [
          { id: 't1q1', type: 'mcq', question: 'What is a "tool schema" in Claude\'s tool use?', options: ['A visual diagram', 'A JSON definition of a function\'s name, description, and parameters', 'A database schema', 'A testing framework'], correctIndex: 1, explanation: 'Tool schemas define available functions with names, descriptions, and parameter types. Claude reads these to decide when and how to call tools.' },
          { id: 't1q2', type: 'mcq', question: 'What is MCP (Model Context Protocol)?', options: ['A networking protocol', 'A standard protocol for connecting AI models to external tools and data sources', 'A compression format', 'A training technique'], correctIndex: 1, explanation: 'MCP standardizes how AI models connect to external tools, data sources, and services.' },
          { id: 't1q3', type: 'mcq', question: 'An MCP server exposes:', options: ['A REST API', 'Tools, resources, and prompts through a standardized protocol', 'A web interface', 'Only database queries'], correctIndex: 1, explanation: 'MCP servers expose three primitives: tools (functions), resources (data), and prompts (reusable templates).' },
        ],
      },
      {
        id: 'tools-2',
        title: 'MCP Deep Dive',
        description: 'Design and connect MCP servers.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 12,
        resource: { title: 'MCP Getting Started', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol', source: 'Anthropic Academy' },
        questions: [
          { id: 't2q1', type: 'mcq', question: 'What transport protocols does MCP support?', options: ['HTTP only', 'stdio (local) and SSE/HTTP (remote)', 'WebSocket only', 'gRPC'], correctIndex: 1, explanation: 'MCP supports stdio for local servers (fast, no networking) and SSE/HTTP for remote servers (accessible over the network).' },
          {
            id: 't2q2', type: 'prompt-build',
            question: 'You\'re building an MCP server for a company wiki. Arrange the design steps:',
            components: [
              'Define tool schemas (search_wiki, get_page, list_categories)',
              'Implement the transport layer (stdio for local, SSE for remote)',
              'Build the data access layer (wiki API client with auth)',
              'Add resource definitions (wiki://pages, wiki://categories)',
              'Test with Claude Code and iterate on tool descriptions',
            ],
            correctOrder: [2, 0, 3, 1, 4],
            explanation: 'Start with data access (the foundation), then define what tools to expose, add resource definitions, implement the transport, and finally test with a real client. Build from the inside out.'
          },
          { id: 't2q3', type: 'mcq', question: 'You want to connect Claude Code to your company\'s internal wiki. Best approach?', options: ['Copy-paste wiki pages into chat', 'Build an MCP server that searches and retrieves wiki content on demand', 'Upload the entire wiki as files', 'Use web search'], correctIndex: 1, explanation: 'An MCP server provides on-demand retrieval, keeping context lean. Just-in-time retrieval in action.' },
        ],
      },
    ],
  },

  // === FINAL BOSS ===
  {
    id: 'agent-design',
    title: 'Agent Design',
    emoji: '🤖',
    description: 'Design autonomous agents that think, plan, and execute.',
    tier: 'mastery',
    position: { x: 50, y: 88 },
    requires: ['claude-code', 'api-sdk', 'tool-use'],
    quests: [
      {
        id: 'agent-1',
        title: 'Agent Patterns',
        description: 'The 5 fundamental agent architectures.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 15,
        resource: { title: 'Building Effective Agents', url: 'https://www.anthropic.com/engineering/building-effective-agents', source: 'Anthropic Engineering' },
        questions: [
          { id: 'ag1q1', type: 'mcq', question: 'What\'s the simplest agent pattern?', options: ['Multi-agent orchestration', 'The augmented LLM: retrieval + tools + memory', 'Prompt chaining', 'Parallelization'], correctIndex: 1, explanation: 'The augmented LLM is the building block: an LLM with retrieval, tools, and memory. Everything else builds on this.' },
          { id: 'ag1q2', type: 'mcq', question: 'When should you use routing vs. prompt chaining?', options: ['They\'re interchangeable', 'Routing classifies and directs; chaining executes sequential steps', 'Routing is faster', 'Chaining is deprecated'], correctIndex: 1, explanation: 'Routing classifies inputs and directs to specialized handlers. Chaining executes steps in sequence with checks between each.' },
          { id: 'ag1q3', type: 'mcq', question: 'What is parallelization in agent design?', options: ['Running the same prompt twice', 'Running multiple sub-tasks simultaneously and aggregating results', 'Using multiple API keys', 'Multi-threading the application'], correctIndex: 1, explanation: 'Parallelization splits a task into independent sub-tasks, processes them simultaneously, and aggregates the results.' },
        ],
      },
      {
        id: 'agent-2',
        title: 'Agent Architect: Final Boss',
        description: 'Design a production agent system from scratch. The ultimate test.',
        type: 'boss',
        xpReward: 500,
        timeMinutes: 20,
        resource: { title: 'Agent SDK', url: 'https://docs.anthropic.com/en/docs/claude-code/sdk', source: 'Anthropic Docs' },
        questions: [
          {
            id: 'ag2q1', type: 'prompt-build',
            question: 'Design a customer support agent system. Arrange the components in the right architecture order:',
            components: [
              'Specialized handlers: RefundAgent, OrderStatusAgent, TechnicalSupportAgent (each with focused tools)',
              'Router: classify intent (refund? order status? technical? escalation?) using Haiku',
              'Input validation: check for PII, profanity, injection attempts',
              'Human escalation path: confidence threshold + complexity check',
              'Response quality gate: verify accuracy, tone, compliance before sending',
              'Conversation memory: persist context for multi-turn interactions',
            ],
            correctOrder: [2, 5, 1, 0, 4, 3],
            explanation: 'Validate input first (security), load conversation memory (context), route to the right handler (efficiency), process with specialized agents (quality), validate output (safety), then have an escape hatch to humans (reliability). Defense in depth.'
          },
          {
            id: 'ag2q2', type: 'mcq',
            question: 'Your agent needs to maintain state across sessions. Best approach?',
            options: ['Keep the conversation going forever', 'Progress files and CLAUDE.md to persist state; compact and resume from checkpoints', 'Store everything in Memory', 'Use a database only'],
            correctIndex: 1,
            explanation: 'Progress files and CLAUDE.md provide persistent state that survives compaction and session boundaries. This is the "effective harnesses" pattern.'
          },
          {
            id: 'ag2q3', type: 'spot-error',
            question: 'This multi-agent architecture has problems. Find them:',
            prompt: 'Architecture:\n- All 5 agents share the same context window\n- Each agent uses Opus (our most powerful model)\n- Agents communicate by appending to a shared text file\n- No output validation between agents\n- Retry on any error up to 100 times\n- All agents have full database access',
            issues: [
              { text: 'Shared context window causes cross-contamination', isIssue: true },
              { text: 'Using Opus for everything wastes money on simple tasks', isIssue: true },
              { text: 'No output validation means errors cascade between agents', isIssue: true },
              { text: '100 retries can cause runaway costs', isIssue: true },
              { text: 'All agents having full DB access violates least privilege', isIssue: true },
              { text: 'Text file communication is too simple', isIssue: false },
            ],
            explanation: 'Every issue is a real production risk: shared context causes interference, uniform models waste money, missing validation cascades errors, excessive retries burn budget, and broad DB access is a security risk. Text file communication is actually fine for simple systems.'
          },
          {
            id: 'ag2q4', type: 'mcq',
            question: 'How do you decide which model to use for each agent?',
            options: ['Use the best model for everything', 'Match model to task: Haiku for classification, Sonnet for coding, Opus for complex reasoning', 'Use the cheapest everywhere', 'Let the user choose'],
            correctIndex: 1,
            explanation: 'Model routing matches capability to need: fast/cheap models for simple tasks, powerful models for complex reasoning. Optimizes both cost and quality.'
          },
          {
            id: 'ag2q5', type: 'mcq',
            question: 'What\'s the most important lesson from Anthropic\'s agent design guide?',
            options: ['Use the latest model', 'Start simple. The augmented LLM handles most tasks; add complexity only when needed', 'Build the most complex system possible', 'Always use the Agent SDK'],
            correctIndex: 1,
            explanation: '"Start with the simplest solution." Most tasks don\'t need multi-agent orchestration. An augmented LLM with good tools handles 80% of use cases.'
          },
        ],
      },
    ],
  },
];

// Helper to get total quest counts
export function getQuestStats(completedQuests: Record<string, { completed: boolean }>) {
  const allQuests = skillNodes.flatMap(n => n.quests);
  const completed = allQuests.filter(q => completedQuests[q.id]?.completed).length;
  return { total: allQuests.length, completed };
}

export function getAllQuests(): Quest[] {
  return skillNodes.flatMap(n => n.quests);
}
