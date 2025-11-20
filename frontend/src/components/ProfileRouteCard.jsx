import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiBookmark } from 'react-icons/fi';

const FALLBACK_COVER =
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80';

export default function ProfileRouteCard({ route }) {
    if (!route) return null;

    const cover = route.coverImage || FALLBACK_COVER;
    const likes = route.likesCount ?? route.likes?.length ?? 0;
    const comments = route.commentsCount ?? 0;
    const forks = route.forksCount || 0;

    return (
        <Link
            to={`/routes/${route.slug}`}
            className='rounded-2xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(22,26,29)] shadow-sm hover:-translate-y-1 hover:shadow-lg transition block overflow-hidden'
        >
            <div className='relative'>
                <img src={cover} alt={route.title} className='h-44 w-full object-cover' loading='lazy' />
                {route.tags?.[0] && (
                    <span className='absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200'>
                        #{route.tags[0]}
                    </span>
                )}
            </div>
            <div className='p-4 space-y-3'>
                <div>
                    <h3 className='text-lg font-semibold text-slate-900 dark:text-white line-clamp-2'>{route.title}</h3>
                    <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
                        {route.startLocation || 'Konum'} • {route.durationDays || 1} gün
                    </p>
                </div>
                <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
                    <span className='inline-flex items-center gap-1'>
                        <FiHeart className='text-rose-500' /> {likes}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                        <FiMessageCircle /> {comments}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                        <FiBookmark /> {forks}
                    </span>
                </div>
            </div>
        </Link>
    );
}



