import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Users, FileText, BookOpen, Scale, Calendar } from 'lucide-react';
import { SearchType } from '../types/search.types';
import { SearchResults } from './SearchResults';

interface SearchTabsProps {
  searchType: SearchType;
  handleTypeChange: (type: SearchType) => void;
  totalResults: number;
  allResults: any;
  mosaicResults: any[];
  isLoading: boolean;
}

export function SearchTabs({
  searchType,
  handleTypeChange,
  totalResults,
  allResults,
  mosaicResults,
  isLoading,
}: SearchTabsProps) {
  return (
    <Tabs value={searchType} onValueChange={value => handleTypeChange(value as SearchType)}>
      <ScrollableTabsList>
        <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
        <TabsTrigger value="users">
          <Users className="mr-2 h-4 w-4" />
          Users ({allResults.users.length})
        </TabsTrigger>
        <TabsTrigger value="groups">
          <Users className="mr-2 h-4 w-4" />
          Groups ({allResults.groups.length})
        </TabsTrigger>
        <TabsTrigger value="events">
          <Calendar className="mr-2 h-4 w-4" />
          Events ({allResults.events.length})
        </TabsTrigger>
        <TabsTrigger value="statements">
          <FileText className="mr-2 h-4 w-4" />
          Statements ({allResults.statements.length})
        </TabsTrigger>
        <TabsTrigger value="blogs">
          <BookOpen className="mr-2 h-4 w-4" />
          Blogs ({allResults.blogs.length})
        </TabsTrigger>
        <TabsTrigger value="amendments">
          <Scale className="mr-2 h-4 w-4" />
          Amendments ({allResults.amendments.length})
        </TabsTrigger>
      </ScrollableTabsList>

      <TabsContent value="all">
        <SearchResults results={mosaicResults} type="all" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="users">
        <SearchResults results={allResults.users} type="users" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="groups">
        <SearchResults results={allResults.groups} type="groups" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="events">
        <SearchResults results={allResults.events} type="events" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="statements">
        <SearchResults results={allResults.statements} type="statements" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="blogs">
        <SearchResults results={allResults.blogs} type="blogs" isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="amendments">
        <SearchResults results={allResults.amendments} type="amendments" isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
