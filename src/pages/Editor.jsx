import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { FontSize } from '../components/editor/extensions/FontSize'
import { io } from 'socket.io-client'
import {
    getDocumentByIdAPI,
    updateDocumentAPI,
    getVersionsAPI,
    restoreVersionAPI,
    getCollaboratorsAPI,
    addCollaboratorAPI,
    removeCollaboratorAPI
} from '../services/api'
import EditorToolbar from '../components/editor/EditorToolbar'
import ActiveUsers from '../components/editor/ActiveUsers'
import {
    MdArrowBack, MdHistory, MdPeople, MdShare, MdDownload, MdPictureAsPdf, MdDescription
} from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

// ─── Helpers ───────────────────────────────────────────────────────────────

const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('en-PK', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || ''

const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-pink-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'
]

// Normalize active-users payload — backend sends array OR {users:[...]}
const normalizeUsers = (payload) => {
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.users)) return payload.users
    return []
}

// ─── Component ─────────────────────────────────────────────────────────────

const Editor = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    // ── All refs declared at top — no refs after effects ──────────────────
    const socketRef       = useRef(null)
    const saveTimerRef    = useRef(null)
    const isRemoteUpdate  = useRef(false)
    const userRoleRef     = useRef('viewer')
    const editorReadyRef  = useRef(false)
    const editorRef       = useRef(null)

    // ── Document state ─────────────────────────────────────────────────────
    const [doc,               setDoc]               = useState(null)
    const [title,             setTitle]             = useState('')
    const [loading,           setLoading]           = useState(true)
    const [error,             setError]             = useState('')
    const [userRole,          setUserRole]          = useState('viewer')

    // ── UI state ───────────────────────────────────────────────────────────
    const [saveStatus,        setSaveStatus]        = useState('saved')
    const [connected,         setConnected]         = useState(false)
    const [activeUsers,       setActiveUsers]       = useState([])
    const [showCollaborators, setShowCollaborators] = useState(false)
    const [showVersions,      setShowVersions]      = useState(false)
    const [showExportMenu,    setShowExportMenu]    = useState(false)

    // ── Collaborator state ─────────────────────────────────────────────────
    const [collaborators,  setCollaborators]  = useState([])
    const [collabEmail,    setCollabEmail]    = useState('')
    const [collabRole,     setCollabRole]     = useState('editor')
    const [collabLoading,  setCollabLoading]  = useState(false)
    const [collabError,    setCollabError]    = useState('')
    const [collabSuccess,  setCollabSuccess]  = useState('')
    const [removingId,     setRemovingId]     = useState(null)

    // ── Version state ──────────────────────────────────────────────────────
    const [versions,        setVersions]        = useState([])
    const [versionsLoading, setVersionsLoading] = useState(false)

    // Keep role ref in sync
    useEffect(() => { userRoleRef.current = userRole }, [userRole])

    // ─── Auto save ─────────────────────────────────────────────────────────
    const autoSave = useCallback(async (newContent, newTitle) => {
        if (userRoleRef.current === 'viewer') return
        setSaveStatus('unsaved')
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
            setSaveStatus('saving')
            try {
                await updateDocumentAPI(id, { title: newTitle, content: newContent })
                setSaveStatus('saved')
            } catch {
                setSaveStatus('unsaved')
            }
        }, 2000)
    }, [id])

    // ─── Tiptap editor ─────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            FontSize,
        ],
        content: '',
        editable: false,
        onUpdate: ({ editor: ed }) => {
            if (isRemoteUpdate.current) {
                isRemoteUpdate.current = false
                return
            }
            const html = ed.getHTML()
            socketRef.current?.emit('document-change', {
                documentId: id,
                content: html,
                userId: (user?._id || user?.id || '').toString()
            })
            autoSave(html, title)
        }
    })

    useEffect(() => {
        editorRef.current = editor
    }, [editor])

    // ─── Fetch document ────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false
        const run = async () => {
            try {
                setLoading(true)
                const res = await getDocumentByIdAPI(id)
                if (cancelled) return

                const fetchedDoc = res.data.document
                setDoc(fetchedDoc)
                setTitle(fetchedDoc.title || '')

                const currentUserId = (user?._id || user?.id || '').toString()
                const ownerId = (fetchedDoc.owner._id || fetchedDoc.owner).toString()
                const isOwner = ownerId === currentUserId
                const collab = fetchedDoc.collaborators?.find(
                    c => (c.user._id || c.user).toString() === currentUserId
                )
                const role = isOwner ? 'owner' : (collab?.role || 'viewer')
                setUserRole(role)
                userRoleRef.current = role
            } catch (err) {
                if (cancelled) return
                if (err.response?.status === 403) setError('You do not have access to this document.')
                else if (err.response?.status === 404) setError('Document not found.')
                else setError('Failed to load document.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => { cancelled = true }
    }, [id, user])

    // ─── Set editor content once doc + editor are both ready ──────────────
    useEffect(() => {
        if (!editor || !doc || editorReadyRef.current) return

        const currentUserId = (user?._id || user?.id || '').toString()
        const ownerId = (doc.owner._id || doc.owner).toString()
        const isOwner = ownerId === currentUserId
        const collab = doc.collaborators?.find(
            c => (c.user._id || c.user).toString() === currentUserId
        )
        const canEdit = isOwner || collab?.role === 'editor'

        editor.commands.setContent(doc.content || '<p></p>')
        editor.setEditable(canEdit)
        editorReadyRef.current = true
    }, [editor, doc, user])

    // ─── Socket ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return

        const socket = io(
            import.meta.env.VITE_SOCKET_URL || 'https://colab-editor-backend.onrender.com/api',
            {
                auth: { token: sessionStorage.getItem('accessToken') },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            }
        )
        socketRef.current = socket

        socket.on('connect',       () => setConnected(true))
        socket.on('disconnect',    () => setConnected(false))
        socket.on('connect_error', () => setConnected(false))

        // Receive edits from other users
        socket.on('document-updated', ({ content: newContent, userId }) => {
            const currentUserId = (user._id || user.id || '').toString()
            if (userId !== currentUserId && editorReadyRef.current) {
                isRemoteUpdate.current = true
                editorRef.current?.commands.setContent(newContent)
            }
        })

        socket.on('active-users', (payload) => {
            setActiveUsers(normalizeUsers(payload))
        })

        socket.on('user-joined', (userData) => {
            setActiveUsers(prev => {
                const exists = prev.find(u => u.userId === userData.userId)
                return exists ? prev : [...prev, userData]
            })
        })

        socket.on('user-left', ({ userId }) => {
            setActiveUsers(prev => prev.filter(u => u.userId !== userId))
        })

        return () => socket.disconnect()
    }, [user])

    // ─── Join / leave room ─────────────────────────────────────────────────
    useEffect(() => {
        if (!doc || !socketRef.current) return
        socketRef.current.emit('join-document', id)
        return () => socketRef.current?.emit('leave-document', id)
    }, [doc, id])

    // ─── Title change ──────────────────────────────────────────────────────
    const handleTitleChange = (e) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (editor) autoSave(editor.getHTML(), newTitle)
    }

    // ─── Export functions ──────────────────────────────────────────────────
    const handleExportPDF = () => {
        setShowExportMenu(false)
        window.print()
    }

    const handleExportDOCX = () => {
        if (!editor) return
        setShowExportMenu(false)
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + (title || 'Document') + "</title></head><body>"
        const footer = "</body></html>"
        const html = header + editor.getHTML() + footer
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${title || 'document'}.doc`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    // ─── Collaborator actions ──────────────────────────────────────────────
    const fetchCollaborators = async () => {
        try {
            const res = await getCollaboratorsAPI(id)
            setCollaborators(res.data.collaborators)
        } catch (err) {
            console.error(err)
        }
    }

    const handleOpenCollaborators = () => {
        fetchCollaborators()
        setShowCollaborators(true)
        setShowVersions(false)
    }

    const handleAddCollaborator = async (e) => {
        e.preventDefault()
        setCollabLoading(true)
        setCollabError('')
        setCollabSuccess('')
        try {
            await addCollaboratorAPI(id, { email: collabEmail, role: collabRole })
            setCollabSuccess(`${collabEmail} added successfully`)
            setCollabEmail('')
            await fetchCollaborators()
        } catch (err) {
            setCollabError(err.response?.data?.message || 'Failed to add collaborator.')
        } finally {
            setCollabLoading(false)
        }
    }

    const handleRemoveCollaborator = async (userId) => {
        setRemovingId(userId)
        try {
            await removeCollaboratorAPI(id, userId)
            setCollaborators(prev => prev.filter(c => c.user._id !== userId))
        } catch (err) {
            console.error(err)
        } finally {
            setRemovingId(null)
        }
    }

    // ─── Version actions ───────────────────────────────────────────────────
    const handleOpenVersions = async () => {
        setVersionsLoading(true)
        setShowVersions(true)
        setShowCollaborators(false)
        try {
            const res = await getVersionsAPI(id)
            setVersions(res.data.versions)
        } catch (err) {
            console.error(err)
        } finally {
            setVersionsLoading(false)
        }
    }

    const handleRestoreVersion = async (versionId) => {
        try {
            const res = await restoreVersionAPI(id, { versionId })
            const restoredContent = res.data.document.content || '<p></p>'
            
            // Use emitUpdate: true to trigger onUpdate, broadcast to socket, and autosave
            editor?.commands.setContent(restoredContent, true)
            setTitle(res.data.document.title)
            
            setShowVersions(false)
            setSaveStatus('saved')
        } catch (err) {
            console.error('Error restoring version:', err)
            alert(err.response?.data?.message || 'Failed to restore version.')
        }
    }

    // ─── Derived values ────────────────────────────────────────────────────
    const currentUserId  = (user?._id || user?.id || '').toString()

    // ─── Loading ───────────────────────────────────────────────────────────
    if (loading) return (
        <div className='flex items-center justify-center min-h-screen bg-dark-bg'>
            <div className='flex flex-col items-center gap-3'>
                <FaSpinner className='text-indigo-400 text-4xl animate-spin' />
                <p className='text-slate-500 text-sm font-medium'>Fetching document editor...</p>
            </div>
        </div>
    )

    // ─── Error ─────────────────────────────────────────────────────────────
    if (error) return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-dark-bg gap-5 px-4 text-center'>
            <div className='w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center'>
                <span className='text-red-400 font-extrabold text-2xl'>!</span>
            </div>
            <h2 className='text-white font-display font-bold text-lg'>Access Request Blocked</h2>
            <p className='text-red-400/90 text-sm max-w-sm leading-relaxed'>{error}</p>
            <button
                onClick={() => navigate('/dashboard')}
                className='px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer'
            >
                Back to Dashboard
            </button>
        </div>
    )

    const isSidebarOpen = showCollaborators || showVersions

    return (
        <div className='min-h-screen bg-dark-bg flex flex-col text-white relative overflow-hidden'>
            {/* Navbar */}
            <nav className='border-b border-dark-border bg-dark-bg/85 backdrop-blur-md sticky top-0 z-40 h-14'>
                <div className='px-4 md:px-6 h-full flex items-center justify-between gap-4'>

                    {/* Left side: Back to dashboard & title */}
                    <div className='flex items-center gap-3.5 flex-1 min-w-0'>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className='p-2 hover:bg-white/4 border border-transparent hover:border-white/6 rounded-xl transition shrink-0 cursor-pointer'
                            title='Back to documents'
                        >
                            <MdArrowBack className='text-slate-400 text-lg' />
                        </button>
                        <div className='flex flex-col justify-center min-w-0 max-w-sm md:max-w-md'>
                            <input
                                type='text'
                                value={title}
                                onChange={handleTitleChange}
                                disabled={userRole === 'viewer'}
                                placeholder='Untitled Document'
                                className='bg-transparent text-white font-display font-semibold text-sm focus:outline-none border-b border-transparent focus:border-indigo-500 transition-colors truncate disabled:cursor-default placeholder-slate-600 py-0.5'
                            />
                        </div>
                    </div>

                    {/* Center side: Save, connection state & live users */}
                    <div className='flex items-center gap-4 shrink-0'>
                        {/* Save status indicator */}
                        <div className={`text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            saveStatus === 'saved'  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            saveStatus === 'saving' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'   : 'bg-slate-800/40 text-slate-400 border border-slate-700/30'
                        }`}>
                            {saveStatus === 'saving' ? (
                                <FaSpinner className='animate-spin text-[10px]' />
                            ) : (
                                <span className='text-[10px]'>●</span>
                            )}
                            <span className='hidden sm:block capitalize'>{saveStatus}</span>
                        </div>

                        {/* Connection status indicator */}
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            <span className='hidden sm:block'>{connected ? 'Live Sync' : 'Offline'}</span>
                        </div>

                        {/* User Avatars stack */}
                        <ActiveUsers activeUsers={activeUsers} currentUserId={currentUserId} />
                    </div>

                    {/* Right side: Share & History toggles */}
                    <div className='flex items-center gap-2.5 shrink-0'>
                        {userRole === 'owner' && (
                            <button
                                onClick={handleOpenCollaborators}
                                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                                    showCollaborators 
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                                        : 'bg-white/3 border-white/8 hover:bg-white/[0.07] text-slate-300'
                                }`}
                            >
                                <MdShare className='text-sm' />
                                <span className='hidden sm:block'>Share</span>
                            </button>
                        )}
                        <button
                            onClick={handleOpenVersions}
                            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                                showVersions 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                                    : 'bg-white/3 border-white/8 hover:bg-white/[0.07] text-slate-300'
                            }`}
                        >
                            <MdHistory className='text-sm' />
                            <span className='hidden sm:block'>History</span>
                        </button>
                        
                        {/* Export Dropdown */}
                        <div className='relative'>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className='flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/3 border border-white/8 hover:bg-white/[0.07] text-slate-300 transition-all duration-200 cursor-pointer'
                            >
                                <MdDownload className='text-sm' />
                                <span className='hidden sm:block'>Export</span>
                            </button>
                            
                            {showExportMenu && (
                                <div className='absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-50 py-1'>
                                    <button 
                                        onClick={handleExportPDF}
                                        className='w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-2 transition-colors cursor-pointer'
                                    >
                                        <MdPictureAsPdf className='text-rose-400' /> PDF Document
                                    </button>
                                    <button 
                                        onClick={handleExportDOCX}
                                        className='w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-2 transition-colors cursor-pointer'
                                    >
                                        <MdDescription className='text-blue-400' /> Word (.doc)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Formatting Toolbar */}
            {userRole !== 'viewer' && editor && <EditorToolbar editor={editor} />}

            {/* Viewer banner */}
            {userRole === 'viewer' && (
                <div className='flex items-center justify-center gap-2 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-semibold animate-fade-in'>
                    View Only Workspace — your changes will not be saved.
                </div>
            )}

            {/* Workspace split view */}
            <div className='flex-1 flex w-full relative overflow-hidden'>
                {/* Editor Content Box */}
                <div className={`flex-1 overflow-y-auto px-4 md:px-16 py-8 transition-all duration-300 ${isSidebarOpen ? 'mr-0 lg:mr-85' : ''}`}>
                    <div className='max-w-4xl mx-auto bg-dark-card/30 border border-dark-border/40 rounded-2xl p-6 md:p-10 shadow-2xl relative min-h-150'>
                        <div className='tiptap-editor'>
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>

                {/* Sliding side drawer */}
                <aside className={`fixed right-0 top-14 bottom-0 border-l border-dark-border bg-dark-card w-full sm:w-85 z-30 shadow-2xl flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    {/* Collaborator Drawer content */}
                    {showCollaborators && (
                        <div className='h-full flex flex-col animate-fade-in'>
                            {/* Drawer Header */}
                            <div className='flex items-center justify-between px-5 py-4 border-b border-dark-border'>
                                <div>
                                    <h2 className='text-white font-display font-bold text-sm'>Workspace Collaborators</h2>
                                    <p className='text-slate-500 text-xs mt-0.5'>Manage member invitation permissions</p>
                                </div>
                                <button 
                                    onClick={() => setShowCollaborators(false)} 
                                    className='p-1.5 hover:bg-white/4 rounded-lg border border-transparent hover:border-white/6 text-slate-400 hover:text-white transition cursor-pointer'
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Invite Collaborator Form */}
                            <div className='px-5 py-4 border-b border-dark-border bg-[#0a0a0f]/40'>
                                {collabError && (
                                    <div className='mb-3 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold animate-fade-in'>
                                        {collabError}
                                    </div>
                                )}
                                {collabSuccess && (
                                    <div className='mb-3 px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold animate-fade-in'>
                                        {collabSuccess}
                                    </div>
                                )}
                                <form onSubmit={handleAddCollaborator} className='space-y-3.5'>
                                    <div className='space-y-1'>
                                        <label className='text-[10px] text-slate-400 uppercase tracking-wider font-bold'>Collaborator Email</label>
                                        <input
                                            type='email' 
                                            value={collabEmail}
                                            onChange={e => setCollabEmail(e.target.value)}
                                            placeholder='colleague@domain.com' 
                                            required
                                            className='w-full px-3 py-2.5 bg-dark-bg border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 text-sm transition'
                                        />
                                    </div>
                                    <div className='flex gap-2'>
                                        <select 
                                            value={collabRole} 
                                            onChange={e => setCollabRole(e.target.value)}
                                            className='flex-1 px-3 py-2.5 bg-dark-bg border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/70 text-sm cursor-pointer'
                                        >
                                            <option value='editor'>Editor (Can edit)</option>
                                            <option value='viewer'>Viewer (Read only)</option>
                                        </select>
                                        <button 
                                            type='submit' 
                                            disabled={collabLoading}
                                            className='px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/15 cursor-pointer'
                                        >
                                            {collabLoading ? <FaSpinner className='animate-spin' /> : 'Invite'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Collaborator member list */}
                            <div className='flex-1 overflow-y-auto px-5 py-4'>
                                <p className='text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3.5'>Access Members ({collaborators.length})</p>
                                {collaborators.length === 0 ? (
                                    <div className='text-center py-10 bg-white/1 border border-dashed border-white/6 rounded-2xl p-4'>
                                        <MdPeople className='text-slate-600 text-3xl mx-auto mb-2' />
                                        <p className='text-slate-400 text-xs font-semibold'>No collaborators invited yet</p>
                                        <p className='text-slate-600 text-[11px] mt-1'>Invite members via email above to work together.</p>
                                    </div>
                                ) : (
                                    <div className='space-y-2.5'>
                                        {collaborators.map((c, i) => (
                                            <div key={c._id} className='flex items-center justify-between p-3 bg-dark-bg/60 border border-dark-border rounded-xl group hover:border-indigo-500/20 transition duration-150'>
                                                <div className='flex items-center gap-3 min-w-0'>
                                                    <div className={`w-8 h-8 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-inner`}>
                                                        {getInitials(c.user?.name)}
                                                    </div>
                                                    <div className='min-w-0'>
                                                        <p className='text-white text-xs font-semibold truncate'>{c.user?.name}</p>
                                                        <p className='text-slate-500 text-[10px] truncate mt-0.5'>{c.user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2 shrink-0 ml-1'>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                                                        c.role === 'editor' 
                                                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                                            : 'bg-slate-800 text-slate-400 border-slate-700/40'
                                                    }`}>
                                                        {c.role}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleRemoveCollaborator(c.user?._id)} 
                                                        disabled={removingId === c.user?._id}
                                                        className='p-1.5 hover:bg-red-500/10 rounded-lg transition cursor-pointer'
                                                        title='Revoke permissions'
                                                    >
                                                        {removingId === c.user?._id ? (
                                                            <FaSpinner className='text-xs text-red-400 animate-spin' />
                                                        ) : (
                                                            <span className='text-slate-500 hover:text-red-400 text-sm font-bold transition'>✕</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Version History Drawer content */}
                    {showVersions && (
                        <div className='h-full flex flex-col animate-fade-in'>
                            {/* Drawer Header */}
                            <div className='flex items-center justify-between px-5 py-4 border-b border-dark-border'>
                                <div>
                                    <h2 className='text-white font-display font-bold text-sm'>Version History</h2>
                                    <p className='text-slate-500 text-xs mt-0.5'>Restore timeline versions</p>
                                </div>
                                <button 
                                    onClick={() => setShowVersions(false)} 
                                    className='p-1.5 hover:bg-white/4 rounded-lg border border-transparent hover:border-white/6 text-slate-400 hover:text-white transition cursor-pointer'
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Timeline List */}
                            <div className='flex-1 overflow-y-auto px-5 py-4'>
                                {versionsLoading ? (
                                    <div className='flex flex-col items-center justify-center py-20 gap-2.5'>
                                        <FaSpinner className='text-indigo-400 text-2xl animate-spin' />
                                        <p className='text-slate-500 text-xs font-semibold'>Reading timeline logs...</p>
                                    </div>
                                ) : versions.length === 0 ? (
                                    <div className='text-center py-10 bg-white/1 border border-dashed border-white/6 rounded-2xl p-4'>
                                        <MdHistory className='text-slate-600 text-3xl mx-auto mb-2' />
                                        <p className='text-slate-400 text-xs font-semibold'>No version states logged</p>
                                        <p className='text-slate-600 text-[11px] mt-1'>State versions save automatically as you make changes.</p>
                                    </div>
                                ) : (
                                    <div className='relative pl-4 border-l border-white/6 space-y-5 py-1.5 ml-2'>
                                        {versions.map((version, index) => (
                                            <div key={version._id} className='relative group'>
                                                {/* Timeline node */}
                                                <div className={`absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border-2 transition duration-200 ${
                                                    index === 0 
                                                        ? 'bg-amber-400 border-amber-400 group-hover:bg-amber-300' 
                                                        : 'bg-indigo-500 border-indigo-500 group-hover:bg-indigo-400'
                                                }`} />

                                                <div className='p-3.5 bg-dark-bg/60 border border-dark-border hover:border-indigo-500/20 rounded-xl transition duration-150'>
                                                    <div className='flex items-center justify-between mb-1.5'>
                                                        <div className='flex items-center gap-1.5'>
                                                            <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-md ${
                                                                index === 0
                                                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                                                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                                            }`}>
                                                                v{version.versionNumber}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className='text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded-md'>
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className='text-[10px] text-slate-500 font-medium'>{formatDate(version.createdAt)}</span>
                                                    </div>
                                                    
                                                    {/* Snippet preview */}
                                                    <p className='text-slate-400 text-xs font-mono line-clamp-2 mb-3 bg-black/15 p-2 rounded-lg border border-white/2'>
                                                        {stripHtml(version.content) || 'Empty document state'}
                                                    </p>

                                                    {/* User metadata & restore */}
                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex items-center gap-1.5 min-w-0'>
                                                            <div className='w-4.5 h-4.5 bg-indigo-600 rounded-md flex items-center justify-center text-[8px] font-extrabold text-white shrink-0'>
                                                                {getInitials(version.savedBy?.name)}
                                                            </div>
                                                            <span className='text-[10px] text-slate-500 truncate font-semibold'>{version.savedBy?.name}</span>
                                                        </div>
                                                        {index !== 0 && userRole !== 'viewer' && (
                                                            <button 
                                                                onClick={() => handleRestoreVersion(version._id)}
                                                                className='text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-opacity px-2 py-1 hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/20 rounded-md cursor-pointer'
                                                            >
                                                                Restore
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default Editor