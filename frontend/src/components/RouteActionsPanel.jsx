import { Badge, Button, Card } from 'flowbite-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

export default function RouteActionsPanel({ route, onRouteUpdated, onToggleLike, likeLoading = false }) {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [likes, setLikes] = useState(route?.likes || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const isOwner = currentUser?._id === route?.userId;
    const galleryImages = useMemo(() => {
        if (!route) return [];
        const images = [];
        if (route.coverImage) images.push(route.coverImage);
        if (Array.isArray(route.gallery)) {
            images.push(...route.gallery.filter(Boolean));
        }
        return Array.from(new Set(images));
    }, [route]);

    useEffect(() => {
        setLikes(route?.likes || []);
    }, [route?._id, route?.likes]);

    useEffect(() => {
        if (lightboxIndex !== null && lightboxIndex >= galleryImages.length) {
            setLightboxIndex(null);
        }
    }, [galleryImages.length, lightboxIndex]);

    const refreshParent = (updatedRoute) => {
        if (onRouteUpdated) {
            onRouteUpdated(updatedRoute);
        }
    };

    const handleToggleLike = async () => {
        if (onToggleLike) {
            await onToggleLike();
            return;
        }

        if (!currentUser) {
            navigate('/sign-in');
            return;
        }
        if (!route?._id) return;

        try {
            setIsProcessing(true);
            setActionError(null);
            const res = await fetch(`/api/routes/${route._id}/like`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update reaction');
            }
            const updatedRoute = await res.json();
            setLikes(updatedRoute.likes || []);
            refreshParent(updatedRoute);
        } catch (error) {
            setActionError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleForkRoute = async () => {
        if (!currentUser) {
            navigate('/sign-in');
            return;
        }
        if (!route?._id) return;
        if (!route.allowForks && !currentUser.isAdmin) {
            setActionError('The author disabled forking for this route.');
            return;
        }

        try {
            setIsProcessing(true);
            setActionError(null);
            const res = await fetch(`/api/routes/${route._id}/fork`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fork route');
            }
            const newItinerary = await res.json();
            setSuccessMessage('Copied to your private itineraries');
            navigate('/dashboard?tab=itineraries', { replace: false });
            refreshParent({ ...route, forksCount: (route.forksCount || 0) + 1 });
            return newItinerary;
        } catch (error) {
            setActionError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const likeCount = likes.length;
    const userHasLiked = currentUser ? likes.includes(currentUser._id) : false;
    const effectiveLikeLoading = likeLoading || isProcessing;
    const owner = route?.owner;
    const statItems = [
        { label: 'Süre', value: `${route?.durationDays || 1} gün` },
        { label: 'Mesafe', value: `${route?.distanceKm || 0} km` },
        { label: 'Durak', value: `${route?.waypointList?.length || 0} nokta` },
        { label: 'Mod', value: route?.terrainTypes?.[0] || route?.tags?.[0] || 'Karışık' },
    ];

    const closeLightbox = () => setLightboxIndex(null);
    const showPrevImage = (event) => {
        event?.stopPropagation();
        setLightboxIndex((prev) => {
            const nextIndex = prev === 0 ? galleryImages.length - 1 : prev - 1;
            return nextIndex;
        });
    };
    const showNextImage = (event) => {
        event?.stopPropagation();
        setLightboxIndex((prev) => {
            const nextIndex = (prev + 1) % galleryImages.length;
            return nextIndex;
        });
    };

    return (
        <>
            <Card className='sticky top-16 p-5 flex flex-col gap-6 rounded-3xl border-none shadow-xl bg-white dark:bg-[rgb(32,38,43)] lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto'>
                <div className='rounded-2xl overflow-hidden h-52 relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500'>
                    <div className='absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.4),_transparent),radial-gradient(circle_at_80%_0,_rgba(255,255,255,0.3),_transparent)]' />
                    <div className='absolute bottom-4 left-4 right-4 text-white'>
                        <p className='text-sm uppercase tracking-widest text-white/80'>Rota Özeti</p>
                        <p className='text-xl font-semibold'>
                            {route?.startLocation || 'Başlangıç'} → {route?.endLocation || 'Varış'}
                        </p>
                        <p className='text-sm text-white/80 mt-1'>{route?.distanceKm || 0} km • {route?.durationDays || 1} gün</p>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                    {statItems.map((item) => (
                        <div key={item.label} className='rounded-xl bg-slate-50 dark:bg-[rgb(42,50,56)] p-3'>
                            <p className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>{item.label}</p>
                            <p className='text-lg font-semibold text-slate-900 dark:text-white'>{item.value}</p>
                        </div>
                    ))}
                </div>

                {galleryImages.length > 0 && (
                    <div className='space-y-3'>
                        <p className='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Rota Galerisi</p>
                        <div className='grid grid-cols-3 gap-2'>
                            {galleryImages.slice(0, 3).map((image, index) => (
                                <button
                                    type='button'
                                    key={`${image}-${index}`}
                                    onClick={() => setLightboxIndex(index)}
                                    className='relative h-24 rounded-xl overflow-hidden group'
                                >
                                    <img src={image} alt={`Route media ${index + 1}`} className='h-full w-full object-cover group-hover:scale-105 transition' />
                                    {index === 2 && galleryImages.length > 3 && (
                                        <span className='absolute inset-0 bg-black/50 text-white font-semibold flex items-center justify-center text-sm'>
                                            +{galleryImages.length - 3}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className='flex flex-wrap gap-2'>
                    <Badge color='info' size='sm'>Görünürlük: {route?.visibility || 'private'}</Badge>
                    <Badge color='purple' size='sm'>{route?.forksCount || 0} kopya</Badge>
                    <Badge color={route?.allowForks ? 'success' : 'warning'} size='sm'>
                        {route?.allowForks ? 'Kopyalanabilir' : 'Kopyalama kapalı'}
                    </Badge>
                    {route?.allowComments === false && (
                        <Badge color='failure' size='sm'>Yorumlar kapalı</Badge>
                    )}
                </div>

                <div>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>Paylaşım tarihi</p>
                    <p className='text-sm text-slate-700 dark:text-slate-200 mt-1'>
                        {new Date(route?.createdAt || Date.now()).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                {owner && (
                    <div className='flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-[rgb(42,50,56)] p-4'>
                        <img
                            src={owner.profilePicture || 'https://i.pravatar.cc/120?img=21'}
                            alt={owner.username}
                            className='h-12 w-12 rounded-full object-cover bg-gray-50'
                        />
                        <div>
                            <p className='text-xs text-slate-500 dark:text-slate-400'>Oluşturan</p>
                            <Link to={`/user/${owner.username}`} className='text-base font-semibold text-slate-900 dark:text-white'>
                                {owner.fullName || `@${owner.username}`}
                            </Link>
                            <p className='text-xs text-slate-400'>@{owner.username}</p>
                        </div>
                    </div>
                )}

                {actionError && (
                    <p className='text-sm text-red-500 dark:text-red-400'>{actionError}</p>
                )}
                {successMessage && (
                    <p className='text-sm text-green-600 dark:text-green-400'>{successMessage}</p>
                )}

                <div className='flex flex-col gap-3'>
                    <Button
                        color={userHasLiked ? 'info' : 'light'}
                        onClick={handleToggleLike}
                        disabled={effectiveLikeLoading}
                    >
                        {userHasLiked ? 'Favoride' : 'Favorilere ekle'} • {likeCount}
                    </Button>

                    <Button
                        gradientDuoTone='purpleToBlue'
                        onClick={handleForkRoute}
                        disabled={isProcessing || (isOwner && !currentUser?.isAdmin)}
                    >
                        {isOwner && !currentUser?.isAdmin ? 'Zaten sana ait' : 'Kopyasını Kaydet'}
                    </Button>

                    {!currentUser && (
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                            <Link to='/sign-in' className='text-teal-600 dark:text-teal-300 underline'>
                                Giriş yap
                            </Link> beğenmek veya kaydetmek için.
                        </div>
                    )}
                </div>

                {isOwner && (
                    <div className='mt-4 border-t border-gray-200 dark:border-gray-700 pt-4'>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                            Bu rota sana ait. İçeriği güncellemek veya görünürlüğü değiştirmek için düzenleme sayfasını kullanabilirsin.
                        </p>
                        <Button
                            color='light'
                            className='mt-2'
                            as={Link}
                            to={`/routes/${route?._id}/edit`}
                        >
                            Rotayı düzenle
                        </Button>
                    </div>
                )}
            </Card>

            {lightboxIndex !== null && galleryImages[lightboxIndex] && (
                <div
                    className='fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-4 p-4'
                    onClick={closeLightbox}
                >
                    <button
                        type='button'
                        onClick={closeLightbox}
                        className='self-end text-white/80 hover:text-white text-sm uppercase tracking-wide'
                    >
                        Kapat ✕
                    </button>
                    <div className='flex items-center gap-4'>
                        {galleryImages.length > 1 && (
                            <button
                                type='button'
                                onClick={showPrevImage}
                                className='text-white text-2xl px-3'
                            >
                                ‹
                            </button>
                        )}
                        <img
                            src={galleryImages[lightboxIndex]}
                            alt='Rota fotoğrafı'
                            className='max-h-[75vh] w-auto rounded-3xl object-contain'
                        />
                        {galleryImages.length > 1 && (
                            <button
                                type='button'
                                onClick={showNextImage}
                                className='text-white text-2xl px-3'
                            >
                                ›
                            </button>
                        )}
                    </div>
                    <p className='text-white/70 text-sm'>
                        {lightboxIndex + 1}/{galleryImages.length}
                    </p>
                </div>
            )}
        </>
    );
}

