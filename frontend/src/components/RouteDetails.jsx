import { Alert, Badge } from 'flowbite-react';
import React, { useMemo } from 'react';
import { IoLocationSharp } from "react-icons/io5";
import CommentSection from './CommentSection';
import ItineraryMap from './ItineraryMap';
import '../styles/home.css';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80';

const hasContent = (htmlString) => {
    if (!htmlString) return false;
    const strippedContent = htmlString.replace(/<[^>]*>/g, '').trim();
    return strippedContent.length > 0;
};

export default function RouteDetails({ route }) {
    const heroImage = useMemo(() => {
        if (!route) return FALLBACK_COVER;
        if (route.coverImage) return route.coverImage;
        if (Array.isArray(route.gallery) && route.gallery.length > 0) {
            return route.gallery[0];
        }
        return FALLBACK_COVER;
    }, [route]);

    const statItems = [
        { label: 'Süre', value: `${route?.durationDays || 1} gün` },
        { label: 'Mesafe', value: `${route?.distanceKm || 0} km` },
        { label: 'Durak', value: `${route?.waypointList?.length || 0} durak` },
        { label: 'Sezon', value: route?.season || 'Tüm yıl' },
    ];

    const mapDays = useMemo(() => {
        if (Array.isArray(route?.mapDays) && route.mapDays.length > 0) {
            return route.mapDays;
        }

        if (!Array.isArray(route?.waypointList) || route.waypointList.length === 0) {
            return [];
        }

        const groupedByDay = route.waypointList.reduce((acc, waypoint) => {
            if (typeof waypoint?.latitude !== 'number' || typeof waypoint?.longitude !== 'number') {
                return acc;
            }
            const dayNumber = waypoint?.day || 1;
            if (!acc[dayNumber]) {
                acc[dayNumber] = {
                    dayNumber,
                    title: `Gün ${dayNumber}`,
                    stops: [],
                };
            }
            acc[dayNumber].stops.push({
                ...waypoint,
                id: waypoint?._id || `${dayNumber}-${acc[dayNumber].stops.length}`,
                name: waypoint?.title || 'Durak',
                location: waypoint?.location
                    ? waypoint.location
                    : {
                        geo: {
                            lat: waypoint.latitude,
                            lng: waypoint.longitude,
                        },
                    },
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
            });
            return acc;
        }, {});

        return Object.values(groupedByDay)
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((day) => ({
                ...day,
                stops: day.stops.sort((a, b) => (a.order || 0) - (b.order || 0)),
            }));
    }, [route?.mapDays, route?.waypointList]);

    console.log(route);

    return (
        <div className='space-y-8'>
            <div className='rounded-3xl overflow-hidden border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] shadow-sm'>
                <div className='relative h-[360px] w-full'>
                    <img
                        src={heroImage}
                        alt={route?.title}
                        className='h-full w-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
                    <div className='absolute bottom-0 left-0 right-0 p-6 flex flex-wrap items-end gap-4 text-white'>
                        <div>
                            <p className='text-sm uppercase tracking-widest text-white/80'>Rotanın başlangıcı</p>
                            <p className='text-2xl font-semibold'>{route?.startLocation || 'Belirtilmedi'}</p>
                        </div>
                        <div className='h-10 w-px bg-white/30 hidden sm:block' />
                        <div>
                            <p className='text-sm uppercase tracking-widest text-white/80'>Varış noktası</p>
                            <p className='text-2xl font-semibold'>{route?.endLocation || 'Belirtilmedi'}</p>
                        </div>
                    </div>
                </div>

                <div className='p-6 space-y-6'>
                    <div className='flex flex-wrap gap-2'>
                        {route?.tags?.map((tag) => (
                            <Badge key={tag} color='gray' size='sm'>
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                    <p className='text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>{route?.summary}</p>

                    <div className='grid grid-cols-2 gap-3 text-sm'>
                        {statItems.map((item) => (
                            <div key={item.label} className='rounded-2xl bg-slate-50 dark:bg-[rgb(42,50,56)] p-4'>
                                <p className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>{item.label}</p>
                                <p className='text-xl font-semibold text-slate-900 dark:text-white'>{item.value}</p>
                            </div>
                        ))}
                        {route?.terrainTypes?.length > 0 && (
                            <div className='rounded-2xl bg-slate-50 dark:bg-[rgb(42,50,56)] p-4 col-span-2'>
                                <p className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>Zemin</p>
                                <p className='text-lg font-semibold text-slate-900 dark:text-white'>{route.terrainTypes.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='rounded-3xl overflow-hidden border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] shadow-sm'>
                <div className='p-6 border-b border-slate-100 dark:border-gray-700'>
                    <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Rota Haritası</h2>
                    <p className='text-sm text-slate-500 dark:text-slate-300 mt-1'>
                        Durak koordinatlarına göre otomatik olarak oluşturulan güzergah.
                    </p>
                </div>
                <div className='p-6 bg-slate-50/60 dark:bg-[rgb(22,26,29)]'>
                    {mapDays.length > 0 ? (
                        <ItineraryMap days={mapDays} height={420} />
                    ) : (
                        <Alert color='info'>
                            Bu rota için harita oluşturmak üzere koordinat bilgisi içeren durak ekleyin.
                        </Alert>
                    )}
                </div>
            </div>

            <div className='rounded-3xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] p-6 space-y-5 shadow-sm'>
                {route?.overview && hasContent(route.overview) && (
                    <section className='space-y-3'>
                        <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Rota Özeti</h2>
                        <div className='post-content text-slate-700 dark:text-slate-200' dangerouslySetInnerHTML={{ __html: route.overview }} />
                    </section>
                )}
                {route?.itinerary && hasContent(route.itinerary) && (
                    <section className='space-y-3'>
                        <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Detaylı Program</h2>
                        <div className='post-content text-slate-700 dark:text-slate-200' dangerouslySetInnerHTML={{ __html: route.itinerary }} />
                    </section>
                )}
                {route?.highlights && hasContent(route.highlights) && (
                    <section className='space-y-3'>
                        <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Öne Çıkanlar</h2>
                        <div className='post-content text-slate-700 dark:text-slate-200' dangerouslySetInnerHTML={{ __html: route.highlights }} />
                    </section>
                )}
                {route?.tips && hasContent(route.tips) && (
                    <section className='space-y-3'>
                        <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>Gezgin Notları</h2>
                        <div className='post-content text-slate-700 dark:text-slate-200' dangerouslySetInnerHTML={{ __html: route.tips }} />
                    </section>
                )}
            </div>

            {route?.waypointList?.length > 0 && (
                <section className='rounded-3xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] p-6 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-slate-900 dark:text-white mb-4'>Duraklar</h2>
                    <div className='space-y-5'>
                        {route.waypointList
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((stop, index, arr) => (
                                <div key={`${stop.title}-${index}`} className='flex items-start gap-4'>
                                    <div className='flex flex-col items-center'>
                                        <div className='h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold'>
                                            {index + 1}
                                        </div>
                                        {index < arr.length - 1 && <div className='w-px flex-1 bg-slate-200 dark:bg-gray-700'></div>}
                                    </div>
                                    <div className='flex-1 rounded-2xl bg-slate-50 dark:bg-[rgb(42,50,56)] p-4 shadow-inner'>
                                        <div className='flex flex-wrap justify-between text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
                                            <span>Gün {stop.day || index + 1}</span>
                                            {stop.startTime && <span>{stop.startTime}{stop.endTime ? ` – ${stop.endTime}` : ''}</span>}
                                        </div>
                                        <h3 className='text-lg font-semibold text-slate-900 dark:text-white mt-1'>{stop.title}</h3>
                                        {stop.location && (
                                            <div className='flex items-center gap-1 text-slate-500 dark:text-slate-300 text-sm mt-1'>
                                                <IoLocationSharp className='size-4 text-blue-500' /> {stop.location}
                                            </div>
                                        )}
                                        {stop.summary && (
                                            <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>{stop.summary}</p>
                                        )}
                                        {stop.notes && (
                                            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400 italic'>{stop.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            )}

            <section className='rounded-3xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[rgb(32,38,43)] p-6 shadow-sm'>
                <h2 className='text-2xl font-semibold text-slate-900 dark:text-white mb-3'>Yorumlar</h2>
                <CommentSection routeId={route?._id} />
            </section>
        </div>
    );
}
