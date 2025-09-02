"use client"

import ProfileContent from "@/components/dashboard/profile-content";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function ProfilePage() {
    return (
        <DashboardLayout>
            <ProfileContent />
        </DashboardLayout>
    );
}
