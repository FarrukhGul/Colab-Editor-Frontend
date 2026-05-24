import {
    MdFormatBold, MdFormatItalic, MdFormatUnderlined,
    MdCode, MdFormatListBulleted, MdFormatListNumbered,
    MdFormatQuote, MdFormatStrikethrough, MdHorizontalRule,
    MdFormatClear, MdUndo, MdRedo,
    MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
    MdFormatColorText, MdHighlight
} from 'react-icons/md'

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px']

const EditorToolbar = ({ editor }) => {
    if (!editor) return null

    const groups = [
        // Undo / Redo
        [
            { action: () => editor.chain().focus().undo().run(), icon: <MdUndo className="text-base" />, label: 'Undo', active: false, type: 'button' },
            { action: () => editor.chain().focus().redo().run(), icon: <MdRedo className="text-base" />, label: 'Redo', active: false, type: 'button' },
        ],
        // Headings + Paragraph
        [
            { action: () => editor.chain().focus().setParagraph().run(), icon: <span className="font-bold text-xs">P</span>, label: 'Paragraph', active: editor.isActive('paragraph'), type: 'button' },
            { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: <span className="font-extrabold text-[11px]">H1</span>, label: 'Heading 1', active: editor.isActive('heading', { level: 1 }), type: 'button' },
            { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: <span className="font-extrabold text-[11px]">H2</span>, label: 'Heading 2', active: editor.isActive('heading', { level: 2 }), type: 'button' },
            { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: <span className="font-extrabold text-[11px]">H3</span>, label: 'Heading 3', active: editor.isActive('heading', { level: 3 }), type: 'button' },
        ],
        // Font Size
        [
            { type: 'fontSize' }
        ],
        // Inline formatting
        [
            { action: () => editor.chain().focus().toggleBold().run(), icon: <MdFormatBold className="text-base" />, label: 'Bold', active: editor.isActive('bold'), type: 'button' },
            { action: () => editor.chain().focus().toggleItalic().run(), icon: <MdFormatItalic className="text-base" />, label: 'Italic', active: editor.isActive('italic'), type: 'button' },
            { action: () => editor.chain().focus().toggleUnderline().run(), icon: <MdFormatUnderlined className="text-base" />, label: 'Underline', active: editor.isActive('underline'), type: 'button' },
            { action: () => editor.chain().focus().toggleStrike().run(), icon: <MdFormatStrikethrough className="text-base" />, label: 'Strikethrough', active: editor.isActive('strike'), type: 'button' },
            { action: () => editor.chain().focus().toggleCode().run(), icon: <MdCode className="text-base" />, label: 'Inline Code', active: editor.isActive('code'), type: 'button' },
        ],
        // Colors
        [
            { type: 'color' },
            { type: 'highlight' }
        ],
        // Alignment
        [
            { action: () => editor.chain().focus().setTextAlign('left').run(), icon: <MdFormatAlignLeft className="text-base" />, label: 'Align Left', active: editor.isActive({ textAlign: 'left' }), type: 'button' },
            { action: () => editor.chain().focus().setTextAlign('center').run(), icon: <MdFormatAlignCenter className="text-base" />, label: 'Align Center', active: editor.isActive({ textAlign: 'center' }), type: 'button' },
            { action: () => editor.chain().focus().setTextAlign('right').run(), icon: <MdFormatAlignRight className="text-base" />, label: 'Align Right', active: editor.isActive({ textAlign: 'right' }), type: 'button' },
            { action: () => editor.chain().focus().setTextAlign('justify').run(), icon: <MdFormatAlignJustify className="text-base" />, label: 'Align Justify', active: editor.isActive({ textAlign: 'justify' }), type: 'button' },
        ],
        // Lists
        [
            { action: () => editor.chain().focus().toggleBulletList().run(), icon: <MdFormatListBulleted className="text-base" />, label: 'Bullet List', active: editor.isActive('bulletList'), type: 'button' },
            { action: () => editor.chain().focus().toggleOrderedList().run(), icon: <MdFormatListNumbered className="text-base" />, label: 'Ordered List', active: editor.isActive('orderedList'), type: 'button' },
        ],
        // Block elements
        [
            { action: () => editor.chain().focus().toggleBlockquote().run(), icon: <MdFormatQuote className="text-base" />, label: 'Blockquote', active: editor.isActive('blockquote'), type: 'button' },
            { action: () => editor.chain().focus().toggleCodeBlock().run(), icon: <span className="font-mono text-xs font-semibold">{"{ }"}</span>, label: 'Code Block', active: editor.isActive('codeBlock'), type: 'button' },
            { action: () => editor.chain().focus().setHorizontalRule().run(), icon: <MdHorizontalRule className="text-base" />, label: 'Horizontal Rule', active: false, type: 'button' },
        ],
        // Clear
        [
            { action: () => editor.chain().focus().unsetAllMarks().clearNodes().run(), icon: <MdFormatClear className="text-base" />, label: 'Clear Formatting', active: false, type: 'button' },
        ],
    ]

    return (
        <div className='border-b border-white/[0.04] bg-[#0c0c11]/90 backdrop-blur-md px-4 py-2 sticky top-[56px] z-30'>
            <div className='max-w-[1200px] mx-auto flex items-center justify-center gap-1.5 flex-wrap md:justify-start'>
                {groups.map((group, gi) => (
                    <div key={gi} className='flex items-center gap-0.5 bg-white/[0.02] border border-white/[0.05] p-0.5 rounded-lg'>
                        {group.map((tool, i) => {
                            if (tool.type === 'fontSize') {
                                return (
                                    <select
                                        key={i}
                                        title='Font Size'
                                        onChange={(e) => {
                                            if(e.target.value) {
                                                editor.chain().focus().setFontSize(e.target.value).run()
                                            } else {
                                                editor.chain().focus().unsetFontSize().run()
                                            }
                                        }}
                                        value={editor.getAttributes('textStyle').fontSize || ''}
                                        className='h-8 px-2 bg-transparent text-sm text-slate-300 hover:text-white rounded border border-transparent hover:bg-white/[0.05] cursor-pointer focus:outline-none focus:border-indigo-500/50 appearance-none'
                                    >
                                        <option value="" className="bg-dark-card text-white">Default</option>
                                        {FONT_SIZES.map(size => (
                                            <option key={size} value={size} className="bg-dark-card text-white">{size}</option>
                                        ))}
                                    </select>
                                )
                            }
                            if (tool.type === 'color') {
                                return (
                                    <div key={i} className="relative group flex items-center justify-center h-8 w-8 hover:bg-white/[0.05] rounded-md cursor-pointer" title="Text Color">
                                        <input
                                            type="color"
                                            onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                                            value={editor.getAttributes('textStyle').color || '#ffffff'}
                                            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                                        />
                                        <MdFormatColorText className="text-base text-slate-400 group-hover:text-white pointer-events-none" style={{ color: editor.getAttributes('textStyle').color }} />
                                    </div>
                                )
                            }
                            if (tool.type === 'highlight') {
                                return (
                                    <div key={i} className="relative group flex items-center justify-center h-8 w-8 hover:bg-white/[0.05] rounded-md cursor-pointer" title="Highlight Color">
                                        <input
                                            type="color"
                                            onInput={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
                                            value={editor.getAttributes('highlight').color || '#000000'}
                                            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                                        />
                                        <MdHighlight className="text-base text-slate-400 group-hover:text-white pointer-events-none" style={{ color: editor.getAttributes('highlight').color }} />
                                    </div>
                                )
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={tool.action}
                                    title={tool.label}
                                    className={`h-8 w-8 text-sm rounded-md transition duration-150 flex items-center justify-center border border-transparent cursor-pointer ${
                                        tool.active
                                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/35 font-medium'
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                                >
                                    {tool.icon}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EditorToolbar