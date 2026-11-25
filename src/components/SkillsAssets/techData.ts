export interface TechItem {
  id: string
  name: string
  category: string
  description: string
  color: string
}

export const TECH_ITEMS: TechItem[] = [
  {
    id: 'git',
    name: 'Git',
    category: 'Version Control',
    description: 'Distributed version control & branch orchestration.',
    color: '#F03C2E',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Developer Platform',
    description: 'Code hosting, CI/CD Actions & open-source collaboration.',
    color: '#181717',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Language',
    description: 'Core language for AI pipelines, scraping & backend services.',
    color: '#3776AB',
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'Language',
    description: 'Systems programming, algorithms & high-performance computing.',
    color: '#00599C',
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    description: 'Component architecture, concurrent rendering & reactive state.',
    color: '#61DAFB',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend Runtime',
    description: 'Event-driven server runtime for APIs & microservices.',
    color: '#5FA04E',
  },
  {
    id: 'html',
    name: 'HTML5',
    category: 'Frontend',
    description: 'Semantic, accessible, standards-compliant web structure.',
    color: '#E34F26',
  },
  {
    id: 'css',
    name: 'CSS3',
    category: 'Frontend',
    description: 'Modern responsive layout, custom properties & CSS motion.',
    color: '#1572B6',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Language',
    description: 'Modern ESNext, asynchronous programming & browser APIs.',
    color: '#F7DF1E',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'Infrastructure',
    description: 'Edge networking, Workers, DNS security & global caching.',
    color: '#F38020',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Infrastructure',
    description: 'Serverless edge deployment, CI/CD & frontend hosting.',
    color: '#161616',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Relational SQL engine with ACID guarantees & pgvector.',
    color: '#4169E1',
  },
]

export interface ServiceItem {
  id: string
  number: string
  name: string
  code: string
  alt: string
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'saas',
    number: '01',
    name: 'SAAS',
    code: '01 / SAAS',
    alt: 'SAAS — Multi-Tenant Cloud Architecture',
  },
  {
    id: 'rag-bot',
    number: '02',
    name: 'RAG Bot',
    code: '02 / RAG BOT',
    alt: 'RAG Bot — Domain-Grounded Context Retrieval',
  },
  {
    id: 'portfolio',
    number: '03',
    name: 'Portfolio',
    code: '03 / PORTFOLIO',
    alt: 'Portfolio — Bespoke Digital Editorial Craft',
  },
  {
    id: 'fullstack',
    number: '04',
    name: 'FullStack',
    code: '04 / FULLSTACK',
    alt: 'FullStack — Unified Frontend to Infrastructure',
  },
  {
    id: 'app-dev',
    number: '05',
    name: 'App Development',
    code: '05 / APP DEV',
    alt: 'App Development — Cross-Platform Native Mobile Engineering',
  },
  {
    id: 'voice-agents',
    number: '06',
    name: 'Voice Agents',
    code: '06 / VOICE AGENTS',
    alt: 'Voice Agents — Real-Time Bidirectional Speech Intelligence',
  },
]
