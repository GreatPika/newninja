// app/page.tsx
'use client';

import { ChatContainer } from '@/components/Container';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Langflow Chat Interface</h1>
      <ChatContainer 
        flowId="54408dda-aada-4064-93f7-f337c123c7c1"
        baseURL="http://localhost:7860"
      />
    </div>
  );
}