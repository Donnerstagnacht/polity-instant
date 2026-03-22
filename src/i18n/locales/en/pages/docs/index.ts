export const docsPageTranslations = {
  tones: {
    entry: 'ENTRY',
    action: 'ACTION',
    collaboration: 'COLLAB',
    attention: 'ALERT',
    decision: 'DECISION',
    result: 'RESULT',
  },
  labels: {
    quickView: 'Quick View',
    audience: 'Audience',
    entry: 'Best Entry Point',
    actions: 'What You Can Do',
    concepts: 'Key Concepts',
    watchFor: 'What To Watch For',
    states: 'Signals And States',
    relatedTopics: 'Related Topics',
    userPerspective: 'From A User Perspective',
    exploreMore: 'Explore More',
    step: 'Step {{value}}',
  },
  overview: {
    navLabel: 'Overview',
    title: 'Learn Polity from the user side',
    subtitle:
      'This documentation explains how people join spaces, coordinate work, make decisions, and follow outcomes across Polity without forcing you through implementation details first.',
    primaryCta: 'Start with users',
    secondaryCta: 'Understand roles and rights',
    pathwaysTitle: 'Common pathways',
    pathways: {
      start: 'Set up your profile, discover relevant groups, and understand where you belong in the network.',
      coordinate: 'Move between groups, events, messages, notifications, calendar, and todos to keep day-to-day collaboration moving.',
      decide: 'Use amendments, votes, elections, and the decision terminal to understand how proposals turn into visible outcomes.',
      'follow-through': 'Track what changed, who needs to act next, and where a decision or amendment continues through connected groups.',
    },
    featuredTitle: 'Featured guides',
    featuredDescription: 'Start with the most important user journeys and system guides.',
    libraryTitle: 'Documentation library',
    libraryDescription: 'Browse the full set of user-facing feature guides by area of work.',
  },
  categories: {
    people: {
      title: 'People',
      description: 'Identity, presence, and how users move through the platform.',
    },
    collaboration: {
      title: 'Collaboration',
      description: 'Shared spaces, meetings, writing, and publishing workflows.',
    },
    governance: {
      title: 'Governance',
      description: 'Proposal-making, voting, elections, and result tracking.',
    },
    coordination: {
      title: 'Coordination',
      description: 'Finding information, staying aligned, and keeping work on schedule.',
    },
    systems: {
      title: 'Systems',
      description: 'Cross-cutting permission and routing systems that shape what users can do and where work moves next.',
    },
  },
  topics: {
    users: {
      navLabel: 'Users',
      title: 'Users',
      summary: 'Profiles, memberships, subscriptions, and the personal view of activity across Polity.',
      audience: 'Anyone getting started, joining a community, or managing their presence across multiple spaces.',
      entry: 'Begin here when you want to understand how an individual experiences the platform.',
      perspective:
        'Users experience Polity as a connected workspace where profile, memberships, subscriptions, and notifications determine what feels close at hand.',
      outcome:
        'A well-set-up user can enter groups faster, notice relevant updates earlier, and move between collaboration and decision spaces without losing context.',
      actions: [
        'Create and maintain a profile that represents your role in the network.',
        'Join groups, follow spaces, and track subscriptions that matter to you.',
        'Move from profile-level context into messages, events, or governance work.',
      ],
      concepts: [
        'Your user account is the center of your memberships, subscriptions, and notifications.',
        'Visibility changes depending on what groups and events you belong to or follow.',
        'Personal context affects which actions feel immediate, not just which actions are technically allowed.',
      ],
      watchFor: [
        'Membership status affects what you can see and do inside groups.',
        'Subscriptions shape what lands in notifications and what stays quiet.',
        'Your profile becomes more useful when it is linked to active groups and current work.',
      ],
      states: [
        'Profiles become more valuable as memberships, subscriptions, and participation history accumulate.',
        'A user can feel peripheral in one space and central in another depending on roles and relationships.',
      ],
      diagram: {
        title: 'How a user settles into Polity',
        description: 'A typical path from account setup into active participation.',
        steps: {
          'create-profile': {
            title: 'Create your profile',
            description: 'Set up the identity others will see when you join spaces, conversations, and decisions.',
          },
          'join-spaces': {
            title: 'Join relevant spaces',
            description: 'Memberships and subscriptions pull groups, events, and governance work into your orbit.',
          },
          'stay-informed': {
            title: 'Stay informed',
            description: 'Notifications, messages, and activity feeds keep your user view connected to ongoing work.',
          },
        },
      },
    },
    groups: {
      navLabel: 'Groups',
      title: 'Groups',
      summary: 'Shared spaces where members organize, assign responsibility, and connect work to governance.',
      audience: 'Organizers, members, and anyone working inside a collective space.',
      entry: 'Use this guide when you want to understand the main collaboration container in Polity.',
      perspective:
        'Groups are where users usually feel structure: membership, permissions, documents, events, and governance all converge here.',
      outcome:
        'Once a group is well organized, members can coordinate work, publish decisions, and route proposals with less friction.',
      actions: [
        'Create or join a group and work inside a shared context.',
        'Use group documents, events, notifications, and related content from one place.',
        'Assign roles and responsibilities that shape what members can act on.',
      ],
      concepts: [
        'Groups define shared context for collaboration and governance.',
        'A group can connect to parent or child groups in a larger network.',
        'Permissions often become visible to users first inside a group workflow.',
      ],
      watchFor: [
        'Membership and role changes have immediate effects on available actions.',
        'Public and private group settings change how discoverable work is.',
        'Connected groups can affect where proposals and information move next.',
      ],
      states: [
        'A group can act as a local working space, a governance hub, or part of a wider hierarchy.',
        'The same group may host day-to-day coordination and formal decisions side by side.',
      ],
      diagram: {
        title: 'A common group lifecycle',
        description: 'How groups usually move from setup to active collaboration.',
        steps: {
          'create-space': {
            title: 'Create the space',
            description: 'Start a group with clear identity, membership boundaries, and purpose.',
          },
          'assign-roles': {
            title: 'Assign roles',
            description: 'Shape who can edit, manage, organize, or govern within the group.',
          },
          'run-work': {
            title: 'Run the work',
            description: 'Use the group as the anchor for events, amendments, discussions, and decisions.',
          },
        },
      },
    },
    events: {
      navLabel: 'Events',
      title: 'Events',
      summary: 'Meetings and gatherings with participants, agendas, positions, and visible outcomes.',
      audience: 'Organizers, participants, and members tracking what happens in a scheduled gathering.',
      entry: 'Read this when you want to understand how Polity turns coordination into a real event flow.',
      perspective:
        'Events give users a concrete time and place where agendas, participation, and outcomes become visible together.',
      outcome:
        'A well-run event leaves a trace: attendees understand what happened, what was decided, and what needs follow-up.',
      actions: [
        'Create an event and invite relevant participants into the right context.',
        'Use agendas and supporting material to prepare attendees before the event starts.',
        'Review positions, outcomes, and connected follow-up work after the event.',
      ],
      concepts: [
        'Events often inherit context from a group rather than standing alone.',
        'Agenda items give events their operational structure.',
        'Participation, voting, and notifications all become more time-sensitive around events.',
      ],
      watchFor: [
        'Participant role changes can affect who speaks, votes, or manages the event.',
        'Agenda timing shapes how decisions surface in the decision terminal.',
        'Network context can influence how event outcomes connect upward or outward.',
      ],
      states: [
        'An event can be upcoming, active, or completed, but user attention shifts most around agenda moments.',
        'Users often experience events as a bridge between collaboration and governance.',
      ],
      diagram: {
        title: 'From event setup to outcome',
        description: 'The basic flow most users experience around an event.',
        steps: {
          'publish-event': {
            title: 'Publish the event',
            description: 'Make the event visible with time, location, and relevant context.',
          },
          'run-agenda': {
            title: 'Run the agenda',
            description: 'Guide participants through items, discussions, and decisions in order.',
          },
          'capture-outcomes': {
            title: 'Capture outcomes',
            description: 'Surface results, attendance, and next actions once the event concludes.',
          },
        },
      },
    },
    amendments: {
      navLabel: 'Amendments',
      title: 'Amendments',
      summary: 'Collaborative drafting, discussion, forwarding, and decision workflows for changing text and policy.',
      audience: 'Authors, collaborators, reviewers, and members following a proposal through its lifecycle.',
      entry: 'Open this guide when you need to understand how text moves from draft to decision.',
      perspective:
        'Users see amendments as living proposals: they start as draft text, gather collaborators and feedback, then move into decisions or forwarding paths.',
      outcome:
        'A clear amendment workflow helps users see whether a proposal is still being shaped, is ready for decision, or must move elsewhere next.',
      actions: [
        'Draft new text or open an existing proposal for collaborative work.',
        'Track discussions, change requests, and collaborator activity around the proposal.',
        'Follow whether the amendment is decided locally or forwarded through the network.',
      ],
      concepts: [
        'Amendments combine writing, governance, and status changes in one flow.',
        'Collaborators and roles can influence who edits, comments, or steers the process.',
        'Forwarding connects amendment work to a wider group structure when local handling is not the end of the story.',
      ],
      watchFor: [
        'Status changes tell users whether the amendment is still open for shaping or moving into a formal step.',
        'Change requests create a more granular editing conversation inside the larger proposal.',
        'Connected groups may alter where the amendment needs to travel next.',
      ],
      states: [
        'Amendments often feel collaborative early and procedural later.',
        'For users, the important question is usually not just what changed but who must act next and where.',
      ],
      diagram: {
        title: 'How an amendment moves',
        description: 'A user-facing view of the usual amendment journey.',
        steps: {
          'draft-text': {
            title: 'Draft the text',
            description: 'Create the initial proposal and define the shared text others react to.',
          },
          collaborate: {
            title: 'Collaborate',
            description: 'Discuss, request changes, and refine the proposal with other contributors.',
          },
          'forward-or-vote': {
            title: 'Forward or vote',
            description: 'Either move the amendment into a local decision or route it onward through the network.',
          },
        },
      },
    },
    blogs: {
      navLabel: 'Blogs',
      title: 'Blogs',
      summary: 'Publishing spaces for updates, arguments, announcements, and public-facing writing.',
      audience: 'Writers, editors, organizers, and readers following public or group-facing content.',
      entry: 'Use this guide when you want to understand how publishing fits into Polity.',
      perspective:
        'Blogs give users a way to communicate narrative, context, and position outside purely procedural workflows.',
      outcome:
        'Well-used blogs make proposals easier to understand, keep communities informed, and connect publishing to discussion and search.',
      actions: [
        'Draft and publish posts that explain what is happening and why it matters.',
        'Use blogs to connect group work or policy development to a wider audience.',
        'Share context that supports decisions, campaigns, or ongoing community work.',
      ],
      concepts: [
        'Blogs complement governance workflows by carrying explanation rather than formal resolution.',
        'Publication can be public or scoped to a specific audience depending on setup.',
        'Search and notifications often determine whether blog content is actually seen.',
      ],
      watchFor: [
        'Publishing rights are separate from simply being present in a group or blog space.',
        'Blog ownership and blogger roles change who can contribute.',
        'Posts often become the explanation layer around more formal amendments or votes.',
      ],
      states: [
        'A blog post can function as information, persuasion, or mobilization depending on context.',
        'Users usually feel the value of blogs when they connect narrative and action clearly.',
      ],
      diagram: {
        title: 'From draft to discussion',
        description: 'A simple publishing path inside Polity.',
        steps: {
          'draft-post': {
            title: 'Draft the post',
            description: 'Prepare the message, argument, or update you want to share.',
          },
          publish: {
            title: 'Publish',
            description: 'Make the post visible to the intended audience at the right time.',
          },
          discuss: {
            title: 'Discuss',
            description: 'Let readers react, share, and connect the post to ongoing work.',
          },
        },
      },
    },
    elections: {
      navLabel: 'Elections',
      title: 'Elections',
      summary: 'Contests for positions with nominations, timing, and visible results.',
      audience: 'Organizers, candidates, and voters following representative selection.',
      entry: 'Open this guide to understand how positions and candidacies turn into election outcomes.',
      perspective:
        'For users, elections are time-bound decisions tied to a position, a candidate field, and a result everyone can track.',
      outcome:
        'A transparent election flow reduces uncertainty around who can stand, when voting happens, and how the result becomes official.',
      actions: [
        'Define or review the position connected to an election.',
        'Track candidacies and the timing of the election window.',
        'Follow the result through the election detail view or decision terminal.',
      ],
      concepts: [
        'Positions give elections institutional meaning beyond a single vote.',
        'Election timing matters because campaigns, nominations, and results are all visible phases.',
        'Users often understand elections best when connected to the decision terminal and related notifications.',
      ],
      watchFor: [
        'Candidacy and participation rules can differ from ordinary voting rights.',
        'Results may be visible in multiple places, but the same underlying decision drives them.',
        'Position context helps users understand what an election changes after it closes.',
      ],
      states: [
        'Elections feel preparatory before opening and definitive after closing.',
        'Users usually look for candidate visibility first and result clarity second.',
      ],
      diagram: {
        title: 'How an election unfolds',
        description: 'The typical path from defining a position to confirming the result.',
        steps: {
          'define-position': {
            title: 'Define the position',
            description: 'Anchor the election to a role or office users can understand.',
          },
          nominate: {
            title: 'Nominate candidates',
            description: 'Build the candidate field so voters know who is standing.',
          },
          'confirm-results': {
            title: 'Confirm results',
            description: 'Close the election and surface who has been elected.',
          },
        },
      },
    },
    votes: {
      navLabel: 'Votes',
      title: 'Votes',
      summary: 'Formal decisions with opening windows, ballots, and clear outcomes.',
      audience: 'Voters, organizers, and observers following a discrete decision item.',
      entry: 'Use this guide to understand how Polity presents and resolves formal questions.',
      perspective:
        'Users experience votes as focused decision moments: a question appears, a voting phase opens, and a result becomes visible.',
      outcome:
        'A clear vote flow lets participants understand what is being decided, when action is possible, and how the final state is interpreted.',
      actions: [
        'Review the voting question and its context before the voting window opens.',
        'Cast a ballot during the active phase if you have the right to participate.',
        'Track the result in context once the decision closes.',
      ],
      concepts: [
        'Votes are usually tied to an agenda item, proposal, or group context.',
        'Timing and eligibility are just as important as the ballot itself.',
        'Users often rely on notifications and the decision terminal to spot urgent votes.',
      ],
      watchFor: [
        'Opening and closing times shape whether a vote feels upcoming, active, or already settled.',
        'Voting rights may be narrower than general membership.',
        'Result visibility matters because users need to know whether the decision changed anything concrete.',
      ],
      states: [
        'Votes shift quickly from preparation to urgency to finality.',
        'Users usually care most about eligibility, timing, and whether the result is binding or informative.',
      ],
      diagram: {
        title: 'A standard voting flow',
        description: 'How users typically encounter a vote from setup to outcome.',
        steps: {
          'prepare-question': {
            title: 'Prepare the question',
            description: 'Define the issue clearly so participants know what is at stake.',
          },
          'cast-ballot': {
            title: 'Cast the ballot',
            description: 'Allow eligible participants to vote during the active window.',
          },
          'review-result': {
            title: 'Review the result',
            description: 'Close the vote and show whether the proposal passed, failed, or tied.',
          },
        },
      },
    },
    'decision-terminal': {
      navLabel: 'Decision Terminal',
      title: 'Decision Terminal',
      summary: 'A fast, status-driven view of live and recent votes and elections.',
      audience: 'People monitoring active decisions, urgent items, or recently closed outcomes.',
      entry: 'Open this guide when you need to understand the app’s real-time decision surface.',
      perspective:
        'The decision terminal compresses urgency into a readable signal: what is live, what opens soon, and what just closed.',
      outcome:
        'Users can prioritize attention quickly, inspect the right item at the right moment, and avoid missing critical decisions.',
      actions: [
        'Scan live and opening-soon items without opening each one individually.',
        'Inspect an item to understand timing, status, and result context.',
        'Use terminal signals as a triage surface for broader governance work.',
      ],
      concepts: [
        'The terminal is a status interface, not just a list of decisions.',
        'Badges and timing signals matter because they compress urgency visually.',
        'Votes and elections surface together so users can monitor governance from one place.',
      ],
      watchFor: [
        'An item can be visible before it is actionable if it is opening soon.',
        'Closed results may still matter because they trigger follow-up elsewhere.',
        'The terminal is best read as a decision radar rather than a full-detail workspace.',
      ],
      states: [
        'Open, closing, last-hour, final-minutes, and result states change how urgent an item feels.',
        'Users usually shift from scanning to deep inspection only when the signal indicates urgency or consequence.',
      ],
      diagram: {
        title: 'How users read the decision terminal',
        description: 'A typical attention flow from signal to interpretation.',
        steps: {
          'watch-live': {
            title: 'Watch live signals',
            description: 'Scan what is active, opening soon, or freshly resolved.',
          },
          'inspect-item': {
            title: 'Inspect the item',
            description: 'Open the detail context once a decision becomes relevant or urgent.',
          },
          'follow-result': {
            title: 'Follow the result',
            description: 'Use the visible outcome to guide whatever action comes next.',
          },
        },
      },
    },
    search: {
      navLabel: 'Search',
      title: 'Search',
      summary: 'Find people, spaces, content, and decisions without knowing exactly where they live.',
      audience: 'Anyone navigating a large workspace, rediscovering content, or jumping across features.',
      entry: 'Use this guide when navigation by memory is no longer enough.',
      perspective:
        'Search is the user’s shortcut through platform complexity, especially once work is spread across many groups and content types.',
      outcome:
        'Effective search turns a dense workspace into one users can traverse confidently without losing context.',
      actions: [
        'Search across different content types from one entry point.',
        'Use search to jump directly into the right group, discussion, or decision.',
        'Recover context quickly when a notification or message is too vague on its own.',
      ],
      concepts: [
        'Search becomes more important as content and relationships multiply.',
        'A strong search result is often a bridge into a deeper workflow rather than the end of the task.',
        'Users rely on search when they know what they need but not where it currently lives.',
      ],
      watchFor: [
        'Search only feels useful when titles, summaries, and related context are understandable.',
        'Filters matter once users are working across many similar spaces.',
        'Search can lead into public or private contexts depending on visibility rules.',
      ],
      states: [
        'Search often begins broadly and narrows fast once the user recognizes the right context.',
        'Users judge search quality by how quickly it gets them back into action.',
      ],
      diagram: {
        title: 'How search helps users navigate',
        description: 'A common path from broad query to specific destination.',
        steps: {
          'search-across': {
            title: 'Search across the workspace',
            description: 'Start with a topic, name, or item you want to locate.',
          },
          'narrow-context': {
            title: 'Narrow the context',
            description: 'Use results and visible cues to identify the right space or item.',
          },
          'jump-to-target': {
            title: 'Jump to the target',
            description: 'Open the result and continue the actual task in its native context.',
          },
        },
      },
    },
    messages: {
      navLabel: 'Messages',
      title: 'Messages',
      summary: 'Direct communication for coordination, clarification, and fast follow-up.',
      audience: 'Members and organizers who need fast communication around active work.',
      entry: 'Read this when you want to understand how direct conversation fits into Polity workflows.',
      perspective:
        'Messages help users close the gap between formal structure and immediate coordination.',
      outcome:
        'When messaging is used well, people resolve blockers faster and move back into the right feature context with less delay.',
      actions: [
        'Start or continue direct conversations with relevant people.',
        'Clarify timing, responsibility, or context around active work.',
        'Use messages as a bridge to decisions, events, and tasks rather than a separate silo.',
      ],
      concepts: [
        'Messages are often where ambiguity gets resolved before action happens elsewhere.',
        'Conversation is strongest when it connects back to shared context, not when it drifts on its own.',
        'Users tend to combine messages with notifications and search for rapid orientation.',
      ],
      watchFor: [
        'Direct communication can create speed, but users still need formal context for lasting decisions.',
        'Threads matter most when they point back to groups, events, or proposals.',
        'Unread state determines whether messages feel urgent or ambient.',
      ],
      states: [
        'Messages usually move from quick coordination into action elsewhere on the platform.',
        'Users read messaging health through responsiveness and how easily context is shared.',
      ],
      diagram: {
        title: 'A simple coordination loop',
        description: 'How messaging usually supports other workflows.',
        steps: {
          'open-thread': {
            title: 'Open the thread',
            description: 'Start a direct conversation around the issue at hand.',
          },
          coordinate: {
            title: 'Coordinate',
            description: 'Exchange the information needed to remove confusion or delay.',
          },
          'follow-links': {
            title: 'Follow linked context',
            description: 'Return to the relevant group, event, or decision once alignment is restored.',
          },
        },
      },
    },
    notifications: {
      navLabel: 'Notifications',
      title: 'Notifications',
      summary: 'Signals that help users notice what changed, what needs action, and what can wait.',
      audience: 'Anyone juggling multiple spaces, deadlines, or active decisions.',
      entry: 'Use this guide when you want to understand how Polity surfaces urgency and relevance.',
      perspective:
        'Notifications shape the user’s sense of momentum by deciding what breaks into attention and what stays in the background.',
      outcome:
        'When notification signals are tuned well, users respond faster without feeling buried in noise.',
      actions: [
        'Review alerts tied to groups, events, amendments, and decisions.',
        'Prioritize what needs immediate action versus later reading.',
        'Use notification signals to jump back into the right workflow quickly.',
      ],
      concepts: [
        'Notifications are not just reminders; they are a routing layer into active work.',
        'Entity-specific notifications can feel different from global notifications.',
        'Urgency only works when users trust that important changes are visible at the right time.',
      ],
      watchFor: [
        'Too many alerts reduce trust in the signal.',
        'Different entity types can generate notifications for different reasons.',
        'Users often combine notifications with search and messages to rebuild context fast.',
      ],
      states: [
        'Notifications can feel ambient, important, or urgent depending on timing and content.',
        'A strong notification system helps users spend less time checking every space manually.',
      ],
      diagram: {
        title: 'From alert to action',
        description: 'A common way users process notifications.',
        steps: {
          'receive-alerts': {
            title: 'Receive alerts',
            description: 'Signals arrive when something important changes or opens.',
          },
          prioritize: {
            title: 'Prioritize',
            description: 'Decide what needs attention now and what can wait.',
          },
          act: {
            title: 'Act',
            description: 'Open the relevant workflow and continue from the right context.',
          },
        },
      },
    },
    calendar: {
      navLabel: 'Calendar',
      title: 'Calendar',
      summary: 'A schedule view that helps users place meetings, deadlines, and upcoming work in time.',
      audience: 'Anyone planning participation or tracking multiple events and deadlines.',
      entry: 'Open this guide to understand how time-based work becomes visible across the platform.',
      perspective:
        'Calendar turns scattered obligations into a view users can actually plan around.',
      outcome:
        'A clear calendar helps users prepare earlier, spot conflicts sooner, and act before deadlines become urgent.',
      actions: [
        'Scan upcoming events and time-bound work in one place.',
        'Open calendar entries to recover the deeper context behind each item.',
        'Use the schedule view to prepare participation and follow-up work.',
      ],
      concepts: [
        'Calendar is where event timing, reminders, and user planning converge.',
        'Visibility in the calendar can change how urgent a task or decision feels.',
        'Users often treat calendar as a preparation surface rather than a final workspace.',
      ],
      watchFor: [
        'Timing shifts can ripple into notifications and attendance expectations.',
        'Calendar entries are most useful when they preserve links to the underlying workflow.',
        'Users often need both a broad schedule view and quick access to details.',
      ],
      states: [
        'The same item can feel distant, upcoming, or immediate depending on the calendar horizon.',
        'Users read the calendar to prepare, not just to confirm dates.',
      ],
      diagram: {
        title: 'How calendar supports preparation',
        description: 'A simple path from schedule awareness to action.',
        steps: {
          'scan-schedule': {
            title: 'Scan the schedule',
            description: 'Review upcoming events, deadlines, and obligations at a glance.',
          },
          'open-entry': {
            title: 'Open the entry',
            description: 'Jump into the item that needs more attention or preparation.',
          },
          prepare: {
            title: 'Prepare',
            description: 'Use the linked context to get ready for what happens next.',
          },
        },
      },
    },
    todos: {
      navLabel: 'Todos',
      title: 'Todos',
      summary: 'Personal and shared follow-up work that keeps decisions from stalling after they are made.',
      audience: 'Anyone responsible for execution, coordination, or tracking completion.',
      entry: 'Use this guide when you want to understand how Polity handles follow-through.',
      perspective:
        'Todos are where users feel whether the platform supports real execution after discussion and decision.',
      outcome:
        'A healthy todo flow closes the loop between coordination, decision, and implementation.',
      actions: [
        'Capture work that emerges from meetings, decisions, or ongoing projects.',
        'Track progress over time and keep responsibilities visible.',
        'Use todos together with notifications and calendar to avoid losing momentum.',
      ],
      concepts: [
        'Todos translate governance and coordination into visible execution.',
        'Work feels more actionable when linked back to the event, group, or proposal that produced it.',
        'Completion state is often the clearest sign that follow-through is happening.',
      ],
      watchFor: [
        'Tasks become noise if they are detached from clear ownership or timing.',
        'Users need to see progress, not just a long list of open work.',
        'Todos often matter most after decisions when enthusiasm starts to fade.',
      ],
      states: [
        'Todos usually move from capture to progress to closure, with visibility at each stage.',
        'Users judge the system by whether it helps them see what is still waiting on action.',
      ],
      diagram: {
        title: 'The follow-through loop',
        description: 'How tasks help decisions turn into completed work.',
        steps: {
          'capture-work': {
            title: 'Capture the work',
            description: 'Turn obligations and next steps into something trackable.',
          },
          'track-progress': {
            title: 'Track progress',
            description: 'Keep the task visible while responsibility and timing stay clear.',
          },
          'close-loop': {
            title: 'Close the loop',
            description: 'Mark the work done and reduce uncertainty about what remains outstanding.',
          },
        },
      },
    },
    'roles-and-rights': {
      navLabel: 'Roles & Rights',
      title: 'Roles And Rights',
      summary: 'How scoped roles and action rights determine what users can see, manage, or change.',
      audience: 'Organizers assigning permissions and members trying to understand why an action is available or missing.',
      entry: 'Read this guide when permissions are shaping the user experience in visible ways.',
      perspective:
        'Users rarely think in terms of permission tables; they notice roles and rights when actions appear, disappear, or require a different person.',
      outcome:
        'A clear role and rights model helps people understand responsibility, delegation, and boundaries without unnecessary confusion.',
      actions: [
        'Assign roles to match responsibility inside a group, event, or other scoped space.',
        'Use action rights to open specific capabilities without making everyone an admin.',
        'Interpret missing actions as part of the permission design rather than a broken interface.',
      ],
      concepts: [
        'Roles package action rights into something organizers and members can reason about.',
        'Scope matters because the same person can have different rights in different spaces.',
        'Users experience rights as available actions, not as abstract policy.',
      ],
      watchFor: [
        'A role in one scope does not automatically imply the same power elsewhere.',
        'Permission issues often surface first around participant management, editing, or governance actions.',
        'Users need explanations that connect visible UI changes to assigned responsibility.',
      ],
      states: [
        'Permissions are mostly invisible until a user needs to do something specific.',
        'Good permission design reduces uncertainty by making responsibility legible rather than hidden.',
      ],
      diagram: {
        title: 'How roles become visible to users',
        description: 'A lane view showing assignment, experience, and enforcement across the system.',
        lanes: {
          organizer: 'Organizer',
          member: 'Member',
          system: 'System',
        },
        steps: {
          'set-scope': {
            title: 'Set the scope',
            description: 'An organizer decides where the role applies: for example in a group or event.',
          },
          'assign-role': {
            title: 'Assign the role',
            description: 'The role bundles action rights that define what the user can do in that scope.',
          },
          'see-available-actions': {
            title: 'See available actions',
            description: 'The member experiences permissions as buttons, tabs, and workflows that are available or hidden.',
          },
          'enforce-boundaries': {
            title: 'Enforce boundaries',
            description: 'The system blocks actions outside the assigned rights and keeps the workflow consistent.',
          },
          'adapt-over-time': {
            title: 'Adapt over time',
            description: 'Organizers update roles as responsibility changes without rebuilding the whole space.',
          },
        },
      },
    },
    'networks-and-forwarding': {
      navLabel: 'Networks & Forwarding',
      title: 'Networks And Forwarding',
      summary: 'How connected groups shape event context and how amendments can move through the network instead of stopping locally.',
      audience: 'Members, organizers, and proposal authors operating across connected groups.',
      entry: 'Open this guide when a decision or amendment does not end in one place.',
      perspective:
        'Users feel the network when a group is connected upward or downward, an event inherits wider structure, or an amendment must continue beyond its origin.',
      outcome:
        'A clear forwarding model helps users understand where work travels, why it moves, and how local context connects to a wider system.',
      actions: [
        'Understand how groups relate to each other in a broader network.',
        'See how event context can derive from a group’s place in that structure.',
        'Follow an amendment as it moves through connected groups instead of ending at its starting point.',
      ],
      concepts: [
        'Network relationships are not just visual; they influence rights and routing.',
        'Events often sit inside a larger group structure, even when users interact with the event directly.',
        'Forwarding turns some amendment flows into a path across connected spaces.',
      ],
      watchFor: [
        'Users need to know whether a proposal is still local or already moving onward.',
        'Different rights can determine which connections matter for a particular workflow.',
        'Network visibility is most valuable when it explains the next destination, not just the map.',
      ],
      states: [
        'A connected group can be structurally close even when the user rarely visits it directly.',
        'Forwarding status matters because it tells users whether the process is waiting, moving, or resolved somewhere else.',
      ],
      diagram: {
        title: 'How network context and forwarding interact',
        description: 'A lane view of group structure, event inheritance, and amendment routing.',
        lanes: {
          group: 'Group',
          event: 'Event',
          amendment: 'Amendment',
        },
        steps: {
          'connect-groups': {
            title: 'Connect groups',
            description: 'Relationships between groups establish the wider structure users work inside.',
          },
          'inherit-context': {
            title: 'Inherit context',
            description: 'Events draw meaning from the group network around them rather than existing in isolation.',
          },
          'route-amendments': {
            title: 'Route amendments',
            description: 'A proposal can move through the network when local handling is only one stage of the process.',
          },
          'confirm-forwarding': {
            title: 'Confirm forwarding',
            description: 'Users need a visible signal that the amendment has moved or is waiting on the previous step.',
          },
          'surface-result': {
            title: 'Surface the result',
            description: 'The amendment eventually returns a visible outcome that users can interpret in context.',
          },
        },
      },
    },
  },
} as const;