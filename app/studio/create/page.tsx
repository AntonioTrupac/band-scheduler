import { StudioForm } from '@/components/StudioForm';

export default function CreateStudioPage() {
  return (
    <main className="flex flex-col px-12 py-8">
      <h1 className="mb-8 text-xl">Create a studio</h1>

      <StudioForm />
    </main>
  );
}
