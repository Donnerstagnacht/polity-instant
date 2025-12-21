import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Circle, Clock, CheckCircle2, XCircle, Flag, AlertCircle } from 'lucide-react';
import { TodoFormData, TodoStatus, TodoPriority } from '../types/todo.types';

interface TodoDetailEditProps {
  formData: TodoFormData;
  onUpdate: (updates: Partial<TodoFormData>) => void;
}

export function TodoDetailEdit({ formData, onUpdate }: TodoDetailEditProps) {
  return (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(v: TodoStatus) => onUpdate({ status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancelled
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(v: TodoPriority) => onUpdate({ priority: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-blue-500" />
                  Low
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-orange-500" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Urgent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Add a description..."
          rows={6}
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="mb-2 block text-sm font-medium">Due Date</label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={e => onUpdate({ dueDate: e.target.value })}
        />
      </div>
    </div>
  );
}
