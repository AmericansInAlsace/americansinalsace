import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TemplateEditorForm } from '@/components/features/backoffice/TemplateEditorForm';

/**
 * Backoffice Edit Email Template Page.
 */
export default async function EditEmailTemplatePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const template = await prisma.emailTemplate.findUnique({
    where: { id: parseInt(id) },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Edit Template: {template.name}</h1>
        <p className="text-gray-600 mt-2">Update the content and subject of the <strong>{template.slug}</strong> automated email.</p>
      </header>

      <TemplateEditorForm template={template} />
    </div>
  );
}
