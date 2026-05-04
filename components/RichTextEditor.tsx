'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { useRef, useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'

const extensions = [
  StarterKit,
  TaskList,
  TaskItem.configure({ nested: false }),
  Image,
  Youtube.configure({ controls: true, modestBranding: true }),
]

function ToolBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault()
        onClick()
      }}
      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
        active
          ? 'bg-[#b0e455]/20 text-[#b0e455] font-semibold'
          : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)]'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex gap-1 p-2 border-b border-[var(--c-border)] flex-wrap bg-[var(--c-card2)]">
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </ToolBtn>
      <div className="w-px bg-[var(--c-border)] mx-1" />
      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolBtn>
      <div className="w-px bg-[var(--c-border)] mx-1" />
      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolBtn>
      <ToolBtn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        ☐
      </ToolBtn>
      <div className="w-px bg-[var(--c-border)] mx-1" />
      <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </ToolBtn>
    </div>
  )
}

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: object | null
  onChange: (json: object) => void
}) {
  // Keep a stable ref so TipTap's onUpdate always calls the latest onChange
  // without needing to recreate the editor (fixes stale-closure bug across tab switches)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const editor = useEditor({
    extensions,
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON())
    },
  })

  return (
    <div className="border border-[var(--c-border)] rounded-xl overflow-hidden">
      <Toolbar editor={editor} />
      <div className="prose-dark prose-editor p-4 min-h-[180px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
