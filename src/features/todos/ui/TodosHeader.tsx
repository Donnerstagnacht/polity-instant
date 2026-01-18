import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type ViewMode = 'list' | 'kanban';

interface TodosHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function TodosHeader({ viewMode, setViewMode }: TodosHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{t('features.todos.title')}</h1>
        <p className="text-muted-foreground">{t('features.todos.description')}</p>
      </div>
      <div className="flex gap-2">
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Link href="/create/todo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('features.todos.create.newTodo')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
