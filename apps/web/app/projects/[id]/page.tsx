'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PlacementDetailView from '@/components/placements/PlacementDetailView';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { userData } = useAuth();
    const { id } = React.use(params);

    return (
        <div className="container p-6 max-w-5xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Placements
            </Button>

            <PlacementDetailView placementId={id || ''} />
        </div>
    );
}
