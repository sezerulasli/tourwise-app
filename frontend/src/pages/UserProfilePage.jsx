import React from 'react';
import { useParams } from 'react-router-dom';
import ProfileShowcase from '../components/ProfileShowcase';

export default function UserProfilePage() {
    const { username } = useParams();

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-[rgb(22,26,29)] px-4 py-10'>
            <div className='max-w-6xl mx-auto'>
                <ProfileShowcase username={username} />
            </div>
        </div>
    );
}



