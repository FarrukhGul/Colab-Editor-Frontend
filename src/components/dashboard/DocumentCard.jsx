import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { MdDescription, MdEdit, MdDelete, MdPeople } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const DocumentCard = ({ doc, onDelete, deleting }) => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    const currentUserId = (user?._id || user?.id || '').toString()
    const ownerId = (doc.owner?._id || doc.owner || '').toString()
    const isOwner = ownerId === currentUserId

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric'
        })

    return (
        <div 
            onClick={() => navigate(`/editor/${doc._id}`)}
            className='bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col justify-between min-h-[185px] hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300 group cursor-pointer'
        >
            <div>
                {/* Header & Icon */}
                <div className='flex items-start justify-between gap-3 mb-4'>
                    <div className='bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 w-fit text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300'>
                        <MdDescription className='text-2xl' />
                    </div>
                    {doc.collaborators?.length > 0 && (
                        <div className='flex items-center gap-1 text-slate-500 text-xs bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full'>
                            <MdPeople className='text-sm' />
                            <span>{doc.collaborators.length}</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className='space-y-1.5'>
                    <h3 className='text-white font-display font-semibold text-base group-hover:text-indigo-300 transition-colors duration-200 truncate' title={doc.title}>
                        {doc.title}
                    </h3>
                    <div className='flex items-center gap-2 text-xs text-slate-500'>
                        <span>{formatDate(doc.updatedAt)}</span>
                        <span className='w-1 h-1 rounded-full bg-slate-700' />
                        <span className='truncate max-w-[120px]'>
                            By {isOwner ? 'You' : doc.owner?.name || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2 mt-5 pt-3 border-t border-white/[0.04]' onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => navigate(`/editor/${doc._id}`)}
                    className='flex-1 flex items-center justify-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-200 text-xs font-semibold py-2.5 rounded-xl cursor-pointer'
                >
                    <MdEdit /> Open
                </button>
                {isOwner && (
                    <button
                        onClick={() => onDelete(doc._id)}
                        disabled={deleting}
                        className='flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/35 transition-all duration-200 disabled:opacity-50 cursor-pointer'
                        title='Delete Document'
                    >
                        {deleting ? (
                            <FaSpinner className='animate-spin text-xs' />
                        ) : (
                            <MdDelete className='text-base' />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default DocumentCard