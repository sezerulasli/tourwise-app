import { Spinner } from 'flowbite-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProfileRouteCard from './ProfileRouteCard';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=47';

const formatNumber = (value = 0) => Number(value || 0).toLocaleString('tr-TR');

export default function ProfileShowcase({ username, onEditProfile = () => { } }) {
    const { currentUser } = useSelector((state) => state.user);
    const viewerId = currentUser?._id;
    const [profileUser, setProfileUser] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('created');
    const targetUsername = username || currentUser?.username;

    useEffect(() => {
        if (!targetUsername) {
            setProfileUser(null);
            setRoutes([]);
            setLoading(false);
            setError('Kullanıcı adı bulunamadı');
            return;
        }

        let ignore = false;

        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            setActiveTab('created');
            try {
                const userRes = await fetch(`/api/user/by-username/${encodeURIComponent(targetUsername)}`, {
                    credentials: 'include',
                });
                const userData = await userRes.json();
                if (!userRes.ok) {
                    throw new Error(userData.message || 'Kullanıcı bulunamadı');
                }
                if (ignore) return;
                setProfileUser(userData);

                const params = new URLSearchParams({
                    userId: userData._id,
                    order: 'desc',
                    limit: '12',
                });
                if (viewerId === userData._id) {
                    params.set('visibility', 'all');
                }

                const routesRes = await fetch(`/api/routes?${params.toString()}`, {
                    credentials: 'include',
                });
                const routesData = await routesRes.json();
                if (!routesRes.ok) {
                    throw new Error(routesData.message || 'Rotalar yüklenemedi');
                }
                if (!ignore) {
                    setRoutes(routesData.routes || []);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message);
                    setProfileUser(null);
                    setRoutes([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadProfile();
        return () => {
            ignore = true;
        };
    }, [targetUsername, viewerId]);

    const stats = useMemo(() => {
        const totalRoutes = routes.length;
        const totalLikes = routes.reduce((sum, route) => sum + (route.likesCount ?? route.likes?.length ?? 0), 0);
        const totalForks = routes.reduce((sum, route) => sum + (route.forksCount || 0), 0);
        const totalDistance = routes.reduce((sum, route) => sum + (route.distanceKm || 0), 0);
        const followersSet = new Set();
        routes.forEach((route) => {
            (route.likes || []).forEach((id) => followersSet.add(id));
        });
        const forkedRoutes = routes.filter((route) => Boolean(route.sourceRouteId)).length;

        return {
            totalRoutes,
            totalLikes,
            totalForks,
            totalDistance,
            followersCount: followersSet.size,
            followingCount: forkedRoutes,
        };
    }, [routes]);

    const isOwner = profileUser && viewerId === profileUser._id;
    const displayName = profileUser ? `${profileUser.firstName} ${profileUser.lastName}` : '';
    const joinedAt = profileUser?.createdAt
        ? new Date(profileUser.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
        : '';

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center py-20 gap-4'>
                <Spinner size='xl' />
                <p className='text-slate-500 dark:text-slate-400'>Profil yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-10 text-center'>
                <h2 className='text-2xl font-semibold text-slate-900 dark:text-white mb-2'>Profil bulunamadı</h2>
                <p className='text-slate-500 dark:text-slate-400 mb-6'>{error}</p>
                <Link to='/explore' className='px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition'>
                    Keşfet sayfasına dön
                </Link>
            </div>
        );
    }

    return (
        <div className='space-y-8'>
            <section className='rounded-3xl border border-slate-100 dark:border-gray-700 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-[rgb(32,38,43)] dark:via-[rgb(42,50,56)] dark:to-[rgb(22,26,29)] p-8 shadow-sm'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                    <div className='flex items-center gap-5'>
                        <img
                            src={profileUser?.profilePicture || FALLBACK_AVATAR}
                            alt={displayName}
                            className='h-24 w-24 rounded-full object-cover border-4 border-white bg-gray-50 shadow-md'
                        />
                        <div>
                            <p className='text-sm text-slate-500 dark:text-slate-400'>
                                @{profileUser?.username} • {joinedAt} katıldı
                            </p>
                            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>{displayName}</h1>
                            <p className='text-slate-600 dark:text-slate-300 mt-2 max-w-2xl'>
                                Yeni yerler keşfetmeyi seven bir gezgin. {stats.totalRoutes} rota paylaştı, {stats.totalDistance} km yol kat etti.
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        {isOwner ? (
                            <>
                                <button
                                    onClick={onEditProfile}
                                    className='px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition dark:bg-[rgb(22,26,29)] dark:hover:bg-gray-700'
                                >
                                    Profili Düzenle
                                </button>
                                <Link
                                    to='/routes/create'
                                    className='px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-gray-700 transition'
                                >
                                    Yeni Rota Oluştur
                                </Link>
                            </>
                        ) : (
                            <>
                                <button className='px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition dark:bg-[rgb(22,26,29)] dark:hover:bg-gray-700'>
                                    Takip Et
                                </button>
                                <button className='px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-gray-700 transition'>
                                    Mesaj Gönder
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8'>
                    {[
                        { label: 'Takipçi', value: stats.followersCount },
                        { label: 'Takip Edilen', value: stats.followingCount },
                        { label: 'Toplam Rota', value: stats.totalRoutes },
                        { label: 'Toplam Beğeni', value: stats.totalLikes },
                    ].map((item) => (
                        <div key={item.label} className='rounded-2xl bg-white/80 dark:bg-[rgb(22,26,29)]/70 border border-slate-100 dark:border-gray-700 p-4'>
                            <p className='text-2xl font-semibold text-slate-900 dark:text-white'>{formatNumber(item.value)}</p>
                            <p className='text-sm text-slate-500 dark:text-slate-400'>{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className='rounded-3xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] p-6 shadow-sm'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6'>
                    <div className='flex flex-wrap gap-3'>
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'created'
                                ? 'bg-slate-900 text-white dark:bg-[rgb(22,26,29)] dark:hover:bg-gray-700'
                                : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                                }`}
                        >
                            Oluşturduğu Rotalar
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'saved'
                                ? 'bg-slate-900 text-white dark:bg-[rgb(22,26,29)] dark:hover:bg-gray-700'
                                : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                                }`}
                        >
                            Kaydedilenler
                        </button>
                    </div>
                    {stats.totalDistance > 0 && (
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                            Toplam {formatNumber(stats.totalDistance)} km keşif • {formatNumber(stats.totalForks)} kopyalanan rota
                        </p>
                    )}
                </div>

                {activeTab === 'created' ? (
                    routes.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {routes.map((route) => (
                                <ProfileRouteCard key={route._id} route={route} />
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl'>
                            <p className='text-lg font-semibold text-slate-900 dark:text-white'>Henüz rota paylaşımı yok</p>
                            <p className='text-slate-500 dark:text-slate-400 mt-2'>Yeni maceranı paylaşarak bu alanı doldurabilirsin.</p>
                        </div>
                    )
                ) : (
                    <div className='text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl'>
                        <p className='text-lg font-semibold text-slate-900 dark:text-white'>Kaydedilen rota bulunamadı</p>
                        <p className='text-slate-500 dark:text-slate-400 mt-2'>Beğendiğin rotaları kaydettiğinde burada listelenecek.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

