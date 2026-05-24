import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
    getAllDocumentsAPI,
    createDocumentAPI,
    deleteDocumentAPI
} from '../services/api'
import DocumentCard from '../components/dashboard/DocumentCard'
import CreateDocumentModal from '../components/dashboard/CreateDocumentModal'
import { MdAdd, MdLogout, MdDescription, MdSearch } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const Dashboard = () => {
    const navigate = useNavigate()
    const { user, logout } = useContext(AuthContext)

    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [creating, setCreating] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true)
                const res = await getAllDocumentsAPI()
                setDocuments(res.data.documents || [])
            } catch (err) {
                setError('Failed to load documents')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDocuments()
    }, [])

    const handleCreate = async (title) => {
        try {
            setCreating(true)
            const res = await createDocumentAPI({ title })
            setDocuments(prev => [res.data.document, ...prev])
            setShowCreateModal(false)
            navigate(`/editor/${res.data.document._id}`)
        } catch (err) {
            console.error(err)
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return
        try {
            setDeletingId(id)
            await deleteDocumentAPI(id)
            setDocuments(prev => prev.filter(doc => doc._id !== id))
        } catch (err) {
            console.error(err)
        } finally {
            setDeletingId(null)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className='min-h-screen bg-dark-bg text-white flex flex-col relative overflow-hidden'>
            {/* Ambient background glows */}
            <div className='absolute top-[-30%] left-[20%] w-[70%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none' />
            <div className='absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none' />

            {/* Create Modal */}
            {showCreateModal && (
                <CreateDocumentModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                    creating={creating}
                />
            )}

            {/* Navbar */}
            <header className='border-b border-dark-border bg-dark-bg/85 backdrop-blur-md sticky top-0 z-40'>
                <div className='max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20'>
                            TE
                        </div>
                        <div>
                            <h1 className='text-white font-display font-bold text-base leading-none'>
                                Teyzix <span className='text-indigo-400'>Editor</span>
                            </h1>
                            <p className='text-slate-500 text-[10px] mt-0.5 font-medium'>Collaborative Workspace</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-3.5'>
                        {/* Profile Info pill */}
                        <div className='flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] pl-2 pr-3.5 py-1.5 rounded-full'>
                            <div className='w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white'>
                                {getInitials(user?.name)}
                            </div>
                            <span className='text-slate-300 text-xs font-semibold hidden sm:block'>{user?.name}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className='flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-all duration-200 px-3.5 py-2 rounded-xl cursor-pointer'
                        >
                            <MdLogout className='text-sm' />
                            <span className='hidden sm:block'>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className='flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-10 relative z-10'>
                
                {/* Header Welcome Title */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                    <div>
                        <h2 className='text-2xl md:text-3xl font-display font-extrabold tracking-tight'>
                            My <span className='text-indigo-400'>Documents</span>
                        </h2>
                        <p className='text-slate-400 text-sm mt-1'>
                            Manage, edit, and share {documents.length} document{documents.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className='flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 cursor-pointer'
                    >
                        <MdAdd className='text-lg' /> New Document
                    </button>
                </div>

                {/* Search Bar Container */}
                <div className='relative mb-8 max-w-md'>
                    <MdSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xl' />
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search your workspace...'
                        className='w-full bg-dark-card border border-dark-border rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm'
                    />
                </div>

                {/* Loading state */}
                {loading && (
                    <div className='flex flex-col items-center justify-center py-32 gap-3'>
                        <FaSpinner className='text-indigo-400 text-4xl animate-spin' />
                        <p className='text-slate-500 text-sm font-medium'>Fetching document directory...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className='text-center py-32 border border-red-500/20 bg-red-500/5 rounded-2xl p-8 max-w-md mx-auto'>
                        <span className='text-red-400 font-bold block mb-2'>System Alert</span>
                        <p className='text-red-300 text-sm'>{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredDocuments.length === 0 && (
                    <div className='text-center py-28 flex flex-col items-center justify-center border border-dashed border-white/[0.08] bg-[#0c0c11]/30 rounded-3xl p-10 max-w-xl mx-auto'>
                        <div className='w-16 h-16 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-center text-slate-400 mb-5 shadow-inner'>
                            <MdDescription className='text-3xl text-indigo-400/80' />
                        </div>
                        <h3 className='text-white font-display font-semibold text-lg mb-1.5'>
                            {searchQuery ? 'No matching documents' : 'Your workspace is empty'}
                        </h3>
                        <p className='text-slate-400 text-sm mb-6 max-w-xs leading-relaxed'>
                            {searchQuery 
                                ? 'We couldn\'t find any files matching your search term. Try adjusting your spelling or filters.' 
                                : 'Create your first collaborative document and start drafting or invite your teammates to edit.'
                            }
                        </p>
                        {!searchQuery ? (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className='flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 cursor-pointer'
                            >
                                <MdAdd /> Create your first document
                            </button>
                        ) : (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='px-4.5 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer'
                            >
                                Clear search query
                            </button>
                        )}
                    </div>
                )}

                {/* Document Grid */}
                {!loading && !error && filteredDocuments.length > 0 && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 animate-fade-in'>
                        {filteredDocuments.map(doc => (
                            <DocumentCard
                                key={doc._id}
                                doc={doc}
                                onDelete={handleDelete}
                                deleting={deletingId === doc._id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Dashboard