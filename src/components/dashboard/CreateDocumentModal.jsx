import { useState } from 'react'
import { MdAdd } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const CreateDocumentModal = ({ onClose, onCreate, creating }) => {
    const [title, setTitle] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (title.trim()) onCreate(title.trim())
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in'>
            <div className='bg-dark-card/95 border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up backdrop-blur-xl'>
                <h2 className='text-xl font-display font-bold text-white mb-1'>New Document</h2>
                <p className='text-slate-500 text-sm mb-5'>Give your document a creative title to begin collaborating</p>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <input
                        type='text'
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder='e.g., Q3 Project Proposal'
                        autoFocus
                        required
                        className='bg-[#07070a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200'
                    />
                    <div className='flex gap-3 mt-2'>
                        <button
                            type='submit'
                            disabled={creating}
                            className='flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/20 cursor-pointer'
                        >
                            {creating
                                ? <><FaSpinner className='animate-spin' /> Creating...</>
                                : <><MdAdd className='text-lg' /> Create Document</>
                            }
                        </button>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 font-semibold py-3 rounded-xl transition duration-200 cursor-pointer'
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateDocumentModal