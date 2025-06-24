import { useState, useMemo, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Import our animations CSS file
import '@/styles/animations.css';

// Using Lucide icons instead of react-icons (Lucide is commonly bundled with shadcn/ui)
import { MessageSquare, Instagram, Facebook, Ghost, Twitter } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSearch } from '@tanstack/react-router';

// Define interfaces for the user data structure
interface UserStat {
  label: string;
  value: number;
  unit?: string;
}

interface UserContact {
  email: string;
  twitter: string;
  website: string;
  location: string;
}

// Add social media links to the user interface
interface UserSocialMedia {
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
}

interface UserStatement {
  id: number;
  text: string;
  tag: string;
}

interface UserBlog {
  id: number;
  title: string;
  date: string;
  likes: number;
  comments: number;
}

interface UserGroup {
  id: number;
  name: string;
  members: number;
  role: string;
  description?: string;
  tags?: string[];
  amendments?: number;
  events?: number;
  abbr?: string; // Add abbreviation field for the 3-letter code
}

interface UserAmendment {
  id: number;
  title: string;
  subtitle?: string;
  status: 'Passed' | 'Rejected' | 'Under Review' | 'Drafting'; // Using literal types for status
  supporters: number;
  date: string;
  code?: string; // For the 3-letter code + number format
  tags?: string[]; // For the hashtags
}

interface User {
  name: string;
  subtitle: string;
  avatar: string;
  stats: UserStat[];
  about: string;
  contact: UserContact;
  socialMedia: UserSocialMedia;
  statements: UserStatement[];
  blogs: UserBlog[];
  groups: UserGroup[];
  amendments: UserAmendment[];
}

interface TabSearchState {
  blogs: string;
  groups: string;
  amendments: string;
}

