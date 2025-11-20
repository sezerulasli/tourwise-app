import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from 'react-icons/fi';

const FALLBACK_COVER =
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80';

const formatRelativeTime = (value) => {
    if (!value) return 'az önce';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'az önce';

    const diff = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    if (diff < minute) return 'az önce';
    if (diff < hour) return `${Math.floor(diff / minute)} dk önce`;
    if (diff < day) return `${Math.floor(diff / hour)} sa önce`;
    if (diff < week) return `${Math.floor(diff / day)} gün önce`;
    if (diff < month) return `${Math.floor(diff / week)} hf önce`;
    if (diff < year) return `${Math.floor(diff / month)} ay önce`;
    return `${Math.floor(diff / year)} yıl önce`;
};

export default function RouteFeedCard({ route }) {
    if (!route) return null;

    const owner = route.owner || {};
    const likes = route.likesCount ?? route.likes?.length ?? 0;
    const comments = route.commentsCount ?? 0;
    const coverImage = route.coverImage || FALLBACK_COVER;
    const locationLabel = route.startLocation && route.endLocation
        ? `${route.startLocation} → ${route.endLocation}`
        : route.startLocation || route.endLocation || 'Konum bilgisi eklenmedi';
    const tags = Array.isArray(route.tags) ? route.tags.slice(0, 3) : [];
    const canFollow = Boolean(owner.username);

    return (
        <article className='rounded-3xl bg-white/90 dark:bg-[rgb(32,38,43)]/80 backdrop-blur border border-slate-100 dark:border-gray-600 shadow-lg shadow-slate-200/40 dark:shadow-none p-5 sm:p-8 transition hover:-translate-y-0.5 hover:shadow-xl'>
            <header className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <Link to={owner.username ? `/user/${owner.username}` : '#'} className='flex-shrink-0'>
                        <img
                            src={owner.profilePicture || 'https://i.pravatar.cc/100?img=8'}
                            alt={owner.username || 'Traveller'}
                            className='h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-gray-50'
                        />
                    </Link>
                    <div>
                        <div className='flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400'>
                            {owner.username && <span className='font-semibold text-slate-900 dark:text-white'>{owner.fullName || owner.username}</span>}
                            {owner.username && <span>·</span>}
                            <span>@{owner.username || 'gezgin'}</span>
                        </div>
                        <p className='text-xs text-slate-400'>{formatRelativeTime(route.createdAt)}</p>
                    </div>
                </div>
                {canFollow && (
                    <Link
                        to={`/user/${owner.username}`}
                        className='px-3 py-1.5 text-sm font-medium rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition'
                    >
                        Takip Et
                    </Link>
                )}
            </header>

            <div className='mt-4 space-y-4'>
                <div>
                    <Link to={`/routes/${route.slug}`}>
                        <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-2'>{route.title}</h2>
                    </Link>
                    <p className='text-slate-600 dark:text-slate-300 leading-relaxed'>{route.summary}</p>
                </div>

                <Link to={`/routes/${route.slug}`} className='block rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800'>
                    <img src={coverImage} alt={route.title} className='h-72 w-full object-cover transition duration-300 hover:scale-[1.02]' loading='lazy' />
                </Link>

                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400'>
                    <span className='font-medium text-slate-700 dark:text-slate-200'>{locationLabel}</span>
                    {route.durationDays ? <span>· {route.durationDays} gün</span> : null}
                    {route.distanceKm ? <span>· {route.distanceKm} km</span> : null}
                </div>

                {tags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                        {tags.map((tag) => (
                            <span key={tag} className='px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <footer className='flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800'>
                    <div className='flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300'>
                        <button type='button' className='flex items-center gap-2'>
                            <FiHeart className='text-rose-500' />
                            <span>{likes.toLocaleString('tr-TR')}</span>
                        </button>
                        <button type='button' className='flex items-center gap-2'>
                            <FiMessageCircle />
                            <span>{comments.toLocaleString('tr-TR')}</span>
                        </button>
                    </div>
                    <div className='flex items-center gap-4 text-sm text-slate-500'>
                        <button type='button' className='flex items-center gap-2 hover:text-slate-700 dark:hover:text-white'>
                            <FiBookmark />
                            <span>Kaydet</span>
                        </button>
                        <button type='button' className='flex items-center gap-2 hover:text-slate-700 dark:hover:text-white'>
                            <FiShare2 />
                            <span>Paylaş</span>
                        </button>
                    </div>
                </footer>
            </div>
        </article>
    );
}

