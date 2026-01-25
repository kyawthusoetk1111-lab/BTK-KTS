'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const topicStrengthData = [
  { name: 'Algebra', score: 85 },
  { name: 'Geometry', score: 40 },
  { name: 'Calculus', score: 65 },
  { name: 'History', score: 92 },
  { name: 'Science', score: 78 },
  { name: 'English', score: 88 },
];

const timeAnalysisData = [
  { question: 'Q1', 'Your Time': 45, 'Avg Time': 60 },
  { question: 'Q2', 'Your Time': 70, 'Avg Time': 65 },
  { question: 'Q3', 'Your Time': 30, 'Avg Time': 45 },
  { question: 'Q4', 'Your Time': 90, 'Avg Time': 80 },
  { question: 'Q5', 'Your Time': 55, 'Avg Time': 50 },
];

const difficultyAnalysisData = [
  { difficulty: 'Easy', score: 95, fullMark: 100 },
  { difficulty: 'Medium', score: 80, fullMark: 100 },
  { difficulty: 'Hard', score: 65, fullMark: 100 },
];

const chartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--primary))",
    },
    'Your Time': {
        label: "Your Time (s)",
        color: "hsl(var(--primary))",
    },
    'Avg Time': {
        label: "Avg Time (s)",
        color: "hsl(var(--muted-foreground))",
    },
} satisfies ChartConfig;

export function StudentAnalytics() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Topic Strength</CardTitle>
                <CardDescription>Performance breakdown by quiz topic.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicStrengthData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted) / 0.3)'}} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="score" fill="var(--color-score)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Time Analysis</CardTitle>
                    <CardDescription>Your time per question vs. class average.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeAnalysisData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="question" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="Your Time" stroke="var(--color-yourTime)" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Avg Time" stroke="var(--color-avgTime)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Difficulty Analysis</CardTitle>
                    <CardDescription>Performance based on question difficulty.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center pb-0">
                    <ChartContainer config={chartConfig} className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={difficultyAnalysisData}>
                                <CartesianGrid />
                                <PolarAngleAxis dataKey="difficulty" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Radar name="Score" dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
