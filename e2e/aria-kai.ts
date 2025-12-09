/**
 * Constants for Aria & Kai - Personal Assistant Duo
 */

// Use a valid v4 UUID for Aria & Kai (deterministic but valid)
export const ARIA_KAI_USER_ID = 'a12a0000-0000-4000-a000-000000000001';
export const ARIA_KAI_EMAIL = 'aria-kai-assistants@polity.com';
export const ARIA_KAI_WELCOME_MESSAGE =
  'Hey, we are Aria & Kai - your personal assistants! Welcome to Polity! We would love to show you around in the app. Shall we?';

/**
 * Educational content for the interactive tutorial
 */
export const ENTITY_DESCRIPTIONS = {
  overview: {
    title: 'Welcome to Polity!',
    message:
      "We're excited to help you get started! Polity is a platform where you can create political networks, automate processes, and track political decisions in real time.\n\n**Here's what you can do:**\n• Create and manage **Groups** for your organization\n• Organize **Events** and track participation\n• Draft and collaborate on **Amendments**\n• Submit and review **Change Requests**\n• Write and publish **Blogs**\n• Run **Elections** and fill **Positions**\n\nWould you like to learn more about any of these features?",
  },
  groups: {
    title: 'Groups',
    message:
      '**Groups** are the foundation of collaboration on Polity.\n\n**What you can do with Groups:**\n• Create organizations, parties, or communities\n• Invite members and assign roles\n• Set permissions and action rights\n• Manage membership requests\n• Create group conversations\n• Share content within your group\n\n**Use cases:**\n• Political parties organizing members\n• NGOs coordinating initiatives\n• Local governments managing departments\n• Community groups collaborating on projects\n\nGroups can be public or private, and you have full control over who can join and what they can do.',
  },
  events: {
    title: 'Events',
    message:
      '**Events** help you organize meetings, conferences, rallies, and any gathering.\n\n**Event features:**\n• Schedule events with date, time, and location\n• Track RSVPs and participation\n• Send invitations to members\n• Manage event agendas and items\n• Record attendance and outcomes\n• Link events to groups and initiatives\n\n**Examples:**\n• Town hall meetings\n• Party conventions\n• Committee sessions\n• Public consultations\n• Campaign events\n\nEvents integrate with your calendar and keep all participants informed in real-time.',
  },
  amendments: {
    title: 'Amendments & Change Requests',
    message:
      '**Amendments** and **Change Requests** enable collaborative document editing and democratic decision-making.\n\n**Amendments:**\n• Draft policy documents and legislation\n• Propose changes to existing documents\n• Collaborate with multiple authors\n• Track version history\n• Vote on amendments\n• Implement approved changes\n\n**Change Requests:**\n• Suggest specific edits to amendments\n• Provide feedback and comments\n• Review and approve changes\n• Track all modifications\n• Ensure transparency in the editing process\n\nThis workflow ensures that every change is documented, reviewed, and decided upon democratically.',
  },
  blogs: {
    title: 'Blogs',
    message:
      '**Blogs** let you share ideas, updates, and announcements with your community.\n\n**Blog features:**\n• Rich text editor with multimedia support\n• Publish articles and opinion pieces\n• Tag posts for easy discovery\n• Share within groups or publicly\n• Engage with readers through comments\n• Build your political presence\n\n**Use blogs for:**\n• Policy explanations\n• Campaign updates\n• Position statements\n• Community news\n• Educational content\n• Thought leadership\n\nBlogs help you communicate your vision and keep stakeholders informed.',
  },
  elections: {
    title: 'Elections & Positions',
    message:
      '**Elections** and **Positions** bring democratic governance to your organization.\n\n**Elections:**\n• Create election campaigns\n• Nominate candidates\n• Set voting periods\n• Secure ballot casting\n• Automatic vote tallying\n• Transparent results\n\n**Positions:**\n• Define organizational roles\n• Set terms and responsibilities\n• Track position holders\n• Manage succession\n• Link positions to groups\n\n**Perfect for:**\n• Board elections\n• Party leadership contests\n• Committee chair selections\n• Representative elections\n• Organizational governance\n\nEnsure fair, transparent, and efficient democratic processes in your organization.',
  },
} as const;

export type EntityTopic = keyof typeof ENTITY_DESCRIPTIONS;
