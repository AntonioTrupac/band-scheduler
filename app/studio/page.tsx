import { StudioForm } from '../../components/StudioForm';

export default function StudioPage() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="mb-8">Create Studio</h1>

      <StudioForm />
    </main>
  );
}
