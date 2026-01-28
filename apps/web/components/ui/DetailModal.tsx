'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CandidateDetailView from "@/components/candidates/CandidateDetailView";
import PlacementDetailView from "@/components/placements/PlacementDetailView";

import JobDetailView from "@/components/jobs/JobDetailView";
import ClientDetailView from "@/components/clients/ClientDetailView";
import VendorDetailView from "@/components/vendors/VendorDetailView";
import ImmigrationDetailView from "@/components/immigration/ImmigrationDetailView";
import TalentBenchDetailView from "@/components/talent-bench/TalentBenchDetailView";
import OnboardingDetailView from "@/components/onboarding/OnboardingDetailView";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'candidate' | 'placement' | 'job' | 'client' | 'vendor' | 'talent_bench' | 'onboarding' | 'immigration';
    id: string;
    title?: string;
}

export default function DetailModal({ isOpen, onClose, type, id, title }: DetailModalProps) {
    const renderContent = () => {
        switch (type) {
            case 'candidate':
                return <CandidateDetailView candidateId={id} />;
            case 'placement':
                return <PlacementDetailView placementId={id} />;
            case 'job':
                return <JobDetailView jobId={id} />;
            case 'client':
                return <ClientDetailView clientId={id} />;
            case 'vendor':
                return <VendorDetailView vendorId={id} />;
            case 'immigration':
                return <ImmigrationDetailView caseId={id} />;
            case 'talent_bench':
                return <TalentBenchDetailView profileId={id} />;
            case 'onboarding':
                return <OnboardingDetailView recordId={id} />;
            default:
                return <div className="p-8 text-center text-gray-500">Detail view for {type} is under construction ({id})</div>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title || 'Details'}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
