import { Spinner } from 'flowbite-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RouteActionsPanel from '../components/RouteActionsPanel';
import RouteDetails from '../components/RouteDetails';
import ProfileRouteCard from '../components/ProfileRouteCard';
import FooterBanner from '../components/FooterBanner';
import NotFound from './NotFound';

export default function RouteDetailsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [route, setRoute] = useState(null);
    const [relatedRoutes, setRelatedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [ctaMessage, setCtaMessage] = useState('');
    const [likeProcessing, setLikeProcessing] = useState(false);
    const toastTimer = useRef(null);

    const fetchRoute = useCallback(async () => {
        try {
            setLoading(true);
            setNotFound(false);
            const res = await fetch(`/api/routes?slug=${slug}`, { credentials: 'include' });
            const data = await res.json();
            if (!res.ok || !data.routes || data.routes.length === 0) {
                setNotFound(true);
                setRoute(null);
                return;
            }
            const fetchedRoute = data.routes[0];
            const isOwner = currentUser && fetchedRoute.userId === currentUser._id;
            const isAdmin = currentUser?.isAdmin;
            if (fetchedRoute.visibility !== 'public' && !isOwner && !isAdmin) {
                setNotFound(true);
                setRoute(null);
                return;
            }
            setRoute(fetchedRoute);
            setNotFound(false);
        } catch (error) {
            setNotFound(true);
            setRoute(null);
        } finally {
            setLoading(false);
        }
    }, [slug, currentUser]);

    useEffect(() => {
        fetchRoute();
    }, [fetchRoute]);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!route) return;
            try {
                const tag = route.tags?.[0];
                const query = tag ? `?limit=3&tag=${encodeURIComponent(tag)}&order=desc` : '?limit=3&order=desc';
                const res = await fetch(`/api/routes${query}`);
                const data = await res.json();
                if (res.ok && data.routes) {
                    const filtered = data.routes.filter((item) => item._id !== route._id);
                    setRelatedRoutes(filtered);
                }
            } catch (error) {
                setRelatedRoutes([]);
            }
        };
        fetchRelated();
    }, [route]);

    useEffect(() => {
        return () => {
            if (toastTimer.current) {
                clearTimeout(toastTimer.current);
            }
        };
    }, []);

    const handleRouteUpdated = (updatedRoute) => {
        if (!updatedRoute) {
            fetchRoute();
            return;
        }
        setRoute((prev) => ({
            ...prev,
            ...updatedRoute,
            likes: updatedRoute.likes || updatedRoute.likes === 0 ? updatedRoute.likes : prev.likes,
            forksCount: typeof updatedRoute.forksCount === 'number' ? updatedRoute.forksCount : prev.forksCount,
        }));
    };

    const showToast = useCallback((message) => {
        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }
        setCtaMessage(message);
        toastTimer.current = setTimeout(() => setCtaMessage(''), 3000);
    }, []);

    const handleFavoriteClick = useCallback(async () => {
        if (!currentUser) {
            navigate('/sign-in');
            return;
        }
        if (!route?._id) return;
        const alreadyLiked = route?.likes?.includes(currentUser._id);
        try {
            setLikeProcessing(true);
            const res = await fetch(`/api/routes/${route._id}/like`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Favori işlemi gerçekleştirilemedi');
            }
            setRoute(data);
            showToast(alreadyLiked ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi');
            return data;
        } catch (error) {
            showToast(error.message || 'İşlem gerçekleştirilemedi');
        } finally {
            setLikeProcessing(false);
        }
    }, [currentUser, navigate, route?._id, route?.likes, showToast]);

    const handleCopyLink = useCallback(async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(window.location.href);
            } else {
                const tempInput = document.createElement('input');
                tempInput.value = window.location.href;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
            showToast('Bağlantı panoya kopyalandı');
        } catch (error) {
            showToast('Bağlantı kopyalanamadı');
        }
    }, [showToast]);

    const handleShareRoute = useCallback(async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: route?.title,
                    text: route?.summary,
                    url: window.location.href,
                });
            } else {
                await handleCopyLink();
            }
        } catch (error) {
            if (error?.name !== 'AbortError') {
                showToast('Paylaşım iptal edildi');
            }
        }
    }, [handleCopyLink, route?.summary, route?.title, showToast]);

    const handleExportRoute = useCallback(() => {
        window.print();
        showToast('Yazdırma penceresi açılıyor');
    }, [showToast]);

    const owner = route?.owner;
    const hasLiked = currentUser && route?.likes?.includes(currentUser._id);
    const likeCount = route?.likes?.length || 0;
    const postedOn = route?.createdAt
        ? new Date(route.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : null;

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Spinner size='xl' />
            </div>
        );
    }

    if (notFound || !route) {
        return <NotFound />;
    }

    return (
        <>
            <div className='bg-slate-50 dark:bg-[rgb(22,26,29)]'>
                <div className='max-w-6xl mx-auto px-4 py-8 space-y-8'>
                    <section className='rounded-3xl bg-white dark:bg-[rgb(32,38,43)] shadow-sm p-6 sm:p-8 space-y-6'>
                        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                            <div className='space-y-4'>
                                {route?.tags?.[0] && (
                                    <p className='text-sm uppercase tracking-widest text-blue-500'>{route.tags[0]}</p>
                                )}
                                <h1 className='text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white'>{route.title}</h1>
                                <p className='text-slate-600 dark:text-slate-300 text-base leading-relaxed'>{route.summary}</p>
                                <div className='flex items-center gap-3'>
                                    <img
                                        src={owner?.profilePicture || 'https://i.pravatar.cc/100?img=15'}
                                        alt={owner?.username || 'Gezi yazarı'}
                                        className='h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-gray-50'
                                    />
                                    <div>
                                        <p className='text-sm text-slate-500 dark:text-slate-400'>Hazırlayan</p>
                                        <p className='text-base font-semibold text-slate-900 dark:text-white'>{owner?.fullName || owner?.username || 'Anonim gezgin'}</p>
                                        {postedOn && <p className='text-xs text-slate-400'>{postedOn} tarihinde paylaşıldı</p>}
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3'>
                                <button
                                    type='button'
                                    onClick={handleFavoriteClick}
                                    disabled={likeProcessing}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${hasLiked
                                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-[rgb(22,26,29)] dark:hover:bg-[rgb(42,50,56)]'
                                        }`}
                                >
                                    {hasLiked ? 'Favoride' : 'Favorilere Ekle'} • {likeCount}
                                </button>
                                <button
                                    type='button'
                                    onClick={handleShareRoute}
                                    className='px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition'
                                >
                                    Paylaş
                                </button>
                                <button
                                    type='button'
                                    onClick={handleCopyLink}
                                    className='px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition'
                                >
                                    Linki Kopyala
                                </button>
                                <button
                                    type='button'
                                    onClick={handleExportRoute}
                                    className='px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition'
                                >
                                    Dışa Aktar
                                </button>
                            </div>
                        </div>
                        {ctaMessage && (
                            <p className='text-sm text-slate-500 dark:text-slate-400'>{ctaMessage}</p>
                        )}
                    </section>

                    <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]'>
                        <RouteDetails route={route} />
                        <RouteActionsPanel
                            route={route}
                            onRouteUpdated={handleRouteUpdated}
                            onToggleLike={handleFavoriteClick}
                            likeLoading={likeProcessing}
                        />
                    </div>

                    {relatedRoutes.length > 0 && (
                        <section className='rounded-3xl border border-slate-100 dark:border-gray-600 bg-white dark:bg-[rgb(32,38,43)] p-6 shadow-sm'>
                            <h2 className='text-2xl font-semibold text-slate-900 dark:text-white mb-4'>Benzer rotalar</h2>
                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                                {relatedRoutes.map((item) => (
                                    <ProfileRouteCard key={item._id} route={item} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <FooterBanner className='from-gray-300 via-gray-100 to-slate-50' velocityContainerClassName='bg-slate-50 dark:bg-[rgb(22,26,29)]' />
        </>
    );
}

