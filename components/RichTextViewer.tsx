'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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

export default function RichTextViewer({ content }: { content: object | null }) {
  const editor = useEditor({
    extensions,
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable: false,
    immediatelyRender: false,
  })

  return (
    <div className="prose-dark">
      <EditorContent editor={editor} />
    </div>
  )
}
