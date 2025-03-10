"use client";

import { observer } from "mobx-react";
import MobxStore from "@/mobx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MemberDashboard = observer(() => {
  const { user, permissions } = MobxStore;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {user?.username || "Member"}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active until:{" "}
              {new Date(
                permissions?.subscription?.endDate
              ).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Add more dashboard cards/content here */}
      </div>
    </div>
  );
});

export default MemberDashboard;