export function UserWiki() {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(2.5); // Track the actual follower count
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

  // Use TanStack Router's useSearch to sync search terms with the URL
  const search = useSearch({
    from: '/user/$id/',
  });
  const [searchTerms, setSearchTerms] = useState<TabSearchState>({
    blogs: search.blogs ?? '',
    groups: search.groups ?? '',
    amendments: search.amendments ?? '',
  });

  // Update URL when searchTerms change
  // (Debounce to avoid excessive updates)
  const updateUrlSearch = (tab: keyof TabSearchState, value: string) => {
    // Only update the changed tab, keep others as is
    const newSearch = { ...search, [tab]: value || undefined };
    // Use history.replaceState to avoid navigation
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}?${Object.entries(newSearch)
        .filter(([, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&')}${window.location.hash}`
    );
  };

  // Handle search input changes
  const handleSearchChange = (tab: keyof TabSearchState, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [tab]: value,
    }));
    updateUrlSearch(tab, value);
  };

  // Mock user data
  const user: User = {
    name: 'Sarah Johnson',
    subtitle: 'Constitutional Law Expert',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    stats: [
      { label: 'Amendments', value: 143 },
      { label: 'Followers', value: 2.5, unit: 'k' },
      { label: 'Following', value: 328 },
      { label: 'Network', value: 78 },
      { label: 'Reputation', value: 4.8 },
    ],
    socialMedia: {
      whatsapp: 'https://wa.me/123456789',
      instagram: 'https://instagram.com/sarahjohnson',
      twitter: 'https://x.com/sarahjconst',
      facebook: 'https://facebook.com/sarahjohnson',
      snapchat: 'https://snapchat.com/add/sarahjlaw',
    },
    about:
      'Political scientist specializing in comparative constitutional design. Worked on constitutional reforms in 7 countries across Europe and Africa. Passionate about democratic innovations and citizen participation.',
    contact: {
      email: 'sarah.johnson@politics.org',
      twitter: '@sarahjconst',
      website: 'sarahjohnson.policy.org',
      location: 'Brussels, Belgium',
    },
    statements: [
      {
        id: 1,
        text: "Constitutional courts should be more representative of society's diversity.",
        tag: 'Judiciary',
      },
      {
        id: 2,
        text: 'Digital democracy tools can increase citizen participation in policymaking.',
        tag: 'Participation',
      },
      {
        id: 3,
        text: 'Federalism offers the best balance between unity and autonomy.',
        tag: 'Structure',
      },
      {
        id: 4,
        text: 'Term limits are essential for preventing power concentration.',
        tag: 'Governance',
      },
    ],
    blogs: [
      {
        id: 1,
        title: 'Reimagining Parliamentary Oversight',
        date: 'Mar 15, 2023',
        likes: 324,
        comments: 47,
      },
      {
        id: 2,
        title: "The Case for Citizens' Assemblies",
        date: 'Feb 2, 2023',
        likes: 521,
        comments: 83,
      },
      { id: 3, title: 'Digital Constitutionalism', date: 'Jan 10, 2023', likes: 187, comments: 32 },
    ],
    groups: [
      {
        id: 1,
        name: 'Constitutional Reform Network',
        members: 1243,
        role: 'Founder',
        description: 'Working to modernize constitutional frameworks across Europe',
        tags: ['constitution', 'reform', 'policy', 'governance'],
        amendments: 8,
        events: 12,
        abbr: 'CRN',
      },
      {
        id: 2,
        name: 'Democracy Innovations Lab',
        members: 567,
        role: 'Member',
        description: 'Researching new forms of democratic participation',
        tags: ['democracy', 'innovation', 'research', 'participation'],
        amendments: 3,
        events: 5,
        abbr: 'DIL',
      },
      {
        id: 3,
        name: 'Judicial Independence Initiative',
        members: 389,
        role: 'Advisor',
        description: 'Advocating for stronger protections for courts worldwide',
        tags: ['judiciary', 'independence', 'advocacy', 'courts'],
        amendments: 4,
        events: 2,
        abbr: 'JII',
      },
    ],
    amendments: [
      {
        id: 1,
        code: 'CON-27',
        title: 'Article 27 Reform Proposal',
        subtitle: 'Increasing judicial diversity through appointment reform',
        status: 'Under Review',
        supporters: 1243,
        date: 'Apr 5, 2023',
        tags: ['judicial', 'diversity', 'reform', 'appointments'],
      },
      {
        id: 2,
        code: 'ELC-14',
        title: 'Electoral System Amendment',
        subtitle: 'Moving from first-past-the-post to proportional representation',
        status: 'Passed',
        supporters: 2789,
        date: 'Dec 15, 2022',
        tags: ['electoral', 'voting', 'democracy', 'representation'],
      },
      {
        id: 3,
        code: 'JUD-08',
        title: 'Judicial Appointment Procedure',
        subtitle: 'New transparent process for selecting constitutional judges',
        status: 'Drafting',
        supporters: 342,
        date: 'May 3, 2023',
        tags: ['judiciary', 'transparency', 'selection', 'governance'],
      },
      {
        id: 4,
        code: 'TRM-52',
        title: 'Term Limits for Justices',
        subtitle: 'Proposal for 12-year term limits for Supreme Court justices',
        status: 'Rejected',
        supporters: 1876,
        date: 'Jan 22, 2023',
        tags: ['term-limits', 'judiciary', 'court-reform', 'accountability'],
      },
    ],
  };

  // Filter blogs based on search term
  const filteredBlogs = useMemo(() => {
    const term = (searchTerms.blogs ?? '').toLowerCase();
    if (!term) return user.blogs;

    return user.blogs.filter(
      blog => blog.title.toLowerCase().includes(term) || blog.date.toLowerCase().includes(term)
    );
  }, [user.blogs, searchTerms.blogs]);

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    const term = (searchTerms.groups ?? '').toLowerCase();
    if (!term) return user.groups;

    return user.groups.filter(
      group =>
        group.name.toLowerCase().includes(term) ||
        group.role.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term))
    );
  }, [user.groups, searchTerms.groups]);

  // Filter amendments based on search term
  const filteredAmendments = useMemo(() => {
    const term = (searchTerms.amendments ?? '').toLowerCase();
    if (!term) return user.amendments;

    return user.amendments.filter(
      amendment =>
        amendment.title.toLowerCase().includes(term) ||
        amendment.status.toLowerCase().includes(term) ||
        (amendment.subtitle && amendment.subtitle.toLowerCase().includes(term)) ||
        (amendment.code && amendment.code.toLowerCase().includes(term)) ||
        amendment.date.toLowerCase().includes(term) ||
        (amendment.tags && amendment.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [user.amendments, searchTerms.amendments]);

  // Function to format numbers with appropriate units (k, M)
  const formatNumberWithUnit = (num: number): { value: number; unit: string } => {
    if (num >= 1000000) {
      return { value: +(num / 1000000).toFixed(1), unit: 'M' };
    } else if (num >= 1000) {
      return { value: +(num / 1000).toFixed(1), unit: 'k' };
    }
    return { value: num, unit: '' };
  };

  // Function to handle follow/unfollow with animation
  const handleFollowClick = () => {
    // Toggle the following state
    setFollowing(prev => !prev);

    // Calculate the actual count (converting k to actual numbers)
    const actualFollowers = followerCount * 1000;

    // Update the follower count and show animation
    if (!following) {
      // When following (add a follower)
      setFollowerCount((actualFollowers + 1) / 1000);
      setAnimationText('+1');
      setShowAnimation(true);
    } else {
      // When unfollowing (remove a follower)
      setFollowerCount((actualFollowers - 1) / 1000);
      setAnimationText('-1');
      setShowAnimation(true);
    }

    // Hide animation after it completes
    setTimeout(() => setShowAnimation(false), 1000);
  };

  // Create a version of the stats array with the updated follower count
  const displayStats = user.stats.map(stat => {
    if (stat.label === 'Followers') {
      // For followers, use the follower count state
      const formatted = formatNumberWithUnit(followerCount * 1000);
      return { ...stat, value: formatted.value, unit: formatted.unit };
    } else if (stat.value >= 1000) {
      // For other stats that are >= 1000, also apply the formatting
      const formatted = formatNumberWithUnit(stat.value);
      return { ...stat, value: formatted.value, unit: formatted.unit };
    }
    return stat;
  });

  // Helper function to get appropriate styling based on amendment status
  const getStatusStyles = (status: UserAmendment['status']) => {
    switch (status) {
      case 'Passed':
        return {
          badge: 'primary', // Changed to primary
          bgColor:
            'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/50',
          textColor: 'text-green-800 dark:text-green-300',
          badgeTextColor: 'bg-green-600 text-white hover:bg-green-700', // Custom styling for the badge
        };
      case 'Rejected':
        return {
          badge: 'destructive',
          bgColor:
            'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/40 dark:to-rose-900/50',
          textColor: 'text-red-800 dark:text-red-300',
          badgeTextColor: 'text-white',
        };
      case 'Under Review':
        return {
          badge: 'secondary',
          bgColor:
            'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/50',
          textColor: 'text-blue-800 dark:text-blue-300',
        };
      case 'Drafting':
      default:
        return {
          badge: 'outline',
          bgColor:
            'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/50',
          textColor: 'text-gray-800 dark:text-gray-300',
        };
    }
  };

  // Array of color combinations for statement badges
  const badgeColorVariants = [
    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300' },
    { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-300' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300' },
    { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-300' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-300' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-300' },
  ];

  // Function to get a deterministic color based on tag text to ensure consistency
  const getTagColor = (tag: string) => {
    // Simple hash function to generate a number from the tag text
    const hashCode = tag.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    // Use the hash to select a color from the array
    return badgeColorVariants[hashCode % badgeColorVariants.length];
  };

  // Helper function to get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'founder':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/40',
          text: 'text-purple-800 dark:text-purple-300',
          badge: 'purple',
        };
      case 'advisor':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/40',
          text: 'text-blue-800 dark:text-blue-300',
          badge: 'blue',
        };
      case 'member':
        return {
          bg: 'bg-green-100 dark:bg-green-900/40',
          text: 'text-green-800 dark:text-green-300',
          badge: 'green',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/40',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'gray',
        };
    }
  };

  // Array of gradient combinations for blog cards with stronger dark mode colors
  const gradientVariants = [
    'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
    'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
    'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
    'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
    'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
    'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
    'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
  ];

  // Function to get a deterministic gradient based on blog ID
  const getBlogGradient = (blogId: number) => {
    return gradientVariants[blogId % gradientVariants.length];
  };

  return (
    <>
      <div className="container mx-auto max-w-6xl p-4">
        {/* Profile header */}
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold md:text-4xl">{user.name}</h1>
            <p className="text-muted-foreground mt-1">{user.subtitle}</p>
          </div>
          <Button
            variant={following ? 'outline' : 'default'}
            onClick={handleFollowClick}
            className="mt-2 md:mt-0"
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Stats section - now with animation for followers */}
        <div className="relative mb-6 flex flex-wrap justify-between">
          {displayStats.map((stat, index) => (
            <div key={index} className="relative min-w-[80px] flex-1 px-2 py-2 text-center">
              <p
                className={`text-xl font-bold sm:text-2xl ${
                  stat.label === 'Followers' && showAnimation
                    ? animationText.includes('+')
                      ? 'animate-flash-green'
                      : 'animate-flash-red'
                    : ''
                }`}
              >
                {stat.value}
                {stat.unit || ''}
              </p>
              <p className="text-muted-foreground text-xs">{stat.label}</p>

              {/* Animation overlay for the Followers stat */}
              {stat.label === 'Followers' && showAnimation && (
                <div
                  ref={animationRef}
                  className={`absolute top-0 right-0 left-0 text-xl font-bold ${
                    animationText.includes('+') ? 'text-green-500' : 'text-red-500'
                  } animate-fly-up opacity-0`}
                >
                  {animationText}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social Media Bar - using Lucide icons instead */}
        <div className="mb-8 flex justify-center space-x-6 py-2">
          <TooltipProvider>
            {user.socialMedia.whatsapp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={user.socialMedia.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 transition-transform duration-200 hover:scale-110 hover:text-green-600"
                  >
                    <MessageSquare size={24} />
                    <span className="sr-only">WhatsApp</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            )}
            {user.socialMedia.instagram && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={user.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 transition-transform duration-200 hover:scale-110 hover:text-pink-600"
                  >
                    <Instagram size={24} />
                    <span className="sr-only">Instagram</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Instagram</p>
                </TooltipContent>
              </Tooltip>
            )}
            {user.socialMedia.twitter && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={user.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 transition-transform duration-200 hover:scale-110 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400"
                  >
                    <Twitter size={24} />
                    <span className="sr-only">X (Twitter)</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>X (Twitter)</p>
                </TooltipContent>
              </Tooltip>
            )}
            {user.socialMedia.facebook && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={user.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 transition-transform duration-200 hover:scale-110 hover:text-blue-700"
                  >
                    <Facebook size={24} />
                    <span className="sr-only">Facebook</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Facebook</p>
                </TooltipContent>
              </Tooltip>
            )}
            {user.socialMedia.snapchat && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={user.socialMedia.snapchat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 transition-transform duration-200 hover:scale-110 hover:text-yellow-500"
                  >
                    <Ghost size={24} />
                    <span className="sr-only">Snapchat</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snapchat</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* About/Contact tabs */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>{user.about}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span>
                  <span>{user.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Twitter:</span>
                  <span>{user.contact.twitter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Website:</span>
                  <span>{user.contact.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Location:</span>
                  <span>{user.contact.location}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Statement carousel */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-semibold">Key Statements</h2>
          <Carousel
            className="w-full"
            opts={{
              align: 'start',
              dragFree: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {user.statements.map(statement => {
                const tagColor = getTagColor(statement.tag);
                return (
                  <CarouselItem
                    key={statement.id}
                    className="basis-[85%] pl-2 sm:basis-1/2 md:basis-1/2 md:pl-4 lg:basis-1/3"
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <Badge className={`${tagColor.bg} ${tagColor.text} hover:${tagColor.bg}`}>
                          {statement.tag}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg italic">"{statement.text}"</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Content tabs (Blogs/Groups/Amendments) */}
        <div className="mt-8">
          <Tabs defaultValue="blogs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="amendments">Amendments</TabsTrigger>
            </TabsList>

            {/* Blogs tab */}
            <TabsContent value="blogs" className="mt-4">
              <div className="relative mb-4">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search blogs..."
                  className="pl-10"
                  value={searchTerms.blogs}
                  onChange={e => handleSearchChange('blogs', e.target.value)}
                />
              </div>

              {filteredBlogs.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No blogs found matching your search.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBlogs.map(blog => {
                    const gradientClass = getBlogGradient(blog.id);

                    return (
                      <Card
                        key={blog.id}
                        className={`overflow-hidden ${gradientClass} flex h-full flex-col transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
                      >
                        <CardHeader className="">
                          <CardTitle>{blog.title}</CardTitle>
                          <CardDescription>{blog.date}</CardDescription>
                        </CardHeader>
                        <CardFooter className="text-muted-foreground mt-auto flex items-center justify-between">
                          <span className="flex items-center">
                            <span className="text-red-500">♥</span>
                            <span className="ml-1">{blog.likes} likes</span>
                          </span>
                          <span className="flex items-center">
                            <span>💬</span>
                            <span className="ml-1">{blog.comments} comments</span>
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Groups tab */}
            <TabsContent value="groups" className="mt-4">
              <div className="relative mb-4">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search groups by name, role or description..."
                  className="pl-10"
                  value={searchTerms.groups}
                  onChange={e => handleSearchChange('groups', e.target.value)}
                />
              </div>

              {filteredGroups.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No groups found matching your search.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGroups.map(group => {
                    const roleColor = getRoleBadgeColor(group.role);
                    const badgeClasses = `${roleColor.bg} ${roleColor.text}`;

                    return (
                      <Card
                        key={group.id}
                        className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
                      >
                        <CardHeader>
                          {group.abbr && (
                            <Badge variant="secondary" className="mb-2 w-fit">
                              {group.abbr}
                            </Badge>
                          )}
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>{group.description}</CardDescription>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className={`${badgeClasses} hover:${badgeClasses}`}>
                              {group.role}
                            </Badge>
                            <Badge className={`${badgeClasses} hover:${badgeClasses}`}>
                              {group.members} members
                            </Badge>
                            {group.amendments && (
                              <Badge className={`${badgeClasses} hover:${badgeClasses}`}>
                                {group.amendments} amendments
                              </Badge>
                            )}
                            {group.events && (
                              <Badge className={`${badgeClasses} hover:${badgeClasses}`}>
                                {group.events} events
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {group.tags && group.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {group.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Amendments tab */}
            <TabsContent value="amendments" className="mt-4">
              <div className="relative mb-4">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search amendments by title, code, tags..."
                  className="pl-10"
                  value={searchTerms.amendments}
                  onChange={e => handleSearchChange('amendments', e.target.value)}
                />
              </div>

              {filteredAmendments.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No amendments found matching your search.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredAmendments.map(amendment => {
                    const statusStyle = getStatusStyles(amendment.status);
                    return (
                      <Card
                        key={amendment.id}
                        className="overflow-hidden transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className={`flex-1 p-6 ${statusStyle.bgColor}`}>
                            {amendment.code && (
                              <Badge variant="secondary" className="mb-2">
                                {amendment.code}
                              </Badge>
                            )}
                            <h3 className={`text-lg font-semibold ${statusStyle.textColor}`}>
                              {amendment.title}
                            </h3>
                            {amendment.subtitle && (
                              <p className="text-muted-foreground mb-2 text-sm">
                                {amendment.subtitle}
                              </p>
                            )}
                            <p className="text-muted-foreground mt-1 text-sm">
                              {amendment.supporters} supporters • {amendment.date}
                            </p>
                            {amendment.tags && amendment.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {amendment.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div
                            className={`flex items-center justify-center p-6 ${statusStyle.bgColor} border-l`}
                          >
                            <Badge
                              variant={statusStyle.badge as any}
                              className={statusStyle.badgeTextColor || ''}
                            >
                              {amendment.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
