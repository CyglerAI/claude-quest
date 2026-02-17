// All quest content — sourced from Sara Kukovec's Learn-Claude with full attribution

export type QuestType = 'learn' | 'lab' | 'challenge' | 'boss';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

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
  requires: string[]; // node ids
  tier: 'learn' | 'understand' | 'explore' | 'practice';
}

export const skillNodes: SkillNode[] = [
  // === TIER: LEARN ===
  {
    id: 'basics',
    title: 'Claude Basics',
    emoji: '💬',
    description: 'What Claude is, how it works, and your first conversations.',
    tier: 'learn',
    position: { x: 50, y: 10 },
    requires: [],
    quests: [
      {
        id: 'basics-1',
        title: 'Meet Claude',
        description: 'Learn what Claude is and how it differs from other AI.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 5,
        resource: { title: 'Models Overview: Opus, Sonnet, Haiku', url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', source: 'Anthropic Docs' },
        questions: [
          { id: 'b1q1', question: 'Which Claude model is optimized for complex reasoning?', options: ['Haiku 4.5', 'Sonnet 4.5', 'Opus 4.6', 'Claude Lite'], correctIndex: 2, explanation: 'Opus 4.6 is Anthropic\'s most capable model, built for deep reasoning and complex tasks.' },
          { id: 'b1q2', question: 'What is Constitutional AI?', options: ['A legal framework for AI companies', 'Anthropic\'s approach to making Claude helpful, harmless, and honest', 'A type of neural network architecture', 'A government regulation'], correctIndex: 1, explanation: 'Constitutional AI is Anthropic\'s core technique for training Claude to be helpful, harmless, and honest through a set of principles.' },
          { id: 'b1q3', question: 'What makes Claude different from a generic chatbot?', options: ['It can browse the internet', 'It has persistent memory, Projects, and Artifacts', 'It only works in English', 'It requires a subscription'], correctIndex: 1, explanation: 'Claude offers Projects (persistent workspaces), Memory (cross-conversation recall), and Artifacts (live interactive outputs) that go beyond basic chat.' },
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
          { id: 'b2q1', question: 'What do Claude Projects allow you to do?', options: ['Run code on your computer', 'Create persistent workspaces with custom instructions and files', 'Train your own AI model', 'Share Claude with other users for free'], correctIndex: 1, explanation: 'Projects let you upload files and set custom instructions that Claude reads before every conversation in that workspace.' },
          { id: 'b2q2', question: 'What are Artifacts?', options: ['Bugs left over from training', 'Live, interactive outputs like React apps, charts, and documents', 'Saved conversation logs', 'API access tokens'], correctIndex: 1, explanation: 'Artifacts are live outputs that Claude creates inline: React apps, HTML pages, SVGs, documents, and more. They can even use persistent storage.' },
          { id: 'b2q3', question: 'How does Claude Memory work?', options: ['You must manually save everything', 'Claude remembers preferences across conversations automatically', 'Memory resets every 24 hours', 'It only works with Pro plans'], correctIndex: 1, explanation: 'Claude\'s Memory builds automatically, remembering your name, preferences, role, and technical level across conversations. You can view and edit it in Settings.' },
        ],
      },
      {
        id: 'basics-3',
        title: 'First Steps Challenge',
        description: 'Prove you know the basics. Pass to skip ahead.',
        type: 'challenge',
        xpReward: 200,
        timeMinutes: 5,
        questions: [
          { id: 'b3q1', question: 'You want Claude to always respond in bullet points with a formal tone. Where do you set this?', options: ['In every message you send', 'In a Project\'s custom instructions', 'In the URL parameters', 'You can\'t — Claude decides its own style'], correctIndex: 1, explanation: 'Project custom instructions are read before every message. They\'re the right place for persistent behavior preferences.' },
          { id: 'b3q2', question: 'What happens when Claude\'s context window fills past 50%?', options: ['Nothing, it handles it fine', 'Accuracy can start to degrade', 'Claude refuses to continue', 'It switches to a smaller model'], correctIndex: 1, explanation: 'As context fills past 50%, Claude\'s accuracy begins to degrade. This is why context engineering — managing what\'s in the window — matters so much.' },
          { id: 'b3q3', question: 'Which feature would you use to have Claude create a live, shareable data visualization?', options: ['Projects', 'Memory', 'Artifacts', 'Web Search'], correctIndex: 2, explanation: 'Artifacts create live, interactive outputs including charts, React apps, and visualizations that can be shared via public links.' },
          { id: 'b3q4', question: 'Why might you create separate Projects for different tasks?', options: ['To avoid Claude getting confused by mixing contexts', 'Projects have file size limits', 'You can only have one conversation per Project', 'It\'s required by the Terms of Service'], correctIndex: 0, explanation: 'Separate Projects keep context clean. Claude reads all uploaded files and instructions — mixing unrelated contexts reduces quality.' },
        ],
      },
    ],
  },
  {
    id: 'prompting',
    title: 'Prompt Engineering',
    emoji: '✍️',
    description: 'Write clear, structured instructions that get consistent results.',
    tier: 'understand',
    position: { x: 30, y: 28 },
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
          { id: 'p1q1', question: 'What are XML tags used for in Claude prompts?', options: ['Making prompts look professional', 'Structuring and organizing different parts of the prompt', 'Sending data to an API', 'They\'re not used in prompting'], correctIndex: 1, explanation: 'XML tags like <instructions>, <context>, <examples> help Claude understand the structure and purpose of different prompt sections.' },
          { id: 'p1q2', question: 'What is chain-of-thought prompting?', options: ['Linking multiple conversations together', 'Asking Claude to show its reasoning step by step', 'A technique to speed up responses', 'Using multiple API calls in sequence'], correctIndex: 1, explanation: 'Chain-of-thought asks Claude to reason through problems step by step before giving a final answer, improving accuracy on complex tasks.' },
          { id: 'p1q3', question: 'What are few-shot examples in a prompt?', options: ['Short prompts with few words', 'Sample input-output pairs that show Claude the expected format', 'Prompts that work with Haiku only', 'Random examples from the internet'], correctIndex: 1, explanation: 'Few-shot examples show Claude exactly what input and output look like, calibrating its responses to match your expected format and style.' },
        ],
      },
      {
        id: 'prompt-2',
        title: 'Prompt Lab',
        description: 'Craft a structured prompt using XML tags, a role, and chain-of-thought.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 15,
        resource: { title: 'Interactive Prompt Tutorial', url: 'https://github.com/anthropics/prompt-eng-interactive-tutorial', source: 'Anthropic GitHub' },
        questions: [
          { id: 'p2q1', question: 'You need Claude to analyze a legal document and extract key clauses. Which prompt structure is best?', options: ['Just paste the document and say "analyze this"', 'Use <role>, <document>, <instructions> with specific extraction criteria', 'Ask Claude to pretend to be a lawyer', 'Send it in multiple messages'], correctIndex: 1, explanation: 'Structured prompts with clear role definition, tagged document sections, and specific instructions consistently outperform vague requests.' },
          { id: 'p2q2', question: 'Your prompt returns inconsistent formatting across runs. Best fix?', options: ['Try again until it works', 'Add 2-3 few-shot examples showing the exact output format', 'Switch to a bigger model', 'Make the prompt shorter'], correctIndex: 1, explanation: 'Few-shot examples are the most reliable way to get consistent formatting. Claude learns the pattern from concrete examples.' },
          { id: 'p2q3', question: 'Which tag structure would you use for a multi-step analysis task?', options: ['<do_everything_at_once/>', '<step1>...</step1><step2>...</step2> with <thinking> before the answer', 'No tags needed, just number the steps', '<urgent>do this fast</urgent>'], correctIndex: 1, explanation: 'Breaking complex tasks into explicit steps with a thinking section lets Claude work through each part systematically, improving quality.' },
        ],
      },
    ],
  },
  {
    id: 'projects-memory',
    title: 'Projects & Memory',
    emoji: '📁',
    description: 'Build persistent workspaces that remember context.',
    tier: 'learn',
    position: { x: 70, y: 28 },
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
          { id: 'pm1q1', question: 'When should you upload reference files to a Project vs. pasting them in chat?', options: ['Always paste in chat for freshness', 'Upload to Project when the same files are needed across multiple conversations', 'It doesn\'t matter', 'Only upload PDFs, paste everything else'], correctIndex: 1, explanation: 'Project files persist across conversations. Upload reference material that applies broadly; paste only per-conversation specifics.' },
          { id: 'pm1q2', question: 'What\'s the most impactful thing you can write in Project instructions?', options: ['Your name and job title', 'The specific role Claude should play and how to handle edge cases', 'A disclaimer about AI limitations', 'A greeting message'], correctIndex: 1, explanation: 'Clear role definition and edge-case guidance in Project instructions dramatically improve Claude\'s consistency and relevance.' },
          { id: 'pm1q3', question: 'You have 3 different use cases: coding help, writing feedback, and data analysis. How many Projects should you create?', options: ['1 — put everything in one Project', '3 — one per use case with tailored instructions', 'None — just use regular chat', '2 — combine the smaller ones'], correctIndex: 1, explanation: 'Separate Projects keep context focused. Mixed contexts confuse Claude and reduce output quality.' },
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
          { id: 'pm2q1', question: 'Claude keeps calling you by the wrong name. What should you do?', options: ['Start every message with your name', 'Go to Settings > Memory and edit or delete the incorrect entry', 'Create a new account', 'Ignore it'], correctIndex: 1, explanation: 'Memory entries can be viewed, edited, and deleted in Settings. Fix incorrect memories directly rather than working around them.' },
          { id: 'pm2q2', question: 'You want Claude to always use your company\'s specific terminology. Best approach?', options: ['Correct it every time in chat', 'Add a glossary to Project instructions', 'Hope it learns from context', 'Use the API instead'], correctIndex: 1, explanation: 'A glossary in Project instructions ensures consistent terminology from the first message, without relying on Memory to pick it up over time.' },
          { id: 'pm2q3', question: 'What\'s the relationship between Project instructions and Memory?', options: ['They\'re the same thing', 'Project instructions are per-workspace; Memory is cross-conversation and global', 'Memory overrides Project instructions', 'Projects don\'t work with Memory enabled'], correctIndex: 1, explanation: 'Project instructions apply within a workspace. Memory persists globally across all conversations. They complement each other.' },
        ],
      },
    ],
  },
  {
    id: 'context-eng',
    title: 'Context Engineering',
    emoji: '🧬',
    description: 'Manage the full context window like a pro.',
    tier: 'understand',
    position: { x: 30, y: 46 },
    requires: ['prompting'],
    quests: [
      {
        id: 'ctx-1',
        title: 'The Context Window',
        description: 'Why context management is the real skill, not just prompting.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 12,
        resource: { title: 'Context Engineering for AI Agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', source: 'Anthropic Engineering' },
        questions: [
          { id: 'cx1q1', question: 'What\'s the difference between prompt engineering and context engineering?', options: ['They\'re the same thing', 'Prompt engineering is one instruction; context engineering manages the full state across turns, tools, and memory', 'Context engineering is for APIs only', 'Prompt engineering is newer'], correctIndex: 1, explanation: 'Prompt engineering focuses on writing one good instruction. Context engineering manages everything in the context window: conversation history, tool results, memory, retrieved documents.' },
          { id: 'cx1q2', question: 'At what context utilization does accuracy start to degrade?', options: ['10%', '25%', '50%', '90%'], correctIndex: 2, explanation: 'Anthropic\'s research shows accuracy begins degrading past 50% context utilization. Managing what stays in the window is critical.' },
          { id: 'cx1q3', question: 'What is "just-in-time retrieval" in context engineering?', options: ['Loading everything at the start', 'Fetching only the information needed for the current step', 'Using RAG for every query', 'Caching all documents in memory'], correctIndex: 1, explanation: 'Just-in-time retrieval loads information only when needed, keeping the context window lean and focused instead of front-loading everything.' },
        ],
      },
      {
        id: 'ctx-2',
        title: 'Context Management Challenge',
        description: 'Design context strategies for real scenarios.',
        type: 'challenge',
        xpReward: 200,
        timeMinutes: 10,
        questions: [
          { id: 'cx2q1', question: 'You\'re building a coding agent that needs to work on a 50,000-line codebase. How do you handle context?', options: ['Paste the entire codebase into the prompt', 'Use tool search to load only relevant files on demand', 'Split it into 10 messages', 'Use a model with a bigger context window'], correctIndex: 1, explanation: 'Tool search (like grep, file read) loads only relevant code sections on demand. Pasting everything would destroy context quality and hit limits.' },
          { id: 'cx2q2', question: 'Your agent has been running for 50 turns and quality is dropping. What happened and how do you fix it?', options: ['The model is getting tired', 'Context is filling up — use compaction to summarize earlier turns and continue fresh', 'Switch to a different model', 'Add more system prompt instructions'], correctIndex: 1, explanation: 'After many turns, context fills up and quality degrades. Compaction summarizes earlier conversation, freeing space for fresh, focused context.' },
          { id: 'cx2q3', question: 'You need an agent to process 100 customer emails. Best architecture?', options: ['One long conversation handling all 100', 'Sub-agents with isolated context windows, one per email or small batch', 'Process them all through the API in one call', 'Use a spreadsheet instead'], correctIndex: 1, explanation: 'Sub-agents with isolated context windows prevent cross-contamination and keep each processing task focused. This is a core context engineering pattern.' },
        ],
      },
    ],
  },
  {
    id: 'artifacts',
    title: 'Artifacts & Files',
    emoji: '🎨',
    description: 'Create live, interactive outputs and work with files.',
    tier: 'learn',
    position: { x: 70, y: 46 },
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
          { id: 'a1q1', question: 'What can Claude Artifacts NOT do?', options: ['Create React components', 'Run server-side code with a database', 'Generate SVG graphics', 'Build interactive HTML pages'], correctIndex: 1, explanation: 'Artifacts run client-side only. They can create React apps, HTML, SVGs, charts, and documents — but not server-side code with databases.' },
          { id: 'a1q2', question: 'How much persistent storage do Artifacts have access to?', options: ['None', '1MB', '20MB', 'Unlimited'], correctIndex: 2, explanation: 'Artifacts can use up to 20MB of persistent storage, enabling stateful applications that remember data between sessions.' },
          { id: 'a1q3', question: 'What\'s the best way to iterate on an Artifact?', options: ['Start over from scratch each time', 'Tell Claude specifically what to change — it modifies the existing artifact', 'Edit the code manually', 'Create a new conversation'], correctIndex: 1, explanation: 'Claude can modify existing Artifacts incrementally. Be specific about what to change rather than regenerating everything.' },
        ],
      },
    ],
  },
  {
    id: 'api-sdk',
    title: 'API & SDK',
    emoji: '⚡',
    description: 'Integrate Claude into your applications programmatically.',
    tier: 'explore',
    position: { x: 30, y: 64 },
    requires: ['context-eng'],
    quests: [
      {
        id: 'api-1',
        title: 'API Fundamentals',
        description: 'Authentication, endpoints, request formatting, and response handling.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 12,
        resource: { title: 'API Fundamentals Course', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', source: 'Anthropic Academy' },
        questions: [
          { id: 'api1q1', question: 'What\'s the primary way to authenticate with the Claude API?', options: ['Username and password', 'API key in the x-api-key header', 'OAuth token only', 'No authentication needed'], correctIndex: 1, explanation: 'The Claude API uses API keys passed in the x-api-key header for authentication.' },
          { id: 'api1q2', question: 'What format does the Claude API use for messages?', options: ['Plain text only', 'A messages array with role (user/assistant) and content', 'XML only', 'JSON-RPC'], correctIndex: 1, explanation: 'The Messages API uses an array of message objects with role (user/assistant) and content fields, supporting multi-turn conversations.' },
          { id: 'api1q3', question: 'What is streaming useful for in the API?', options: ['Downloading files', 'Getting partial responses as they\'re generated for better UX', 'Sending multiple requests at once', 'Compressing data'], correctIndex: 1, explanation: 'Streaming delivers response tokens as they\'re generated, providing a faster perceived response time and better user experience.' },
        ],
      },
      {
        id: 'api-2',
        title: 'Build an Integration',
        description: 'Design an API integration for a real use case.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 15,
        resource: { title: 'Anthropic Cookbook', url: 'https://github.com/anthropics/anthropic-cookbook', source: 'Anthropic GitHub' },
        questions: [
          { id: 'api2q1', question: 'You need to classify 1000 support tickets. Best API approach?', options: ['Send them one at a time, wait for each', 'Use the Batch API for bulk processing at 50% cost', 'Paste all 1000 in one message', 'Use streaming for each'], correctIndex: 1, explanation: 'The Batch API processes large volumes asynchronously at 50% the cost of real-time calls. Ideal for non-time-sensitive bulk work.' },
          { id: 'api2q2', question: 'Your API integration sometimes returns unexpected JSON structures. Best fix?', options: ['Parse it manually each time', 'Use structured outputs with a JSON schema to constrain the response format', 'Add "please return valid JSON" to the prompt', 'Retry until it works'], correctIndex: 1, explanation: 'Structured outputs with a defined JSON schema guarantee the response matches your expected format, eliminating parsing surprises.' },
          { id: 'api2q3', question: 'How do you handle rate limits in production?', options: ['Ignore them', 'Implement exponential backoff with retry logic', 'Buy more API credits', 'Switch models when limited'], correctIndex: 1, explanation: 'Exponential backoff (increasing wait times between retries) is the standard pattern for handling API rate limits gracefully.' },
        ],
      },
    ],
  },
  {
    id: 'claude-code',
    title: 'Claude Code',
    emoji: '💻',
    description: 'Agentic coding in your terminal. Read, write, test, commit.',
    tier: 'practice',
    position: { x: 70, y: 64 },
    requires: ['artifacts'],
    quests: [
      {
        id: 'cc-1',
        title: 'Terminal Power',
        description: 'Install Claude Code and learn the core workflow.',
        type: 'learn',
        xpReward: 50,
        timeMinutes: 10,
        resource: { title: 'Claude Code Documentation', url: 'https://code.claude.com/docs/en/overview', source: 'Claude Code Docs' },
        questions: [
          { id: 'cc1q1', question: 'What is CLAUDE.md?', options: ['A markdown guide about Claude', 'A configuration file that gives Claude Code project-specific context and rules', 'An API documentation format', 'A commit message template'], correctIndex: 1, explanation: 'CLAUDE.md is read by Claude Code at the start of every session. It contains project context, coding standards, and behavioral rules.' },
          { id: 'cc1q2', question: 'What can Claude Code do that chat Claude cannot?', options: ['Think harder', 'Read and write files on your computer, run terminal commands, and manage Git', 'Use a bigger context window', 'Access the internet'], correctIndex: 1, explanation: 'Claude Code operates as a terminal agent: reading codebases, writing files, running commands, executing tests, and managing Git workflows directly on your machine.' },
          { id: 'cc1q3', question: 'What\'s the purpose of the CLAUDE.md hierarchy (project > user > local)?', options: ['To confuse developers', 'Different scopes: project rules for the team, user preferences for you, local for uncommitted experiments', 'They\'re all the same', 'Only project-level matters'], correctIndex: 1, explanation: 'The CLAUDE.md hierarchy lets you set team-wide project rules, personal preferences, and local experiments without conflicts.' },
        ],
      },
      {
        id: 'cc-2',
        title: 'Code Like a Pro',
        description: 'Master Claude Code workflows: refactoring, testing, Git.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 15,
        resource: { title: 'Claude Code Best Practices', url: 'https://www.anthropic.com/engineering/claude-code-best-practices', source: 'Anthropic Engineering' },
        questions: [
          { id: 'cc2q1', question: 'You want Claude Code to refactor a module without breaking tests. Best approach?', options: ['Just say "refactor this"', 'Ask it to run tests first, then refactor, then run tests again to verify', 'Refactor manually and ask Claude to review', 'Hope for the best'], correctIndex: 1, explanation: 'The test-refactor-test loop is the gold standard. Claude Code can run your test suite before and after changes to ensure nothing breaks.' },
          { id: 'cc2q2', question: 'Your CLAUDE.md is 500 lines long. What\'s wrong?', options: ['Nothing, more context is better', 'It\'s too long — the entrypoint should be under 200 lines, use imports for details', 'Claude Code can\'t read files that long', 'You need to compress it'], correctIndex: 1, explanation: 'The CLAUDE.md entrypoint should be under 200 lines. Use @imports to reference additional files for detailed context, keeping the main file focused.' },
          { id: 'cc2q3', question: 'How should you handle multi-step tasks in Claude Code?', options: ['One massive prompt', 'Break into focused steps with verification between each', 'Let Claude decide the steps', 'Use slash commands only'], correctIndex: 1, explanation: 'Breaking tasks into focused steps with verification (check output, run tests) between each step gives Claude Code clear checkpoints and catches errors early.' },
        ],
      },
    ],
  },
  {
    id: 'tool-use',
    title: 'Tool Use & MCP',
    emoji: '🔌',
    description: 'Connect Claude to external tools and data sources.',
    tier: 'explore',
    position: { x: 50, y: 78 },
    requires: ['api-sdk', 'claude-code'],
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
          { id: 't1q1', question: 'What is a "tool schema" in Claude\'s tool use?', options: ['A visual diagram', 'A JSON definition of a function\'s name, description, and parameters that Claude can call', 'A database schema', 'A testing framework'], correctIndex: 1, explanation: 'Tool schemas define available functions with names, descriptions, and parameter types. Claude reads these to decide when and how to call tools.' },
          { id: 't1q2', question: 'What is MCP (Model Context Protocol)?', options: ['A networking protocol', 'A standard protocol for connecting AI models to external tools and data sources', 'A compression format', 'A training technique'], correctIndex: 1, explanation: 'MCP is a standard client-server protocol that lets AI models connect to external tools, data sources, and services in a consistent way.' },
          { id: 't1q3', question: 'When should you use tool_choice: "required" vs "auto"?', options: ['Always use required', 'Required when you know a tool must be called; auto when Claude should decide', 'They\'re the same', 'Auto is deprecated'], correctIndex: 1, explanation: 'Use "required" when you know a specific tool must be called (e.g., always look up user data). Use "auto" when Claude should decide based on the conversation.' },
        ],
      },
      {
        id: 'tools-2',
        title: 'MCP Deep Dive',
        description: 'Build and connect MCP servers.',
        type: 'lab',
        xpReward: 100,
        timeMinutes: 15,
        resource: { title: 'MCP: Getting Started', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol', source: 'Anthropic Academy' },
        questions: [
          { id: 't2q1', question: 'An MCP server exposes:', options: ['A REST API', 'Tools, resources, and prompts through a standardized protocol', 'A web interface', 'Only database queries'], correctIndex: 1, explanation: 'MCP servers expose three primitives: tools (functions Claude can call), resources (data Claude can read), and prompts (reusable templates).' },
          { id: 't2q2', question: 'What transport protocols does MCP support?', options: ['HTTP only', 'stdio (local) and SSE/HTTP (remote)', 'WebSocket only', 'gRPC'], correctIndex: 1, explanation: 'MCP supports stdio for local servers (fast, no networking) and SSE/HTTP for remote servers (accessible over the network).' },
          { id: 't2q3', question: 'You want to connect Claude Code to your company\'s internal wiki. Best approach?', options: ['Copy-paste wiki pages into chat', 'Build an MCP server that searches and retrieves wiki content on demand', 'Upload the entire wiki as files', 'Use web search'], correctIndex: 1, explanation: 'An MCP server provides on-demand retrieval from your wiki, keeping context lean. It\'s the context engineering principle of just-in-time retrieval.' },
        ],
      },
    ],
  },
  {
    id: 'agent-design',
    title: 'Agent Design',
    emoji: '🤖',
    description: 'Design autonomous agents that think, plan, and execute.',
    tier: 'practice',
    position: { x: 50, y: 92 },
    requires: ['tool-use'],
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
          { id: 'ag1q1', question: 'What\'s the simplest agent pattern?', options: ['Multi-agent orchestration', 'The augmented LLM: retrieval + tools + memory', 'Prompt chaining', 'Parallelization'], correctIndex: 1, explanation: 'The augmented LLM is the basic building block: an LLM enhanced with retrieval, tool use, and memory. All other patterns build on this.' },
          { id: 'ag1q2', question: 'When should you use routing vs. prompt chaining?', options: ['They\'re interchangeable', 'Routing classifies and directs to specialized handlers; chaining executes sequential steps', 'Routing is faster', 'Chaining is deprecated'], correctIndex: 1, explanation: 'Routing classifies inputs and directs them to the right handler (e.g., Haiku for simple, Opus for complex). Chaining executes steps in sequence with checks between each.' },
          { id: 'ag1q3', question: 'What is parallelization in agent design?', options: ['Running the same prompt twice', 'Running multiple sub-tasks simultaneously and aggregating results', 'Using multiple API keys', 'Multi-threading the application'], correctIndex: 1, explanation: 'Parallelization splits a task into independent sub-tasks, processes them simultaneously (potentially with different models), and aggregates the results.' },
        ],
      },
      {
        id: 'agent-2',
        title: 'Agent Architect Challenge',
        description: 'Design a production agent system from scratch.',
        type: 'boss',
        xpReward: 500,
        timeMinutes: 20,
        resource: { title: 'Agent SDK Documentation', url: 'https://docs.anthropic.com/en/docs/claude-code/sdk', source: 'Anthropic Docs' },
        questions: [
          { id: 'ag2q1', question: 'You\'re building a customer support agent. It needs to handle refunds, check order status, and escalate to humans. Best architecture?', options: ['One big prompt that does everything', 'Router (classify intent) → specialized sub-agents (refund handler, order checker, escalation) with tool access', 'A simple chatbot with FAQ responses', 'Just use the API with no agent framework'], correctIndex: 1, explanation: 'A router classifies the intent, then delegates to specialized sub-agents with focused tools and context. This keeps each agent simple and reliable.' },
          { id: 'ag2q2', question: 'Your agent needs to maintain state across sessions (e.g., a multi-day project). How?', options: ['Keep the conversation going forever', 'Use progress files and CLAUDE.md to persist state; compact and resume from file-based checkpoints', 'Store everything in Memory', 'Use a database only'], correctIndex: 1, explanation: 'Progress files and CLAUDE.md provide persistent state that survives compaction and session boundaries. This is the "effective harnesses" pattern from Anthropic.' },
          { id: 'ag2q3', question: 'Your multi-agent system has 5 agents. One keeps producing bad results that affect the others. Fix?', options: ['Remove the agent', 'Isolate it: give it its own context window, validate its outputs before passing to other agents', 'Add more instructions to its prompt', 'Switch it to a bigger model'], correctIndex: 1, explanation: 'Context isolation (separate windows) prevents bad context from spreading. Output validation acts as a quality gate between agents. These are core multi-agent patterns.' },
          { id: 'ag2q4', question: 'How do you decide which model to use for each agent in a multi-agent system?', options: ['Use the best model for everything', 'Match model to task: Haiku for simple classification, Sonnet for coding, Opus for complex reasoning', 'Use the cheapest model everywhere', 'Let the user choose'], correctIndex: 1, explanation: 'Model routing matches capability to need: fast/cheap models for simple tasks (routing, classification), powerful models for complex reasoning. This optimizes both cost and quality.' },
          { id: 'ag2q5', question: 'What\'s the most important lesson from Anthropic\'s agent design guide?', options: ['Use the latest model', 'Start simple — the augmented LLM handles most tasks; add complexity only when needed', 'Build the most complex system possible', 'Always use the Agent SDK'], correctIndex: 1, explanation: 'Anthropic\'s key insight: "Start with the simplest solution." Most tasks don\'t need multi-agent orchestration. An augmented LLM with good tools handles 80% of use cases.' },
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
