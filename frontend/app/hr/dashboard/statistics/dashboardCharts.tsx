import TopicsPieChar from "./most-requested-papers";
import TopicsChart from "./repetitive-questions";

type BarChartItem = {
  topic: string;
  number: number;
};

type PieChartItem = {
  topic: string;
  number: number;
};
type DashboardChartsData = {
  barData: BarChartItem[];
  pieData: PieChartItem[];
};

export default function DashboardCharts({
  barData,
  pieData,
}: DashboardChartsData) {
  return (
    <div className="hr-grid-3" style={{ marginBottom: "var(--space-6)" }}>
      <TopicsPieChar data={pieData} />
      <TopicsChart data={barData} />
    </div>
  );
}
