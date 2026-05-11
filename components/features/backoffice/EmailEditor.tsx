'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

/**
 * Dynamic import of ReactQuill to prevent SSR issues.
 */
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200"></div>
});

interface EmailEditorProps {
  value: string;
  onChange: (content: string) => void;
  id?: string;
  __test_loading?: boolean;
}

/**
 * A wrapper for a dynamically imported `ReactQuill` instance, providing a
 * WYSIWYG editor for creating and modifying email template content.
 * The dynamic import prevents SSR issues with the Quill library.
 *
 * @param {EmailEditorProps} props - The component props.
 * @param {string} props.value - The current HTML content of the editor.
 * @param {(content: string) => void} props.onChange - Callback function fired when the editor content changes.
 * @param {string} [props.id] - An optional ID to apply to the editor container.
 */
export function EmailEditor({ value, onChange, id, __test_loading }: EmailEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
    ],
  }), []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[450px]">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="h-[400px]"
      />
    </div>
  );
}
