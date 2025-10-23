import { definePlugin } from "sanity";
import { dashboardTool, projectInfoWidget, projectUsersWidget } from "@sanity/dashboard";
import { TotalRevenueWidget, TotalProductCountWidget, TotalBlogCountWidget } from './custom-widgets';

export const customDashboard = definePlugin({
  name: "custom-dashboard",
  plugins: [
    dashboardTool({
      widgets: [
        TotalRevenueWidget(),
        TotalProductCountWidget(),
        TotalBlogCountWidget(),
        projectInfoWidget({
          __experimental_before: [],
          data: [
            {
              title: "GitHub Repo",
              value: "https://github.com/FIKY0911/Grocerystore", // TODO: Update with actual GitHub repo URL
              category: "Code",
            },
            {
              title: "Frontend URL",
              value: "https://grocerystore.vercel.app", // TODO: Update with actual frontend URL
              category: "apps",
            },
          ],
        }),
        projectUsersWidget({ title: 'Project members' }),
      ],
    }),
  ],
});
