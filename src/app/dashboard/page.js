"use client";

import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import MobxStore from "@/mobx";
import { LoadingSpinner } from "@/reusable-ui/LoadingSpinner";
import LandingNoMembers from "@/components/dashboard/LandingNoMembers";
import MemberDashboard from "@/components/dashboard/MemberDashboard";

const DashboardPage = observer(() => {
  const { user, permissions, loading, permissionsLoading } = MobxStore;
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (user && !permissions) {
        await MobxStore.checkPermissions();
      }
      setIsChecking(false);
    };

    checkPermissions();
  }, [user, permissions]);

  if (loading || permissionsLoading || isChecking) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LandingNoMembers />;
  }

  return permissions?.permissions?.isMember ? (
    <MemberDashboard />
  ) : (
    <LandingNoMembers />
  );
});

export default DashboardPage;
