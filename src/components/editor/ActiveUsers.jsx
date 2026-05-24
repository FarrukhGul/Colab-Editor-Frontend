const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-pink-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'
]

const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const ActiveUsers = ({ activeUsers = [], currentUserId = '' }) => {
    // Total count includes self
    const totalCount = activeUsers.length

    // Avatars — exclude self
    const others = activeUsers.filter(u => u.userId !== currentUserId)

    if (totalCount === 0) return null

    return (
        <div className='flex items-center gap-2.5'>
            <div className='flex -space-x-1.5'>
            
                {others.slice(0, 3).map((u, i) => (
                    <div
                        key={i}
                        title={u.userName}
                        className={`w-7.5 h-7.5 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-2 border-[#07070a] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white hover:z-10 hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 cursor-pointer shadow-md`}
                    >
                        {getInitials(u.userName)}
                    </div>
                ))}
                {others.length > 3 && (
                    <div
                        title={others.slice(3).map(o => o.userName).join(', ')}
                        className='w-7.5 h-7.5 bg-slate-800 border-2 border-[#07070a] rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 hover:z-10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-md'
                    >
                        +{others.length - 3}
                    </div>
                )}
            </div>
          <span className='text-[11px] text-slate-400 font-semibold whitespace-nowrap'>
    {totalCount} online
</span>
        </div>
    )
}

export default ActiveUsers