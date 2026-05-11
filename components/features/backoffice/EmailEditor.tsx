'use client';

import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

/**
 * Dynamic import of ReactQuill to prevent SSR issues.
 */
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div data-testid="quill-loading" className="h-[400px] w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200"></div>
});

interface EmailEditorProps {
  value: string;
  onChange: (content: string) => void;
  id?: string;
  availablePlaceholders?: string[];
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
 * @param {string[]} [props.availablePlaceholders] - List of placeholders that can be inserted.
 */
export function EmailEditor({ value, onChange, id, availablePlaceholders = [], __test_loading }: EmailEditorProps) {
  const quillRef = useRef<any>(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  const handleInsertPlaceholder = (placeholder: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, `{{${placeholder}}}`);
      quill.setSelection(range.index + placeholder.length + 4);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
      {availablePlaceholders.length > 0 && (
        <div className="bg-gray-50 p-2 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Insert Variable:</span>
          {availablePlaceholders.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => handleInsertPlaceholder(p)}
              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors font-mono text-blue-600"
            >
              {`{{${p}}}`}
            </button>
          ))}
        </div>
      )}
      <div className="flex-grow">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          className="h-[400px]"
          {...(__test_loading ? { __test_loading: true } : {})}
        />
      </div>
    </div>
  );
}
