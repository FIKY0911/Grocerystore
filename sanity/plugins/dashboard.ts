"use server"

import { definePlugin } from "sanity";
import { dashboardTool } from "@sanity/dashboard";
import { TotalRevenueWidget, TotalProductCountWidget, TotalBlogCountWidget } from './custom-widgets';

export const customDashboard = definePlugin({
  name: "custom-dashboard",
  plugins: [
    dashboardTool({
      widgets: [
        TotalRevenueWidget(),
        TotalProductCountWidget(),
        TotalBlogCountWidget(),
      ],
    }),
  ],
});
