'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
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
          ? 'bg-babyblue-500 text-navy-900 font-semibold'
          : 'text-white/50 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex gap-1 p-2 border-b border-white/10 flex-wrap bg-white/[0.02]">
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </ToolBtn>
      <div className="w-px bg-white/10 mx-1" />
      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolBtn>
      <div className="w-px bg-white/10 mx-1" />
      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolBtn>
      <ToolBtn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        ☐
      </ToolBtn>
      <div className="w-px bg-white/10 mx-1" />
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
  const editor = useEditor({
    extensions,
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <Toolbar editor={editor} />
      <div className="prose-dark prose-editor p-4 min-h-[180px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
