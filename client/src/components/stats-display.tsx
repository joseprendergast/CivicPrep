import { UserStats } from "@shared/schema";

interface StatsDisplayProps {
  stats: UserStats | null;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  if (!stats) {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-md p-4 border border-primary">
          <div className="text-center">
            <span className="block text-3xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Tests Taken</span>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-md p-4 border border-primary">
          <div className="text-center">
            <span className="block text-3xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Questions Answered</span>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-md p-4 border border-primary">
          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600">0%</span>
            <span className="text-sm text-muted-foreground">Accuracy Rate</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 bg-white rounded-md p-4 border border-primary">
        <div className="text-center">
          <span className="block text-3xl font-bold text-primary">{stats.testsTaken}</span>
          <span className="text-sm text-muted-foreground">Tests Taken</span>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-md p-4 border border-primary">
        <div className="text-center">
          <span className="block text-3xl font-bold text-primary">{stats.questionsAnswered}</span>
          <span className="text-sm text-muted-foreground">Questions Answered</span>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-md p-4 border border-primary">
        <div className="text-center">
          <span className="block text-3xl font-bold text-green-600">{stats.correctPercentage}%</span>
          <span className="text-sm text-muted-foreground">Accuracy Rate</span>
        </div>
      </div>
    </div>
  );
}
