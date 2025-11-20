import { Spinner } from 'flowbite-react';
import React from 'react';

export default function RouteFeedCardSkeleton() {
    return (
        <article className='rounded-3xl bg-white/80 dark:bg-[rgb(32,38,43)]/70 border border-slate-100 dark:border-gray-700 p-5 sm:p-8 shadow-sm animate-pulse space-y-6'>
            <header className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700' />
                    <div className='space-y-2'>
                        <div className='h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700' />
                        <div className='h-3 w-24 rounded-full bg-slate-100 dark:bg-slate-800' />
                    </div>
                </div>
                <div className='h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700' />
            </header>

            <div className='space-y-4'>
                <div className='space-y-3'>
                    <div className='h-5 w-4/5 rounded-full bg-slate-200 dark:bg-slate-700' />
                    <div className='h-4 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800' />
                    <div className='h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800' />
                </div>

                <div className='h-72 w-full rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center' >
                    <Spinner size='xl' color='info' className='text-slate-200 dark:text-slate-700 ' />
                </div>

                <div className='flex flex-wrap items-center gap-4'>
                    <div className='h-4 w-32 rounded-full bg-slate-100 dark:bg-slate-800' />
                    <div className='h-4 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
                    <div className='h-4 w-24 rounded-full bg-slate-100 dark:bg-slate-800' />
                </div>

                    <div className='flex flex-wrap gap-2'>
                        <div className='h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                        <div className='h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                        <div className='h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                    </div>

                <footer className='flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800'>
                    <div className='flex items-center gap-6'>
                        <div className='h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                        <div className='h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='h-4 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
                        <div className='h-4 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
                    </div>
                </footer>
            </div>
        </article>
    );
}

