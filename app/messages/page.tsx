import { Suspense } from 'react';
import MessagesPage from '@/features/messages/MessagesPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPage />
    </Suspense>
  );
}
